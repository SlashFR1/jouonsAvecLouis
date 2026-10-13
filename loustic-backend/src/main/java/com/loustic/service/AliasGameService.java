package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.model.alias.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;

/**
 * Moteur multijoueur du jeu "Alias" (Style Codenames / Démineur Espion).
 * Implémente :
 * - 2 équipes : Équipe Rose vs Équipe Jaune
 * - 2 types de rôles par équipe : Maître Espion (Démineur) et Agents (Opérateurs de terrain)
 * - Plateau 5x5 = 25 mots (9 cartes équipe débutante, 8 cartes équipe adverse, 7 témoins neutres, 1 bombe noire)
 * - Règle stricte de Zero-Knowledge : types des cartes cachées masqués à UNKNOWN pour les clients publics
 * - Machine à états : LOBBY -> ROLE_SELECTION -> CLUE_PHASE -> GUESS_PHASE -> GAME_OVER
 * - Clic sur la bombe : défaite instantanée de l'équipe active !
 */
@Service
public class AliasGameService {

    private static final Logger log = LoggerFactory.getLogger(AliasGameService.class);

    public enum Phase {
        LOBBY,
        ROLE_SELECTION,
        CLUE_PHASE,
        GUESS_PHASE,
        SPYMASTER_CLUE,
        AGENTS_GUESSING,
        GAME_OVER
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private TeamColor activeTeam = TeamColor.ROSE;
        private TeamColor startingTeam = TeamColor.ROSE;
        private TeamColor winner = null;

        private final Map<String, AliasPlayer> players = new ConcurrentHashMap<>();

        // Cartes secrètes du plateau (25 cartes)
        private final List<AliasCard> board = new CopyOnWriteArrayList<>();

        // Cartes restantes à deviner par équipe
        private final Map<TeamColor, Integer> remainingByTeam = new ConcurrentHashMap<>();

        // Indice courant
        private AliasClue currentClue = null;
        private int guessesRemaining = 0;
        private int turnNumber = 1;
        private String lastAction = "";
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final AliasDictionaryService dictionary;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom secureRandom = new SecureRandom();

    public AliasGameService(GameRoomService rooms,
                            AliasDictionaryService dictionary,
                            SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.dictionary = dictionary;
        this.messaging = messaging;
    }

    /**
     * Démarrage depuis le lobby / sélection des rôles.
     */
    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != Phase.LOBBY) {
                return;
            }

            s.phase = Phase.ROLE_SELECTION;
            s.lastAction = "Sélection des équipes (Rose vs Jaune) et des rôles";
            syncPlayersFromRoom(room, s);

