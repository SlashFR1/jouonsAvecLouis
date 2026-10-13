package com.loustic.model;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Message envoyé par un téléphone (ex: /app/room/ABC12/action).
 * Compatible avec payload imbriqué et propriétés racine (cardId, card, token, etc.).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameActionMessage {
    private String type;
    private String playerId;
    private Map<String, Object> payload = new HashMap<>();

    public GameActionMessage() {}

    public GameActionMessage(@JsonProperty("type") String type,
                             @JsonProperty("playerId") String playerId,
                             @JsonProperty("payload") Map<String, Object> payload) {
        this.type = type;
        this.playerId = playerId;
        if (payload != null) {
            this.payload.putAll(payload);
        }
    }

    public String type() { return type; }
    public String playerId() { return playerId; }

    public Map<String, Object> payload() {
        return payload != null ? payload : Collections.emptyMap();
    }

    public Map<String, Object> data() {
        return payload();
    }

    public void setType(String type) { this.type = type; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }
    public void setPayload(Map<String, Object> payload) {
        if (payload != null) {
            this.payload.putAll(payload);
        }
    }

    @JsonAnySetter
    public void setUnknown(String key, Object value) {
        if (this.payload == null) {
            this.payload = new HashMap<>();
        }
        this.payload.put(key, value);
    }
}
