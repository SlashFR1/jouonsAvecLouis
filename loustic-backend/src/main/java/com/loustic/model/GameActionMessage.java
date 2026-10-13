package com.loustic.model;

import java.util.Map;

/**
 * Message envoyé par un téléphone (ex: /app/room/ABC12/action).
 *
 * @param type     type d'action libre (ex: "VOTE", "REVEAL", "NEXT_CARD")
 * @param playerId identifiant du joueur émetteur
 * @param payload  données spécifiques au jeu
 */
public record GameActionMessage(String type, String playerId, Map<String, Object> payload) {
    public Map<String, Object> data() {
        return payload != null ? payload : Map.of();
    }
}
