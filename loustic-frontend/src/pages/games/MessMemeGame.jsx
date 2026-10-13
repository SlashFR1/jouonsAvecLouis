import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'
import messMemeData from '../../data/messmeme.json'

const COLOR = CARD_COLORS.black

const SITUATIONS = messMemeData.situations || [
  "Quand ton réveil sonne un lundi matin après avoir dormi 3h.",
  "Quand le serveur dit 'Bon appétit' et que tu réponds 'Toi aussi'.",
  "Quand quelqu'un commence sa phrase par 'Sans vouloir te vexer...'",
  "Quand tu regardes ton compte en banque après le week-end.",
  "Quand tes parents essaient d'expliquer comment fonctionne un ordinateur.",
  "Quand le prof dit 'Mettez-vous par deux' et que tu regardes ton pote.",
  "Quand tu envoies un message à la mauvaise personne et que tu vois 'En train d'écrire...'",
  "Quand tu te cognes le petit orteil dans le coin du lit.",
  "Quand tu entends ton prénom dans la conversation de la table d'à côté.",
  "Quand tu dis que tu vas dormir tôt mais qu'il est 4h du matin sur TikTok.",
]

const EMOJI_FALLBACKS = ['🐱📦', '🔥🐶☕', '😱👀', '💃🕺🍕', '🧠⚡🤯', '🎭👀', '🤯💀', '🥱📱', '🕶️😎', '🚀👽']

// Composant d'affichage d'image avec fallback robuste
function MemeVisual({ memeIndex, situation }) {
  const [imgError, setImgError] = useState(false)
  const [altError, setAltError] = useState(false)

  // On essaie d'abord /images/memes/meme_${n}.jpg, puis .svg, puis fallback graphique
  const memeNum = (memeIndex % 107) + 1
  const jpgSrc = `/images/memes/meme_${memeNum}.jpg`
  const svgSrc = `/images/memes/meme_${memeNum}.svg`

  const activeSrc = !imgError ? jpgSrc : !altError ? svgSrc : null

  if (!activeSrc) {
    const fallbackEmoji = EMOJI_FALLBACKS[memeIndex % EMOJI_FALLBACKS.length]
    return (
      <div
        style={{
          width: '100%',
          minHeight: '150px',
          background: '#f8f9fa',
          border: '3px dashed #161513',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          margin: '8px 0',
        }}
      >
        <span style={{ fontSize: '3.6rem', lineHeight: 1 }}>{fallbackEmoji}</span>
        <span style={{ fontSize: '0.8rem', color: '#747d8c', marginTop: '6px', fontWeight: 600 }}>
          Mème #{memeNum} (Déposez votre image dans public/images/memes/meme_{memeNum}.jpg)
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: '6px 0',
        background: '#faf6eb',
        border: '3px solid #161513',
        borderRadius: '16px',
        padding: '8px',
        boxShadow: '3px 3px 0 #161513',
        overflow: 'hidden',
      }}
    >
      <img
        src={activeSrc}
        alt={`Mème ${memeNum}`}
        onError={() => {
          if (!imgError) setImgError(true)
          else setAltError(true)
        }}
        style={{
          maxHeight: '220px',
          maxWidth: '100%',
          objectFit: 'contain',
          borderRadius: '10px',
        }}
      />
    </div>
  )
}

