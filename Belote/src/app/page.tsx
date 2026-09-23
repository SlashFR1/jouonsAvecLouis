'use client';

import React, { useState } from 'react';
import { Lobby } from '@/components/Lobby';
import { GameTable } from '@/components/GameTable';
import { useGameRealtime } from '@/lib/realtime/useGameRealtime';
import { Suit, TrumpType } from '@/lib/belote/types';

export default function BelotePage() {
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [mySeat, setMySeat] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');

  const { gameState, refresh } = useGameRealtime(gameCode || '', mySeat);

  // Actions utilisateur
  const handleGameJoined = (code: string, seat: number, name: string) => {
    setGameCode(code);
    setMySeat(seat);
    setPlayerName(name);
  };

  const handleStartGame = async () => {
    if (!gameCode) return;
    try {
      await fetch(`/api/game/${encodeURIComponent(gameCode)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_GAME', seat: mySeat })
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBidTour1 = async (decision: 'TAKE' | 'PASS') => {
    if (!gameCode) return;
    try {
      await fetch(`/api/game/${encodeURIComponent(gameCode)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BID_TOUR_1', seat: mySeat, decision })
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBidTour2 = async (decision: 'BID' | 'PASS', suit?: Suit, trumpType?: TrumpType) => {
    if (!gameCode) return;
    try {
      await fetch(`/api/game/${encodeURIComponent(gameCode)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BID_TOUR_2', seat: mySeat, decision, suit, trumpType })
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayCard = async (cardId: string) => {
    if (!gameCode) return;
    try {
      await fetch(`/api/game/${encodeURIComponent(gameCode)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PLAY_CARD', seat: mySeat, cardId })
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextRound = async () => {
    if (!gameCode) return;
    try {
      await fetch(`/api/game/${encodeURIComponent(gameCode)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'NEXT_ROUND', seat: mySeat })
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Si on n'a pas encore rejoint de salon ou si on est en attente
  if (!gameCode || !gameState || gameState.phase === 'WAITING_PLAYERS') {
    return (
      <Lobby
        onGameJoined={handleGameJoined}
        existingGameState={gameState}
        onStartGame={handleStartGame}
        mySeat={mySeat}
      />
    );
  }

  // 2. Partie en cours : Tapis de Belote
  return (
    <GameTable
      gameState={gameState}
      mySeat={mySeat}
      onPlayCard={handlePlayCard}
      onBidTour1={handleBidTour1}
      onBidTour2={handleBidTour2}
      onNextRound={handleNextRound}
    />
  );
}
