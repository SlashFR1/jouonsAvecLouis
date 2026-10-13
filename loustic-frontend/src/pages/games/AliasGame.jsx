import { useState, useEffect, useRef } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import CartoonTimer from '../../components/common/CartoonTimer'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.yellow

const DEFAULT_WORDS = [
  'Tournevis', 'Piscine', 'Chandelier', 'Kangourou', 'Spaghetti',
  'Télescope', 'Parachute', 'Boulanger', 'Croissant', 'Sarcophage',
  'Guitariste', 'Escarpin', 'Astronaute', 'Sous-marin', 'Éléphant',
]

export default function AliasGame() {
  const { card: deckCard, draw } = useDeck('alias_words', {})
  const [phase, setPhase] = useState('ready') // ready | running | finished
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'Alias – Loustic'
  }, [])

  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setPhase('finished')
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const startSprint = () => {
    draw()
    setScore(0)
    setTimeLeft(60)
    setWordIdx(0)
    setPhase('running')
  }

  const handleFound = () => {
    setScore(s => s + 1)
    setWordIdx(i => i + 1)
    draw()
  }

  const handleSkip = () => {
    setWordIdx(i => i + 1)
    draw()
  }

  const currentWord = deckCard?.word || deckCard?.mot || DEFAULT_WORDS[wordIdx % DEFAULT_WORDS.length]

  const footer = phase === 'ready' ? (
    <CartoonButton id="start-alias-btn" onClick={startSprint}>
      Lancer le chrono (60s)
    </CartoonButton>
  ) : phase === 'running' ? (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
      <CartoonButton id="alias-found-btn" variant="success" onClick={handleFound}>
        Trouvé (+1)
      </CartoonButton>
      <CartoonButton id="alias-skip-btn" variant="secondary" onClick={handleSkip}>
        Passer
      </CartoonButton>
    </div>
  ) : (
    <CartoonButton id="replay-alias-btn" variant="success" onClick={startSprint}>
      Nouveau sprint
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="alias" title="Alias" color={COLOR} footer={footer}>
      {phase === 'ready' && (
        <CardStage tag="60 secondes chrono">
          <h2>Fais deviner un maximum de mots !</h2>
          <p className="hint">
            Explique le mot à voix haute sans prononcer le mot lui-même ni ses dérivés.
            Dès que tes amis trouvent, clique sur « Trouvé » !
          </p>
        </CardStage>
      )}

      {phase === 'running' && (
        <CardStage tag={`Score : ${score} mot${score > 1 ? 's' : ''}`}>
          <div style={{ marginBottom: '8px' }}>
            <CartoonTimer
              seconds={timeLeft}
              isRunning={true}
              urgentThreshold={10}
              showControls={false}
            />
          </div>

          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e17055' }}>
            MOT À FAIRE DEVINER :
          </span>

          <div className="prompt-envelope" style={{ minHeight: '110px' }}>
            <h2 className="word-display" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)' }}>
              {currentWord}
            </h2>
          </div>

          <p className="hint">
            Explique avec des synonymes ou des situations !
          </p>
        </CardStage>
      )}

      {phase === 'finished' && (
        <CardStage tag="Temps écoulé !">
          <div style={{ fontSize: '4rem', margin: '8px 0' }}>🏆</div>
          <h2>Fin du sprint !</h2>
          <div
            style={{
              margin: '14px 0',
              padding: '16px',
              borderRadius: '16px',
              border: '3px solid #161513',
              background: '#fff9c4',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#161513' }}>
              SCORE DE CE TOUR :
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#161513', margin: '4px 0' }}>
              {score} points
            </h2>
            <p style={{ margin: 0, fontWeight: 600, color: '#2f3542' }}>
              {score >= 10 ? '🔥 Performance légendaire !' : score >= 6 ? '👏 Super manche !' : '💪 Tu feras mieux au prochain tour !'}
            </p>
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
