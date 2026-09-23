import PusherServer from 'pusher';

// Configuration Pusher pour Vercel (Variables d'environnement optionnelles)
const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'eu';

let pusherServerInstance: PusherServer | null = null;

if (appId && key && secret) {
  pusherServerInstance = new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true
  });
}

/**
 * Déclenche un événement temps réel vers tous les clients d'un salon de Belote.
 */
export async function triggerGameEvent(gameCode: string, eventName: string, data: any) {
  const channelName = `game-${gameCode.toUpperCase()}`;

  if (pusherServerInstance) {
    try {
      await pusherServerInstance.trigger(channelName, eventName, data);
    } catch (err) {
      console.error('[Pusher Error]:', err);
    }
  }

  // Stocker l'événement dans la mémoire serveur pour le polling instantané si Pusher n'est pas configuré
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).__beloteEvents) {
      (globalThis as any).__beloteEvents = new Map();
    }
    const eventsMap = (globalThis as any).__beloteEvents as Map<string, any>;
    eventsMap.set(channelName, {
      eventName,
      data,
      timestamp: Date.now()
    });
  }
}
