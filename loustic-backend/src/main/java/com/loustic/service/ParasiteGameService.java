package com.loustic.service;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.model.parasite.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Moteur multijoueur du jeu "Parasite" (Style Loup-Garou spatial / Among Us textuel).
 * Autoritaire côté serveur, gère la machine à états de nuit/jour, les rôles asymétriques,
 * le secret biométrique ("Zero-Knowledge") et les chaînes de mort (amoureux, ingénieur).
 */
@Service
public class ParasiteGameService {

    public static final class State {
        private ParasitePhase phase = ParasitePhase.LOBBY;
        private int dayNumber = 1;
        private final Map<String, ParasitePlayer> players = new ConcurrentHashMap<>();

        // Rôles de nuit & cibles
        private String lastProtectedId = null;
        private String protectedThisNight = null;
        private String alienTargetId = null;
        private String alphaTargetId = null;
        private boolean witchSaved = false;
        private String witchKillId = null;

        // Amoureux (Officier)
        private final List<String> lovers = new CopyOnWriteArrayList<>();

        // Votes des aliens (voterId -> targetId)
        private final Map<String, String> alienVotes = new ConcurrentHashMap<>();

        // Votes du jour (voterId -> targetId)
        private final Map<String, String> dayVotes = new ConcurrentHashMap<>();

        // Victimes du cycle
        private final List<String> deadThisCycle = new CopyOnWriteArrayList<>();
        private ParasitePlayer lastEliminated = null;
        private String revengeEngineerId = null;

        // Vainqueur
        private String winnerCamp = null;
        private String winMessage = null;
        private String lastAction = "";
    }

    private final Map<String, State> games = new ConcurrentHashMap<>();
    private final GameRoomService rooms;
    private final SimpMessagingTemplate messaging;
    private final SecureRandom random = new SecureRandom();

    public ParasiteGameService(GameRoomService rooms, SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.messaging = messaging;
    }

