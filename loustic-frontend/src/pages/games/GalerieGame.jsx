import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.purple

// Définition des 4 thèmes connectés aux dossiers réels dans public/images/galerie/images/
export const GALERIE_THEMES = [
  {
    id: 'art',
    title: 'Art & Tableaux 🖼️',
    folder: 'art',
    totalImages: 111,
    desc: "111 chefs-d'œuvre de peinture classique et moderne.",
    badgeColor: '#8c7ae6',
    emoji: '🎨',
  },
  {
    id: 'Reve',
    title: 'Rêve & Onirique 🌌',
    folder: 'Reve',
    totalImages: 60,
    desc: '60 illustrations poétiques, surréalistes et mystiques.',
    badgeColor: '#00a8ff',
    emoji: '🌙',
  },
  {
    id: 'nature',
    title: 'Merveilles de la Nature 🌿',
    folder: 'nature',
    totalImages: 45,
    desc: '45 toiles immersives de paysages et faune sauvage.',
    badgeColor: '#4cd137',
    emoji: '🍃',
  },
  {
    id: 'memes',
    title: 'Culture Mèmes 😂',
    folder: 'memes',
    totalImages: 107,
    desc: "107 mèmes cultes d'internet revisités façon musée.",
    badgeColor: '#f5cd79',
    emoji: '🤪',
  },
]

