package com.loustic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.loustic.model.GameDeck;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Charge au démarrage TOUS les fichiers statiques {@code classpath:data/*.json}
 * et {@code classpath:data/*.csv} en mémoire vive (RAM / Cache).
 * Clé du deck = nom normalisé du jeu (ex: "7sec_prompts", "bomb_themes", "limiteprison_questions").
 */
@Service
public class CsvDataLoaderService {

    private static final Logger log = LoggerFactory.getLogger(CsvDataLoaderService.class);
    private static final String CSV_LOCATION = "classpath:data/*.csv";
    private static final String JSON_LOCATION = "classpath:data/*.json";

    private final CsvMapper csvMapper = new CsvMapper();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile Map<String, GameDeck> decks = Map.of();

    @PostConstruct
    public void loadAllData() throws IOException {
        Map<String, GameDeck> loaded = new TreeMap<>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        // 1. Chargement des bases statiques JSON primordiales
        try {
            Resource[] jsonResources = resolver.getResources(JSON_LOCATION);
            for (Resource resource : jsonResources) {
                String filename = resource.getFilename();
                if (filename == null || !filename.endsWith(".json")) continue;
                try {
                    loadJsonDecks(filename, resource, loaded);
                } catch (Exception e) {
                    log.error("❌ Erreur de chargement JSON pour {} : {}", filename, e.getMessage());
                }
            }
        } catch (IOException e) {
            log.warn("Aucun fichier JSON trouvé ou erreur de lecture : {}", e.getMessage());
        }

        // 2. Chargement des fichiers CSV (pour rétrocompatibilité et complétude)
        try {
            Resource[] csvResources = resolver.getResources(CSV_LOCATION);
            for (Resource resource : csvResources) {
                String filename = resource.getFilename();
                if (filename == null || !filename.endsWith(".csv")) continue;
                String key = filename.substring(0, filename.length() - ".csv".length());
                if (!loaded.containsKey(key)) {
                    try {
                        GameDeck deck = parseCsv(key, resource);
                        loaded.put(key, deck);
                        log.info("✅ Deck CSV '{}' chargé : {} cartes", key, deck.size());
                    } catch (IOException | RuntimeException e) {
                        log.error("❌ Erreur de chargement CSV pour {} : {}", filename, e.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            log.warn("Aucun fichier CSV trouvé : {}", e.getMessage());
        }

        decks = Collections.unmodifiableMap(loaded);
        log.info("🎉 Total des decks chargés en mémoire : {}", decks.size());
    }

    private void loadJsonDecks(String filename, Resource resource, Map<String, GameDeck> loaded) throws IOException {
        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            String baseKey = filename.substring(0, filename.length() - ".json".length());

            if ("bomb".equals(baseKey)) {
                if (root.has("themes")) {
                    List<Map<String, String>> themeRows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("themes")) {
                        themeRows.add(Map.of("id", String.valueOf(idx++), "theme", item.asText()));
                    }
                    GameDeck themesDeck = new GameDeck("bomb_themes", List.of("id", "theme"), themeRows);
                    loaded.put("bomb_themes", themesDeck);
                    loaded.put("bomb", themesDeck);
                }
                if (root.has("gages")) {
                    List<Map<String, String>> gageRows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("gages")) {
                        gageRows.add(Map.of("id", String.valueOf(idx++), "gage", item.asText()));
                    }
                    loaded.put("bomb_gages", new GameDeck("bomb_gages", List.of("id", "gage"), gageRows));
                }
            } else if ("7sec".equals(baseKey)) {
                if (root.has("questions")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("questions")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "challenge", item.asText(), "texte", item.asText(), "temps_secondes", "7"));
                    }
                    GameDeck deck = new GameDeck("7sec_prompts", List.of("id", "challenge", "texte", "temps_secondes"), rows);
                    loaded.put("7sec_prompts", deck);
                    loaded.put("7sec", deck);
                }
            } else if ("alias".equals(baseKey)) {
                if (root.has("words")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("words")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "mot", item.asText(), "texte", item.asText()));
                    }
                    GameDeck deck = new GameDeck("alias_words", List.of("id", "mot", "texte"), rows);
                    loaded.put("alias_words", deck);
                    loaded.put("alias", deck);
                }
            } else if ("limiteprison".equals(baseKey)) {
                if (root.has("questions")) {
                    List<Map<String, String>> qRows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("questions")) {
                        qRows.add(Map.of("id", String.valueOf(idx++), "texte", item.asText(), "question", item.asText()));
                    }
                    loaded.put("limiteprison_questions", new GameDeck("limiteprison_questions", List.of("id", "texte", "question"), qRows));
                }
                if (root.has("answers")) {
                    List<Map<String, String>> aRows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("answers")) {
                        aRows.add(Map.of("id", String.valueOf(idx++), "texte", item.asText(), "reponse", item.asText()));
                    }
                    loaded.put("limiteprison_answers", new GameDeck("limiteprison_answers", List.of("id", "texte", "reponse"), aRows));
                }
            } else if ("classemoica".equals(baseKey)) {
                List<Map<String, String>> rows = new ArrayList<>();
                int idx = 1;
                if (root.has("themes")) {
                    for (JsonNode item : root.get("themes")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "theme", item.asText(), "texte", item.asText(), "mode", "normal"));
                    }
                }
                if (root.has("hotThemes")) {
                    for (JsonNode item : root.get("hotThemes")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "theme", item.asText(), "texte", item.asText(), "mode", "hot"));
                    }
                }
                GameDeck deck = new GameDeck("classemoica_themes", List.of("id", "theme", "texte", "mode"), rows);
                loaded.put("classemoica_themes", deck);
                loaded.put("classemoica", deck);
            } else if ("spy".equals(baseKey)) {
                if (root.has("lieux")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("lieux")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "lieu", item.asText(), "location", item.asText(), "texte", item.asText()));
                    }
                    GameDeck deck = new GameDeck("spy_locations", List.of("id", "lieu", "location", "texte"), rows);
                    loaded.put("spy_locations", deck);
                    loaded.put("spy", deck);
                }
            } else if ("lataupe".equals(baseKey)) {
                if (root.has("words")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    Iterator<Map.Entry<String, JsonNode>> fields = root.get("words").fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> entry = fields.next();
                        String main = entry.getKey();
                        String mole = entry.getValue().isArray() && entry.getValue().size() > 0
                                ? entry.getValue().get(0).asText()
                                : main;
                        rows.add(Map.of("id", String.valueOf(idx++), "mainWord", main, "moleWord", mole));
                    }
                    GameDeck deck = new GameDeck("lataupe_words", List.of("id", "mainWord", "moleWord"), rows);
                    loaded.put("lataupe_words", deck);
                    loaded.put("lataupe", deck);
                }
            } else if ("racontemoi".equals(baseKey)) {
                if (root.has("stories")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    for (JsonNode item : root.get("stories")) {
                        Map<String, String> row = new LinkedHashMap<>();
                        row.put("id", item.has("id") ? item.get("id").asText() : "");
                        row.put("theme", item.has("theme") ? item.get("theme").asText() : "");
                        row.put("title", item.has("title") ? item.get("title").asText() : "");
                        row.put("story", item.has("story") ? item.get("story").asText() : "");
                        row.put("keyPhrase", item.has("keyPhrase") ? item.get("keyPhrase").asText() : "");
                        rows.add(row);
                    }
                    GameDeck deck = new GameDeck("racontemoi_stories", List.of("id", "theme", "title", "story", "keyPhrase"), rows);
                    loaded.put("racontemoi_stories", deck);
                    loaded.put("racontemoi", deck);
                }
            } else if ("jenaijamais".equals(baseKey)) {
                List<Map<String, String>> rows = new ArrayList<>();
                int idx = 1;
                if (root.has("normal")) {
                    for (JsonNode item : root.get("normal")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "texte", item.asText(), "mode", "normal"));
                    }
                }
                if (root.has("hot")) {
                    for (JsonNode item : root.get("hot")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "texte", item.asText(), "mode", "hot"));
                    }
                }
                loaded.put("jenaijamais", new GameDeck("jenaijamais", List.of("id", "texte", "mode"), rows));
            } else if ("switch".equals(baseKey)) {
                List<Map<String, String>> rows = new ArrayList<>();
                int idx = 1;
                if (root.has("normal")) {
                    for (JsonNode item : root.get("normal")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "action", item.asText(), "texte", item.asText(), "mode", "normal"));
                    }
                }
                if (root.has("hot")) {
                    for (JsonNode item : root.get("hot")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "action", item.asText(), "texte", item.asText(), "mode", "hot"));
                    }
                }
                loaded.put("switch", new GameDeck("switch", List.of("id", "action", "texte", "mode"), rows));
            } else if ("vraioufaux".equals(baseKey)) {
                if (root.has("affirmations")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    Iterator<Map.Entry<String, JsonNode>> fields = root.get("affirmations").fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> entry = fields.next();
                        String cat = entry.getKey();
                        for (JsonNode aff : entry.getValue()) {
                            boolean isTrue = aff.has("answer") && aff.get("answer").asBoolean();
                            String text = aff.has("question") ? aff.get("question").asText()
                                    : (aff.has("text") ? aff.get("text").asText() : (aff.has("affirmation") ? aff.get("affirmation").asText() : ""));
                            String expl = aff.has("explanation") ? aff.get("explanation").asText()
                                    : (aff.has("explication") ? aff.get("explication").asText() : "");
                            Map<String, String> row = new LinkedHashMap<>();
                            row.put("id", String.valueOf(idx++));
                            row.put("categorie", cat);
                            row.put("affirmation", text);
                            row.put("texte", text);
                            row.put("question", text);
                            row.put("reponse", isTrue ? "VRAI" : "FAUX");
                            row.put("explication", expl);
                            rows.add(Collections.unmodifiableMap(row));
                        }
                    }
                    loaded.put("vraioufaux", new GameDeck("vraioufaux", List.of("id", "categorie", "affirmation", "texte", "question", "reponse", "explication"), rows));
                }
            } else if ("tupreferes".equals(baseKey)) {
                if (root.has("pairs")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("pairs")) {
                        String t = item.isTextual() ? item.asText() : (item.has("texte") ? item.get("texte").asText() : item.toString());
                        Map<String, String> row = new LinkedHashMap<>();
                        row.put("id", String.valueOf(idx++));
                        row.put("texte", t);
                        row.put("affirmation", t);
                        row.put("prompt", t);
                        rows.add(Collections.unmodifiableMap(row));
                    }
                    loaded.put("tupreferes", new GameDeck("tupreferes", List.of("id", "texte", "affirmation", "prompt"), rows));
                }
            } else if ("voteoushot".equals(baseKey)) {
                if (root.has("questions")) {
                    List<Map<String, String>> rows = new ArrayList<>();
                    int idx = 1;
                    for (JsonNode item : root.get("questions")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "texte", item.asText(), "question", item.asText()));
                    }
                    loaded.put("voteoushot", new GameDeck("voteoushot", List.of("id", "texte", "question"), rows));
                }
            } else if ("juge".equals(baseKey)) {
                List<Map<String, String>> rows = new ArrayList<>();
                int idx = 1;
                if (root.has("normal")) {
                    for (JsonNode item : root.get("normal")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "affaire", item.asText(), "texte", item.asText(), "mode", "normal"));
                    }
                }
                if (root.has("hot")) {
                    for (JsonNode item : root.get("hot")) {
                        rows.add(Map.of("id", String.valueOf(idx++), "affaire", item.asText(), "texte", item.asText(), "mode", "hot"));
                    }
                }
                loaded.put("juge", new GameDeck("juge", List.of("id", "affaire", "texte", "mode"), rows));
            }
        }
    }

    private GameDeck parseCsv(String key, Resource resource) throws IOException {
        CsvSchema schema = CsvSchema.emptySchema().withHeader();
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             MappingIterator<Map<String, String>> it = csvMapper
                     .readerFor(Map.class)
                     .with(schema)
                     .with(CsvParser.Feature.SKIP_EMPTY_LINES)
                     .with(CsvParser.Feature.TRIM_SPACES)
                     .readValues(reader)) {
            List<Map<String, String>> rows = new ArrayList<>();
            while (it.hasNext()) {
                rows.add(Collections.unmodifiableMap(new LinkedHashMap<>(it.next())));
            }
            CsvSchema parsed = (CsvSchema) it.getParserSchema();
            List<String> columns = new ArrayList<>();
            parsed.forEach(col -> columns.add(col.getName()));
            return new GameDeck(key, columns, rows);
        }
    }

    public Collection<GameDeck> getAllDecks() {
        return decks.values();
    }

    public Optional<GameDeck> getDeck(String key) {
        return Optional.ofNullable(decks.get(key));
    }

    /**
     * Cartes filtrées : chaque entrée de {@code filters} dont la clé est une colonne du deck
     * doit correspondre (insensible à la casse). Les clés inconnues sont ignorées.
     */
    public List<Map<String, String>> query(GameDeck deck, Map<String, String> filters, boolean shuffle, Integer limit) {
        List<Map<String, String>> result = new ArrayList<>();
        for (Map<String, String> card : deck.cards()) {
            boolean match = filters.entrySet().stream()
                    .filter(f -> deck.columns().contains(f.getKey()))
                    .allMatch(f -> f.getValue().equalsIgnoreCase(card.getOrDefault(f.getKey(), "")));
            if (match) result.add(card);
        }
        if (shuffle) Collections.shuffle(result, ThreadLocalRandom.current());
        if (limit != null && limit >= 0 && limit < result.size()) {
            result = new ArrayList<>(result.subList(0, limit));
        }
        return result;
    }

    /** Carte aléatoire d'un deck (utilisée par les moteurs de jeu côté serveur). */
    public Optional<Map<String, String>> randomCard(String key) {
        return getDeck(key)
                .filter(d -> d.size() > 0)
                .map(d -> d.cards().get(ThreadLocalRandom.current().nextInt(d.size())));
    }
}
