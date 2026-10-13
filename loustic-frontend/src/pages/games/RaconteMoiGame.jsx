import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage, { StageStatus } from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.orange

export default function RaconteMoiGame() {
  const { status, error, card, draw, remaining, total } = useDeck('racontemoi_stories', {})
  const [showStory, setShowStory] = useState(false)
  const [revealKeyPhrase, setRevealKeyPhrase] = useState(false)
  const [hintCount, setHintCount] = useState(0)

  useEffect(() => {
    document.title = 'Raconte-moi 📖 – Loustic'
  }, [])

  const nextStory = () => {
    setShowStory(false)
    setRevealKeyPhrase(false)
    setHintCount(0)
    draw()
  }

  const footer = status === 'ready' && (
    <CartoonButton id="next-story-btn" onClick={nextStory}>
      Histoire suivante ➡️
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="racontemoi" title="Raconte-moi 📖" color={COLOR} footer={footer}>
      {status !== 'ready' ? (
        <StageStatus status={status} error={error} />
      ) : (
        <CardStage cardKey={card?.id} tag={card?.theme || 'Histoire Réelle'}>
          {/* Titre de l'énigme */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e17055', textTransform: 'uppercase' }}>
              Énigme à faire deviner
            </span>
            <h2
              className="word-display"
              style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', margin: '4px 0' }}
            >
              {card?.title || "L'histoire mystère"}
            </h2>
          </div>

          {/* Révélation de l'histoire pour le conteur */}
          <div style={{ width: '100%', marginBottom: '12px' }}>
            {!showStory ? (
              <button
                id="show-story-btn"
                type="button"
                className="btn-action-primary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  height: '44px',
                  fontSize: '0.92rem',
                  borderRadius: '12px',
                  background: '#f5cd79',
                }}
                onClick={() => setShowStory(true)}
              >
                👀 Lire l'histoire secrète (Réservé au conteur)
              </button>
            ) : (
              <div
                style={{
                  background: '#fffdf8',
                  border: '2.5px solid #161513',
                  borderRadius: '14px',
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  lineHeight: '1.45',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#e17055' }}>Histoire complète :</strong>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => setShowStory(false)}
                  >
                    🙈 Masquer
                  </button>
                </div>
                <p style={{ margin: 0, color: '#2f3542' }}>{card?.story}</p>
              </div>
            )}
          </div>

          {/* Indices progressifs pour aider les enquêteurs */}
          <div style={{ width: '100%', borderTop: '2px dashed #161513', paddingTop: '10px' }}>
            <p className="hint" style={{ margin: '0 0 8px 0' }}>
              Les joueurs posent des questions (OUI / NON) :
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
              <button
                id="hint-btn-1"
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid #161513',
                  background: hintCount >= 1 ? '#2ed573' : '#ffffff',
                  color: hintCount >= 1 ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={() => setHintCount(1)}
              >
                💡 Indice 1
              </button>
              <button
                id="hint-btn-2"
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid #161513',
                  background: hintCount >= 2 ? '#2ed573' : '#ffffff',
                  color: hintCount >= 2 ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={() => setHintCount(2)}
              >
                💡 Indice 2
              </button>
              <button
                id="hint-btn-3"
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid #161513',
                  background: hintCount >= 3 ? '#2ed573' : '#ffffff',
                  color: hintCount >= 3 ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={() => setHintCount(3)}
              >
                💡 Indice 3
              </button>
            </div>

            {hintCount > 0 && (
              <p
                style={{
                  background: '#faf6eb',
                  border: '1.5px solid #161513',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '0.85rem',
                  margin: '0 0 10px 0',
                }}
              >
                {hintCount === 1 && "Indice 1 : L'accident implique un comportement très confiant ou inhabituel."}
                {hintCount === 2 && "Indice 2 : La physique ou une erreur de jugement a joué un rôle fatal."}
                {hintCount >= 3 && "Indice 3 : L'événement s'est déroulé sous les yeux de témoins ou d'élèves."}
              </p>
            )}

            {/* Révélation de la phrase clé */}
            {!revealKeyPhrase ? (
              <button
                id="reveal-key-btn"
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: '#ff4757',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => setRevealKeyPhrase(true)}
              >
                🔑 Révéler la morale & phrase clé
              </button>
            ) : (
              <div
                style={{
                  background: '#fff0f3',
                  border: '2.5px solid #ff4757',
                  borderRadius: '12px',
                  padding: '10px',
                  color: '#161513',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                🌟 <em>{card?.keyPhrase}</em>
              </div>
            )}
          </div>

          <p className="deck-counter" style={{ marginTop: '10px' }}>
            {total - remaining} / {total}
          </p>
        </CardStage>
      )}
    </GameLayout>
  )
}
