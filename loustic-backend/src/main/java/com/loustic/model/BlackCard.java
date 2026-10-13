package com.loustic.model;

/**
 * Entité représentant une Carte Noire (Question / phrase à trou) de Limite PRISON.
 */
public record BlackCard(
        String id,
        String text,
        int blanksCount
) {}
