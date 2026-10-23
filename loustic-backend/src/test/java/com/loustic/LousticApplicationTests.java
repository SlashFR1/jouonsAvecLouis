package com.loustic;

import com.loustic.model.GameDeck;
import com.loustic.service.CsvDataLoaderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LousticApplicationTests {

    @Autowired CsvDataLoaderService loader;
    @Autowired MockMvc mvc;

    @Test
    void loadsEveryCsvDeck() {
        assertThat(loader.getAllDecks()).extracting(GameDeck::key)
                .contains("7sec_prompts", "bomb_themes", "bomb_gages", "vraioufaux", "racontemoi_stories");
        assertThat(loader.getAllDecks()).allSatisfy(d -> assertThat(d.size()).isPositive());
    }

    @Test
    void parsesQuotedMultiCommaFields() {
        GameDeck stories = loader.getDeck("racontemoi_stories").orElseThrow();
        assertThat(stories.columns()).containsExactly("id", "theme", "title", "story", "keyPhrase");
        assertThat(stories.cards().get(0).get("story")).contains(",");
    }

    @Test
    void filtersByColumnShufflesAndLimits() {
        GameDeck deck = loader.getDeck("jenaijamais").orElseThrow();
        List<Map<String, String>> hot = loader.query(deck, Map.of("mode", "HOT", "unknown", "x"), true, 10);
        assertThat(hot).hasSize(10).allSatisfy(c -> assertThat(c.get("mode")).isEqualTo("hot"));
    }

    @Test
    void restExposesDecks() throws Exception {
        mvc.perform(get("/api/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].key", hasItem("7sec_prompts")));
        mvc.perform(get("/api/games/vraioufaux/cards").param("reponse", "VRAI").param("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].reponse", everyItem(is("VRAI"))));
        mvc.perform(get("/api/games/nope/cards")).andExpect(status().isNotFound());
    }

    @Autowired com.loustic.repository.SevenSecondsRepository sevenSecRepo;
    @Autowired com.loustic.service.SevenSecondsService sevenSecService;
    @Autowired com.loustic.service.GameRoomService roomService;

    @Test
    void testSevenSecondsRepositoryLoadsCards() {
        assertThat(sevenSecRepo.getCards()).isNotEmpty();
        assertThat(sevenSecRepo.getCards().size()).isGreaterThanOrEqualTo(900);
        var first = sevenSecRepo.getCards().get(0);
        assertThat(first.prompt()).isNotBlank();
        assertThat(first.theme()).isNotBlank();
        assertThat(first.count()).isEqualTo(3);
        assertThat(first.durationSeconds()).isEqualTo(7);
    }

    @Test
    void testSevenSecondsFsmTransitions() {
        var room = roomService.createRoom("7sec", new com.loustic.model.Player("p1", "Alice"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p2", "Bob"));

        // Start -> DRAW
        sevenSecService.start(room.getCode(), "p1");

        // Countdown -> launch
        sevenSecService.launchCountdown(room.getCode(), "p1");

        // Table referee votes
        sevenSecService.vote(room.getCode(), "p2", true);

        // Next turn -> DRAW
        sevenSecService.drawNextCard(room.getCode(), "p1");
    }

    @Autowired com.loustic.repository.LimitePrisonRepository limiteRepo;
    @Autowired com.loustic.service.LimitePrisonGameService limiteService;

    @Test
    void testLimitePrisonRepository() {
        assertThat(limiteRepo.getBlackCards()).isNotEmpty();
        assertThat(limiteRepo.getWhiteCards()).isNotEmpty();
        assertThat(limiteRepo.getBlackCards().size()).isGreaterThanOrEqualTo(500);
        assertThat(limiteRepo.getWhiteCards().size()).isGreaterThanOrEqualTo(900);
        var bc = limiteRepo.getBlackCards().get(0);
        assertThat(bc.text()).contains("___");
        assertThat(bc.blanksCount()).isPositive();
    }

    @Test
    void testLimitePrisonFsmAndJudging() {
        var room = roomService.createRoom("limiteprison", new com.loustic.model.Player("p1", "Juge"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p2", "JoueurA"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p3", "JoueurB"));

        // Start game -> hands dealt privately, Master pick phase
        limiteService.start(room.getCode(), "p1");

        var snapMaster = limiteService.getSnapshot(room.getCode());
        assertThat(snapMaster.get("phase")).isEqualTo("MASTER_PICK");

        // Le Juge sélectionne sa carte noire parmi les 2 propositions
        limiteService.selectQuestion(room.getCode(), "p1", "bc-001");

        var handA = limiteService.getPlayerHand(room.getCode(), "p2");
        var handB = limiteService.getPlayerHand(room.getCode(), "p3");
        assertThat(handA).hasSize(5);
        assertThat(handB).hasSize(5);

        // Player A and Player B submit a card
        limiteService.submitCard(room.getCode(), "p2", handA.get(0).id());
        limiteService.submitCard(room.getCode(), "p3", handB.get(0).id());

        // Snapshot is now in JUDGING with anonymous proposals
        var snap = limiteService.getSnapshot(room.getCode());
        assertThat(snap.get("phase")).isEqualTo("JUDGING");

        @SuppressWarnings("unchecked")
        var proposals = (List<com.loustic.model.AnonymousProposal>) snap.get("anonymousProposals");
        assertThat(proposals).hasSize(2);

        // Judge picks the winner by token
        String token = proposals.get(0).token();
        limiteService.pickWinner(room.getCode(), "p1", token);

        // Next round
        limiteService.nextRound(room.getCode(), "p1");
    }

    @Autowired com.loustic.repository.ClasseMoiCaRepository cmcRepo;
    @Autowired com.loustic.service.ClasseMoiCaGameService cmcService;

    @Test
    void testClasseMoiCaRepository() {
        assertThat(cmcRepo.getThemes(false)).hasSizeGreaterThanOrEqualTo(400);
        assertThat(cmcRepo.getThemes(true)).hasSizeGreaterThanOrEqualTo(50);
    }

    @Test
    void testClasseMoiCaFsmAndInversions() {
        var room = roomService.createRoom("classemoica", new com.loustic.model.Player("p1", "Capitaine"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p2", "JoueurA"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p3", "JoueurB"));

        cmcService.start(room.getCode(), "p1", false);

        // Le Capitaine (p1) n'a PAS de numéro secret
        assertThat(cmcService.getPlayerSecretNumber(room.getCode(), "p1")).isNull();

        // Les autres joueurs reçoivent un chiffre secret distinct dans [1, 10]
        int numA = cmcService.getPlayerSecretNumber(room.getCode(), "p2");
        int numB = cmcService.getPlayerSecretNumber(room.getCode(), "p3");

        assertThat(List.of(numA, numB)).doesNotHaveDuplicates();
        assertThat(numA).isBetween(1, 10);
        assertThat(numB).isBetween(1, 10);

        // Captain sets anchors 0 and 11
        cmcService.setAnchors(room.getCode(), "p1", "Le pire du pire", "Le paradis absolu");

        // Players say their proposals
        cmcService.submit(room.getCode(), "p2", "Proposition A");
        cmcService.submit(room.getCode(), "p3", "Proposition B");

        // Captain orders players intentionally in descending order to test inversion counting
        List<Map.Entry<String, Integer>> sortedDesc = new ArrayList<>(List.of(
                Map.entry("p2", numA),
                Map.entry("p3", numB)
        ));
        sortedDesc.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        List<String> badOrder = sortedDesc.stream().map(Map.Entry::getKey).toList();

        cmcService.validateOrder(room.getCode(), "p1", badOrder);

        // Reveal step by step
        cmcService.revealNextStep(room.getCode(), "p1");
        cmcService.revealNextStep(room.getCode(), "p1");

        var snap = cmcService.getSnapshot(room.getCode());
        assertThat((int) snap.get("lives")).isLessThan(4); // Lost croissants due to inversions!
    }

    @Autowired com.loustic.repository.SynapseRepository synapseRepo;
    @Autowired com.loustic.service.SynapseGameService synapseService;

    @Test
    void testSynapseGameplayAndPeerValidation() {
        com.loustic.model.GameRoom room = roomService.createRoom("synapse", new com.loustic.model.Player("p1", "Joueur1"));
        roomService.join(room.getCode(), new com.loustic.model.Player("p2", "Joueur2"));

        synapseService.start(room.getCode(), "p1", 30, true);
        Map<String, Object> snap = synapseService.getSnapshot(room.getCode());
        assertThat(snap.get("phase")).isEqualTo("LEVEL_SELECTION");

        // Active player chooses level 5 with risky mode
        String activeId = (String) snap.get("activePlayerId");
        synapseService.selectLevel(room.getCode(), activeId, 5, true);

        Map<String, Object> snapQuestion = synapseService.getSnapshot(room.getCode());
        assertThat(snapQuestion.get("phase")).isEqualTo("PEER_VALIDATION");
        assertThat((int) snapQuestion.get("selectedLevel")).isEqualTo(5);
        assertThat(snapQuestion.get("officialAnswer")).isNull(); // Zero-knowledge!

        // Peer validates correct
        String peerId = activeId.equals("p1") ? "p2" : "p1";
        synapseService.validateAnswer(room.getCode(), peerId, true);

        Map<String, Object> snapResolved = synapseService.getSnapshot(room.getCode());
        assertThat(snapResolved.get("lastWasSuccess")).isEqualTo(true);
        assertThat((int) snapResolved.get("lastPointsDelta")).isEqualTo(10); // 2 * 5 in risky mode!
    }

    @Autowired com.loustic.service.MotusGameService motusService;

    @Test
    void testMotusGameService() {
        var room = roomService.createRoom("motus", new com.loustic.model.Player("p1", "Louis"));
        motusService.start(room.getCode(), "p1", 5);
        motusService.guess(room.getCode(), "p1", "MAISON");
        motusService.nextRound(room.getCode(), "p1");
    }
}
