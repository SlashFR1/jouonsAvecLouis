'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BeloteGameState } from '../belote/types';
import { BeloteMqttSync } from './mqttSync';
import { filterStateForClient } from '../belote/engine';

export function useGameRealtime(
  gameCode: string,
  playerSeat: number,
  initialData?: BeloteGameState | null,
  isHost: boolean = false,
  playerId: string = ''
) {
  const [gameState, setGameState] = useState<BeloteGameState | null>(initialData || null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mqttSyncRef = useRef<BeloteMqttSync | null>(null);

  // Mettre à jour l'état si initialData change
  useEffect(() => {
    if (initialData) {
      setGameState(initialData);
    }
  }, [initialData]);

  // Synchronisation d'état reçue
  const handleRemoteState = useCallback((remoteState: BeloteGameState) => {
    if (!remoteState || !remoteState.code) return;
    const filtered = filterStateForClient(remoteState, playerSeat);
    setGameState(filtered);
    setIsConnected(true);
  }, [playerSeat]);

  // Fonction pour charger l'état frais depuis l'API serveur
  const fetchFreshState = useCallback(async () => {
    if (!gameCode) return;
    try {
      const res = await fetch(`/api/game/${encodeURIComponent(gameCode.toUpperCase())}?seat=${playerSeat}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setGameState(data.state);
          setIsConnected(true);
          // Si hôte, mettre en cache pour broadcast
          if (isHost && typeof window !== 'undefined') {
            (window as any).__lastBeloteState = data.state;
          }
        }
      }
    } catch (err) {
      console.warn('Sync API polling silencieuse:', err);
    }
  }, [gameCode, playerSeat, isHost]);

  useEffect(() => {
    if (!gameCode) return;

    fetchFreshState();

    // Connexion WebSocket universelle MQTT
    const sync = new BeloteMqttSync(
      gameCode,
      playerId || `player_${playerSeat}_${Math.random().toString(36).substring(2, 6)}`,
      isHost,
      (state) => handleRemoteState(state),
      async (playerName, newPlayerId) => {
        // Un joueur tente de rejoindre via WebSocket
        try {
          const res = await fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'JOIN',
              playerName,
              code: gameCode
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.game) {
              sync.broadcastState(data.game);
              setGameState(filterStateForClient(data.game, playerSeat));
            }
          }
        } catch (e) {
          console.warn('Erreur ajout joueur via WebSocket:', e);
        }
      }
    );

    sync.connect();
    mqttSyncRef.current = sync;

    // Polling HTTP en soutien toutes les 1.5s
    pollingRef.current = setInterval(() => {
      fetchFreshState();
    }, 1500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (mqttSyncRef.current) {
        mqttSyncRef.current.disconnect();
        mqttSyncRef.current = null;
      }
    };
  }, [gameCode, playerSeat, isHost, playerId, fetchFreshState, handleRemoteState]);

  // Diffuser un nouvel état à tous les joueurs connectés
  const broadcastNewState = useCallback((newState: BeloteGameState) => {
    setGameState(filterStateForClient(newState, playerSeat));
    if (mqttSyncRef.current) {
      mqttSyncRef.current.broadcastState(newState);
    }
  }, [playerSeat]);

  return {
    gameState,
    isConnected,
    setGameState,
    refresh: fetchFreshState,
    broadcastState: broadcastNewState
  };
}
