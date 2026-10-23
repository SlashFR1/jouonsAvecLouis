import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { wsUrl } from '../api/client'

/**
 * Connexion STOMP résiliente à une salle : écoute /topic/room/{code}, envoie sur /app/room/{code}/{action}.
 *
 * Fonctionnalités anti-latence & cold-start :
 * - Reconnexion automatique avec backoff exponentiel (1.5s -> 3s -> 6s -> max 12s)
 * - Ne bloque jamais le thread UI si le serveur Render est en cours de réveil
 * - Heartbeats synchronisés (15s) pour empêcher Render de couper la socket
 *
 * @param {string|null} roomCode
 * @param {(event: {type: string, room: object, payload: object}) => void} onEvent
 * @param {object} extraSubscriptions
 */
export function useGameSocket(roomCode, onEvent, extraSubscriptions = {}) {
  const clientRef = useRef(null)
  const onEventRef = useRef(onEvent)
  const extraSubsRef = useRef(extraSubscriptions)
  const [connected, setConnected] = useState(false)
  const reconnectDelayRef = useRef(1500)

  // Toujours appeler la dernière version des callbacks sans détruire/recréer la socket
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])
  useEffect(() => { extraSubsRef.current = extraSubscriptions }, [extraSubscriptions])

  useEffect(() => {
    if (!roomCode) return undefined

    reconnectDelayRef.current = 1500

    const client = new Client({
      brokerURL: wsUrl(),
      reconnectDelay: reconnectDelayRef.current,
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      onConnect: () => {
        // Succès : réinitialise le délai de reconnexion
        reconnectDelayRef.current = 1500
        client.reconnectDelay = 1500
        setConnected(true)

        client.subscribe(`/topic/room/${roomCode}`, (message) => {
          try {
            onEventRef.current?.(JSON.parse(message.body))
          } catch (e) {
            console.error('[WebSocket] Erreur parsing message room:', e)
          }
        })

        if (extraSubsRef.current) {
          Object.entries(extraSubsRef.current).forEach(([topic, callback]) => {
            if (topic && typeof callback === 'function') {
              client.subscribe(topic, (message) => {
                try {
                  callback(JSON.parse(message.body))
                } catch {
                  callback(message.body)
                }
              })
            }
          })
        }
      },
      onWebSocketClose: () => {
        setConnected(false)
        // Backoff exponentiel non bloquant en cas de cold start ou perte réseau
        const nextDelay = Math.min(Math.round(reconnectDelayRef.current * 1.6), 12000)
        reconnectDelayRef.current = nextDelay
        client.reconnectDelay = nextDelay
      },
      onWebSocketError: () => {
        // Silencieux : n'interrompt pas l'interface pendant que le conteneur Render démarre
        setConnected(false)
      },
      onStompError: (frame) => {
        console.warn('[STOMP] Info message:', frame.headers?.message)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      clientRef.current = null
      setConnected(false)
      client.deactivate()
    }
  }, [roomCode])

  /** Envoie une action : send('bomb/pass', { playerId }) → /app/room/{code}/bomb/pass */
  const send = useCallback((action, body = {}) => {
    const client = clientRef.current
    if (!client?.connected) return false
    try {
      client.publish({ destination: `/app/room/${roomCode}/${action}`, body: JSON.stringify(body) })
      return true
    } catch {
      return false
    }
  }, [roomCode])

  return { connected, send }
}

