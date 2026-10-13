package com.loustic.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Erreurs métier traduites en codes HTTP pour l'API REST. */
public final class GameExceptions {

    private GameExceptions() {}

    public static ResponseStatusException roomNotFound(String code) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable : " + code);
    }

    public static ResponseStatusException roomFull(String code) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "La salle " + code + " est pleine");
    }

    public static ResponseStatusException deckNotFound(String key) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck inconnu : " + key);
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
