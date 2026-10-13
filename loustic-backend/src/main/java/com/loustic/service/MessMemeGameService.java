package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service multijoueur du jeu "Mess Meme" en temps réel (via WebSockets STOMP).
 */
@Service
public class MessMemeGameService {

    public enum Phase {
        LOBBY,
        SUBMIT_CAPTION,
        BLIND_VOTING,
        RESULTS,
        GAME_OVER
    }

    public static final class CaptionSubmission {
        private final String playerId;
        private final String playerName;
        private final String caption;
        private final int submissionId;

        public CaptionSubmission(String playerId, String playerName, String caption, int submissionId) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.caption = caption;
            this.submissionId = submissionId;
        }

        public String getPlayerId() { return playerId; }
        public String getPlayerName() { return playerName; }
        public String getCaption() { return caption; }
        public int getSubmissionId() { return submissionId; }
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int roundNumber = 1;
        private int currentMemeIndex = 1;
        private String currentSituation = "";

        // Scores globaux des joueurs
        private final Map<String, Integer> scores = new ConcurrentHashMap<>();

        // Légendes soumises dans la manche
        private final Map<String, CaptionSubmission> submissions = new ConcurrentHashMap<>();

        // Votes : voterPlayerId -> submissionId
        private final Map<String, Integer> votes = new ConcurrentHashMap<>();

        // Points gagnés lors de la dernière manche : playerId -> points
        private final Map<String, Integer> roundPoints = new ConcurrentHashMap<>();

