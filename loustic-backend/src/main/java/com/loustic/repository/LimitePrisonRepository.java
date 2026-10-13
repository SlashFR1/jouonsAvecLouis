package com.loustic.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loustic.model.BlackCard;
import com.loustic.model.WhiteCard;
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
 * Repository immuable pour les cartes de Limite PRISON (Style Cards Against Humanity).
 * Charge le fichier statique limiteprison.json (740 cartes noires, 1099 cartes blanches).
 */
@Repository
public class LimitePrisonRepository {

    private static final Logger log = LoggerFactory.getLogger(LimitePrisonRepository.class);

    private static final List<BlackCard> FALLBACK_BLACK_CARDS = List.of(
            new BlackCard("bc-001", "Pour séduire, rien de tel que ___.", 1),
            new BlackCard("bc-002", "Le nouveau régime à la mode : ne manger que ___.", 1),
            new BlackCard("bc-003", "___ : c'est bon, mais c'est sale.", 1),
            new BlackCard("bc-004", "Hier, j'ai perdu mon emploi à cause de ___.", 1),
            new BlackCard("bc-005", "Dans le futur, les livres d'histoire parleront de ___.", 1),
            new BlackCard("bc-006", "Mon super-pouvoir caché, c'est ___.", 1),
            new BlackCard("bc-007", "Papa, Maman, je vous présente ___.", 1),
            new BlackCard("bc-008", "Ce soir au 20h de TF1 : un reportage choc sur ___.", 1),
            new BlackCard("bc-009", "Le secret pour ne pas payer ses impôts ? ___.", 1),
            new BlackCard("bc-010", "Pour mon enterrement de vie de célibataire, je veux ___.", 1)
    );

    private static final List<WhiteCard> FALLBACK_WHITE_CARDS = List.of(
            new WhiteCard("wc-001", "Un kebab sauce samouraï à 4h du matin."),
            new WhiteCard("wc-002", "Danser la macarena tout nu sous la pluie."),
            new WhiteCard("wc-003", "Une chaussette trouée mais porte-bonheur."),
            new WhiteCard("wc-004", "Le sosie raté de Vin Diesel."),
            new WhiteCard("wc-005", "Payer ses courses en pièces de 1 centime."),
            new WhiteCard("wc-006", "Un tuto YouTube en 240p fait par un enfant de 8 ans."),
            new WhiteCard("wc-007", "Faire semblant d'être au téléphone pour éviter quelqu'un."),
            new WhiteCard("wc-008", "Une tartine de confiture tombée du mauvais côté."),
            new WhiteCard("wc-009", "Un date Tinder qui parle uniquement de ses cryptomonnaies."),
            new WhiteCard("wc-010", "Pleurer devant une publicité pour de la litière pour chat.")
    );

    private static final Pattern BLANKS_PATTERN = Pattern.compile("_{2,}");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    private List<BlackCard> blackCards = Collections.unmodifiableList(FALLBACK_BLACK_CARDS);
    private List<WhiteCard> whiteCards = Collections.unmodifiableList(FALLBACK_WHITE_CARDS);

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource qCsv = resolver.getResource("classpath:data/limiteprison_questions.csv");
            Resource aCsv = resolver.getResource("classpath:data/limiteprison_answers.csv");

            List<BlackCard> loadedBlack = new ArrayList<>();
            List<WhiteCard> loadedWhite = new ArrayList<>();

            if (qCsv.exists()) {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(qCsv.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("id,")) continue;
                        int commaIdx = line.indexOf(',');
                        if (commaIdx > 0) {
                            String id = line.substring(0, commaIdx).trim();
                            String text = line.substring(commaIdx + 1).trim();
                            if (text.startsWith("\"") && text.endsWith("\"") && text.length() >= 2) {
                                text = text.substring(1, text.length() - 1);
                            }
                            if (!text.isEmpty()) {
                                loadedBlack.add(new BlackCard("bc-" + id, text, countBlanks(text)));
                            }
                        }
                    }
                }
            }

            if (aCsv.exists()) {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(aCsv.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("id,")) continue;
                        int commaIdx = line.indexOf(',');
                        if (commaIdx > 0) {
                            String id = line.substring(0, commaIdx).trim();
                            String text = line.substring(commaIdx + 1).trim();
                            if (text.startsWith("\"") && text.endsWith("\"") && text.length() >= 2) {
                                text = text.substring(1, text.length() - 1);
                            }
                            if (!text.isEmpty()) {
                                loadedWhite.add(new WhiteCard("wc-" + id, text));
                            }
                        }
                    }
                }
            }

            if (!loadedBlack.isEmpty() && !loadedWhite.isEmpty()) {
                this.blackCards = Collections.unmodifiableList(loadedBlack);
                this.whiteCards = Collections.unmodifiableList(loadedWhite);
                log.info("Chargé Limite PRISON (CSV) : {} cartes noires, {} cartes blanches.",
                        this.blackCards.size(), this.whiteCards.size());
                return;
            }

            // Fallback JSON
            Resource resource = resolver.getResource("classpath:data/limiteprison.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    if (root.has("blackCards") && root.get("blackCards").isArray()) {
                        for (JsonNode node : root.get("blackCards")) {
                            String id = node.has("id") ? node.get("id").asText() : "bc-" + (loadedBlack.size() + 1);
                            String text = node.has("text") ? node.get("text").asText() : "";
                            int blanks = node.has("blanksCount") ? node.get("blanksCount").asInt(1) : countBlanks(text);
                            if (!text.isBlank()) loadedBlack.add(new BlackCard(id, text, blanks));
                        }
                    }
                    if (root.has("whiteCards") && root.get("whiteCards").isArray()) {
                        for (JsonNode node : root.get("whiteCards")) {
                            String id = node.has("id") ? node.get("id").asText() : "wc-" + (loadedWhite.size() + 1);
                            String text = node.has("text") ? node.get("text").asText() : "";
                            if (!text.isBlank()) loadedWhite.add(new WhiteCard(id, text));
                        }
                    }
                    if (!loadedBlack.isEmpty()) this.blackCards = Collections.unmodifiableList(loadedBlack);
                    if (!loadedWhite.isEmpty()) this.whiteCards = Collections.unmodifiableList(loadedWhite);
                }
            }
        } catch (Exception e) {
            log.warn("Erreur chargement Limite PRISON : {}", e.getMessage());
        }
    }

    public List<BlackCard> getBlackCards() {
        return blackCards;
    }

    public List<WhiteCard> getWhiteCards() {
        return whiteCards;
    }

    public List<BlackCard> createShuffledBlackDeck() {
        List<BlackCard> copy = new ArrayList<>(blackCards);
        Collections.shuffle(copy, secureRandom);
        return copy;
    }

    public List<WhiteCard> createShuffledWhiteDeck() {
        List<WhiteCard> copy = new ArrayList<>(whiteCards);
        Collections.shuffle(copy, secureRandom);
        return copy;
    }

    private int countBlanks(String text) {
        if (text == null || text.isBlank()) return 1;
        Matcher m = BLANKS_PATTERN.matcher(text);
        int count = 0;
        while (m.find()) count++;
        return Math.max(1, count);
    }
}
