package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.repository.ClasseMoiCaRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Moteur du jeu coopératif "Classe moi ça" (Style Top Ten / Ito) :
 * - Thème d'intensité de 1 à 10 avec mode normal et mode hot/NSFW
 * - 4 vies initiales (croissants de licorne), objectif 5 manches
 * - Chiffres secrets uniques n in [1, 10] distribués confidentiellement
 * - Bornes de repères 0 et 11 définies par le Capitaine
 * - Rôle de Capitaine tournant, classement des coéquipiers par Drag-and-Drop
 * - Révélation pas à pas et calcul du nombre d'inversions
 * - FSM : THEME_DRAW -> NUMBER_DISTRIBUTION -> ORAL_PROPOSALS -> CAPTAIN_ORDERING -> REVEAL_STEP_BY_STEP -> ROUND_RESULT
 */
@Service
public class ClasseMoiCaGameService {

    public enum Phase {
        LOBBY,
        THEME_DRAW,
        NUMBER_DISTRIBUTION,
        ORAL_PROPOSALS,
        CAPTAIN_ORDERING,
        REVEAL_STEP_BY_STEP,
        ROUND_RESULT,
        GAME_OVER
    }

    public static final int INITIAL_LIVES = 4;
    public static final int TARGET_ROUNDS = 5;

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int roundNumber = 0;
        private int maxRounds = TARGET_ROUNDS;
        private int lives = INITIAL_LIVES;
        private boolean hotMode = false;

        private String captainId = "";
        private String currentTheme = "";
        private String anchorZero = "";
        private String anchorEleven = "";

        // Chiffres secrets (playerId -> n in [1, 10])
        private final Map<String, Integer> secretNumbers = new ConcurrentHashMap<>();

        // Propositions orales / notes des joueurs (playerId -> note / "Prêt")
        private final Map<String, String> submissions = new ConcurrentHashMap<>();

        // Ordre décidé par le Capitaine (liste de playerIds)
        private final List<String> orderedPlayerIds = new CopyOnWriteArrayList<>();

        // Progression de la révélation pas à pas (de 0 à orderedPlayerIds.size())
        private int revealedIndex = 0;
        private int roundErrors = 0;
        private boolean lastStepError = false;

        // Historique de pioche des thèmes
        private final List<String> themeDeck = new CopyOnWriteArrayList<>();
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final ClasseMoiCaRepository repository;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom secureRandom = new SecureRandom();

    public ClasseMoiCaGameService(GameRoomService rooms,
                                  ClasseMoiCaRepository repository,
                                  SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.repository = repository;
        this.messaging = messaging;
        rooms.onRoomClosed(games::remove);
    }

    /**
     * Démarrage de la partie depuis le LOBBY.
     */
    public void start(String roomCode, String playerId) {
        start(roomCode, playerId, false);
    }

