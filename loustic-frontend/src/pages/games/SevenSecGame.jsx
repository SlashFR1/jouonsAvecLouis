import { useEffect, useRef, useState } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import SevenSecRadialTimer from '../../components/games/SevenSecRadialTimer'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'
import { useLocalPlayers } from '../../hooks/usePlayers'
import { sevenSecAudio } from '../../utils/sevenSecAudio'
import '../../styles/seven-sec-visual.css'

const COLOR = CARD_COLORS.blue

/**
 * 7 secondes – Pass & Play Local :
 * - Joueur actif désigné, écran passé de main en main
 * - Chrono radial décrémentant de 7.0s à 0.0s à 60fps via requestAnimationFrame
 * - Bips d'urgence croissants et gong final percutant
 * - Interface d'arbitrage tactile pour la table (Validé / Raté)
 * - Suivi des scores et tirage sans remise
 */
export default function SevenSecGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [turn, setTurn] = useState(0)
  const [phase, setPhase] = useState('DRAW') // DRAW | COUNTDOWN | REFEREE_VOTE | SCORE_UPDATE
  const [scores, setScores] = useState({})
  const [lastSuccess, setLastSuccess] = useState(null)
  const { card, draw } = useDeck('7sec_prompts')
  const countdownEndRef = useRef(null)

  const activePlayer = players.length ? players[turn % players.length] : 'Joueur'

  useEffect(() => {
    document.title = '7 secondes – Loustic'
    return () => sevenSecAudio.stop()
  }, [])

  // Initialisation des scores quand la partie démarre
  const handleStart = () => {
    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)
    setTurn(0)
    setPhase('DRAW')
    setStarted(true)
    draw()
  }

  // Démarrage du compte à rebours 7.0s
  const startCountdown = () => {
    setPhase('COUNTDOWN')
    countdownEndRef.current = performance.now() + 7000
    sevenSecAudio.startUrgentCountdown(7000)
  }

  // Fin du décompte (automatique ou manuel)
  const handleCountdownComplete = () => {
    sevenSecAudio.stop()
    sevenSecAudio.playGong()
    setPhase('REFEREE_VOTE')
  }

  // Arrêt anticipé par le joueur actif
  const stopEarly = () => {
    handleCountdownComplete()
  }

  // Vote de la table
  const handleRefereeVote = (success) => {
    sevenSecAudio.stop()
    setLastSuccess(success)
    if (success) {
      sevenSecAudio.playSuccess()
      setScores(prev => ({ ...prev, [activePlayer]: (prev[activePlayer] || 0) + 1 }))
    } else {
      sevenSecAudio.playFail()
    }
    setPhase('SCORE_UPDATE')
  }

  // Passage au joueur suivant
  const nextPlayer = () => {
    sevenSecAudio.stop()
    setTurn(t => t + 1)
    setPhase('DRAW')
    setLastSuccess(null)
    draw()
  }

  if (!started) {
    return (
      <GameLayout
        gameKey="7sec"
        title="7 secondes ⏱️"
        color={COLOR}
        footer={
          <CartoonButton id="start-7sec-btn" disabled={players.length < 2} onClick={handleStart}>
            C’est parti ! 🚀
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  const footer = (
    <>
      {phase === 'DRAW' && (
        <CartoonButton id="launch-7sec-btn" onClick={startCountdown}>
          ⏱️ Lancer les 7 secondes
        </CartoonButton>
      )}

      {phase === 'COUNTDOWN' && (
        <CartoonButton id="stop-early-btn" variant="warning" onClick={stopEarly}>
          🏁 J'ai cité mes 3 éléments !
        </CartoonButton>
      )}

      {phase === 'REFEREE_VOTE' && (
        <div className="referee-buttons-grid" style={{ width: '100%' }}>
          <button
            id="7sec-fail-btn"
            type="button"
            className="referee-btn referee-btn-fail"
            onClick={() => handleRefereeVote(false)}
          >
            <span>❌ Raté !</span>
            <span className="referee-btn-sub">Gorgée 🍻</span>
          </button>
          <button
            id="7sec-win-btn"
            type="button"
            className="referee-btn referee-btn-success"
            onClick={() => handleRefereeVote(true)}
          >
            <span>✅ Validé !</span>
            <span className="referee-btn-sub">+1 Point 🏆</span>
          </button>
        </div>
      )}

      {phase === 'SCORE_UPDATE' && (
        <CartoonButton id="next-player-btn" onClick={nextPlayer}>
          📲 Joueur suivant ➡️
        </CartoonButton>
      )}
    </>
  )

  return (
    <GameLayout gameKey="7sec" title="7 secondes ⏱️" color={COLOR} footer={footer}>
      <section className="game-stage-card stage-pop">
        <span className="stage-tag">🎯 Au tour de : <strong>{activePlayer}</strong></span>

        {/* Chrono radial 60fps */}
        <SevenSecRadialTimer
          isRunning={phase === 'COUNTDOWN'}
          duration={7.0}
          onComplete={handleCountdownComplete}
          phase={phase}
        />

        {/* Carte de défi */}
        <div className="seven-sec-prompt-card">
          <div className="theme-pill">🏷️ Thème : {card?.theme || 'Général'}</div>
          <p className="prompt-text">
            {phase === 'DRAW' ? '🤫 Prêt ? Clique sur "Lancer" et cite 3 réponses !' : (card?.prompt || card?.challenge || card?.texte)}
          </p>
        </div>

        {/* Message de verdict */}
        {phase === 'SCORE_UPDATE' && (
          <div
            className="secret-theme-banner"
            style={{
              background: lastSuccess ? '#dcfce7' : '#fee2e2',
              borderColor: lastSuccess ? '#16a34a' : '#dc2626',
              color: lastSuccess ? '#166534' : '#991b1b',
            }}
          >
            {lastSuccess ? (
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                🎉 Bien joué ! +1 point pour {activePlayer} !
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                🍻 Raté ! {activePlayer} boit 1 gorgée !
              </p>
            )}
          </div>
        )}

        {/* Scores de la table */}
        <div className="player-chips" style={{ marginTop: '14px' }}>
          {players.map(p => (
            <span
              key={p}
              className={`player-chip ${p === activePlayer ? 'is-active' : ''}`}
            >
              {p} : <strong>{scores[p] || 0} pts</strong>
            </span>
          ))}
        </div>
      </section>
    </GameLayout>
  )
}
