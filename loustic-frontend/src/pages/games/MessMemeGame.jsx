import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Crown, Sparkles, Send, CheckCircle2, AlertTriangle, Users, Smile, ArrowRight } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'
import { useGameData } from '../../hooks/useGameData'
import messMemeFallback from '../../data/messmeme.json'

const COLOR = CARD_COLORS.yellow

const DEFAULT_SITUATIONS = [
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

// Composant visuel du mème en cadre Rubber Hose
function MemeVisual({ memeIndex, situation, maxHeight = '220px' }) {
  const [sourceIdx, setSourceIdx] = useState(0)

  useEffect(() => {
    setSourceIdx(0)
  }, [memeIndex])

  // 107 images réelles déposées dans public/images/memes/images/img1.png .. img107.png
  const memeNum = (memeIndex % 107) + 1

  const candidates = [
    `/images/memes/images/img${memeNum}.png`,
    `/images/messmeme/images/img${memeNum}.png`,
    `/images/memes/img${memeNum}.png`,
    `/images/memes/meme_${memeNum}.jpg`,
    `/images/memes/meme_${memeNum}.svg`,
  ]

  const activeSrc = candidates[sourceIdx]

  if (!activeSrc || sourceIdx >= candidates.length) {
    const fallbackEmoji = EMOJI_FALLBACKS[memeIndex % EMOJI_FALLBACKS.length]
    return (
      <div
        style={{
          width: '100%',
          minHeight: '140px',
          background: '#fffdf8',
          border: '3.5px dashed #161513',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <span style={{ fontSize: '3.2rem', lineHeight: 1 }}>{fallbackEmoji}</span>
        <span style={{ fontSize: '0.85rem', color: '#161513', marginTop: '6px', fontWeight: 800 }}>
          Mème #{memeNum}
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
        alignItems: 'center',
        background: '#fffdf8',
        border: '3.5px solid #161513',
        borderRadius: '20px',
        padding: '8px',
        boxShadow: '4px 4px 0 #161513',
        overflow: 'hidden',
      }}
    >
      <img
        src={activeSrc}
        alt={`Mème ${memeNum}`}
        onError={() => setSourceIdx(prev => prev + 1)}
        style={{
          maxHeight,
          maxWidth: '100%',
          objectFit: 'contain',
          borderRadius: '12px',
          display: 'block',
        }}
      />
    </div>
  )
}

export default function MessMemeGame() {
  const navigate = useNavigate()
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
  // 5. 'REVEAL' : Révélation de tous les votes, attribution des points, podium
  const [phase, setPhase] = useState('SUBMIT')
  const [currentSubmitterIdx, setCurrentSubmitterIdx] = useState(0)
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)

  const [captionInput, setCaptionInput] = useState('')
  const [submissions, setSubmissions] = useState({}) // { [playerName]: captionText }
  const [votes, setVotes] = useState({}) // { [voterName]: targetPlayerName }

  const { data: messMemeData } = useGameData('messmeme', messMemeFallback)
  const situations = useMemo(() => messMemeData?.situations || DEFAULT_SITUATIONS, [messMemeData])

  useEffect(() => {
    document.title = 'Mess Meme 😂 – Loustic'
  }, [])

  const currentSituation = situations[roundIdx % situations.length]
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

  // Liste triée des propositions pour voter anonymement
  const shuffledOptions = useMemo(() => {
    const list = Object.entries(submissions).map(([author, text]) => ({
      author,
      text,
    }))
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

  const roundWinners = useMemo(() => {
    if (maxVotes <= 0) return []
    return Object.entries(voteCounts)
      .filter(([, count]) => count === maxVotes)
      .map(([author]) => author)
  }, [voteCounts, maxVotes])

  // Submissions triées par score pour le podium
  const sortedSubmissions = useMemo(() => {
    return Object.entries(submissions).sort((a, b) => {
      const votesA = voteCounts[a[0]] || 0
      const votesB = voteCounts[b[0]] || 0
      return votesB - votesA
    })
  }, [submissions, voteCounts])

  // Classement global des joueurs
  const sortedLeaderboard = useMemo(() => {
    return [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
  }, [players, scores])

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
            Lancer la partie ({players.length} joueur{players.length > 1 ? 's' : ''})
          </CartoonButton>
        }
      >
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Passerelle Mode Salle Multi-joueurs */}
          <div
            className="action-turn-pulse"
            style={{
              background: '#fff9c4',
              border: '3.5px solid #161513',
              borderRadius: '20px',
              padding: '12px 16px',
              textAlign: 'center',
              boxShadow: '4px 4px 0 #161513',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#161513' }}>
              📲 Envie de jouer chacun sur son smartphone ?
            </p>
            <button
              type="button"
              className="btn-cta btn-secondary"
              style={{
                width: '100%',
                minHeight: '44px',
                height: '44px',
                fontSize: '0.92rem',
                borderWidth: '2.5px',
              }}
              onClick={() => navigate('/salle/messmeme')}
            >
              Mode Salle Multijoueur en Direct ➔
            </button>
          </div>

          {/* Carte de présentation & Règles Rubber Hose */}
          <section className="game-stage-card stage-pop" style={{ gap: '12px', padding: '20px 16px' }}>
            <span className="stage-tag" style={{ background: '#f9ca24', color: '#161513' }}>
              Mode 1 Téléphone (Pass & Play)
            </span>
            <div style={{ fontSize: '3rem', lineHeight: 1 }}>😂🎭</div>
            <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.5rem', margin: '0', color: '#161513' }}>
              Règles du jeu
            </h2>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#161513', lineHeight: 1.3 }}>
                  <strong>Un mème et une situation</strong> sont imposés pour chaque manche.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>✍️</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#161513', lineHeight: 1.3 }}>
                  Chaque joueur <strong>écrit secrètement sa punchline</strong> la plus drôle à tour de rôle.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>🗳️</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#161513', lineHeight: 1.3 }}>
                  Vote à l'aveugle pour la meilleure légende (<strong>auto-vote strictement interdit !</strong>).
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>👑</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#161513', lineHeight: 1.3 }}>
                  Chaque vote rapporte <strong>+1 point</strong>. Que le plus drôle l'emporte !
                </span>
              </div>
            </div>
          </section>

          {/* Configuration des joueurs */}
          <PlayerSetup players={players} onChange={setPlayers} min={2} />
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 2 : TRANSITION D'ÉCRITURE ("Passe le téléphone")
  // ----------------------------------------------------
  if (phase === 'SUBMIT_TRANSITION') {
    return (
      <GameLayout
        gameKey="messmeme"
        title="Mess Meme"
        color={COLOR}
        footer={
          <CartoonButton
            id="ready-submit-btn"
            variant="primary"
            onClick={() => setPhase('SUBMIT')}
          >
            C'est moi ({activeSubmitter}), je suis prêt ! ➔
          </CartoonButton>
        }
      >
        <section
          className="game-stage-card stage-pop"
          style={{
            maxWidth: '440px',
            gap: '16px',
            margin: 'auto 0',
            padding: '28px 18px',
          }}
        >
          <span className="stage-tag" style={{ background: '#00a8ff', color: '#fff' }}>
            Manche {roundIdx + 1} • Écriture
          </span>

          <div style={{ fontSize: '3.6rem', lineHeight: 1 }} className="action-turn-pulse">
            📱🤫
          </div>

          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.5rem', margin: 0, color: '#161513' }}>
            Passe le téléphone à :
          </h2>

          <div
            style={{
              fontSize: '1.75rem',
              fontFamily: 'Carter One, cursive',
              color: '#161513',
              background: '#f9ca24',
              border: '3.5px solid #161513',
              borderRadius: '18px',
              padding: '8px 24px',
              boxShadow: '4px 4px 0 #161513',
            }}
          >
            {activeSubmitter}
          </div>

          <p style={{ margin: 0, fontSize: '0.95rem', color: '#161513', fontWeight: 700 }}>
            Ne regarde pas les descriptions des autres ! Ta punchline doit rester secrète.
          </p>
        </section>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 3 : TRANSITION DE VOTE ("Passe le téléphone")
  // ----------------------------------------------------
  if (phase === 'VOTE_TRANSITION') {
    return (
      <GameLayout
        gameKey="messmeme"
        title="Mess Meme"
        color={COLOR}
        footer={
          <CartoonButton
            id="ready-vote-btn"
            variant="warning"
            onClick={() => setPhase('VOTE')}
          >
            Voter en tant que {activeVoter} ➔
          </CartoonButton>
        }
      >
        <section
          className="game-stage-card stage-pop"
          style={{
            maxWidth: '440px',
            gap: '16px',
            margin: 'auto 0',
            padding: '28px 18px',
          }}
        >
          <span className="stage-tag" style={{ background: '#8c7ae6', color: '#fff' }}>
            Manche {roundIdx + 1} • Vote Secret
          </span>

          <div style={{ fontSize: '3.6rem', lineHeight: 1 }} className="action-turn-pulse">
            🗳️👀
          </div>

          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.45rem', margin: 0, color: '#161513' }}>
            Toutes les légendes sont écrites !
          </h2>

          <p style={{ margin: 0, fontSize: '0.95rem', color: '#161513', fontWeight: 700 }}>
            Passe maintenant le téléphone à :
          </p>

          <div
            style={{
              fontSize: '1.75rem',
              fontFamily: 'Carter One, cursive',
              color: '#161513',
              background: '#fbc531',
              border: '3.5px solid #161513',
              borderRadius: '18px',
              padding: '8px 24px',
              boxShadow: '4px 4px 0 #161513',
            }}
          >
            {activeVoter}
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: '#eb2f06', fontWeight: 800 }}>
            ⚠️ Rappel : tu ne pourras pas voter pour ta propre légende !
          </p>
        </section>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 4 : PHASE D'ÉCRITURE (SUBMIT)
  // ----------------------------------------------------
  if (phase === 'SUBMIT') {
    return (
      <GameLayout
        gameKey="messmeme"
        title="Mess Meme"
        color={COLOR}
        footer={
          <CartoonButton
            id="submit-caption-btn"
            disabled={!captionInput.trim()}
            onClick={handleCaptionSubmit}
          >
            <Send style={{ width: '18px', height: '18px', marginRight: '6px', display: 'inline-block' }} />
            Valider ma punchline ({activeSubmitter})
          </CartoonButton>
        }
      >
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Bandeau supérieur de statut */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '8px 14px',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            <span
              style={{
                fontFamily: 'Carter One, cursive',
                fontSize: '0.85rem',
                background: '#f9ca24',
                border: '2px solid #161513',
                padding: '3px 10px',
                borderRadius: '10px',
              }}
            >
              Manche {roundIdx + 1}
            </span>

            <span
              className="action-turn-pulse"
              style={{
                fontSize: '0.9rem',
                fontWeight: 900,
                color: '#161513',
                background: '#e1f5fe',
                border: '2px solid #161513',
                borderRadius: '10px',
                padding: '3px 10px',
              }}
            >
              Au tour de : <strong>{activeSubmitter}</strong> ({currentSubmitterIdx + 1}/{players.length})
            </span>
          </div>

          {/* Situation imposée */}
          <div
            style={{
              width: '100%',
              background: '#fff9c4',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '10px 14px',
              textAlign: 'center',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#e17055', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📌 Situation imposée :
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#161513', lineHeight: 1.3 }}>
              « {currentSituation} »
            </h3>
          </div>

          {/* Mème affiché */}
          <MemeVisual memeIndex={roundIdx} situation={currentSituation} maxHeight="200px" />

          {/* Zone de saisie Rubber Hose */}
          <section className="game-stage-card" style={{ padding: '16px', gap: '8px', textAlign: 'left', alignItems: 'stretch' }}>
            <label
              htmlFor="caption-input"
              style={{
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#161513',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ✍️ Ta punchline pour ce mème :
            </label>

            <textarea
              id="caption-input"
              rows={3}
              value={captionInput}
              placeholder={`Écris ta punchline la plus drôle, ${activeSubmitter}…`}
              onChange={e => setCaptionInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '3px solid #161513',
                borderRadius: '14px',
                fontFamily: 'Fredoka, sans-serif',
                resize: 'none',
                background: '#fffdf8',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.06)',
                color: '#161513',
                boxSizing: 'border-box',
              }}
            />

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#161513', fontWeight: 700, textAlign: 'center' }}>
              Valide ta légende puis passe le téléphone au joueur suivant en secret !
            </p>
          </section>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 5 : PHASE DE VOTE (VOTE)
  // ----------------------------------------------------
  if (phase === 'VOTE') {
    return (
      <GameLayout gameKey="messmeme" title="Mess Meme" color={COLOR}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
          {/* Bandeau de statut du votant */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '8px 14px',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            <span
              style={{
                fontFamily: 'Carter One, cursive',
                fontSize: '0.85rem',
                background: '#8c7ae6',
                color: '#fff',
                border: '2px solid #161513',
                padding: '3px 10px',
                borderRadius: '10px',
              }}
            >
              Vote secret
            </span>

            <span
              className="action-turn-pulse"
              style={{
                fontSize: '0.9rem',
                fontWeight: 900,
                color: '#161513',
                background: '#ede7f6',
                border: '2px solid #161513',
                borderRadius: '10px',
                padding: '3px 10px',
              }}
            >
              Vote de : <strong>{activeVoter}</strong> ({currentVoterIdx + 1}/{players.length})
            </span>
          </div>

          {/* Rappel compact de la situation et du mème */}
          <div
            style={{
              background: '#fff9c4',
              border: '3px solid #161513',
              borderRadius: '14px',
              padding: '8px 12px',
              textAlign: 'center',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#e17055', textTransform: 'uppercase' }}>
              Situation :
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.92rem', fontWeight: 800, color: '#161513' }}>
              « {currentSituation} »
            </p>
          </div>

          <MemeVisual memeIndex={roundIdx} situation={currentSituation} maxHeight="150px" />

          {/* Consigne claire */}
          <div
            style={{
              background: '#ffffff',
              border: '3px solid #161513',
              borderRadius: '14px',
              padding: '8px 12px',
              textAlign: 'center',
              boxShadow: '2px 2px 0 #161513',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#161513' }}>
              Clique sur la punchline qui t'a le plus fait rire :
            </span>
          </div>

          {/* Liste des punchlines à voter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shuffledOptions.map((opt) => {
              const isOwnCaption = opt.author === activeVoter

              if (isOwnCaption) {
                return (
                  <div
                    key={opt.author}
                    style={{
                      background: '#f1f2f6',
                      color: '#747d8c',
                      border: '2.5px dashed #747d8c',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      cursor: 'not-allowed',
                      opacity: 0.8,
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, fontStyle: 'italic' }}>
                      « {opt.text} »
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#eb2f06', fontWeight: 800 }}>
                      ⛔ Ta propre punchline (auto-vote interdit)
                    </span>
                  </div>
                )
              }

              return (
                <button
                  key={opt.author}
                  type="button"
                  onClick={() => handleVoteSubmit(opt.author)}
                  style={{
                    background: '#ffffff',
                    color: '#161513',
                    border: '3.5px solid #161513',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: '4px 4px 0 #161513',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)'
                    e.currentTarget.style.boxShadow = '2px 2px 0 #161513'
                    e.currentTarget.style.background = '#fff9c4'
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '4px 4px 0 #161513'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, flex: 1 }}>
                    « {opt.text} »
                  </span>
                  <span
                    style={{
                      background: '#f9ca24',
                      border: '2px solid #161513',
                      borderRadius: '10px',
                      padding: '4px 10px',
                      fontSize: '0.82rem',
                      fontFamily: 'Carter One, cursive',
                      flexShrink: 0,
                    }}
                  >
                    Voter 🗳️
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN 6 : PODIUM & RÉVÉLATION (REVEAL)
  // ----------------------------------------------------
  return (
    <GameLayout
      gameKey="messmeme"
      title="Mess Meme"
      color={COLOR}
      footer={
        <CartoonButton id="next-meme-btn" variant="success" onClick={nextRound}>
          Manche suivante ➔
        </CartoonButton>
      }
    >
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
        {/* Titre Podium */}
        <section className="game-stage-card stage-pop" style={{ padding: '14px', gap: '4px' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🏆👑</div>
          <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.45rem', margin: '4px 0 0 0', color: '#161513' }}>
            Résultats de la manche {roundIdx + 1} !
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#e17055' }}>
            « {currentSituation} »
          </p>
        </section>

        {/* Rappel du mème */}
        <MemeVisual memeIndex={roundIdx} situation={currentSituation} maxHeight="150px" />

        {/* Podium des punchlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedSubmissions.map(([author, text]) => {
            const count = voteCounts[author] || 0
            const isWinner = roundWinners.includes(author)

            return (
              <div
                key={author}
                className={isWinner ? 'card-stamp-selected' : ''}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isWinner ? '#fff9c4' : '#ffffff',
                  border: isWinner ? '3.5px solid #161513' : '3px solid #161513',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  boxShadow: isWinner ? '5px 5px 0 #161513' : '3px 3px 0 #161513',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isWinner && <span style={{ fontSize: '1.2rem' }}>👑</span>}
                    <strong style={{ fontSize: '1.05rem', fontFamily: 'Carter One, cursive', color: '#161513' }}>
                      {author}
                    </strong>
                    {isWinner && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: '#f9ca24',
                          border: '1.5px solid #161513',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          fontWeight: 900,
                        }}
                      >
                        Vainqueur du mème !
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.92rem', fontStyle: 'italic', color: '#161513', fontWeight: 600, lineHeight: 1.3 }}>
                    « {text} »
                  </span>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      background: count > 0 ? '#10ac84' : '#747d8c',
                      color: '#ffffff',
                      border: '2px solid #161513',
                      borderRadius: '10px',
                      padding: '4px 10px',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      display: 'inline-block',
                      boxShadow: '2px 2px 0 #161513',
                    }}
                  >
                    +{count} pt{count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tableau récapitulatif des scores de la partie */}
        <section
          className="game-stage-card"
          style={{
            padding: '16px',
            gap: '8px',
            background: '#ffffff',
            boxShadow: '4px 4px 0 #161513',
          }}
        >
          <h3
            style={{
              margin: '0 0 4px 0',
              fontFamily: 'Carter One, cursive',
              fontSize: '1.1rem',
              color: '#161513',
            }}
          >
            Classement général 🎖️
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {sortedLeaderboard.map((p, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'
              const isFirst = idx === 0
              return (
                <div
                  key={p}
                  style={{
                    background: isFirst ? '#fff9c4' : '#f1f2f6',
                    border: '2.5px solid #161513',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '2px 2px 0 #161513',
                  }}
                >
                  <span>{medal}</span>
                  <span>{p}</span>
                  <span
                    style={{
                      background: '#161513',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {scores[p] || 0} pts
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </GameLayout>
  )
}
