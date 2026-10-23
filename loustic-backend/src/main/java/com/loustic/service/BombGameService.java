package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.repository.BombRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

/**
 * <h3>BombGameService</h3>
 * <p>
 * Moteur multijoueur autoritaire en temps réel pour le jeu de rapidité verbale <strong>"Boom boom" (La Bombe / Bomb Party)</strong>.
 * </p>
 *
 * <h4>Mécaniques et Arbitrage Temporel</h4>
 * <ul>
 *   <li><strong>Minuteur Secret Imprévisible :</strong> La mèche de la bombe est calculée aléatoirement
 *       $T \in [18\text{s}, 40\text{s}]$ via {@link SecureRandom} et reste strictement confidentielle au serveur.</li>
 *   <li><strong>Tolérance au Lag et Arbitrage Strict :</strong> Le serveur est l'unique autorité temporelle.
 *       Si une passation arrive après l'expiration du timestamp serveur, l'explosion est imputée au joueur émetteur.</li>
 *   <li><strong>Passation Instantanée :</strong> Chaque passation réussie déclenche un broadcast temps réel
 *       pour changer immédiatement le porteur actif de la bombe et renouveler la syllabe.</li>
 * </ul>
 *
 * <h4>Machine à États Finis (FSM)</h4>
 * <p>
 * {@code LOBBY} &rarr; {@code THEME_DRAW} &rarr; {@code TICKING} &rarr; {@code EXPLODED} &rarr; {@code GAGE_RESOLVED}.
 * </p>
 *
 * @author Loustic Core Team
 * @see BombRepository
 */
@Service
public class BombGameService {

    private static final Logger log = LoggerFactory.getLogger(BombGameService.class);

    public enum Phase {
        LOBBY,
        THEME_DRAW,
        TICKING,
        EXPLODED,
        GAGE_RESOLVED
    }

    public static final class BombRoomState {
        private Phase phase = Phase.LOBBY;
        private String theme;
        private String activePlayerId;
        private String activePlayerName;
        private List<String> turnOrder = new ArrayList<>();
        private int currentTurnIndex = 0;
        private int passCount = 0;
        private long secretExpiryTimestamp = 0;
        private long startedAt = 0;
        private ScheduledFuture<?> timerTask;
        private ScheduledFuture<?> transitionTask;
        private String victimId;
        private String victimName;
        private String gage;
        private Set<String> usedThemes = new HashSet<>();
        private Set<String> usedGages = new HashSet<>();

        public Phase getPhase() { return phase; }
        public String getTheme() { return theme; }
        public String getActivePlayerId() { return activePlayerId; }
        public String getActivePlayerName() { return activePlayerName; }
        public int getPassCount() { return passCount; }
        public String getVictimId() { return victimId; }
        public String getVictimName() { return victimName; }
        public String getGage() { return gage; }
    }

    private final Map<String, BombRoomState> states = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final SecureRandom secureRandom = new SecureRandom();

    private final GameRoomService rooms;
    private final BombRepository bombRepository;

    public BombGameService(GameRoomService rooms, BombRepository bombRepository) {
        this.rooms = rooms;
        this.bombRepository = bombRepository;
        rooms.onRoomClosed(this::cancel);
    }

    /** Démarre une manche : transition LOBBY/GAGE_RESOLVED -> THEME_DRAW -> TICKING. */
    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            if (!playerId.equals(room.getHostId()) && states.containsKey(roomCode)) {
                log.warn("Seul l'hôte ({}) peut démarrer Boom boom dans la salle {}", room.getHostId(), roomCode);
                return;
            }
            if (room.playerCount() < 2) {
                rooms.broadcast(room, "BOMB_ERROR", Map.of("message", "Il faut au moins 2 joueurs connectés !"));
                return;
            }

            BombRoomState old = states.get(roomCode);
            Set<String> usedThemes = old != null ? new HashSet<>(old.usedThemes) : new HashSet<>();
            Set<String> usedGages = old != null ? new HashSet<>(old.usedGages) : new HashSet<>();