    /**
     * Démarrage depuis le lobby : attribution secrète des rôles.
     */
    public void start(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            if (!playerId.equals(room.getHostId()) && s.phase != ParasitePhase.LOBBY) {
                return;
            }

            List<Player> roomPlayers = room.getPlayers();
            if (roomPlayers.size() < 3) {
                rooms.broadcast(room, "PARASITE_ERROR", Map.of("message", "Il faut au moins 3 joueurs pour lancer Parasite !"));
                return;
            }

            s.players.clear();
            s.lovers.clear();
            s.dayNumber = 1;
            s.lastProtectedId = null;
            s.winnerCamp = null;
            s.winMessage = null;
            s.revengeEngineerId = null;

            // Distribution équilibrée des rôles selon l'effectif
            List<ParasiteRole> roleDeck = buildBalancedRoleDeck(roomPlayers.size());
            Collections.shuffle(roleDeck, random);

            for (int i = 0; i < roomPlayers.size(); i++) {
                Player p = roomPlayers.get(i);
                ParasiteRole role = roleDeck.get(i);
                boolean isMedecin = role == ParasiteRole.MEDECIN;
                s.players.put(p.id(), new ParasitePlayer(
                        p.id(), p.name(), role, true, false, null, isMedecin, isMedecin
                ));
            }

            s.phase = ParasitePhase.ROLE_REVEAL;
            s.lastAction = "Découvrez votre rôle secret sur votre écran !";

            broadcastPublicState(room, s);
            sendAllPrivateRoles(room, s);
        }
    }

    /**
     * Lance la première nuit ou la nuit suivante après révélation des rôles / vote.
     */
    public void proceedToNight(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            if (!playerId.equals(room.getHostId()) && s.phase != ParasitePhase.ROLE_REVEAL && s.phase != ParasitePhase.DAY_VOTE_RESULT) {
                return;
            }

            s.alienVotes.clear();
            s.dayVotes.clear();
            s.protectedThisNight = null;
            s.alienTargetId = null;
            s.alphaTargetId = null;
            s.witchSaved = false;
            s.witchKillId = null;
            s.deadThisCycle.clear();
            s.lastEliminated = null;

            s.phase = ParasitePhase.NIGHT_START;
            s.lastAction = "La nuit " + s.dayNumber + " tombe... La colonie s'endort.";

            broadcastPublicState(room, s);

            // Avance automatiquement à la première étape de nuit
            advanceNightStep(room, s);
        }
    }

    /**
     * Avance dans la séquence d'actions de nuit selon les rôles vivants.
     */
    private void advanceNightStep(GameRoom room, State s) {
        // 1. Officier (Nuit 1 uniquement)
        if (s.dayNumber == 1 && hasLivingRole(s, ParasiteRole.OFFICIER) && s.lovers.isEmpty()) {
            s.phase = ParasitePhase.NIGHT_OFFICIER;
            s.lastAction = "L'Officier des relations désigne les 2 amants...";
            broadcastPublicState(room, s);
            return;
        }

        // 2. Garde (Salvateur)
        if (hasLivingRole(s, ParasiteRole.GARDE) && s.phase.ordinal() < ParasitePhase.NIGHT_GARDE.ordinal()) {
            s.phase = ParasitePhase.NIGHT_GARDE;
            s.lastAction = "Le Garde patrouille pour protéger un habitant...";
            broadcastPublicState(room, s);
            return;
        }

        // 3. Aliens (Vote collectif)
        if (hasLivingAliens(s) && s.phase.ordinal() < ParasitePhase.NIGHT_ALIENS.ordinal()) {
            s.phase = ParasitePhase.NIGHT_ALIENS;
            s.lastAction = "Les Aliens se concertent en secret pour choisir une proie...";
            broadcastPublicState(room, s);
            return;
        }

        // 4. Alpha (Nuits paires : 2, 4...)
        if (hasLivingRole(s, ParasiteRole.ALPHA) && s.dayNumber > 1 && s.dayNumber % 2 == 0 && s.phase.ordinal() < ParasitePhase.NIGHT_ALPHA.ordinal()) {
            s.phase = ParasitePhase.NIGHT_ALPHA;
            s.lastAction = "L'Alpha rode dans les conduits spatiaux...";
            broadcastPublicState(room, s);
            return;
        }

        // 5. Scientifique (Voyante)
        if (hasLivingRole(s, ParasiteRole.SCIENTIFIQUE) && s.phase.ordinal() < ParasitePhase.NIGHT_SCIENTIFIQUE.ordinal()) {
            s.phase = ParasitePhase.NIGHT_SCIENTIFIQUE;
            s.lastAction = "Le Scientifique analyse l'ADN d'un habitant...";
            broadcastPublicState(room, s);
            return;
        }

        // 6. Médecin (Sorcière)
        if (hasLivingRole(s, ParasiteRole.MEDECIN) && s.phase.ordinal() < ParasitePhase.NIGHT_MEDECIN.ordinal()) {
            ParasitePlayer med = getLivingPlayerByRole(s, ParasiteRole.MEDECIN);
            if (med != null && (med.hasSavePotion() || med.hasKillPotion())) {
                s.phase = ParasitePhase.NIGHT_MEDECIN;
                s.lastAction = "Le Médecin prépare ses sérums dans son laboratoire...";
                broadcastPublicState(room, s);
                return;
            }
        }

        // Toutes les actions de nuit sont terminées -> Résolution de l'aube
        resolveNight(room, s);
    }

    /**
     * Action de l'Officier (Nuit 1) : désigne 2 amoureux.
     */
    public void officierBindLovers(String roomCode, String playerId, String lover1Id, String lover2Id) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_OFFICIER) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || actor.role() != ParasiteRole.OFFICIER || !actor.alive()) return;
            if (lover1Id.equals(lover2Id)) return;

            s.lovers.clear();
            s.lovers.add(lover1Id);
            s.lovers.add(lover2Id);

            ParasitePlayer p1 = s.players.get(lover1Id);
            ParasitePlayer p2 = s.players.get(lover2Id);
            if (p1 != null) s.players.put(lover1Id, p1.withLover(lover2Id));
            if (p2 != null) s.players.put(lover2Id, p2.withLover(lover1Id));

            // Informer secrètement les deux amoureux
            sendPrivateNotification(roomCode, lover1Id, "💕 Vous êtes lié d'amour avec " + (p2 != null ? p2.name() : "un autre joueur") + " !");
            sendPrivateNotification(roomCode, lover2Id, "💕 Vous êtes lié d'amour avec " + (p1 != null ? p1.name() : "un autre joueur") + " !");

            advanceNightStep(room, s);
        }
    }

    /**
     * Action du Garde : protège un joueur.
     */
    public void gardeProtect(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_GARDE) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || actor.role() != ParasiteRole.GARDE || !actor.alive()) return;

            if (targetId.equals(s.lastProtectedId)) {
                sendPrivateNotification(roomCode, playerId, "⚠️ Vous ne pouvez pas protéger la même personne 2 nuits de suite !");
                return;
            }

            s.protectedThisNight = targetId;
            s.lastProtectedId = targetId;

            advanceNightStep(room, s);
        }
    }

    /**
     * Action des Aliens : vote pour une victime.
     */
    public void alienVote(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_ALIENS) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || !actor.alive() || (actor.role() != ParasiteRole.ALIEN && actor.role() != ParasiteRole.ALPHA)) return;

            s.alienVotes.put(playerId, targetId);

            // Synchroniser le vote entre aliens
            broadcastAliensUpdate(roomCode, s);

            // Si tous les aliens vivants ont voté
            long livingAliensCount = s.players.values().stream()
                    .filter(p -> p.alive() && (p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA))
                    .count();

            if (s.alienVotes.size() >= livingAliensCount) {
                // Déterminer la cible majoritaire
                Map<String, Integer> tally = new HashMap<>();
                s.alienVotes.values().forEach(tid -> tally.put(tid, tally.getOrDefault(tid, 0) + 1));
                String chosen = Collections.max(tally.entrySet(), Map.Entry.comparingByValue()).getKey();
                s.alienTargetId = chosen;

                advanceNightStep(room, s);
            }
        }
    }

    /**
     * Action de l'Alpha : dévore un joueur (nuits paires).
     */
    public void alphaKill(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_ALPHA) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || actor.role() != ParasiteRole.ALPHA || !actor.alive()) return;

            s.alphaTargetId = targetId; // peut être null si passe son tour
            advanceNightStep(room, s);
        }
    }

    /**
     * Action du Scientifique : analyse un joueur.
     */
    public void scientifiqueScan(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_SCIENTIFIQUE) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || actor.role() != ParasiteRole.SCIENTIFIQUE || !actor.alive()) return;

            ParasitePlayer target = s.players.get(targetId);
            if (target != null) {
                String campResult = (target.role() == ParasiteRole.ALIEN || target.role() == ParasiteRole.ALPHA)
                        ? "👽 ALIEN / PARASITE"
                        : "🧑‍🚀 MEMBRE DE LA COLONIE";

                // Envoi privé et immédiat au scientifique
                Map<String, Object> scanData = Map.of(
                        "type", "SCIENTIFIQUE_RESULT",
                        "targetId", target.id(),
                        "targetName", target.name(),
                        "camp", campResult,
                        "roleName", target.role().getDisplayName()
                );
                messaging.convertAndSend("/queue/player/" + playerId, scanData);
                messaging.convertAndSend("/topic/room/" + roomCode + "/player/" + playerId, scanData);
            }

            advanceNightStep(room, s);
        }
    }

    /**
     * Action du Médecin : utilise son sérum de soin ou de poison.
     */
    public void medecinAction(String roomCode, String playerId, boolean useSave, String killTargetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.NIGHT_MEDECIN) return;

            ParasitePlayer actor = s.players.get(playerId);
            if (actor == null || actor.role() != ParasiteRole.MEDECIN || !actor.alive()) return;

            boolean hasSave = actor.hasSavePotion();
            boolean hasKill = actor.hasKillPotion();

            if (useSave && hasSave) {
                s.witchSaved = true;
                hasSave = false;
            }

            if (killTargetId != null && !killTargetId.isBlank() && hasKill) {
                s.witchKillId = killTargetId;
                hasKill = false;
            }

            s.players.put(playerId, actor.withPotions(hasSave, hasKill));

            advanceNightStep(room, s);
        }
    }

    /**
     * Résolution de la nuit : calcul des victimes et passage à DAY_REVEAL.
     */
    private void resolveNight(GameRoom room, State s) {
        Set<String> victims = new LinkedHashSet<>();

        // 1. Cible des aliens
        if (s.alienTargetId != null) {
            boolean protectedByGarde = s.alienTargetId.equals(s.protectedThisNight);
            boolean savedByMedecin = s.witchSaved;

            if (!protectedByGarde && !savedByMedecin) {
                victims.add(s.alienTargetId);
            }
        }

        // 2. Cible de l'Alpha
        if (s.alphaTargetId != null) {
            victims.add(s.alphaTargetId);
        }

        // 3. Poison du Médecin
        if (s.witchKillId != null) {
            victims.add(s.witchKillId);
        }

        // Appliquer les morts
        for (String vid : victims) {
            killPlayer(s, vid);
        }

        s.deadThisCycle.clear();
        for (String vid : victims) {
            ParasitePlayer p = s.players.get(vid);
            if (p != null) s.deadThisCycle.add(p.name() + " (" + p.role().getDisplayName() + ")");
        }

        // Vérifier si l'Ingénieur est mort cette nuit
        for (String vid : victims) {
            ParasitePlayer p = s.players.get(vid);
            if (p != null && p.role() == ParasiteRole.INGENIEUR) {
                s.revengeEngineerId = vid;
                s.phase = ParasitePhase.DAY_INGENIEUR_REVENGE;
                s.lastAction = "💥 L'Ingénieur " + p.name() + " est tombé ! Il déclenche son arme fatale avant de mourir...";
                broadcastPublicState(room, s);
                return;
            }
        }

        // Vérifier conditions de victoire
        if (checkVictory(room, s)) return;

        // Sinon, passage à l'aube et au débat
        s.phase = ParasitePhase.DAY_REVEAL;
        s.lastAction = s.deadThisCycle.isEmpty()
                ? "L'aube se lève... Par miracle, personne n'a été tué cette nuit !"
                : "L'aube se lève... Morts découverts : " + String.join(", ", s.deadThisCycle);

        broadcastPublicState(room, s);
    }

    /**
     * Tir de vengeance de l'Ingénieur mort.
     */
    public void ingenieurRevenge(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.DAY_INGENIEUR_REVENGE) return;

            ParasitePlayer engineer = s.players.get(playerId);
            if (engineer == null || engineer.role() != ParasiteRole.INGENIEUR) return;

            ParasitePlayer target = s.players.get(targetId);
            if (target != null && target.alive()) {
                killPlayer(s, targetId);
                s.deadThisCycle.add(target.name() + " (Éliminé par le tir de vengeance de l'Ingénieur)");
            }

            s.revengeEngineerId = null;

            if (checkVictory(room, s)) return;

            s.phase = ParasitePhase.DAY_DEBATE;
            s.lastAction = "Le tir de vengeance a retenti ! Place au débat colonial.";
            broadcastPublicState(room, s);
        }
    }

    /**
     * Lance la phase de débat du jour.
     */
    public void startDayDebate(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            if (!playerId.equals(room.getHostId()) && s.phase != ParasitePhase.DAY_REVEAL) return;

            s.phase = ParasitePhase.DAY_DEBATE;
            s.lastAction = "Débat général : discutez des soupçons et des alibis !";
            broadcastPublicState(room, s);
        }
    }

    /**
     * Ouvre la phase de vote d'élimination de jour.
     */
    public void startDayVote(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null) return;
            if (!playerId.equals(room.getHostId()) && s.phase != ParasitePhase.DAY_DEBATE) return;

            s.dayVotes.clear();
            s.phase = ParasitePhase.DAY_VOTE;
            s.lastAction = "Tribunal du Sas : Votez en secret sur votre téléphone contre un suspect !";
            broadcastPublicState(room, s);
        }
    }

    /**
     * Enregistre le vote d'un joueur contre un suspect.
     */
    public void dayVote(String roomCode, String playerId, String targetId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.DAY_VOTE) return;

            ParasitePlayer voter = s.players.get(playerId);
            if (voter == null || !voter.alive()) return;

            s.dayVotes.put(playerId, targetId);

            long livingCount = s.players.values().stream().filter(ParasitePlayer::alive).count();

            // Si tout le monde a voté, dépouillement automatique
            if (s.dayVotes.size() >= livingCount) {
                resolveDayVote(room, s);
            } else {
                broadcastPublicState(room, s);
            }
        }
    }

    /**
     * Dépouillement des votes du jour et éjection du sas.
     */
    public void forceResolveDayVote(String roomCode, String playerId) {
        GameRoom room = rooms.require(roomCode);
        synchronized (room) {
            State s = games.get(roomCode);
            if (s == null || s.phase != ParasitePhase.DAY_VOTE) return;
            if (!playerId.equals(room.getHostId())) return;
            resolveDayVote(room, s);
        }
    }

    private void resolveDayVote(GameRoom room, State s) {
        if (s.dayVotes.isEmpty()) {
            s.phase = ParasitePhase.DAY_VOTE_RESULT;
            s.lastAction = "Aucun vote exprimé. Personne n'est éjecté aujourd'hui.";
            broadcastPublicState(room, s);
            return;
        }

        Map<String, Integer> tally = new HashMap<>();
        s.dayVotes.values().forEach(tid -> tally.put(tid, tally.getOrDefault(tid, 0) + 1));

        int max = Collections.max(tally.values());
        List<String> topCandidates = new ArrayList<>();
        tally.forEach((k, v) -> {
            if (v == max) topCandidates.add(k);
        });

        // En cas d'égalité parfaite, personne n'est éjecté
        if (topCandidates.size() > 1) {
            s.lastEliminated = null;
            s.phase = ParasitePhase.DAY_VOTE_RESULT;
            s.lastAction = "🤝 Égalité de votes (" + max + " voix) ! La colonie hésite : personne n'est éjecté par le sas.";
            broadcastPublicState(room, s);
            return;
        }

        String ejectedId = topCandidates.get(0);
        ParasitePlayer ejected = s.players.get(ejectedId);
        if (ejected != null) {
            killPlayer(s, ejectedId);
            s.lastEliminated = ejected;
            s.phase = ParasitePhase.DAY_VOTE_RESULT;
            s.lastAction = "🚀 " + ejected.name() + " a été éjecté(e) par le sas spatial avec " + max + " voix ! Rôle : " + ejected.role().getDisplayName();

            // Vérifier tir de l'ingénieur s'il est éjecté
            if (ejected.role() == ParasiteRole.INGENIEUR) {
                s.revengeEngineerId = ejectedId;
                s.phase = ParasitePhase.DAY_INGENIEUR_REVENGE;
                broadcastPublicState(room, s);
                return;
            }
        }

        s.dayNumber++;
        if (checkVictory(room, s)) return;

        broadcastPublicState(room, s);
    }

    /**
     * Élimine un joueur et gère les morts en chaîne (suicide d'amour de l'amoureux).
     */
    private void killPlayer(State s, String playerId) {
        ParasitePlayer p = s.players.get(playerId);
        if (p == null || !p.alive()) return;

        s.players.put(playerId, p.withAlive(false));

        // Mort par chagrin d'amour
        if (p.isLover() && p.loverId() != null) {
            ParasitePlayer lover = s.players.get(p.loverId());
            if (lover != null && lover.alive()) {
                s.players.put(lover.id(), lover.withAlive(false));
                s.deadThisCycle.add(lover.name() + " (💔 Mort(e) par chagrin d'amour pour " + p.name() + ")");
            }
        }
    }

    /**
     * Évalue les conditions de victoire.
     */
    private boolean checkVictory(GameRoom room, State s) {
        List<ParasitePlayer> alive = s.players.values().stream().filter(ParasitePlayer::alive).toList();

        if (alive.isEmpty()) {
            s.winnerCamp = "ÉGALITÉ";
            s.winMessage = "Tout le monde a péri dans le vide spatial...";
            s.phase = ParasitePhase.GAME_OVER;
            broadcastPublicState(room, s);
            return true;
        }

        long aliveAliens = alive.stream().filter(p -> p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA).count();
        long aliveColons = alive.stream().filter(p -> p.role() != ParasiteRole.ALIEN && p.role() != ParasiteRole.ALPHA).count();
        ParasitePlayer alpha = alive.stream().filter(p -> p.role() == ParasiteRole.ALPHA).findFirst().orElse(null);

        // 1. Victoire de l'Alpha seul
        if (alpha != null && alive.size() == 1) {
            s.winnerCamp = "ALPHA";
            s.winMessage = "🐺 L'Alpha est l'unique survivant à bord ! Victoire en solitaire.";
            s.phase = ParasitePhase.GAME_OVER;
            broadcastPublicState(room, s);
            return true;
        }

        // 2. Victoire des Amoureux
        boolean allAliveAreLovers = alive.size() == 2 && alive.stream().allMatch(ParasitePlayer::isLover);
        if (allAliveAreLovers) {
            s.winnerCamp = "AMOUREUX";
            s.winMessage = "💕 Le couple d'amoureux a survécu à toutes les épreuves !";
            s.phase = ParasitePhase.GAME_OVER;
            broadcastPublicState(room, s);
            return true;
        }

        // 3. Victoire des Aliens (parité numérique)
        if (aliveAliens >= aliveColons) {
            s.winnerCamp = "ALIENS";
            s.winMessage = "👽 Les Aliens ont pris le contrôle total du vaisseau spatial !";
            s.phase = ParasitePhase.GAME_OVER;
            broadcastPublicState(room, s);
            return true;
        }

        // 4. Victoire de la Colonie (tous les aliens & alpha éliminés)
        if (aliveAliens == 0) {
            s.winnerCamp = "COLONIE";
            s.winMessage = "🧑‍🚀 La Colonie l'emporte ! Tous les parasites extraterrestres ont été éradiqués.";
            s.phase = ParasitePhase.GAME_OVER;
            broadcastPublicState(room, s);
            return true;
        }

        return false;
    }

    /**
     * Relance une nouvelle partie avec les mêmes joueurs.
     */
    public void newGame(String roomCode, String playerId) {
        start(roomCode, playerId);
    }

    /**
     * Synchronisation manuelle / F5 reconnect.
     */
    public void sync(String roomCode, String playerId) {
        GameRoom room = rooms.find(roomCode).orElse(null);
        if (room == null) return;
        synchronized (room) {
            State s = games.computeIfAbsent(roomCode, k -> new State());
            broadcastPublicState(room, s);
            sendPrivateRoleToPlayer(roomCode, s, playerId);
        }
    }

    // --- PROJECTIONS RÉSEAU & SÉCURITÉ ---

    private void broadcastPublicState(GameRoom room, State s) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("phase", s.phase.name());
        payload.put("dayNumber", s.dayNumber);
        payload.put("winnerCamp", s.winnerCamp);
        payload.put("winMessage", s.winMessage);
        payload.put("lastAction", s.lastAction);
        payload.put("deadThisCycle", s.deadThisCycle);
        payload.put("revengeEngineerId", s.revengeEngineerId);
        payload.put("votesCount", s.dayVotes.size());

        // Zero-Knowledge : les rôles secrets des vivants sont masqués
        boolean revealAll = s.phase == ParasitePhase.GAME_OVER;
        List<PublicParasitePlayerDTO> publicPlayers = s.players.values().stream()
                .map(p -> PublicParasitePlayerDTO.fromPlayer(p, revealAll))
                .toList();
        payload.put("players", publicPlayers);

        // Si phase de résultat de vote, révéler l'éliminé
        if (s.lastEliminated != null) {
            payload.put("lastEliminated", Map.of(
                    "name", s.lastEliminated.name(),
                    "roleName", s.lastEliminated.role().getDisplayName(),
                    "description", s.lastEliminated.role().getDescription()
            ));
        }

        rooms.broadcast(room, "PARASITE_STATE_UPDATED", payload);
    }

    private void broadcastAliensUpdate(String roomCode, State s) {
        List<String> livingAlienNames = s.players.values().stream()
                .filter(p -> p.alive() && (p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA))
                .map(ParasitePlayer::name)
                .toList();

        Map<String, Object> data = Map.of(
                "type", "ALIENS_VOTE_UPDATE",
                "votes", s.alienVotes,
                "livingAliens", livingAlienNames
        );

        s.players.values().stream()
                .filter(p -> p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA)
                .forEach(alien -> {
                    messaging.convertAndSend("/queue/player/" + alien.id(), data);
                    messaging.convertAndSend("/topic/room/" + roomCode + "/player/" + alien.id(), data);
                });
    }

    private void sendAllPrivateRoles(GameRoom room, State s) {
        for (ParasitePlayer p : s.players.values()) {
            sendPrivateRoleToPlayer(room.getCode(), s, p.id());
        }
    }

    private void sendPrivateRoleToPlayer(String roomCode, State s, String playerId) {
        ParasitePlayer p = s.players.get(playerId);
        if (p == null) return;

        Map<String, Object> rolePayload = new LinkedHashMap<>();
        rolePayload.put("type", "PARASITE_PRIVATE_ROLE");
        rolePayload.put("role", p.role().name());
        rolePayload.put("roleName", p.role().getDisplayName());
        rolePayload.put("camp", p.role().getCamp().name());
        rolePayload.put("description", p.role().getDescription());
        rolePayload.put("alive", p.alive());
        rolePayload.put("isLover", p.isLover());
        rolePayload.put("loverName", p.isLover() && p.loverId() != null && s.players.containsKey(p.loverId())
                ? s.players.get(p.loverId()).name() : null);
        rolePayload.put("hasSavePotion", p.hasSavePotion());
        rolePayload.put("hasKillPotion", p.hasKillPotion());

        // Si alien, fournir la liste des complices
        if (p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA) {
            List<String> accomplices = s.players.values().stream()
                    .filter(a -> a.role() == ParasiteRole.ALIEN || a.role() == ParasiteRole.ALPHA)
                    .map(a -> a.name() + (a.id().equals(playerId) ? " (Vous)" : ""))
                    .toList();
            rolePayload.put("accomplices", accomplices);
        }

        messaging.convertAndSend("/queue/player/" + playerId, rolePayload);
        messaging.convertAndSend("/topic/room/" + roomCode + "/player/" + playerId, rolePayload);
    }

    private void sendPrivateNotification(String roomCode, String playerId, String message) {
        Map<String, Object> notif = Map.of("type", "PARASITE_NOTIF", "message", message);
        messaging.convertAndSend("/queue/player/" + playerId, notif);
        messaging.convertAndSend("/topic/room/" + roomCode + "/player/" + playerId, notif);
    }

    private boolean hasLivingRole(State s, ParasiteRole role) {
        return s.players.values().stream().anyMatch(p -> p.alive() && p.role() == role);
    }

    private boolean hasLivingAliens(State s) {
        return s.players.values().stream().anyMatch(p -> p.alive() && (p.role() == ParasiteRole.ALIEN || p.role() == ParasiteRole.ALPHA));
    }

    private ParasitePlayer getLivingPlayerByRole(State s, ParasiteRole role) {
        return s.players.values().stream().filter(p -> p.alive() && p.role() == role).findFirst().orElse(null);
    }

    private List<ParasiteRole> buildBalancedRoleDeck(int count) {
        List<ParasiteRole> deck = new ArrayList<>();
        if (count <= 4) {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.COLON));
        } else if (count == 5) {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.GARDE, ParasiteRole.COLON));
        } else if (count == 6) {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.ALIEN, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.GARDE, ParasiteRole.INGENIEUR));
        } else if (count == 7) {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.ALIEN, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.GARDE, ParasiteRole.INGENIEUR, ParasiteRole.OFFICIER));
        } else if (count == 8) {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.ALIEN, ParasiteRole.ALPHA, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.GARDE, ParasiteRole.INGENIEUR, ParasiteRole.OFFICIER));
        } else {
            deck.addAll(List.of(ParasiteRole.ALIEN, ParasiteRole.ALIEN, ParasiteRole.ALPHA, ParasiteRole.SCIENTIFIQUE, ParasiteRole.MEDECIN, ParasiteRole.GARDE, ParasiteRole.INGENIEUR, ParasiteRole.OFFICIER, ParasiteRole.ANDROID));
            while (deck.size() < count) {
                deck.add(ParasiteRole.COLON);
            }
        }
        return deck;
    }
}
