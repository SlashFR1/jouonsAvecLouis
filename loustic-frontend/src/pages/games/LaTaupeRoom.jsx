import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.purple

export default function LaTaupeRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [suspectId, setSuspectId] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    switch (evt.type) {
      case 'TAUPE_GAME_STARTED':
        setGameState(evt.payload)
        setRevealed(false)
        setSuspectId(null)
        setError(null)
        break
      case 'TAUPE_DISCUSSION_PHASE':
      case 'TAUPE_VOTING_PHASE':
      case 'TAUPE_VOTE_CAST':
      case 'TAUPE_RESULTS':
        setGameState(evt.payload)
        break
      case 'TAUPE_ERROR':
        setError(evt.payload.message)
        break
      default:
    }
  }, [])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent)

  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – La taupe – Loustic` : 'La taupe – Loustic'
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('lataupe', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/lataupe/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async code => {
    setBusy(true)
    setError(null)
    try {
      const r = await joinRoom(code, playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/lataupe/${r.code}`, { replace: true })
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

  const isHost = room?.hostId === playerId
  const myWord = gameState?.playerWords?.[playerId]
  const hasVoted = Boolean(gameState?.votes?.[playerId])

  if (!room || !gameState || gameState.phase === 'LOBBY') {
    return (
      <GameLayout gameKey="lataupe" title="La taupe 🔍" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="La taupe 📲"
          emoji="🔍"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={3}
          startLabel="🔍 Distribuer les mots secrets"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('taupe/start', { playerId })}
        />
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  // 1. Phase Rôles secrets
  if (gameState.phase === 'ROLES') {
    return (
      <GameLayout
        gameKey="lataupe"
        title="Mot Secret 🤫"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          isHost ? (
            <CartoonButton id="start-discuss-btn" onClick={() => send('taupe/discuss', { playerId })}>
              🗣️ Lancer le débat
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">L’hôte va lancer le tour de table…</p>
          )
        }
      >
        <section className="game-stage-card stage-pop">
          <h2>Regarde ton mot discrètement !</h2>
          <div className="secret-word-box">
            {revealed ? (
              <p className="word-display">{myWord}</p>
            ) : (
              <button type="button" className="btn-cta btn-secondary" onClick={() => setRevealed(true)}>
                👁️ Toucher pour voir mon mot
              </button>
            )}
          </div>
          <p className="hint">Ne montre ton écran à personne !</p>
        </section>
      </GameLayout>
    )
  }

  // 2. Phase Débat
  if (gameState.phase === 'DISCUSSION') {
    return (
      <GameLayout
        gameKey="lataupe"
        title="Débat & Indices 🗣️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          isHost ? (
            <CartoonButton id="start-vote-btn" onClick={() => send('taupe/vote-phase', { playerId })}>
              🗳️ Passer au vote
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">L’hôte lancera le vote après le débat…</p>
          )
        }
      >
        <section className="game-stage-card">
          <div className="stage-spinner">🕵️</div>
          <h2>Chacun donne 1 indice !</h2>
          <p>
            Chaque joueur dit un mot ou une courte phrase décrivant son mot secret, sans le prononcer directement.
          </p>
          <div className="secret-reminder">
            <span className="hint">Rappel de ton mot : <strong>{myWord}</strong></span>
          </div>
        </section>
      </GameLayout>
    )
  }

  // 3. Phase de Vote
  if (gameState.phase === 'VOTING') {
    return (
      <GameLayout
        gameKey="lataupe"
        title="Qui est la Taupe ? 🗳️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          !hasVoted ? (
            <CartoonButton
              id="confirm-vote-btn"
              disabled={!suspectId}
              onClick={() => send('taupe/vote', { playerId, suspectId })}
            >
              Voter contre ce joueur 🫵
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">Vote envoyé ! En attente des autres joueurs…</p>
          )
        }
      >
        <section className="game-stage-card">
          <h2>Désigne ton suspect :</h2>
          <div className="suspects-list">
            {room.players.map(p => (
              <button
                key={p.id}
                type="button"
                disabled={p.id === playerId || hasVoted}
                className={`suspect-btn ${suspectId === p.id ? 'selected' : ''}`}
                onClick={() => setSuspectId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>
      </GameLayout>
    )
  }

  // 4. Résultats
  const molePlayer = room.players.find(p => p.id === gameState.molePlayerId)
  const unmaskedPlayer = room.players.find(p => p.id === gameState.unmaskedPlayerId)

  return (
    <GameLayout
      gameKey="lataupe"
      title="Révélation ! 🎭"
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={
        isHost ? (
          <CartoonButton id="taupe-replay-btn" onClick={() => send('taupe/start', { playerId })}>
            🔁 Nouvelle manche
          </CartoonButton>
        ) : (
          <CartoonButton onClick={handleQuit}>Quitter</CartoonButton>
        )
      }
    >
      <section className="game-stage-card stage-pop">
        <div className="boom-burst">{gameState.moleWon ? '🦔' : '🏆'}</div>
        <h2>{gameState.moleWon ? 'La Taupe a gagné !' : 'La Taupe a été démasquée !'}</h2>
        <div className="verdict-box">
          <p>Le groupe a voté contre : <strong>{unmaskedPlayer?.name || 'Personne'}</strong></p>
          <p>La vraie Taupe était : <strong>{molePlayer?.name}</strong> !</p>
        </div>
        <div className="words-reveal">
          <p>Mot de la majorité : <strong>{gameState.majorityWord}</strong></p>
          <p>Mot de la Taupe : <strong>{gameState.moleWord}</strong></p>
        </div>
      </section>
    </GameLayout>
  )
}
