import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import synapseData from '../../data/synapse.json'

const COLOR = CARD_COLORS.blue || '#0284c7'
const TARGET_SCORE = 35

export default function SynapseGame() {
  const categories = useMemo(() => synapseData.categories || [], [])
  
  // Gestion des équipes / joueurs
  const [teams, setTeams] = useState([
    { id: 1, name: 'Équipe 1', score: 0 },
    { id: 2, name: 'Équipe 2', score: 0 },
  ])
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0)
  const [catIndex, setCatIndex] = useState(0)

  // Étape du tour : 'picking_level' | 'question_active' | 'revealed' | 'victory'
  const [turnState, setTurnState] = useState('picking_level')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    document.title = 'Synapse (TTMC) ⚡ – Loustic'
  }, [])

  const currentCategory = categories[catIndex % categories.length] || categories[0]
  const currentTeam = teams[currentTeamIdx]

  // Trouver la question correspondant au niveau choisi (1 à 10)
  const currentQuestion = useMemo(() => {
    if (!currentCategory || !selectedLevel) return null
    return (currentCategory.questions || []).find(q => q.niveau === selectedLevel) || currentCategory.questions?.[selectedLevel - 1]
  }, [currentCategory, selectedLevel])

  // Sélection du niveau de 1 à 10
  const handleSelectLevel = (level) => {
    setSelectedLevel(level)
    setTurnState('question_active')
  }

  // Révélation de la réponse
  const handleReveal = () => {
    setTurnState('revealed')
  }

  // Validation de la réponse
  const handleAnswerResult = (isCorrect) => {
    const points = isCorrect ? selectedLevel : 0
    const newScore = currentTeam.score + points

    const updatedTeams = teams.map((t, idx) =>
      idx === currentTeamIdx ? { ...t, score: newScore } : t
    )
    setTeams(updatedTeams)

    // Vérifier si la cible de 35 points est atteinte
    if (newScore >= TARGET_SCORE) {
      setWinner({ name: currentTeam.name, score: newScore })
      setTurnState('victory')
      return
    }

    // Passer à la catégorie et à l'équipe suivante
    setCatIndex(c => (c + 1) % categories.length)
    setCurrentTeamIdx(i => (i + 1) % teams.length)
    setSelectedLevel(null)
    setTurnState('picking_level')
  }

  // Recommencer une nouvelle partie
  const handleRestart = () => {
    setTeams([
      { id: 1, name: 'Équipe 1', score: 0 },
      { id: 2, name: 'Équipe 2', score: 0 },
    ])
    setCurrentTeamIdx(0)
    setCatIndex(Math.floor(Math.random() * categories.length))
    setSelectedLevel(null)
    setTurnState('picking_level')
    setWinner(null)
  }

  // Changer de catégorie si celle-ci ne plaît pas
  const handleSkipCategory = () => {
    setCatIndex(c => (c + 1) % categories.length)
    setSelectedLevel(null)
    setTurnState('picking_level')
  }

  const footer = turnState === 'victory' ? (
    <CartoonButton id="synapse-restart-btn" variant="success" onClick={handleRestart}>
      🔄 Nouvelle partie (Objectif 35 pts)
    </CartoonButton>
  ) : (
    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
      {turnState === 'picking_level' && (
        <CartoonButton id="synapse-skip-btn" variant="secondary" onClick={handleSkipCategory}>
          🎲 Changer de catégorie
        </CartoonButton>
      )}
    </div>
  )

  return (
    <GameLayout
      gameKey="synapse"
      title="Synapse ⚡ (TTMC)"
      color={COLOR}
      footer={footer}
    >
      <section className="synapse-stage" style={{ width: '100%', maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* TABLEAU DES SCORES & OBJECTIF 35 PTS */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '14px 18px',
          border: '3px solid #1e293b',
          boxShadow: '0 6px 0 #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>
              🎯 Objectif : {TARGET_SCORE} points
            </span>
            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#0284c7' }}>
              Au tour de : <strong>{currentTeam.name}</strong>
            </span>
          </div>

          {/* Barres de progression des équipes */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: '12px' }}>
            {teams.map((t, idx) => {
              const pct = Math.min(100, Math.round((t.score / TARGET_SCORE) * 100))
              const isActive = idx === currentTeamIdx
              return (
                <div key={t.id} style={{
                  padding: '8px 12px',
                  borderRadius: '14px',
                  border: isActive ? '2.5px solid #0284c7' : '2px solid #e2e8f0',
                  background: isActive ? '#f0f9ff' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                    <span>{t.name}</span>
                    <span style={{ color: t.score >= 30 ? '#dc2626' : '#0284c7' }}>{t.score} / {TARGET_SCORE} pts</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isActive ? '#0284c7' : '#94a3b8', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ÉCRAN DE VICTOIRE À 35 POINTS */}
        {turnState === 'victory' ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '4px solid #16a34a',
            padding: '32px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 0 #15803d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.1))' }}>👑</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', margin: 0 }}>
              VICTOIRE ROYALE !
            </h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {winner?.name} a franchi les {TARGET_SCORE} points avec un score de <strong>{winner?.score} pts</strong> !
            </p>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Une mémoire d'éléphant et une culture générale imbattable ! 🧠⚡
            </p>
          </div>
        ) : (
          /* CARTE DU THÈME ACTIF (EX: ESCARGOT) */
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* EN-TÊTE DE LA CATÉGORIE DU TOUR */}
            <div style={{
              background: '#fef08a',
              border: '3.5px solid #ca8a04',
              borderRadius: '20px',
              padding: '16px 14px',
              textAlign: 'center',
              boxShadow: '0 6px 0 #ca8a04',
            }}>
              <span style={{
                display: 'inline-block',
                background: '#ca8a04',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: '999px',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>
                {currentCategory?.emoji} THÈME DU TOUR
              </span>
              <h2 style={{
                margin: '2px 0 6px',
                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                fontWeight: 900,
                color: '#713f12',
                fontFamily: 'Carter One, Fredoka, cursive'
              }}>
                {currentCategory?.title}
              </h2>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#854d0e' }}>
                Tu te mets combien de <strong>1 à 10</strong> en <em>{currentCategory?.title}</em> ?
              </p>
            </div>

            {/* GRILLE DES 10 NIVEAUX DE DIFFICULTÉ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>
                Choisis ta note pour afficher la question correspondante :
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => {
                  const isSelected = selectedLevel === lvl
                  return (
                    <button
                      key={lvl}
                      id={`level-btn-${lvl}`}
                      type="button"
                      onClick={() => handleSelectLevel(lvl)}
                      style={{
                        padding: '12px 0',
                        borderRadius: '14px',
                        border: '3px solid #1e293b',
                        background: isSelected ? '#0284c7' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#1e293b',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        cursor: 'pointer',
                        boxShadow: isSelected ? 'none' : '0 4px 0 #1e293b',
                        transform: isSelected ? 'translateY(3px)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* QUESTION DE DIFFICULTÉ SÉLECTIONNÉE */}
            {selectedLevel && currentQuestion ? (
              <div style={{
                marginTop: '8px',
                background: '#f8fafc',
                border: '3px dashed #0284c7',
                borderRadius: '18px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.8rem', fontWeight: 900, padding: '3px 10px', borderRadius: '8px' }}>
                    NIVEAU {selectedLevel} / 10
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0369a1' }}>
                    Enjeu : +{selectedLevel} pts
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                  {currentQuestion.texte}
                </p>

                {/* ZONE DE RÉVÉLATION & ARBITRAGE */}
                {turnState === 'question_active' ? (
                  <button
                    id="reveal-synapse-btn"
                    type="button"
                    onClick={handleReveal}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '3px solid #1e293b',
                      background: '#fef08a',
                      color: '#854d0e',
                      fontWeight: 900,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 0 #1e293b'
                    }}
                  >
                    👀 Révéler la réponse
                  </button>
                ) : turnState === 'revealed' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    <div style={{
                      background: '#ecfdf5',
                      border: '2.5px solid #059669',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 800,
                      color: '#065f46',
                      fontSize: '1rem'
                    }}>
                      💡 Réponse : <strong>{currentQuestion.reponse}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        id="synapse-correct-btn"
                        type="button"
                        onClick={() => handleAnswerResult(true)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: '3px solid #14532d',
                          background: '#22c55e',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 0 #14532d'
                        }}
                      >
                        ✅ C'est bon (+{selectedLevel} pts)
                      </button>

                      <button
                        id="synapse-wrong-btn"
                        type="button"
                        onClick={() => handleAnswerResult(false)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: '3px solid #7f1d1d',
                          background: '#ef4444',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 0 #7f1d1d'
                        }}
                      >
                        ❌ Raté (0 pt)
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}>
                👆 Clique sur un chiffre ci-dessus pour afficher la question correspondante !
              </div>
            )}
          </div>
        )}
      </section>
    </GameLayout>
  )
}
