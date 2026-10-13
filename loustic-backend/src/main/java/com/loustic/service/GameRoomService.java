package com.loustic.service;

import com.loustic.config.LousticProperties;
import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.model.RoomEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

/**
 * Gestion des salles en mémoire : création, arrivée/départ des joueurs, diffusion des événements.
 */
@Service
public class GameRoomService {

    private static final Logger log = LoggerFactory.getLogger(GameRoomService.class);
    // Sans I, O, 0, 1 pour éviter les confusions à l'oral
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 5;

    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final SimpMessagingTemplate messaging;
    private final LousticProperties props;
    private final CopyOnWriteArrayList<Consumer<String>> roomClosedListeners = new CopyOnWriteArrayList<>();

    public GameRoomService(SimpMessagingTemplate messaging, LousticProperties props) {
        this.messaging = messaging;
        this.props = props;
    }

    public GameRoom createRoom(String gameKey, Player host) {
        validatePlayer(host);
        if (gameKey == null || gameKey.isBlank()) throw GameExceptions.badRequest("gameKey requis");
        String code;
        do {
            code = randomCode();
        } while (rooms.containsKey(code));
        GameRoom room = new GameRoom(code, gameKey, host);
        rooms.put(code, room);
        log.info("🏠 Salle {} créée pour '{}' par {}", code, gameKey, host.name());
        return room;
    }

    public GameRoom join(String code, Player player) {
        validatePlayer(player);
        GameRoom room = require(code);
        synchronized (room) {
            if (!room.hasPlayer(player.id()) && room.playerCount() >= props.rooms().maxPlayers()) {
                throw GameExceptions.roomFull(room.getCode());
            }
            room.putPlayer(player); // idempotent : une reconnexion met juste le nom à jour
            room.touch();
        }
        broadcast(room, "ROOM_UPDATED", Map.of());
        return room;
    }

    public void leave(String code, String playerId) {
        find(code).ifPresent(room -> {
            boolean empty;
            synchronized (room) {
                room.removePlayer(playerId);
                room.touch();
                empty = room.playerCount() == 0;
            }
            if (empty) {
                close(room.getCode());
            } else {
                broadcast(room, "ROOM_UPDATED", Map.of("leftPlayerId", playerId));
            }
        });
    }

    public Optional<GameRoom> find(String code) {
        return code == null ? Optional.empty() : Optional.ofNullable(rooms.get(code.toUpperCase()));
    }

    public GameRoom require(String code) {
        return find(code).orElseThrow(() -> GameExceptions.roomNotFound(code));
    }

    /** Diffuse un événement à tous les téléphones de la salle. */
    public void broadcast(GameRoom room, String type, Map<String, Object> payload) {
        room.touch();
        messaging.convertAndSend("/topic/room/" + room.getCode(), new RoomEvent(type, room.toView(), payload));
    }

    /** Permet aux moteurs de jeu (ex: bombe) de libérer leurs ressources quand une salle disparaît. */
    public void onRoomClosed(Consumer<String> listener) {
        roomClosedListeners.add(listener);
    }

    private void close(String code) {
        if (rooms.remove(code) != null) {
            roomClosedListeners.forEach(l -> l.accept(code));
            log.info("🧹 Salle {} fermée", code);
        }
    }

    /** Nettoyage des salles abandonnées (toutes les 5 minutes). */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void purgeIdleRooms() {
        Instant limit = Instant.now().minus(Duration.ofMinutes(props.rooms().idleTimeoutMinutes()));
        rooms.values().stream()
                .filter(r -> r.getLastActivity().isBefore(limit))
                .map(GameRoom::getCode)
                .toList()
                .forEach(this::close);
    }

    public int roomCount() {
        return rooms.size();
    }

    private void validatePlayer(Player p) {
        if (p == null || p.id() == null || p.id().isBlank() || p.name() == null || p.name().isBlank()) {
            throw GameExceptions.badRequest("playerId et playerName requis");
        }
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
