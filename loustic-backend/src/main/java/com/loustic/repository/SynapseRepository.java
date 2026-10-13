package com.loustic.repository;

import com.loustic.model.SynapseBonus;
import com.loustic.model.SynapseQuestion;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Repository pour Synapse (Style TTMC - Tu Te Mets Combien ?).
 * Charge synapse_questions.csv (échelons 1 à 10) et synapse_bonus.csv (cartes défis).
 */
@Repository
public class SynapseRepository {

    private static final Logger log = LoggerFactory.getLogger(SynapseRepository.class);

    private static final List<SynapseQuestion> FALLBACK_QUESTIONS = List.of(
            new SynapseQuestion(1, "q1_1", 1, "De quelle couleur est le cheval blanc d'Henri IV ?", "Blanc"),
            new SynapseQuestion(2, "q1_2", 1, "Combien y a-t-il de jours dans une semaine ?", "7 jours"),
            new SynapseQuestion(5, "q2_1", 2, "Quelle est la capitale de la France ?", "Paris"),
            new SynapseQuestion(9, "q3_1", 3, "Quel est le plus grand océan de la planète Terre ?", "L'océan Pacifique"),
            new SynapseQuestion(13, "q4_1", 4, "Quel est le symbole chimique de l'eau ?", "H2O"),
            new SynapseQuestion(17, "q5_1", 5, "Combien d'os compte le squelette d'un être humain adulte ?", "206 os"),
            new SynapseQuestion(21, "q6_1", 6, "Quelle est la vitesse approximative de la lumière dans le vide (en km/s) ?", "300 000 km/s"),
            new SynapseQuestion(25, "q7_1", 7, "En quelle année l'Homme a-t-il marché sur la Lune pour la première fois ?", "1969"),
            new SynapseQuestion(29, "q8_1", 8, "Quel est le métal le plus abondant dans la croûte terrestre ?", "L'aluminium"),
            new SynapseQuestion(33, "q9_1", 9, "Quel philosophe grec antique a été condamné à boire la ciguë en 399 av. J.-C. ?", "Socrate"),
            new SynapseQuestion(37, "q10_1", 10, "En aviron, comment appelle-t-on le membre qui dirige le bateau et donne le rythme ?", "Le barreur")
    );

    private static final List<SynapseBonus> FALLBACK_BONUSES = List.of(
            new SynapseBonus(1, "CHALLENGE : Récite l'alphabet à l'envers jusqu'à M en moins de 10 secondes !"),
            new SynapseBonus(2, "CHALLENGE : Tout le monde applaudit le joueur actif ou boit 1 gorgée !"),
            new SynapseBonus(3, "BONUS : Vous volez 3 points au joueur de votre choix !"),
            new SynapseBonus(4, "CHALLENGE : Cite 5 marques de voitures en 5 secondes chrono !"),
            new SynapseBonus(5, "CADEAU : Vous gagnez immédiatement 5 points bonus !"),
            new SynapseBonus(6, "CHALLENGE : Mime un animal choisi par les adversaires pendant 15 secondes sans parler !")
    );

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<Integer, List<SynapseQuestion>> questionsByLevel = new ConcurrentHashMap<>();
    private List<SynapseBonus> bonuses = Collections.unmodifiableList(FALLBACK_BONUSES);

    @PostConstruct
    public void init() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource qCsv = resolver.getResource("classpath:data/synapse_questions.csv");
            Resource bCsv = resolver.getResource("classpath:data/synapse_bonus.csv");

            Map<Integer, List<SynapseQuestion>> byLevel = new HashMap<>();
            for (int i = 1; i <= 10; i++) {
                byLevel.put(i, new ArrayList<>());
            }

            if (qCsv.exists()) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(qCsv.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("id,")) continue;
                        List<String> tokens = parseCsvLine(line);
                        if (tokens.size() >= 5) {
                            try {
                                int id = Integer.parseInt(tokens.get(0).trim());
                                String code = tokens.get(1).trim();
                                int level = Integer.parseInt(tokens.get(2).trim());
                                String text = tokens.get(3).trim();
                                String answer = tokens.get(4).trim();
                                if (level >= 1 && level <= 10) {
                                    byLevel.get(level).add(new SynapseQuestion(id, code, level, text, answer));
                                }
                            } catch (Exception e) {
                                log.warn("Erreur parsing ligne questions Synapse : {}", line, e);
                            }
                        }
                    }
                }
            }

            int totalLoaded = byLevel.values().stream().mapToInt(List::size).sum();
            if (totalLoaded > 0) {
                byLevel.forEach((lvl, list) -> questionsByLevel.put(lvl, Collections.unmodifiableList(list)));
                log.info("SynapseRepository : {} questions chargées depuis CSV sur 10 niveaux", totalLoaded);
            } else {
                for (SynapseQuestion q : FALLBACK_QUESTIONS) {
                    questionsByLevel.computeIfAbsent(q.level(), k -> new ArrayList<>()).add(q);
                }
            }

            if (bCsv.exists()) {
                List<SynapseBonus> loadedBonuses = new ArrayList<>();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(bCsv.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("id,")) continue;
                        List<String> tokens = parseCsvLine(line);
                        if (tokens.size() >= 2) {
                            try {
                                int id = Integer.parseInt(tokens.get(0).trim());
                                String text = tokens.get(1).trim();
                                loadedBonuses.add(new SynapseBonus(id, text));
                            } catch (Exception ignored) {}
                        }
                    }
                }
                if (!loadedBonuses.isEmpty()) {
                    bonuses = Collections.unmodifiableList(loadedBonuses);
                    log.info("SynapseRepository : {} cartes défis bonus chargées", bonuses.size());
                }
            }

        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation de SynapseRepository : {}", e.getMessage(), e);
        }
    }

    /**
     * Pioche une question aléatoire d'un niveau donné (1 à 10) en évitant les IDs déjà utilisés.
     */
    public SynapseQuestion drawQuestion(int level, Set<Integer> usedQuestionIds) {
        int clampedLevel = Math.max(1, Math.min(10, level));
        List<SynapseQuestion> pool = questionsByLevel.getOrDefault(clampedLevel, List.of());
        if (pool.isEmpty()) {
            return new SynapseQuestion(clampedLevel, "q" + clampedLevel, clampedLevel,
                    "Question de niveau " + clampedLevel + " ?", "Réponse niveau " + clampedLevel);
        }

        List<SynapseQuestion> available = pool.stream()
                .filter(q -> !usedQuestionIds.contains(q.id()))
                .toList();

        if (available.isEmpty()) {
            // Toutes les questions du niveau ont été jouées, on réutilise le pool complet
            return pool.get(secureRandom.nextInt(pool.size()));
        }

        return available.get(secureRandom.nextInt(available.size()));
    }

    /**
     * Pioche une carte défi / bonus aléatoire.
     */
    public SynapseBonus drawRandomBonus() {
        if (bonuses.isEmpty()) {
            return new SynapseBonus(1, "CHALLENGE : Raconte ta plus grosse honte ou bois 1 gorgée !");
        }
        return bonuses.get(secureRandom.nextInt(bonuses.size()));
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(cur.toString());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        result.add(cur.toString());
        return result;
    }
}
