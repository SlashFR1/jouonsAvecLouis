package com.loustic.model.alias;

public record AliasCard(int id, String word, CardType type, boolean revealed) {
    public AliasCard withRevealed(boolean isRevealed) {
        return new AliasCard(id, word, type, isRevealed);
    }
}
