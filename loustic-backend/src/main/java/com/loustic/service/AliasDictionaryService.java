package com.loustic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service de dictionnaire de mots pour Alias (style Codenames).
 * Charge la liste de mots depuis data/alias.json (ou Alias/words.js)
 * et fournit des tirages sans doublon de 30 mots pour le plateau 6x5.
 */
@Service
public class AliasDictionaryService {

    private static final Logger log = LoggerFactory.getLogger(AliasDictionaryService.class);

    private final List<String> words = new CopyOnWriteArrayList<>();
    private final Set<String> wordSet = Collections.synchronizedSet(new HashSet<>());
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource csvResource = resolver.getResource("classpath:data/alias_words.csv");

            if (csvResource.exists()) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(csvResource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        String[] parts = line.split(",");
                        if (parts.length >= 2 && !parts[0].trim().equalsIgnoreCase("id")) {
                            String w = parts[1].trim().toUpperCase(Locale.FRENCH);
                            if (!w.isEmpty() && wordSet.add(w)) {
                                words.add(w);
                            }
                        }
                    }
                }
            }

            if (words.isEmpty()) {
                Resource resource = resolver.getResource("classpath:data/alias.json");
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        JsonNode root = objectMapper.readTree(is);
                        JsonNode wordsNode = root.get("words");
                        if (wordsNode != null && wordsNode.isArray()) {
                            for (JsonNode item : wordsNode) {
                                String w = item.asText().trim().toUpperCase(Locale.FRENCH);
                                if (!w.isEmpty() && wordSet.add(w)) {
                                    words.add(w);
                                }
                            }
                        }
                    }
                }
            }

            if (words.isEmpty()) {
                log.warn("alias.json introuvable ou vide, chargement des mots de secours.");
                List<String> fallback = List.of(
                        "CHAT", "CHIEN", "MAISON", "VOITURE", "ARBRE", "SOLEIL", "LUNE", "ETOILE", "PORTE", "FENETRE",
                        "TABLE", "CHAISE", "LIT", "LAMPE", "LIVRE", "STYLO", "CRAYON", "PAPIER", "SAC", "CLE",
                        "BALLON", "POMME", "BANANE", "ORANGE", "RAISIN", "FRAISE", "CERISE", "TOMATE", "CAROTTE", "PAIN",
                        "FROMAGE", "EAU", "LAIT", "CAFE", "THE", "JUS", "GATEAU", "PIZZA", "RIZ", "PATES"
                );
                words.addAll(fallback);
                wordSet.addAll(fallback);
            }

            log.info("🎯 AliasDictionaryService initialisé : {} mots uniques chargés.", words.size());
        } catch (Exception e) {
            log.error("Erreur lors du chargement du dictionnaire Alias", e);
        }
    }

    /**
     * Génère une sélection de mots aléatoires uniques pour la grille de jeu.
     * @param count nombre de mots demandés (typiquement 30 pour 6x5)
     */
    public List<String> getRandomBoardWords(int count) {
        List<String> copy = new ArrayList<>(words);
        Collections.shuffle(copy, secureRandom);
        return copy.subList(0, Math.min(count, copy.size()));
    }

    public boolean containsWord(String word) {
        if (word == null) return false;
        return wordSet.contains(word.trim().toUpperCase(Locale.FRENCH));
    }

    public int totalWords() {
        return words.size();
    }
}
