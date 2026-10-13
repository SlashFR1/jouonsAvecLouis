package com.loustic.controller;

import com.loustic.model.GameActionMessage;
import com.loustic.service.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reçoit les événements STOMP des téléphones (préfixe /app).
 * Distribue les actions vers les moteurs de jeu serveur correspondants.
 */
@Controller
public class GameWebSocketController {

    private final GameRoomService rooms;
    private final BombGameService bomb;
    private final LimitePrisonGameService limite;
    private final ClasseMoiCaGameService cmc;
    private final LaTaupeGameService taupe;
    private final SpyGameService spy;
    private final AliasGameService alias;
    private final SevenSecondsService sevenSecondsService;
    private final ParasiteGameService parasite;
    private final SynapseGameService synapse;

    public GameWebSocketController(GameRoomService rooms,
                                   BombGameService bomb,
                                   LimitePrisonGameService limite,
                                   ClasseMoiCaGameService cmc,
                                   LaTaupeGameService taupe,
                                   SpyGameService spy,
                                   AliasGameService alias,
                                   SevenSecondsService sevenSecondsService,
                                   ParasiteGameService parasite,
                                   SynapseGameService synapse) {
        this.rooms = rooms;
        this.bomb = bomb;
        this.limite = limite;
        this.cmc = cmc;
        this.taupe = taupe;
        this.spy = spy;
        this.alias = alias;
        this.sevenSecondsService = sevenSecondsService;
        this.parasite = parasite;
        this.synapse = synapse;
    }

    /** Relais générique / fallback */
    @MessageMapping("/room/{code}/action")
    public void relay(@DestinationVariable String code, @Payload GameActionMessage msg) {
        rooms.find(code).ifPresent(room -> {
            if (msg.playerId() == null || !room.hasPlayer(msg.playerId())) return;
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("actionType", msg.type());
            payload.put("fromPlayerId", msg.playerId());
            payload.put("data", msg.payload() == null ? Map.of() : msg.payload());
            rooms.broadcast(room, "ACTION", payload);
        });
    }

    // --- BOOM BOOM (BOMBE) ---
    @MessageMapping({"/bomb/{code}/start", "/room/{code}/bomb/start"})
    public void startBomb(@DestinationVariable String code, @Payload GameActionMessage msg) {
        if (msg.playerId() != null) bomb.start(code, msg.playerId());
    }

    @MessageMapping({"/bomb/{code}/pass", "/room/{code}/bomb/pass"})
    public void passBomb(@DestinationVariable String code, @Payload GameActionMessage msg) {
        if (msg.playerId() != null) bomb.pass(code, msg.playerId());
    }

    @MessageMapping({"/bomb/{code}/resolve", "/room/{code}/bomb/resolve"})
    public void resolveBomb(@DestinationVariable String code, @Payload GameActionMessage msg) {
        if (msg.playerId() != null) bomb.resolveGage(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/limite/start", "/limite/{code}/start"})
    public void startLimite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        limite.start(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/limite/select-question", "/limite/{code}/select-question", "/room/{code}/limite/pick-question", "/limite/{code}/pick-question"})
    public void selectQuestionLimite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String cardId = (String) msg.data().get("cardId");
        if (cardId == null) {
            cardId = (String) msg.data().get("card");
        }
        limite.selectQuestion(code, msg.playerId(), cardId);
    }

    @MessageMapping({"/room/{code}/limite/submit", "/limite/{code}/submit"})
    public void submitLimite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String card = (String) msg.payload().get("cardId");
        if (card == null) {
            card = (String) msg.payload().get("card");
        }
        limite.submitCard(code, msg.playerId(), card);
    }

    @MessageMapping({"/room/{code}/limite/pick", "/limite/{code}/pick", "/room/{code}/limite/vote", "/limite/{code}/vote"})
    public void voteLimite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String token = (String) msg.payload().get("token");
        if (token == null) {
            token = (String) msg.payload().get("winnerToken");
        }
        if (token == null) {
            token = (String) msg.payload().get("submissionId");
        }
        limite.pickWinner(code, msg.playerId(), token);
    }

