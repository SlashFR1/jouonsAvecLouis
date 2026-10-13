package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.model.SevenSecCard;
import com.loustic.repository.SevenSecondsRepository;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

/**
 * Service gérant le moteur du jeu de rapidité "7 Secondes" (Style 5 Second Rule) :
 * - Rôle "Joueur en jeu" et "Arbitre de table"
 * - FSM stricte : LOBBY -> DRAW -> COUNTDOWN (7.0s) -> REFEREE_VOTE -> SCORE_UPDATE
 * - Tirage sans remise sur les 990+ cartes
 * - Décompte horodaté serveur & ScheduledExecutorService
 * - Arbitrage sécurisé par consensus ou par l'arbitre désigné / hôte
 */
@Service
public class SevenSecondsService {

    public enum Phase {
        LOBBY,
        DRAW,
        COUNTDOWN,
        REFEREE_VOTE,
        SCORE_UPDATE
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int turn = 0;
        private String activePlayerId = "";
        private String refereePlayerId = "";
        private SevenSecCard currentCard = null;
        private long countdownStartedAt = 0L;
        private long countdownEndsAt = 0L;
        private final Map<String, Integer> scores = new ConcurrentHashMap<>();
        private final Map<String, Boolean> refereeVotes = new ConcurrentHashMap<>();
        private Boolean lastSuccess = null;
        private final List<SevenSecCard> remainingDeck = new CopyOnWriteArrayList<>();
        private ScheduledFuture<?> timerFuture = null;
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SevenSecondsRepository repository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public SevenSecondsService(GameRoomService rooms, SevenSecondsRepository repository) {
        this.rooms = rooms;
        this.repository = repository;
        rooms.onRoomClosed(this::cleanupRoom);
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdownNow();
    }

    private void cleanupRoom(String roomCode) {
        State s = games.remove(roomCode);
        if (s != null && s.timerFuture != null) {
            s.timerFuture.cancel(true);
        }
    }

    /**
     * Démarre la partie depuis le LOBBY.
     */
    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) {
                return;
            }
            if (room.playerCount() < 2) {
                rooms.broadcast(room, "7SEC_ERROR", Map.of("message", "Il faut au moins 2 joueurs pour jouer à 7 Secondes !"));
                return;
            }

            State state = games.computeIfAbsent(roomCode, k -> new State());
            if (state.timerFuture != null) {
                state.timerFuture.cancel(true);
            }

            state.scores.clear();
            for (Player p : room.getPlayers()) {
                state.scores.put(p.id(), 0);
            }
            state.remainingDeck.clear();
            state.remainingDeck.addAll(repository.createShuffledDeck());
            state.turn = 0;

