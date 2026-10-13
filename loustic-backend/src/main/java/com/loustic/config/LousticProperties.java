package com.loustic.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "loustic")
public record LousticProperties(Cors cors, Rooms rooms, Bomb bomb) {

    public record Cors(List<String> allowedOriginPatterns) {}

    public record Rooms(int idleTimeoutMinutes, int maxPlayers) {}

    public record Bomb(int minFuseSeconds, int maxFuseSeconds) {}
}
