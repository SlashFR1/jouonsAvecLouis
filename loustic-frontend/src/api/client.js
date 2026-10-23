const RENDER_BACKEND_URL = 'https://jouonsaveclouis.onrender.com'

/**
 * Client HTTP vers Spring Boot.
 * Connecté au serveur Render (https://jouonsaveclouis.onrender.com).
 * Pour pointer sur un autre serveur, définir VITE_API_BASE_URL.
 */
export function getApiBase() {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (envUrl) return envUrl

  return RENDER_BACKEND_URL
}

async function request(path, options = {}) {
  const base = getApiBase()
  const url = `${base}${path}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // Tolère le réveil Render (cold start)

  let res
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error("Le serveur Render met trop de temps à répondre (réveil du conteneur en cours). Veuillez réessayer dans quelques secondes.")
    }
    throw new Error("Connexion impossible au serveur de jeu. Vérifiez votre connexion Internet.")
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    if (res.status === 502 || res.status === 504) {
      message = "Le serveur Render se réveille (cela peut prendre 30 à 45s après inactivité). Veuillez réessayer dans un instant !"
    } else if (res.status === 405 || res.status === 404) {
      message = "Service de jeu introuvable sur cette adresse."
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

/** URL WebSocket STOMP (même hôte que l'API active). */
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
