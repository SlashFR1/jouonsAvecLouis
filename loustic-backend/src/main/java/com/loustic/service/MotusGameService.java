package com.loustic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * <h3>MotusGameService</h3>
 * <p>
 * Moteur multijoueur en temps réel pour le jeu de lettres <strong>Motus</strong> (inspiré de Tusmo / Lingo).
 * </p>
 *
 * <h4>Mécaniques et Algorithmes Clés</h4>
 * <ul>
 *   <li><strong>Évaluation en 2 passes :</strong> Identification prioritaire des lettres bien placées
 *       ({@link LetterStatus#CORRECT}), puis comptage strict des occurrences pour les lettres mal placées
 *       ({@link LetterStatus#PRESENT}) et absentes ({@link LetterStatus#ABSENT}), évitant tout faux positif sur les doublons.</li>
 *   <li><strong>Garantie Anti-Triche :</strong> Le mot secret reste stocké en mémoire serveur et n'est
 *       diffusé aux clients que sous forme masquée (ex: {@code B*****}) tant que la manche est active.</li>
 *   <li><strong>Attribution des Points :</strong> +10 points pour la découverte du mot en 6 essais maximum,
 *       assortis d'un bonus de rapidité de +15 points pour le premier joueur à résoudre la grille.</li>
 * </ul>
 *
 * <h4>Concurrence et Synchronisation</h4>
 * <ul>
 *   <li>Toutes les mutations d'état de salle sont protégées par le verrou intrinsèque de l'instance {@link GameRoom}.</li>
 *   <li>Les scores et propositions sont maintenus dans des structures concurrentes thread-safe ({@link ConcurrentHashMap}, {@link CopyOnWriteArrayList}).</li>
 * </ul>
 *
 * @author Loustic Core Team
 * @see GameRoomService
 */
@Service
public class MotusGameService {

    private static final Logger log = LoggerFactory.getLogger(MotusGameService.class);

    public enum Phase {
        LOBBY,
        ROUND_ACTIVE,
        ROUND_RESOLVED,
        GAME_OVER
    }

    public enum LetterStatus {
        CORRECT,  // 🟥 Rouge (bonne position)
        PRESENT,  // 🟡 Jaune (mal placé)
        ABSENT    // 🟦 Bleu/Gris (absent)
    }

    public static final class GuessAttempt {
        private final String word;
        private final List<String> statuses;
        private final int attemptNumber;

        public GuessAttempt(String word, List<String> statuses, int attemptNumber) {
            this.word = word;
            this.statuses = statuses;
            this.attemptNumber = attemptNumber;
        }

        public String getWord() { return word; }
        public List<String> getStatuses() { return statuses; }
        public int getAttemptNumber() { return attemptNumber; }
    }

    public static final class PlayerRoundData {
        private final List<GuessAttempt> attempts = new CopyOnWriteArrayList<>();
        private boolean found = false;
        private int foundAtAttempt = 0;
        private boolean finished = false;

        public List<GuessAttempt> getAttempts() { return attempts; }
        public boolean isFound() { return found; }
        public int getFoundAtAttempt() { return foundAtAttempt; }
        public boolean isFinished() { return finished; }
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int roundNumber = 0;
        private int totalRounds = 5;

        private String secretWord = "";
        private int wordLength = 7;
        private String firstLetter = "";

        // Joueur ayant trouvé en premier lors de la manche
        private String firstFinderPlayerId = null;

        // Scores cumulés des joueurs : playerId -> score
        private final Map<String, Integer> scores = new ConcurrentHashMap<>();

        // Points marqués sur la manche en cours : playerId -> points
        private final Map<String, Integer> roundPoints = new ConcurrentHashMap<>();

        // Avancement des joueurs par manche : playerId -> PlayerRoundData
        private final Map<String, PlayerRoundData> playerRounds = new ConcurrentHashMap<>();

        // Mots déjà utilisés dans la partie
        private final Set<String> usedWords = ConcurrentHashMap.newKeySet();

        // Vainqueur final
        private String winnerPlayerId = "";
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom secureRandom = new SecureRandom();

    // Dictionnaire de mots validés (6 à 8 lettres en majuscules)
    private final List<String> dictionary = new CopyOnWriteArrayList<>();
    private final Set<String> dictionarySet = ConcurrentHashMap.newKeySet();

    public MotusGameService(GameRoomService rooms, SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.messaging = messaging;
        rooms.onRoomClosed(games::remove);
        loadDictionary();
    }

    private void loadDictionary() {
        try {
            ClassPathResource res = new ClassPathResource("data/motus.json");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(is);
                    if (root.has("words") && root.get("words").isArray()) {
                        List<String> list = new ArrayList<>();
                        for (JsonNode node : root.get("words")) {
                            String w = normalizeWord(node.asText());
                            if (w.length() >= 6 && w.length() <= 8) {
                                list.add(w);
                            }
                        }
                        if (!list.isEmpty()) {
                            dictionary.clear();
                            dictionary.addAll(list);
                            dictionarySet.clear();
                            dictionarySet.addAll(list);
                            log.info("📖 Dictionnaire Motus chargé : {} mots français (6 à 8 lettres).", dictionary.size());
                            return;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Impossible de charger data/motus.json, utilisation du dictionnaire de secours : {}", e.getMessage());
        }

        // Mots de secours si motus.json introuvable
        List<String> fallback = List.of(
            "CHATEAU", "BANANE", "BATEAU", "AVENIR", "BALLON", "SOLEIL", "CANARD", "MAISON",
            "CRAYON", "VOITURE", "PLANETE", "MYSTERE", "VICTOIRE", "LOUSTIC", "CHAMPION", "BOUQUET"
        );
        dictionary.addAll(fallback);
        dictionarySet.addAll(fallback);
    }

    public static String normalizeWord(String str) {
        if (str == null) return "";
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");
        return normalized.trim().toUpperCase().replaceAll("[^A-Z]", "");
    }

    /**
     * Démarrage d'une partie Motus.
     */
    public void start(String roomCode, String playerId, Integer totalRoundsOpt) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (playerId != null && room.getHostId() != null && !playerId.equals(room.getHostId()) && games.containsKey(roomCode)) {
                log.warn("⚠️ Refus de démarrage Motus pour la salle {} : joueur {} n'est pas l'hôte {}", roomCode, playerId, room.getHostId());
                return;
            }
            if (room.playerCount() < 1) {
                rooms.broadcast(room, "MOTUS_ERROR", Map.of("message", "Il faut au moins 1 joueur pour jouer à Motus !"));
                return;
            }

            State state = games.computeIfAbsent(roomCode, k -> new State());
            state.roundNumber = 0;
            state.totalRounds = (totalRoundsOpt != null && totalRoundsOpt >= 1 && totalRoundsOpt <= 20) ? totalRoundsOpt : 5;
            state.scores.clear();
            for (Player p : room.getPlayers()) {
                state.scores.put(p.id(), 0);
            }
            state.usedWords.clear();
            state.winnerPlayerId = "";

            startNextRound(room, state);
        }
    }

    /**
     * Lance la manche suivante ou termine la partie.
     */
    private void startNextRound(GameRoom room, State state) {
        state.roundNumber++;
        if (state.roundNumber > state.totalRounds) {
            state.phase = Phase.GAME_OVER;
            // Calcul du vainqueur
            String bestPlayer = "";
            int maxScore = -1;
            for (Map.Entry<String, Integer> entry : state.scores.entrySet()) {
                if (entry.getValue() > maxScore) {
                    maxScore = entry.getValue();
                    bestPlayer = entry.getKey();
                }
            }
            state.winnerPlayerId = bestPlayer;
            rooms.broadcast(room, "MOTUS_GAME_OVER", publicSnapshot(state, room));
            return;
        }

        state.phase = Phase.ROUND_ACTIVE;
        state.secretWord = drawWord(state.usedWords);
        state.usedWords.add(state.secretWord);
        state.wordLength = state.secretWord.length();
        state.firstLetter = String.valueOf(state.secretWord.charAt(0));
        state.firstFinderPlayerId = null;

        state.roundPoints.clear();
        state.playerRounds.clear();
        for (Player p : room.getPlayers()) {
            state.playerRounds.put(p.id(), new PlayerRoundData());
            state.roundPoints.put(p.id(), 0);
        }

        log.info("🟥 Salle {} : Manche {}/{} - Mot secret : {} ({} lettres)",
                room.getCode(), state.roundNumber, state.totalRounds, state.secretWord, state.wordLength);

        rooms.broadcast(room, "MOTUS_ROUND_STARTED", publicSnapshot(state, room));
    }

    private String drawWord(Set<String> used) {
        List<String> pool = new ArrayList<>();
        for (String w : dictionary) {
            if (!used.contains(w)) pool.add(w);
        }
        if (pool.isEmpty()) {
            pool.addAll(dictionary);
        }
        return pool.get(secureRandom.nextInt(pool.size()));
    }

    /**
     * Évaluation en 2 passes :
     * Passe 1 : Bien placées (CORRECT)
     * Passe 2 : Mal placées (PRESENT) et Absentes (ABSENT)
     */
    public static List<String> evaluateGuess(String secret, String guess) {
        int n = secret.length();
        LetterStatus[] result = new LetterStatus[n];

        // 1. Comptage des occurrences de chaque lettre du mot secret
        Map<Character, Integer> pool = new HashMap<>();
        for (int i = 0; i < n; i++) {
            char sc = secret.charAt(i);
            pool.put(sc, pool.getOrDefault(sc, 0) + 1);
        }

        // 2. Passe 1 : Lettres bien placées
        for (int i = 0; i < n; i++) {
            char gc = guess.charAt(i);
            char sc = secret.charAt(i);
            if (gc == sc) {
                result[i] = LetterStatus.CORRECT;
                pool.put(sc, pool.get(sc) - 1);
            }
        }

        // 3. Passe 2 : Lettres mal placées ou absentes
        for (int i = 0; i < n; i++) {
            if (result[i] == null) {
                char gc = guess.charAt(i);
                int count = pool.getOrDefault(gc, 0);
                if (count > 0) {
                    result[i] = LetterStatus.PRESENT;
                    pool.put(gc, count - 1);
                } else {
                    result[i] = LetterStatus.ABSENT;
                }
            }
        }

        List<String> output = new ArrayList<>(n);
        for (LetterStatus ls : result) {
            output.add(ls.name());
        }
        return output;
    }

    /**
     * Soumission d'une proposition par un joueur.
     */
    public void guess(String roomCode, String playerId, String wordProposal) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.ROUND_ACTIVE) return;

            PlayerRoundData pData = state.playerRounds.computeIfAbsent(playerId, k -> new PlayerRoundData());
            if (pData.finished) {
                return;
            }

            String guess = normalizeWord(wordProposal);
            if (guess.length() != state.wordLength) {
                messaging.convertAndSend("/topic/room/" + roomCode + "/motus/" + playerId, Map.of(
                    "type", "MOTUS_GUESS_ERROR",
                    "message", "Le mot doit comporter " + state.wordLength + " lettres !"
                ));
                return;
            }

            if (guess.charAt(0) != state.secretWord.charAt(0)) {
                messaging.convertAndSend("/topic/room/" + roomCode + "/motus/" + playerId, Map.of(
                    "type", "MOTUS_GUESS_ERROR",
                    "message", "La première lettre doit être " + state.firstLetter + " !"
                ));
                return;
            }

            // Évaluation du mot
            List<String> statuses = evaluateGuess(state.secretWord, guess);
            int attemptNum = pData.attempts.size() + 1;
            GuessAttempt attempt = new GuessAttempt(guess, statuses, attemptNum);
            pData.attempts.add(attempt);

            boolean isAllCorrect = statuses.stream().allMatch(s -> "CORRECT".equals(s));
            int pointsWon = 0;

            if (isAllCorrect) {
                pData.found = true;
                pData.foundAtAttempt = attemptNum;
                pData.finished = true;

                // Calcul des points selon l'essai
                int basePoints = switch (attemptNum) {
                    case 1 -> 60;
                    case 2 -> 50;
                    case 3 -> 40;
                    case 4 -> 30;
                    case 5 -> 20;
                    case 6 -> 10;
                    default -> 0;
                };

                // Bonus premier joueur (+15 pts)
                boolean isFirstFinder = false;
                if (state.firstFinderPlayerId == null) {
                    state.firstFinderPlayerId = playerId;
                    basePoints += 15;
                    isFirstFinder = true;
                }

                pointsWon = basePoints;
                state.roundPoints.put(playerId, pointsWon);
                state.scores.put(playerId, state.scores.getOrDefault(playerId, 0) + pointsWon);

                if (isFirstFinder) {
                    Player p = room.getPlayer(playerId);
                    String pName = p != null ? p.name() : "Un joueur";
                    rooms.broadcast(room, "MOTUS_FIRST_FINDER", Map.of(
                        "playerId", playerId,
                        "playerName", pName,
                        "bonus", 15
                    ));
                }
            } else if (attemptNum >= 6) {
                pData.finished = true;
                pData.found = false;
            }

            // 1. Réponse PRIVÉE au joueur avec ses vraies lettres
            messaging.convertAndSend("/topic/room/" + roomCode + "/motus/" + playerId, Map.of(
                "type", "MOTUS_MY_GUESS_RESULT",
                "attemptNumber", attemptNum,
                "guess", guess,
                "statuses", statuses,
                "found", pData.found,
                "finished", pData.finished,
                "pointsWon", pointsWon
            ));

            // 2. Diffusion PUBLIQUE aux adversaires : AUCUNE LETTRE N'EST DÉVOILÉE (anti-triche)
            rooms.broadcast(room, "MOTUS_OPPONENT_PROGRESS", Map.of(
                "playerId", playerId,
                "attemptNumber", attemptNum,
                "statuses", statuses,
                "found", pData.found,
                "finished", pData.finished
            ));

            // 3. Vérifier si tous les joueurs ont terminé
            boolean allFinished = true;
            for (Player p : room.getPlayers()) {
                PlayerRoundData d = state.playerRounds.get(p.id());
                if (d == null || !d.finished) {
                    allFinished = false;
                    break;
                }
            }

            if (allFinished) {
                state.phase = Phase.ROUND_RESOLVED;
                rooms.broadcast(room, "MOTUS_ROUND_RESOLVED", publicSnapshot(state, room));
            } else {
                rooms.broadcast(room, "MOTUS_STATE_UPDATED", publicSnapshot(state, room));
            }
        }
    }

    /**
     * L'hôte passe au mot suivant ou clôt la manche.
     */
    public void nextRound(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;
            if (!playerId.equals(room.getHostId())) return;

            // Si la manche est encore active, l'hôte peut forcer la résolution
            if (state.phase == Phase.ROUND_ACTIVE) {
                state.phase = Phase.ROUND_RESOLVED;
                rooms.broadcast(room, "MOTUS_ROUND_RESOLVED", publicSnapshot(state, room));
                return;
            }

            if (state.phase == Phase.ROUND_RESOLVED) {
                startNextRound(room, state);
            }
        }
    }

    /**
     * Synchronisation de l'état d'un joueur qui se reconnecte.
     */
    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.find(roomCode).orElse(null);
        if (room == null) return;
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;

            // Diffusion de l'état public
            rooms.broadcast(room, "MOTUS_STATE_UPDATED", publicSnapshot(state, room));

            // Envoi des tentatives personnelles du joueur (avec ses lettres réelles)
            PlayerRoundData pData = state.playerRounds.get(playerId);
            if (pData != null) {
                List<Map<String, Object>> myAttempts = new ArrayList<>();
                for (GuessAttempt a : pData.attempts) {
                    myAttempts.add(Map.of(
                        "word", a.word,
                        "statuses", a.statuses,
                        "attemptNumber", a.attemptNumber
                    ));
                }
                messaging.convertAndSend("/topic/room/" + roomCode + "/motus/" + playerId, Map.of(
                    "type", "MOTUS_PRIVATE_SYNC",
                    "myAttempts", myAttempts,
                    "found", pData.found,
                    "finished", pData.finished
                ));
            }
        }
    }

    /**
     * Snapshot public sécurisé envoyé à tous les joueurs de la salle.
     */
    public Map<String, Object> publicSnapshot(State s, GameRoom room) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("roundNumber", s.roundNumber);
        m.put("totalRounds", s.totalRounds);
        m.put("wordLength", s.wordLength);
        m.put("firstLetter", s.firstLetter);

        // Le mot secret n'est révélé que lorsque la manche est résolue ou terminée
        if (s.phase == Phase.ROUND_RESOLVED || s.phase == Phase.GAME_OVER) {
            m.put("secretWord", s.secretWord);
        } else {
            m.put("secretWord", null);
        }

        m.put("firstFinderPlayerId", s.firstFinderPlayerId);
        m.put("scores", new LinkedHashMap<>(s.scores));
        m.put("roundPoints", new LinkedHashMap<>(s.roundPoints));

        // Avancement anonymisé de tous les joueurs (pour les mini-grilles adverses)
        Map<String, Object> progress = new LinkedHashMap<>();
        for (Player p : room.getPlayers()) {
            PlayerRoundData d = s.playerRounds.get(p.id());
            if (d != null) {
                List<List<String>> statusesList = new ArrayList<>();
                for (GuessAttempt a : d.attempts) {
                    statusesList.add(a.statuses); // AUCUNE LETTRE
                }
                progress.put(p.id(), Map.of(
                    "attemptsCount", d.attempts.size(),
                    "found", d.found,
                    "finished", d.finished,
                    "statusesList", statusesList
                ));
            } else {
                progress.put(p.id(), Map.of(
                    "attemptsCount", 0,
                    "found", false,
                    "finished", false,
                    "statusesList", List.of()
                ));
            }
        }
        m.put("playersProgress", progress);

        m.put("winnerPlayerId", s.winnerPlayerId);
        String winnerName = (s.winnerPlayerId != null && room.hasPlayer(s.winnerPlayerId))
                ? room.getPlayer(s.winnerPlayerId).name() : "";
        m.put("winnerPlayerName", winnerName);

        return m;
    }
}
