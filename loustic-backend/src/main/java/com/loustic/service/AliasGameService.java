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
 * Supporte :
 * 1. Mode 2 Équipes (Bleu vs Rouge) :
 *    - 4 téléphones : 1 Master Bleu, 1 Agent Bleu, 1 Master Rouge, 1 Agent Rouge.
 *    - Grille de 20 cartes : 5 colonnes × 4 lignes.
 *    - Distribution : 7 Bleu (active), 6 Rouge, 1 Assassin, 6 Neutres.
 * 2. Mode 3 Équipes (Bleu vs Rouge vs Vert) :
 *    - 6 téléphones : 1 Master et 1 Agent par équipe.
 *    - Grille de 30 cartes : 6 colonnes × 5 lignes.
 *    - Distribution : 7 Bleu (active), 6 Rouge, 6 Vert, 1 Assassin, 10 Neutres.
 * Règle stricte de Zero-Knowledge : types des cartes cachées masqués à NULL côté public/agents.
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

    public enum Mode {
        TWO_TEAMS(20, 5, 4, 4),
        THREE_TEAMS(30, 6, 5, 6);

        public final int totalCards;
        public final int columns;
        public final int rows;
        public final int requiredPlayers;

        Mode(int totalCards, int columns, int rows, int requiredPlayers) {
            this.totalCards = totalCards;
            this.columns = columns;
            this.rows = rows;
            this.requiredPlayers = requiredPlayers;
        }

        public static Mode fromCount(int count) {
            return count == 3 ? THREE_TEAMS : TWO_TEAMS;
        }

        public static Mode fromString(String val) {
            if (val == null) return TWO_TEAMS;
            String upper = val.trim().toUpperCase();
            if (upper.contains("3") || upper.contains("THREE")) return THREE_TEAMS;
            return TWO_TEAMS;
        }
    }

    public static final class Slot {
        private final TeamColor team;
        private final PlayerRole role;
        private String playerId;
        private String playerName;

        public Slot(TeamColor team, PlayerRole role) {
            this.team = team;
            this.role = role;
        }

        public synchronized boolean claim(String pid, String name) {
            if (this.playerId != null && !this.playerId.equals(pid)) {
                return false;
            }
            this.playerId = pid;
            this.playerName = name;
            return true;
        }

        public synchronized void release() {
            this.playerId = null;
            this.playerName = null;
        }

        public boolean isOccupied() {
            return this.playerId != null;
        }

        public TeamColor getTeam() { return team; }
        public PlayerRole getRole() { return role; }
        public String getPlayerId() { return playerId; }
        public String getPlayerName() { return playerName; }
    }

    public static final class State {
        private Phase phase = Phase.LOBBY;
        private Mode mode = Mode.TWO_TEAMS;
        private TeamColor activeTeam = TeamColor.BLUE;
        private TeamColor startingTeam = TeamColor.BLUE;
        private TeamColor winner = null;

        private final List<TeamColor> turnOrder = new CopyOnWriteArrayList<>();
        private int activeTeamIndex = 0;

        private final List<Slot> slots = new CopyOnWriteArrayList<>();
        private final Map<String, AliasPlayer> players = new ConcurrentHashMap<>();

        // Cartes secrètes du plateau (20 ou 30 cartes)
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

    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != Phase.LOBBY) {
                return;
            }

            s.phase = Phase.ROLE_SELECTION;
            s.lastAction = "Sélection des équipes et des rôles";
            initSlots(s);
            syncPlayersFromRoom(room, s);

            broadcastPublicState(room, s);
        }
    }

    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.find(roomCode).orElse(null);
        if (room == null) return;
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (s.slots.isEmpty()) {
                initSlots(s);
            }
            syncPlayersFromRoom(room, s);
            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    public void setTeamsCount(String roomCode, String playerId, int count) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId())) return;

            s.mode = Mode.fromCount(count);
            initSlots(s);
            s.lastAction = "Mode configuré : " + (s.mode == Mode.THREE_TEAMS ? "3 Équipes (6 joueurs, 30 cartes)" : "2 Équipes (4 joueurs, 20 cartes)");
            broadcastPublicState(room, s);
        }
    }

    public void joinTeam(String roomCode, String playerId, String teamStr, String roleStr) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (s.slots.isEmpty()) {
                initSlots(s);
            }

            TeamColor team = TeamColor.fromString(teamStr);
            PlayerRole role = PlayerRole.fromString(roleStr);

            // Vérifier validité pour le mode 2 équipes
            if (s.mode == Mode.TWO_TEAMS && team == TeamColor.GREEN) {
                team = TeamColor.BLUE;
            }

            Player rawPlayer = room.getPlayer(playerId);
            String playerName = rawPlayer != null ? rawPlayer.name() : "Joueur";

            // Libérer l'ancien slot du joueur
            for (Slot slot : s.slots) {
                if (playerId.equals(slot.getPlayerId())) {
                    slot.release();
                }
            }

            // Réclamer le nouveau slot exclusif
            boolean claimed = false;
            for (Slot slot : s.slots) {
                if (slot.getTeam() == team && slot.getRole() == role) {
                    claimed = slot.claim(playerId, playerName);
                    break;
                }
            }

            if (claimed) {
                s.players.put(playerId, new AliasPlayer(playerId, playerName, team, role, true));
                s.lastAction = playerName + " a pris le slot " + team + " (" + role + ")";
            }

            broadcastPublicState(room, s);
        }
    }

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
            s.activeTeam = s.turnOrder.get(0);
            s.activeTeamIndex = 0;
            s.lastAction = "La partie commence ! Au tour du Maître Espion de l'équipe " + s.activeTeam;

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    public void newGame(String roomCode, String playerId) {
        startGame(roomCode, playerId);
    }

    private void initSlots(State s) {
        s.slots.clear();
        s.turnOrder.clear();

        s.turnOrder.add(TeamColor.BLUE);
        s.turnOrder.add(TeamColor.RED);
        if (s.mode == Mode.THREE_TEAMS) {
            s.turnOrder.add(TeamColor.GREEN);
        }

        for (TeamColor t : s.turnOrder) {
            s.slots.add(new Slot(t, PlayerRole.SPYMASTER));
            s.slots.add(new Slot(t, PlayerRole.OPERATOR));
        }
    }

    private void initBoard(State s) {
        int total = s.mode.totalCards;
        List<String> boardWords = dictionary.getRandomBoardWords(total);
        if (boardWords.size() < total) {
            log.warn("Dictionnaire insuffisant pour {} cartes, complétion automatique.", total);
            while (boardWords.size() < total) {
                boardWords.add("MOT_" + (boardWords.size() + 1));
            }
        }

        s.startingTeam = TeamColor.BLUE;
        s.activeTeam = s.startingTeam;

        List<CardType> types = new ArrayList<>(total);

        if (s.mode == Mode.TWO_TEAMS) {
            // Mode 2 Équipes (20 cartes) : 7 Bleu, 6 Rouge, 1 Assassin, 6 Neutres
            for (int i = 0; i < 7; i++) types.add(CardType.TEAM_BLUE);
            for (int i = 0; i < 6; i++) types.add(CardType.TEAM_RED);
            types.add(CardType.ASSASSIN);
            for (int i = 0; i < 6; i++) types.add(CardType.NEUTRAL);

            s.remainingByTeam.put(TeamColor.BLUE, 7);
            s.remainingByTeam.put(TeamColor.RED, 6);
            s.remainingByTeam.remove(TeamColor.GREEN);
        } else {
            // Mode 3 Équipes (30 cartes) : 7 Bleu, 6 Rouge, 6 Vert, 1 Assassin, 10 Neutres
            for (int i = 0; i < 7; i++) types.add(CardType.TEAM_BLUE);
            for (int i = 0; i < 6; i++) types.add(CardType.TEAM_RED);
            for (int i = 0; i < 6; i++) types.add(CardType.TEAM_GREEN);
            types.add(CardType.ASSASSIN);
            for (int i = 0; i < 10; i++) types.add(CardType.NEUTRAL);

            s.remainingByTeam.put(TeamColor.BLUE, 7);
            s.remainingByTeam.put(TeamColor.RED, 6);
            s.remainingByTeam.put(TeamColor.GREEN, 6);
        }

        Collections.shuffle(types, secureRandom);

        s.board.clear();
        for (int i = 0; i < total; i++) {
            s.board.add(new AliasCard(i, boardWords.get(i), types.get(i), false));
        }
    }

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

            int count = Math.max(1, Math.min(9, clueCount));
            String normClue = normalize(clueWord.trim());

            for (AliasCard card : s.board) {
                if (!card.revealed() && normalize(card.word()).equals(normClue)) {
                    rooms.broadcast(room, "ALIAS_ERROR", Map.of(
                            "message", "Interdit ! Le mot '" + card.word() + "' figure encore non révélé sur le plateau."
                    ));
                    return;
                }
            }

            s.currentClue = new AliasClue(clueWord.trim().toUpperCase(Locale.FRENCH), count);
            s.guessesRemaining = count + 1; // Règle N + 1
            s.phase = Phase.GUESS_PHASE;
            s.lastAction = "Indice donné par " + player.name() + " : '" + clueWord.trim().toUpperCase(Locale.FRENCH) + "' (" + count + ")";

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

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
            if (card.revealed()) return;

            AliasCard revealedCard = card.withRevealed(true);
            s.board.set(cardId, revealedCard);

            CardType cardType = card.type();
            CardType activeTeamType = toCardType(s.activeTeam);

            // 1. CARTE DE L'ÉQUIPE ACTIVE
            if (cardType == activeTeamType) {
                int left = s.remainingByTeam.getOrDefault(s.activeTeam, 1) - 1;
                s.remainingByTeam.put(s.activeTeam, left);
                s.guessesRemaining--;

                s.lastAction = player.name() + " a trouvé '" + card.word() + "' pour l'équipe " + s.activeTeam + " !";

                if (left <= 0) {
                    s.winner = s.activeTeam;
                    s.phase = Phase.GAME_OVER;
                    s.lastAction = "Victoire éclatante de l'équipe " + s.activeTeam + " ! Tous les mots ont été découverts !";
                    broadcastPublicState(room, s);
                    broadcastSpymasterState(room, s);
                    return;
                }

                if (s.guessesRemaining <= 0) {
                    nextTeamTurn(s);
                }
            }
            // 2. CARTE NEUTRE
            else if (cardType == CardType.NEUTRAL) {
                s.lastAction = player.name() + " a choisi un témoin neutre ('" + card.word() + "'). Fin du tour.";
                nextTeamTurn(s);
            }
            // 3. CARTE ADVERSE
            else if (isOpponentCard(cardType)) {
                TeamColor opponent = toTeamColor(cardType);
                if (opponent != null) {
                    int oppLeft = s.remainingByTeam.getOrDefault(opponent, 1) - 1;
                    s.remainingByTeam.put(opponent, oppLeft);
                    s.lastAction = player.name() + " a révélé un mot adverse (" + opponent + " : '" + card.word() + "') ! Fin du tour.";

                    if (oppLeft <= 0) {
                        s.winner = opponent;
                        s.phase = Phase.GAME_OVER;
                        s.lastAction = "L'équipe " + opponent + " remporte la partie !";
                        broadcastPublicState(room, s);
                        broadcastSpymasterState(room, s);
                        return;
                    }
                }
                nextTeamTurn(s);
            }
            // 4. ASSASSIN / BOMBE
            else if (cardType == CardType.BOMB || cardType == CardType.ASSASSIN) {
                handleAssassinTriggered(s);
                return;
            }

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    private void handleAssassinTriggered(State s) {
        s.phase = Phase.GAME_OVER;
        if (s.mode == Mode.TWO_TEAMS) {
            TeamColor other = (s.activeTeam == TeamColor.BLUE) ? TeamColor.RED : TeamColor.BLUE;
            s.winner = other;
            s.lastAction = "L'équipe " + s.activeTeam + " a touché l'ASSASSIN ! Victoire immédiate de l'équipe " + other + " !";
        } else {
            // 3 Équipes : l'équipe ayant le moins de mots restants parmi les 2 autres l'emporte
            TeamColor leader = null;
            int minLeft = Integer.MAX_VALUE;
            for (TeamColor t : s.turnOrder) {
                if (t != s.activeTeam) {
                    int left = s.remainingByTeam.getOrDefault(t, 6);
                    if (left < minLeft) {
                        minLeft = left;
                        leader = t;
                    }
                }
            }
            s.winner = leader != null ? leader : TeamColor.BLUE;
            s.lastAction = "L'équipe " + s.activeTeam + " a touché l'ASSASSIN ! Victoire attribuée à l'équipe " + s.winner + " !";
        }
    }

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

            s.lastAction = player.name() + " a passé la main.";
            nextTeamTurn(s);

            broadcastPublicState(room, s);
            broadcastSpymasterState(room, s);
        }
    }

    private void nextTeamTurn(State s) {
        s.currentClue = null;
        s.guessesRemaining = 0;
        s.phase = Phase.CLUE_PHASE;
        s.activeTeamIndex = (s.activeTeamIndex + 1) % s.turnOrder.size();
        s.activeTeam = s.turnOrder.get(s.activeTeamIndex);
        s.turnNumber++;
    }

    private void broadcastPublicState(GameRoom room, State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("phase", s.phase.name());
        payload.put("gameMode", s.mode.name());
        payload.put("columns", s.mode.columns);
        payload.put("rows", s.mode.rows);
        payload.put("totalCards", s.mode.totalCards);
        payload.put("requiredPlayers", s.mode.requiredPlayers);
        payload.put("activeTeam", s.activeTeam.name());
        payload.put("startingTeam", s.startingTeam.name());
        payload.put("winner", s.winner != null ? s.winner.name() : null);
        payload.put("turnNumber", s.turnNumber);
        payload.put("lastAction", s.lastAction);

        // Strict Zero-Knowledge : color et type sont STRICTEMENT null si !revealed
        List<PublicCardDTO> publicCards = s.board.stream()
                .map(PublicCardDTO::fromCard)
                .toList();
        payload.put("cards", publicCards);

        Map<String, Integer> remMap = new LinkedHashMap<>();
        s.remainingByTeam.forEach((k, v) -> remMap.put(k.name(), v));
        payload.put("remainingByTeam", remMap);

        if (s.currentClue != null) {
            payload.put("clueWord", s.currentClue.word());
            payload.put("clueCount", s.currentClue.count());
            payload.put("guessesRemaining", s.guessesRemaining);
        } else {
            payload.put("clueWord", null);
            payload.put("clueCount", 0);
            payload.put("guessesRemaining", 0);
        }

        payload.put("players", s.players.values());

        List<Map<String, Object>> slotList = new ArrayList<>();
        for (Slot slot : s.slots) {
            slotList.add(Map.of(
                    "team", slot.getTeam().name(),
                    "role", slot.getRole().name(),
                    "occupied", slot.isOccupied(),
                    "playerId", slot.getPlayerId() != null ? slot.getPlayerId() : "",
                    "playerName", slot.getPlayerName() != null ? slot.getPlayerName() : ""
            ));
        }
        payload.put("slots", slotList);
        payload.put("allSlotsOccupied", s.slots.size() >= s.mode.requiredPlayers && s.slots.stream().allMatch(Slot::isOccupied));

        rooms.broadcast(room, "ALIAS_STATE_UPDATED", payload);
    }

    private void broadcastSpymasterState(GameRoom room, State s) {
        Map<String, Object> payload = createSpymasterPayload(s);
        messaging.convertAndSend("/topic/alias/" + room.getCode() + "/spymaster", payload);
        messaging.convertAndSend("/topic/room/" + room.getCode() + "/alias/spymaster", payload);
    }

    private Map<String, Object> createSpymasterPayload(State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("fullCards", s.board);
        payload.put("activeTeam", s.activeTeam.name());
        payload.put("phase", s.phase.name());
        payload.put("gameMode", s.mode.name());
        payload.put("remainingByTeam", s.remainingByTeam);

        // Sections catégorisées précalculées pour chaque équipe
        Map<String, Object> teamCategorized = new LinkedHashMap<>();
        for (TeamColor t : s.turnOrder) {
            CardType teamType = toCardType(t);
            List<AliasCard> myWords = s.board.stream().filter(c -> c.type() == teamType).toList();
            List<AliasCard> assassin = s.board.stream().filter(c -> c.type() == CardType.ASSASSIN || c.type() == CardType.BOMB).toList();
            List<AliasCard> neutral = s.board.stream().filter(c -> c.type() == CardType.NEUTRAL).toList();

            Map<String, List<AliasCard>> oppMap = new LinkedHashMap<>();
            for (TeamColor opp : s.turnOrder) {
                if (opp != t) {
                    oppMap.put(opp.name(), s.board.stream().filter(c -> c.type() == toCardType(opp)).toList());
                }
            }

            teamCategorized.put(t.name(), Map.of(
                    "myWords", myWords,
                    "assassin", assassin,
                    "neutrals", neutral,
                    "opponents", oppMap,
                    "remaining", myWords.stream().filter(c -> !c.revealed()).count()
            ));
        }
        payload.put("teamViews", teamCategorized);

        return payload;
    }

    private void syncPlayersFromRoom(GameRoom room, State s) {
        for (Player p : room.getPlayers()) {
            s.players.computeIfAbsent(p.id(), id -> new AliasPlayer(p.id(), p.name(), TeamColor.BLUE, PlayerRole.OPERATOR, false));
        }
    }

    private CardType toCardType(TeamColor color) {
        if (color == null) return CardType.TEAM_BLUE;
        return switch (color) {
            case BLUE, JAUNE -> CardType.TEAM_BLUE;
            case RED, ROSE -> CardType.TEAM_RED;
            case GREEN -> CardType.TEAM_GREEN;
        };
    }

    private TeamColor toTeamColor(CardType type) {
        if (type == null) return null;
        return switch (type) {
            case TEAM_BLUE, TEAM_JAUNE -> TeamColor.BLUE;
            case TEAM_RED, TEAM_ROSE -> TeamColor.RED;
            case TEAM_GREEN -> TeamColor.GREEN;
            default -> null;
        };
    }

    private boolean isOpponentCard(CardType type) {
        return type == CardType.TEAM_BLUE || type == CardType.TEAM_RED || type == CardType.TEAM_GREEN
                || type == CardType.TEAM_ROSE || type == CardType.TEAM_JAUNE;
    }

    private static String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input.trim().toUpperCase(Locale.FRENCH), Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
    }
}
