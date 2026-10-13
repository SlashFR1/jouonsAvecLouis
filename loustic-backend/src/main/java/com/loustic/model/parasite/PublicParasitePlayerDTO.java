package com.loustic.model.parasite;

public record PublicParasitePlayerDTO(
        String id,
        String name,
        boolean alive,
        boolean isLover,
        String revealedRole
) {
    public static PublicParasitePlayerDTO fromPlayer(ParasitePlayer p, boolean showRole) {
        return new PublicParasitePlayerDTO(
                p.id(),
                p.name(),
                p.alive(),
                p.isLover() && (!p.alive() || showRole),
                (showRole || !p.alive()) && p.role() != null ? p.role().getDisplayName() : null
        );
    }
}
