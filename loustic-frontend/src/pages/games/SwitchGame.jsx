import { useState, useEffect, useRef, useCallback } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import switchData from '../../data/switch.json'

const COLOR = CARD_COLORS.blue
const TEAM_COLORS = ['#2e86de', '#eb4d4b', '#20bf6b', '#f9ca24']

const FLASHGUESS_ROUNDS = [
  { id: 'speak', title: 'Manche 1 : Parler 🗣️', desc: 'Décrivez avec des phrases sans prononcer le mot ni de dérivés !' },
  { id: 'oneword', title: 'Manche 2 : Un Mot 🤐', desc: '1 seul mot d’indice autorisé par carte pour faire deviner !' },
  { id: 'mime', title: 'Manche 3 : Mime 🎭', desc: 'Mimez sans parler ni faire de bruitages !' },
  { id: 'statue', title: 'Manche 4 : Statue 🗽', desc: 'Prenez une seule pose immobile comme une statue !' },
]

export default function SwitchGame() {
  // Navigation des écrans : 'MENU' | 'SETUP' | 'ROUND_TRANSITION' | 'READY' | 'PLAYING' | 'GAMEOVER'
  const [screen, setScreen] = useState('MENU')
  const [gameMode, setGameMode] = useState('flashguess') // 'flashguess' | 'sketchit'
  const [hotMode, setHotMode] = useState(false)

  // Configuration
  const [teamsCount, setTeamsCount] = useState(2)
  const [wordCount, setWordCount] = useState(20)
  const [turnDuration, setTurnDuration] = useState(60)

  // État du jeu
  const [teams, setTeams] = useState([])
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0)
  const [masterDeck, setMasterDeck] = useState([])
  const [activeDeck, setActiveDeck] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)

  // Sketch It Canvas ref
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const [penColor, setPenColor] = useState('#161513')

  // Timer interval ref
  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'Switch ⚡ – Loustic'
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Choix du mode au menu
  const selectMode = mode => {
    setGameMode(mode)
    setScreen('SETUP')
  }

  // Lancement du jeu
  const handleStartGame = () => {
    // 1. Initialiser les équipes
    const initialTeams = []
    for (let i = 0; i < teamsCount; i++) {
      initialTeams.push({ name: `Équipe ${i + 1}`, score: 0 })
    }
    setTeams(initialTeams)
    setCurrentTeamIdx(0)

    // 2. Tirer le paquet maître de mots depuis switch.json
    const sourceWords = hotMode ? (switchData.hot || switchData.normal) : (switchData.normal || [])
    const shuffledSource = [...sourceWords].sort(() => Math.random() - 0.5)
    const pickedWords = shuffledSource.slice(0, Math.min(wordCount, shuffledSource.length))

    setMasterDeck(pickedWords)
    setActiveDeck([...pickedWords].sort(() => Math.random() - 0.5))
    setCurrentRoundIdx(0)
    setTimeLeft(turnDuration)

    if (gameMode === 'flashguess') {
      setScreen('ROUND_TRANSITION')
    } else {
      setScreen('READY')
    }
  }

  // Fin de temps de tour
  const endTurn = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Passer la main à l'équipe suivante
    setCurrentTeamIdx(prev => (prev + 1) % teamsCount)
    setScreen('READY')
  }, [teamsCount])

  // Démarrer un tour de jeu
  const startTurn = useCallback(() => {
    if (activeDeck.length === 0) return
    setTimeLeft(turnDuration)
    setCurrentWord(activeDeck[0])
    setScreen('PLAYING')

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          endTurn()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [activeDeck, turnDuration, endTurn])

  // Mot validé (Trouvé !)
  const handleWordFound = () => {
    // +1 point pour l'équipe active
    setTeams(prevTeams => {
      const next = [...prevTeams]
      next[currentTeamIdx] = {
        ...next[currentTeamIdx],
        score: next[currentTeamIdx].score + 1,
      }
      return next
    })

    // Retirer le mot du paquet actif de la manche
    const remainingDeck = activeDeck.slice(1)
    setActiveDeck(remainingDeck)

    // Si plus de cartes dans la manche
    if (remainingDeck.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      handleRoundComplete()
    } else {
      setCurrentWord(remainingDeck[0])
    }
  }

  // Passer le mot (remis en fin de paquet)
  const handleWordPass = () => {
    if (activeDeck.length <= 1) return
    const rotatedDeck = [...activeDeck.slice(1), activeDeck[0]]
    setActiveDeck(rotatedDeck)
    setCurrentWord(rotatedDeck[0])
  }

  // Fin de manche
  const handleRoundComplete = () => {
    const totalRounds = gameMode === 'flashguess' ? FLASHGUESS_ROUNDS.length : 1
    if (currentRoundIdx + 1 >= totalRounds) {
      setScreen('GAMEOVER')
    } else {
      const nextRound = currentRoundIdx + 1
      setCurrentRoundIdx(nextRound)
      // Réinitialiser le paquet actif avec tout le paquet maître pour la nouvelle manche !
      const reShuffled = [...masterDeck].sort(() => Math.random() - 0.5)
      setActiveDeck(reShuffled)
      setCurrentWord(reShuffled[0] || '')
      setCurrentTeamIdx(nextRound % teamsCount)
      setScreen('ROUND_TRANSITION')
    }
  }

  // Canvas Drawing Logic pour Sketch It
  const startDrawing = e => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    isDrawingRef.current = true
  }

  const draw = e => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = penColor
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    isDrawingRef.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const currentRound = gameMode === 'flashguess'
    ? FLASHGUESS_ROUNDS[currentRoundIdx]
    : { title: 'Sketch It ! 🎨', desc: 'Dessinez sans parler ni écrire de lettres ou de chiffres !' }

  const activeTeam = teams[currentTeamIdx] || { name: 'Équipe 1', score: 0 }
  const activeColor = TEAM_COLORS[currentTeamIdx % TEAM_COLORS.length]

  // ==================== RENDU : MENU ====================
  if (screen === 'MENU') {
    return (
      <GameLayout gameKey="switch" title="Switch ⚡" color={COLOR}>
        <section className="game-stage-card stage-pop" style={{ gap: '20px', maxWidth: '440px' }}>
          <div style={{ fontSize: '3.5rem' }}>⚡✨</div>
          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.8rem', margin: 0 }}>
            Bienvenue dans Switch !
          </h2>
          <p className="hint">Choisissez votre mode de jeu en équipe :</p>

          <button
            id="btn-flashguess"
            type="button"
            className="home-card"
            style={{ width: '100%', padding: '16px', textAlign: 'left', background: '#e1f5fe', border: '3px solid #161513', borderRadius: '16px', boxShadow: '4px 4px 0 #161513' }}
            onClick={() => selectMode('flashguess')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2.4rem' }}>⏳</span>
              <div>
                <strong style={{ fontSize: '1.25rem', display: 'block', color: '#0984e3' }}>Flash Guess (Time’s Up)</strong>
                <span style={{ fontSize: '0.9rem', color: '#636e72' }}>4 manches : Parler, 1 Mot, Mime, Statue !</span>
              </div>
            </div>
          </button>

          <button
            id="btn-pictionary"
            type="button"
            className="home-card"
            style={{ width: '100%', padding: '16px', textAlign: 'left', background: '#fff3e0', border: '3px solid #161513', borderRadius: '16px', boxShadow: '4px 4px 0 #161513' }}
            onClick={() => selectMode('sketchit')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2.4rem' }}>🎨</span>
              <div>
                <strong style={{ fontSize: '1.25rem', display: 'block', color: '#d35400' }}>Sketch It ! (Pictionary)</strong>
                <span style={{ fontSize: '0.9rem', color: '#636e72' }}>Dessinez sur l'écran pour faire deviner à votre équipe !</span>
              </div>
            </div>
          </button>
        </section>
      </GameLayout>
    )
  }

  // ==================== RENDU : SETUP ====================
  if (screen === 'SETUP') {
    return (
      <GameLayout gameKey="switch" title="Configuration Switch ⚡" color={COLOR} onBack={() => setScreen('MENU')}>
        <section className="game-stage-card" style={{ gap: '18px', maxWidth: '440px' }}>
          <h2 style={{ fontFamily: 'Carter One, cursive', margin: 0 }}>
            {gameMode === 'flashguess' ? '⏳ Flash Guess (Time’s Up)' : '🎨 Sketch It ! (Pictionary)'}
          </h2>

          {/* Nombre d'équipes */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <label className="field-label">Nombre d'équipes :</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`btn-tag ${teamsCount === n ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '3px solid #161513',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: teamsCount === n ? '#00a8ff' : '#fff',
                    color: teamsCount === n ? '#fff' : '#161513',
                  }}
                  onClick={() => setTeamsCount(n)}
                >
                  {n} Équipes
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de cartes */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <label className="field-label">Nombre de cartes à deviner :</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {[15, 20, 30, 40].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`btn-tag ${wordCount === n ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '3px solid #161513',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: wordCount === n ? '#00a8ff' : '#fff',
                    color: wordCount === n ? '#fff' : '#161513',
                  }}
                  onClick={() => setWordCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Durée du sablier */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <label className="field-label">Temps par tour (sablier) :</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {[45, 60, 90].map(sec => (
                <button
                  key={sec}
                  type="button"
                  className={`btn-tag ${turnDuration === sec ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '3px solid #161513',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: turnDuration === sec ? '#00a8ff' : '#fff',
                    color: turnDuration === sec ? '#fff' : '#161513',
                  }}
                  onClick={() => setTurnDuration(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Filtre Hot */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', cursor: 'pointer', fontWeight: 700, padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={hotMode}
              onChange={e => setHotMode(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <span>Mode Hot 🔥 (Mots et expressions épicées)</span>
          </label>

          <CartoonButton id="start-switch-btn" onClick={handleStartGame}>
            Valider et Distribuer 🚀
          </CartoonButton>
        </section>
      </GameLayout>
    )
  }

  // ==================== RENDU : TRANSITION DE MANCHE ====================
  if (screen === 'ROUND_TRANSITION') {
    return (
      <GameLayout gameKey="switch" title="Nouvelle Manche ⚡" color={COLOR}>
        <section className="game-stage-card stage-pop" style={{ gap: '16px', maxWidth: '440px' }}>
          <span className="stage-tag" style={{ background: activeColor, color: '#fff' }}>
            Manche {currentRoundIdx + 1}/4
          </span>
          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.8rem', margin: 0 }}>
            {currentRound.title}
          </h2>
          <div className="prompt-envelope" style={{ background: '#f8f9fa', border: '3px solid #161513' }}>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#2d3436' }}>
              {currentRound.desc}
            </p>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span>Équipe qui commence : </span>
            <strong style={{ color: activeColor, fontSize: '1.25rem' }}>{activeTeam.name}</strong>
          </div>
          <CartoonButton id="continue-round-btn" onClick={() => setScreen('READY')}>
            Prêt à jouer ! ➡️
          </CartoonButton>
        </section>
      </GameLayout>
    )
  }

  // ==================== RENDU : READY (À VOUS DE JOUER) ====================
  if (screen === 'READY') {
    return (
      <GameLayout gameKey="switch" title={`Au tour de ${activeTeam.name}`} color={COLOR}>
        <section className="game-stage-card stage-pop" style={{ gap: '18px', maxWidth: '440px' }}>
          <span className="stage-tag" style={{ background: activeColor, color: '#fff' }}>
            {currentRound.title}
          </span>

          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.9rem', margin: 0, color: activeColor }}>
            {activeTeam.name}
          </h2>

          <p className="hint">
            Désignez le descripteur et préparez-vous. Dès le départ, le sablier de {turnDuration}s commence !
          </p>

          {/* Tableau des scores actuels */}
          <div style={{ width: '100%', background: '#fff', border: '3px solid #161513', borderRadius: '14px', padding: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.85rem', color: '#636e72' }}>
              Scores actuels :
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {teams.map((t, idx) => (
                <div key={t.name} style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 800, color: TEAM_COLORS[idx % TEAM_COLORS.length] }}>{t.name}</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{t.score} pts</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.95rem', color: '#747d8c' }}>
            Cartes restantes dans la manche : <strong>{activeDeck.length}</strong> / {masterDeck.length}
          </div>

          <CartoonButton id="start-turn-btn" onClick={startTurn}>
            Lancer le chrono ({turnDuration}s) ⏱️
          </CartoonButton>
        </section>
      </GameLayout>
    )
  }

  // ==================== RENDU : PLAYING ====================
  if (screen === 'PLAYING') {
    const isSketch = gameMode === 'sketchit'
    const footer = (
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <CartoonButton id="pass-word-btn" variant="secondary" onClick={handleWordPass}>
          Passer ➡️
        </CartoonButton>
        <CartoonButton id="validate-word-btn" variant="success" onClick={handleWordFound}>
          ✅ Trouvé ! (+1 pt)
        </CartoonButton>
      </div>
    )

    return (
      <GameLayout gameKey="switch" title={`Tour : ${activeTeam.name}`} color={COLOR} footer={footer}>
        <section className="game-stage-card stage-pop" style={{ gap: '12px', maxWidth: '440px' }}>
          {/* Header du tour : Équipe & Chrono */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontWeight: 800, color: activeColor, fontSize: '1.1rem' }}>
              {activeTeam.name} ({activeTeam.score} pts)
            </span>
            <span
              style={{
                fontFamily: 'Carter One, cursive',
                fontSize: '1.6rem',
                color: timeLeft <= 10 ? '#eb4d4b' : '#2d3436',
                background: timeLeft <= 10 ? '#ffebee' : '#f1f2f6',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '2px solid #161513',
              }}
            >
              ⏱️ {timeLeft}s
            </span>
          </div>

          {/* Rappel consigne manche */}
          <span className="stage-tag" style={{ background: '#f1f2f6', color: '#2d3436', border: '2px solid #161513' }}>
            {currentRound.title}
          </span>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#636e72', fontWeight: 600 }}>
            {currentRound.desc}
          </p>

          {/* Affichage du mot secret */}
          <div className="prompt-envelope" style={{ margin: '6px 0', minHeight: '80px', width: '100%' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0984e3', textTransform: 'uppercase' }}>
              Mot à faire deviner :
            </span>
            <h2 className="word-display" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', margin: '4px 0' }}>
              {currentWord || 'Prêt ?'}
            </h2>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#747d8c' }}>
            Reste dans la manche : <strong>{activeDeck.length}</strong> carte{activeDeck.length > 1 ? 's' : ''}
          </div>

          {/* Toile de dessin pour Sketch It */}
          {isSketch && (
            <div style={{ width: '100%', marginTop: '6px' }}>
              <canvas
                ref={canvasRef}
                width={340}
                height={220}
                style={{
                  background: '#ffffff',
                  border: '3px solid #161513',
                  borderRadius: '12px',
                  width: '100%',
                  touchAction: 'none',
                  cursor: 'crosshair',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                {['#161513', '#eb4d4b', '#0984e3', '#00b894'].map(c => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: penColor === c ? '3px solid #f1c40f' : '2px solid #161513',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPenColor(c)}
                  />
                ))}
                <button
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '2px solid #161513',
                    background: '#f8f9fa',
                    cursor: 'pointer',
                  }}
                  onClick={clearCanvas}
                >
                  Effacer 🗑️
                </button>
              </div>
            </div>
          )}
        </section>
      </GameLayout>
    )
  }

  // ==================== RENDU : GAME OVER ====================
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const winningTeam = sortedTeams[0] || { name: 'Équipe', score: 0 }
  const losingTeam = sortedTeams[sortedTeams.length - 1]

  return (
    <GameLayout gameKey="switch" title="Partie Terminée ! 🏁" color={COLOR}>
      <section className="game-stage-card stage-pop" style={{ gap: '18px', maxWidth: '440px' }}>
        <div style={{ fontSize: '3.5rem' }}>🏆🎉</div>
        <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '2rem', margin: 0, color: '#2d3436' }}>
          Victoire de {winningTeam.name} !
        </h2>
        <p className="hint">Avec un score retentissant de <strong>{winningTeam.score} points</strong> !</p>

        {/* Classement final */}
        <div style={{ width: '100%', background: '#fff', border: '3px solid #161513', borderRadius: '16px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'uppercase', color: '#636e72', fontSize: '0.9rem' }}>
            Classement Final :
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedTeams.map((t, idx) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: idx === 0 ? '#fff9c4' : '#f8f9fa',
                  border: '2px solid #161513',
                  fontWeight: 800,
                }}
              >
                <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'} {t.name}</span>
                <span>{t.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gage pour l'équipe perdante */}
        {losingTeam && (
          <div className="prompt-envelope" style={{ background: '#ffebee', border: '3px solid #eb4d4b', padding: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#eb4d4b', textTransform: 'uppercase' }}>
              ⚠️ Sentence des perdants :
            </span>
            <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: '#2d3436' }}>
              {losingTeam.name} doit subir le gage de l'équipe gagnante ou boire un shot collectif !
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <CartoonButton id="switch-replay-btn" onClick={() => setScreen('SETUP')}>
            🔄 Rejouer
          </CartoonButton>
          <CartoonButton variant="secondary" onClick={() => setScreen('MENU')}>
            Menu 🏠
          </CartoonButton>
        </div>
      </section>
    </GameLayout>
  )
}
