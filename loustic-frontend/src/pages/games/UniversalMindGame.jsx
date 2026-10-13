import { useState, useEffect, useRef } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import universalMindData from '../../data/universalmind.json'

const COLOR = CARD_COLORS.purple

const WORDS_TO_GUESS = (universalMindData.words || [
  'Pyramide', 'Bicyclette', 'Café', 'Chocolat', 'Volcan', 'Astronaute',
  'Tour Eiffel', 'Pianiste', 'Dinosaure', 'Arc-en-ciel', 'Cinéma',
  'Sous-marin', 'Vampire', 'Samouraï', 'Labyrinthe', 'Pompier',
  'Château', 'Plongée', 'Robot', 'Mariage', 'Crocodile', 'Tempête',
]).map((w, idx) => ({
  word: w,
  cat: ['Général', 'Objet', 'Lieu', 'Nature', 'Culture', 'Métier', 'Fiction'][idx % 7],
}))

const CONCEPTS = universalMindData.concepts || []

const PRESET_TEAMS = [
  { name: 'Équipe Violette 🔮', color: '#8c7ae6', bg: '#ede7f6' },
  { name: 'Équipe Jaune ⚡', color: '#e17055', bg: '#fff8e1' },
  { name: 'Équipe Rose 🌸', color: '#e84393', bg: '#fce4ec' },
  { name: 'Équipe Bleue 🌊', color: '#00a8ff', bg: '#e1f5fe' },
  { name: 'Équipe Verte 🍃', color: '#4cd137', bg: '#e8f5e9' },
  { name: 'Équipe Rouge 🌶️', color: '#eb2f06', bg: '#ffebee' },
]

