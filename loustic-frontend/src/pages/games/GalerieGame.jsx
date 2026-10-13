import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'
import galerieData from '../../data/galerie.json'

const COLOR = CARD_COLORS.purple

const ART_CARDS = (galerieData.cards || []).map(c => ({
  id: c.id,
  title: c.title,
  art: ['🖼️', '🎨', '✨', '🌌', '🎭', '🌙'][c.id % 6],
  theme: c.tags ? c.tags.join(' & ') : 'Imaginaire',
}))

export default function GalerieGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [conteurIdx, setConteurIdx] = useState(0)

  // Scores des joueurs
  const [scores, setScores] = useState({})

  // Déroulement du tour : 'CLUE' | 'VOTE' | 'REVEAL'
  const [phase, setPhase] = useState('CLUE')
  const [clue, setClue] = useState('')
  const [secretCardIdx, setSecretCardIdx] = useState(0)
  const [playerVotes, setPlayerVotes] = useState({}) // { [voterName]: cardId }
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)

  // Paquet de 4 cartes pour la manche
  const [deckOffset, setDeckOffset] = useState(0)

  const currentConteur = players[conteurIdx % players.length] || 'Conteur'
  const otherPlayers = useMemo(() => players.filter(p => p !== currentConteur), [players, currentConteur])

  const currentCards = useMemo(() => {
    const list = []
    for (let i = 0; i < 4; i++) {
      list.push(ART_CARDS[(deckOffset + i) % ART_CARDS.length])
    }
    return list
  }, [deckOffset])

  useEffect(() => {
    document.title = 'Galerie 🎨 – Loustic'
  }, [])

  const handleStart = () => {
    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)
    setConteurIdx(0)
    setDeckOffset(0)
    setSecretCardIdx(Math.floor(Math.random() * 4))
    setClue('')
    setPlayerVotes({})
    setPhase('CLUE')
    setStarted(true)
  }

  // Conteur valide son indice et sa carte secrète
  const handleClueSubmit = () => {
    if (!clue.trim()) return
    setPhase('VOTE')
    setCurrentVoterIdx(0)
  }

  // Un joueur vote pour une carte
  const handleVoteCard = cardId => {
    const voter = otherPlayers[currentVoterIdx]
    if (!voter) return

    setPlayerVotes(prev => ({ ...prev, [voter]: cardId }))

    // Passer au joueur suivant pour voter ou révélation
    if (currentVoterIdx + 1 < otherPlayers.length) {
      setCurrentVoterIdx(i => i + 1)
    } else {
      // Tout le monde a voté -> Révélation et calcul des scores
      handleResolveScores(cardId)
    }
  }

  const handleResolveScores = lastVoteCardId => {
    const secretCardId = currentCards[secretCardIdx].id
    const finalVotes = {
      ...playerVotes,
      [otherPlayers[currentVoterIdx]]: lastVoteCardId,
    }

    const correctGuessers = otherPlayers.filter(p => finalVotes[p] === secretCardId)

    setScores(prev => {
      const next = { ...prev }
      // Règle Dixit : Si tout le monde ou personne ne trouve, le conteur a 0 pt et les autres 2 pts.
      if (correctGuessers.length === 0 || correctGuessers.length === otherPlayers.length) {
        otherPlayers.forEach(p => { next[p] = (next[p] || 0) + 2 })
      } else {
        // Conteur marque 3 pts, et ceux qui ont trouvé marquent 3 pts
        next[currentConteur] = (next[currentConteur] || 0) + 3
        correctGuessers.forEach(p => { next[p] = (next[p] || 0) + 3 })
      }
      return next
    })

    setPhase('REVEAL')
  }

  // Tour suivant
  const nextRound = () => {
    setConteurIdx(i => (i + 1) % players.length)
    setDeckOffset(o => (o + 4) % ART_CARDS.length)
    setSecretCardIdx(Math.floor(Math.random() * 4))
    setClue('')
    setPlayerVotes({})
    setPhase('CLUE')
  }

  // Écran 1 : Setup des joueurs
  if (!started) {
    return (
      <GameLayout
        gameKey="galerie"
        title="Galerie 🎨"
        color={COLOR}
        footer={
          <CartoonButton id="start-galerie-btn" disabled={players.length < 3} onClick={handleStart}>
            C'est parti ! 🎨 (Min. 3 joueurs)
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  const secretCard = currentCards[secretCardIdx]
  const currentVoter = otherPlayers[currentVoterIdx]

  // ==================== RENDU : EN COURS ====================
  const footer = phase === 'CLUE' ? (
    <CartoonButton
      id="submit-clue-btn"
      disabled={!clue.trim()}
      onClick={handleClueSubmit}
    >
      🎨 Valider l'indice poétique
    </CartoonButton>
  ) : phase === 'REVEAL' ? (
    <CartoonButton id="next-gallery-btn" variant="success" onClick={nextRound}>
      Manche suivante ➡️
    </CartoonButton>
  ) : null

  return (
    <GameLayout gameKey="galerie" title={`Galerie – Conteur : ${currentConteur}`} color={COLOR} footer={footer}>
      <section className="game-stage-card stage-pop" style={{ maxWidth: '480px', gap: '14px' }}>
        {/* Header de manche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="stage-tag" style={{ background: '#8c7ae6', color: '#fff' }}>
            {phase === 'CLUE' ? `🗣️ Conteur : ${currentConteur}` : phase === 'VOTE' ? `🗳️ Vote : ${currentVoter}` : '👀 Révélation !'}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {players.map(p => (
              <span key={p} style={{ fontSize: '0.8rem', fontWeight: 800, background: '#f1f2f6', padding: '3px 8px', borderRadius: '8px' }}>
                {p}: {scores[p] || 0}
              </span>
            ))}
          </div>
        </div>

        {/* Phase 1 : Conteur saisit son indice */}
        {phase === 'CLUE' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Carter One, cursive', margin: '0 0 6px 0' }}>
              {currentConteur}, choisis ton œuvre secrète !
            </h2>
            <p className="hint">
              Touchez la carte de votre choix puis donnez un indice poétique :
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '12px 0' }}>
              {currentCards.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => setSecretCardIdx(idx)}
                  style={{
                    background: secretCardIdx === idx ? '#fff9c4' : '#ffffff',
                    border: secretCardIdx === idx ? '3px solid #ff4757' : '2px solid #161513',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    boxShadow: secretCardIdx === idx ? '0 0 0 3px #ff4757' : '3px 3px 0 #161513',
                    transition: 'transform 0.15s',
                    transform: secretCardIdx === idx ? 'scale(1.03)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{c.art}</div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '4px' }}>{c.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#747d8c' }}>{c.theme}</span>
                </div>
              ))}
            </div>

            <input
              id="clue-input"
              type="text"
              value={clue}
              placeholder="Ex : Une brume d'espoir dans l'obscurité…"
              onChange={e => setClue(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '3px solid #161513',
                borderRadius: '12px',
                fontFamily: 'Fredoka, sans-serif',
                marginTop: '6px',
              }}
            />
          </div>
        )}

        {/* Phase 2 : Vote des autres joueurs */}
        {phase === 'VOTE' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div className="prompt-envelope" style={{ margin: '6px 0', background: '#fff9c4' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e17055', textTransform: 'uppercase' }}>
                Indice du conteur ({currentConteur}) :
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.3rem', color: '#2d3436' }}>« {clue} »</h3>
            </div>

            <h3 style={{ margin: '12px 0 6px 0', color: '#0984e3' }}>
              À toi de voter, <strong>{currentVoter}</strong> !
            </h3>
            <p className="hint">Retrouve l'œuvre qui a inspiré cet indice :</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
              {currentCards.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleVoteCard(c.id)}
                  style={{
                    background: '#ffffff',
                    border: '3px solid #161513',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #161513',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{c.art}</div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '4px' }}>{c.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#747d8c' }}>{c.theme}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3 : Révélation et points */}
        {phase === 'REVEAL' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Carter One, cursive', color: '#2ed573', margin: '0 0 6px 0' }}>
              La carte secrète était :
            </h2>
            <div style={{ background: '#fff9c4', border: '3px solid #161513', borderRadius: '16px', padding: '16px', display: 'inline-block' }}>
              <div style={{ fontSize: '3.5rem' }}>{secretCard.art}</div>
              <h3 style={{ margin: '4px 0 0 0' }}>{secretCard.title}</h3>
              <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#747d8c' }}>{secretCard.theme}</p>
              <div style={{ marginTop: '8px', fontWeight: 800, color: '#e17055' }}>Indice : « {clue} »</div>
            </div>

            {/* Récapitulatif des votes */}
            <div style={{ marginTop: '16px', textAlign: 'left', background: '#f8f9fa', border: '2px solid #161513', borderRadius: '12px', padding: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.85rem', color: '#636e72' }}>
                Votes des joueurs :
              </h4>
              {otherPlayers.map(p => {
                const votedCardId = playerVotes[p]
                const isCorrect = votedCardId === secretCard.id
                const votedCard = currentCards.find(c => c.id === votedCardId)
                return (
                  <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                    <span><strong>{p}</strong> a voté {votedCard ? votedCard.title : '??'}</span>
                    <strong style={{ color: isCorrect ? '#2ed573' : '#ff4757' }}>
                      {isCorrect ? 'Trouvé ! (+3 pts)' : 'Raté'}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </GameLayout>
  )
}
