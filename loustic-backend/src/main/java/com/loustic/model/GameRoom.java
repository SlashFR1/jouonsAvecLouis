package com.loustic.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Salle de jeu partagée entre plusieurs téléphones.
 * Toutes les mutations passent par {@link com.loustic.service.GameRoomService} qui synchronise sur l'instance.
 */
public class GameRoom {

    private final String code;
    private final String gameKey;
    private String hostId;
    private final Map<String, Player> players = new LinkedHashMap<>();
    private Instant lastActivity = Instant.now();

    public GameRoom(String code, String gameKey, Player host) {
        this.code = code;
        this.gameKey = gameKey;
        this.hostId = host.id();
        this.players.put(host.id(), host);
    }

    public String getCode() { return code; }
    public String getGameKey() { return gameKey; }
    public String getHostId() { return hostId; }
    public Instant getLastActivity() { return lastActivity; }

    public void touch() { lastActivity = Instant.now(); }

    public List<Player> getPlayers() { return new ArrayList<>(players.values()); }

    public boolean hasPlayer(String playerId) { return players.containsKey(playerId); }

    public int playerCount() { return players.size(); }

    public void putPlayer(Player p) { players.put(p.id(), p); }

    /** Retire un joueur et transfère l'hôte si nécessaire. */
    public void removePlayer(String playerId) {
        players.remove(playerId);
        if (playerId.equals(hostId) && !players.isEmpty()) {
            hostId = players.keySet().iterator().next();
        }
    }

    public Player getPlayer(String playerId) { return players.get(playerId); }

    /** Joueur suivant dans l'ordre d'arrivée (boucle). */
    public Player nextPlayerAfter(String playerId) {
        List<Player> list = getPlayers();
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).id().equals(playerId)) {
                return list.get((i + 1) % list.size());
            }
        }
        return list.isEmpty() ? null : list.get(0);
    }

    public RoomView toView() {
        return new RoomView(code, gameKey, hostId, getPlayers());
    }

    /** Représentation JSON publique de la salle. */
    public record RoomView(String code, String gameKey, String hostId, List<Player> players) {}
}