            drawNextCard(roomCode, playerId);
        }
    }

    /**
     * FSM : Transition vers DRAW (Tirage sans remise et rotation des rôles).
     */
    public void drawNextCard(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;

            if (state.timerFuture != null) {
                state.timerFuture.cancel(true);
                state.timerFuture = null;
            }

            // Tirage sans remise (re-mélange si épuisé)
            if (state.remainingDeck.isEmpty()) {
                state.remainingDeck.addAll(repository.createShuffledDeck());
            }
            state.currentCard = state.remainingDeck.remove(0);

            state.turn++;
            state.phase = Phase.DRAW;
            state.refereeVotes.clear();
            state.lastSuccess = null;

            int activeIdx = (state.turn - 1) % room.playerCount();
            int refereeIdx = (state.turn) % room.playerCount(); // Joueur suivant comme arbitre désigné

            state.activePlayerId = room.getPlayers().get(activeIdx).id();
            state.refereePlayerId = room.getPlayers().get(refereeIdx).id();

            broadcastState(room, state, "7SEC_DRAW");
            // Rétrocompatibilité
            rooms.broadcast(room, "7SEC_TURN_READY", snapshot(state));
        }
    }

    /**
     * FSM : Transition vers COUNTDOWN (Top départ 7.0s).
     */
    public void launchCountdown(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.DRAW) return;

            // Seul le joueur actif, l'arbitre ou l'hôte peut lancer
            if (!playerId.equals(state.activePlayerId)
                    && !playerId.equals(state.refereePlayerId)
                    && !playerId.equals(room.getHostId())) {
                return;
            }

            state.phase = Phase.COUNTDOWN;
            long now = System.currentTimeMillis();
            state.countdownStartedAt = now;
            state.countdownEndsAt = now + 7000L;

            if (state.timerFuture != null) {
                state.timerFuture.cancel(true);
            }

            // Arrêt automatique exact à 7.0s
            state.timerFuture = scheduler.schedule(() -> {
                onCountdownFinished(roomCode);
            }, 7000L, TimeUnit.MILLISECONDS);

            broadcastState(room, state, "7SEC_COUNTDOWN_STARTED");
            // Rétrocompatibilité
            rooms.broadcast(room, "7SEC_TIMER_STARTED", snapshot(state));
        }
    }

    /**
     * Déclenchement automatique ou manuel de l'arrêt du chrono -> Passage à REFEREE_VOTE.
     */
    public void onCountdownFinished(String roomCode) {
        GameRoom room;
        try {
            room = rooms.require(roomCode);
        } catch (Exception e) {
            return;
        }

        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.COUNTDOWN) return;

            if (state.timerFuture != null) {
                state.timerFuture.cancel(true);
                state.timerFuture = null;
            }

            state.phase = Phase.REFEREE_VOTE;
            broadcastState(room, state, "7SEC_REFEREE_VOTE");
        }
    }

    /**
     * Arrêt anticipé par le joueur actif lorsqu'il a fini de citer ses 3 éléments avant les 7s.
     */
    public void stopCountdownEarly(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.COUNTDOWN) return;
            onCountdownFinished(roomCode);
        }
    }

    /**
     * FSM : Vote de l'arbitre ou consensus de la table -> SCORE_UPDATE.
     */
    public void vote(String roomCode, String voterId, boolean success) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || (state.phase != Phase.REFEREE_VOTE && state.phase != Phase.COUNTDOWN)) return;

            // Sécurité : le joueur actif ne peut pas voter pour lui-même s'il y a d'autres joueurs
            if (voterId.equals(state.activePlayerId) && room.playerCount() > 1) {
                return;
            }

            state.refereeVotes.put(voterId, success);

            // Si l'arbitre désigné ou l'hôte a voté, ou si la majorité de la table a voté
            boolean isDesignatedReferee = voterId.equals(state.refereePlayerId);
            boolean isHost = voterId.equals(room.getHostId());
            int eligibleVoters = Math.max(1, room.playerCount() - 1);
            boolean consensus = state.refereeVotes.size() >= Math.ceil(eligibleVoters / 2.0);

            if (isDesignatedReferee || isHost || consensus) {
                applyResult(room, state, success);
            }
        }
    }

    private void applyResult(GameRoom room, State state, boolean success) {
        if (state.timerFuture != null) {
            state.timerFuture.cancel(true);
            state.timerFuture = null;
        }

        state.phase = Phase.SCORE_UPDATE;
        state.lastSuccess = success;

        if (success) {
            state.scores.put(state.activePlayerId, state.scores.getOrDefault(state.activePlayerId, 0) + 1);
        }

        broadcastState(room, state, "7SEC_SCORE_UPDATE");
        // Rétrocompatibilité
        rooms.broadcast(room, "7SEC_RESULT", snapshot(state));
    }

    private void broadcastState(GameRoom room, State state, String eventType) {
        rooms.broadcast(room, eventType, snapshot(state));
    }

    public Map<String, Object> snapshot(State s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("turn", s.turn);
        m.put("activePlayerId", s.activePlayerId);
        m.put("refereePlayerId", s.refereePlayerId);
        m.put("theme", s.currentCard != null ? s.currentCard.theme() : "Général");
        m.put("challenge", s.currentCard != null ? s.currentCard.prompt() : "");
        m.put("prompt", s.currentCard != null ? s.currentCard.prompt() : "");
        m.put("cardId", s.currentCard != null ? s.currentCard.id() : "");
        m.put("count", s.currentCard != null ? s.currentCard.count() : 3);
        m.put("durationSeconds", 7);
        m.put("countdownStartedAt", s.countdownStartedAt);
        m.put("countdownEndsAt", s.countdownEndsAt);
        m.put("scores", new LinkedHashMap<>(s.scores));
        m.put("lastSuccess", s.lastSuccess);
        m.put("remainingCardsCount", s.remainingDeck.size());
        return m;
    }

    // Méthodes de délégation pour rétrocompatibilité
    public void nextTurn(String roomCode, String playerId) {
        drawNextCard(roomCode, playerId);
    }

    public void launchTimer(String roomCode, String playerId) {
        launchCountdown(roomCode, playerId);
    }

    public void validate(String roomCode, String playerId, boolean success) {
        vote(roomCode, playerId, success);
    }
}
