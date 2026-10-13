import { useState, useMemo, useEffect } from 'react'
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

// Composant de Dé Cartoon haute fidélité avec vrais points SVG (parfaitement alignés sur tout smartphone)
function CartoonDie({ value, held, rolling, disabled, onClick }) {
  const DOT_POSITIONS = {
    1: [[50, 50]],
    2: [[26, 26], [74, 74]],
    3: [[26, 26], [50, 50], [74, 74]],
    4: [[26, 26], [74, 26], [26, 74], [74, 74]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[26, 24], [74, 24], [26, 50], [74, 50], [26, 76], [74, 76]],
  }
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '56px',
        height: '56px',
        padding: '4px',
        borderRadius: '14px',
        border: '3.5px solid #161513',
        background: held ? '#ff4757' : '#ffffff',
        boxShadow: held ? '1px 1px 0 #161513' : '3.5px 3.5px 0 #161513',
        transform: held ? 'translate(2px, 2px)' : 'none',
        cursor: disabled ? 'default' : 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.12s ease',
        flexShrink: 0,
      }}
      aria-label={`Dé valeur ${value} ${held ? 'conservé' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          animation: rolling && !held ? 'yams-die-wobble 0.35s infinite alternate' : 'none',
        }}
      >
        {dots.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="11"
            fill={held ? '#ffffff' : '#161513'}
          />
        ))}
      </svg>
      {held && (
        <span
          style={{
            position: 'absolute',
            top: '-7px',
            right: '-7px',
            background: '#ffd32a',
            color: '#161513',
            border: '2px solid #161513',
            borderRadius: '999px',
            fontSize: '9px',
            fontWeight: 900,
            padding: '1px 5px',
            boxShadow: '1px 1px 0 #161513',
            letterSpacing: '0.3px',
          }}
        >
          GARDÉ
        </span>
      )}
    </button>
  )
}

const UPPER_CATEGORIES = [
  { key: 'ones', label: '1️⃣ As (Total des 1)' },
  { key: 'twos', label: '2️⃣ Deux (Total des 2)' },
  { key: 'threes', label: '3️⃣ Trois (Total des 3)' },
  { key: 'fours', label: '4️⃣ Quatre (Total des 4)' },
  { key: 'fives', label: '5️⃣ Cinq (Total des 5)' },
  { key: 'sixes', label: '6️⃣ Six (Total des 6)' },
]

const LOWER_CATEGORIES = [
  { key: 'brelan', label: '🎯 Brelan (3 identiques)', desc: 'Somme des 5 dés' },
  { key: 'carre', label: '🧱 Carré (4 identiques)', desc: 'Somme des 5 dés' },
  { key: 'full', label: '🏠 Full (3 + 2)', desc: '25 points fixes' },
  { key: 'smallStraight', label: '📏 Petite suite (4 suite)', desc: '30 points fixes' },
  { key: 'largeStraight', label: '🚀 Grande suite (5 suite)', desc: '40 points fixes' },
  { key: 'yams', label: '👑 YAMS (5 identiques)', desc: '50 points fixes' },
  { key: 'chance', label: '🎲 Chance (Tous les dés)', desc: 'Somme totale' },
]

const UPPER_KEYS = UPPER_CATEGORIES.map(c => c.key)
const LOWER_KEYS = LOWER_CATEGORIES.map(c => c.key)
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

  // Confirmation pour barrer une case à 0 point
  const [confirmKey, setConfirmKey] = useState(null)

  // Transition entre joueurs en Pass & Play
  const [passModal, setPassModal] = useState(null) // { nextPlayer, prevPlayer, scoredPoints, categoryLabel }

  const activePlayer = players.length > 0 ? players[currentIdx % players.length] : 'Joueur 1'
  const currentScores = playerScores[activePlayer] || {}

  useEffect(() => {
    document.title = "Yam's 🎲 – Loustic"
  }, [])

  const diceValues = useMemo(() => dice.map(d => d.value), [dice])

  // Calculs précis des scores potentiels avec les dés actuels
  const potentialScores = useMemo(() => {
    // Si aucun lancer n'a été fait ce tour-ci, aucun score n'est calculable
    if (rollsLeft === 3) return {}

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
  }, [diceValues, rollsLeft])

  // Lancement des dés optimisé avec animation fluide
  const rollDice = () => {
    if (rollsLeft <= 0 || rolling) return
    setRolling(true)
    setConfirmKey(null)

    // Simule une rotation de dés
    let ticks = 0
    const interval = setInterval(() => {
      ticks++
      setDice(prev =>
        prev.map(d =>
          d.held ? d : { ...d, value: Math.floor(Math.random() * 6) + 1 }
        )
      )
      if (ticks >= 6) {
        clearInterval(interval)
        setRolling(false)
        setRollsLeft(r => r - 1)
      }
    }, 50)
  }

  // Garder ou relancer un dé
  const toggleHold = index => {
    if (rollsLeft === 3 || rolling) return
    setDice(prev =>
      prev.map((d, i) => (i === index ? { ...d, held: !d.held } : d))
    )
  }

  // Choix d'une case sur la feuille de score
  const handleCategoryClick = (catKey, catLabel) => {
    if (rollsLeft === 3 || rolling) return
    if (currentScores[catKey] !== undefined) return

    const scoreVal = potentialScores[catKey] ?? 0

    // Si le score est 0, demander confirmation pour éviter un sacrifice accidentel
    if (scoreVal === 0 && confirmKey !== catKey) {
      setConfirmKey(catKey)
      return
    }

    applyScore(catKey, scoreVal, catLabel)
  }

  const applyScore = (catKey, scoreVal, catLabel) => {
    setConfirmKey(null)

    const updated = {
      ...playerScores,
      [activePlayer]: {
        ...(playerScores[activePlayer] || {}),
        [catKey]: scoreVal,
      },
    }
    setPlayerScores(updated)

    const nextIdx = (currentIdx + 1) % players.length
    const nextPlayerName = players[nextIdx]

    // Si multijoueur local (>= 2 joueurs), afficher un écran de passation clair
    if (players.length > 1) {
      setPassModal({
        nextPlayer: nextPlayerName,
        prevPlayer: activePlayer,
        scoredPoints: scoreVal,
        categoryLabel: catLabel,
      })
    }

    setCurrentIdx(nextIdx)
    setDice(INITIAL_DICE)
    setRollsLeft(3)
  }

  // Démarrer la partie
  const handleStart = () => {
    if (players.length < 1) return
    const initScores = {}
    players.forEach(p => { initScores[p] = {} })
    setPlayerScores(initScores)
    setCurrentIdx(0)
    setDice(INITIAL_DICE)
    setRollsLeft(3)
    setConfirmKey(null)
    setPassModal(null)
    setStarted(true)
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

  // ÉCRAN 1 : SETUP
  if (!started) {
    return (
      <GameLayout
        gameKey="yams"
        title="Yam's"
        color={COLOR}
        footer={
          <CartoonButton id="start-yams-btn" disabled={players.length < 1} onClick={handleStart}>
            Lancer la partie 🎲
          </CartoonButton>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', color: '#161513' }}>
            Règles officielles du Yam's
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#161513', fontWeight: 700, lineHeight: 1.4 }}>
            3 lancers de 5 dés par tour. Gardez les dés stratégiques.
            <br />
            Remplissez votre grille et visez le bonus de <strong>+35 pts</strong> (63 pts minimum sur les chiffres) !
          </p>
        </div>
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  // ÉCRAN FIN DE PARTIE
  if (isGameOver) {
    const winner = leaderboard[0]
    return (
      <GameLayout gameKey="yams" title="Partie Terminée ! 🏆" color={COLOR}>
        <section className="game-stage-card stage-pop" style={{ maxWidth: '480px', gap: '16px' }}>
          <div style={{ fontSize: '3.5rem' }}>🎉🏆</div>
          <h2 style={{ fontFamily: 'Carter One, cursive', margin: 0, color: '#161513' }}>
            {players.length > 1 ? `Victoire de ${winner.name} !` : `Partie Solo Terminée !`}
          </h2>
          <p className="hint" style={{ color: '#161513', fontWeight: 700 }}>
            Score final : <strong>{winner.grandTotal} points</strong>
          </p>

          <div style={{ width: '100%', background: '#fff', border: '3.5px solid #161513', borderRadius: '18px', padding: '16px', boxShadow: '4px 4px 0 #161513' }}>
            <h4 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', color: '#161513', fontSize: '0.9rem', fontWeight: 900 }}>
              Tableau des Scores :
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((item, idx) => (
                <div
                  key={item.name}
                  className={idx === 0 ? 'card-stamp-selected' : ''}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: idx === 0 ? '#fff9c4' : '#f8f9fa',
                    border: '2.5px solid #161513',
                    fontWeight: 800,
                    color: '#161513',
                  }}
                >
                  <span>{idx === 0 ? '👑 ' : ''}{item.name}</span>
                  <span>{item.grandTotal} pts</span>
                </div>
              ))}
            </div>
          </div>

          <CartoonButton id="new-yams-game-btn" variant="success" onClick={handleStart}>
            🔄 Rejouer une partie
          </CartoonButton>
        </section>
      </GameLayout>
    )
  }

  const activeTotals = calculatePlayerTotals(currentScores)

  // THUMB ZONE FOOTER
  const footer = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {rollsLeft > 0 ? (
        <CartoonButton
          id="roll-dice-btn"
          disabled={rolling}
          onClick={rollDice}
        >
          {rollsLeft === 3
            ? '🎲 Lancer les 5 dés (1/3)'
            : `🎲 Relancer les dés (${rollsLeft} restant${rollsLeft > 1 ? 's' : ''})`}
        </CartoonButton>
      ) : (
        <div
          className="your-turn-active"
          style={{
            background: '#ff4757',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '12px 16px',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: '1rem',
            border: '3px solid #161513',
            boxShadow: '3px 3px 0 #161513',
          }}
        >
          👇 Choisissez obligatoirement une case ci-dessous !
        </div>
      )}
    </div>
  )

  // Rendu d'une ligne de score
  const renderScoreRow = (cat) => {
    const isFilled = currentScores[cat.key] !== undefined
    const currentVal = currentScores[cat.key]
    const potentialVal = potentialScores[cat.key] ?? 0
    const canPick = rollsLeft < 3 && !isFilled
    const isConfirming = confirmKey === cat.key

    return (
      <div
        key={cat.key}
        onClick={() => canPick && handleCategoryClick(cat.key, cat.label)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '12px',
          background: isFilled
            ? '#f1f2f6'
            : isConfirming
            ? '#ff7675'
            : canPick && potentialVal > 0
            ? '#e8f5e9'
            : canPick
            ? '#fffdf8'
            : '#ffffff',
          border: isConfirming
            ? '3px solid #d63031'
            : canPick && potentialVal > 0
            ? '2.5px solid #10ac84'
            : '2px solid #161513',
          boxShadow: canPick ? '2.5px 2.5px 0 #161513' : 'none',
          cursor: canPick ? 'pointer' : 'default',
          transition: 'all 0.12s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isFilled ? '#57606f' : '#161513' }}>
            {cat.label}
          </span>
          {cat.desc && (
            <span style={{ fontSize: '0.72rem', color: isFilled ? '#747d8c' : '#2d3436', fontWeight: 600 }}>
              {cat.desc}
            </span>
          )}
        </div>

        <div>
          {isFilled ? (
            <span
              style={{
                fontFamily: 'Carter One, cursive',
                fontSize: '1.1rem',
                color: currentVal > 0 ? '#10ac84' : '#57606f',
              }}
            >
              {currentVal} pts
            </span>
          ) : rollsLeft < 3 ? (
            isConfirming ? (
              <span
                style={{
                  background: '#d63031',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  border: '1.5px solid #161513',
                }}
              >
                Confirmer 0 pt ?
              </span>
            ) : potentialVal > 0 ? (
              <span
                style={{
                  background: '#10ac84',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  border: '1.5px solid #161513',
                  boxShadow: '1.5px 1.5px 0 #161513',
                }}
              >
                +{potentialVal} pts
              </span>
            ) : (
              <span
                style={{
                  background: '#dfe4ea',
                  color: '#2d3436',
                  borderRadius: '8px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1.5px solid #161513',
                }}
              >
                Barrer (0 pt)
              </span>
            )
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#161513', fontWeight: 700 }}>–</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <GameLayout gameKey="yams" title={`Yam's – ${activePlayer} 🎲`} color={COLOR} footer={footer}>
      {/* MODAL DE PASSATION PASS & PLAY ENTRE JOUEURS */}
      {passModal && (
        <div className="rules-modal-overlay">
          <div
            className="rules-modal-card action-turn-pulse"
            style={{ maxWidth: '380px', textAlign: 'center', gap: '14px' }}
          >
            <div style={{ fontSize: '2.8rem' }}>📱🤝</div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#161513' }}>
              Tour validé !
            </h2>
            <div style={{ background: '#e8f5e9', border: '2px solid #161513', borderRadius: '12px', padding: '8px 12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10ac84' }}>
                {passModal.prevPlayer} marque +{passModal.scoredPoints} pts sur {passModal.categoryLabel}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#161513' }}>
              Passe le téléphone à <strong>{passModal.nextPlayer}</strong> !
            </p>
            <CartoonButton
              variant="primary"
              onClick={() => setPassModal(null)}
            >
              Je suis prêt ({passModal.nextPlayer}) 🎲
            </CartoonButton>
          </div>
        </div>
      )}

      <section className="game-stage-card" style={{ maxWidth: '480px', gap: '14px' }}>
        {/* EN-TÊTE DU TOUR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="stage-tag action-turn-pulse" style={{ background: '#00a8ff', color: '#fff', fontSize: '0.88rem' }}>
            Au tour de : <strong>{activePlayer}</strong>
          </span>
          <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#161513' }}>
            Score total : {activeTotals.grandTotal} pts
          </span>
        </div>

        {/* PLATEAU DES DÉS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            background: '#faf6eb',
            border: '3px solid #161513',
            borderRadius: '18px',
            padding: '12px 10px',
            boxShadow: '4px 4px 0 #161513',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#161513', fontWeight: 700 }}>
            {rollsLeft === 3
              ? 'Appuyez sur "Lancer" pour débuter votre tour'
              : 'Touchez les dés à conserver en rouge, puis relancez'}
          </span>

          {/* DÉS CARTOON */}
          <div
            id="dice-container"
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              width: '100%',
              padding: '4px 0',
            }}
          >
            {dice.map((d, idx) => (
              <CartoonDie
                key={idx}
                value={d.value}
                held={d.held}
                rolling={rolling}
                disabled={rollsLeft === 3 || rolling}
                onClick={() => toggleHold(idx)}
              />
            ))}
          </div>

          {rollsLeft < 3 && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                color: rollsLeft === 0 ? '#ff4757' : '#161513',
                textTransform: 'uppercase',
              }}
            >
              {rollsLeft === 0
                ? '⚠️ Choisissez une case ci-dessous pour valider'
                : 'Les dés rouges restent verrouillés'}
            </span>
          )}
        </div>

        {/* SECTION 1 : CHIFFRES (1 À 6) ET JAUGE DE BONUS +35 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            background: '#ffffff',
            border: '3.5px solid #161513',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '4px 4px 0 #161513',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #161513', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#161513' }}>
              SECTION 1 : CHIFFRES
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#161513' }}>
              {activeTotals.upperSubtotal} / 63 pts
            </span>
          </div>

          {/* Jauge visuelle de bonus */}
          <div style={{ width: '100%', height: '10px', background: '#dfe4ea', borderRadius: '999px', overflow: 'hidden', border: '1.5px solid #161513' }}>
            <div
              style={{
                width: `${Math.min(100, (activeTotals.upperSubtotal / 63) * 100)}%`,
                height: '100%',
                background: activeTotals.upperBonus ? '#10ac84' : '#f9c835',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#161513' }}>
            <span>Bonus +35 pts :</span>
            <span style={{ color: activeTotals.upperBonus ? '#10ac84' : '#161513' }}>
              {activeTotals.upperBonus ? 'Gagné (+35 pts) 🎉' : `${Math.max(0, 63 - activeTotals.upperSubtotal)} pts restants`}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {UPPER_CATEGORIES.map(renderScoreRow)}
          </div>
        </div>

        {/* SECTION 2 : FIGURES ET COMBINAISONS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            background: '#ffffff',
            border: '3.5px solid #161513',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '4px 4px 0 #161513',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #161513', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#161513' }}>
              SECTION 2 : COMBINAISONS
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#161513' }}>
              {activeTotals.lowerTotal} pts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {LOWER_CATEGORIES.map(renderScoreRow)}
          </div>
        </div>
      </section>
    </GameLayout>
  )
}
