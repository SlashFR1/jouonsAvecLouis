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
 * <h3>GameRoomService</h3>
 * <p>
 * Service pivot orchestrant le cycle de vie des salles multijoueurs en mémoire :
 * création, adhésion des participants, départs, purge automatique d'inactivité et diffusion d'événements STOMP.
 * </p>
 *
 * <h4>Concurrence et Thread-Safety</h4>
 * <ul>
 *   <li>Les salles actives sont stockées dans une {@link ConcurrentHashMap} thread-safe indexée par leur code à 5 caractères.</li>
 *   <li>Toute modification sur les joueurs d'une salle (adhésion, retrait, mise à jour) est protégée par un verrou
 *       intrinsèque sur l'instance {@link GameRoom} correspondante.</li>
 *   <li>Les listeners de fermeture de salle utilisent une {@link CopyOnWriteArrayList} pour garantir l'absence de {@link java.util.ConcurrentModificationException}.</li>
 * </ul>
 *
 * @author Loustic Core Team
 * @see GameRoom
 * @see RoomEvent
 */
@Service
public class GameRoomService {

    private static final Logger log = LoggerFactory.getLogger(GameRoomService.class);
    // Alphabet sans I, O, 0, 1 pour éviter les confusions visuelles et orales
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

    /**
     * Crée une nouvelle salle de jeu en mémoire avec un code unique non ambigu de 5 caractères.
     *
     * @param gameKey identifiant unique du jeu choisi (ex: 'motus', 'bomb', 'classemoica')
     * @param host    joueur créateur devenant l'hôte de la salle
     * @return la nouvelle instance de {@link GameRoom} initialisée
     * @throws IllegalArgumentException si les paramètres sont invalides ou vides
     */
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

    /**
     * Rejoint une salle existante de manière idempotente (met à jour le nom si le joueur est déjà présent).
     *
     * @param code   code alphanumérique de la salle
     * @param player joueur souhaitant rejoindre la partie
     * @return l'instance de {@link GameRoom} mise à jour
     * @throws IllegalArgumentException si la salle est introuvable ou si le nombre maximal de joueurs est atteint
     */
    public GameRoom join(String code, Player player) {
        validatePlayer(player);
        GameRoom room = require(code);
        synchronized (room) {
            if (!room.hasPlayer(player.id()) && room.playerCount() >= props.rooms().maxPlayers()) {
                throw GameExceptions.roomFull(room.getCode());
            }
            room.putPlayer(player);
            room.touch();
        }
        broadcast(room, "ROOM_UPDATED", Map.of());
        return room;
    }

    /**
     * Retire un joueur de la salle. Si la salle devient vide, elle est automatiquement fermée et nettoyée.
     *
     * @param code     code de la salle
     * @param playerId identifiant du joueur quittant la partie
     */
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

    /**
     * Recherche une salle par son code (insensible à la casse).
     *
     * @param code code de salle
     * @return {@link Optional} contenant la salle si trouvée, sinon vide
     */
    public Optional<GameRoom> find(String code) {
        return code == null ? Optional.empty() : Optional.ofNullable(rooms.get(code.toUpperCase()));
    }

    /**
     * Récupère une salle obligatoirement ou lève une exception 404.
     *
     * @param code code de salle
     * @return instance trouvée
     * @throws IllegalArgumentException si la salle n'existe pas
     */
    public GameRoom require(String code) {
        return find(code).orElseThrow(() -> GameExceptions.roomNotFound(code));
    }

    /**
     * Diffuse un événement STOMP à tous les téléphones connectés au topic de la salle.
     *
     * @param room    instance de la salle
     * @param type    type d'événement (ex: 'ROOM_UPDATED', 'GAME_STARTED')
     * @param payload données associées à l'événement
     */
    public void broadcast(GameRoom room, String type, Map<String, Object> payload) {
        room.touch();
        messaging.convertAndSend("/topic/room/" + room.getCode(), new RoomEvent(type, room.toView(), payload));
    }

    /**
     * Enregistre un écouteur déclenché lors de la fermeture d'une salle (pour libérer les compteurs/threads).
     *
     * @param listener consommateur recevant le code de la salle fermée
     */
    public void onRoomClosed(Consumer<String> listener) {
        roomClosedListeners.add(listener);
    }

    private void close(String code) {
        if (rooms.remove(code) != null) {
            roomClosedListeners.forEach(l -> l.accept(code));
            log.info("🧹 Salle {} fermée", code);
        }
    }

    /**
     * Tâche planifiée de nettoyage automatique des salles inactives (exécutée toutes les 5 minutes).
     */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void purgeIdleRooms() {
        Instant limit = Instant.now().minus(Duration.ofMinutes(props.rooms().idleTimeoutMinutes()));
        rooms.values().stream()
                .filter(r -> r.getLastActivity().isBefore(limit))
                .map(GameRoom::getCode)
                .toList()
                .forEach(this::close);
    }

    /**
     * @return nombre total de salles actuellement actives en mémoire
     */
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
