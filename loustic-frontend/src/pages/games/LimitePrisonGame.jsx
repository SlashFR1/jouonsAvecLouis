import { useEffect, useMemo, useState } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import PhysicalBlackCard from '../../components/games/PhysicalBlackCard'
import PhysicalWhiteCard from '../../components/games/PhysicalWhiteCard'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'
import { useLocalPlayers } from '../../hooks/usePlayers'
import '../../styles/limite-prison-visual.css'

const COLOR = CARD_COLORS.black
const WIN_SCORE = 5

export default function LimitePrisonGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState({})
  const [phase, setPhase] = useState('SUBMIT') // SUBMIT | JUDGE | ROUND_WINNER | PODIUM
  const [selectedCard, setSelectedCard] = useState(null)
  const [pickedWinnerCard, setPickedWinnerCard] = useState(null)
  const [winningPlayer, setWinningPlayer] = useState(null)

  const { card: qCard, draw: drawQuestion } = useDeck('limiteprison_questions', {})
  const { allCards: whiteCardsDeck } = useDeck('limiteprison_answers', {})

  // Main locale de 5 cartes tirées du deck
  const [localHand, setLocalHand] = useState([])

  useEffect(() => {
    document.title = 'Limite PRISON ⚠️ – Loustic'
  }, [])

  // Initialisation au lancement de la partie
  const handleStart = () => {
    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)
    setRound(1)
    setPhase('SUBMIT')
    setStarted(true)
    drawQuestion()
    replenishHand([])
  }

  // Renouvelle la main locale à 5 cartes
  const replenishHand = (currentCards = []) => {
    if (!whiteCardsDeck || whiteCardsDeck.length === 0) return
    const needed = 5 - currentCards.length
    if (needed <= 0) {
      setLocalHand(currentCards)
      return
    }
    const shuffled = [...whiteCardsDeck].sort(() => 0.5 - Math.random())
    const added = shuffled.slice(0, needed)
    setLocalHand([...currentCards, ...added])
  }

  const judgeIndex = (round - 1) % players.length
  const currentJudge = players.length ? players[judgeIndex] : 'Le Juge'

  const blackCardText = qCard?.text || qCard?.texte || 'Pour séduire, rien de tel que ___.'

  // Soumission locale
  const handleSlotCard = (card) => {
    setSelectedCard(card)
  }

  // Validation par le joueur actif
  const handleConfirmSubmission = () => {
    if (!selectedCard) return
    setPhase('JUDGE')
    setPickedWinnerCard(selectedCard)
  }

  // Validation du gagnant par le Juge
  const handleJudgeDecision = (winnerName) => {
    setWinningPlayer(winnerName)
    const newScores = { ...scores, [winnerName]: (scores[winnerName] || 0) + 1 }
    setScores(newScores)

    // Retirer la carte jouée et repiocher
    const remaining = localHand.filter(c => c.id !== selectedCard?.id && c.text !== selectedCard?.text)
    replenishHand(remaining)

    if (newScores[winnerName] >= WIN_SCORE) {
      setPhase('PODIUM')
    } else {
      setPhase('ROUND_WINNER')
    }
  }

  // Manche suivante
  const handleNextRound = () => {
    setRound(r => r + 1)
    setPhase('SUBMIT')
    setSelectedCard(null)
    setPickedWinnerCard(null)
    setWinningPlayer(null)
    drawQuestion()
  }

  const slottedText = useMemo(() => {
    if (phase === 'SUBMIT') return selectedCard?.text || null
    if (phase === 'JUDGE' || phase === 'ROUND_WINNER' || phase === 'PODIUM') return pickedWinnerCard?.text || null
    return null
  }, [phase, selectedCard, pickedWinnerCard])

  if (!started) {
    return (
      <GameLayout
        gameKey="limiteprison"
        title="Limite PRISON ⚠️"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-prison-btn"
            disabled={players.length < 2}
            onClick={handleStart}
          >
            Lancer la partie ! ⛓️
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  const footer = (
    <>
      {phase === 'SUBMIT' && (
        <CartoonButton
          id="confirm-slot-btn"
          disabled={!selectedCard}
          onClick={handleConfirmSubmission}
        >
          🔒 Poser cette carte pour le Juge
        </CartoonButton>
      )}

      {phase === 'ROUND_WINNER' && (
        <CartoonButton id="next-round-btn" onClick={handleNextRound}>
          📲 Manche suivante ➡️
        </CartoonButton>
      )}

      {phase === 'PODIUM' && (
        <CartoonButton id="restart-prison-btn" onClick={handleStart}>
          🔄 Rejouer une partie complète
        </CartoonButton>
      )}
    </>
  )

  return (
    <GameLayout gameKey="limiteprison" title="Limite PRISON ⚠️" color={COLOR} footer={footer}>
      <section className="limite-prison-stage">
        {phase === 'PODIUM' ? (
          <div className="podium-container">
            <span className="podium-crown">👑</span>
            <h2 className="podium-winner-title">
              ÉVASION RÉUSSIE ! {winningPlayer} gagne la partie !
            </h2>
            <p style={{ fontWeight: 800, color: '#475569', marginBottom: '16px' }}>
              Premier à 5 points atteint !
            </p>
            <div className="player-chips" style={{ justifyContent: 'center' }}>
              {players.map(p => (
                <span
                  key={p}
                  className={`player-chip ${p === winningPlayer ? 'is-active' : ''}`}
                >
                  {p} : <strong>{scores[p] || 0} pts</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <PhysicalBlackCard
              text={blackCardText}
              slottedText={slottedText}
              onRemoveSlotted={phase === 'SUBMIT' ? () => setSelectedCard(null) : null}
              onDropCard={phase === 'SUBMIT' ? handleSlotCard : null}
              judgeName={currentJudge}
            />

            {phase === 'ROUND_WINNER' && (
              <div className="judge-status-card" style={{ background: '#dcfce7', borderColor: '#16a34a', color: '#166534' }}>
                <span className="judge-badge-hero" style={{ background: '#22c55e', color: '#fff' }}>
                  🏆 CARTE ÉLUE !
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 900 }}>
                  {winningPlayer} marque 1 point !
                </p>
              </div>
            )}

            {phase === 'SUBMIT' && (
              <div className="white-cards-hand">
                <div className="hand-title">
                  <span>🃏 Vos 5 cartes blanches (Tournez ou passez le téléphone)</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Glisse ou clique pour insérer</span>
                </div>

                <div className="white-cards-grid">
                  {localHand.map(card => {
                    const isSelected = selectedCard?.id === card.id || selectedCard?.text === card.text
                    return (
                      <PhysicalWhiteCard
                        key={card.id || card.text}
                        card={card}
                        isSelected={isSelected}
                        onSelect={handleSlotCard}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {phase === 'JUDGE' && (
              <div className="judge-status-card">
                <span className="judge-badge-hero">⚖️ VERDICT DU JUGE : {currentJudge}</span>
                <p style={{ margin: '8px 0', fontWeight: 800 }}>
                  À quel joueur attribues-tu le point pour cette combinaison ?
                </p>

                <div className="player-chips" style={{ justifyContent: 'center', marginTop: '12px' }}>
                  {players.map(p => (
                    <button
                      key={p}
                      type="button"
                      className="player-chip"
                      style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '1rem' }}
                      onClick={() => handleJudgeDecision(p)}
                    >
                      👑 Voter pour {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="player-chips" style={{ marginTop: '16px' }}>
              {players.map(p => (
                <span
                  key={p}
                  className={`player-chip ${p === currentJudge ? 'is-active' : ''}`}
                >
                  {p === currentJudge ? '⚖️ ' : ''}{p} : <strong>{scores[p] || 0} / 5 pts</strong>
                </span>
              ))}
            </div>
          </>
        )}
      </section>
    </GameLayout>
  )
}
