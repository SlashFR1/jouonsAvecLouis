import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage, { StageStatus } from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.blue

export default function SynapseGame() {
  const { status, error, card, draw, remaining, total } = useDeck('synapse_questions', {})
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    document.title = 'Synapse (TTMC) ⚡ – Loustic'
  }, [])

  const nextQuestion = () => {
    setRevealed(false)
    setAnswered(false)
    draw()
  }

  const handleValidate = success => {
    if (answered) return
    setAnswered(true)
    if (success) {
      setScore(s => s + selectedLevel)
    }
  }

  const footer = status === 'ready' && (
    <CartoonButton id="next-synapse-btn" onClick={nextQuestion}>
      Question suivante ➡️
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="synapse" title="Synapse ⚡" color={COLOR} footer={footer}>
      {status !== 'ready' ? (
        <StageStatus status={status} error={error} />
      ) : (
        <CardStage cardKey={card?.id} tag={`Niveau auto-évalué : ${selectedLevel}/10`}>
          {/* Étape 1 : Choisir sa note de 1 à 10 */}
          <div style={{ width: '100%', marginBottom: '12px' }}>
            <p className="hint" style={{ margin: '0 0 6px 0' }}>
              Tu te mets combien de 1 à 10 ?
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                width: '100%',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                <button
                  key={lvl}
                  id={`level-btn-${lvl}`}
                  type="button"
                  style={{
                    padding: '8px 0',
                    borderRadius: '10px',
                    border: '2px solid #161513',
                    background: selectedLevel === lvl ? '#00a8ff' : '#ffffff',
                    color: selectedLevel === lvl ? '#ffffff' : '#161513',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: selectedLevel === lvl ? 'none' : '2px 2px 0 #161513',
                    transform: selectedLevel === lvl ? 'translate(2px, 2px)' : 'none',
                  }}
                  onClick={() => {
                    setSelectedLevel(lvl)
                    setRevealed(false)
                    setAnswered(false)
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Question affichée */}
          <div className="prompt-envelope" style={{ minHeight: '110px' }}>
            <p className="word-display" style={{ fontSize: 'clamp(1.1rem, 3.8vw, 1.55rem)' }}>
              {card?.texte || "De quelle couleur est le cheval blanc d'Henri IV ?"}
            </p>
          </div>

          {/* Révélation de la réponse */}
          <div style={{ width: '100%', marginTop: '6px' }}>
            {!revealed ? (
              <button
                id="reveal-synapse-btn"
                type="button"
                className="btn-action-primary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  height: '44px',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: '#f5cd79',
                }}
                onClick={() => setRevealed(true)}
              >
                👀 Révéler la réponse officielle
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    background: '#e8f5e9',
                    border: '2.5px solid #2ed573',
                    borderRadius: '12px',
                    padding: '10px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#161513',
                  }}
                >
                  Réponse : {card?.reponse || 'Blanc'}
                </div>

                {!answered ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      id="validate-success-btn"
                      type="button"
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '2.5px solid #161513',
                        background: '#2ed573',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #161513',
                      }}
                      onClick={() => handleValidate(true)}
                    >
                      ✅ Bon (+{selectedLevel} pts)
                    </button>
                    <button
                      id="validate-fail-btn"
                      type="button"
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '2.5px solid #161513',
                        background: '#ff4757',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #161513',
                      }}
                      onClick={() => handleValidate(false)}
                    >
                      ❌ Faux (0 pt)
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontWeight: 700, color: '#2ed573' }}>
                    Pointage enregistré !
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '2px dashed #161513',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#00a8ff' }}>
              Score actuel : {score} pts
            </span>
            <span className="deck-counter">{total - remaining} / {total}</span>
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
