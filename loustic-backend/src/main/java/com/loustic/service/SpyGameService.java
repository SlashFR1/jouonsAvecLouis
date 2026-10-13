package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Moteur SPY (Spyfall) multi-téléphones :
 * - Lieu secret tiré de spy_locations.csv
 * - 1 Espion désigné aléatoirement
 * - Les innocents voient le lieu ("Sous-marin"), l'espion voit "🕵️ Tu es l'Espion !"
 * - Chronomètre de débat / questions
 * - Vote en direct pour démasquer l'espion
 */
@Service
public class SpyGameService {

    public enum Phase { LOBBY, ROLES, DISCUSSION, VOTING, RESULTS }

    public static final class State {
        Phase phase = Phase.LOBBY;
        String location = "";
        String spyPlayerId = "";
        Map<String, String> playerDisplays = new ConcurrentHashMap<>();
        Map<String, String> votes = new ConcurrentHashMap<>();
        String accusedPlayerId = "";
        boolean spyUnmasked = false;
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final CsvDataLoaderService decks;

    public SpyGameService(GameRoomService rooms, CsvDataLoaderService decks) {
        this.rooms = rooms;
        this.decks = decks;
        rooms.onRoomClosed(games::remove);
    }

    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && games.containsKey(roomCode)) return;
            if (room.playerCount() < 3) {
                rooms.broadcast(room, "SPY_ERROR", Map.of("message", "Il faut au moins 3 joueurs pour jouer à SPY !"));
                return;
            }

            State s = games.computeIfAbsent(roomCode, k -> new State());
            s.votes.clear();

            // Tirage du lieu
            s.location = decks.randomCard("spy_locations")
                    .map(c -> c.get("lieu"))
                    .orElse("Sous-marin");

            // Choix de l'espion
            List<Player> players = new ArrayList<>(room.getPlayers());
            Collections.shuffle(players, ThreadLocalRandom.current());
            s.spyPlayerId = players.get(0).id();

            s.playerDisplays.clear();
            for (Player p : room.getPlayers()) {
                if (p.id().equals(s.spyPlayerId)) {
                    s.playerDisplays.put(p.id(), "🕵️ TU ES L'ESPION ! (Devine le lieu)");
                } else {
                    s.playerDisplays.put(p.id(), s.location);
                }
            }

            s.phase = Phase.ROLES;
            rooms.broadcast(room, "SPY_GAME_STARTED", snapshot(s));
        }
    }

    public void startDiscussion(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            s.phase = Phase.DISCUSSION;
            rooms.broadcast(room, "SPY_DISCUSSION_PHASE", snapshot(s));
        }
    }

    public void startVoting(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            s.phase = Phase.VOTING;
            s.votes.clear();
            rooms.broadcast(room, "SPY_VOTING_PHASE", snapshot(s));
        }
    }

    public void vote(String roomCode, String playerId, String suspectedSpyId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != Phase.VOTING) return;

            s.votes.put(playerId, suspectedSpyId);

            if (s.votes.size() >= room.playerCount()) {
                Map<String, Integer> counts = new HashMap<>();
                for (String suspect : s.votes.values()) {
                    counts.put(suspect, counts.getOrDefault(suspect, 0) + 1);
                }

                String accused = counts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("");

                s.accusedPlayerId = accused;
                s.spyUnmasked = accused.equals(s.spyPlayerId);
                s.phase = Phase.RESULTS;
                rooms.broadcast(room, "SPY_RESULTS", snapshot(s));
            } else {
                rooms.broadcast(room, "SPY_VOTE_CAST", snapshot(s));
            }
        }
    }

    private Map<String, Object> snapshot(State s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("location", s.location);
        m.put("spyPlayerId", s.spyPlayerId);
        m.put("playerDisplays", s.playerDisplays);
        m.put("votes", s.votes);
        m.put("accusedPlayerId", s.accusedPlayerId);
        m.put("spyUnmasked", s.spyUnmasked);
        return m;
    }
}
