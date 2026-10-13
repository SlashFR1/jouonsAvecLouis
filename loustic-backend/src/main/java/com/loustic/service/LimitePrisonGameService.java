package com.loustic.service;

import com.loustic.model.*;
import com.loustic.repository.LimitePrisonRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service pour "Limite PRISON" (Style Cards Against Humanity / Blanc Manger Coco) :
 * - FSM stricte : QUESTION_REVEAL -> SUBMISSION_PHASE -> ANONYMOUS_REVEAL -> JUDGING -> ROUND_WINNER -> PODIUM
 * - Pioche sans remise (cartes noires et cartes blanches) avec recyclage de défausse
 * - Respect strict de la confidentialité : mains privées de 5 cartes envoyées UNIQUEMENT au joueur concerné
 * - Anonymisation stricte des propositions par tokens éphémères sur /topic/limite/{roomCode}/proposals
 * - Juge tournant à chaque manche, premier à 5 points gagne
 */
@Service
public class LimitePrisonGameService {

    public enum Phase {
        LOBBY,
        MASTER_PICK,
        PICK_QUESTION,
        QUESTION_REVEAL,
        SUBMISSION_PHASE,
        ANONYMOUS_REVEAL,
        JUDGING,
        ROUND_WINNER,
        PODIUM
    }

    public static final int WINNING_SCORE = 5;
    public static final int HAND_SIZE = 5;

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private int roundNumber = 0;
        private String judgePlayerId = "";
        private BlackCard currentBlackCard = null;
        private final List<BlackCard> proposedBlackCards = new CopyOnWriteArrayList<>();

        // Pioches & défausses sans remise
        private final List<BlackCard> blackDeck = new CopyOnWriteArrayList<>();
        private final List<BlackCard> blackDiscard = new CopyOnWriteArrayList<>();
        private final List<WhiteCard> whiteDeck = new CopyOnWriteArrayList<>();
        private final List<WhiteCard> whiteDiscard = new CopyOnWriteArrayList<>();

        // Mains privées (strictement isolées) : playerId -> list of WhiteCard
        private final Map<String, List<WhiteCard>> playerHands = new ConcurrentHashMap<>();

        // Soumissions de la manche : playerId -> WhiteCard
        private final Map<String, WhiteCard> rawSubmissions = new ConcurrentHashMap<>();

        // Mapping d'anonymisation éphémère : token -> playerId
        private final Map<String, String> tokenToPlayerId = new ConcurrentHashMap<>();
        // Mapping d'anonymisation éphémère : token -> WhiteCard
        private final Map<String, WhiteCard> tokenToCard = new ConcurrentHashMap<>();
        private final List<AnonymousProposal> anonymousProposals = new CopyOnWriteArrayList<>();

        // Gagnant de la manche
        private String winningPlayerId = "";
        private WhiteCard winningCard = null;

        // Scores
        private final Map<String, Integer> scores = new ConcurrentHashMap<>();
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final LimitePrisonRepository repository;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom secureRandom = new SecureRandom();

    public LimitePrisonGameService(GameRoomService rooms,
                                   LimitePrisonRepository repository,
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
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) {
                return;
            }
            if (room.playerCount() < 2) {
                rooms.broadcast(room, "LIMITE_ERROR", Map.of("message", "Il faut au moins 2 joueurs pour jouer à Limite PRISON !"));
                return;
            }

            State state = games.computeIfAbsent(roomCode, k -> new State());

            // Initialiser les pioches sans remise
            state.blackDeck.clear();
            state.blackDeck.addAll(repository.createShuffledBlackDeck());
            state.blackDiscard.clear();

            state.whiteDeck.clear();
            state.whiteDeck.addAll(repository.createShuffledWhiteDeck());
            state.whiteDiscard.clear();

            // Initialiser les scores
            state.scores.clear();
            for (Player p : room.getPlayers()) {
                state.scores.put(p.id(), 0);
            }

            state.roundNumber = 0;

