package com.loustic.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.loustic.service.GameDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Expose les bases de données complètes des jeux au format JSON.
 * - GET /api/data/{key}
 * - GET /api/games/{key}/data
 * - GET /api/data
 */
@RestController
public class GameDataRestController {

    private final GameDataService gameDataService;

    public GameDataRestController(GameDataService gameDataService) {
        this.gameDataService = gameDataService;
    }

    @GetMapping("/api/data/{key}")
    public ResponseEntity<JsonNode> getData(@PathVariable String key) {
        return gameDataService.getData(key)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/games/{key}/data")
    public ResponseEntity<JsonNode> getGameData(@PathVariable String key) {
        return getData(key);
    }

    @GetMapping("/api/data")
    public Map<String, Object> listAvailable() {
        return gameDataService.listAvailable();
    }
}
