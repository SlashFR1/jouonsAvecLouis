import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'
import messMemeData from '../../data/messmeme.json'

const COLOR = CARD_COLORS.black

const MEME_TEMPLATES = (messMemeData.situations || []).map((sit, i) => {
  const emojis = ['🐱📦', '🔥🐶☕', '😱👀', '💃🕺🍕', '🧠⚡🤯', '🎭👀', '🤯💀', '🥱📱']
  return {
    template: emojis[i % emojis.length],
    situation: sit,
    vibe: `Mème #${i + 1}`,
  }
})

export default function MessMemeGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)

  // Scores des joueurs
  const [scores, setScores] = useState({})

  // Phase : 'SUBMIT' (chaque joueur écrit sa punchline) | 'VOTE' | 'REVEAL'
  const [phase, setPhase] = useState('SUBMIT')
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [captionInput, setCaptionInput] = useState('')
  const [playerCaptions, setPlayerCaptions] = useState({}) // { [playerName]: caption }
  const [captionVotes, setCaptionVotes] = useState({}) // { [playerName]: voteCount }

  useEffect(() => {
    document.title = 'Mess Meme 😂 – Loustic'
  }, [])

  const currentMeme = MEME_TEMPLATES[idx % MEME_TEMPLATES.length]
  const activeSubmitter = players[currentPlayerIdx] || 'Joueur'

  const handleStart = () => {
    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)
    setIdx(0)
    setPhase('SUBMIT')
    setCurrentPlayerIdx(0)
    setCaptionInput('')
    setPlayerCaptions({})
    setCaptionVotes({})
    setStarted(true)
  }

  // Soumission de la légende par le joueur actif
  const handleCaptionSubmit = () => {
    if (!captionInput.trim()) return

    const newCaptions = {
      ...playerCaptions,
      [activeSubmitter]: captionInput.trim(),
    }
    setPlayerCaptions(newCaptions)
    setCaptionInput('')

    if (currentPlayerIdx + 1 < players.length) {
      setCurrentPlayerIdx(i => i + 1)
    } else {
      // Tous les joueurs ont soumis leur punchline -> Phase de vote
      setPhase('VOTE')
    }
  }

  // Vote pour une légende
  const handleVoteCaption = authorName => {
    setCaptionVotes(prev => ({
      ...prev,
      [authorName]: (prev[authorName] || 0) + 1,
    }))

    // Ajouter 1 point au joueur ayant écrit le mème
    setScores(prev => ({
      ...prev,
      [authorName]: (prev[authorName] || 0) + 1,
    }))

    setPhase('REVEAL')
  }

  // Mème suivant
  const nextMeme = () => {
    setIdx(i => i + 1)
    setPhase('SUBMIT')
    setCurrentPlayerIdx(0)
    setCaptionInput('')
    setPlayerCaptions({})
    setCaptionVotes({})
  }

  // Écran 1 : Setup des joueurs
  if (!started) {
    return (
      <GameLayout
        gameKey="messmeme"
        title="Mess Meme 😂"
        color={COLOR}
        footer={
          <CartoonButton id="start-messmeme-btn" disabled={players.length < 2} onClick={handleStart}>
            C'est parti ! 😂 (Min. 2 joueurs)
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  const footer = phase === 'SUBMIT' ? (
    <CartoonButton
      id="submit-caption-btn"
      disabled={!captionInput.trim()}
      onClick={handleCaptionSubmit}
    >
      💬 Valider la légende de {activeSubmitter}
    </CartoonButton>
  ) : phase === 'REVEAL' ? (
    <CartoonButton id="next-meme-btn" variant="success" onClick={nextMeme}>
      Mème suivant ➡️
    </CartoonButton>
  ) : null

  return (
    <GameLayout gameKey="messmeme" title="Mess Meme 😂" color={COLOR} footer={footer}>
      <CardStage cardKey={`${idx}`} tag={currentMeme.vibe}>
        <div style={{ fontSize: '3.5rem', margin: '6px 0' }}>{currentMeme.template}</div>

        <div className="prompt-envelope" style={{ minHeight: '70px', width: '100%' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e17055', textTransform: 'uppercase' }}>
            Situation imposée :
          </span>
          <h3 className="word-display" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', margin: '4px 0' }}>
            {currentMeme.situation}
          </h3>
        </div>

        {/* Phase 1 : Chaque joueur tape sa légende */}
        {phase === 'SUBMIT' && (
          <div style={{ width: '100%', marginTop: '10px' }}>
            <span className="stage-tag" style={{ background: '#00a8ff', color: '#fff' }}>
              Au tour de : <strong>{activeSubmitter}</strong>
            </span>
            <input
              id="caption-input"
              type="text"
              value={captionInput}
              placeholder={`Écris ta punchline la plus drôle, ${activeSubmitter}…`}
              onChange={e => setCaptionInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '3px solid #161513',
                borderRadius: '12px',
                fontFamily: 'Fredoka, sans-serif',
                marginTop: '10px',
              }}
            />
            <p className="hint">Passe le téléphone après validation !</p>
          </div>
        )}

        {/* Phase 2 : Vote pour la meilleure légende */}
        {phase === 'VOTE' && (
          <div style={{ width: '100%', marginTop: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Votez pour la meilleure punchline ! 🗳️</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(playerCaptions).map(([author, text]) => (
                <button
                  key={author}
                  type="button"
                  onClick={() => handleVoteCaption(author)}
                  style={{
                    background: '#ffffff',
                    border: '3px solid #161513',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #161513',
                  }}
                >
                  « {text} »
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3 : Révélation et attribution des points */}
        {phase === 'REVEAL' && (
          <div style={{ width: '100%', marginTop: '10px', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Résultats du vote ! 🏆</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(playerCaptions).map(([author, text]) => {
                const votes = captionVotes[author] || 0
                return (
                  <div
                    key={author}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: votes > 0 ? '#fff9c4' : '#f8f9fa',
                      border: '2px solid #161513',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontWeight: 700,
                    }}
                  >
                    <span><strong>{author}</strong> : « {text} »</span>
                    <strong style={{ color: votes > 0 ? '#2ed573' : '#747d8c' }}>
                      {votes} vote{votes > 1 ? 's' : ''} (+{votes} pt)
                    </strong>
                  </div>
                )
              })}
            </div>

            {/* Scoreboard */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
              {players.map(p => (
                <span key={p} style={{ background: '#f1f2f6', border: '2px solid #161513', padding: '4px 10px', borderRadius: '10px', fontWeight: 800 }}>
                  {p} : {scores[p] || 0} pts
                </span>
              ))}
            </div>
          </div>
        )}
      </CardStage>
    </GameLayout>
  )
}