            cancel(roomCode);

            BombRoomState s = new BombRoomState();
            s.usedThemes = usedThemes;
            s.usedGages = usedGages;
            s.phase = Phase.THEME_DRAW;
            s.theme = bombRepository.getRandomTheme(s.usedThemes);
            s.usedThemes.add(s.theme);
            s.passCount = 0;

            // Établissement de l'ordre du tour à partir du lobby
            List<Player> players = new ArrayList<>(room.getPlayers());
            Collections.shuffle(players, secureRandom);
            s.turnOrder = players.stream().map(Player::id).toList();
            s.currentTurnIndex = 0;
            s.activePlayerId = players.get(0).id();
            s.activePlayerName = players.get(0).name();
            s.startedAt = System.currentTimeMillis();

            states.put(roomCode, s);

            // Diffusion de l'étape de tirage du thème
            Map<String, Object> drawPayload = buildSnapshot(s);
            rooms.broadcast(room, "BOMB_THEME_DRAW", drawPayload);
            rooms.broadcast(room, "BOMB_STARTED", drawPayload);

            // Transition automatique vers TICKING après 2 secondes d'affichage du thème
            s.transitionTask = scheduler.schedule(() -> {
                beginTicking(roomCode);
            }, 2000, TimeUnit.MILLISECONDS);
        }
    }

    /** Démarre le compte à rebours secret T ∈ [18s, 40s]. */
    private void beginTicking(String roomCode) {
        rooms.find(roomCode).ifPresent(room -> {
            synchronized (room) {
                BombRoomState s = states.get(roomCode);
                if (s == null || s.phase != Phase.THEME_DRAW) return;

                s.phase = Phase.TICKING;

                // T ∈ [18s, 40s] généré cryptographiquement côté serveur
                long secretDurationMs = 18000L + secureRandom.nextLong(22001L);
                s.secretExpiryTimestamp = System.currentTimeMillis() + secretDurationMs;

                log.info("💣 Salle {} : Mèche allumée pour {} ms (secret)", roomCode, secretDurationMs);

                // Planification de l'explosion fatidique
                s.timerTask = scheduler.schedule(() -> {
                    triggerExplosion(roomCode, null, "Le temps secret s'est écoulé !");
                }, secretDurationMs, TimeUnit.MILLISECONDS);

                Map<String, Object> payload = buildSnapshot(s);
                rooms.broadcast(room, "BOMB_TICKING", payload);
                rooms.broadcast(room, "ACTIVE_PLAYER_CHANGED", payload);
            }
        });
    }

    /** Le porteur passe la bombe au joueur suivant avec horodatage strict et gestion du lag. */
    public void pass(String roomCode, String playerId) {
        long serverReceivedTimestamp = System.currentTimeMillis();
        GameRoom room = rooms.require(roomCode);

        synchronized (room) {
            BombRoomState s = states.get(roomCode);
            if (s == null) return;

            // Détection du lag réseau : action arrivée après l'heure d'explosion T=0
            if (s.phase == Phase.TICKING && s.secretExpiryTimestamp > 0 && serverReceivedTimestamp >= s.secretExpiryTimestamp) {
                log.info("⏱️ Lag réseau détecté salle {} : passation de {} arrivée après l'explosion", roomCode, playerId);
                triggerExplosion(roomCode, playerId, "Bombe passée trop tard !");
                return;
            }

            if (s.phase != Phase.TICKING) return;
            if (!playerId.equals(s.activePlayerId)) {
                log.warn("Tentative de passer la bombe par un joueur non-actif : {} vs {}", playerId, s.activePlayerId);
                return;
            }

            // Calcul du joueur suivant dans l'ordre établi au LOBBY
            s.currentTurnIndex = (s.currentTurnIndex + 1) % s.turnOrder.size();
            String nextId = s.turnOrder.get(s.currentTurnIndex);
            Player nextPlayer = room.getPlayer(nextId);
            if (nextPlayer == null) {
                nextPlayer = room.nextPlayerAfter(playerId);
                if (nextPlayer == null) return;
            }

            String previousId = s.activePlayerId;
            s.activePlayerId = nextPlayer.id();
            s.activePlayerName = nextPlayer.name();
            s.passCount++;

            Map<String, Object> payload = buildSnapshot(s);
            payload.put("previousPlayerId", previousId);

            // Broadcast immédiat de ACTIVE_PLAYER_CHANGED et BOMB_PASSED
            rooms.broadcast(room, "ACTIVE_PLAYER_CHANGED", payload);
            rooms.broadcast(room, "BOMB_PASSED", payload);
        }
    }

    /** Déclenche l'explosion et attribue le gage. */
    public void triggerExplosion(String roomCode, String forceVictimId, String reason) {
        rooms.find(roomCode).ifPresent(room -> {
            synchronized (room) {
                BombRoomState s = states.get(roomCode);
                if (s == null || (s.phase != Phase.TICKING && s.phase != Phase.THEME_DRAW)) return;

                if (s.timerTask != null) s.timerTask.cancel(false);
                if (s.transitionTask != null) s.transitionTask.cancel(false);

                s.phase = Phase.EXPLODED;

                String victimId = forceVictimId != null ? forceVictimId : s.activePlayerId;
                Player victim = room.getPlayer(victimId);
                String victimName = victim != null ? victim.name() : (s.activePlayerName != null ? s.activePlayerName : "Joueur");

                s.victimId = victimId;
                s.victimName = victimName;
                s.gage = bombRepository.getRandomGage(s.usedGages);
                s.usedGages.add(s.gage);

                log.info("💥 BOOM dans la salle {} ! Victime : {} ({}). Gage : {}", roomCode, victimName, victimId, s.gage);

                Map<String, Object> payload = buildSnapshot(s);
                payload.put("loserId", victimId); // rétro-compatibilité
                payload.put("reason", reason);

                rooms.broadcast(room, "BOMB_EXPLODED", payload);
            }
        });
    }

    /** Résout le gage et prépare la manche suivante. */
    public void resolveGage(String roomCode, String playerId) {
        rooms.find(roomCode).ifPresent(room -> {
            synchronized (room) {
                BombRoomState s = states.get(roomCode);
                if (s == null || s.phase != Phase.EXPLODED) return;

                s.phase = Phase.GAGE_RESOLVED;
                Map<String, Object> payload = buildSnapshot(s);
                rooms.broadcast(room, "BOMB_GAGE_RESOLVED", payload);
            }
        });
    }

    public Optional<BombRoomState> getState(String roomCode) {
        return Optional.ofNullable(states.get(roomCode));
    }

    private Map<String, Object> buildSnapshot(BombRoomState s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("phase", s.phase.name());
        m.put("status", s.phase == Phase.EXPLODED ? "EXPLODED" : (s.phase == Phase.TICKING ? "RUNNING" : s.phase.name()));
        m.put("theme", s.theme);
        m.put("activePlayerId", s.activePlayerId);
        m.put("activePlayerName", s.activePlayerName);
        m.put("holderId", s.activePlayerId); // rétro-compatibilité
        m.put("passCount", s.passCount);
        m.put("victimId", s.victimId);
        m.put("victimName", s.victimName);
        m.put("loserId", s.victimId); // rétro-compatibilité
        m.put("gage", s.gage);
        m.put("startedAt", s.startedAt);
        m.put("serverTimestamp", Instant.now().toEpochMilli());
        return m;
    }

    private void cancel(String roomCode) {
        BombRoomState s = states.remove(roomCode);
        if (s != null) {
            if (s.timerTask != null) s.timerTask.cancel(false);
            if (s.transitionTask != null) s.transitionTask.cancel(false);
        }
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }
}
