package com.loustic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service centralisant l'accès aux bases de données JSON des jeux (classpath:data/*.json).
 * Offre un accès dynamique et un cache mémoire pour servir les données aux jeux front.
 */
@Service
public class GameDataService {

    private static final Logger log = LoggerFactory.getLogger(GameDataService.class);
    private static final String JSON_LOCATION = "classpath:data/*.json";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, JsonNode> cache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        loadAllJson();
    }

    public void loadAllJson() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources(JSON_LOCATION);
            for (Resource res : resources) {
                String filename = res.getFilename();
                if (filename == null || !filename.endsWith(".json")) continue;
                String key = filename.substring(0, filename.length() - ".json".length()).toLowerCase();
                try (InputStream is = res.getInputStream()) {
                    JsonNode node = objectMapper.readTree(is);
                    cache.put(key, node);
                    log.info("📁 Base de données de jeu chargée : key='{}' ({})", key, filename);
                } catch (Exception e) {
                    log.warn("Erreur lecture {}: {}", filename, e.getMessage());
                }
            }
            log.info("Total bases de données JSON prêtes : {} jeux", cache.size());
        } catch (IOException e) {
            log.error("Erreur lors de la découverte des fichiers JSON: {}", e.getMessage());
        }
    }

    public Optional<JsonNode> getData(String key) {
        if (key == null) return Optional.empty();
        String cleanKey = key.trim().toLowerCase();

        // Recherche par clé exacte
        if (cache.containsKey(cleanKey)) {
            return Optional.of(cache.get(cleanKey));
        }

        // Recherche normalisée sans tirets / underscores
        String normalized = cleanKey.replaceAll("[^a-z0-9]", "");
        for (Map.Entry<String, JsonNode> entry : cache.entrySet()) {
            if (entry.getKey().replaceAll("[^a-z0-9]", "").equals(normalized)) {
                return Optional.of(entry.getValue());
            }
        }

        // Essai de relecture dynamique à la demande
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource res = resolver.getResource("classpath:data/" + cleanKey + ".json");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    JsonNode node = objectMapper.readTree(is);
                    cache.put(cleanKey, node);
                    return Optional.of(node);
                }
            }
        } catch (Exception ignored) {}

        return Optional.empty();
    }

    public Map<String, Object> listAvailable() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("total", cache.size());
        res.put("keys", new ArrayList<>(cache.keySet()));
        return res;
    }
}
