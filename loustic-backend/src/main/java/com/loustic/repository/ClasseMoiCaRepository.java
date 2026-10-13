package com.loustic.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

/**
 * Repository immuable pour les thèmes de "Classe moi ça" (Style Top Ten / Ito).
 * Charge classemoica.json avec support du mode normal et du mode hot / NSFW.
 */
@Repository
public class ClasseMoiCaRepository {

    private static final Logger log = LoggerFactory.getLogger(ClasseMoiCaRepository.class);

    private static final List<String> FALLBACK_NORMAL = List.of(
            "De la pire à la meilleure excuse pour arriver en retard.",
            "De 'complètement inutile' à 'divin' : un super-pouvoir.",
            "De la pire à la meilleure façon de rompre avec quelqu'un.",
            "De 'légèrement agaçant' à 'insupportable' : un comportement dans les transports.",
            "De 'geste symbolique' à 'incroyablement extravagant' : le cadeau d'anniversaire.",
            "Du plus nul au plus héroïque : une façon d'échapper à une attaque de zombies.",
            "De 'pas idéal' à 'catastrophe totale' : trouver quelque chose dans son lit le matin.",
            "De 'petit bobo' à 'je vois la lumière' : le niveau de douleur d'une blessure du quotidien.",
            "De 'timide' à 'déclaration de guerre' : votre première phrase à un extraterrestre.",
            "De 'très simple' à 'chef 3 étoiles' : un plat cuisiné pour impressionner son date."
    );

    private static final List<String> FALLBACK_HOT = List.of(
            "Du pire au meilleur endroit insolite pour faire l'amour.",
            "Du pire au meilleur fantasme à avouer à son partenaire.",
            "De 'gênant' à 'motif de rupture immédiat' : un secret intime découvert.",
            "Du plus soft au plus torride : un message de drague envoyé à 2h du matin.",
            "Du moins sexy au plus irrésistible : une tenue pour une soirée coquine."
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    private List<String> normalThemes = Collections.unmodifiableList(FALLBACK_NORMAL);
    private List<String> hotThemes = Collections.unmodifiableList(FALLBACK_HOT);

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource resource = resolver.getResource("classpath:data/classemoica.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    List<String> loadedNormal = new ArrayList<>();
                    List<String> loadedHot = new ArrayList<>();

                    if (root.has("themes") && root.get("themes").isArray()) {
                        for (JsonNode node : root.get("themes")) {
                            if (node.isTextual()) {
                                String t = node.asText().trim();
                                if (!t.isBlank()) loadedNormal.add(t);
                            } else if (node.isObject()) {
                                if (node.has("themeA") && !node.get("themeA").asText().isBlank()) {
                                    loadedNormal.add(node.get("themeA").asText().trim());
                                }
                                if (node.has("themeB") && !node.get("themeB").asText().isBlank()) {
                                    loadedNormal.add(node.get("themeB").asText().trim());
                                }
                            }
                        }
                    }

                    if (root.has("hotThemes") && root.get("hotThemes").isArray()) {
                        for (JsonNode node : root.get("hotThemes")) {
                            if (node.isTextual()) {
                                String t = node.asText().trim();
                                if (!t.isBlank()) loadedHot.add(t);
                            } else if (node.isObject()) {
                                if (node.has("themeA") && !node.get("themeA").asText().isBlank()) {
                                    loadedHot.add(node.get("themeA").asText().trim());
                                }
                                if (node.has("themeB") && !node.get("themeB").asText().isBlank()) {
                                    loadedHot.add(node.get("themeB").asText().trim());
                                }
                            }
                        }
                    }

                    if (!loadedNormal.isEmpty()) {
                        this.normalThemes = Collections.unmodifiableList(loadedNormal);
                    }
                    if (!loadedHot.isEmpty()) {
                        this.hotThemes = Collections.unmodifiableList(loadedHot);
                    }

                    log.info("Chargé Classe moi ça : {} thèmes normaux, {} thèmes hot.",
                            this.normalThemes.size(), this.hotThemes.size());
                }
            }
        } catch (Exception e) {
            log.warn("Impossible de charger data/classemoica.json : {}", e.getMessage());
        }
    }

    public List<String> getThemes(boolean hotMode) {
        return hotMode ? hotThemes : normalThemes;
    }

    public List<String> createShuffledDeck(boolean hotMode) {
        List<String> deck = new ArrayList<>(getThemes(hotMode));
        Collections.shuffle(deck, secureRandom);
        return deck;
    }
}
