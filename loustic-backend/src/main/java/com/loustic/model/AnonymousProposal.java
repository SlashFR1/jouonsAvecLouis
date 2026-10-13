package com.loustic.model;

/**
 * DTO anonymisé diffusé à la table et au Juge pour la phase de vote / délibération.
 * L'identifiant du joueur est strictement masqué par un token aléatoire éphémère.
 */
public record AnonymousProposal(
        String token,
        String text
) {}
