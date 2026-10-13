/**
 * Client HTTP vers Spring Boot.
 * En dev, Vite proxifie /api vers http://localhost:8080 (voir vite.config.js).
 * En prod, définir VITE_API_BASE_URL (ex: https://api.loustic.fr).
 */
export function getApiBase() {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (envUrl) return envUrl

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('172.') ||
      host.startsWith('10.')

    if (isLocal) {
      return '' // En dev local, Vite redirige /api vers le port 8080
    }
  }

  // Dès qu'on est sur Vercel ou en production distante :
  return 'https://jouonsaveclouis.onrender.com'
}

async function request(path, options = {}) {
  const base = getApiBase()
  const url = `${base}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Erreur ${res.status}`
    if (res.status === 405 || res.status === 404) {
      message = "Le backend Spring Boot n'est pas connecté sur cette URL. Lancez ./start.sh sur votre machine pour jouer sur votre Wi-Fi (ou configurez VITE_API_BASE_URL sur Vercel)."
    }
    try {
      const body = await res.json()
      message = body.message || body.detail || body.error || message
    } catch { /* corps non JSON */ }
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

/** Cartes d'un deck CSV. `filters` = colonnes du CSV (ex: { mode: 'hot' }). */
export function fetchCards(deckKey, filters = {}, { shuffle = true, limit } = {}) {
  const params = new URLSearchParams({ ...filters, shuffle: String(shuffle) })
  if (limit != null) params.set('limit', String(limit))
  return request(`/api/games/${encodeURIComponent(deckKey)}/cards?${params}`)
}

/** Base de données JSON complète d'un jeu depuis Spring Boot. */
export function fetchGameData(gameKey) {
  return request(`/api/games/${encodeURIComponent(gameKey)}/data`)
    .catch(() => request(`/api/data/${encodeURIComponent(gameKey)}`))
}

export const createRoom = (gameKey, playerId, playerName) =>
  request('/api/rooms', { method: 'POST', body: JSON.stringify({ gameKey, playerId, playerName }) })

export const joinRoom = (code, playerId, playerName) =>
  request(`/api/rooms/${encodeURIComponent(code)}/join`, {
    method: 'POST',
    body: JSON.stringify({ playerId, playerName }),
  })

export const leaveRoom = (code, playerId) =>
  request(`/api/rooms/${encodeURIComponent(code)}/leave`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  })

/** URL WebSocket STOMP (même hôte que la page en dev grâce au proxy Vite). */
export function wsUrl() {
  const envWs = (import.meta.env.VITE_WS_URL || '').trim()
  if (envWs) return envWs

  const base = getApiBase()
  if (base) {
    return base.replace(/^http/, 'ws') + '/ws-game'
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return origin.replace(/^http/, 'ws') + '/ws-game'
}
