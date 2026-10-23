import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useGameData } from '../../hooks/useGameData'
import synapseFallback from '../../data/synapse.json'

const COLOR = CARD_COLORS.blue || '#0284c7'
const TARGET_SCORE = 35

/**
 * Pioche `count` indices de catégories aléatoires parmi celles qui n'ont pas encore été jouées.
 */
function drawRandomPropositions(categoriesList, count = 3, playedIds = new Set()) {
  if (!categoriesList || categoriesList.length === 0) return []

  let unplayed = categoriesList
    .map((cat, idx) => ({ cat, idx }))
    .filter(({ cat }) => !playedIds.has(cat.id || String(idx)))

  if (unplayed.length < count) {
    unplayed = categoriesList.map((cat, idx) => ({ cat, idx }))
  }

  const shuffled = [...unplayed].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, categoriesList.length)).map(item => item.idx)
}

export default function SynapseGame() {
  const { data: synapseData } = useGameData('synapse', synapseFallback)
  const categories = useMemo(() => synapseData?.categories || [], [synapseData])

  // Gestion des équipes / joueurs
  const [teams, setTeams] = useState([
    { id: 1, name: 'Équipe 1', score: 0 },
    { id: 2, name: 'Équipe 2', score: 0 },
  ])
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0)

  // Thèmes déjà joués au cours de la partie
  const [playedCategoryIds, setPlayedCategoryIds] = useState(() => new Set())

  // 3 propositions de thèmes aléatoires pour le tour
  const [propositions, setPropositions] = useState([])
  const [activePropIndex, setActivePropIndex] = useState(0)

  // Modale catalogue de recherche parmi les 75 thèmes
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  // Étape du tour : 'picking_level' | 'question_active' | 'revealed' | 'victory'
  const [turnState, setTurnState] = useState('picking_level')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    document.title = 'Synapse – Loustic'
  }, [])

  // Tirage initial aléatoire dès que les catégories sont disponibles
  useEffect(() => {
    if (categories.length > 0 && propositions.length === 0) {
      const drawn = drawRandomPropositions(categories, 3, playedCategoryIds)
      setPropositions(drawn)
      setActivePropIndex(0)
    }
  }, [categories, propositions.length, playedCategoryIds])

  // Catégorie active courante
  const currentCategoryIdx = propositions[activePropIndex] ?? 0
  const currentCategory = categories[currentCategoryIdx] || categories[0]
  const currentTeam = teams[currentTeamIdx]

  // Question correspondant au niveau choisi (1 à 10)
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

    // Marquer la catégorie courante comme jouée
    const updatedPlayed = new Set(playedCategoryIds)
    if (currentCategory?.id) {
      updatedPlayed.add(currentCategory.id)
    }
    setPlayedCategoryIds(updatedPlayed)

    // Vérifier si la cible de 35 points est atteinte
    if (newScore >= TARGET_SCORE) {
      setWinner({ name: currentTeam.name, score: newScore })
      setTurnState('victory')
      return
    }

    // Passer à l'équipe suivante et TIRER 3 NOUVELLES PROPOSITIONS ALÉATOIRES
    setCurrentTeamIdx(i => (i + 1) % teams.length)
    const nextProps = drawRandomPropositions(categories, 3, updatedPlayed)
    setPropositions(nextProps)
    setActivePropIndex(0)
    setSelectedLevel(null)
    setTurnState('picking_level')
  }

  // Re-tirer 3 nouvelles propositions aléatoires
  const handleRerollPropositions = () => {
    const drawn = drawRandomPropositions(categories, 3, playedCategoryIds)
    setPropositions(drawn)
    setActivePropIndex(0)
    setSelectedLevel(null)
    setTurnState('picking_level')
  }

  // Choisir un thème spécifique depuis le catalogue
  const handleSelectFromCatalog = (catIdx) => {
    setPropositions([catIdx, ...propositions.filter(idx => idx !== catIdx).slice(0, 2)])
    setActivePropIndex(0)
    setSelectedLevel(null)
    setTurnState('picking_level')
    setIsCatalogOpen(false)
  }

  // Recommencer une nouvelle partie
  const handleRestart = () => {
    setTeams([
      { id: 1, name: 'Équipe 1', score: 0 },
      { id: 2, name: 'Équipe 2', score: 0 },
    ])
    setCurrentTeamIdx(0)
    const freshPlayed = new Set()
    setPlayedCategoryIds(freshPlayed)
    const freshProps = drawRandomPropositions(categories, 3, freshPlayed)
    setPropositions(freshProps)
    setActivePropIndex(0)
    setSelectedLevel(null)
    setTurnState('picking_level')
    setWinner(null)
  }

  // Filtrage du catalogue des 75 thèmes
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase()
    return categories
      .map((cat, idx) => ({ cat, idx }))
      .filter(({ cat }) => {
        if (!q) return true
        return (
          cat.title?.toLowerCase().includes(q) ||
          cat.emoji?.toLowerCase().includes(q) ||
          cat.id?.toLowerCase().includes(q)
        )
      })
  }, [categories, catalogSearch])

  const footer = turnState === 'victory' ? (
    <CartoonButton id="synapse-restart-btn" variant="success" onClick={handleRestart}>
      🔄 Nouvelle partie (Objectif 35 pts)
    </CartoonButton>
  ) : (
    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
      {turnState === 'picking_level' && (
        <>
          <CartoonButton id="synapse-reroll-btn" variant="secondary" onClick={handleRerollPropositions}>
            🎲 Tirer 3 autres thèmes
          </CartoonButton>
          <CartoonButton id="synapse-catalog-btn" variant="neutral" onClick={() => setIsCatalogOpen(true)}>
            📚 Tous les thèmes ({categories.length})
          </CartoonButton>
        </>
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
          <>
            {/* PROPOSITIONS ALÉATOIRES DE THÈMES (3 AU CHOIX) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 16px',
              border: '3px solid #1e293b',
              boxShadow: '0 6px 0 #1e293b',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>
                  🎲 Thèmes proposés (Choisis-en 1) :
                </span>
                <button
                  id="synapse-reroll-quick-btn"
                  type="button"
                  onClick={handleRerollPropositions}
                  disabled={turnState !== 'picking_level'}
                  title="Tirer 3 autres propositions aléatoires dans la base de données"
                  style={{
                    background: '#e0f2fe',
                    border: '2px solid #0284c7',
                    color: '#0284c7',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    cursor: turnState === 'picking_level' ? 'pointer' : 'not-allowed',
                    opacity: turnState === 'picking_level' ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🔄 Relancer
                </button>
              </div>

              {/* 3 CARTES PROPOSITIONS ALÉATOIRES */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {propositions.map((pIdx, idx) => {
                  const cat = categories[pIdx]
                  if (!cat) return null
                  const isSelected = idx === activePropIndex
                  return (
                    <button
                      key={cat.id || pIdx}
                      id={`theme-prop-btn-${idx}`}
                      type="button"
                      onClick={() => {
                        if (turnState === 'picking_level') {
                          setActivePropIndex(idx)
                          setSelectedLevel(null)
                        }
                      }}
                      disabled={turnState !== 'picking_level'}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 6px',
                        borderRadius: '16px',
                        border: isSelected ? '3.5px solid #0284c7' : '2.5px solid #cbd5e1',
                        background: isSelected ? '#f0f9ff' : '#f8fafc',
                        boxShadow: isSelected ? '0 5px 0 #0284c7' : '0 2px 0 #cbd5e1',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                        cursor: turnState === 'picking_level' ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        gap: '4px',
                        minHeight: '85px'
                      }}
                    >
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{cat.emoji || '🎯'}</span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        color: isSelected ? '#0369a1' : '#475569',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {cat.title}
                      </span>
                      {isSelected && (
                        <span style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '1px 6px',
                          borderRadius: '999px',
                          marginTop: '2px'
                        }}>
                          CHOISI
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CARTE DU THÈME ACTIF SÉLECTIONNÉ */}
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
              {/* EN-TÊTE DU THÈME */}
              <div style={{
                background: '#fef08a',
                border: '3.5px solid #ca8a04',
                borderRadius: '20px',
                padding: '16px 14px',
                textAlign: 'center',
                boxShadow: '0 6px 0 #ca8a04',
                position: 'relative'
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
                  fontSize: 'clamp(1.5rem, 5vw, 2.1rem)',
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
                    <span
                      style={{
                        background: selectedLevel >= 8 ? '#dc2626' : '#0284c7',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        padding: '3px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      NIVEAU {selectedLevel} / 10 {selectedLevel >= 8 ? '🔥 DÉFI EXTRÊME' : ''}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedLevel >= 8 ? '#dc2626' : '#0369a1' }}>
                      Enjeu : +{selectedLevel} pts
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                    {currentQuestion.texte}
                  </p>

                  {/* ZONE DE RÉVÉLATION & VALIDATION */}
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
                      Révéler la réponse
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
                        Réponse : <strong>{currentQuestion.reponse}</strong>
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
                          Bonne réponse (+{selectedLevel} pts)
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
                          Faux (0 pt)
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
          </>
        )}
      </section>

      {/* MODALE CATALOGUE : TOUS LES 75 THÈMES AVEC RECHERCHE */}
      {isCatalogOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '4px solid #1e293b',
            boxShadow: '0 12px 0 #1e293b',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header du catalogue */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '3px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  📚 Catalogue des thèmes ({categories.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Choisis n'importe quel thème de la base de données
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogOpen(false)}
                style={{
                  background: '#fee2e2',
                  border: '2px solid #ef4444',
                  color: '#dc2626',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Champ de recherche */}
            <div style={{ padding: '12px 20px', borderBottom: '2px solid #f1f5f9' }}>
              <input
                type="text"
                placeholder="🔍 Rechercher un thème (ex: cinéma, pizza, chat, manga...)"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Liste des catégories */}
            <div style={{
              padding: '16px 20px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {filteredCatalog.map(({ cat, idx }) => {
                const isPlayed = playedCategoryIds.has(cat.id || String(idx))
                const isCurrent = idx === currentCategoryIdx
                return (
                  <button
                    key={cat.id || idx}
                    type="button"
                    onClick={() => handleSelectFromCatalog(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      border: isCurrent ? '2.5px solid #0284c7' : '2px solid #e2e8f0',
                      background: isCurrent ? '#f0f9ff' : isPlayed ? '#f8fafc' : '#ffffff',
                      boxShadow: '0 2px 0 #cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{cat.emoji || '🎯'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: isCurrent ? '#0284c7' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {cat.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                        {isCurrent ? '⚡ En cours' : isPlayed ? '✅ Déjà joué' : '10 questions'}
                      </span>
                    </div>
                  </button>
                )
              })}
              {filteredCatalog.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#94a3b8', fontWeight: 800 }}>
                  Aucun thème trouvé pour "{catalogSearch}" 🧐
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GameLayout>
  )
}
