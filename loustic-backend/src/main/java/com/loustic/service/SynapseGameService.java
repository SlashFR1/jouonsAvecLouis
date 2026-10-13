package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.model.SynapseBonus;
import com.loustic.model.SynapseQuestion;
import com.loustic.repository.SynapseRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service métier multi-téléphones pour Synapse (Style TTMC - Tu Te Mets Combien ?).
 * Gère l'arbitrage par les pairs, le calcul de risque, les séries (streaks) et les défis bonus.
 */
@Service
public class SynapseGameService {

    public enum Phase {
        LOBBY,
        LEVEL_SELECTION,
        QUESTION_BROADCAST,
        PEER_VALIDATION,
        ROUND_RESULT,
        BONUS_CHALLENGE,
        GAME_OVER
    }

    public static final int DEFAULT_TARGET_SCORE = 30;

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int roundNumber = 0;
        private int targetScore = DEFAULT_TARGET_SCORE;
        private boolean bonusModeActive = true;

        // Ordre des joueurs
        private final List<String> turnOrder = new CopyOnWriteArrayList<>();
        private int activeIndex = 0;
        private String activePlayerId = "";

        // Choix du joueur actif
        private int selectedLevel = 1;
        private boolean isRisky = false;

        // Question en cours
        private SynapseQuestion currentQuestion = null;
        private final Set<Integer> usedQuestionIds = ConcurrentHashMap.newKeySet();

        // Carte bonus courante
        private SynapseBonus currentBonus = null;

        // Dernier résultat de validation
        private boolean lastWasSuccess = false;
        private int lastPointsDelta = 0;

        // Scores et Streaks (séries)
        private final Map<String, Integer> scores = new ConcurrentHashMap<>();
        private final Map<String, Integer> streaks = new ConcurrentHashMap<>();

        // Gagnant
        private String winnerPlayerId = "";
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SynapseRepository repository;
    private final SimpMessagingTemplate messaging;

    public SynapseGameService(GameRoomService rooms, SynapseRepository repository, SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.repository = repository;
        this.messaging = messaging;
        rooms.onRoomClosed(games::remove);
    }