        private final List<Integer> memeDeck = new CopyOnWriteArrayList<>();
        private int submissionCounter = 1;
    }

    private static final List<String> DEFAULT_SITUATIONS = List.of(
            "Quand ton réveil sonne un lundi matin après avoir dormi 3h.",
            "Quand le serveur dit 'Bon appétit' et que tu réponds 'Toi aussi'.",
            "Quand quelqu'un commence sa phrase par 'Sans vouloir te vexer...'",
            "Quand tu regardes ton compte en banque le dimanche soir.",
            "Quand tes parents essaient de comprendre comment fonctionne le Wi-Fi.",
            "Quand le prof dit 'Mettez-vous par deux' et que tu regardes ton pote.",
            "Quand tu envoies un message à la mauvaise personne et que tu vois 'En train d'écrire...'",
            "Quand tu te cognes le petit orteil dans le coin du lit.",
            "Quand tu dis que tu vas dormir tôt mais qu'il est 4h du matin sur ton téléphone.",
            "Quand tu croises ton boss en soirée un samedi soir.",
            "Quand ton pote dit 'T'inquiète je gère' juste avant la catastrophe.",
            "Quand tu retires tes écouteurs et que tu te rends compte que ta musique tournait sur haut-parleur."
    );

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SecureRandom secureRandom = new SecureRandom();

    public MessMemeGameService(GameRoomService rooms) {
        this.rooms = rooms;
    }

    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != Phase.LOBBY) return;

            s.scores.clear();
            for (Player p : room.getPlayers()) {
                s.scores.put(p.id(), 0);
            }

            // Générer un paquet de 107 mèmes mélangés
            s.memeDeck.clear();
            for (int i = 1; i <= 107; i++) {
                s.memeDeck.add(i);
            }
            Collections.shuffle(s.memeDeck, secureRandom);

            s.roundNumber = 1;
            startRound(s);

            broadcastState(room, s);
        }
    }

    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.find(roomCode).orElse(null);
        if (room == null) return;
        synchronized (room) {
            State s = games.get(roomCode);
            if (s != null) {
                broadcastState(room, s);
            }
        }
    }

    private void startRound(State s) {
        s.submissions.clear();
        s.votes.clear();
        s.roundPoints.clear();
        s.submissionCounter = 1;

        if (s.memeDeck.isEmpty()) {
            for (int i = 1; i <= 107; i++) s.memeDeck.add(i);
            Collections.shuffle(s.memeDeck, secureRandom);
        }

        s.currentMemeIndex = s.memeDeck.remove(0);
        s.currentSituation = DEFAULT_SITUATIONS.get(secureRandom.nextInt(DEFAULT_SITUATIONS.size()));
        s.phase = Phase.SUBMIT_CAPTION;
    }

    /**
     * Phase 2 : Un joueur soumet sa légende secrète pour le mème.
     */
    public void submitCaption(String roomCode, String playerId, String caption) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.SUBMIT_CAPTION) return;
            if (caption == null || caption.trim().isEmpty()) return;

            Player p = room.getPlayer(playerId);
            String name = (p != null) ? p.name() : "Joueur";

            int subId = s.submissionCounter++;
            s.submissions.put(playerId, new CaptionSubmission(playerId, name, caption.trim(), subId));

            // Si tous les joueurs connectés ont soumis leur légende -> Passer au vote
            if (s.submissions.size() >= room.getPlayers().size()) {
                s.phase = Phase.BLIND_VOTING;
            }

            broadcastState(room, s);
        }
    }

    /**
     * Phase 3 : Un joueur vote pour sa légende préférée (auto-vote interdit).
     */
    public void voteCaption(String roomCode, String playerId, int submissionId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.BLIND_VOTING) return;

            // RÈGLE ANTI-TRICHE : Interdiction absolue de voter pour sa propre légende
            CaptionSubmission mySub = s.submissions.get(playerId);
            if (mySub != null && mySub.getSubmissionId() == submissionId) {
                rooms.broadcast(room, "MESSMEME_ERROR", Map.of("message", "Interdiction de voter pour votre propre légende !"));
                return;
            }

            s.votes.put(playerId, submissionId);

            // Dès que tous les joueurs ont voté -> Résolution des scores
            if (s.votes.size() >= room.getPlayers().size()) {
                resolveScores(s);
                s.phase = Phase.RESULTS;
            }

            broadcastState(room, s);
        }
    }

    /**
     * Calcul des scores : +1 point par vote reçu.
     */
    private void resolveScores(State s) {
        s.roundPoints.clear();
        for (CaptionSubmission sub : s.submissions.values()) {
            s.roundPoints.put(sub.getPlayerId(), 0);
        }

        // Compter les votes reçus par chaque soumission
        for (Integer votedSubId : s.votes.values()) {
            for (CaptionSubmission sub : s.submissions.values()) {
                if (sub.getSubmissionId() == votedSubId) {
                    s.roundPoints.merge(sub.getPlayerId(), 1, Integer::sum);
                    s.scores.merge(sub.getPlayerId(), 1, Integer::sum);
                }
            }
        }
    }

    /**
     * Passer à la manche suivante.
     */
    public void nextRound(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.RESULTS) return;

            s.roundNumber++;
            startRound(s);
            broadcastState(room, s);
        }
    }

    private void broadcastState(GameRoom room, State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("phase", s.phase.name());
        payload.put("roundNumber", s.roundNumber);
        payload.put("memeIndex", s.currentMemeIndex);
        payload.put("memeUrl", "/images/memes/images/img" + s.currentMemeIndex + ".png");
        payload.put("situation", s.currentSituation);

        // Liste des joueurs et état de complétion (booléens uniquement)
        List<Map<String, Object>> playersList = new ArrayList<>();
        for (Player p : room.getPlayers()) {
            Map<String, Object> pInfo = new LinkedHashMap<>();
            pInfo.put("playerId", p.id());
            pInfo.put("playerName", p.name());
            pInfo.put("score", s.scores.getOrDefault(p.id(), 0));
            pInfo.put("hasSubmitted", s.submissions.containsKey(p.id()));
            pInfo.put("hasVoted", s.votes.containsKey(p.id()));
            playersList.add(pInfo);
        }
        payload.put("players", playersList);

        // Cartes de vote / Légendes
        if (s.phase == Phase.BLIND_VOTING) {
            // ANTI-TRICHE : Aucune information d'auteur envoyée côté réseau pendant le vote !
            List<Map<String, Object>> blindList = new ArrayList<>();
            List<CaptionSubmission> shuffled = new ArrayList<>(s.submissions.values());
            Collections.shuffle(shuffled, secureRandom);

            for (CaptionSubmission sub : shuffled) {
                blindList.add(Map.of(
                        "submissionId", sub.getSubmissionId(),
                        "caption", sub.getCaption()
                ));
            }
            payload.put("votingCaptions", blindList);
        } else if (s.phase == Phase.RESULTS) {
            // Révélation complète en phase de résultats
            List<Map<String, Object>> revealedList = new ArrayList<>();
            for (CaptionSubmission sub : s.submissions.values()) {
                long votesCount = s.votes.values().stream().filter(v -> v == sub.getSubmissionId()).count();
                List<String> votersNames = new ArrayList<>();
                for (Map.Entry<String, Integer> entry : s.votes.entrySet()) {
                    if (entry.getValue() == sub.getSubmissionId()) {
                        Player voterPlayer = room.getPlayer(entry.getKey());
                        if (voterPlayer != null) votersNames.add(voterPlayer.name());
                    }
                }

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("submissionId", sub.getSubmissionId());
                item.put("caption", sub.getCaption());
                item.put("authorId", sub.getPlayerId());
                item.put("authorName", sub.getPlayerName());
                item.put("votesCount", votesCount);
                item.put("voters", votersNames);
                revealedList.add(item);
            }

            revealedList.sort((a, b) -> Long.compare((long) b.get("votesCount"), (long) a.get("votesCount")));
            payload.put("votingCaptions", revealedList);
            payload.put("roundPoints", s.roundPoints);
        } else {
            payload.put("votingCaptions", Collections.emptyList());
        }

        rooms.broadcast(room, "MESSMEME_STATE_UPDATED", payload);
    }
}
