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
 * Repository immuable pour les thèmes et gages de "Boom boom" (La Bombe).
 * Charge les données depuis le JSON statique bomb.json (ou valeurs de secours de bomb2.js).
 */
@Repository
public class BombRepository {

    private static final Logger log = LoggerFactory.getLogger(BombRepository.class);

    private static final List<String> FALLBACK_THEMES = List.of(
            "Marques de voitures", "Animaux sauvages", "Choses qu'on trouve dans un frigo",
            "Pays d'Europe", "Super-héros", "Films d'animation", "Objets qui font du bruit",
            "Capitales du monde", "Matières scolaires", "Choses rondes", "Sports olympiques",
            "Choses qui volent", "Personnages de dessins animés", "Plats italiens",
            "Séries Netflix", "Choses sucrées", "Marques de vêtements", "Instruments de musique",
            "Villes de France", "Objets électroniques", "Jeux vidéo cultes", "Métiers dangereux",
            "Choses qui sentent bon", "Choses piquantes", "Moyens de transport", "Cocktails et boissons"
    );

    private static final List<String> FALLBACK_GAGES = List.of(
            "Bois 2 gorgées et fais 5 pompes !",
            "Fais l'imitation d'un poulet jusqu'au prochain tour.",
            "Révèle le dernier message que tu as reçu sur ton téléphone.",
            "Bois 1 shot les yeux fermés.",
            "Laisse la personne à ta droite envoyer un emoji de son choix à un de tes contacts.",
            "Chante le refrain d'une chanson choisie par les autres joueurs.",
            "Raconte ta pire honte en soirée ou bois 3 gorgées.",
            "Reste immobile comme une statue pendant tout le prochain tour.",
            "Imite une célébrité jusqu'à ce que quelqu'un devine !",
            "Fais un compliment sincère à chaque joueur autour de la table."
    );

    private final SecureRandom secureRandom = new SecureRandom();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<String> themes = Collections.unmodifiableList(FALLBACK_THEMES);
    private List<String> gages = Collections.unmodifiableList(FALLBACK_GAGES);

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource resource = resolver.getResource("classpath:data/bomb.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    List<String> loadedThemes = new ArrayList<>();
                    if (root.has("themes") && root.get("themes").isArray()) {
                        for (JsonNode t : root.get("themes")) {
                            loadedThemes.add(t.asText());
                        }
                    }
                    List<String> loadedGages = new ArrayList<>();
                    if (root.has("gages") && root.get("gages").isArray()) {
                        for (JsonNode g : root.get("gages")) {
                            loadedGages.add(g.asText());
                        }
                    }

                    if (!loadedThemes.isEmpty()) {
                        this.themes = Collections.unmodifiableList(loadedThemes);
                    }
                    if (!loadedGages.isEmpty()) {
                        this.gages = Collections.unmodifiableList(loadedGages);
                    }
                    log.info("💣 BombRepository initialisé : {} thèmes, {} gages", this.themes.size(), this.gages.size());
                }
            }
        } catch (Exception e) {
            log.warn("Chargement de bomb.json échoué, utilisation des valeurs de secours : {}", e.getMessage());
        }
    }

    public List<String> getThemes() {
        return themes;
    }

    public List<String> getGages() {
        return gages;
    }

    public String getRandomTheme() {
        return getRandomTheme(Collections.emptySet());
    }

    public String getRandomTheme(java.util.Set<String> used) {
        if (themes.isEmpty()) return "Marques de voitures";
        List<String> pool = new ArrayList<>();
        for (String t : themes) {
            if (used == null || !used.contains(t)) pool.add(t);
        }
        if (pool.isEmpty()) pool.addAll(themes);
        return pool.get(secureRandom.nextInt(pool.size()));
    }

    public String getRandomGage() {
        return getRandomGage(Collections.emptySet());
    }

    public String getRandomGage(java.util.Set<String> used) {
        if (gages.isEmpty()) return "Bois 2 gorgées !";
        List<String> pool = new ArrayList<>();
        for (String g : gages) {
            if (used == null || !used.contains(g)) pool.add(g);
        }
        if (pool.isEmpty()) pool.addAll(gages);
        return pool.get(secureRandom.nextInt(pool.size()));
    }
}
