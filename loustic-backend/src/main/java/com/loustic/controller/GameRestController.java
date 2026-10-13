package com.loustic.controller;

import com.loustic.model.GameDeck;
import com.loustic.service.CsvDataLoaderService;
import com.loustic.service.GameExceptions;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Expose les decks CSV en JSON.
 * <ul>
 *   <li>GET /api/games → liste des decks (clé, colonnes, nombre de cartes)</li>
 *   <li>GET /api/games/{key}/cards?mode=hot&amp;shuffle=true&amp;limit=50 → cartes filtrées</li>
 * </ul>
 * Tout paramètre correspondant à une colonne du CSV sert de filtre (ex: ?categorie=Facile).
 */
@RestController
@RequestMapping("/api/games")
public class GameRestController {

    private final CsvDataLoaderService loader;

    public GameRestController(CsvDataLoaderService loader) {
        this.loader = loader;
    }

    public record DeckSummary(String key, List<String> columns, int count) {}

    @GetMapping
    public List<DeckSummary> listDecks() {
        return loader.getAllDecks().stream()
                .map(d -> new DeckSummary(d.key(), d.columns(), d.size()))
                .toList();
    }

    @GetMapping("/{key}/cards")
    public List<Map<String, String>> cards(@PathVariable String key,
                                           @RequestParam(defaultValue = "false") boolean shuffle,
                                           @RequestParam(required = false) Integer limit,
                                           @RequestParam Map<String, String> allParams) {
        GameDeck deck = loader.getDeck(key).orElseThrow(() -> GameExceptions.deckNotFound(key));
        Map<String, String> filters = new HashMap<>(allParams);
        filters.remove("shuffle");
        filters.remove("limit");
        return loader.query(deck, filters, shuffle, limit);
    }
}
