package com.loustic.service;

import org.springframework.stereotype.Service;

/**
 * <h3>SevenSecMultiGameService (Façade Dépréciée)</h3>
 * <p>
 * Ancienne façade de service pour le jeu multijoueur "7 Secondes".
 * Toutes les opérations ont été migrées vers {@link SevenSecondsService} qui gère désormais
 * le cycle de vie complet du jeu, le compte à rebours asynchrone et les votes en temps réel.
 * </p>
 *
 * @deprecated Cette classe n'est conservée que pour la rétrocompatibilité binaire.
 *             Utiliser directement {@link SevenSecondsService}.
 * @see SevenSecondsService
 */
@Deprecated(forRemoval = true)
@Service
public class SevenSecMultiGameService {

    private final SevenSecondsService delegate;

    public SevenSecMultiGameService(SevenSecondsService delegate) {
        this.delegate = delegate;
    }

    /**
     * Démarre une partie de 7 Secondes.
     * @param roomCode code de la salle
     * @param playerId identifiant de l'hôte
     */
    public void start(String roomCode, String playerId) {
        delegate.start(roomCode, playerId);
    }

    /**
     * Passe au tour suivant en tirant une nouvelle carte défi.
     * @param roomCode code de la salle
     * @param playerId identifiant du joueur
     */
    public void nextTurn(String roomCode, String playerId) {
        delegate.drawNextCard(roomCode, playerId);
    }

    /**
     * Déclenche le compte à rebours de 7 secondes.
     * @param roomCode code de la salle
     * @param playerId identifiant du joueur
     */
    public void launchTimer(String roomCode, String playerId) {
        delegate.launchCountdown(roomCode, playerId);
    }

    /**
     * Enregistre le vote de réussite ou d'échec du défi.
     * @param roomCode code de la salle
     * @param playerId identifiant du joueur votant
     * @param success  true si le défi a été réussi dans les 7 secondes
     */
    public void validate(String roomCode, String playerId, boolean success) {
        delegate.vote(roomCode, playerId, success);
    }
}

