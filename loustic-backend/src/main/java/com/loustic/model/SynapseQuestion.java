package com.loustic.model;

/**
 * Question Synapse (TTMC) avec niveau de difficulté de 1 à 10.
 */
public record SynapseQuestion(
        int id,
        String code,
        int level,
        String text,
        String answer
) {}
