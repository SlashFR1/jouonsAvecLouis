/**
 * Client HTTP vers Spring Boot.
 * En dev, Vite proxifie /api vers http://localhost:8080 (voir vite.config.js).
 * En prod, définir VITE_API_BASE_URL (ex: https://api.loustic.fr).
 */
const IS_LOCAL = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('172.') ||
  window.location.hostname.startsWith('10.')
)

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (IS_LOCAL ? '' : 'https://loustic-backend.onrender.com')

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  if (!IS_LOCAL) {
    return 'wss://loustic-backend.onrender.com/ws-game'
  }
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '')
  return base.replace(/^http/, 'ws') + '/ws-game'
}
