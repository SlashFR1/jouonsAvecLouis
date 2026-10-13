import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { useGameData } from '../../hooks/useGameData'
import devineQuiFallback from '../../data/devinequi.json'

const COLOR = CARD_COLORS.purple

const CHARACTERS = [
  { name: 'Harry Potter', hint: 'Sorcier à lunettes avec une cicatrice' },
  { name: 'Mickey Mouse', hint: 'Souris culte aux oreilles rondes' },
  { name: 'Spider-Man', hint: 'Tisseur de toiles de New York' },
  { name: 'Napoléon Bonaparte', hint: 'Empereur au bicorne' },
  { name: 'Barbie', hint: 'Poupée blonde aux mille métiers' },
  { name: 'Albert Einstein', hint: 'Physicien à la langue tirée' },
  { name: 'Homer Simpson', hint: 'Adore les donuts et la Duff' },
  { name: 'Pikachu', hint: 'Souris électrique jaune' },
  { name: 'Mario', hint: 'Plombier moustachu à casquette rouge' },
  { name: 'Beyoncé', hint: 'Reine pop Queen B' },
  { name: 'Batman', hint: 'Chevalier noir de Gotham City' },
  { name: 'Tintin', hint: 'Reporter à la houppette blonde' },
  { name: 'Sherlock Holmes', hint: 'Détective de Baker Street' },
  { name: 'Cléopâtre', hint: 'Reine d’Égypte antique' },
  { name: 'Dark Vador', hint: 'Seigneur Sith qui respire fort' },
  { name: 'Shrek', hint: 'Ogre vert du marais' },
]

export default function DevineQuiGame() {
  const { data: devineQuiData } = useGameData('devinequi', devineQuiFallback)
  const themesList = (devineQuiData?.themes && devineQuiData.themes.classique) || []
  const contraintesList = (devineQuiData?.contraintes && devineQuiData.contraintes.classique) || []

  const [players, setPlayers] = useState(['Joueur 1', 'Joueur 2', 'Joueur 3'])
  const [newPlayer, setNewPlayer] = useState('')
  const [playing, setPlaying] = useState(false)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [assignedCharacters, setAssignedCharacters] = useState([])
  const [showSecret, setShowSecret] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [themeInspiration, setThemeInspiration] = useState('Parle de l’école')
  const [constraintInspiration, setConstraintInspiration] = useState('Interdit de dire non')

  useEffect(() => {
    document.title = 'Devine qui ? 🎭 – Loustic'
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
    if (players.length < 2) return
    const shuffled = [...CHARACTERS].sort(() => 0.5 - Math.random())
    const assigned = players.map((name, i) => ({
      player: name,
      char: shuffled[i % shuffled.length],
      found: false,
    }))
    setAssignedCharacters(assigned)
    setCurrentPlayerIdx(0)
    setQuestionCount(0)
    setShowSecret(false)
    if (themesList.length > 0) {
      setThemeInspiration(themesList[Math.floor(Math.random() * themesList.length)])
    }
    if (contraintesList.length > 0) {
      setConstraintInspiration(contraintesList[Math.floor(Math.random() * contraintesList.length)])
    }
    setPlaying(true)
  }

  const nextPlayer = () => {
    setShowSecret(false)
    setQuestionCount(0)
    setCurrentPlayerIdx(i => (i + 1) % players.length)
  }

  const currentPlayer = assignedCharacters[currentPlayerIdx]

  const footer = !playing ? (
    <CartoonButton
      id="start-devinequi-btn"
      disabled={players.length < 2}
      onClick={startGame}
    >
      Lancer la partie ({players.length} joueurs)
    </CartoonButton>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <CartoonButton id="next-player-turn-btn" onClick={nextPlayer}>
        Joueur suivant
      </CartoonButton>
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: '#161513',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
        onClick={() => setPlaying(false)}
      >
        Modifier les joueurs / Recommencer
      </button>
    </div>
  )

  return (
    <GameLayout gameKey="devinequi" title="Devine qui ? 🎭" color={COLOR} footer={footer}>
      {!playing ? (
        <section className="game-stage-card">
          <span className="stage-tag">Configuration Pass & Play</span>
          <h2>Ajoutez les joueurs autour de la table</h2>
          <p className="hint">Chacun aura un personnage secret à deviner !</p>

          <div style={{ display: 'flex', gap: '8px', width: '100%', margin: '12px 0' }}>
            <input
              id="player-input"
              type="text"
              placeholder="Prénom du joueur..."
              value={newPlayer}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '2.5px solid #161513',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
              }}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
            />
            <button
              id="add-player-btn"
              type="button"
              className="btn-action-primary"
              style={{ padding: '0 16px', borderRadius: '12px', fontSize: '1rem' }}
              onClick={addPlayer}
            >
              Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
            {players.map((p, idx) => (
              <span
                key={idx}
                className="player-chip is-me"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {p}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 900,
                    color: '#ff4757',
                  }}
                  onClick={() => removePlayer(idx)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </section>
      ) : (
        <CardStage cardKey={`${currentPlayerIdx}`} tag={`Tour de ${currentPlayer?.player}`}>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p className="hint">
              {currentPlayer?.player}, donne le téléphone à tes voisins pour qu'ils voient qui tu es !
            </p>

            <div style={{ margin: '14px 0' }}>
              {!showSecret ? (
                <button
                  id="show-secret-char-btn"
                  type="button"
                  className="btn-action-primary"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    background: '#f5cd79',
                  }}
                  onClick={() => setShowSecret(true)}
                >
                  👀 Afficher le personnage secret aux autres
                </button>
              ) : (
                <div
                  style={{
                    background: '#ede7f6',
                    border: '3px solid #8c7ae6',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '4px 4px 0 #161513',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: '#161513', fontWeight: 800 }}>
                    PERSONNAGE SUR LE FRONT :
                  </span>
                  <h2
                    className="word-display"
                    style={{ fontSize: '1.6rem', color: '#161513', margin: '6px 0' }}
                  >
                    {currentPlayer?.char.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#161513', fontStyle: 'italic', fontWeight: 600 }}>
                    Indice : {currentPlayer?.char.hint}
                  </p>
                  <button
                    type="button"
                    style={{
                      marginTop: '10px',
                      background: '#ffffff',
                      border: '2px solid #161513',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowSecret(false)}
                  >
                    🙈 Masquer
                  </button>
                </div>
              )}
            </div>

            {/* Compteur de questions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '2px dashed #161513',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Questions posées : {questionCount}
              </span>
              <button
                id="inc-question-btn"
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '2px solid #161513',
                  background: '#2ed573',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => setQuestionCount(c => c + 1)}
              >
                +1 Question
              </button>
            </div>
          </div>
          {/* Inspirations du tour (données statiques) */}
          <div style={{ marginTop: '14px', padding: '10px', background: '#fdfbf7', borderRadius: '12px', border: '2px solid #161513', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: '#8c7ae6' }}>
              💡 SUJET DU TOUR : <span style={{ color: '#161513' }}>{themeInspiration}</span>
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#e17055' }}>
              ⚡ CONTRAINTE : <span style={{ color: '#161513' }}>{constraintInspiration}</span>
            </p>
          </div>
        </CardStage>
      )}
    </GameLayout>
  )
}
