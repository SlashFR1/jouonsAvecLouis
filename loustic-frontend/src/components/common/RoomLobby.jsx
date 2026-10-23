import { useState } from 'react'
import CartoonButton from './CartoonButton'
import RoomQRCode from './RoomQRCode'

/**
 * Composant de lobby partagé pour tous les jeux en salle multi-téléphones.
 * Écran 1 (avant entrée) : saisie du pseudo + Créer une salle / Rejoindre par code
 * Écran 2 (salle d'attente) : affichage du code, liste des joueurs, bouton hôte "Lancer"
 */
export default function RoomLobby({
  title,
  emoji,
  room,
  playerId,
  playerName,
  setPlayerName,
  connected,
  busy,
  error,
  onCreate,
  onJoin,
  onStart,
  minPlayers = 2,
  startLabel = '🚀 Lancer la partie',
}) {
  const [joinCode, setJoinCode] = useState('')
  const [localError, setLocalError] = useState(null)

  const handleCreate = () => {
    setLocalError(null)
    const trimmed = (playerName || '').trim()
    if (!trimmed) {
      setLocalError('⚠️ Choisis un pseudo ci-dessus pour créer une salle !')
      document.getElementById('pseudo-input')?.focus()
      return
    }
    onCreate?.()
  }

  const handleJoin = () => {
    setLocalError(null)
    const trimmed = (playerName || '').trim()
    if (!trimmed) {
      setLocalError('⚠️ Choisis un pseudo ci-dessus pour rejoindre !')
      document.getElementById('pseudo-input')?.focus()
      return
    }
    const code = (joinCode || '').trim().toUpperCase()
    if (code.length !== 5) {
      setLocalError('⚠️ Le code de salle doit comporter exactement 5 lettres !')
      document.getElementById('room-code-input')?.focus()
      return
    }
    onJoin?.(code)
  }

  const activeError = error || localError

  if (!room) {
    return (
      <section className="game-stage-card lobby-card">
        <div className="bomb-emoji bomb-idle" aria-hidden="true">{emoji}</div>
        <h2>{title}</h2>
        <label className="field-label" htmlFor="pseudo-input">Ton pseudo</label>
        <input
          id="pseudo-input"
          type="text"
          maxLength={20}
          value={playerName}
          placeholder="Ex : Louis"
          onChange={e => {
            setPlayerName(e.target.value)
            if (localError) setLocalError(null)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreate()
          }}
        />
        <CartoonButton
          id="create-room-btn"
          disabled={busy}
          onClick={handleCreate}
        >
          {busy ? '⏳ Création de la salle en cours…' : '🏠 Créer une salle'}
        </CartoonButton>
        <div className="lobby-divider"><span>ou</span></div>
        <div className="join-row">
          <input
            id="room-code-input"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={5}
            value={joinCode}
            placeholder="CODE"
            onChange={e => {
              setJoinCode(e.target.value.toUpperCase())
              if (localError) setLocalError(null)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleJoin()
            }}
          />
          <CartoonButton
            id="join-room-btn"
            variant="secondary"
            disabled={busy}
            onClick={handleJoin}
          >
            {busy ? '⏳ Connexion…' : 'Rejoindre'}
          </CartoonButton>
        </div>
        {activeError && (
          <div className="lobby-error-banner" role="alert">
            <span className="lobby-error-icon">⚠️</span>
            <span>{activeError}</span>
          </div>
        )}
      </section>
    )
  }

  const isHost = room.hostId === playerId
  const shareUrl = `${window.location.origin}/salle/${room.gameKey}/${room.code}`

  return (
    <section className="game-stage-card lobby-card">
      <span className="stage-tag">Code de la salle</span>
      <button
        id="copy-code-btn"
        type="button"
        className="room-code"
        title="Cliquer pour copier le lien"
        onClick={() => navigator.clipboard?.writeText(shareUrl)}
      >
        {room.code}
      </button>

      {/* QR Code pour rejoindre en un scan avec smartphone */}
      <RoomQRCode url={shareUrl} code={room.code} />

      <p className="hint">Scannez le QR code ou entrez le code à 5 lettres ci-dessus.</p>
      <div className="player-chips">
        {room.players.map(p => (
          <span key={p.id} className={`player-chip ${p.id === playerId ? 'is-me' : ''}`}>
            {p.id === room.hostId && '👑 '}{p.name}
          </span>
        ))}
      </div>
      {room.players.length < minPlayers ? (
        <p className="hint">En attente d’au moins {minPlayers} joueurs…</p>
      ) : isHost ? (
        <CartoonButton
          id="start-game-btn"
          disabled={!connected}
          onClick={onStart}
        >
          {!connected ? '⏳ Connexion au serveur en cours…' : `${startLabel} (${room.players.length} joueur${room.players.length > 1 ? 's' : ''})`}
        </CartoonButton>
      ) : (
        <p className="hint footer-hint">L’hôte va lancer la partie…</p>
      )}
      {error && (
        <div className="lobby-error-banner" role="alert">
          <span className="lobby-error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}