            broadcastPublicState(room, s);
        }
    }

    /**
     * Synchronisation manuelle / reconnexion d'un joueur.
     */
    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.find(roomCode).orElse(null);
        if (room == null) return;
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            syncPlayersFromRoom(room, s);
            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    /**
     * Configuration du nombre d'équipes (fixé à 2 : Rose vs Jaune).
     */
    public void setTeamsCount(String roomCode, String playerId, int count) {
        // En mode Alias officiel : 2 équipes (Rose vs Jaune)
    }

    /**
     * Un joueur choisit son équipe et son rôle.
     */
    public void joinTeam(String roomCode, String playerId, String teamStr, String roleStr) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            syncPlayersFromRoom(room, s);

            TeamColor team = TeamColor.fromString(teamStr);
            PlayerRole role = PlayerRole.fromString(roleStr);

            // Si le joueur veut être Spymaster, vérifier qu'il n'y a pas déjà un Spymaster pour cette équipe
            if (role == PlayerRole.SPYMASTER) {
                for (AliasPlayer p : s.players.values()) {
                    if (!p.id().equals(playerId) && p.team() == team && p.role() == PlayerRole.SPYMASTER) {
                        s.players.put(p.id(), p.withTeamAndRole(team, PlayerRole.OPERATOR));
                    }
                }
            }

            Player rawPlayer = room.getPlayer(playerId);
            String playerName = rawPlayer != null ? rawPlayer.name() : "Joueur";
            s.players.put(playerId, new AliasPlayer(playerId, playerName, team, role, true));
            s.lastAction = playerName + " a rejoint " + team + " (" + role + ")";

            broadcastPublicState(room, s);
        }
    }

    /**
     * Lancement effectif de la partie après choix des équipes.
     */
    public void startGame(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != Phase.ROLE_SELECTION && s.phase != Phase.LOBBY) {
                return;
            }

            initBoard(s);
            s.phase = Phase.CLUE_PHASE;
            s.currentClue = null;
            s.guessesRemaining = 0;
            s.winner = null;
            s.turnNumber = 1;
            s.lastAction = "La partie commence ! Au tour du Maître Espion de l'équipe " + s.activeTeam;

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    /**
     * Relance un nouveau plateau 5x5 sans changer les joueurs/équipes.
     */
    public void newGame(String roomCode, String playerId) {
        startGame(roomCode, playerId);
    }

    /**
     * Initialise la grille 5x5 de 25 cartes.
     */
    private void initBoard(State s) {
        List<String> boardWords = dictionary.getRandomBoardWords(25);
        if (boardWords.size() < 25) {
            log.error("Dictionnaire insuffisant pour 25 cartes, complétion automatique.");
            while (boardWords.size() < 25) {
                boardWords.add("MOT_" + (boardWords.size() + 1));
            }
        }

        // Équipe Rose commence avec 9 cartes (+1 carte d'avantage)
        s.startingTeam = TeamColor.ROSE;
        s.activeTeam = s.startingTeam;

        // 25 cartes : 9 Rose, 8 Jaune, 7 Neutres, 1 Bombe
        List<CardType> types = new ArrayList<>(25);
        for (int i = 0; i < 9; i++) types.add(CardType.TEAM_ROSE);
        for (int i = 0; i < 8; i++) types.add(CardType.TEAM_JAUNE);
        for (int i = 0; i < 7; i++) types.add(CardType.NEUTRAL);
        types.add(CardType.BOMB);

        Collections.shuffle(types, secureRandom);

        s.board.clear();
        for (int i = 0; i < 25; i++) {
            s.board.add(new AliasCard(i, boardWords.get(i), types.get(i), false));
        }

        s.remainingByTeam.put(TeamColor.ROSE, 9);
        s.remainingByTeam.put(TeamColor.JAUNE, 8);
    }

    /**
     * Soumission d'un indice par le Maître Espion de l'équipe active.
     */
    public void submitClue(String roomCode, String playerId, String clueWord, int clueCount) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || (s.phase != Phase.CLUE_PHASE && s.phase != Phase.SPYMASTER_CLUE)) return;

            AliasPlayer player = s.players.get(playerId);
            if (player == null || player.team() != s.activeTeam || player.role() != PlayerRole.SPYMASTER) {
                rooms.broadcast(room, "ALIAS_ERROR", Map.of("message", "Seul le Maître Espion de l'équipe active peut donner un indice !"));
                return;
            }

            if (clueWord == null || clueWord.trim().isEmpty()) {
                rooms.broadcast(room, "ALIAS_ERROR", Map.of("message", "Veuillez fournir un mot pour l'indice."));
                return;
            }

            String normClue = normalize(clueWord.trim());

            // Règle stricte Codenames : l'indice ne peut pas être un mot non révélé présent sur le plateau
            for (AliasCard card : s.board) {
                if (!card.revealed() && normalize(card.word()).equals(normClue)) {
                    rooms.broadcast(room, "ALIAS_ERROR", Map.of(
                            "message", "Interdit ! Le mot '" + card.word() + "' figure encore non révélé sur le plateau."
                    ));
                    return;
                }
            }

            s.currentClue = new AliasClue(clueWord.trim().toUpperCase(Locale.FRENCH), clueCount);
            // Nombre de tentatives autorisées : Nombre + 1 (ou illimité si 0/99)
            s.guessesRemaining = (clueCount <= 0 || clueCount >= 99) ? 99 : (clueCount + 1);
            s.phase = Phase.GUESS_PHASE;
            s.lastAction = "Indice donné par " + player.name() + " : '" + clueWord + "' (" + (clueCount >= 99 ? "∞" : clueCount) + ")";

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    /**
     * Un Opérateur clique sur une case de la grille pour deviner.
     */
    public void revealCard(String roomCode, String playerId, int cardId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || (s.phase != Phase.GUESS_PHASE && s.phase != Phase.AGENTS_GUESSING)) return;

            AliasPlayer player = s.players.get(playerId);
            if (player == null || player.team() != s.activeTeam || player.role() == PlayerRole.SPYMASTER) {
                rooms.broadcast(room, "ALIAS_ERROR", Map.of("message", "Seuls les Opérateurs de l'équipe active peuvent deviner !"));
                return;
            }

            if (cardId < 0 || cardId >= s.board.size()) return;
            AliasCard card = s.board.get(cardId);
            if (card.revealed()) return; // Déjà retournée

            // Retourner la carte
            AliasCard revealedCard = card.withRevealed(true);
            s.board.set(cardId, revealedCard);

            CardType cardType = card.type();
            CardType activeTeamType = toCardType(s.activeTeam);

            // 1. CARTE DE L'ÉQUIPE ACTIVE
            if (cardType == activeTeamType) {
                int left = s.remainingByTeam.getOrDefault(s.activeTeam, 1) - 1;
                s.remainingByTeam.put(s.activeTeam, left);
                s.guessesRemaining--;

                s.lastAction = player.name() + " a trouvé '" + card.word() + "' pour l'équipe " + s.activeTeam + " ! (+1 pt)";

                if (left <= 0) {
                    s.winner = s.activeTeam;
                    s.phase = Phase.GAME_OVER;
                    s.lastAction = "🎉 Victoire éclatante de l'équipe " + s.activeTeam + " ! Tous les mots ont été découverts !";
                    broadcastPublicState(room, s);
                    broadcastSpymasterState(room, s);
                    return;
                }

                if (s.guessesRemaining <= 0) {
                    nextTeamTurn(s);
                }
            }
            // 2. CARTE NEUTRE (Témoin)
            else if (cardType == CardType.NEUTRAL) {
                s.lastAction = player.name() + " est tombé sur un témoin neutre ('" + card.word() + "') ! Fin du tour.";
                nextTeamTurn(s);
            }
            // 3. CARTE D'UNE ÉQUIPE ADVERSE
            else if (cardType == CardType.TEAM_ROSE || cardType == CardType.TEAM_JAUNE || cardType == CardType.TEAM_RED || cardType == CardType.TEAM_BLUE) {
                TeamColor opponent = toTeamColor(cardType);
                if (opponent != null) {
                    int oppLeft = s.remainingByTeam.getOrDefault(opponent, 1) - 1;
                    s.remainingByTeam.put(opponent, oppLeft);
                    s.lastAction = player.name() + " a révélé un mot de l'adversaire (" + opponent + ") avec '" + card.word() + "' ! Point donné et fin du tour.";

                    if (oppLeft <= 0) {
                        s.winner = opponent;
                        s.phase = Phase.GAME_OVER;
                        s.lastAction = "🎉 L'équipe " + opponent + " remporte la partie grâce à une erreur adverse !";
                        broadcastPublicState(room, s);
                        broadcastSpymasterState(room, s);
                        return;
                    }
                }
                nextTeamTurn(s);
            }
            // 4. BOMBE (Assassin) -> DÉFAITE INSTANTANÉE !
            else if (cardType == CardType.BOMB || cardType == CardType.ASSASSIN) {
                TeamColor other = (s.activeTeam == TeamColor.ROSE) ? TeamColor.JAUNE : TeamColor.ROSE;
                s.winner = other;
                s.phase = Phase.GAME_OVER;
                s.lastAction = "💥 BOOM ! L'équipe " + s.activeTeam + " a cliqué sur la BOMBE ('" + card.word() + "') ! Victoire immédiate de l'équipe " + other + " !";
                broadcastPublicState(room, s);
                broadcastSpymasterState(room, s);
                return;
            }

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    /**
     * Fin volontaire de tour par les opérateurs.
     */
    public void endTurn(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || (s.phase != Phase.GUESS_PHASE && s.phase != Phase.AGENTS_GUESSING)) return;

            AliasPlayer player = s.players.get(playerId);
            if (player == null || player.team() != s.activeTeam || player.role() == PlayerRole.SPYMASTER) {
                rooms.broadcast(room, "ALIAS_ERROR", Map.of("message", "Seuls les Opérateurs de l'équipe active peuvent passer le tour."));
                return;
            }

            s.lastAction = player.name() + " a décidé de mettre fin au tour de son équipe.";
            nextTeamTurn(s);

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    /**
     * Passe au tour de l'autre équipe.
     */
    private void nextTeamTurn(State s) {
        s.currentClue = null;
        s.guessesRemaining = 0;
        s.phase = Phase.CLUE_PHASE;
        s.activeTeam = (s.activeTeam == TeamColor.ROSE) ? TeamColor.JAUNE : TeamColor.ROSE;
        s.turnNumber++;
    }

    /**
     * Diffusion de la projection Zero-Knowledge à tous les joueurs.
     */
    private void broadcastPublicState(GameRoom room, State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("phase", s.phase.name());
        payload.put("activeTeam", s.activeTeam.name());
        payload.put("startingTeam", s.startingTeam.name());
        payload.put("winner", s.winner != null ? s.winner.name() : null);
        payload.put("turnNumber", s.turnNumber);
        payload.put("lastAction", s.lastAction);

        // Zero-knowledge projection : cartes non révélées masquées à UNKNOWN
        List<PublicCardDTO> publicCards = s.board.stream()
                .map(PublicCardDTO::fromCard)
                .toList();
        payload.put("cards", publicCards);

        // Scores / Cartes restantes
        Map<String, Integer> remMap = new LinkedHashMap<>();
        s.remainingByTeam.forEach((k, v) -> remMap.put(k.name(), v));
        payload.put("remainingByTeam", remMap);

        // Indice courant
        if (s.currentClue != null) {
            payload.put("clueWord", s.currentClue.word());
            payload.put("clueCount", s.currentClue.count());
            payload.put("guessesRemaining", s.guessesRemaining);
        } else {
            payload.put("clueWord", null);
            payload.put("clueCount", 0);
            payload.put("guessesRemaining", 0);
        }

        // Joueurs et rôles
        payload.put("players", s.players.values());

        rooms.broadcast(room, "ALIAS_STATE_UPDATED", payload);
    }

    /**
     * Diffusion de la projection secrète du Maître Espion.
     */
    private void broadcastSpymasterState(GameRoom room, State s) {
        Map<String, Object> payload = createSpymasterPayload(s);
        messaging.convertAndSend("/topic/alias/" + room.getCode() + "/spymaster", payload);
        messaging.convertAndSend("/topic/room/" + room.getCode() + "/alias/spymaster", payload);
    }

    private Map<String, Object> createSpymasterPayload(State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("fullCards", s.board); // Cartes complètes avec tous les vrais types
        payload.put("activeTeam", s.activeTeam.name());
        payload.put("phase", s.phase.name());
        return payload;
    }

    private void syncPlayersFromRoom(GameRoom room, State s) {
        for (Player p : room.getPlayers()) {
            s.players.computeIfAbsent(p.id(), id -> {
                int count = s.players.size();
                TeamColor defaultTeam = (count % 2 == 0) ? TeamColor.ROSE : TeamColor.JAUNE;
                return new AliasPlayer(p.id(), p.name(), defaultTeam, PlayerRole.OPERATOR, false);
            });
        }
    }

    private CardType toCardType(TeamColor color) {
        if (color == null) return CardType.TEAM_ROSE;
        return switch (color) {
            case ROSE, RED -> CardType.TEAM_ROSE;
            case JAUNE, BLUE -> CardType.TEAM_JAUNE;
        };
    }

    private TeamColor toTeamColor(CardType type) {
        if (type == null) return null;
        return switch (type) {
            case TEAM_ROSE, TEAM_RED -> TeamColor.ROSE;
            case TEAM_JAUNE, TEAM_BLUE -> TeamColor.JAUNE;
            default -> null;
        };
    }

    private static String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input.trim().toUpperCase(Locale.FRENCH), Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
    }
}
