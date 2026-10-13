import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.green

export default function SpyRoom() {
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
      case 'SPY_GAME_STARTED':
        setGameState(evt.payload)
        setRevealed(false)
        setSuspectId(null)
        setError(null)
        break
      case 'SPY_DISCUSSION_PHASE':
      case 'SPY_VOTING_PHASE':
      case 'SPY_VOTE_CAST':
      case 'SPY_RESULTS':
        setGameState(evt.payload)
        break
      case 'SPY_ERROR':
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
    document.title = room ? `Salle ${room.code} – SPY – Loustic` : 'SPY – Loustic'
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('spy', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/spy/${r.code}`, { replace: true })
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
      navigate(`/salle/spy/${r.code}`, { replace: true })
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
  const myDisplay = gameState?.playerDisplays?.[playerId]
  const hasVoted = Boolean(gameState?.votes?.[playerId])

  if (!room || !gameState || gameState.phase === 'LOBBY') {
    return (
      <GameLayout gameKey="spy" title="SPY 🕵️" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="SPY 📲"
          emoji="🕵️"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={3}
          startLabel="🕵️ Attribuer les rôles et le lieu"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('spy/start', { playerId })}
        />
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  // 1. Découverte secrète du lieu / rôle
  if (gameState.phase === 'ROLES') {
    return (
      <GameLayout
        gameKey="spy"
        title="Ton Rôle Secret 🕵️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          isHost ? (
            <CartoonButton id="start-spy-discuss-btn" onClick={() => send('spy/discuss', { playerId })}>
              🗣️ Lancer l'interrogatoire
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">L’hôte va lancer la discussion…</p>
          )
        }
      >
        <section className="game-stage-card stage-pop">
          <h2>Regarde ton rôle :</h2>
          <div className="secret-word-box">
            {revealed ? (
              <p className="word-display">{myDisplay}</p>
            ) : (
              <button type="button" className="btn-cta btn-secondary" onClick={() => setRevealed(true)}>
                👁️ Révéler mon lieu secret
              </button>
            )}
          </div>
          <p className="hint">Les innocents connaissent le lieu. L'espion doit deviner où vous êtes !</p>
        </section>
      </GameLayout>
    )
  }

  // 2. Discussion & Interrogatoire
  if (gameState.phase === 'DISCUSSION') {
    return (
      <GameLayout
        gameKey="spy"
        title="Interrogatoire 🗣️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          isHost ? (
            <CartoonButton id="start-spy-vote-btn" onClick={() => send('spy/vote-phase', { playerId })}>
              🗳️ Passer au vote de l'Espion
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">Posez-vous des questions pour coincer l'espion…</p>
          )
        }
      >
        <section className="game-stage-card">
          <div className="stage-spinner">❓</div>
          <h2>Posez-vous des questions !</h2>
          <p>
            Posez-vous des questions à tour de rôle (ex: « Que portes-tu comme vêtements ici ? »). Si tu es l'espion, fais semblant de savoir où vous êtes !
          </p>
          <div className="secret-reminder">
            <span className="hint">Rappel : <strong>{myDisplay}</strong></span>
          </div>
        </section>
      </GameLayout>
    )
  }

  // 3. Vote contre l'espion
  if (gameState.phase === 'VOTING') {
    return (
      <GameLayout
        gameKey="spy"
        title="Qui est l'Espion ? 🗳️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
        footer={
          !hasVoted ? (
            <CartoonButton
              id="confirm-spy-vote-btn"
              disabled={!suspectId}
              onClick={() => send('spy/vote', { playerId, suspectId })}
            >
              Accuser ce joueur 🫵
            </CartoonButton>
          ) : (
            <p className="hint footer-hint">Accusation envoyée ! En attente des autres…</p>
          )
        }
      >
        <section className="game-stage-card">
          <h2>Qui est l'espion parmi vous ?</h2>
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
  const spyPlayer = room.players.find(p => p.id === gameState.spyPlayerId)
  const accusedPlayer = room.players.find(p => p.id === gameState.accusedPlayerId)

  return (
    <GameLayout
      gameKey="spy"
      title="Verdict Final 🎭"
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={
        isHost ? (
          <CartoonButton id="spy-replay-btn" onClick={() => send('spy/start', { playerId })}>
            🔁 Nouvelle manche
          </CartoonButton>
        ) : (
          <CartoonButton onClick={handleQuit}>Quitter</CartoonButton>
        )
      }
    >
      <section className="game-stage-card stage-pop">
        <div className="boom-burst">{gameState.spyUnmasked ? '🏆' : '🕵️'}</div>
        <h2>{gameState.spyUnmasked ? 'L’Espion a été démasqué !' : 'L’Espion vous a berné !'}</h2>
        <div className="verdict-box">
          <p>Le groupe a accusé : <strong>{accusedPlayer?.name || 'Personne'}</strong></p>
          <p>Le vrai espion était : <strong>{spyPlayer?.name}</strong> !</p>
          <p>Le lieu secret était : <strong>{gameState.location}</strong></p>
        </div>
      </section>
    </GameLayout>
  )
}