            // Distribuer 5 cartes blanches privées à chaque joueur
            state.playerHands.clear();
            for (Player p : room.getPlayers()) {
                List<WhiteCard> hand = new ArrayList<>();
                for (int i = 0; i < HAND_SIZE; i++) {
                    hand.add(drawWhiteCard(state));
                }
                state.playerHands.put(p.id(), hand);
            }

            // Envoyer à chaque joueur sa main privée
            dispatchPrivateHands(room, state);

            startNewRound(room, state);
        }
    }

    /**
     * Nouvelle manche : Juge tournant + tirage d'une carte noire.
     */
    private void startNewRound(GameRoom room, State state) {
        state.roundNumber++;

        // Rotation du Juge
        int judgeIdx = (state.roundNumber - 1) % room.playerCount();
        state.judgePlayerId = room.getPlayers().get(judgeIdx).id();

        // Tirage de 2 cartes bleues proposées au Maître
        state.proposedBlackCards.clear();
        state.proposedBlackCards.add(drawBlackCard(state));
        state.proposedBlackCards.add(drawBlackCard(state));
        state.currentBlackCard = state.proposedBlackCards.get(0);

        // Réinitialiser les soumissions et tokens de la manche
        state.rawSubmissions.clear();
        state.tokenToPlayerId.clear();
        state.tokenToCard.clear();
        state.anonymousProposals.clear();
        state.winningPlayerId = "";
        state.winningCard = null;

        // FSM : Le Maître choisit la carte bleue (MASTER_PICK)
        state.phase = Phase.MASTER_PICK;

        broadcastState(room, state, "LIMITE_ROUND_STARTED");
    }

    /**
     * Le Maître choisit la carte bleue parmi les 2 propositions.
     */
    public void selectQuestion(String roomCode, String playerId, String cardId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null) return;
            if (state.phase != Phase.MASTER_PICK && state.phase != Phase.PICK_QUESTION) return;
            if (!playerId.equals(state.judgePlayerId)) return;

            for (BlackCard bc : state.proposedBlackCards) {
                if (bc.id().equals(cardId) || bc.text().equals(cardId)) {
                    state.currentBlackCard = bc;
                    break;
                }
            }

            state.phase = Phase.SUBMISSION_PHASE;
            broadcastState(room, state, "LIMITE_QUESTION_CHOSEN");
        }
    }

    /**
     * Soumission secrète d'une carte blanche par un joueur.
     */
    public void submitCard(String roomCode, String playerId, String cardId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.SUBMISSION_PHASE) return;

            // Le juge ne soumet pas de carte blanche
            if (playerId.equals(state.judgePlayerId) && room.playerCount() > 2) return;

            // Vérifier que le joueur n'a pas déjà soumis
            if (state.rawSubmissions.containsKey(playerId)) return;

            // Récupérer la main privée du joueur
            List<WhiteCard> hand = state.playerHands.get(playerId);
            if (hand == null) return;

            WhiteCard submittedCard = null;
            for (WhiteCard card : hand) {
                if (cardId != null && (card.id().equalsIgnoreCase(cardId)
                        || card.text().equalsIgnoreCase(cardId)
                        || card.text().trim().equalsIgnoreCase(cardId.trim()))) {
                    submittedCard = card;
                    break;
                }
            }

            // Fallback si cardId correspond partiellement au texte
            if (submittedCard == null && cardId != null) {
                for (WhiteCard card : hand) {
                    if (card.text().contains(cardId) || cardId.contains(card.text())) {
                        submittedCard = card;
                        break;
                    }
                }
            }

            // Fallback ultime si la sélection n'a pas pu être désérialisée
            if (submittedCard == null && !hand.isEmpty()) {
                submittedCard = hand.get(0);
            }

            if (submittedCard == null) return;

            // Retirer de la main privée
            hand.remove(submittedCard);
            state.whiteDiscard.add(submittedCard);

            // Enregistrer la soumission secrète
            state.rawSubmissions.put(playerId, submittedCard);

            // Mettre à jour la main privée du joueur immédiatement
            sendPrivateHand(roomCode, playerId, hand);

            // Calcul du nombre de soumissions attendues
            int expectedSubmissions = room.playerCount() > 2 ? room.playerCount() - 1 : room.playerCount();

            // Si tout le monde a soumis -> passage automatique à l'anonymisation
            if (state.rawSubmissions.size() >= expectedSubmissions) {
                triggerAnonymousReveal(room, state);
            } else {
                broadcastState(room, state, "LIMITE_SUBMISSION_RECEIVED");
            }
        }
    }

    /**
     * Anonymisation stricte des propositions : masquage des IDs par des tokens éphémères.
     */
    private void triggerAnonymousReveal(GameRoom room, State state) {
        state.phase = Phase.JUDGING;
        state.tokenToPlayerId.clear();
        state.tokenToCard.clear();
        state.anonymousProposals.clear();

        List<Map.Entry<String, WhiteCard>> entries = new ArrayList<>(state.rawSubmissions.entrySet());
        // Mélange aléatoire côté serveur pour casser tout ordre d'arrivée
        Collections.shuffle(entries, secureRandom);

        int tokenNum = 1;
        for (Map.Entry<String, WhiteCard> entry : entries) {
            String token = "prop_" + tokenNum + "_" + UUID.randomUUID().toString().substring(0, 4);
            tokenNum++;

            state.tokenToPlayerId.put(token, entry.getKey());
            state.tokenToCard.put(token, entry.getValue());
            state.anonymousProposals.add(new AnonymousProposal(token, entry.getValue().text()));
        }

        // Diffusion du DTO anonymisé sur /topic/limite/{roomCode}/proposals
        messaging.convertAndSend("/topic/limite/" + room.getCode() + "/proposals", state.anonymousProposals);

        broadcastState(room, state, "LIMITE_ANONYMOUS_REVEAL");
    }

    /**
     * Le Juge sélectionne la carte gagnante par son token anonyme.
     */
    public void pickWinner(String roomCode, String judgeId, String winnerToken) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || state.phase != Phase.JUDGING) return;

            // Seul le juge ou l'hôte (si juge AFK) peut élire
            if (!judgeId.equals(state.judgePlayerId) && !judgeId.equals(room.getHostId())) return;

            String winnerPlayerId = state.tokenToPlayerId.get(winnerToken);
            WhiteCard winnerCard = state.tokenToCard.get(winnerToken);

            if (winnerPlayerId == null || winnerCard == null) return;

            state.winningPlayerId = winnerPlayerId;
            state.winningCard = winnerCard;

            // Attribution du point (+1)
            int currentScore = state.scores.getOrDefault(winnerPlayerId, 0) + 1;
            state.scores.put(winnerPlayerId, currentScore);

            // Recompléter la main de chaque joueur ayant soumis pour revenir à 5 cartes
            for (String pid : state.rawSubmissions.keySet()) {
                List<WhiteCard> hand = state.playerHands.get(pid);
                if (hand != null && hand.size() < HAND_SIZE) {
                    hand.add(drawWhiteCard(state));
                }
            }
            dispatchPrivateHands(room, state);

            // Vérification de la condition de victoire : Premier à 5 points gagne
            if (currentScore >= WINNING_SCORE) {
                state.phase = Phase.PODIUM;
                broadcastState(room, state, "LIMITE_PODIUM");
            } else {
                state.phase = Phase.ROUND_WINNER;
                broadcastState(room, state, "LIMITE_ROUND_WINNER");
            }
        }
    }

    /**
     * Passage à la manche suivante.
     */
    public void nextRound(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State state = games.get(roomCode);
            if (state == null || (state.phase != Phase.ROUND_WINNER && state.phase != Phase.PODIUM)) return;

            // Si c'était le podium, réinitialiser pour une nouvelle partie complète
            if (state.phase == Phase.PODIUM) {
                start(roomCode, playerId);
                return;
            }

            startNewRound(room, state);
        }
    }

    /**
     * Envoie la main privée à chaque joueur connecté sur son canal dédié.
     */
    public void dispatchPrivateHands(GameRoom room, State state) {
        for (Player p : room.getPlayers()) {
            List<WhiteCard> hand = state.playerHands.get(p.id());
            if (hand != null) {
                sendPrivateHand(room.getCode(), p.id(), hand);
            }
        }
    }

    private void sendPrivateHand(String roomCode, String playerId, List<WhiteCard> hand) {
        messaging.convertAndSend("/topic/limite/" + roomCode + "/player/" + playerId + "/hand", hand);
        // Canal alternatif pour flexibilité
        messaging.convertAndSend("/topic/room/" + roomCode + "/hand/" + playerId, hand);
    }

    /**
     * Pioche d'une carte noire avec remélange de la défausse si épuisement.
     */
    private BlackCard drawBlackCard(State state) {
        if (state.blackDeck.isEmpty()) {
            if (!state.blackDiscard.isEmpty()) {
                state.blackDeck.addAll(state.blackDiscard);
                state.blackDiscard.clear();
                Collections.shuffle(state.blackDeck, secureRandom);
            } else {
                state.blackDeck.addAll(repository.createShuffledBlackDeck());
            }
        }
        BlackCard card = state.blackDeck.remove(0);
        state.blackDiscard.add(card);
        return card;
    }

    /**
     * Pioche d'une carte blanche avec remélange de la défausse si épuisement.
     */
    private WhiteCard drawWhiteCard(State state) {
        if (state.whiteDeck.isEmpty()) {
            if (!state.whiteDiscard.isEmpty()) {
                state.whiteDeck.addAll(state.whiteDiscard);
                state.whiteDiscard.clear();
                Collections.shuffle(state.whiteDeck, secureRandom);
            } else {
                state.whiteDeck.addAll(repository.createShuffledWhiteDeck());
            }
        }
        return state.whiteDeck.remove(0);
    }

    private void broadcastState(GameRoom room, State state, String eventType) {
        rooms.broadcast(room, eventType, snapshot(state, room));
    }

    /**
     * Snapshot public : SÉCURISÉ.
     * Ne contient JAMAIS les mains complètes des joueurs pour respecter la consigne métier stricte.
     */
    public Map<String, Object> snapshot(State s, GameRoom room) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("roundNumber", s.roundNumber);
        m.put("judgePlayerId", s.judgePlayerId);
        m.put("proposedBlackCards", s.proposedBlackCards);
        m.put("currentBlackCard", s.currentBlackCard);
        m.put("currentQuestion", s.currentBlackCard != null ? s.currentBlackCard.text() : "");

        // Statut des soumissions : on envoie QUI a soumis, mais PAS le contenu de la carte
        m.put("submittedPlayerIds", new ArrayList<>(s.rawSubmissions.keySet()));
        int expectedSubmissions = room.playerCount() > 2 ? room.playerCount() - 1 : room.playerCount();
        m.put("submissionsCount", s.rawSubmissions.size());
        m.put("expectedSubmissions", expectedSubmissions);

        // Propositions anonymisées (visibles en JUDGING, ROUND_WINNER, PODIUM)
        m.put("anonymousProposals", s.anonymousProposals);

        // Gagnant de manche
        m.put("winningPlayerId", s.winningPlayerId);
        m.put("winningCard", s.winningCard);
        String winnerName = room.hasPlayer(s.winningPlayerId) ? room.getPlayer(s.winningPlayerId).name() : "";
        m.put("winningPlayerName", winnerName);

        // Scores
        m.put("scores", new LinkedHashMap<>(s.scores));
        m.put("winningScore", WINNING_SCORE);

        return m;
    }

    public Map<String, Object> getSnapshot(String roomCode) {
        State state = games.get(roomCode);
        if (state == null) return Map.of();
        return snapshot(state, rooms.require(roomCode));
    }

    // Récupération de la main privée pour un joueur donné (si demandé directement)
    public List<WhiteCard> getPlayerHand(String roomCode, String playerId) {
        State state = games.get(roomCode);
        if (state == null) return List.of();
        return state.playerHands.getOrDefault(playerId, List.of());
    }

    // Rétrocompatibilité avec les anciens contrôleurs
    public void submit(String roomCode, String playerId, String cardText) {
        submitCard(roomCode, playerId, cardText);
    }

    public void vote(String roomCode, String playerId, String submissionId) {
        pickWinner(roomCode, playerId, submissionId);
    }
}
