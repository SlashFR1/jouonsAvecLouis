import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.green

const DEFAULT_LOCATIONS = [
  'Sous-marin nucléaire',
  'Casino de Monaco',
  'Station spatiale internationale',
  'Hôpital psychiatrique',
  'Paquebot de croisière',
  'Cirque ambulant',
  'Banque centrale (coffre-fort)',
  'Base militaire secrète',
]

export default function SpyGame() {
  const { card: deckCard, draw } = useDeck('spy_locations', {})
  const [players, setPlayers] = useState(['Joueur 1', 'Joueur 2', 'Joueur 3'])
  const [newPlayer, setNewPlayer] = useState('')
  const [phase, setPhase] = useState('setup') // setup | reveal | timer | vote | result
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [accusedSpy, setAccusedSpy] = useState(null)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes

  useEffect(() => {
    document.title = 'SPY 🕵️ – Loustic'
  }, [])

  useEffect(() => {
    let interval
    if (phase === 'timer' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [phase, timeLeft])

  const addPlayer = () => {
    if (!newPlayer.trim()) return
    setPlayers(p => [...p, newPlayer.trim()])
    setNewPlayer('')
  }

  const removePlayer = idx => {
    setPlayers(p => p.filter((_, i) => i !== idx))
  }

  const startGame = () => {
    if (players.length < 3) return
    draw()
    const loc = deckCard?.lieu || deckCard?.location || DEFAULT_LOCATIONS[Math.floor(Math.random() * DEFAULT_LOCATIONS.length)]
    const spyIdx = Math.floor(Math.random() * players.length)

    const list = players.map((name, i) => ({
      name,
      isSpy: i === spyIdx,
      location: i === spyIdx ? '🕵️ Tu es l’Espion !' : loc,
    }))

    setAssignments(list)
    setCurrentIdx(0)
    setShowSecret(false)
    setTimeLeft(180)
    setAccusedSpy(null)
    setPhase('reveal')
  }

  const nextPlayerReveal = () => {
    setShowSecret(false)
    if (currentIdx + 1 < players.length) {
      setCurrentIdx(i => i + 1)
    } else {
      setPhase('timer')
    }
  }

  const currentAssign = assignments[currentIdx]
  const suspectPerson = assignments.find(a => a.name === accusedSpy)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  const footer = phase === 'setup' ? (
    <CartoonButton
      id="start-spy-btn"
      disabled={players.length < 3}
      onClick={startGame}
    >
      🕵️ Démarrer la mission ({players.length} joueurs)
    </CartoonButton>
  ) : phase === 'reveal' ? (
    <CartoonButton id="next-spy-reveal-btn" onClick={nextPlayerReveal}>
      {currentIdx + 1 < players.length ? 'Joueur suivant ➡️' : 'Lancer les questions ⏱️'}
    </CartoonButton>
  ) : phase === 'timer' ? (
    <CartoonButton id="start-spy-vote-btn" variant="danger" onClick={() => setPhase('vote')}>
      🚨 Démasquer l'Espion (Vote immédiat)
    </CartoonButton>
  ) : phase === 'vote' ? (
    <CartoonButton
      id="confirm-spy-vote-btn"
      variant="danger"
      disabled={!accusedSpy}
      onClick={() => setPhase('result')}
    >
      Accuser {accusedSpy || "l'Espion"} !
    </CartoonButton>
  ) : (
    <CartoonButton id="replay-spy-btn" variant="success" onClick={() => setPhase('setup')}>
      🔁 Nouvelle mission
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="spy" title="SPY 🕵️" color={COLOR} footer={footer}>
      {phase === 'setup' && (
        <section className="game-stage-card">
          <span className="stage-tag">Pass & Play (3+ Joueurs)</span>
          <h2>Équipe d'agents secrets</h2>
          <p className="hint">Tous les agents connaissent le lieu secret, sauf l'espion infiltré !</p>

          <div style={{ display: 'flex', gap: '8px', width: '100%', margin: '12px 0' }}>
            <input
              id="spy-player-input"
              type="text"
              placeholder="Nom de l'agent..."
              value={newPlayer}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '2.5px solid #161513' }}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
            />
            <button
              id="add-spy-player-btn"
              type="button"
              className="btn-action-primary"
              style={{ padding: '0 16px', borderRadius: '12px' }}
              onClick={addPlayer}
            >
              Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
            {players.map((p, idx) => (
              <span key={idx} className="player-chip is-me" style={{ display: 'flex', gap: '6px' }}>
                {p}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4757', fontWeight: 900 }}
                  onClick={() => removePlayer(idx)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {phase === 'reveal' && (
        <CardStage cardKey={`${currentIdx}`} tag={`Passez le téléphone à ${currentAssign?.name}`}>
          <h2>Agent {currentAssign?.name}</h2>
          <p className="hint">Consulte discrètement ton écran.</p>

          <div style={{ margin: '14px 0', width: '100%' }}>
            {!showSecret ? (
              <button
                id="show-spy-card-btn"
                type="button"
                className="btn-action-primary"
                style={{ width: '100%', minHeight: '48px', borderRadius: '12px', background: '#f5cd79' }}
                onClick={() => setShowSecret(true)}
              >
                👀 Révéler mon lieu secret
              </button>
            ) : (
              <div
                style={{
                  background: currentAssign?.isSpy ? '#ffebee' : '#e8f5e9',
                  border: `3px solid ${currentAssign?.isSpy ? '#ff4757' : '#2ed573'}`,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#57606f', fontWeight: 700 }}>
                  {currentAssign?.isSpy ? 'RÔLE SECRET :' : 'LIEU DE LA MISSION :'}
                </span>
                <h2 className="word-display" style={{ margin: '6px 0', fontSize: '1.7rem' }}>
                  {currentAssign?.location}
                </h2>
                {currentAssign?.isSpy && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ff4757', fontWeight: 600 }}>
                    Écoute bien les questions pour deviner le lieu sans te faire démasquer !
                  </p>
                )}
                <button
                  type="button"
                  style={{ marginTop: '10px', background: '#ffffff', border: '2px solid #161513', borderRadius: '8px', padding: '4px 10px', fontWeight: 700 }}
                  onClick={() => setShowSecret(false)}
                >
                  🙈 Masquer mon écran
                </button>
              </div>
            )}
          </div>
        </CardStage>
      )}

      {phase === 'timer' && (
        <CardStage tag="Interrogatoire en cours !">
          <h2>⏱️ {timerStr}</h2>
          <p className="hint">
            Posez-vous des questions les uns aux autres à tour de rôle (ex: « Porte-t-on un uniforme ici ? »).
          </p>
          <div style={{ background: '#fffdf8', border: '2.5px solid #161513', borderRadius: '14px', padding: '14px', margin: '12px 0' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#57606f' }}>
              💡 L'Espion doit bluffer pour ne pas éveiller les soupçons !
            </p>
          </div>
        </CardStage>
      )}

      {phase === 'vote' && (
        <CardStage tag="Tribunal des Agents">
          <h2>🗳️ Qui est l'Espion ?</h2>
          <p className="hint">Votez pour le suspect numéro 1 :</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', margin: '14px 0' }}>
            {players.map(p => (
              <button
                key={p}
                id={`accuse-spy-${p}`}
                type="button"
                style={{
                  padding: '12px 6px',
                  borderRadius: '12px',
                  border: '2.5px solid #161513',
                  background: accusedSpy === p ? '#ff4757' : '#ffffff',
                  color: accusedSpy === p ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: accusedSpy === p ? 'none' : '2px 2px 0 #161513',
                }}
                onClick={() => setAccusedSpy(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </CardStage>
      )}

      {phase === 'result' && (
        <CardStage tag="Rapport de Mission">
          <h2>Accusation portée contre {suspectPerson?.name}</h2>
          <div
            style={{
              margin: '16px 0',
              padding: '16px',
              borderRadius: '14px',
              border: '3px solid #161513',
              background: suspectPerson?.isSpy ? '#e8f5e9' : '#ffebee',
            }}
          >
            {suspectPerson?.isSpy ? (
              <h2 style={{ color: '#2ed573', margin: 0 }}>
                🎉 VICTOIRE DES AGENTS ! {suspectPerson?.name} était bien L'ESPION 🕵️ !
              </h2>
            ) : (
              <h2 style={{ color: '#ff4757', margin: 0 }}>
                ❌ ÉCHEC DE LA MISSION ! {suspectPerson?.name} était un Innocent ! L'Espion a gagné !
              </h2>
            )}
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
