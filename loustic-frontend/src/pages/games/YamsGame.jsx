import { useState, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'
import yamsData from '../../data/yams.json'

const COLOR = CARD_COLORS.red

const INITIAL_DICE = [
  { value: 1, held: false },
  { value: 2, held: false },
  { value: 3, held: false },
  { value: 4, held: false },
  { value: 5, held: false },
]

export const YAMS_RULES = yamsData.rules

const DICE_PULLS = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
}

const CATEGORIES = [
  { key: 'ones', label: '1️⃣ As (Total des 1)', section: 'upper' },
  { key: 'twos', label: '2️⃣ Deux (Total des 2)', section: 'upper' },
  { key: 'threes', label: '3️⃣ Trois (Total des 3)', section: 'upper' },
  { key: 'fours', label: '4️⃣ Quatre (Total des 4)', section: 'upper' },
  { key: 'fives', label: '5️⃣ Cinq (Total des 5)', section: 'upper' },
  { key: 'sixes', label: '6️⃣ Six (Total des 6)', section: 'upper' },
  { key: 'brelan', label: '🎯 Brelan (3 identiques)', section: 'lower' },
  { key: 'carre', label: '🧱 Carré (4 identiques)', section: 'lower' },
  { key: 'full', label: '🏠 Full (3 + 2 = 25 pts)', section: 'lower' },
  { key: 'smallStraight', label: '📏 Petite suite (30 pts)', section: 'lower' },
  { key: 'largeStraight', label: '🚀 Grande suite (40 pts)', section: 'lower' },
  { key: 'yams', label: '👑 YAMS (5 identiques = 50 pts)', section: 'lower' },
  { key: 'chance', label: '🎲 Chance (Somme des dés)', section: 'lower' },
]

const UPPER_KEYS = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
const LOWER_KEYS = ['brelan', 'carre', 'full', 'smallStraight', 'largeStraight', 'yams', 'chance']
const ALL_KEYS = [...UPPER_KEYS, ...LOWER_KEYS]

