import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'

const COLOR = CARD_COLORS.purple

const DEFAULT_PAIRS = [
  { mainWord: 'Chocolat', moleWord: 'Café' },
  { mainWord: 'Guitare', moleWord: 'Basse' },
  { mainWord: 'Avion', moleWord: 'Hélicoptère' },
  { mainWord: 'Plage', moleWord: 'Piscine' },
  { mainWord: 'Pizza', moleWord: 'Burger' },
]

export default function LaTaupeGame() {
  const { card: deckCard, draw } = useDeck('lataupe_words', {})
  const [players, setPlayers] = useState(['Joueur 1', 'Joueur 2', 'Joueur 3'])
  const [newPlayer, setNewPlayer] = useState('')
  const [phase, setPhase] = useState('setup') // setup | reveal | debate | vote | result
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [selectedMole, setSelectedMole] = useState(null)

  useEffect(() => {
    document.title = 'La taupe 🔍 – Loustic'
  }, [])

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
    const pair = deckCard || DEFAULT_PAIRS[Math.floor(Math.random() * DEFAULT_PAIRS.length)]
    const moleIdx = Math.floor(Math.random() * players.length)

    const list = players.map((name, i) => ({
      name,
      isMole: i === moleIdx,
      word: i === moleIdx ? pair.moleWord || pair.mot_taupe || 'Café' : pair.mainWord || pair.mot_commun || 'Chocolat',
    }))

    setAssignments(list)
    setCurrentIdx(0)
    setShowSecret(false)
    setSelectedMole(null)
    setPhase('reveal')
  }

  const nextPlayerReveal = () => {
    setShowSecret(false)
    if (currentIdx + 1 < players.length) {
      setCurrentIdx(i => i + 1)
    } else {
      setPhase('debate')
    }
  }

  const currentAssign = assignments[currentIdx]
  const suspectPerson = assignments.find(a => a.name === selectedMole)

  const footer = phase === 'setup' ? (
    <CartoonButton
      id="start-taupe-btn"
      disabled={players.length < 3}
      onClick={startGame}
    >
      🔍 Lancer la partie ({players.length} joueurs)
    </CartoonButton>
  ) : phase === 'reveal' ? (
    <CartoonButton id="next-taupe-reveal-btn" onClick={nextPlayerReveal}>
      {currentIdx + 1 < players.length ? 'Joueur suivant ➡️' : 'Passer au Débat 🗣️'}
    </CartoonButton>
  ) : phase === 'debate' ? (
    <CartoonButton id="start-taupe-vote-btn" variant="danger" onClick={() => setPhase('vote')}>
      🗳️ Démasquer la Taupe (Vote)
    </CartoonButton>
  ) : phase === 'vote' ? (
    <CartoonButton
      id="confirm-taupe-vote-btn"
      variant="danger"
      disabled={!selectedMole}
      onClick={() => setPhase('result')}
    >
      Accuser {selectedMole || 'la Taupe'} !
    </CartoonButton>
  ) : (
    <CartoonButton id="replay-taupe-btn" variant="success" onClick={() => setPhase('setup')}>
      🔁 Rejouer une partie
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="lataupe" title="La taupe 🔍" color={COLOR} footer={footer}>
      {phase === 'setup' && (
        <section className="game-stage-card">
          <span className="stage-tag">Pass & Play (3+ Joueurs)</span>
          <h2>Joueurs autour de la table</h2>
          <p className="hint">Une taupe recevra un mot différent sans le savoir !</p>

          <div style={{ display: 'flex', gap: '8px', width: '100%', margin: '12px 0' }}>
            <input
              id="taupe-player-input"
              type="text"
              placeholder="Prénom du joueur..."
              value={newPlayer}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '2.5px solid #161513' }}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
            />
            <button
              id="add-taupe-player-btn"
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
          <h2>À ton tour, {currentAssign?.name} !</h2>
          <p className="hint">Regarde secrètement ton mot sans montrer l'écran.</p>

          <div style={{ margin: '14px 0', width: '100%' }}>
            {!showSecret ? (
              <button
                id="show-taupe-word-btn"
                type="button"
                className="btn-action-primary"
                style={{ width: '100%', minHeight: '48px', borderRadius: '12px', background: '#f5cd79' }}
                onClick={() => setShowSecret(true)}
              >
                👀 Révéler mon mot secret
              </button>
            ) : (
              <div
                style={{
                  background: '#ede7f6',
                  border: '3px solid #8c7ae6',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#57606f', fontWeight: 700 }}>TON MOT :</span>
                <h2 className="word-display" style={{ margin: '6px 0', fontSize: '1.8rem' }}>
                  {currentAssign?.word}
                </h2>
                <button
                  type="button"
                  style={{ marginTop: '10px', background: '#ffffff', border: '2px solid #161513', borderRadius: '8px', padding: '4px 10px', fontWeight: 700 }}
                  onClick={() => setShowSecret(false)}
                >
                  🙈 Masquer mon mot
                </button>
              </div>
            )}
          </div>
        </CardStage>
      )}

      {phase === 'debate' && (
        <CardStage tag="Phase 2 : Débat et Indices">
          <h2>🗣️ Donnez chacun un indice !</h2>
          <p className="hint">
            À tour de rôle, chaque joueur dit UN mot en rapport avec son mot secret.
            Attention : la Taupe a un mot très proche sans le savoir !
          </p>
        </CardStage>
      )}

      {phase === 'vote' && (
        <CardStage tag="Phase 3 : Vote de l'accusation">
          <h2>🗳️ Qui est la Taupe ?</h2>
          <p className="hint">Pointez ou votez pour la personne suspecte :</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', margin: '14px 0' }}>
            {players.map(p => (
              <button
                key={p}
                id={`accuse-${p}`}
                type="button"
                style={{
                  padding: '12px 6px',
                  borderRadius: '12px',
                  border: '2.5px solid #161513',
                  background: selectedMole === p ? '#ff4757' : '#ffffff',
                  color: selectedMole === p ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: selectedMole === p ? 'none' : '2px 2px 0 #161513',
                }}
                onClick={() => setSelectedMole(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </CardStage>
      )}

      {phase === 'result' && (
        <CardStage tag="Verdict de la Taupe">
          <h2>Vous avez accusé {suspectPerson?.name} !</h2>
          <div
            style={{
              margin: '16px 0',
              padding: '16px',
              borderRadius: '14px',
              border: '3px solid #161513',
              background: suspectPerson?.isMole ? '#e8f5e9' : '#ffebee',
            }}
          >
            {suspectPerson?.isMole ? (
              <h2 style={{ color: '#2ed573', margin: 0 }}>
                🎉 BIEN JOUÉ ! {suspectPerson?.name} était bien LA TAUPE 🔍 ! (Mot : {suspectPerson?.word})
              </h2>
            ) : (
              <h2 style={{ color: '#ff4757', margin: 0 }}>
                ❌ ERREUR ! {suspectPerson?.name} était Innocent (Mot : {suspectPerson?.word}) ! La vraie Taupe s'est échappée !
              </h2>
            )}
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