// Composant d'affichage d'une carte d'art haute fidélité
function ArtCardView({ card, isSelected, onClick, size = 'normal', showDetails = true }) {
  const [imgError, setImgError] = useState(false)

  const cardStyle = {
    background: isSelected ? '#fff9c4' : '#ffffff',
    border: isSelected ? '4px solid #ff4757' : '3px solid #161513',
    borderRadius: '14px',
    padding: size === 'large' ? '12px' : '8px',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: isSelected ? '0 0 0 3px #ff4757, 4px 4px 0 #161513' : '3px 3px 0 #161513',
    transition: 'transform 0.15s, box-shadow 0.15s',
    transform: isSelected ? 'scale(1.02)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  }

  const imgMaxHeight = size === 'large' ? '240px' : '135px'

  return (
    <div style={cardStyle} onClick={onClick}>
      <div
        style={{
          width: '100%',
          height: imgMaxHeight,
          background: '#f1f2f6',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #161513',
        }}
      >
        {!imgError ? (
          <img
            src={card.src}
            alt={card.title}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#747d8c', marginTop: '4px' }}>
              {card.title}
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <div style={{ textAlign: 'center', marginTop: '6px', width: '100%' }}>
          <strong
            style={{
              fontSize: size === 'large' ? '1.05rem' : '0.88rem',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.title}
          </strong>
        </div>
      )}
    </div>
  )
}

// Fonction de mélange de tableau
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GalerieGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState('art')

  // Scores des joueurs
  const [scores, setScores] = useState({})
  const [conteurIdx, setConteurIdx] = useState(0)

  // Manche et cartes
  const [round, setRound] = useState(1)
  const [deck, setDeck] = useState([])
  const [currentCards, setCurrentCards] = useState([])
  const [secretCardIdx, setSecretCardIdx] = useState(0)

  // Déroulement du tour : 'CLUE' | 'VOTE' | 'REVEAL'
  const [phase, setPhase] = useState('CLUE')
  const [clue, setClue] = useState('')
  const [playerVotes, setPlayerVotes] = useState({}) // { [voterName]: cardId }
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)

  const activeTheme = useMemo(() => {
    return GALERIE_THEMES.find(t => t.id === selectedThemeId) || GALERIE_THEMES[0]
  }, [selectedThemeId])

  const currentConteur = players[conteurIdx % players.length] || 'Conteur'
  const otherPlayers = useMemo(() => players.filter(p => p !== currentConteur), [players, currentConteur])
  const currentVoter = otherPlayers[currentVoterIdx] || 'Joueur'

  useEffect(() => {
    document.title = 'Galerie 🎨 – Loustic'
  }, [])

  // Construction du deck de cartes pour le thème choisi
  const buildCardsForTheme = theme => {
    const cards = []
    for (let i = 1; i <= theme.totalImages; i++) {
      cards.push({
        id: i,
        title: `${theme.title.split(' ')[0]} #${i}`,
        src: `/images/galerie/images/${theme.folder}/img${i}.png`,
        emoji: theme.emoji,
      })
    }
    return shuffle(cards)
  }

  // Démarrer la partie
  const handleStart = () => {
    if (players.length < 2) return

    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)

    const newDeck = buildCardsForTheme(activeTheme)
    setDeck(newDeck)
    setRound(1)
    setConteurIdx(0)

    startRound(newDeck, 0)
    setStarted(true)
  }

  // Démarrer une nouvelle manche
  const startRound = (sourceDeck, offset = 0) => {
    let available = [...sourceDeck]
    if (available.length < 4) {
      available = buildCardsForTheme(activeTheme)
      setDeck(available)
    }

    const hand = available.slice(0, 4)
    const remaining = available.slice(4)
    setDeck(remaining)
    setCurrentCards(hand)

    setSecretCardIdx(Math.floor(Math.random() * 4))
    setClue('')
    setPlayerVotes({})
    setCurrentVoterIdx(0)
    setPhase('CLUE')
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

    const updatedVotes = {
      ...playerVotes,
      [voter]: cardId,
    }
    setPlayerVotes(updatedVotes)

    if (currentVoterIdx + 1 < otherPlayers.length) {
      setCurrentVoterIdx(i => i + 1)
    } else {
      // Tout le monde a voté -> Révélation et calcul des scores
      handleResolveScores(updatedVotes)
    }
  }

  // Calcul des scores type Dixit
  const handleResolveScores = finalVotes => {
    const secretCardId = currentCards[secretCardIdx].id
    const correctGuessers = otherPlayers.filter(p => finalVotes[p] === secretCardId)

    setScores(prev => {
      const next = { ...prev }
      // Règle Dixit :
      // - Si tout le monde ou personne ne trouve : Conteur 0 pt, tous les autres 2 pts.
      // - Sinon : Conteur 3 pts, et chaque joueur ayant trouvé marque 3 pts.
      if (correctGuessers.length === 0 || correctGuessers.length === otherPlayers.length) {
        otherPlayers.forEach(p => { next[p] = (next[p] || 0) + 2 })
      } else {
        next[currentConteur] = (next[currentConteur] || 0) + 3
        correctGuessers.forEach(p => { next[p] = (next[p] || 0) + 3 })
      }
      return next
    })

    setPhase('REVEAL')
  }

  // Passer à la manche suivante
  const nextRound = () => {
    setRound(r => r + 1)
    setConteurIdx(i => (i + 1) % players.length)
    startRound(deck)
  }

  // ----------------------------------------------------
  // ÉCRAN 1 : SETUP DES JOUEURS & CHOIX DU THÈME D'IMAGES
  // ----------------------------------------------------
  if (!started) {
    return (
      <GameLayout
        gameKey="galerie"
        title="Galerie"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-galerie-btn"
            variant="success"
            disabled={players.length < 2}
            onClick={handleStart}
          >
            Lancer l'exposition (Min. 2 joueurs)
          </CartoonButton>
        }
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Sélection du Thème d'images */}
          <div
            style={{
              background: '#ede7f6',
              border: '3px solid #161513',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '3px 3px 0 #161513',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Collection d'œuvres</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#57606f' }}>
              Sélectionnez les images à exposer pour cette partie :
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {GALERIE_THEMES.map(t => {
                const isSelected = selectedThemeId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThemeId(t.id)}
                    style={{
                      background: isSelected ? '#fff9c4' : '#ffffff',
                      border: isSelected ? '3px solid #ff4757' : '2px solid #161513',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: isSelected ? 'inset 2px 2px 0 rgba(0,0,0,0.1)' : '2px 2px 0 #161513',
                      transform: isSelected ? 'scale(0.98)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem' }}>{t.emoji}</div>
                    <strong style={{ fontSize: '0.88rem', display: 'block', margin: '3px 0' }}>{t.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#747d8c', display: 'block' }}>
                      {t.totalImages} images connectées
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Joueurs */}
          <PlayerSetup players={players} onChange={setPlayers} />
        </div>
      </GameLayout>
    )
  }

  // ----------------------------------------------------
  // ÉCRAN PRINCIPAL DU JEU (CLUE / VOTE / REVEAL)
  // ----------------------------------------------------
  const secretCard = currentCards[secretCardIdx] || currentCards[0]

  const footer = phase === 'CLUE' ? (
    <CartoonButton
      id="submit-clue-btn"
      disabled={!clue.trim()}
      onClick={handleClueSubmit}
    >
      Valider l'indice
    </CartoonButton>
  ) : phase === 'REVEAL' ? (
    <CartoonButton id="next-gallery-btn" variant="success" onClick={nextRound}>
      Manche suivante
    </CartoonButton>
  ) : null

  return (
    <GameLayout gameKey="galerie" title={`Galerie (Manche ${round})`} color={COLOR} footer={footer}>
      <section className="game-stage-card stage-pop" style={{ maxWidth: '520px', gap: '12px', width: '100%' }}>
        {/* Header de manche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="stage-tag" style={{ background: activeTheme.badgeColor || '#8c7ae6', color: '#fff' }}>
            {phase === 'CLUE' ? `Conteur : ${currentConteur}` : phase === 'VOTE' ? `Vote : ${currentVoter}` : 'Révélation'}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {players.map(p => (
              <span key={p} style={{ fontSize: '0.78rem', fontWeight: 800, background: '#f1f2f6', padding: '2px 8px', borderRadius: '8px', border: '1px solid #161513' }}>
                {p}: {scores[p] || 0} pt{scores[p] > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* PHASE 1 : Le Conteur choisit une carte et pose son indice */}
        {phase === 'CLUE' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Carter One, cursive', margin: '0 0 4px 0', fontSize: '1.25rem' }}>
              {currentConteur}, choisis ton œuvre secrète !
            </h2>
            <p className="hint" style={{ margin: '0 0 10px 0' }}>
              Touche une œuvre puis tape une énigme ou un indice poétique :
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '8px 0' }}>
              {currentCards.map((c, idx) => (
                <ArtCardView
                  key={c.id}
                  card={c}
                  isSelected={secretCardIdx === idx}
                  onClick={() => setSecretCardIdx(idx)}
                />
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
                marginTop: '8px',
                background: '#ffffff',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.08)',
              }}
            />
          </div>
        )}

        {/* PHASE 2 : Les autres joueurs votent pour l'œuvre secrète */}
        {phase === 'VOTE' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div
              className="prompt-envelope"
              style={{
                margin: '4px 0 10px 0',
                background: '#fff9c4',
                border: '3px solid #161513',
                borderRadius: '14px',
                padding: '10px 14px',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e17055', textTransform: 'uppercase' }}>
                Indice du conteur ({currentConteur}) :
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.3rem', color: '#2d3436' }}>
                « {clue} »
              </h3>
            </div>

            <h3 style={{ margin: '8px 0 4px 0', color: '#0984e3', fontSize: '1.1rem' }}>
              À toi de voter, <strong>{currentVoter}</strong> ({currentVoterIdx + 1}/{otherPlayers.length}) !
            </h3>
            <p className="hint" style={{ margin: '0 0 10px 0' }}>
              Retrouve l'œuvre qui correspond à cet indice :
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {currentCards.map(c => (
                <ArtCardView
                  key={c.id}
                  card={c}
                  onClick={() => handleVoteCard(c.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3 : Révélation de l'œuvre secrète et calcul des points */}
        {phase === 'REVEAL' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Carter One, cursive', color: '#2ed573', margin: '0 0 8px 0', fontSize: '1.35rem' }}>
              L'œuvre secrète était :
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ maxWidth: '280px', width: '100%' }}>
                <ArtCardView
                  card={secretCard}
                  isSelected={true}
                  size="large"
                />
              </div>
            </div>

            <div
              style={{
                background: '#fff9c4',
                border: '2px solid #161513',
                borderRadius: '10px',
                padding: '6px 12px',
                fontWeight: 800,
                color: '#e17055',
                display: 'inline-block',
                marginBottom: '12px',
              }}
            >
              Indice du conteur : « {clue} »
            </div>

            {/* Récapitulatif des votes */}
            <div
              style={{
                textAlign: 'left',
                background: '#f8f9fa',
                border: '2px solid #161513',
                borderRadius: '12px',
                padding: '12px',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.82rem', color: '#636e72' }}>
                Votes des joueurs :
              </h4>
              {otherPlayers.map(p => {
                const votedCardId = playerVotes[p]
                const isCorrect = votedCardId === secretCard.id
                const votedCard = currentCards.find(c => c.id === votedCardId)

                return (
                  <div
                    key={p}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px dashed #dcdde1',
                    }}
                  >
                    <span>
                      <strong>{p}</strong> a voté {votedCard ? votedCard.title : '??'}
                    </span>
                    <strong style={{ color: isCorrect ? '#2ed573' : '#ff4757', fontSize: '0.88rem' }}>
                      {isCorrect ? 'Trouvé (+3 pts)' : 'Raté'}
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
