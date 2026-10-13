import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CardStage, { StageStatus } from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS, DECK_GAMES } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

/**
 * Jeu générique "pioche une carte" piloté par la config DECK_GAMES.
 * Couvre : Je n'ai jamais, Tu préfères, Vote ou shot, Juge, Switch, Vrai ou Faux.
 */
export default function DeckGame() {
  const { gameId } = useParams()
  const config = DECK_GAMES[gameId]
  if (!config) return <Navigate to="/" replace />
  return <DeckGameInner key={gameId} gameId={gameId} config={config} />
}

function DeckGameInner({ gameId, config }) {
  const [mode, setMode] = useState('normal')
  const [revealed, setRevealed] = useState(false)
  const filters = useMemo(() => (config.hasModes ? { mode } : {}), [config.hasModes, mode])
  const { status, error, card, draw, remaining, total } = useDeck(config.deck, filters)
  const color = CARD_COLORS[config.color]

  useEffect(() => {
    document.title = `${config.title} – Loustic`
  }, [config.title])

  const next = () => {
    setRevealed(false)
    draw()
  }

  const modeToggle = config.hasModes && (
    <button
      id="mode-toggle-btn"
      type="button"
      className={`nav-touch-btn ${mode === 'hot' ? 'is-hot' : ''}`}
      aria-label={mode === 'hot' ? 'Passer en mode normal' : 'Passer en mode hot'}
      title={mode === 'hot' ? 'Mode hot 🔥' : 'Mode normal 😇'}
      onClick={() => setMode(m => (m === 'hot' ? 'normal' : 'hot'))}
    >
      {mode === 'hot' ? '🔥' : '😇'}
    </button>
  )

  const answer = config.revealField && card?.[config.revealField]
  const footer = status === 'ready' && (
    <>
      {config.revealField && !revealed ? (
        <CartoonButton id="reveal-btn" variant="secondary" onClick={() => setRevealed(true)}>
          Révéler la réponse
        </CartoonButton>
      ) : (
        <CartoonButton id="next-card-btn" onClick={next}>
          Carte suivante
        </CartoonButton>
      )}
    </>
  )

  return (
    <GameLayout
      gameKey={gameId || config.deck}
      title={config.title}
      color={color}
      right={modeToggle}
      footer={footer}
    >
      {status !== 'ready' ? (
        <StageStatus status={status} error={error} />
      ) : (
        <CardStage cardKey={card?.id + mode} tag={config.tagField ? card?.[config.tagField] : null}
                   className={mode === 'hot' ? 'is-hot' : ''}>
          <div className="prompt-envelope">
            <p className="word-display">
              {config.prefix ? <span className="prompt-prefix">{config.prefix}</span> : null}
              {card?.[config.field] || card?.texte || card?.affirmation || card?.question || card?.prompt}
            </p>
          </div>
          {config.revealField && revealed && (
            <div className={`answer-stamp ${answer === 'VRAI' ? 'is-true' : 'is-false'}`}>
              {answer === 'VRAI' ? 'VRAI' : 'FAUX'}
            </div>
          )}
          <p className="hint">{config.hint}</p>
          <p className="deck-counter">{total - remaining} / {total}</p>
        </CardStage>
      )}
    </GameLayout>
  )
}
