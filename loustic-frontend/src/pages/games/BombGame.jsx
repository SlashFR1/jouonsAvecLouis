import { useState, useEffect, useRef } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import BombVisual from '../../components/games/BombVisual'
import { CARD_COLORS } from '../../config/games'
import { useDeck } from '../../hooks/useDeck'
import { useLocalPlayers } from '../../hooks/usePlayers'
import { useGameData } from '../../hooks/useGameData'
import { bombAudio } from '../../utils/bombAudio'
import bombFallback from '../../data/bomb.json'

const COLOR = CARD_COLORS.red

const FALLBACK_THEMES = [
  'Marques de voitures',
  'Capitales du monde',
  'Choses qu’on trouve dans un frigo',
  'Films avec des super-héros',
  'Animaux sauvages',
  'Séries Netflix',
]

const FALLBACK_GAGES = [
  'Bois 2 gorgées cul-sec !',
  'Fais 10 pompes immédiatement !',
  'Imite la poule pendant 15 secondes sans rigoler !',
  'Avoue ton plus gros crush inavouable !',
  'Chante le refrain de la dernière chanson que tu as écoutée !',
]

export default function BombGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [state, setState] = useState('ready') // ready | ticking | exploded
  const [turnIndex, setTurnIndex] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('')
  const [currentGage, setCurrentGage] = useState('')
  const timerRef = useRef(null)

  const { data: bombDb } = useGameData('bomb', bombFallback)
  const themesList = bombDb?.themes || FALLBACK_THEMES
  const gagesList = bombDb?.gages || FALLBACK_GAGES

  const remainingThemesRef = useRef([])
  const remainingGagesRef = useRef([])

  const getNextTheme = () => {
    if (!remainingThemesRef.current || remainingThemesRef.current.length === 0) {
      remainingThemesRef.current = [...themesList].sort(() => 0.5 - Math.random())
    }
    return remainingThemesRef.current.pop() || 'Marques de voitures'
  }

  const getNextGage = () => {
    if (!remainingGagesRef.current || remainingGagesRef.current.length === 0) {
      remainingGagesRef.current = [...gagesList].sort(() => 0.5 - Math.random())
    }
    return remainingGagesRef.current.pop() || 'Bois 2 gorgées !'
  }

  useEffect(() => {
    document.title = 'Boom boom 💣 – Loustic'
    return () => {
      clearTimeout(timerRef.current)
      bombAudio.stop()
    }
  }, [])

  const startRound = () => {
    if (players.length < 2) return
    bombAudio.unlock()
    const nextTheme = getNextTheme()
    const nextGage = getNextGage()

    setCurrentTheme(nextTheme)
    setCurrentGage(nextGage)
    setPassCount(0)
    setTurnIndex(Math.floor(Math.random() * players.length))
    setState('ticking')

    bombAudio.startTicking(1.0)

    // Durée secrète aléatoire entre 18 et 40 secondes
    const durationMs = (Math.floor(Math.random() * 23) + 18) * 1000

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setState('exploded')
      bombAudio.playBoom()
    }, durationMs)
  }

  const passBomb = () => {
    if (state !== 'ticking') return
    setPassCount(c => c + 1)
    setTurnIndex(i => (i + 1) % players.length)
    bombAudio.speedUp(0.12)
    navigator.vibrate?.([80, 40, 80])
  }

  const currentHolder = players[turnIndex % players.length] || 'Joueur'
  const nextHolder = players[(turnIndex + 1) % players.length] || 'Joueur suivant'

  // Écran 1 : Setup des joueurs
  if (!started) {
    return (
      <GameLayout
        gameKey="bomb"
        title="Boom boom 💣"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-bomb-local-btn"
            disabled={players.length < 2}
            onClick={() => {
              setStarted(true)
              startRound()
            }}
          >
            💣 Allumer la mèche ({players.length} joueurs)
          </CartoonButton>
        }
      >
        <PlayerSetup players={players} onChange={setPlayers} />
      </GameLayout>
    )
  }

  // Écran 2 : Partie Pass & Play
  const footer = state === 'ticking' ? (
    <CartoonButton id="pass-bomb-local-btn" variant="danger" onClick={passBomb}>
      ⚡ PASSER LA BOMBE À {nextHolder.toUpperCase()} 📲
    </CartoonButton>
  ) : state === 'exploded' ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <CartoonButton id="replay-bomb-local-btn" onClick={startRound}>
        🔄 Relancer une manche
      </CartoonButton>
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: '#57606f',
          fontSize: '0.85rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
        onClick={() => {
          clearTimeout(timerRef.current)
          bombAudio.stop()
          setState('ready')
          setStarted(false)
        }}
      >
        Modifier les joueurs
      </button>
    </div>
  ) : (
    <CartoonButton id="start-round-btn" onClick={startRound}>
      💣 Allumer la mèche !
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="bomb" title="Boom boom 💣" color={COLOR} footer={footer}>
      <CardStage
        tag={state === 'ticking' ? `🔥 Bombe chez : ${currentHolder}` : 'Boom boom 💣'}
        className={state === 'ticking' ? 'bomb-active' : ''}
      >
        {/* Affichage du Thème */}
        <div className="prompt-envelope" style={{ margin: '6px 0', minHeight: '80px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff4757', textTransform: 'uppercase' }}>
            Thème à citer :
          </span>
          <h2 className="word-display" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.85rem)', margin: '4px 0' }}>
            {currentTheme || 'Marques de voitures'}
          </h2>
        </div>

        {/* Visuel Bombe Animée avec Mèche qui brûle, tremblements et vibrations */}
        <BombVisual
          isTicking={state === 'ticking'}
          isExploded={state === 'exploded'}
          holdsBomb={true}
          passCount={passCount}
          victimName={currentHolder}
          isVictim={true}
          gage={currentGage}
          onReplay={startRound}
          onResolve={() => setState('ready')}
          isHost={true}
        />

        {state === 'ticking' && (
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ margin: '4px 0', color: '#ff4757' }}>
              {currentHolder}, cite un mot valide !
            </h3>
            <p className="hint">
              Puis passe vite le téléphone à <strong>{nextHolder}</strong> avant que la mèche ne s'éteigne !
            </p>
          </div>
        )}

        {/* Liste des joueurs */}
        <div className="player-chips" style={{ marginTop: '14px' }}>
          {players.map((name, i) => {
            const hasBomb = i === turnIndex % players.length && state === 'ticking'
            return (
              <span
                key={name}
                className={`player-chip ${hasBomb ? 'is-active-turn' : ''}`}
                style={hasBomb ? { border: '2.5px solid #ff4757', background: '#ffebee', fontWeight: 800 } : {}}
              >
                {hasBomb && '💣 '}
                {name}
              </span>
            )
          })}
        </div>
      </CardStage>
    </GameLayout>
  )
}
