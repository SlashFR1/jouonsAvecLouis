import { useState, useEffect } from 'react'
import { fetchGameData } from '../api/client'

/**
 * Hook qui connecte un jeu à la base de données du backend Spring Boot.
 * Initialise avec fallbackData pour un rendu immédiat et sans temps mort,
 * puis se synchronise dynamiquement dès que le backend renvoie les données réelles à jour.
 */
export function useGameData(gameKey, fallbackData = null) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchGameData(gameKey)
      .then(remoteData => {
        if (!cancelled && remoteData && typeof remoteData === 'object' && Object.keys(remoteData).length > 0) {
          setData(remoteData)
          setIsFromBackend(true)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [gameKey])

  return { data, loading, isFromBackend, error }
}
