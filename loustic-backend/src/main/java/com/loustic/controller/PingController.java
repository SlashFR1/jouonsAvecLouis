package com.loustic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur de santé ultra-léger utilisé pour le pré-réveil (warm-up) et le keep-alive anti-sommeil sur Render.
 * Répond immédiatement "pong" sans solliciter la base de données, sans filtres lourds et sans logs superflus.
 */
@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
