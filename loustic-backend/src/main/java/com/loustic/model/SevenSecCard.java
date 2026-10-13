package com.loustic.model;

/**
 * Modèle typé d'une carte du jeu 7 Secondes.
 */
public record SevenSecCard(
        String id,
        String theme,
        String prompt,
        int count,
        int durationSeconds
) {}
