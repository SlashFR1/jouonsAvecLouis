import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'

import parasiteData from '../../data/parasite.json'

const COLOR = CARD_COLORS.blue

export default function ParasiteGame() {
  const [players, setPlayers] = useState(['Alex', 'Sam', 'Clara', 'Lucas'])
  const [newPlayer, setNewPlayer] = useState('')
  const [phase, setPhase] = useState('setup') // setup | reveal | day_debate | vote | result
  const [currentRevealIdx, setCurrentRevealIdx] = useState(0)
  const [showRole, setShowRole] = useState(false)
  const [roles, setRoles] = useState([])
  const [selectedSuspect, setSelectedSuspect] = useState(null)

  useEffect(() => {
    document.title = 'Parasite 🦠 – Loustic'
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
    const parasiteIdx = Math.floor(Math.random() * players.length)
    const rolesMap = parasiteData.roles || {}
    const alienInfo = rolesMap.aliens || { name: 'Alien', description: 'Éliminez un colon chaque nuit.' }
    const colonInfo = rolesMap.colon || { name: 'Colon', description: 'Trouvez les aliens infiltrés.' }

    const specialRoleKeys = Object.keys(rolesMap).filter(k => k !== 'aliens' && k !== 'colon')
    const shuffledSpecials = [...specialRoleKeys].sort(() => 0.5 - Math.random())

    const assigned = players.map((name, i) => {
      const isParasite = i === parasiteIdx
      if (isParasite) {
        return {
          name,
          isParasite: true,
          role: `🦠 ${alienInfo.name}`,
          desc: alienInfo.description,
        }
      }
      const specialKey = shuffledSpecials.pop()
      const roleObj = (specialKey && rolesMap[specialKey]) || colonInfo
      return {
        name,
        isParasite: false,
        role: `🧑‍🚀 ${roleObj.name}`,
        desc: roleObj.description,
      }
    })
    setRoles(assigned)
    setCurrentRevealIdx(0)
    setShowRole(false)
    setPhase('reveal')
  }

  const nextReveal = () => {
    setShowRole(false)
    if (currentRevealIdx + 1 < players.length) {
      setCurrentRevealIdx(i => i + 1)
    } else {
      setPhase('day_debate')
    }
  }

  const handleEject = () => {
    if (!selectedSuspect) return
    setPhase('result')
  }

  const resetGame = () => {
    setPhase('setup')
    setSelectedSuspect(null)
  }

  const currentPerson = roles[currentRevealIdx]
  const suspectPerson = roles.find(r => r.name === selectedSuspect)

  const footer = phase === 'setup' ? (
    <CartoonButton
      id="start-parasite-btn"
      disabled={players.length < 3}
      onClick={startGame}
    >
      🚀 Lancer l'équipage ({players.length} joueurs)
    </CartoonButton>
  ) : phase === 'reveal' ? (
    <CartoonButton id="next-reveal-btn" onClick={nextReveal}>
      {currentRevealIdx + 1 < players.length ? 'Joueur suivant ➡️' : 'Lancer le débat spatial 🚀'}
    </CartoonButton>
  ) : phase === 'day_debate' ? (
    <CartoonButton id="start-vote-btn" variant="danger" onClick={() => setPhase('vote')}>
      🗳️ Passer au Tribunal & Vote
    </CartoonButton>
  ) : phase === 'vote' ? (
    <CartoonButton
      id="confirm-eject-btn"
      variant="danger"
      disabled={!selectedSuspect}
      onClick={handleEject}
    >
      🚀 Éjecter {selectedSuspect || 'le suspect'} dans l'espace
    </CartoonButton>
  ) : (
    <CartoonButton id="replay-parasite-btn" variant="success" onClick={resetGame}>
      🔁 Nouvelle partie
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="parasite" title="Parasite 🦠" color={COLOR} footer={footer}>
      {phase === 'setup' && (
        <section className="game-stage-card">
          <span className="stage-tag">Configuration de l'équipage (3+ joueurs)</span>
          <h2>Membres de la station</h2>
          <p className="hint">Un parasite secret s'est infiltré parmi vous !</p>

          <div style={{ display: 'flex', gap: '8px', width: '100%', margin: '12px 0' }}>
            <input
              id="parasite-player-input"
              type="text"
              placeholder="Prénom de l'astronaute..."
              value={newPlayer}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '2.5px solid #161513',
                fontSize: '1rem',
              }}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
            />
            <button
              id="add-parasite-player-btn"
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
        <CardStage cardKey={`${currentRevealIdx}`} tag={`Passez le téléphone à ${currentPerson?.name}`}>
          <h2>À toi de jouer, {currentPerson?.name} !</h2>
          <p className="hint">Assure-toi que personne ne regarde ton écran.</p>

          <div style={{ margin: '14px 0', width: '100%' }}>
            {!showRole ? (
              <button
                id="show-role-btn"
                type="button"
                className="btn-action-primary"
                style={{ width: '100%', minHeight: '48px', borderRadius: '12px', background: '#f5cd79' }}
                onClick={() => setShowRole(true)}
              >
                👀 Révéler mon rôle secret
              </button>
            ) : (
              <div
                style={{
                  background: currentPerson?.isParasite ? '#ffebee' : '#e8f5e9',
                  border: `3px solid ${currentPerson?.isParasite ? '#ff4757' : '#2ed573'}`,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', color: '#161513' }}>
                  {currentPerson?.role}
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#2f3542' }}>
                  {currentPerson?.desc}
                </p>
                <button
                  type="button"
                  style={{ marginTop: '10px', background: '#ffffff', border: '2px solid #161513', borderRadius: '8px', padding: '4px 10px', fontWeight: 700 }}
                  onClick={() => setShowRole(false)}
                >
                  🙈 Masquer mon rôle
                </button>
              </div>
            )}
          </div>
        </CardStage>
      )}

      {phase === 'day_debate' && (
        <CardStage tag="Phase 2 : Débat de l'équipage">
          <h2>🗣️ Qui semble suspect ?</h2>
          <p className="hint">
            Posez-vous des questions, observez les hésitations et les regards fuyants. Le parasite tente de bluffer !
          </p>
          <div style={{ background: '#fffdf8', border: '2.5px solid #161513', borderRadius: '14px', padding: '16px', width: '100%', margin: '14px 0' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#57606f' }}>
              💡 Règle du tour : Tout le monde donne son alibi sur ce qu'il faisait lors de la panne du réacteur !
            </p>
          </div>
        </CardStage>
      )}

      {phase === 'vote' && (
        <CardStage tag="Phase 3 : Vote d'exclusion du SAS">
          <h2>🗳️ Qui doit être éjecté ?</h2>
          <p className="hint">Désignez ensemble la personne que vous suspectez le plus :</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', margin: '14px 0' }}>
            {players.map(p => (
              <button
                key={p}
                id={`suspect-${p}`}
                type="button"
                style={{
                  padding: '12px 6px',
                  borderRadius: '12px',
                  border: '2.5px solid #161513',
                  background: selectedSuspect === p ? '#ff4757' : '#ffffff',
                  color: selectedSuspect === p ? '#ffffff' : '#161513',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: selectedSuspect === p ? 'none' : '2px 2px 0 #161513',
                  transform: selectedSuspect === p ? 'translate(2px, 2px)' : 'none',
                }}
                onClick={() => setSelectedSuspect(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </CardStage>
      )}

      {phase === 'result' && (
        <CardStage tag="Résultat de l'éjection">
          <h2>{suspectPerson?.name} a été éjecté dans le vide spatial !</h2>
          <div
            style={{
              margin: '16px 0',
              padding: '16px',
              borderRadius: '14px',
              border: '3px solid #161513',
              background: suspectPerson?.isParasite ? '#e8f5e9' : '#ffebee',
            }}
          >
            {suspectPerson?.isParasite ? (
              <h2 style={{ color: '#2ed573', margin: 0 }}>
                🎉 VICTOIRE DE L'ÉQUIPAGE ! {suspectPerson?.name} était bien LE PARASITE 🦠 !
              </h2>
            ) : (
              <h2 style={{ color: '#ff4757', margin: 0 }}>
                💀 DÉFAITE ! {suspectPerson?.name} était INNOCENT 🧑‍🚀 ! Le parasite est toujours à bord…
              </h2>
            )}
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