export default function MessMemeGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [roundIdx, setRoundIdx] = useState(0)

  // Scores
  const [scores, setScores] = useState({})

  // Déroulement d'une manche :
  // 1. 'SUBMIT_TRANSITION' : Écran "Passe le téléphone à Joueur X"
  // 2. 'SUBMIT' : Joueur X écrit sa punchline
  // 3. 'VOTE_TRANSITION' : Écran "Passe le téléphone à Joueur Y pour voter"
  // 4. 'VOTE' : Joueur Y vote (INTERDICTION D'AUTO-VOTE)
  // 5. 'REVEAL' : Révélation de tous les votes, attribution des points, gagnant du mème
  const [phase, setPhase] = useState('SUBMIT')
  const [currentSubmitterIdx, setCurrentSubmitterIdx] = useState(0)
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)

  const [captionInput, setCaptionInput] = useState('')
  const [submissions, setSubmissions] = useState({}) // { [playerName]: captionText }
  const [votes, setVotes] = useState({}) // { [voterName]: targetPlayerName }

  useEffect(() => {
    document.title = 'Mess Meme 😂 – Loustic'
  }, [])

  const currentSituation = SITUATIONS[roundIdx % SITUATIONS.length]
  const activeSubmitter = players[currentSubmitterIdx] || players[0]
  const activeVoter = players[currentVoterIdx] || players[0]

  // Démarre la partie
  const handleStart = () => {
    if (players.length < 2) return
    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)
    setRoundIdx(0)
    resetRound()
    setStarted(true)
  }

  const resetRound = () => {
    setSubmissions({})
    setVotes({})
    setCaptionInput('')
    setCurrentSubmitterIdx(0)
    setCurrentVoterIdx(0)
    setPhase('SUBMIT')
  }

  // 1. Soumission d'une description par le joueur en cours
  const handleCaptionSubmit = () => {
    if (!captionInput.trim()) return

    const newSubmissions = {
      ...submissions,
      [activeSubmitter]: captionInput.trim(),
    }
    setSubmissions(newSubmissions)
    setCaptionInput('')

    if (currentSubmitterIdx + 1 < players.length) {
      // Passer au joueur suivant pour écrire
      setCurrentSubmitterIdx(i => i + 1)
      setPhase('SUBMIT_TRANSITION')
    } else {
      // Tout le monde a écrit sa description ! On commence le vote
      setCurrentVoterIdx(0)
      setPhase('VOTE_TRANSITION')
    }
  }

  // 2. Soumission d'un vote par le votant en cours (Strictement PAS AUTO-VOTE)
  const handleVoteSubmit = targetAuthor => {
    // Sécurité absolue : pas d'auto-vote
    if (targetAuthor === activeVoter) return

    const newVotes = {
      ...votes,
      [activeVoter]: targetAuthor,
    }
    setVotes(newVotes)

    if (currentVoterIdx + 1 < players.length) {
      // Passer au votant suivant
      setCurrentVoterIdx(i => i + 1)
      setPhase('VOTE_TRANSITION')
    } else {
      // Tout le monde a voté ! Résolution des scores et révélation
      resolveRoundScores(newVotes)
      setPhase('REVEAL')
    }
  }

  // Calcul des scores
  const resolveRoundScores = finalVotes => {
    setScores(prev => {
      const nextScores = { ...prev }
      Object.values(finalVotes).forEach(author => {
        if (author) {
          nextScores[author] = (nextScores[author] || 0) + 1
        }
      })
      return nextScores
    })
  }

  // Manche suivante
  const nextRound = () => {
    setRoundIdx(i => i + 1)
    resetRound()
  }

  // Liste mélangée des propositions pour voter anonymement
  const shuffledOptions = useMemo(() => {
    const list = Object.entries(submissions).map(([author, text]) => ({
      author,
      text,
    }))
    // Tri déterministe basé sur le texte pour être stable pendant le vote
    return list.sort((a, b) => a.text.localeCompare(b.text))
  }, [submissions])

  // Décompte des votes reçus par chaque auteur
  const voteCounts = useMemo(() => {
    const counts = {}
    players.forEach(p => { counts[p] = 0 })
    Object.values(votes).forEach(target => {
      if (target) counts[target] = (counts[target] || 0) + 1
    })
    return counts
  }, [votes, players])

  // Détermination du/des gagnant(s) du mème
  const maxVotes = useMemo(() => {
    return Math.max(0, ...Object.values(voteCounts))
  }, [voteCounts])

  // ----------------------------------------------------
  // ÉCRAN 1 : LOBBY DES JOUEURS
  // ----------------------------------------------------
  if (!started) {
    return (
      <GameLayout
        gameKey="messmeme"
        title="Mess Meme 😂"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-messmeme-btn"
            variant="success"
            disabled={players.length < 2}
            onClick={handleStart}
          >
            C'est parti ! 😂 (Min. 2 joueurs)
          </CartoonButton>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem' }}>Règles du jeu 📸</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#57606f', fontWeight: 600 }}>
            Un <strong>mème commun</strong> est tiré pour tout le monde.
            <br />
            Chaque joueur écrit secrètement sa punchline la plus drôle.
            <br />
            Puis tout le monde vote pour la meilleure description (<strong>pas d'auto-vote !</strong>).
          </p>
        </div>
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 2 : TRANSITION D'ÉCRITURE ("Passe le téléphone")
  // ----------------------------------------------------
  if (phase === 'SUBMIT_TRANSITION') {
    return (
      <GameLayout gameKey="messmeme" title="Mess Meme 😂" color={COLOR}>
        <div
          style={{
            background: '#ffffff',
            border: '4px solid #161513',
            borderRadius: '20px',
            padding: '24px 16px',
            textAlign: 'center',
            boxShadow: '6px 6px 0 #161513',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span style={{ fontSize: '3.5rem' }}>📱➡️</span>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            Passe le téléphone à :
          </h2>
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              background: '#f9c835',
              border: '3px solid #161513',
              borderRadius: '14px',
              padding: '6px 16px',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            {activeSubmitter}
          </span>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#57606f' }}>
            Ne regarde pas les descriptions des autres ! 🤫
          </p>
          <CartoonButton
            id="ready-submit-btn"
            variant="primary"
            onClick={() => setPhase('SUBMIT')}
          >
            C'est moi ({activeSubmitter}) ! ✍️
          </CartoonButton>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 3 : TRANSITION DE VOTE ("Passe le téléphone")
  // ----------------------------------------------------
  if (phase === 'VOTE_TRANSITION') {
    return (
      <GameLayout gameKey="messmeme" title="Mess Meme 😂" color={COLOR}>
        <div
          style={{
            background: '#ffffff',
            border: '4px solid #161513',
            borderRadius: '20px',
            padding: '24px 16px',
            textAlign: 'center',
            boxShadow: '6px 6px 0 #161513',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span style={{ fontSize: '3.5rem' }}>🗳️📱</span>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            Toutes les descriptions sont prêtes !
          </h2>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#57606f', fontWeight: 600 }}>
            Passe le téléphone à <strong>{activeVoter}</strong> pour son vote secret.
          </p>
          <CartoonButton
            id="ready-vote-btn"
            variant="warning"
            onClick={() => setPhase('VOTE')}
          >
            Voter en tant que {activeVoter} 🗳️
          </CartoonButton>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN PRINCIPAL : SUBMIT / VOTE / REVEAL
  // ----------------------------------------------------
  const footer = phase === 'SUBMIT' ? (
    <CartoonButton
      id="submit-caption-btn"
      disabled={!captionInput.trim()}
      onClick={handleCaptionSubmit}
    >
      Valider ma légende 💬 ({activeSubmitter})
    </CartoonButton>
  ) : phase === 'REVEAL' ? (
    <CartoonButton id="next-meme-btn" variant="success" onClick={nextRound}>
      Mème suivant ➡️
    </CartoonButton>
  ) : null

  return (
    <GameLayout gameKey="messmeme" title="Mess Meme 😂" color={COLOR} footer={footer}>
      <CardStage cardKey={`${roundIdx}`} tag={`Mème #${(roundIdx % 107) + 1}`}>
        {/* Situation / Thème imposé */}
        <div
          style={{
            width: '100%',
            background: '#fff9c4',
            border: '2px solid #161513',
            borderRadius: '12px',
            padding: '8px 12px',
            textAlign: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e17055', textTransform: 'uppercase' }}>
            Situation imposée :
          </span>
          <h3 style={{ margin: '2px 0', fontSize: '1.05rem', fontWeight: 800 }}>
            {currentSituation}
          </h3>
        </div>

        {/* Le Mème commun affiché */}
        <MemeVisual memeIndex={roundIdx} situation={currentSituation} />

        {/* PHASE 1 : Saisie de la légende */}
        {phase === 'SUBMIT' && (
          <div style={{ width: '100%', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="stage-tag" style={{ background: '#00a8ff', color: '#fff', fontSize: '0.85rem' }}>
                ✍️ Au tour de : <strong>{activeSubmitter}</strong> ({currentSubmitterIdx + 1}/{players.length})
              </span>
            </div>

            <textarea
              id="caption-input"
              rows={3}
              value={captionInput}
              placeholder={`Écris ta punchline la plus drôle, ${activeSubmitter}…`}
              onChange={e => setCaptionInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '0.98rem',
                border: '3px solid #161513',
                borderRadius: '12px',
                fontFamily: 'Fredoka, sans-serif',
                resize: 'none',
                background: '#ffffff',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.08)',
              }}
            />
            <p className="hint" style={{ marginTop: '6px' }}>
              Valide ta légende puis passe le téléphone au joueur suivant en secret !
            </p>
          </div>
        )}

        {/* PHASE 2 : Vote individuel (PAS D'AUTO-VOTE) */}
        {phase === 'VOTE' && (
          <div style={{ width: '100%', marginTop: '6px' }}>
            <div
              style={{
                background: '#ede7f6',
                border: '2px solid #161513',
                borderRadius: '10px',
                padding: '6px 10px',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                Vote de : <strong>{activeVoter}</strong> ({currentVoterIdx + 1}/{players.length})
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#eb2f06', fontWeight: 700 }}>
                ⚠️ Règle : Tu ne peux pas voter pour ta propre légende !
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shuffledOptions.map((opt, i) => {
                const isOwnCaption = opt.author === activeVoter

                return (
                  <button
                    key={opt.author}
                    type="button"
                    disabled={isOwnCaption}
                    onClick={() => handleVoteSubmit(opt.author)}
                    style={{
                      background: isOwnCaption ? '#dfe4ea' : '#ffffff',
                      color: isOwnCaption ? '#747d8c' : '#161513',
                      border: isOwnCaption ? '2px dashed #a4b0be' : '3px solid #161513',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: isOwnCaption ? 'not-allowed' : 'pointer',
                      boxShadow: isOwnCaption ? 'none' : '3px 3px 0 #161513',
                      opacity: isOwnCaption ? 0.65 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span>« {opt.text} »</span>
                    {isOwnCaption && (
                      <span style={{ fontSize: '0.72rem', color: '#eb2f06', fontStyle: 'italic', fontWeight: 800 }}>
                        ⛔ Ta propre légende (auto-vote interdit)
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PHASE 3 : Révélation des résultats du mème */}
        {phase === 'REVEAL' && (
          <div style={{ width: '100%', marginTop: '6px', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 8px 0', textAlign: 'center', fontSize: '1.2rem' }}>
              Résultats du vote ! 🏆
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(submissions).map(([author, text]) => {
                const count = voteCounts[author] || 0
                const isWinner = maxVotes > 0 && count === maxVotes

                return (
                  <div
                    key={author}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isWinner ? '#fff9c4' : '#ffffff',
                      border: isWinner ? '3px solid #f9c835' : '2px solid #161513',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      boxShadow: isWinner ? '3px 3px 0 #f9c835' : '2px 2px 0 #161513',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginRight: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                        {isWinner && '👑 '}<strong>{author}</strong>
                      </span>
                      <span style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#2f3542' }}>
                        « {text} »
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span
                        style={{
                          background: count > 0 ? '#2ed573' : '#a4b0be',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          display: 'inline-block',
                        }}
                      >
                        +{count} pt{count > 1 ? 's' : ''} ({count} vote{count > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Scoreboard global */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '2px dashed #ced6e0',
              }}
            >
              {players.map(p => (
                <span
                  key={p}
                  style={{
                    background: '#f1f2f6',
                    border: '2px solid #161513',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
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