export default function YamsGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)

  // Scores par joueur : { [playerName]: { [categoryKey]: score } }
  const [playerScores, setPlayerScores] = useState({})

  const [dice, setDice] = useState(INITIAL_DICE)
  const [rollsLeft, setRollsLeft] = useState(3)
  const [rolling, setRolling] = useState(false)

  const activePlayer = players.length > 0 ? players[currentIdx % players.length] : 'Joueur 1'
  const currentScores = playerScores[activePlayer] || {}

  const diceValues = useMemo(() => dice.map(d => d.value), [dice])

  // Calculs des scores possibles avec les dés actuels
  const potentialScores = useMemo(() => {
    const counts = {}
    diceValues.forEach(v => {
      counts[v] = (counts[v] || 0) + 1
    })
    const sum = diceValues.reduce((a, b) => a + b, 0)
    const uniqueSorted = [...new Set(diceValues)].sort((a, b) => a - b)
    const countsArr = Object.values(counts)

    const hasSmallStraight =
      [ [1,2,3,4], [2,3,4,5], [3,4,5,6] ].some(seq => seq.every(n => uniqueSorted.includes(n)))

    const hasLargeStraight =
      [ [1,2,3,4,5], [2,3,4,5,6] ].some(seq => seq.every(n => uniqueSorted.includes(n)))

    const hasBrelan = countsArr.some(c => c >= 3)
    const hasCarre = countsArr.some(c => c >= 4)
    const hasFull = (countsArr.includes(3) && countsArr.includes(2)) || countsArr.some(c => c === 5)
    const hasYams = countsArr.some(c => c === 5)

    return {
      ones: (counts[1] || 0) * 1,
      twos: (counts[2] || 0) * 2,
      threes: (counts[3] || 0) * 3,
      fours: (counts[4] || 0) * 4,
      fives: (counts[5] || 0) * 5,
      sixes: (counts[6] || 0) * 6,
      brelan: hasBrelan ? sum : 0,
      carre: hasCarre ? sum : 0,
      full: hasFull ? 25 : 0,
      smallStraight: hasSmallStraight ? 30 : 0,
      largeStraight: hasLargeStraight ? 40 : 0,
      yams: hasYams ? 50 : 0,
      chance: sum,
    }
  }, [diceValues])

  // Lancement des dés avec animation
  const rollDice = () => {
    if (rollsLeft <= 0 || rolling) return
    setRolling(true)

    let ticks = 0
    const interval = setInterval(() => {
      ticks++
      setDice(prev =>
        prev.map(d =>
          d.held ? d : { ...d, value: Math.floor(Math.random() * 6) + 1 }
        )
      )
      if (ticks > 8) {
        clearInterval(interval)
        setRolling(false)
        setRollsLeft(r => r - 1)
      }
    }, 60)
  }

  // Garder ou relancer un dé
  const toggleHold = index => {
    if (rollsLeft === 3 || rolling) return
    setDice(prev =>
      prev.map((d, i) => (i === index ? { ...d, held: !d.held } : d))
    )
  }

  // Choix d'une case sur la feuille de score
  const pickCategory = key => {
    if (rollsLeft === 3) return
    if (currentScores[key] !== undefined) return

    const scoreVal = potentialScores[key] ?? 0

    // Enregistrer le score pour le joueur actif
    setPlayerScores(prev => ({
      ...prev,
      [activePlayer]: {
        ...(prev[activePlayer] || {}),
        [key]: scoreVal,
      },
    }))

    // Passer au joueur suivant
    setCurrentIdx(i => (i + 1) % players.length)
    setDice(INITIAL_DICE)
    setRollsLeft(3)
  }

  // Démarrer la partie
  const handleStart = () => {
    const initScores = {}
    players.forEach(p => { initScores[p] = {} })
    setPlayerScores(initScores)
    setCurrentIdx(0)
    setDice(INITIAL_DICE)
    setRollsLeft(3)
    setStarted(true)
  }

  const resetGame = () => {
    handleStart()
  }

  // Calcul du total d'un joueur
  const calculatePlayerTotals = pScores => {
    const upperSubtotal = UPPER_KEYS.reduce((acc, k) => acc + (pScores[k] || 0), 0)
    const upperBonus = upperSubtotal >= 63 ? 35 : 0
    const upperTotal = upperSubtotal + upperBonus
    const lowerTotal = LOWER_KEYS.reduce((acc, k) => acc + (pScores[k] || 0), 0)
    const grandTotal = upperTotal + lowerTotal
    const filledCount = ALL_KEYS.filter(k => pScores[k] !== undefined).length
    return { upperSubtotal, upperBonus, upperTotal, lowerTotal, grandTotal, filledCount }
  }

  // Tous les joueurs ont-ils terminé toutes les cases ?
  const isGameOver = players.length > 0 && players.every(p => {
    const s = playerScores[p] || {}
    return ALL_KEYS.every(k => s[k] !== undefined)
  })

  // Classement final
  const leaderboard = useMemo(() => {
    return players
      .map(p => ({
        name: p,
        ...calculatePlayerTotals(playerScores[p] || {}),
      }))
      .sort((a, b) => b.grandTotal - a.grandTotal)
  }, [players, playerScores])

  // Écran 1 : Setup des joueurs
  if (!started) {
    return (
      <GameLayout
        gameKey="yams"
        title="Yams 🎲"
        color={COLOR}
        footer={
          <CartoonButton id="start-yams-btn" disabled={players.length < 1} onClick={handleStart}>
            C'est parti ! 🎲
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  // Écran de fin de partie
  if (isGameOver) {
    const winner = leaderboard[0]
    return (
      <GameLayout gameKey="yams" title="Partie Terminée ! 🏆" color={COLOR}>
        <section className="game-stage-card stage-pop" style={{ maxWidth: '480px', gap: '16px' }}>
          <div style={{ fontSize: '3.5rem' }}>🎉🏆</div>
          <h2 style={{ fontFamily: 'Carter One, cursive', margin: 0 }}>
            Victoire de {winner.name} !
          </h2>
          <p className="hint">Avec un score exceptionnel de <strong>{winner.grandTotal} points</strong> !</p>

          <div style={{ width: '100%', background: '#fff', border: '3px solid #161513', borderRadius: '16px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', color: '#636e72', fontSize: '0.85rem' }}>
              Classement Général :
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((item, idx) => (
                <div
                  key={item.name}
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
                  <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {item.name}</span>
                  <span>{item.grandTotal} pts</span>
                </div>
              ))}
            </div>
          </div>

          <CartoonButton id="new-yams-game-btn" variant="success" onClick={resetGame}>
            🔄 Rejouer une partie
          </CartoonButton>
        </section>
      </GameLayout>
    )
  }

  const activeTotals = calculatePlayerTotals(currentScores)

  const footer = (
    <CartoonButton
      id="roll-dice-btn"
      disabled={rollsLeft <= 0 || rolling}
      onClick={rollDice}
    >
      {rollsLeft === 3 ? '🎲 Lancer les 5 dés' : `🎲 Relancer (${rollsLeft} restant${rollsLeft > 1 ? 's' : ''})`}
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="yams" title={`Yams – ${activePlayer} 🎲`} color={COLOR} footer={footer}>
      <section className="game-stage-card" style={{ maxWidth: '480px', gap: '14px' }}>
        {/* En-tête tour de jeu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="stage-tag" style={{ background: '#00a8ff', color: '#fff' }}>
            Au tour de : <strong>{activePlayer}</strong>
          </span>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2d3436' }}>
            Score : {activeTotals.grandTotal} pts
          </span>
        </div>

        {/* PLATEAU DES DÉS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <span style={{ fontSize: '0.85rem', color: '#636e72', fontWeight: 600 }}>
            {rollsLeft === 3
              ? 'Appuyez sur Lancer pour débuter votre tour'
              : 'Touchez les dés à garder, puis relancez'}
          </span>

          <div
            id="dice-container"
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
              padding: '6px 0',
            }}
          >
            {dice.map((d, idx) => (
              <button
                key={idx}
                type="button"
                className={`dice-btn ${d.held ? 'held' : ''} ${rolling ? 'rolling' : ''}`}
                style={{
                  fontSize: '2.8rem',
                  lineHeight: 1,
                  background: d.held ? '#ff4757' : '#ffffff',
                  color: d.held ? '#ffffff' : '#161513',
                  border: '3px solid #161513',
                  borderRadius: '12px',
                  width: '54px',
                  height: '54px',
                  boxShadow: d.held ? 'none' : '3px 3px 0 #161513',
                  transform: d.held ? 'translate(2px, 2px)' : 'none',
                  cursor: rollsLeft === 3 ? 'default' : 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
                onClick={() => toggleHold(idx)}
                aria-label={`Dé ${idx + 1} valeur ${d.value} ${d.held ? 'gardé' : ''}`}
              >
                {DICE_PULLS[d.value] || '⚀'}
              </button>
            ))}
          </div>

          {rollsLeft < 3 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff4757', textTransform: 'uppercase' }}>
              {rollsLeft === 0 ? '⚠️ Choisissez obligatoirement une case ci-dessous' : 'Dés en rouge = conservés'}
            </span>
          )}
        </div>

        {/* FEUILLE DE SCORE DE L'ÉQUIPE / JOUEUR */}
        <div
          id="scorecard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            background: '#ffffff',
            border: '3px solid #161513',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '4px 4px 0 #161513',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '2px solid #eee' }}>
            <span style={{ fontWeight: 800, color: '#747d8c', fontSize: '0.85rem' }}>COMBINAISON</span>
            <span style={{ fontWeight: 800, color: '#747d8c', fontSize: '0.85rem' }}>{activePlayer.toUpperCase()}</span>
          </div>

          {CATEGORIES.map(cat => {
            const isFilled = currentScores[cat.key] !== undefined
            const currentVal = currentScores[cat.key]
            const potentialVal = potentialScores[cat.key] ?? 0
            const canPick = rollsLeft < 3 && !isFilled

            return (
              <div
                key={cat.key}
                onClick={() => canPick && pickCategory(cat.key)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: isFilled
                    ? '#f1f2f6'
                    : canPick
                    ? '#fff9c4'
                    : 'transparent',
                  border: canPick ? '2px dashed #ffa502' : '1px solid transparent',
                  cursor: canPick ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isFilled ? '#747d8c' : '#161513' }}>
                  {cat.label}
                </span>

                <span
                  style={{
                    fontFamily: 'Carter One, cursive',
                    fontSize: '1rem',
                    color: isFilled
                      ? '#2ed573'
                      : canPick
                      ? '#ff4757'
                      : '#a4b0be',
                  }}
                >
                  {isFilled ? currentVal : rollsLeft < 3 ? `+${potentialVal}` : '–'}
                </span>
              </div>
            )
          })}

          {/* SOUS-TOTAUX & BONUS */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '2px dashed #161513', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Sous-total Section 1 :</span>
              <strong>{activeTotals.upperSubtotal} / 63 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Bonus +35 pts :</span>
              <strong style={{ color: activeTotals.upperBonus ? '#2ed573' : '#a4b0be' }}>
                {activeTotals.upperBonus ? '+35 pts 🎉' : 'Non atteint'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#ff4757' }}>
              <span>TOTAL {activePlayer.toUpperCase()} :</span>
              <span>{activeTotals.grandTotal} pts</span>
            </div>
          </div>
        </div>
      </section>
    </GameLayout>
  )
}
