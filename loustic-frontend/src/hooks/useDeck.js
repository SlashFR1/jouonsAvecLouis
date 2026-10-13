import { useCallback, useEffect, useState } from 'react'
import { fetchCards } from '../api/client'
import { getStaticDeck } from '../data'

/**
 * Charge un deck statique JSON (immédiat, 100% offline, 0 latence)
 * avec synchronisation/fallback optionnel vers Spring Boot.
 */
export function useDeck(deckKey, filters = {}) {
  const filtersKey = JSON.stringify(filters)
  const currentKey = `${deckKey}_${filtersKey}`

  const [deckState, setDeckState] = useState(() => {
    const initial = getStaticDeck(deckKey, filters)
    const shuffled = shuffle(initial)
    return {
      key: currentKey,
      cards: initial,
      pile: shuffled.slice(1),
      card: shuffled[0] || null,
      total: initial.length,
      remaining: initial.length > 0 ? initial.length - 1 : 0,
      status: initial.length > 0 ? 'ready' : 'loading',
      error: null,
    }
  })

  // Synchronise l'état si deckKey ou filters change
  if (deckState.key !== currentKey) {
    const newItems = getStaticDeck(deckKey, filters)
    const shuffled = shuffle(newItems)
    setDeckState({
      key: currentKey,
      cards: newItems,
      pile: shuffled.slice(1),
      card: shuffled[0] || null,
      total: newItems.length,
      remaining: newItems.length > 0 ? newItems.length - 1 : 0,
      status: newItems.length > 0 ? 'ready' : 'loading',
      error: null,
    })
  }

  const draw = useCallback(() => {
    setDeckState(prev => {
      if (prev.cards.length === 0) return prev
      const currentPile = prev.pile.length > 0 ? prev.pile : shuffle(prev.cards)
      const nextCard = currentPile[0] || null
      const remainingPile = currentPile.slice(1)
      return {
        ...prev,
        pile: remainingPile,
        card: nextCard,
        remaining: remainingPile.length,
      }
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const parsedFilters = JSON.parse(filtersKey)
    const staticItems = getStaticDeck(deckKey, parsedFilters)

    fetchCards(deckKey, parsedFilters)
      .then(cards => {
        if (cancelled || !Array.isArray(cards) || cards.length === 0) return
        const shuffled = shuffle(cards)
        setDeckState({
          key: `${deckKey}_${filtersKey}`,
          cards,
          pile: shuffled.slice(1),
          card: shuffled[0] || null,
          total: cards.length,
          remaining: cards.length - 1,
          status: 'ready',
          error: null,
        })
      })
      .catch(() => {
        if (cancelled) return
        if (staticItems.length === 0) {
          setDeckState(prev => ({
            ...prev,
            status: 'error',
            error: 'Ce deck est vide.',
          }))
        }
      })

    return () => { cancelled = true }
  }, [deckKey, filtersKey])

  return {
    status: deckState.status,
    error: deckState.error,
    card: deckState.card,
    draw,
    remaining: deckState.remaining,
    total: deckState.total,
  }
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