    @MessageMapping({"/room/{code}/limite/next", "/limite/{code}/next"})
    public void nextLimite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        limite.nextRound(code, msg.playerId());
    }

    // --- CLASSE MOI ÇA ---
    @MessageMapping({"/room/{code}/cmc/start", "/cmc/{code}/start"})
    public void startCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        boolean hotMode = Boolean.TRUE.equals(msg.payload().get("hotMode"));
        cmc.start(code, msg.playerId(), hotMode);
    }

    @MessageMapping({"/room/{code}/cmc/anchors", "/cmc/{code}/anchors"})
    public void anchorsCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String zero = (String) msg.payload().get("anchorZero");
        String eleven = (String) msg.payload().get("anchorEleven");
        cmc.setAnchors(code, msg.playerId(), zero, eleven);
    }

    @MessageMapping({"/room/{code}/cmc/submit", "/cmc/{code}/submit"})
    public void submitCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String text = (String) msg.payload().get("text");
        cmc.submit(code, msg.playerId(), text);
    }

    @SuppressWarnings("unchecked")
    @MessageMapping({"/room/{code}/cmc/order", "/cmc/{code}/order"})
    public void orderCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        List<String> order = (List<String>) msg.payload().get("order");
        cmc.validateOrder(code, msg.playerId(), order);
    }

    @MessageMapping({"/room/{code}/cmc/reveal-next", "/cmc/{code}/reveal-next", "/room/{code}/cmc/reveal-step", "/cmc/{code}/reveal-step"})
    public void revealNextCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        cmc.revealNextStep(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/cmc/reveal-all", "/cmc/{code}/reveal-all"})
    public void revealAllCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        cmc.revealAll(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/cmc/next", "/cmc/{code}/next"})
    public void nextCmc(@DestinationVariable String code, @Payload GameActionMessage msg) {
        cmc.nextRound(code, msg.playerId());
    }

    // --- LA TAUPE ---
    @MessageMapping("/room/{code}/taupe/start")
    public void startTaupe(@DestinationVariable String code, @Payload GameActionMessage msg) {
        taupe.start(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/taupe/discuss")
    public void discussTaupe(@DestinationVariable String code, @Payload GameActionMessage msg) {
        taupe.startDiscussion(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/taupe/vote-phase")
    public void votePhaseTaupe(@DestinationVariable String code, @Payload GameActionMessage msg) {
        taupe.startVoting(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/taupe/vote")
    public void voteTaupe(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String suspect = (String) msg.payload().get("suspectId");
        taupe.vote(code, msg.playerId(), suspect);
    }

    // --- SPY ---
    @MessageMapping("/room/{code}/spy/start")
    public void startSpy(@DestinationVariable String code, @Payload GameActionMessage msg) {
        spy.start(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/spy/discuss")
    public void discussSpy(@DestinationVariable String code, @Payload GameActionMessage msg) {
        spy.startDiscussion(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/spy/vote-phase")
    public void votePhaseSpy(@DestinationVariable String code, @Payload GameActionMessage msg) {
        spy.startVoting(code, msg.playerId());
    }

    @MessageMapping("/room/{code}/spy/vote")
    public void voteSpy(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String suspect = (String) msg.payload().get("suspectId");
        spy.vote(code, msg.playerId(), suspect);
    }

    // --- ALIAS (Style Codenames 6x5) ---
    @MessageMapping({"/room/{code}/alias/start", "/alias/{code}/start"})
    public void startAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        alias.start(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/alias/start-game", "/alias/{code}/start-game"})
    public void startGameAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        alias.startGame(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/alias/join-team", "/alias/{code}/join-team"})
    public void joinTeamAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String team = (String) msg.payload().getOrDefault("team", "RED");
        String role = (String) msg.payload().getOrDefault("role", "AGENT");
        alias.joinTeam(code, msg.playerId(), team, role);
    }

    @MessageMapping({"/room/{code}/alias/set-teams-count", "/alias/{code}/set-teams-count"})
    public void setTeamsCountAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        Object countObj = msg.payload().get("count");
        int count = countObj instanceof Number n ? n.intValue() : 2;
        alias.setTeamsCount(code, msg.playerId(), count);
    }

    @MessageMapping({"/room/{code}/alias/submit-clue", "/alias/{code}/submit-clue"})
    public void submitClueAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String word = (String) msg.payload().get("word");
        Object countObj = msg.payload().getOrDefault("count", 1);
        int count = countObj instanceof Number n ? n.intValue() : 1;
        alias.submitClue(code, msg.playerId(), word, count);
    }

    @MessageMapping({"/room/{code}/alias/reveal-card", "/alias/{code}/reveal-card"})
    public void revealCardAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        Object idObj = msg.payload().get("cardId");
        int cardId = idObj instanceof Number n ? n.intValue() : 0;
        alias.revealCard(code, msg.playerId(), cardId);
    }

    @MessageMapping({"/room/{code}/alias/end-turn", "/alias/{code}/end-turn"})
    public void endTurnAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        alias.endTurn(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/alias/new-game", "/alias/{code}/new-game"})
    public void newGameAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        alias.newGame(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/alias/sync", "/alias/{code}/sync"})
    public void syncAlias(@DestinationVariable String code, @Payload GameActionMessage msg) {
        alias.sync(code, msg.playerId());
    }

    // --- 7 SECONDES (Style 5 Second Rule) ---
    @MessageMapping({"/room/{code}/7sec/start", "/7sec/{code}/start"})
    public void start7sec(@DestinationVariable String code, @Payload GameActionMessage msg) {
        sevenSecondsService.start(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/7sec/launch-timer", "/7sec/{code}/launch-timer", "/room/{code}/7sec/launch-countdown", "/7sec/{code}/launch-countdown"})
    public void launchTimer7sec(@DestinationVariable String code, @Payload GameActionMessage msg) {
        sevenSecondsService.launchCountdown(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/7sec/stop-timer", "/7sec/{code}/stop-timer", "/room/{code}/7sec/stop-countdown", "/7sec/{code}/stop-countdown"})
    public void stopTimer7sec(@DestinationVariable String code, @Payload GameActionMessage msg) {
        sevenSecondsService.stopCountdownEarly(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/7sec/vote", "/7sec/{code}/vote", "/room/{code}/7sec/validate", "/7sec/{code}/validate"})
    public void vote7sec(@DestinationVariable String code, @Payload GameActionMessage msg) {
        boolean success = Boolean.TRUE.equals(msg.payload().get("success"));
        sevenSecondsService.vote(code, msg.playerId(), success);
    }

    @MessageMapping({"/room/{code}/7sec/next", "/7sec/{code}/next", "/room/{code}/7sec/draw", "/7sec/{code}/draw"})
    public void next7sec(@DestinationVariable String code, @Payload GameActionMessage msg) {
        sevenSecondsService.drawNextCard(code, msg.playerId());
    }

    // --- PARASITE (Style Loup-Garou / Alien Spatial) ---
    @MessageMapping({"/room/{code}/parasite/start", "/parasite/{code}/start"})
    public void startParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.start(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/night", "/parasite/{code}/night"})
    public void nightParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.proceedToNight(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/officier", "/parasite/{code}/officier"})
    public void officierParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String l1 = (String) msg.data().get("lover1Id");
        String l2 = (String) msg.data().get("lover2Id");
        parasite.officierBindLovers(code, msg.playerId(), l1, l2);
    }

    @MessageMapping({"/room/{code}/parasite/garde", "/parasite/{code}/garde"})
    public void gardeParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.gardeProtect(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/alien-vote", "/parasite/{code}/alien-vote"})
    public void alienVoteParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.alienVote(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/alpha-kill", "/parasite/{code}/alpha-kill"})
    public void alphaKillParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.alphaKill(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/scan", "/parasite/{code}/scan"})
    public void scanParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.scientifiqueScan(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/medecin", "/parasite/{code}/medecin"})
    public void medecinParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        boolean useSave = Boolean.TRUE.equals(msg.data().get("useSave"));
        String killId = (String) msg.data().get("killTargetId");
        parasite.medecinAction(code, msg.playerId(), useSave, killId);
    }

    @MessageMapping({"/room/{code}/parasite/ingenieur-revenge", "/parasite/{code}/ingenieur-revenge"})
    public void ingenieurRevengeParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.ingenieurRevenge(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/debate", "/parasite/{code}/debate"})
    public void debateParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.startDayDebate(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/start-vote", "/parasite/{code}/start-vote"})
    public void startVoteParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.startDayVote(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/vote", "/parasite/{code}/vote"})
    public void voteParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        String targetId = (String) msg.data().get("targetId");
        parasite.dayVote(code, msg.playerId(), targetId);
    }

    @MessageMapping({"/room/{code}/parasite/resolve-vote", "/parasite/{code}/resolve-vote"})
    public void resolveVoteParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.forceResolveDayVote(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/new-game", "/parasite/{code}/new-game"})
    public void newGameParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.newGame(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/parasite/sync", "/parasite/{code}/sync"})
    public void syncParasite(@DestinationVariable String code, @Payload GameActionMessage msg) {
        parasite.sync(code, msg.playerId());
    }

    // --- SYNAPSE (Style TTMC - Tu Te Mets Combien ?) ---
    @MessageMapping({"/room/{code}/synapse/start", "/synapse/{code}/start"})
    public void startSynapse(@DestinationVariable String code, @Payload GameActionMessage msg) {
        Object targetObj = msg.data().get("targetScore");
        Integer target = targetObj instanceof Number n ? n.intValue() : null;
        Boolean bonus = (Boolean) msg.data().get("bonusMode");
        synapse.start(code, msg.playerId(), target, bonus);
    }

    @MessageMapping({"/room/{code}/synapse/select-level", "/synapse/{code}/select-level"})
    public void selectLevelSynapse(@DestinationVariable String code, @Payload GameActionMessage msg) {
        Object lvlObj = msg.data().get("level");
        int level = lvlObj instanceof Number n ? n.intValue() : 1;
        boolean isRisky = Boolean.TRUE.equals(msg.data().get("isRisky"));
        synapse.selectLevel(code, msg.playerId(), level, isRisky);
    }

    @MessageMapping({"/room/{code}/synapse/validate", "/synapse/{code}/validate", "/room/{code}/synapse/vote", "/synapse/{code}/vote"})
    public void validateSynapse(@DestinationVariable String code, @Payload GameActionMessage msg) {
        boolean success = Boolean.TRUE.equals(msg.data().get("success")) || Boolean.TRUE.equals(msg.data().get("correct"));
        synapse.validateAnswer(code, msg.playerId(), success);
    }

    @MessageMapping({"/room/{code}/synapse/next", "/synapse/{code}/next"})
    public void nextSynapse(@DestinationVariable String code, @Payload GameActionMessage msg) {
        synapse.nextTurn(code, msg.playerId());
    }

    @MessageMapping({"/room/{code}/synapse/sync", "/synapse/{code}/sync"})
    public void syncSynapse(@DestinationVariable String code, @Payload GameActionMessage msg) {
        synapse.sync(code, msg.playerId());
    }
}
