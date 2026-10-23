import { useEffect, useState } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import UnicornLivesBar from '../../components/games/UnicornLivesBar'
import SecretNumberCard from '../../components/games/SecretNumberCard'
import CaptainReorderList from '../../components/games/CaptainReorderList'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'
import { useLocalPlayers } from '../../hooks/usePlayers'
import { cmcAudio } from '../../utils/cmcAudio'
import '../../styles/classe-moica-visual.css'

const COLOR = CARD_COLORS.orange
const TARGET_ROUNDS = 5

export default function ClasseMoiCaGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [lives, setLives] = useState(4)
  const [captainIdx, setCaptainIdx] = useState(0)

  // FSM locale : THEME -> PASS_SECRETS -> ORDERING -> REVEAL -> RESULT -> GAME_OVER
  const [phase, setPhase] = useState('THEME')
  const [passIdx, setPassIdx] = useState(0)
  const [secretMap, setSecretMap] = useState({})
  const [orderedIds, setOrderedIds] = useState([])
  const [revealStep, setRevealStep] = useState(0)
  const [anchorMin, setAnchorMin] = useState('')
  const [anchorMax, setAnchorMax] = useState('')

  const { card: deckCard, draw } = useDeck('classemoica_themes', {})

  useEffect(() => {
    document.title = 'Classe moi ça 🔢 – Loustic'
  }, [])

  // Démarrage de la partie
  const handleStart = () => {
    if (players.length < 2) return
    setStarted(true)
    setRound(1)
    setLives(4)
    setCaptainIdx(0)
    setAnchorMin('')
    setAnchorMax('')
    startNewRound(1)
  }

  // Démarrage d'une nouvelle manche
  const startNewRound = (roundNum) => {
    draw()
    setRound(roundNum)
    setPhase('THEME')
    setPassIdx(0)
    setRevealStep(0)
    setRoundInversions(0)
    setAnchorMin('')
    setAnchorMax('')

    // Distribution sans répétition de chiffres de 1 à 10
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => 0.5 - Math.random())
    const map = {}
    players.forEach((p, idx) => {
      map[p] = numbers[idx]
    })
    setSecretMap(map)
    setOrderedIds([...players])
  }

  const rawTheme = deckCard?.themeA || deckCard?.theme || deckCard?.texte || 'Une excuse de retard : de (min) à (max).'
  const resolvedTheme = (anchorMin || anchorMax)
    ? rawTheme.replace('(min)', anchorMin || 'min').replace('(max)', anchorMax || 'max')
    : rawTheme
  const currentTheme = resolvedTheme
  const captainName = players.length ? players[captainIdx % players.length] : 'Capitaine'

  // Début de la distribution des chiffres secrets (Pass & Play)
  const handleStartPassSecrets = () => {
    setPhase('PASS_SECRETS')
    setPassIdx(0)
  }

  const handleNextPassPlayer = () => {
    if (passIdx + 1 < players.length) {
      setPassIdx(i => i + 1)
    } else {
      setPhase('ORDERING')
    }
  }

  // Validation de l'ordre par le Capitaine
  const handleValidateOrder = () => {
    setPhase('REVEAL')
    setRevealStep(0)
  }

  // Révélation d'un cran supplémentaire
  const handleRevealNext = () => {
    if (revealStep < orderedIds.length) {
      const nextStep = revealStep + 1
      setRevealStep(nextStep)

      // Vérifier inversion
      if (nextStep >= 2) {
        const prevP = orderedIds[nextStep - 2]
        const currP = orderedIds[nextStep - 1]
        const numA = secretMap[prevP] || 0
        const numB = secretMap[currP] || 0

        if (numA > numB) {
          cmcAudio.playStepError()
          setRoundInversions(inv => inv + 1)
          setLives(l => Math.max(0, l - 1))
        } else {
          cmcAudio.playStepSuccess()
        }
      } else {
        cmcAudio.playStepSuccess()
      }

      if (nextStep >= orderedIds.length) {
        setPhase('RESULT')
      }
    }
  }

  // Manche suivante
  const handleNextRound = () => {
    if (lives <= 0 || round >= TARGET_ROUNDS) {
      setPhase('GAME_OVER')
      if (lives > 0) cmcAudio.playVictory()
      else cmcAudio.playGameOver()
    } else {
      setCaptainIdx(i => (i + 1) % players.length)
      startNewRound(round + 1)
    }
  }

  if (!started) {
    return (
      <GameLayout
        gameKey="classemoica"
        title="Classe moi ça 🔢"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-cmc-btn"
            disabled={players.length < 2}
            onClick={handleStart}
          >
            Lancer l'aventure (5 manches) 🥐
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  const footer = (
    <>
      {phase === 'THEME' && (
        <CartoonButton id="start-secrets-btn" onClick={handleStartPassSecrets}>
          📲 Découvrir les chiffres secrets (Pass & Play)
        </CartoonButton>
      )}

      {phase === 'PASS_SECRETS' && (
        <CartoonButton id="next-secret-pass-btn" onClick={handleNextPassPlayer}>
          {passIdx + 1 < players.length ? 'Joueur suivant ➡️' : 'Le Capitaine classe la table 👑'}
        </CartoonButton>
      )}

      {phase === 'ORDERING' && (
        <CartoonButton id="validate-order-btn" variant="success" onClick={handleValidateOrder}>
          ✅ Valider l'ordre de la table
        </CartoonButton>
      )}

      {phase === 'REVEAL' && (
        <CartoonButton id="reveal-step-btn" variant="primary" onClick={handleRevealNext}>
          🔍 Révéler le chiffre suivant ({revealStep}/{orderedIds.length})
        </CartoonButton>
      )}

      {phase === 'RESULT' && (
        <CartoonButton id="next-round-btn" onClick={handleNextRound}>
          {lives <= 0 || round >= TARGET_ROUNDS ? '🏁 Voir le verdict final' : '📲 Manche suivante ➡️'}
        </CartoonButton>
      )}

      {phase === 'GAME_OVER' && (
        <CartoonButton id="restart-cmc-btn" onClick={handleStart}>
          🔄 Rejouer une nouvelle partie
        </CartoonButton>
      )}
    </>
  )

  const activePassPlayer = players[passIdx] || 'Joueur'

  return (
    <GameLayout gameKey="classemoica" title="Classe moi ça 🔢" color={COLOR} footer={footer}>
      <section className="cmc-stage">
        {/* BARRE DE VIES CROISSANTS DE LICORNE */}
        <UnicornLivesBar
          lives={lives}
          maxLives={4}
          round={round}
          maxRounds={TARGET_ROUNDS}
        />

        {/* THÈME D'INTENSITÉ */}
        <div className="cmc-theme-card">
          <span className="cmc-theme-badge">ÉCHELLE D'INTENSITÉ 1 ➔ 10</span>
          <h2 className="cmc-theme-title">{currentTheme}</h2>
          <p style={{ margin: '8px 0 0 0', fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>
            🧑‍✈️ Capitaine de manche : <strong>{captainName}</strong>
          </p>

          {phase === 'THEME' && (
            <div style={{ marginTop: 14, width: '100%', textAlign: 'left', background: '#fef3c7', padding: '14px', borderRadius: 14, border: '2px solid #d97706' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#b45309', display: 'block', marginBottom: 8 }}>
                👑 {captainName}, définis les bornes pour cette manche :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label htmlFor="cmc-local-min" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78350f', display: 'block', marginBottom: 2 }}>
                    Borne (min) • Valeur 1 :
                  </label>
                  <input
                    id="cmc-local-min"
                    type="text"
                    placeholder="Ex: Trop nul"
                    value={anchorMin}
                    onChange={(e) => setAnchorMin(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '2px solid #161513', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label htmlFor="cmc-local-max" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78350f', display: 'block', marginBottom: 2 }}>
                    Borne (max) • Valeur 10 :
                  </label>
                  <input
                    id="cmc-local-max"
                    type="text"
                    placeholder="Ex: Le génie total"
                    value={anchorMax}
                    onChange={(e) => setAnchorMax(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '2px solid #161513', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FIN DE PARTIE */}
        {phase === 'GAME_OVER' && (
          <div className="cmc-theme-card" style={{ background: lives > 0 ? '#dcfce7' : '#fee2e2', borderColor: lives > 0 ? '#16a34a' : '#dc2626' }}>
            <span style={{ fontSize: '3.5rem' }}>{lives > 0 ? '🏆' : '💀'}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: lives > 0 ? '#166534' : '#991b1b', margin: '8px 0' }}>
              {lives > 0 ? 'VICTOIRE COLLECTIVE !' : 'DÉFAITE DE L’ÉQUIPE !'}
            </h2>
            <p style={{ fontWeight: 800 }}>
              {lives > 0
                ? `Félicitations ! Vous avez complété les 5 manches avec ${lives} croissant(s) de licorne restants ! 🎉`
                : 'Les licornes ont faim... Toutes les vies ont été perdues par inversion.'}
            </p>
          </div>
        )}

        {/* DÉCOUVERTE DU CHIFFRE SECRET (PASS & PLAY) */}
        {phase === 'PASS_SECRETS' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <span className="cmc-theme-badge">Passez le téléphone à : {activePassPlayer}</span>
            <SecretNumberCard number={secretMap[activePassPlayer] || '?'} />
            <p className="hint">Prononce ta proposition à voix haute devant la table avant de passer !</p>
          </div>
        )}

        {/* RÉORGANISATION PAR LE CAPITAINE */}
        {phase === 'ORDERING' && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span className="cmc-theme-badge">🧑‍✈️ {captainName}, classe les joueurs du plus faible (1) au plus fort (10)</span>
            </div>

            <CaptainReorderList
              players={players.map(p => ({ id: p, name: p }))}
              orderedIds={orderedIds}
              onReorder={setOrderedIds}
            />
          </div>
        )}

        {/* RÉVÉLATION PAS À PAS & BILAN */}
        {(phase === 'REVEAL' || phase === 'RESULT') && (
          <div className="cmc-reveal-grid">
            <div style={{ textAlign: 'center' }}>
              <span className="cmc-theme-badge">
                {phase === 'REVEAL' ? '🔍 Révélation pas à pas' : `Bilan : ${roundInversions} inversion(s) cette manche`}
              </span>
            </div>

            {orderedIds.map((pid, idx) => {
              const isRevealed = idx < revealStep || phase === 'RESULT'
              const num = secretMap[pid] || 0

              let isError = false
              let isSuccess = false
              if (isRevealed && idx > 0) {
                const prevP = orderedIds[idx - 1]
                const prevNum = secretMap[prevP] || 0
                if (num < prevNum) isError = true
                else isSuccess = true
              }

              return (
                <div
                  key={pid}
                  className={`cmc-reveal-card ${!isRevealed ? 'is-hidden-step' : ''} ${isError ? 'is-step-error' : isSuccess ? 'is-step-success' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#64748b' }}>#{idx + 1}</span>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{pid}</h4>
                  </div>

                  <div className="cmc-reveal-badge-number">
                    {isRevealed ? num : '❓'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </GameLayout>
  )
}
