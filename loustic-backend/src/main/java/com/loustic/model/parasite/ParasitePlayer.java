package com.loustic.model.parasite;

public record ParasitePlayer(
        String id,
        String name,
        ParasiteRole role,
        boolean alive,
        boolean isLover,
        String loverId,
        boolean hasSavePotion,
        boolean hasKillPotion
) {
    public ParasitePlayer withAlive(boolean newAlive) {
        return new ParasitePlayer(id, name, role, newAlive, isLover, loverId, hasSavePotion, hasKillPotion);
    }

    public ParasitePlayer withLover(String otherLoverId) {
        return new ParasitePlayer(id, name, role, alive, true, otherLoverId, hasSavePotion, hasKillPotion);
    }

    public ParasitePlayer withRole(ParasiteRole newRole) {
        return new ParasitePlayer(id, name, newRole, alive, isLover, loverId, hasSavePotion, hasKillPotion);
    }

    public ParasitePlayer withPotions(boolean save, boolean kill) {
        return new ParasitePlayer(id, name, role, alive, isLover, loverId, save, kill);
    }
}
