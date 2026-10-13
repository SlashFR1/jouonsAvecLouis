package com.loustic.model.alias;

public enum TeamColor {
    BLUE,
    RED,
    GREEN,
    ROSE,
    JAUNE;

    public static TeamColor fromString(String val) {
        if (val == null) return BLUE;
        String upper = val.trim().toUpperCase();
        if (upper.equals("ROSE") || upper.equals("RED") || upper.equals("PINK")) return RED;
        if (upper.equals("JAUNE") || upper.equals("BLUE") || upper.equals("YELLOW")) return BLUE;
        if (upper.equals("VERT") || upper.equals("GREEN")) return GREEN;
        return BLUE;
    }
}