    public void start(String roomCode, String playerId, boolean hotMode) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) {
                return;
            }
            if (room.playerCount() < 2) {
                rooms.broadcast(room, "CMC_ERROR", Map.of("message", "Il faut au moins 2 joueurs pour jouer à Classe moi ça !"));
                return;
            }

            State state = games.computeIfAbsent(roomCode, k -> new State());
            state.hotMode = hotMode;
            state.lives = INITIAL_LIVES;
            state.roundNumber = 0;
            state.maxRounds = TARGET_ROUNDS;

            // Préparer la pioche de thèmes
            state.themeDeck.clear();
            state.themeDeck.addAll(repository.createShuffledDeck(hotMode));

            startNewRound(room, state);
        }
    }

    /**
     * Nouvelle manche : tirage du thème et distribution des chiffres secrets uniques.
     */
    private void startNewRound(GameRoom room, State state) {
        state.roundNumber++;

        // Capitaine tournant
        int capIdx = (state.roundNumber - 1) % room.playerCount();
        state.captainId = room.getPlayers().get(capIdx).id();

        // Tirage d'un thème sans remise
        if (state.themeDeck.isEmpty()) {
            state.themeDeck.addAll(repository.createShuffledDeck(state.hotMode));
        }
        state.currentTheme = state.themeDeck.remove(0);

        // Réinitialiser les repères du Capitaine
        state.anchorZero = "";
        state.anchorEleven = "";
        state.submissions.clear();
        state.orderedPlayerIds.clear();
        state.revealedIndex = 0;
        state.roundErrors = 0;
        state.lastStepError = false;

        // FSM : THEME_DRAW puis NUMBER_DISTRIBUTION
        state.phase = Phase.ORAL_PROPOSALS;

        // Tirage de chiffres distincts uniques dans [1, 10]
        List<Integer> pool = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
        Collections.shuffle(pool, secureRandom);

        state.secretNumbers.clear();
        for (Player p : room.getPlayers()) {
            int secret = pool.remove(0);
            state.secretNumbers.put(p.id(), secret);
        }

        // Envoi sécurisé des chiffres secrets à chaque joueur en privé
        dispatchSecretNumbers(room, state);

        broadcastState(room, state, "CMC_ROUND_STARTED");
    }

    /**
     * Le Capitaine définit les repères 0 (pire) et 11 (meilleur).
     */
    public void setAnchors(String roomCode, String playerId, String zero, String eleven) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;
            if (!playerId.equals(state.captainId) && !playerId.equals(room.getHostId())) return;

            state.anchorZero = zero != null ? zero.trim() : "";
            state.anchorEleven = eleven != null ? eleven.trim() : "";

            broadcastState(room, state, "CMC_ANCHORS_UPDATED");
        }
    }

    /**
     * Un joueur valide qu'il a énoncé sa proposition à la table (ou saisit un résumé).
     */
    public void submit(String roomCode, String playerId, String text) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || (state.phase != Phase.ORAL_PROPOSALS && state.phase != Phase.NUMBER_DISTRIBUTION)) return;

            state.submissions.put(playerId, (text != null && !text.isBlank()) ? text.trim() : "Prêt 🗣️");

            // Si tous les joueurs ont parlé / validé -> passage à la réorganisation du Capitaine
            if (state.submissions.size() >= room.playerCount()) {
                state.phase = Phase.CAPTAIN_ORDERING;
                // Ordre par défaut initial
                state.orderedPlayerIds.clear();
                room.getPlayers().forEach(p -> state.orderedPlayerIds.add(p.id()));
                broadcastState(room, state, "CMC_ORDERING_PHASE");
            } else {
                broadcastState(room, state, "CMC_SUBMISSION_RECEIVED");
            }
        }
    }

    /**
     * Le Capitaine valide l'ordre des joueurs du plus petit au plus grand.
     */
    public void validateOrder(String roomCode, String playerId, List<String> orderedIds) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.CAPTAIN_ORDERING) return;
            if (!playerId.equals(state.captainId) && !playerId.equals(room.getHostId())) return;

            if (orderedIds == null || orderedIds.isEmpty()) return;

            state.orderedPlayerIds.clear();
            state.orderedPlayerIds.addAll(orderedIds);
            state.revealedIndex = 0;
            state.roundErrors = 0;
            state.lastStepError = false;

            // FSM : Transition vers la révélation suspense pas à pas
            state.phase = Phase.REVEAL_STEP_BY_STEP;
            broadcastState(room, state, "CMC_REVEAL_STARTED");
        }
    }

    /**
     * Révélation d'un joueur suivant dans l'ordre du Capitaine (révélation pas à pas).
     */
    public void revealNextStep(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.REVEAL_STEP_BY_STEP) return;
            if (!playerId.equals(state.captainId) && !playerId.equals(room.getHostId())) return;

            if (state.revealedIndex < state.orderedPlayerIds.size()) {
                state.revealedIndex++;

                // Vérifier si ce joueur cause une inversion par rapport au précédent
                state.lastStepError = false;
                if (state.revealedIndex >= 2) {
                    String prevPlayerId = state.orderedPlayerIds.get(state.revealedIndex - 2);
                    String currPlayerId = state.orderedPlayerIds.get(state.revealedIndex - 1);

                    int numA = state.secretNumbers.getOrDefault(prevPlayerId, 0);
                    int numB = state.secretNumbers.getOrDefault(currPlayerId, 0);

                    if (numA > numB) {
                        state.lastStepError = true;
                        state.roundErrors++;
                        state.lives = Math.max(0, state.lives - 1);
                    }
                }

                // Si tous les joueurs ont été révélés -> fin de manche
                if (state.revealedIndex >= state.orderedPlayerIds.size()) {
                    state.phase = Phase.ROUND_RESULT;
                }

                broadcastState(room, state, "CMC_REVEAL_STEP");
            }
        }
    }

    /**
     * Révélation complète en un coup (alternative rapide).
     */
    public void revealAll(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.REVEAL_STEP_BY_STEP) return;

            while (state.revealedIndex < state.orderedPlayerIds.size()) {
                revealNextStep(roomCode, playerId);
            }
        }
    }

    /**
     * Passage à la manche suivante ou écran de fin.
     */
    public void nextRound(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || (state.phase != Phase.ROUND_RESULT && state.phase != Phase.GAME_OVER)) return;

            if (state.lives <= 0 || state.roundNumber >= state.maxRounds) {
                state.phase = Phase.GAME_OVER;
                broadcastState(room, state, "CMC_GAME_OVER");
            } else {
                startNewRound(room, state);
            }
        }
    }

    /**
     * Envoi confidentiel des chiffres secrets à chaque joueur.
     */
    private void dispatchSecretNumbers(GameRoom room, State state) {
        for (Player p : room.getPlayers()) {
            Integer num = state.secretNumbers.get(p.id());
            if (num != null) {
                messaging.convertAndSend("/topic/cmc/" + room.getCode() + "/player/" + p.id() + "/number",
                        Map.of("secretNumber", num, "theme", state.currentTheme));
                messaging.convertAndSend("/topic/room/" + room.getCode() + "/number/" + p.id(),
                        Map.of("secretNumber", num, "theme", state.currentTheme));
            }
        }
    }

    private void broadcastState(GameRoom room, State state, String eventType) {
        rooms.broadcast(room, eventType, snapshot(state, room));
    }

    public Map<String, Object> snapshot(State s, GameRoom room) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("roundNumber", s.roundNumber);
        m.put("maxRounds", s.maxRounds);
        m.put("lives", s.lives);
        m.put("hotMode", s.hotMode);

        m.put("captainId", s.captainId);
        String captainName = room.hasPlayer(s.captainId) ? room.getPlayer(s.captainId).name() : "Capitaine";
        m.put("captainName", captainName);

        m.put("currentTheme", s.currentTheme);
        m.put("anchorZero", s.anchorZero);
        m.put("anchorEleven", s.anchorEleven);

        m.put("submissions", new LinkedHashMap<>(s.submissions));
        m.put("orderedPlayerIds", new ArrayList<>(s.orderedPlayerIds));
        m.put("revealedIndex", s.revealedIndex);
        m.put("roundErrors", s.roundErrors);
        m.put("lastStepError", s.lastStepError);

        // Chiffres révélés : ne dévoile que les chiffres des joueurs déjà révélés
        Map<String, Integer> publicNumbers = new LinkedHashMap<>();
        if (s.phase == Phase.ROUND_RESULT || s.phase == Phase.GAME_OVER) {
            publicNumbers.putAll(s.secretNumbers);
        } else if (s.phase == Phase.REVEAL_STEP_BY_STEP) {
            for (int i = 0; i < s.revealedIndex && i < s.orderedPlayerIds.size(); i++) {
                String pid = s.orderedPlayerIds.get(i);
                publicNumbers.put(pid, s.secretNumbers.getOrDefault(pid, 0));
            }
        }
        m.put("revealedNumbers", publicNumbers);

        // Rétrocompatibilité avec les anciens clients
        m.put("theme", Map.of("themeA", s.currentTheme, "themeB", "De 1 (le pire) à 10 (le meilleur)"));
        m.put("secretNumbers", publicNumbers);

        return m;
    }

    public Integer getPlayerSecretNumber(String roomCode, String playerId) {
        State state = games.get(roomCode);
        if (state == null) return null;
        return state.secretNumbers.get(playerId);
    }

    public Map<String, Object> getSnapshot(String roomCode) {
        State state = games.get(roomCode);
        if (state == null) return Map.of();
        return snapshot(state, rooms.require(roomCode));
    }
}
