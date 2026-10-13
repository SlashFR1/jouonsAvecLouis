package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Moteur multijoueur du jeu "Galerie" (Style Dixit).
 * Gère rigoureusement les 4 phases de tour par tour :
 * 1. STORYTELLER : Le conteur choisit 1 carte de sa main de 6 et soumet son indice.
 * 2. IMPOSTURE : Les autres joueurs choisissent secrètement 1 carte de leur main.
 * 3. VOTE : Cartes mélangées côté serveur et affichées sans ownerId. Vote à l'aveugle.
 * 4. RESULTS : Révélation des cartes, calcul officiel des scores Dixit, pioche pour revenir à 6 cartes.
 */
@Service
public class GalerieGameService {

    private static final Logger log = LoggerFactory.getLogger(GalerieGameService.class);

    public enum Phase {
        LOBBY,
        STORYTELLER,
        IMPOSTURE,
        VOTE,
        RESULTS,
        GAME_OVER
    }

    public static final class GalerieCard {
        private final int id;
        private final String imageUrl;
        private final String title;

        public GalerieCard(int id, String imageUrl, String title) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.title = title;
        }

        public int getId() { return id; }
        public String getImageUrl() { return imageUrl; }
        public String getTitle() { return title; }
    }

    public static final class PlayerHand {
        private final String playerId;
        private final String playerName;
        private final List<GalerieCard> hand = new CopyOnWriteArrayList<>();
        private int score = 0;
        private volatile boolean submitted = false;
        private volatile Integer submittedCardId = null;
        private volatile Integer votedCardId = null;

        public PlayerHand(String playerId, String playerName) {
            this.playerId = playerId;
            this.playerName = playerName;
        }

        public String getPlayerId() { return playerId; }
        public String getPlayerName() { return playerName; }
        public List<GalerieCard> getHand() { return hand; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public boolean isSubmitted() { return submitted; }
        public void setSubmitted(boolean submitted) { this.submitted = submitted; }
        public Integer getSubmittedCardId() { return submittedCardId; }
        public void setSubmittedCardId(Integer submittedCardId) { this.submittedCardId = submittedCardId; }
        public Integer getVotedCardId() { return votedCardId; }
        public void setVotedCardId(Integer votedCardId) { this.votedCardId = votedCardId; }
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private String storytellerId = null;
        private int storytellerIndex = 0;
        private final List<String> turnOrder = new CopyOnWriteArrayList<>();

        private final Map<String, PlayerHand> players = new ConcurrentHashMap<>();
        private final List<GalerieCard> deck = new CopyOnWriteArrayList<>();

        private String currentClue = "";
        private Integer storytellerCardId = null;

        // Cartes soumises pour le vote (mélangées)
        private final List<GalerieCard> votingBoard = new CopyOnWriteArrayList<>();

        // Résultats de la manche courante
        private final Map<String, Integer> roundPoints = new ConcurrentHashMap<>();
        private final Map<String, String> lastRoundBreakdown = new ConcurrentHashMap<>();
        private int roundNumber = 1;
        private String theme = "art";
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom secureRandom = new SecureRandom();

    public GalerieGameService(GameRoomService rooms, SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.messaging = messaging;
    }

    public void start(String roomCode, String playerId, String theme) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != Phase.LOBBY) return;

            s.theme = (theme != null && !theme.isBlank()) ? theme : "art";
            initDeckAndDeal(room, s);
            s.phase = Phase.STORYTELLER;
            s.roundNumber = 1;
            s.storytellerIndex = 0;
            s.storytellerId = s.turnOrder.get(0);
            s.currentClue = "";
            s.storytellerCardId = null;

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

    private void initDeckAndDeal(GameRoom room, State s) {
        s.deck.clear();
        s.players.clear();
        s.turnOrder.clear();

        // Construire la liste d'images selon le dossier
        String folder = s.theme;
        int maxImages = folder.equalsIgnoreCase("Reve") ? 60 : folder.equalsIgnoreCase("nature") ? 45 : 100;
        List<GalerieCard> allCards = new ArrayList<>();
        for (int i = 1; i <= maxImages; i++) {
            allCards.add(new GalerieCard(i, "/images/galerie/images/" + folder + "/img" + i + ".png", "Œuvre #" + i));
        }
        Collections.shuffle(allCards, secureRandom);
        s.deck.addAll(allCards);

        for (Player p : room.getPlayers()) {
            s.turnOrder.add(p.id());
            PlayerHand hand = new PlayerHand(p.id(), p.name());
            // Distribuer 6 cartes à chaque joueur
            for (int k = 0; k < 6 && !s.deck.isEmpty(); k++) {
                hand.getHand().add(s.deck.remove(0));
            }
            s.players.put(p.id(), hand);
        }
    }

    /**
     * Phase 1 : Le Conteur choisit une carte et soumet son indice.
     */
    public void submitStorytellerClue(String roomCode, String playerId, int cardId, String clue) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.STORYTELLER) return;
            if (!playerId.equals(s.storytellerId)) return;

            PlayerHand hand = s.players.get(playerId);
            if (hand == null) return;

            boolean hasCard = hand.getHand().stream().anyMatch(c -> c.getId() == cardId);
            if (!hasCard) return;

            s.storytellerCardId = cardId;
            s.currentClue = (clue != null) ? clue.trim() : "";
            hand.setSubmitted(true);
            hand.setSubmittedCardId(cardId);

            // Passer à la phase 2 : Imposture
            s.phase = Phase.IMPOSTURE;
            for (PlayerHand ph : s.players.values()) {
                if (!ph.getPlayerId().equals(s.storytellerId)) {
                    ph.setSubmitted(false);
                    ph.setSubmittedCardId(null);
                }
            }

            broadcastState(room, s);
        }
    }

    /**
     * Phase 2 : Un joueur autre que le conteur choisit secrètement sa carte imposture.
     */
    public void submitImpostureCard(String roomCode, String playerId, int cardId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.IMPOSTURE) return;
            if (playerId.equals(s.storytellerId)) return; // Le conteur a déjà soumis

            PlayerHand hand = s.players.get(playerId);
            if (hand == null) return;

            boolean hasCard = hand.getHand().stream().anyMatch(c -> c.getId() == cardId);
            if (!hasCard) return;

            hand.setSubmitted(true);
            hand.setSubmittedCardId(cardId);

            // Vérifier si tous les autres joueurs ont soumis
            boolean allSubmitted = s.players.values().stream()
                    .allMatch(PlayerHand::isSubmitted);

            if (allSubmitted) {
                // Rassembler toutes les cartes soumises et mélanger côté serveur
                s.votingBoard.clear();
                List<GalerieCard> submittedList = new ArrayList<>();
                for (PlayerHand ph : s.players.values()) {
                    if (ph.getSubmittedCardId() != null) {
                        ph.getHand().stream()
                                .filter(c -> c.getId() == ph.getSubmittedCardId())
                                .findFirst()
                                .ifPresent(submittedList::add);
                    }
                }
                Collections.shuffle(submittedList, secureRandom);
                s.votingBoard.addAll(submittedList);

                // Réinitialiser les votes
                for (PlayerHand ph : s.players.values()) {
                    ph.setVotedCardId(null);
                }

                s.phase = Phase.VOTE;
            }

            broadcastState(room, s);
        }
    }

    /**
     * Phase 3 : Un joueur vote pour la carte qu'il pense être celle du conteur.
     */
    public void voteCard(String roomCode, String playerId, int cardId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.VOTE) return;
            if (playerId.equals(s.storytellerId)) return; // Le conteur ne vote pas

            PlayerHand hand = s.players.get(playerId);
            if (hand == null) return;

            // RÈGLE STRICTE ANTI-TRICHE : Interdiction de voter pour sa propre carte
            if (hand.getSubmittedCardId() != null && hand.getSubmittedCardId() == cardId) {
                rooms.broadcast(room, "GALERIE_ERROR", Map.of("message", "Interdiction de voter pour votre propre carte !"));
                return;
            }

            hand.setVotedCardId(cardId);

            // Vérifier si tous les votants (hors conteur) ont voté
            boolean allVoted = s.players.values().stream()
                    .filter(ph -> !ph.getPlayerId().equals(s.storytellerId))
                    .allMatch(ph -> ph.getVotedCardId() != null);

            if (allVoted) {
                resolveRoundScores(s);
                s.phase = Phase.RESULTS;
            }

            broadcastState(room, s);
        }
    }

    /**
     * Algorithme officiel de calcul des scores Dixit.
     */
    private void resolveRoundScores(State s) {
        s.roundPoints.clear();
        s.lastRoundBreakdown.clear();

        String storytellerId = s.storytellerId;
        int correctCardId = s.storytellerCardId != null ? s.storytellerCardId : -1;

        List<PlayerHand> voters = s.players.values().stream()
                .filter(p -> !p.getPlayerId().equals(storytellerId))
                .toList();

        int totalVoters = voters.size();
        long correctVotes = voters.stream()
                .filter(p -> p.getVotedCardId() != null && p.getVotedCardId() == correctCardId)
                .count();

        // 1. CAS CONTEUR
        if (correctVotes == totalVoters || correctVotes == 0) {
            // Tout le monde ou personne n'a trouvé -> Conteur = 0, tous les autres = 2
            s.roundPoints.put(storytellerId, 0);
            s.lastRoundBreakdown.put(storytellerId, "0 pt (Indice trop évident ou trop difficile)");
            for (PlayerHand p : voters) {
                s.roundPoints.put(p.getPlayerId(), 2);
                s.lastRoundBreakdown.put(p.getPlayerId(), "+2 pts (Conteur en échec)");
            }
        } else {
            // Entre 1 et N-1 joueurs ont trouvé -> Conteur = 3, trouveurs = 3
            s.roundPoints.put(storytellerId, 3);
            s.lastRoundBreakdown.put(storytellerId, "+3 pts (Indice subtil)");
            for (PlayerHand p : voters) {
                if (p.getVotedCardId() != null && p.getVotedCardId() == correctCardId) {
                    s.roundPoints.put(p.getPlayerId(), 3);
                    s.lastRoundBreakdown.put(p.getPlayerId(), "+3 pts (Bonne carte trouvée)");
                } else {
                    s.roundPoints.put(p.getPlayerId(), 0);
                    s.lastRoundBreakdown.put(p.getPlayerId(), "0 pt (Erreur de carte)");
                }
            }
        }

        // 2. BONUS IMPOSTEURS (+1 point par vote reçu sur sa carte piège)
        for (PlayerHand owner : voters) {
            Integer cardSubmitted = owner.getSubmittedCardId();
            if (cardSubmitted != null) {
                long votesReceived = voters.stream()
                        .filter(v -> v.getVotedCardId() != null && v.getVotedCardId().equals(cardSubmitted))
                        .count();
                if (votesReceived > 0) {
                    s.roundPoints.merge(owner.getPlayerId(), (int) votesReceived, Integer::sum);
                    String current = s.lastRoundBreakdown.getOrDefault(owner.getPlayerId(), "");
                    s.lastRoundBreakdown.put(owner.getPlayerId(), current + " | +" + votesReceived + " pt(s) piège");
                }
            }
        }

        // 3. Mise à jour des scores globaux et pioche pour revenir à 6 cartes
        for (PlayerHand ph : s.players.values()) {
            int pts = s.roundPoints.getOrDefault(ph.getPlayerId(), 0);
            ph.setScore(ph.getScore() + pts);

            // Défausser la carte jouée
            Integer submittedId = ph.getSubmittedCardId();
            if (submittedId != null) {
                ph.getHand().removeIf(c -> c.getId() == submittedId);
            }

            // Piocher 1 carte si le deck n'est pas vide
            if (!s.deck.isEmpty()) {
                ph.getHand().add(s.deck.remove(0));
            }
        }
    }

    /**
     * Passer à la manche suivante : rotation du conteur.
     */
    public void nextRound(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.RESULTS) return;

            s.roundNumber++;
            s.storytellerIndex = (s.storytellerIndex + 1) % s.turnOrder.size();
            s.storytellerId = s.turnOrder.get(s.storytellerIndex);
            s.currentClue = "";
            s.storytellerCardId = null;
            s.votingBoard.clear();
            s.roundPoints.clear();
            s.lastRoundBreakdown.clear();

            for (PlayerHand ph : s.players.values()) {
                ph.setSubmitted(false);
                ph.setSubmittedCardId(null);
                ph.setVotedCardId(null);
            }

            s.phase = Phase.STORYTELLER;
            broadcastState(room, s);
        }
    }

    /**
     * Diffusion sécurisée avec anti-triche :
     * - Les mains privées sont envoyées individuellement sur /topic/galerie/{code}/hand/{playerId}.
     * - En Phase 3 (VOTE), le board ne contient AUCUN ownerId ni flag isStoryteller.
     * - En Phase 4 (RESULTS), le board complet avec propriétaires et votes est révélé.
     */
    private void broadcastState(GameRoom room, State s) {
        Map<String, Object> publicPayload = new LinkedHashMap<>();
        publicPayload.put("phase", s.phase.name());
        publicPayload.put("roundNumber", s.roundNumber);
        publicPayload.put("storytellerId", s.storytellerId);
        publicPayload.put("storytellerName", s.players.containsKey(s.storytellerId) ? s.players.get(s.storytellerId).getPlayerName() : "Conteur");
        publicPayload.put("currentClue", s.currentClue);

        // Liste des joueurs avec état d'avancement (booléen uniquement, pas la carte secrète)
        List<Map<String, Object>> playersStatus = new ArrayList<>();
        for (PlayerHand ph : s.players.values()) {
            Map<String, Object> pInfo = new LinkedHashMap<>();
            pInfo.put("playerId", ph.getPlayerId());
            pInfo.put("playerName", ph.getPlayerName());
            pInfo.put("score", ph.getScore());
            pInfo.put("hasSubmitted", ph.isSubmitted());
            pInfo.put("hasVoted", ph.getVotedCardId() != null);
            playersStatus.add(pInfo);
        }
        publicPayload.put("players", playersStatus);

        // Cartes pour le vote / résultats
        if (s.phase == Phase.VOTE) {
            // ANTI-TRICHE STRICTE : Uniquement { id, imageUrl } sans propriétaire !
            List<Map<String, Object>> blindBoard = s.votingBoard.stream()
                    .map(c -> Map.<String, Object>of("id", c.getId(), "imageUrl", c.getImageUrl()))
                    .toList();
            publicPayload.put("votingCards", blindBoard);
        } else if (s.phase == Phase.RESULTS) {
            // Révélation complète en phase 4
            List<Map<String, Object>> revealedBoard = new ArrayList<>();
            for (GalerieCard c : s.votingBoard) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", c.getId());
                item.put("imageUrl", c.getImageUrl());
                // Trouver le propriétaire
                String ownerId = s.players.values().stream()
                        .filter(p -> p.getSubmittedCardId() != null && p.getSubmittedCardId() == c.getId())
                        .map(PlayerHand::getPlayerId)
                        .findFirst()
                        .orElse(null);
                item.put("ownerId", ownerId);
                item.put("isStoryteller", c.getId() == s.storytellerCardId);

                // Joueurs ayant voté pour cette carte
                List<String> votersForCard = s.players.values().stream()
                        .filter(p -> p.getVotedCardId() != null && p.getVotedCardId() == c.getId())
                        .map(PlayerHand::getPlayerName)
                        .toList();
                item.put("voters", votersForCard);

                revealedBoard.add(item);
            }
            publicPayload.put("votingCards", revealedBoard);
            publicPayload.put("roundPoints", s.roundPoints);
            publicPayload.put("roundBreakdown", s.lastRoundBreakdown);
        } else {
            publicPayload.put("votingCards", Collections.emptyList());
        }

        rooms.broadcast(room, "GALERIE_STATE_UPDATED", publicPayload);

        // Envoyer la main secrète à chaque joueur individuellement
        for (PlayerHand ph : s.players.values()) {
            messaging.convertAndSend("/topic/galerie/" + room.getCode() + "/hand/" + ph.getPlayerId(), Map.of(
                    "hand", ph.getHand(),
                    "submittedCardId", ph.getSubmittedCardId() != null ? ph.getSubmittedCardId() : -1,
                    "votedCardId", ph.getVotedCardId() != null ? ph.getVotedCardId() : -1
            ));
        }
    }
}
