package com.loustic.model.alias;

public record PublicCardDTO(int id, String word, CardType type, boolean revealed) {
    public static PublicCardDTO fromCard(AliasCard card) {
        // Règle critique Zero-Knowledge : tant que la carte n'est pas révélée, son type secret est masqué à UNKNOWN
        CardType exposedType = card.revealed() ? card.type() : CardType.UNKNOWN;
        return new PublicCardDTO(card.id(), card.word(), exposedType, card.revealed());
    }
}
