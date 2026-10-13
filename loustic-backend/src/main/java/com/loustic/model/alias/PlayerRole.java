package com.loustic.model.alias;

public enum PlayerRole {
    SPYMASTER,
    OPERATOR,
    AGENT;

    public static PlayerRole fromString(String val) {
        if (val == null) return OPERATOR;
        String upper = val.trim().toUpperCase();
        if (upper.equals("SPYMASTER") || upper.equals("DEMINEUR") || upper.equals("MAITRE") || upper.equals("MASTER")) return SPYMASTER;
        return OPERATOR;
    }
}
