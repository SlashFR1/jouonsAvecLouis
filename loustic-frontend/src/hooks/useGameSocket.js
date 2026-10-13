import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { wsUrl } from '../api/client'

/**
 * Connexion STOMP à une salle : écoute /topic/room/{code}, envoie sur /app/room/{code}/{action}.
 * Reconnexion automatique (utile quand un téléphone se met en veille).
 *
 * @param {string|null} roomCode
 * @param {(event: {type: string, room: object, payload: object}) => void} onEvent
 */
export function useGameSocket(roomCode, onEvent, extraSubscriptions = {}) {
  const clientRef = useRef(null)
  const onEventRef = useRef(onEvent)
  const extraSubsRef = useRef(extraSubscriptions)
  const [connected, setConnected] = useState(false)

  // Toujours appeler la dernière version du callback sans recréer la connexion
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])
  useEffect(() => { extraSubsRef.current = extraSubscriptions }, [extraSubscriptions])

  useEffect(() => {
    if (!roomCode) return undefined
    const client = new Client({
      brokerURL: wsUrl(),
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/room/${roomCode}`, message => {
          onEventRef.current?.(JSON.parse(message.body))
        })
        if (extraSubsRef.current) {
          Object.entries(extraSubsRef.current).forEach(([topic, callback]) => {
            if (topic && typeof callback === 'function') {
              client.subscribe(topic, message => {
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
      onWebSocketClose: () => setConnected(false),
      onStompError: frame => console.error('STOMP', frame.headers.message),
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
    client.publish({ destination: `/app/room/${roomCode}/${action}`, body: JSON.stringify(body) })
    return true
  }, [roomCode])

  return { connected, send }
}
