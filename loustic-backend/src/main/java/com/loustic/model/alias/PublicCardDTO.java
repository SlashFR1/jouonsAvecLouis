package com.loustic.model.alias;

public record PublicCardDTO(int id, String word, CardType type, CardType color, boolean revealed) {
    public static PublicCardDTO fromCard(AliasCard card) {
        // Strict Zero-Knowledge : si !revealed, type et color sont obligatoirement NULL
        CardType exposed = card.revealed() ? card.type() : null;
        return new PublicCardDTO(card.id(), card.word(), exposed, exposed, card.revealed());
    }
}
