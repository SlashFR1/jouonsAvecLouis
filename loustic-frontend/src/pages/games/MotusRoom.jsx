import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import '../../styles/motus-visual.css'

const THEME_COLOR = '#eb2f06'
const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE']
]

export default function MotusRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()

  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Configuration de la partie (hôte)
  const [totalRounds, setTotalRounds] = useState(5)

  // État local de saisie du joueur
  const [currentInput, setCurrentInput] = useState('')
  const [myAttempts, setMyAttempts] = useState([])
  const [shakeCurrentRow, setShakeCurrentRow] = useState(false)
  const [firstFinderAlert, setFirstFinderAlert] = useState(null)

  // Lettres bien placées conservées pour les essais suivants : index -> char
  const [knownLetters, setKnownLetters] = useState({})

  // Statuts des lettres pour le clavier virtuel : char -> 'CORRECT' | 'PRESENT' | 'ABSENT'
  const [keyStatuses, setKeyStatuses] = useState({})

  // Événements publics de la salle
  const onEvent = useCallback(evt => {
    if (evt.room) setRoom(evt.room)

    switch (evt.type) {
      case 'MOTUS_ROUND_STARTED':
        setGameState(evt.payload)
        setMyAttempts([])
        setKeyStatuses({})
        setKnownLetters({})
        setFirstFinderAlert(null)
        setError(null)
        // Initialiser avec la première lettre obligatoire
        if (evt.payload?.firstLetter) {
          setCurrentInput(evt.payload.firstLetter)
        }
        break

      case 'MOTUS_STATE_UPDATED':
      case 'MOTUS_ROUND_RESOLVED':
      case 'MOTUS_GAME_OVER':
        setGameState(evt.payload)
        break

      case 'MOTUS_FIRST_FINDER':
        setFirstFinderAlert(evt.payload)
        break

      case 'MOTUS_ERROR':
        setError(evt.payload?.message || 'Erreur survenue')
        break

      default:
        break
    }
  }, [])

  // Canal secret personnel : réception des lettres réelles et statuts de mes essais
  const extraSubscriptions = useMemo(() => {
    if (!room?.code || !playerId) return {}
    return {
      [`/topic/room/${room.code}/motus/${playerId}`]: data => {
        if (!data) return
        if (data.type === 'MOTUS_MY_GUESS_RESULT') {
          setMyAttempts(prev => [
            ...prev,
            { word: data.guess, statuses: data.statuses, attemptNumber: data.attemptNumber }
          ])

          // Mettre à jour les statuts du clavier et lettres bien placées
          setKeyStatuses(prev => {
            const next = { ...prev }
            const guess = data.guess || ''
            const statuses = data.statuses || []
            for (let i = 0; i < guess.length; i++) {
              const char = guess[i]
              const st = statuses[i]
              // CORRECT > PRESENT > ABSENT
              if (st === 'CORRECT') {
                next[char] = 'CORRECT'
              } else if (st === 'PRESENT' && next[char] !== 'CORRECT') {
                next[char] = 'PRESENT'
              } else if (st === 'ABSENT' && !next[char]) {
                next[char] = 'ABSENT'
              }
            }
            return next
          })

          setKnownLetters(prev => {
            const next = { ...prev }
            const guess = data.guess || ''
            const statuses = data.statuses || []
            for (let i = 0; i < guess.length; i++) {
              if (statuses[i] === 'CORRECT') {
                next[i] = guess[i]
              }
            }
            return next
          })

          // Préparer la ligne suivante si pas encore trouvé et pas fini
          if (!data.found && !data.finished && gameState?.firstLetter) {
            setCurrentInput(gameState.firstLetter)
          } else {
            setCurrentInput('')
          }
        } else if (data.type === 'MOTUS_PRIVATE_SYNC') {
          if (Array.isArray(data.myAttempts)) {
            setMyAttempts(data.myAttempts)
          }
        } else if (data.type === 'MOTUS_GUESS_ERROR') {
          setError(data.message)
          triggerShake()
        }
      }
    }
  }, [room?.code, playerId, gameState?.firstLetter])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  // Arrivée directe via URL partagée
  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName.trim()).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Motus 🟥 – Loustic` : 'Motus 🟥 – Loustic'
  }, [room])

  // Synchronisation lors de la connexion initiale
  useEffect(() => {
    if (connected && room?.code) {
      send('motus/sync', { playerId })
    }
  }, [connected, room?.code, playerId, send])

  const triggerShake = () => {
    setShakeCurrentRow(true)
    setTimeout(() => setShakeCurrentRow(false), 450)
  }

  // Création / Connexion
  const handleCreate = async () => {
    const trimmed = (playerName || '').trim()
    if (!trimmed) {
      setError('Choisis un pseudo d’abord !')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('motus', playerId, trimmed)
      setRoom(r)
      navigate(`/salle/motus/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async code => {
    const trimmed = (playerName || '').trim()
    if (!trimmed) {
      setError('Choisis un pseudo d’abord !')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const r = await joinRoom(code, playerId, trimmed)
      setRoom(r)
      navigate(`/salle/motus/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleQuit = () => {
    if (room) leaveRoom(room.code, playerId).catch(() => {})
    navigate('/?mode=multi')
  }

  const wordLength = gameState?.wordLength || 7
  const firstLetter = gameState?.firstLetter || ''
  const isHost = room?.hostId === playerId
  const phase = gameState?.phase || 'LOBBY'

  // Gestion des touches du clavier
  const handleKeyPress = useCallback((key) => {
    if (phase !== 'ROUND_ACTIVE') return
    const myData = gameState?.playersProgress?.[playerId]
    if (myData?.finished || myAttempts.length >= 6) return

    if (key === 'BACKSPACE') {
      // Effacer la dernière lettre sans effacer la première lettre pré-remplie
      setCurrentInput(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
      setError(null)
      return
    }

    if (key === 'ENTER') {
      if (currentInput.length !== wordLength) {
        setError(`Le mot doit comporter ${wordLength} lettres !`)
        triggerShake()
        return
      }
      if (currentInput[0] !== firstLetter) {
        setError(`La première lettre doit être ${firstLetter} !`)
        triggerShake()
        return
      }

      setError(null)
      send('motus/guess', { playerId, word: currentInput })
      return
    }

    // Ajout d'une lettre A-Z
    if (/^[A-Z]$/.test(key)) {
      if (currentInput.length < wordLength) {
        setCurrentInput(prev => prev + key)
        setError(null)
      }
    }
  }, [phase, gameState, playerId, myAttempts.length, currentInput, wordLength, firstLetter, send])

  // Support du clavier physique
  useEffect(() => {
    const onKeyDown = e => {
      if (phase !== 'ROUND_ACTIVE') return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const key = e.key.toUpperCase()
      if (key === 'BACKSPACE' || key === 'ENTER' || /^[A-Z]$/.test(key)) {
        e.preventDefault()
        handleKeyPress(key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKeyPress, phase])

  // Écran 1 : LOBBY
  if (!room || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="motus" title="Motus 🟥" color={THEME_COLOR} onBack={handleQuit}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <RoomLobby
            title="Motus 🟥 (Tusmo)"
            emoji="🟥"
            room={room}
            playerId={playerId}
            playerName={playerName}
            setPlayerName={setPlayerName}
            connected={connected}
            busy={busy}
            error={error}
            minPlayers={1}
            startLabel={`🚀 Lancer la partie (${totalRounds} mots)`}
            onCreate={handleCreate}
            onJoin={handleJoin}
            onStart={() => send('motus/start', { playerId, totalRounds })}
          />

          {room && isHost && (
            <div className="game-stage-card" style={{ maxWidth: '420px', margin: '12px auto 0', textAlign: 'center' }}>
              <label style={{ fontWeight: 800, fontSize: '0.95rem' }} htmlFor="rounds-select">
                Nombre de mots à trouver :
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                {[3, 5, 8, 10].map(nb => (
                  <CartoonButton
                    key={nb}
                    id={`motus-rounds-${nb}-btn`}
                    variant={totalRounds === nb ? 'primary' : 'secondary'}
                    onClick={() => setTotalRounds(nb)}
                    style={{ padding: '6px 14px', fontSize: '1rem' }}
                  >
                    {nb} mots
                  </CartoonButton>
                ))}
              </div>
            </div>
          )}
        </div>
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  const myRoundData = gameState?.playersProgress?.[playerId]
  const isFinished = myRoundData?.finished || myAttempts.length >= 6
  const isFound = myRoundData?.found

  return (
    <GameLayout
      gameKey="motus"
      title={`Motus – Manche ${gameState.roundNumber}/${gameState.totalRounds}`}
      color={THEME_COLOR}
      right={connStatus}
      onBack={handleQuit}
    >
      <section className="motus-stage">
        {/* TOP BAR : Numéro de manche et score personnel */}
        <div className="motus-header-card">
          <span className="motus-badge-hero">
            🟥 MANCHE {gameState.roundNumber} / {gameState.totalRounds}
          </span>
          <span className="motus-score-pill">
            ⭐ Ton score : <strong>{gameState.scores?.[playerId] || 0} pts</strong>
          </span>
        </div>

        {/* ALERTE BONUS PREMIER JOUEUR */}
        {firstFinderAlert && (
          <div className="motus-first-finder-alert">
            ⚡ <strong>{firstFinderAlert.playerName}</strong> a trouvé le mot en premier (+15 pts bonus) !
          </div>
        )}

        {/* BANDEAU DES ADVERSAIRES EN DIRECT (Mini-grilles temps réel) */}
        <div className="motus-opponents-row">
          {room.players.map(p => {
            const isMe = p.id === playerId
            const pData = gameState.playersProgress?.[p.id]
            const pScore = gameState.scores?.[p.id] || 0
            const statusesList = pData?.statusesList || []

            return (
              <div
                key={p.id}
                className={`motus-opponent-card ${pData?.found ? 'is-winner' : ''}`}
                title={`${p.name} : ${pScore} pts`}
              >
                <span className="motus-opp-name">
                  {p.name} {isMe ? '(Toi)' : ''}
                </span>

                {/* Mini Grille des essais adverses (Aucune lettre, uniquement les statuts) */}
                <div className="motus-mini-grid">
                  {Array.from({ length: 6 }).map((_, rIdx) => {
                    const rowStatuses = statusesList[rIdx]
                    return (
                      <div key={rIdx} className="motus-mini-row">
                        {Array.from({ length: wordLength }).map((__, cIdx) => {
                          const status = rowStatuses?.[cIdx] || ''
                          return (
                            <div
                              key={cIdx}
                              className={`motus-mini-cell ${status}`}
                            />
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: 2, color: '#636e72' }}>
                  {pData?.found ? '🎉 Trouvé !' : pData?.finished ? '❌ Échec' : `${statusesList.length}/6`}
                </span>
              </div>
            )
          })}
        </div>

        {/* ÉCRAN DE RÉSOLUTION DE LA MANCHE OU PODIUM FINAL */}
        {phase === 'GAME_OVER' ? (
          <div className="motus-result-card" style={{ background: '#fef08a' }}>
            <span style={{ fontSize: '3rem' }}>👑</span>
            <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.8rem', color: '#854d0e', margin: 0 }}>
              PARTIE TERMINÉE !
            </h2>
            <p style={{ fontWeight: 800, fontSize: '1.25rem', color: '#713f12' }}>
              🎉 <strong>{gameState.winnerPlayerName}</strong> remporte la partie de Motus !
            </p>
            <div className="player-chips" style={{ justifyContent: 'center' }}>
              {room.players.map(p => (
                <span
                  key={p.id}
                  className={`player-chip ${p.id === gameState.winnerPlayerId ? 'is-active' : ''}`}
                >
                  {p.name} : <strong>{gameState.scores?.[p.id] || 0} pts</strong>
                </span>
              ))}
            </div>
            {isHost && (
              <CartoonButton
                id="motus-restart-game-btn"
                variant="primary"
                onClick={() => send('motus/start', { playerId, totalRounds })}
                style={{ marginTop: 12 }}
              >
                🔄 Rejouer une partie
              </CartoonButton>
            )}
          </div>
        ) : phase === 'ROUND_RESOLVED' ? (
          <div className="motus-result-card">
            <span style={{ fontSize: '1.8rem' }}>📖</span>
            <h3 style={{ margin: 0, color: '#2d3436' }}>Le mot secret était :</h3>
            <div className="motus-word-reveal">{gameState.secretWord}</div>
            <p style={{ margin: '4px 0', fontSize: '1.05rem', fontWeight: 700 }}>
              {isFound ? '🎉 Tu as brillamment trouvé le mot !' : '💥 Aïe, mot non trouvé sur cette manche !'}
            </p>
            {isHost ? (
              <CartoonButton
                id="motus-next-round-btn"
                variant="primary"
                onClick={() => send('motus/next', { playerId })}
                style={{ marginTop: 10 }}
              >
                {gameState.roundNumber >= gameState.totalRounds ? '🏆 Voir le podium' : '➡️ Mot suivant'}
              </CartoonButton>
            ) : (
              <p className="hint footer-hint">L'hôte va lancer le mot suivant…</p>
            )}
          </div>
        ) : (
          <>
            {/* GRILLE PRINCIPALE 6 LIGNES */}
            <div className="motus-grid-container">
              {Array.from({ length: 6 }).map((_, rIdx) => {
                const isAttemptDone = rIdx < myAttempts.length
                const isCurrentRow = rIdx === myAttempts.length && !isFinished
                const attemptData = myAttempts[rIdx]

                return (
                  <div
                    key={rIdx}
                    className={`motus-row ${isCurrentRow && shakeCurrentRow ? 'shake' : ''}`}
                  >
                    {Array.from({ length: wordLength }).map((__, cIdx) => {
                      let char = '.'
                      let status = ''

                      if (isAttemptDone) {
                        char = attemptData.word[cIdx] || ''
                        status = attemptData.statuses[cIdx] || ''
                      } else if (isCurrentRow) {
                        if (cIdx < currentInput.length) {
                          char = currentInput[cIdx]
                        } else if (cIdx === 0) {
                          char = firstLetter
                        } else if (knownLetters[cIdx]) {
                          char = knownLetters[cIdx]
                        }
                      } else if (cIdx === 0) {
                        char = firstLetter
                      } else if (knownLetters[cIdx]) {
                        char = knownLetters[cIdx]
                      }

                      return (
                        <div
                          key={cIdx}
                          className={`motus-cell ${status} ${isAttemptDone ? 'flip' : ''} ${cIdx === currentInput.length - 1 && isCurrentRow ? 'pop' : ''}`}
                          style={{
                            animationDelay: isAttemptDone ? `${cIdx * 90}ms` : '0ms'
                          }}
                        >
                          {char !== '.' ? char : ''}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* MESSAGE D'ERREUR */}
            {error && (
              <div className="lobby-error-banner" style={{ margin: '4px 0' }} role="alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* STATUS DU JOUEUR */}
            {isFinished && (
              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <span className={`synapse-badge-hero`} style={{ background: isFound ? '#2ed573' : '#eb2f06' }}>
                  {isFound ? '🎉 Mot trouvé ! En attente des adversaires…' : '❌ 6 essais terminés ! En attente…'}
                </span>
                {isHost && (
                  <CartoonButton
                    id="motus-force-next-btn"
                    variant="secondary"
                    onClick={() => send('motus/next', { playerId })}
                    style={{ marginTop: 8 }}
                  >
                    ⏭️ Clôturer la manche
                  </CartoonButton>
                )}
              </div>
            )}

            {/* CLAVIER TACTILE AZERTY */}
            {!isFinished && (
              <div className="motus-keyboard">
                {KEYBOARD_ROWS.map((row, rIdx) => (
                  <div key={rIdx} className="motus-keyboard-row">
                    {row.map(k => {
                      if (k === 'ENTER') {
                        return (
                          <button
                            key={k}
                            id="motus-enter-btn"
                            type="button"
                            className="motus-key action-key enter-key"
                            onClick={() => handleKeyPress('ENTER')}
                          >
                            ↵
                          </button>
                        )
                      }
                      if (k === 'BACKSPACE') {
                        return (
                          <button
                            key={k}
                            id="motus-backspace-btn"
                            type="button"
                            className="motus-key action-key"
                            onClick={() => handleKeyPress('BACKSPACE')}
                          >
                            ⌫
                          </button>
                        )
                      }
                      const keyColor = keyStatuses[k] || ''
                      return (
                        <button
                          key={k}
                          id={`motus-key-${k}`}
                          type="button"
                          className={`motus-key ${keyColor}`}
                          onClick={() => handleKeyPress(k)}
                        >
                          {k}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </GameLayout>
  )
}
