package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Moteur La Taupe (Undercover / Déduction sociale) multi-téléphones :
 * - Mot de la majorité (Foule) et mot de la Taupe tirés de lataupe_words.csv
 * - 1 Taupe désignée (et 1 Fantôme sans mot si >= 6 joueurs)
 * - Chaque téléphone affiche son mot secret
 * - Phase d'indices & débat
 * - Phase de vote en direct : chaque joueur vote pour qui est la taupe
 * - Révélation des votes et du rôle de la taupe !
 */
@Service
public class LaTaupeGameService {

    public enum Phase { LOBBY, ROLES, DISCUSSION, VOTING, RESULTS }

    public static final class State {
        Phase phase = Phase.LOBBY;
        String majorityWord = "";
        String moleWord = "";
        String molePlayerId = "";
        String ghostPlayerId = "";
        Map<String, String> playerRoles = new ConcurrentHashMap<>(); // INNOCENT, TAUPE, FANTOME
        Map<String, String> playerWords = new ConcurrentHashMap<>(); // Mot affiché sur le téléphone
        Map<String, String> votes = new ConcurrentHashMap<>(); // voterId -> suspectedId
        String unmaskedPlayerId = "";
        boolean moleWon = false;
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final CsvDataLoaderService decks;

    public LaTaupeGameService(GameRoomService rooms, CsvDataLoaderService decks) {
        this.rooms = rooms;
        this.decks = decks;
        rooms.onRoomClosed(games::remove);
    }

    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) return;
            if (room.playerCount() < 3) {
                rooms.broadcast(room, "TAUPE_ERROR", Map.of("message", "Il faut au moins 3 joueurs pour démasquer la taupe !"));
                return;
            }

            State s = games.computeIfAbsent(roomCode, k -> new State());
            s.votes.clear();

            // Tirer un mot depuis lataupe_words.csv
            Optional<Map<String, String>> cardOpt = decks.randomCard("lataupe_words");
            if (cardOpt.isPresent()) {
                Map<String, String> card = cardOpt.get();
                s.majorityWord = card.getOrDefault("mot_majorite", card.getOrDefault("mainWord", "Chocolat"));
                String taupeStr = card.getOrDefault("mots_taupe", card.getOrDefault("moleWord", "Café"));
                String[] taupeWords = taupeStr.split("\\|");
                s.moleWord = taupeWords[ThreadLocalRandom.current().nextInt(taupeWords.length)];
            } else {
                s.majorityWord = "Chocolat";
                s.moleWord = "Café";
            }

            // Attribuer les rôles
            List<Player> players = new ArrayList<>(room.getPlayers());
            Collections.shuffle(players, ThreadLocalRandom.current());

            s.molePlayerId = players.get(0).id();
            s.ghostPlayerId = players.size() >= 6 ? players.get(1).id() : "";

            s.playerRoles.clear();
            s.playerWords.clear();

            for (Player p : room.getPlayers()) {
                if (p.id().equals(s.molePlayerId)) {
                    s.playerRoles.put(p.id(), "TAUPE");
                    s.playerWords.put(p.id(), s.moleWord);
                } else if (p.id().equals(s.ghostPlayerId)) {
                    s.playerRoles.put(p.id(), "FANTOME");
                    s.playerWords.put(p.id(), "👻 Tu es le Fantôme (aucun mot !)");
                } else {
                    s.playerRoles.put(p.id(), "INNOCENT");
                    s.playerWords.put(p.id(), s.majorityWord);
                }
            }

            s.phase = Phase.ROLES;
            rooms.broadcast(room, "TAUPE_GAME_STARTED", snapshot(s));
        }
    }

    public void startDiscussion(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            s.phase = Phase.DISCUSSION;
            rooms.broadcast(room, "TAUPE_DISCUSSION_PHASE", snapshot(s));
        }
    }

    public void startVoting(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            s.phase = Phase.VOTING;
            s.votes.clear();
            rooms.broadcast(room, "TAUPE_VOTING_PHASE", snapshot(s));
        }
    }

    public void vote(String roomCode, String playerId, String suspectedPlayerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.VOTING) return;

            s.votes.put(playerId, suspectedPlayerId);

            if (s.votes.size() >= room.playerCount()) {
                // Dépouillement
                Map<String, Integer> counts = new HashMap<>();
                for (String suspect : s.votes.values()) {
                    counts.put(suspect, counts.getOrDefault(suspect, 0) + 1);
                }

                String accused = counts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("");

                s.unmaskedPlayerId = accused;
                s.moleWon = !accused.equals(s.molePlayerId);
                s.phase = Phase.RESULTS;
                rooms.broadcast(room, "TAUPE_RESULTS", snapshot(s));
            } else {
                rooms.broadcast(room, "TAUPE_VOTE_CAST", snapshot(s));
            }
        }
    }

    private Map<String, Object> snapshot(State s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("majorityWord", s.majorityWord);
        m.put("moleWord", s.moleWord);
        m.put("molePlayerId", s.molePlayerId);
        m.put("ghostPlayerId", s.ghostPlayerId);
        m.put("playerRoles", s.playerRoles);
        m.put("playerWords", s.playerWords);
        m.put("votes", s.votes);
        m.put("unmaskedPlayerId", s.unmaskedPlayerId);
        m.put("moleWon", s.moleWon);
        return m;
    }
}
