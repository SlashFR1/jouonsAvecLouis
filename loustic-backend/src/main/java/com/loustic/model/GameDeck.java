package com.loustic.model;

import java.util.List;
import java.util.Map;

/**
 * Un deck = un fichier CSV chargé en mémoire.
 * Chaque ligne est une Map colonne -> valeur (ex: {id: "1", mode: "hot", texte: "..."}).
 */
public record GameDeck(String key, List<String> columns, List<Map<String, String>> cards) {

    public GameDeck {
        columns = List.copyOf(columns);
        cards = List.copyOf(cards);
    }

    public int size() {
        return cards.size();
    }
}
