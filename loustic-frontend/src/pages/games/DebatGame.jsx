import { useState, useEffect, useRef } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage, { StageStatus } from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.blue

export default function DebatGame() {
  const { status, error, card, draw, remaining, total } = useDeck('debat', {})
  const [seconds, setSeconds] = useState(60)
  const [duration, setDuration] = useState(60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [votes, setVotes] = useState({ pour: 0, contre: 0, egalite: 0 })
  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'Débat 📢 – Loustic'
  }, [])

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            setTimerRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  const nextDebate = () => {
    setTimerRunning(false)
    setSeconds(duration)
    setVotes({ pour: 0, contre: 0, egalite: 0 })
    draw()
  }

  const changeDuration = dur => {
    setDuration(dur)
    setSeconds(dur)
    setTimerRunning(false)
  }

  const vote = type => {
    setVotes(v => ({ ...v, [type]: v[type] + 1 }))
  }

  const footer = status === 'ready' && (
    <CartoonButton id="next-debat-btn" onClick={nextDebate}>
      Sujet suivant ➡️
    </CartoonButton>
  )

  const progress = duration > 0 ? seconds / duration : 0
  const urgent = timerRunning && seconds <= 10

  return (
    <GameLayout gameKey="debat" title="Débat 📢" color={COLOR} footer={footer}>
      {status !== 'ready' ? (
        <StageStatus status={status} error={error} />
      ) : (
        <CardStage cardKey={card?.id} tag={card?.format ? `Format ${card.format}` : 'Débat'}>
          {/* Sujet du débat */}
          <div className="prompt-envelope">
            <h2 className="word-display" style={{ fontSize: 'clamp(1.2rem, 3.8vw, 1.7rem)' }}>
              {card?.texte || 'Faut-il interdire les devoirs à la maison ?'}
            </h2>
          </div>

          {/* Minuteur de parole */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[30, 60, 90].map(d => (
                <button
                  key={d}
                  type="button"
                  id={`timer-dur-${d}`}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '2px solid #161513',
                    background: duration === d ? '#f9c835' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => changeDuration(d)}
                >
                  {d}s
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                id="timer-display"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  color: urgent ? '#ff4757' : '#161513',
                  minWidth: '55px',
                  textAlign: 'center',
                }}
              >
                {seconds}s
              </span>

              <button
                id="toggle-timer-btn"
                type="button"
                className="btn-action-primary"
                style={{
                  padding: '6px 14px',
                  height: '38px',
                  minHeight: '38px',
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                }}
                onClick={() => setTimerRunning(r => !r)}
              >
                {timerRunning ? '⏸️ Pause' : '⏱️ Chrono'}
              </button>
            </div>

            {/* Barre de progression */}
            <div
              style={{
                width: '180px',
                height: '8px',
                background: '#eee7d5',
                borderRadius: '999px',
                border: '1.5px solid #161513',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: urgent ? '#ff4757' : '#2ed573',
                  transition: 'width 0.3s linear',
                }}
              />
            </div>
          </div>

          {/* Espace de vote */}
          <div style={{ width: '100%', borderTop: '2px dashed #161513', paddingTop: '10px', marginTop: '6px' }}>
            <p className="hint" style={{ margin: '0 0 8px 0' }}>Vote du public :</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '100%' }}>
              <button
                id="vote-pour-btn"
                type="button"
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: '#2ed573',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #161513',
                }}
                onClick={() => vote('pour')}
              >
                👍 Pour ({votes.pour})
              </button>
              <button
                id="vote-contre-btn"
                type="button"
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: '#ff4757',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #161513',
                }}
                onClick={() => vote('contre')}
              >
                👎 Contre ({votes.contre})
              </button>
              <button
                id="vote-egalite-btn"
                type="button"
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: '#f9c835',
                  color: '#161513',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #161513',
                }}
                onClick={() => vote('egalite')}
              >
                ⚖️ Égalité ({votes.egalite})
              </button>
            </div>
          </div>

          <p className="deck-counter" style={{ marginTop: '10px' }}>
            {total - remaining} / {total}
          </p>
        </CardStage>
      )}
    </GameLayout>
  )
}