    /**
     * Démarrage de la partie depuis le LOBBY.
     */
    public void start(String roomCode, String playerId, Integer targetScoreOpt, Boolean bonusOpt) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) {
                return;
            }
            if (room.playerCount() < 2) {
                rooms.broadcast(room, "SYNAPSE_ERROR", Map.of("message", "Il faut au moins 2 joueurs pour jouer à Synapse !"));
                return;
            }

            State state = games.computeIfAbsent(roomCode, k -> new State());
            state.roundNumber = 0;
            state.targetScore = (targetScoreOpt != null && targetScoreOpt > 0) ? targetScoreOpt : DEFAULT_TARGET_SCORE;
            state.bonusModeActive = (bonusOpt == null || bonusOpt);

            // Établir l'ordre des tours
            state.turnOrder.clear();
            for (Player p : room.getPlayers()) {
                state.turnOrder.add(p.id());
                state.scores.put(p.id(), 0);
                state.streaks.put(p.id(), 0);
            }
            Collections.shuffle(state.turnOrder, new SecureRandom());
            state.activeIndex = 0;
            state.activePlayerId = state.turnOrder.get(0);
            state.usedQuestionIds.clear();
            state.winnerPlayerId = "";

            startLevelSelection(room, state);
        }
    }

    /**
     * Démarre une phase de choix de niveau pour le joueur actif.
     */
    private void startLevelSelection(GameRoom room, State state) {
        state.roundNumber++;
        state.phase = Phase.LEVEL_SELECTION;
        state.selectedLevel = 1;
        state.isRisky = false;
        state.currentQuestion = null;
        state.currentBonus = null;

        broadcastState(room, state, "SYNAPSE_ROUND_STARTED");
    }

    /**
     * Le joueur actif choisit son niveau (1 à 10) et l'option risquée sur son téléphone.
     */
    public void selectLevel(String roomCode, String playerId, int level, boolean isRisky) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.LEVEL_SELECTION) return;
            if (!playerId.equals(state.activePlayerId)) return;

            int clampedLevel = Math.max(1, Math.min(10, level));
            state.selectedLevel = clampedLevel;
            state.isRisky = isRisky;

            // Pioche d'une question
            SynapseQuestion question = repository.drawQuestion(clampedLevel, state.usedQuestionIds);
            state.currentQuestion = question;
            state.usedQuestionIds.add(question.id());

            state.phase = Phase.PEER_VALIDATION;

            // Broadcast public (sans la réponse secrète)
            broadcastState(room, state, "SYNAPSE_QUESTION_DISPLAYED");

            // Broadcast de la réponse aux arbitres (tous sauf le joueur actif)
            broadcastRefereeAnswer(room, state);
        }
    }

    /**
     * Validation orale par les pairs (un arbitre valide ✅ ou ❌).
     */
    public void validateAnswer(String roomCode, String refereePlayerId, boolean isCorrect) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.PEER_VALIDATION) return;

            // Le joueur actif ne peut pas s'auto-valider
            if (refereePlayerId.equals(state.activePlayerId) && room.playerCount() > 2) return;

            int level = state.selectedLevel;
            int currentScore = state.scores.getOrDefault(state.activePlayerId, 0);
            int currentStreak = state.streaks.getOrDefault(state.activePlayerId, 0);

            int delta;
            if (isCorrect) {
                delta = state.isRisky ? (2 * level) : level;
                currentScore += delta;
                currentStreak += 1;
            } else {
                delta = state.isRisky ? (-level) : 0;
                currentScore = Math.max(0, currentScore + delta);
                currentStreak = 0;
            }

            state.scores.put(state.activePlayerId, currentScore);
            state.streaks.put(state.activePlayerId, currentStreak);
            state.lastWasSuccess = isCorrect;
            state.lastPointsDelta = delta;

            // Vérification de victoire
            if (currentScore >= state.targetScore) {
                state.winnerPlayerId = state.activePlayerId;
                state.phase = Phase.GAME_OVER;
                broadcastState(room, state, "SYNAPSE_GAME_OVER");
                return;
            }

            // Déclenchement défi bonus tous les 4 succès consécutifs
            if (isCorrect && state.bonusModeActive && currentStreak > 0 && (currentStreak % 4 == 0)) {
                state.currentBonus = repository.drawRandomBonus();
                state.phase = Phase.BONUS_CHALLENGE;
                broadcastState(room, state, "SYNAPSE_BONUS_TRIGGERED");
            } else {
                state.phase = Phase.ROUND_RESULT;
                broadcastState(room, state, "SYNAPSE_ROUND_RESOLVED");
            }
        }
    }

    /**
     * Passage au tour suivant.
     */
    public void nextTurn(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;
            if (state.phase != Phase.ROUND_RESULT && state.phase != Phase.BONUS_CHALLENGE && state.phase != Phase.GAME_OVER) return;

            if (state.phase == Phase.GAME_OVER) {
                start(roomCode, playerId, state.targetScore, state.bonusModeActive);
                return;
            }

            // Rotation du tour
            state.activeIndex = (state.activeIndex + 1) % state.turnOrder.size();
            state.activePlayerId = state.turnOrder.get(state.activeIndex);

            startLevelSelection(room, state);
        }
    }

    /**
     * Resynchronisation d'un joueur.
     */
    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        State state = games.get(roomCode);
        if (state == null) return;

        messaging.convertAndSend("/topic/room/" + roomCode, Map.of(
                "type", "SYNAPSE_STATE_UPDATED",
                "room", room,
                "payload", publicSnapshot(state, room)
        ));

        // Si le joueur est un arbitre et qu'une question est en cours, lui renvoyer la réponse
        if (state.phase == Phase.PEER_VALIDATION && !playerId.equals(state.activePlayerId) && state.currentQuestion != null) {
            messaging.convertAndSend("/topic/room/" + roomCode + "/synapse/referee", Map.of(
                    "questionId", state.currentQuestion.id(),
                    "officialAnswer", state.currentQuestion.answer()
            ));
        }
    }

    private void broadcastState(GameRoom room, State state, String eventType) {
        rooms.broadcast(room, eventType, publicSnapshot(state, room));
    }

    private void broadcastRefereeAnswer(GameRoom room, State state) {
        if (state.currentQuestion == null) return;
        Map<String, Object> refereeData = Map.of(
                "questionId", state.currentQuestion.id(),
                "officialAnswer", state.currentQuestion.answer()
        );
        messaging.convertAndSend("/topic/room/" + room.getCode() + "/synapse/referee", refereeData);
        messaging.convertAndSend("/topic/synapse/" + room.getCode() + "/referee", refereeData);
    }

    /**
     * Snapshot public : SÉCURISÉ Zero-Knowledge.
     * Ne contient JAMAIS la réponse officielle pendant la phase PEER_VALIDATION !
     */
    public Map<String, Object> publicSnapshot(State s, GameRoom room) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("roundNumber", s.roundNumber);
        m.put("targetScore", s.targetScore);
        m.put("bonusModeActive", s.bonusModeActive);

        m.put("turnOrder", s.turnOrder);
        m.put("activePlayerId", s.activePlayerId);
        String activePlayerName = room.hasPlayer(s.activePlayerId) ? room.getPlayer(s.activePlayerId).name() : "";
        m.put("activePlayerName", activePlayerName);

        m.put("selectedLevel", s.selectedLevel);
        m.put("isRisky", s.isRisky);

        if (s.currentQuestion != null) {
            m.put("questionId", s.currentQuestion.id());
            m.put("questionCode", s.currentQuestion.code());
            m.put("questionLevel", s.currentQuestion.level());
            m.put("questionText", s.currentQuestion.text());

            // La réponse n'est publique qu'à la fin de la manche (ROUND_RESULT / BONUS / GAME_OVER)
            if (s.phase == Phase.ROUND_RESULT || s.phase == Phase.BONUS_CHALLENGE || s.phase == Phase.GAME_OVER) {
                m.put("officialAnswer", s.currentQuestion.answer());
            } else {
                m.put("officialAnswer", null);
            }
        } else {
            m.put("questionText", null);
            m.put("officialAnswer", null);
        }

        if (s.currentBonus != null) {
            m.put("bonusText", s.currentBonus.text());
        } else {
            m.put("bonusText", null);
        }

        m.put("lastWasSuccess", s.lastWasSuccess);
        m.put("lastPointsDelta", s.lastPointsDelta);

        m.put("scores", new LinkedHashMap<>(s.scores));
        m.put("streaks", new LinkedHashMap<>(s.streaks));

        m.put("winnerPlayerId", s.winnerPlayerId);
        String winnerName = room.hasPlayer(s.winnerPlayerId) ? room.getPlayer(s.winnerPlayerId).name() : "";
        m.put("winnerPlayerName", winnerName);

        return m;
    }

    public Map<String, Object> getSnapshot(String roomCode) {
        State state = games.get(roomCode);
        if (state == null) return Map.of();
        return publicSnapshot(state, rooms.require(roomCode));
    }
}
