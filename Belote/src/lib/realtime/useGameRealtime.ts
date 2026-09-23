'use client';

import { useEffect, useRef, useState } from 'react';
import PusherClient from 'pusher-js';
import { BeloteGameState } from '../belote/types';

export function useGameRealtime(gameCode: string, playerSeat: number, initialData?: BeloteGameState | null) {
  const [gameState, setGameState] = useState<BeloteGameState | null>(initialData || null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour charger l'état frais depuis l'API
  const fetchFreshState = async () => {
    try {
      const res = await fetch(`/api/game/${encodeURIComponent(gameCode)}?seat=${playerSeat}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setGameState(data.state);
        setIsConnected(true);
      }
    } catch (err) {
      console.warn('Erreur synchronisation état:', err);
    }
  };

  useEffect(() => {
    if (!gameCode) return;

    fetchFreshState();

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

    let pusher: PusherClient | null = null;
    let channel: any = null;

    if (pusherKey) {
      try {
        pusher = new PusherClient(pusherKey, {
          cluster: pusherCluster
        });

        const channelName = `game-${gameCode.toUpperCase()}`;
        channel = pusher.subscribe(channelName);

        channel.bind('state_updated', () => {
          fetchFreshState();
        });

        channel.bind('pusher:subscription_succeeded', () => {
          setIsConnected(true);
        });
      } catch (e) {
        console.warn('Pusher client non disponible:', e);
      }
    }

    // Polling régulier de sécurité pour assurer la synchronisation en temps réel (1.2s)
    pollingRef.current = setInterval(() => {
      fetchFreshState();
    }, 1200);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (pusher && channel) {
        channel.unbind_all();
        pusher.unsubscribe(`game-${gameCode.toUpperCase()}`);
        pusher.disconnect();
      }
    };
  }, [gameCode, playerSeat]);

  return { gameState, isConnected, refresh: fetchFreshState };
}
