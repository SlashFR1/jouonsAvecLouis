import { useEffect, useState, useRef } from 'react'
import { getApiBase } from '../api/client'

/**
 * Hook de pré-réveil silencieux (warm-up) du serveur Spring Boot sur Render.
 * Dès l'arrivée de l'utilisateur sur l'application, envoie une requête GET /api/ping.
 *
 * - Si le serveur répond en moins de 2.5s : il est déjà chaud, aucun bandeau n'est affiché.
 * - Si le serveur met plus de 2.5s : il sort de veille (cold start Render), on active `isServerWakingUp: true`.
 * - Dès que le serveur répond avec succès : transition de confirmation puis disparition fluide avec pop/rebond.
 */
export function useServerWarmup() {
  const [isServerWakingUp, setIsServerWakingUp] = useState(false)
  const [isWarmedUp, setIsWarmedUp] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const hasPinged = useRef(false)

  useEffect(() => {
    if (hasPinged.current) return
    hasPinged.current = true

    const startTime = Date.now()
    let wakingTimer = null
    let isCompleted = false

    // Si après 2.5s le serveur n'a pas répondu, il est en train de sortir d'hibernation
    wakingTimer = setTimeout(() => {
      if (!isCompleted) {
        setIsServerWakingUp(true)
      }
    }, 2500)

    const pingUrl = `${getApiBase()}/api/ping`

    const triggerPing = (retryCount = 0) => {
      fetch(pingUrl, {
        method: 'GET',
        headers: { Accept: 'text/plain, application/json' },
        cache: 'no-store',
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.text()
        })
        .then(() => {
          isCompleted = true
          if (wakingTimer) clearTimeout(wakingTimer)
          const duration = Date.now() - startTime

          if (duration >= 2500 || retryCount > 0) {
            // Le serveur s'est réveillé : on affiche brièvement l'état "prêt" avec un pop rebond
            setIsWarmedUp(true)
            setIsDismissing(true)
            setTimeout(() => {
              setIsServerWakingUp(false)
              setIsDismissing(false)
            }, 1400)
          } else {
            // Serveur déjà éveillé et ultra-rapide
            setIsWarmedUp(true)
            setIsServerWakingUp(false)
          }
        })
        .catch(() => {
          // Pendant le cold start Render, les 502/503 ou coupures TCP peuvent arriver : on retente après 2.5s
          if (retryCount < 6) {
            setTimeout(() => triggerPing(retryCount + 1), 2500)
          } else {
            setIsServerWakingUp(false)
          }
        })
    }

    triggerPing()

    return () => {
      if (wakingTimer) clearTimeout(wakingTimer)
    }
  }, [])

  return { isServerWakingUp, isWarmedUp, isDismissing }
}