export default function UniversalMindGame() {
  // Lobby State
  const [started, setStarted] = useState(false)
  const [teams, setTeams] = useState([
    { id: 1, name: 'Équipe Violette 🔮', color: '#8c7ae6', bg: '#ede7f6', score: 0 },
    { id: 2, name: 'Équipe Jaune ⚡', color: '#f39c12', bg: '#fff8e1', score: 0 },
  ])
  const [roundDuration, setRoundDuration] = useState(60) // 45, 60, 90, 120
  const [targetScore, setTargetScore] = useState(5) // 3, 5, 10, 0 (infini)

  // Game Play State
  const [activeTeamIdx, setActiveTeamIdx] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [placedIcons, setPlacedIcons] = useState([])
  const [filterQuery, setFilterQuery] = useState('')

  // Timer State
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)

  // Score Award Modal / Winner
  const [winnerTeam, setWinnerTeam] = useState(null)
  const [showPointAward, setShowPointAward] = useState(false)

  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'Universal mind 🌐 – Loustic'
  }, [])

  // Timer logic
  useEffect(() => {
    if (!started || !timerRunning) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimerRunning(false)
          setTimeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [started, timerRunning])

  const currentItem = WORDS_TO_GUESS[wordIdx % WORDS_TO_GUESS.length]
  const currentTeam = teams[activeTeamIdx % teams.length] || teams[0]

  // Lobby actions
  const addTeam = () => {
    if (teams.length >= PRESET_TEAMS.length) return
    const nextPreset = PRESET_TEAMS[teams.length]
    setTeams(prev => [
      ...prev,
      { id: Date.now(), name: nextPreset.name, color: nextPreset.color, bg: nextPreset.bg, score: 0 },
    ])
  }

  const removeTeam = id => {
    if (teams.length <= 2) return // Minimum 2 équipes
    setTeams(prev => prev.filter(t => t.id !== id))
  }

  const updateTeamName = (id, newName) => {
    setTeams(prev => prev.map(t => (t.id === id ? { ...t, name: newName } : t)))
  }

  const handleStartGame = () => {
    if (teams.length < 2) return
    setStarted(true)
    setActiveTeamIdx(0)
    setWordIdx(0)
    setShowSecret(false)
    setPlacedIcons([])
    setTimeLeft(roundDuration)
    setTimerRunning(true)
    setTimeExpired(false)
    setWinnerTeam(null)
  }

  // Turn navigation
  const nextTurn = (changeWord = true) => {
    if (changeWord) {
      setWordIdx(i => i + 1)
    }
    setShowSecret(false)
    setPlacedIcons([])
    setActiveTeamIdx(i => (i + 1) % teams.length)
    setTimeLeft(roundDuration)
    setTimerRunning(true)
    setTimeExpired(false)
    setShowPointAward(false)
  }

  const toggleIcon = concept => {
    setPlacedIcons(prev => {
      const exists = prev.some(c => c.label === concept.label)
      if (exists) return prev.filter(c => c.label !== concept.label)
      return [...prev, concept]
    })
  }

  const clearIcons = () => setPlacedIcons([])

  const handleAwardPoint = teamId => {
    const updated = teams.map(t => {
      if (t.id === teamId) {
        const nextScore = t.score + 1
        return { ...t, score: nextScore }
      }
      return t
    })
    setTeams(updated)
    setShowPointAward(false)

    // Check victory
    const winning = updated.find(t => targetScore > 0 && t.score >= targetScore)
    if (winning) {
      setWinnerTeam(winning)
      setTimerRunning(false)
    } else {
      nextTurn(true)
    }
  }

  const filteredConcepts = CONCEPTS.filter(c =>
    !filterQuery.trim() || c.label.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // ----------------------------------------------------
  // ÉCRAN 1 : LOBBY & SÉLECTION DES ÉQUIPES (Min 2 équipes)
  // ----------------------------------------------------
  if (!started) {
    return (
      <GameLayout
        gameKey="universalmind"
        title="Universal mind 🌐"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-universalmind-btn"
            variant="success"
            disabled={teams.length < 2}
            onClick={handleStartGame}
          >
            Lancer la partie 🚀 ({teams.length} équipes)
          </CartoonButton>
        }
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: '#ede7f6',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '4px 4px 0 #161513',
              textAlign: 'center',
            }}
          >
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem' }}>Board de Sélection 👥</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#57606f', fontWeight: 600 }}>
              Faites deviner des mots mystères grâce aux symboles universels !
              <br />
              <strong style={{ color: '#eb2f06' }}>Minimum 2 équipes requises</strong> pour jouer.
            </p>
          </div>

          {/* Liste des équipes */}
          <div
            style={{
              background: '#fff',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '4px 4px 0 #161513',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Équipes inscrites ({teams.length}) :</span>
              {teams.length < PRESET_TEAMS.length && (
                <button
                  type="button"
                  onClick={addTeam}
                  style={{
                    background: '#f9c835',
                    border: '2px solid #161513',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0 #161513',
                  }}
                >
                  + Ajouter équipe
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teams.map((t, idx) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: t.bg || '#f1f2f6',
                    border: '2px solid #161513',
                    borderRadius: '12px',
                    padding: '8px 10px',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: t.color,
                      border: '2px solid #161513',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    value={t.name}
                    onChange={e => updateTeamName(t.id, e.target.value)}
                    style={{
                      flex: 1,
                      border: '2px solid #161513',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontWeight: 700,
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '0.95rem',
                      background: '#fff',
                    }}
                  />
                  {teams.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeTeam(t.id)}
                      title="Supprimer cette équipe"
                      style={{
                        background: '#ff7675',
                        border: '2px solid #161513',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Réglages Chrono & Objectif */}
          <div
            style={{
              background: '#fff',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '4px 4px 0 #161513',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', display: 'block', marginBottom: '6px' }}>
                ⏱️ Chrono par tour :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[45, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRoundDuration(sec)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: '2px solid #161513',
                      background: roundDuration === sec ? '#f9c835' : '#f8f9fa',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: roundDuration === sec ? 'inset 2px 2px 0 rgba(0,0,0,0.15)' : '2px 2px 0 #161513',
                    }}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', display: 'block', marginBottom: '6px' }}>
                🏆 Score cible pour gagner :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: '3 pts', val: 3 },
                  { label: '5 pts', val: 5 },
                  { label: '10 pts', val: 10 },
                  { label: 'Infini ∞', val: 0 },
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTargetScore(item.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: '2px solid #161513',
                      background: targetScore === item.val ? '#f9c835' : '#f8f9fa',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: targetScore === item.val ? 'inset 2px 2px 0 rgba(0,0,0,0.15)' : '2px 2px 0 #161513',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 2 : VICTOIRE D'UNE ÉQUIPE
  // ----------------------------------------------------
  if (winnerTeam) {
    return (
      <GameLayout
        gameKey="universalmind"
        title="Victoire ! 🏆"
        color={COLOR}
        footer={
          <CartoonButton variant="success" onClick={handleStartGame}>
            Rejouer une partie 🔄
          </CartoonButton>
        }
      >
        <div
          style={{
            background: winnerTeam.bg || '#fff',
            border: '4px solid #161513',
            borderRadius: '20px',
            padding: '24px 16px',
            textAlign: 'center',
            boxShadow: '6px 6px 0 #161513',
          }}
        >
          <span style={{ fontSize: '4rem', display: 'block' }}>👑</span>
          <h2 style={{ fontSize: '1.8rem', margin: '8px 0' }}>Victoire de {winnerTeam.name} !</h2>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0' }}>
            Score final : {winnerTeam.score} points 🌟
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            {teams.map(t => (
              <span
                key={t.id}
                style={{
                  background: '#fff',
                  border: '2px solid #161513',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontWeight: 800,
                }}
              >
                {t.name} : {t.score} pts
              </span>
            ))}
          </div>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 3 : JEU EN COURS (PLATEAU RESPONSIVE + CHRONO)
  // ----------------------------------------------------
  const footer = (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <CartoonButton
        id="found-mind-btn"
        variant="success"
        onClick={() => setShowPointAward(true)}
      >
        ✅ Trouvé !
      </CartoonButton>
      <CartoonButton
        id="next-mind-btn"
        variant="secondary"
        onClick={() => nextTurn(true)}
      >
        Passer ⏩
      </CartoonButton>
    </div>
  )

  return (
    <GameLayout gameKey="universalmind" title="Universal mind 🌐" color={COLOR} footer={footer}>
      <CardStage cardKey={`${wordIdx}`} tag={`Catégorie : ${currentItem.cat}`}>
        {/* Équipe active & Chrono bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            background: currentTeam.bg || '#ede7f6',
            border: '2px solid #161513',
            borderRadius: '12px',
            padding: '6px 10px',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentTeam.color,
                display: 'inline-block',
                border: '1px solid #161513',
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              Tour : <strong>{currentTeam.name}</strong>
            </span>
          </div>

          {/* Chronomètre interactif */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setTimerRunning(r => !r)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 0,
              }}
              title={timerRunning ? 'Mettre en pause' : 'Démarrer le chrono'}
            >
              {timerRunning ? '⏸️' : '▶️'}
            </button>
            <span
              style={{
                background: timeExpired ? '#ff4757' : timeLeft <= 10 ? '#ffa502' : '#ffffff',
                color: timeExpired ? '#ffffff' : '#161513',
                border: '2px solid #161513',
                borderRadius: '8px',
                padding: '2px 8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                animation: timeLeft <= 10 && timerRunning ? 'pulse 1s infinite' : 'none',
              }}
            >
              ⏱️ {timeLeft}s
            </span>
          </div>
        </div>

        {/* Mot secret réservé au guide */}
        <div style={{ width: '100%', marginBottom: '8px', textAlign: 'center' }}>
          {!showSecret ? (
            <button
              id="show-mind-word-btn"
              type="button"
              className="btn-action-primary"
              style={{
                width: '100%',
                minHeight: '42px',
                height: '42px',
                fontSize: '0.9rem',
                borderRadius: '12px',
                background: '#f5cd79',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onClick={() => setShowSecret(true)}
            >
              👀 Voir le mot secret (Guide uniquement)
            </button>
          ) : (
            <div
              style={{
                background: '#faf6eb',
                border: '2px solid #161513',
                borderRadius: '12px',
                padding: '8px 12px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#57606f', fontWeight: 800 }}>
                MOT À FAIRE DEVINER :
              </span>
              <h2 className="word-display" style={{ margin: '2px 0', fontSize: '1.4rem' }}>
                {currentItem.word}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', color: '#eb2f06' }}
                  onClick={() => setShowSecret(false)}
                >
                  🙈 Masquer
                </button>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', color: '#0984e3' }}
                  onClick={() => setWordIdx(i => i + 1)}
                >
                  🎲 Autre mot
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indices symboliques placés (Zone active) */}
        <div
          style={{
            width: '100%',
            minHeight: '46px',
            border: '2px dashed #161513',
            borderRadius: '12px',
            padding: '6px 8px',
            marginBottom: '8px',
            background: '#fafaf9',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#57606f' }}>
              Symboles activés ({placedIcons.length}) :
            </span>
            {placedIcons.length > 0 && (
              <button
                type="button"
                onClick={clearIcons}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#eb2f06',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🧹 Tout effacer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {placedIcons.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#a4b0be', fontStyle: 'italic' }}>
                Touchez les symboles du tableau ci-dessous pour former vos indices !
              </span>
            ) : (
              placedIcons.map((pi, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleIcon(pi)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    background: '#f9c835',
                    border: '2px solid #161513',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>{pi.icon}</span>
                  <span>{pi.label}</span>
                  <span style={{ color: '#eb2f06', marginLeft: '2px' }}>✕</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Champ de recherche pour trouver rapidement un symbole */}
        <div style={{ width: '100%', marginBottom: '6px' }}>
          <input
            type="text"
            placeholder="🔍 Filtrer les symboles (eau, animal, objet...)"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '2px solid #161513',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontFamily: 'Fredoka, sans-serif',
              background: '#fff',
            }}
          />
        </div>

        {/* Tableau des concepts ULTRA-RESPONSIVE */}
        <div
          id="concepts-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
            gap: '6px',
            width: '100%',
            maxHeight: 'clamp(180px, 28vh, 260px)',
            overflowY: 'auto',
            padding: '2px',
            border: '2px solid #161513',
            borderRadius: '12px',
            background: '#ffffff',
            touchAction: 'manipulation',
          }}
        >
          {filteredConcepts.map(c => {
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
                  justifyContent: 'center',
                  padding: '6px 2px',
                  borderRadius: '10px',
                  border: isSelected ? '3px solid #161513' : '2px solid #dcdde1',
                  background: isSelected ? '#f9c835' : '#ffffff',
                  boxShadow: isSelected ? 'none' : '1px 1px 0 #161513',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(0.96)' : 'none',
                  transition: 'all 0.12s ease',
                  minHeight: '58px',
                }}
                onClick={() => toggleIcon(c)}
              >
                <span style={{ fontSize: '1.35rem', lineHeight: 1.1 }}>{c.icon}</span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: '#161513',
                    textAlign: 'center',
                    marginTop: '2px',
                    lineHeight: 1.1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '65px',
                  }}
                >
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tableau des scores des équipes */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            marginTop: '8px',
          }}
        >
          {teams.map((t, idx) => {
            const isTurn = idx === activeTeamIdx % teams.length
            return (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isTurn ? '#fff9c4' : '#f1f2f6',
                  border: isTurn ? '2px solid #161513' : '1px solid #ced6e0',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: t.color,
                    display: 'inline-block',
                  }}
                />
                <span>{t.name} : {t.score} pt{t.score > 1 ? 's' : ''}</span>
              </div>
            )
          })}
        </div>

        {/* Modal / Choix d'attribution du point quand trouvé */}
        {showPointAward && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '3px solid #161513',
                borderRadius: '16px',
                padding: '18px',
                maxWidth: '360px',
                width: '100%',
                boxShadow: '6px 6px 0 #161513',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>Quelle équipe a trouvé ? 🎯</h3>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#57606f' }}>
                Attribuez le point pour valider la manche :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {teams.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleAwardPoint(t.id)}
                    style={{
                      background: t.bg || '#f1f2f6',
                      border: '2px solid #161513',
                      borderRadius: '10px',
                      padding: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '2px 2px 0 #161513',
                    }}
                  >
                    <span>{t.name}</span>
                    <span style={{ color: '#2ed573' }}>+1 pt</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowPointAward(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#747d8c',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </CardStage>
    </GameLayout>
  )
}
