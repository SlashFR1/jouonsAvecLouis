package com.loustic.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loustic.model.SevenSecCard;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Repository;

import java.io.InputStream;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Repository immuable pour les cartes du jeu "7 Secondes" (Style 5 Second Rule).
 * Charge le fichier statique 7sec.json avec repli sécurisé.
 */
@Repository
public class SevenSecondsRepository {

    private static final Logger log = LoggerFactory.getLogger(SevenSecondsRepository.class);

    private static final List<SevenSecCard> FALLBACK_CARDS = List.of(
            new SevenSecCard("7s-001", "Fruits rouges", "Cite 3 fruits rouges.", 3, 7),
            new SevenSecCard("7s-002", "Capitales européennes", "Cite 3 capitales européennes.", 3, 7),
            new SevenSecCard("7s-003", "Animaux marins", "Donne 3 animaux marins.", 3, 7),
            new SevenSecCard("7s-004", "Marques de voitures", "Cite 3 marques de voitures.", 3, 7),
            new SevenSecCard("7s-005", "Instruments de musique", "Donne 3 instruments de musique.", 3, 7),
            new SevenSecCard("7s-006", "Pays d'Afrique", "Cite 3 pays d'Afrique.", 3, 7),
            new SevenSecCard("7s-007", "Fromages français", "Nommes 3 fromages français.", 3, 7),
            new SevenSecCard("7s-008", "Films cultes", "Donne 3 films célèbres.", 3, 7),
            new SevenSecCard("7s-009", "Légumes verts", "Donne 3 légumes verts.", 3, 7),
            new SevenSecCard("7s-010", "Sports de ballon", "Cite 3 sports de ballon.", 3, 7)
    );

    private static final Pattern CITE_PATTERN = Pattern.compile("^(?:Cite|Donne|Nommes?|Trouve|Énumère|Dis)\\s+(?:3|trois)\\s+(.*)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern FAIS_PATTERN = Pattern.compile("^Fais\\s+(?:3|trois)\\s+(.*)$", Pattern.CASE_INSENSITIVE);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();
    private List<SevenSecCard> cards = Collections.unmodifiableList(FALLBACK_CARDS);

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource resource = resolver.getResource("classpath:data/7sec.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    List<SevenSecCard> loaded = new ArrayList<>();

                    if (root.has("items") && root.get("items").isArray()) {
                        for (JsonNode it : root.get("items")) {
                            String id = it.has("id") ? it.get("id").asText() : "7s-" + (loaded.size() + 1);
                            String theme = it.has("theme") ? it.get("theme").asText() : "Général";
                            String prompt = it.has("prompt") ? it.get("prompt").asText() : "";
                            int count = it.has("count") ? it.get("count").asInt(3) : 3;
                            int temps = it.has("temps") ? it.get("temps").asInt(7) : 7;
                            if (!prompt.isBlank()) {
                                loaded.add(new SevenSecCard(id, theme, prompt, count, temps));
                            }
                        }
                    } else if (root.has("questions") && root.get("questions").isArray()) {
                        int idx = 0;
                        for (JsonNode qNode : root.get("questions")) {
                            idx++;
                            String prompt = qNode.asText();
                            String theme = extractTheme(prompt);
                            loaded.add(new SevenSecCard("7s-" + String.format("%04d", idx), theme, prompt, 3, 7));
                        }
                    }

                    if (!loaded.isEmpty()) {
                        this.cards = Collections.unmodifiableList(loaded);
                        log.info("Chargé {} cartes typées pour 7 Secondes.", this.cards.size());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Impossible de charger data/7sec.json, repli sur le deck par défaut: {}", e.getMessage());
        }
    }

    public List<SevenSecCard> getCards() {
        return cards;
    }

    public List<SevenSecCard> createShuffledDeck() {
        List<SevenSecCard> copy = new ArrayList<>(cards);
        Collections.shuffle(copy, secureRandom);
        return copy;
    }

    private String extractTheme(String prompt) {
        if (prompt == null || prompt.isBlank()) return "Général";
        String s = prompt.trim().replaceAll("\\.$", "");
        Matcher mCite = CITE_PATTERN.matcher(s);
        if (mCite.find()) {
            String t = mCite.group(1).trim();
            return Character.toUpperCase(t.charAt(0)) + t.substring(1);
        }
        Matcher mFais = FAIS_PATTERN.matcher(s);
        if (mFais.find()) {
            String t = mFais.group(1).trim();
            return "Défi : " + Character.toUpperCase(t.charAt(0)) + t.substring(1);
        }
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
