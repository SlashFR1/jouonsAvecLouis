import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'

import universalMindData from '../../data/universalmind.json'

const COLOR = CARD_COLORS.purple

const WORDS_TO_GUESS = (universalMindData.words || []).map((w, idx) => ({
  word: w,
  cat: ['Général', 'Objet', 'Lieu', 'Nature', 'Culture'][idx % 5],
}))

const CONCEPTS = universalMindData.concepts || []

export default function UniversalMindGame() {
  const [wordIdx, setWordIdx] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [placedIcons, setPlacedIcons] = useState([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    document.title = 'Universal mind 🌐 – Loustic'
  }, [])

  const currentItem = WORDS_TO_GUESS[wordIdx % WORDS_TO_GUESS.length]

  const nextWord = () => {
    setWordIdx(i => i + 1)
    setShowSecret(false)
    setPlacedIcons([])
  }

  const toggleIcon = concept => {
    setPlacedIcons(prev => {
      const exists = prev.some(c => c.label === concept.label)
      if (exists) return prev.filter(c => c.label !== concept.label)
      return [...prev, concept]
    })
  }

  const handleSuccess = () => {
    setScore(s => s + 1)
    nextWord()
  }

  const footer = (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <CartoonButton id="found-mind-btn" variant="success" onClick={handleSuccess}>
        ✅ Trouvé ! (+1 pt)
      </CartoonButton>
      <CartoonButton id="next-mind-btn" variant="secondary" onClick={nextWord}>
        Passer ➡️
      </CartoonButton>
    </div>
  )

  return (
    <GameLayout gameKey="universalmind" title="Universal mind 🌐" color={COLOR} footer={footer}>
      <CardStage cardKey={`${wordIdx}`} tag={`Catégorie : ${currentItem.cat}`}>
        {/* Mot secret */}
        <div style={{ width: '100%', marginBottom: '10px', textAlign: 'center' }}>
          {!showSecret ? (
            <button
              id="show-mind-word-btn"
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
              onClick={() => setShowSecret(true)}
            >
              👀 Voir le mot secret (Réservé au guide)
            </button>
          ) : (
            <div
              style={{
                background: '#faf6eb',
                border: '2px solid #161513',
                borderRadius: '12px',
                padding: '10px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#57606f', fontWeight: 700 }}>
                MOT À FAIRE DEVINER :
              </span>
              <h2 className="word-display" style={{ margin: '4px 0', fontSize: '1.4rem' }}>
                {currentItem.word}
              </h2>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => setShowSecret(false)}
              >
                🙈 Masquer
              </button>
            </div>
          )}
        </div>

        {/* Indices symboliques placés */}
        <div style={{ width: '100%', minHeight: '52px', border: '2px dashed #161513', borderRadius: '12px', padding: '8px', marginBottom: '10px' }}>
          <p className="hint" style={{ margin: '0 0 6px 0' }}>
            Symboles activés pour faire deviner ({placedIcons.length}) :
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {placedIcons.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#a4b0be', fontStyle: 'italic' }}>
                Touchez les icônes ci-dessous pour construire l'indice !
              </span>
            ) : (
              placedIcons.map((pi, idx) => (
                <span
                  key={idx}
                  className="player-chip"
                  style={{ fontSize: '0.88rem', background: '#e1f5fe' }}
                  onClick={() => toggleIcon(pi)}
                >
                  {pi.icon} {pi.label} ✕
                </span>
              ))
            )}
          </div>
        </div>

        {/* Grille des concepts */}
        <div
          id="concepts-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            width: '100%',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {CONCEPTS.map(c => {
            const isSelected = placedIcons.some(pi => pi.label === c.label)
            return (
              <button
                key={c.label}
                id={`concept-${c.label}`}
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 2px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: isSelected ? '#f9c835' : '#ffffff',
                  boxShadow: isSelected ? 'none' : '2px 2px 0 #161513',
                  cursor: 'pointer',
                  transform: isSelected ? 'translate(2px, 2px)' : 'none',
                }}
                onClick={() => toggleIcon(c)}
              >
                <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#161513' }}>
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>
          <span style={{ fontWeight: 700, color: '#8c7ae6' }}>Score : {score} pts</span>
          <span className="deck-counter">Mot {wordIdx + 1}/{WORDS_TO_GUESS.length}</span>
        </div>
      </CardStage>
    </GameLayout>
  )
}
