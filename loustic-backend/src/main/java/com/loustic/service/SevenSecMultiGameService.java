package com.loustic.service;

import org.springframework.stereotype.Service;

/**
 * Façade de rétrocompatibilité pour SevenSecMultiGameService,
 * déléguant toutes les opérations au nouveau SevenSecondsService.
 */
@Service
public class SevenSecMultiGameService {

    private final SevenSecondsService delegate;

    public SevenSecMultiGameService(SevenSecondsService delegate) {
        this.delegate = delegate;
    }

    public void start(String roomCode, String playerId) {
        delegate.start(roomCode, playerId);
    }

    public void nextTurn(String roomCode, String playerId) {
        delegate.drawNextCard(roomCode, playerId);
    }

    public void launchTimer(String roomCode, String playerId) {
        delegate.launchCountdown(roomCode, playerId);
    }

    public void validate(String roomCode, String playerId, boolean success) {
        delegate.vote(roomCode, playerId, success);
    }
}
