package com.loustic.model.alias;

public enum TeamColor {
    ROSE,
    JAUNE,
    RED,
    BLUE;

    public static TeamColor fromString(String val) {
        if (val == null) return ROSE;
        String upper = val.trim().toUpperCase();
        if (upper.equals("ROSE") || upper.equals("RED") || upper.equals("PINK")) return ROSE;
        if (upper.equals("JAUNE") || upper.equals("BLUE") || upper.equals("YELLOW")) return JAUNE;
        return ROSE;
    }
}
