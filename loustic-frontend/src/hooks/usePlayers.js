import { useCallback, useState } from 'react'

const ID_KEY = 'loustic.playerId'
const NAME_KEY = 'loustic.playerName'
const PLAYERS_KEY = 'joueurs' // même clé que l'ancienne version → les joueurs saisis sont conservés

/** Identité persistante de ce téléphone (pour les salles multi-téléphones). */
export function usePlayerIdentity() {
  const [playerId] = useState(() => {
    let id = localStorage.getItem(ID_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(ID_KEY, id)
    }
    return id
  })
  const [playerName, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const setPlayerName = useCallback(name => {
    setName(name)
    localStorage.setItem(NAME_KEY, name)
  }, [])
  return { playerId, playerName, setPlayerName }
}

/** Liste des joueurs en mode Pass & Play (1 téléphone). */
export function useLocalPlayers() {
  const [players, setPlayersState] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(PLAYERS_KEY) ?? '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const setPlayers = useCallback(next => {
    setPlayersState(next)
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(next))
  }, [])
  return [players, setPlayers]
}
