import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomQRCode from '../../components/common/RoomQRCode'
import BombVisual from '../../components/games/BombVisual'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import { bombAudio } from '../../utils/bombAudio'

const COLOR = CARD_COLORS.red

/**
 * Boom boom (La Bombe) multi-téléphones sous React + Spring Boot WebSocket :
 * - FSM : LOBBY -> THEME_DRAW -> TICKING -> EXPLODED -> GAGE_RESOLVED
 * - Compte à rebours secret T ∈ [18s, 40s] côté serveur (aucun joueur ne sait quand ça explose)
 * - Mèche et bombe animée, tic-tac sonore synchronisé qui s'accélère
 * - Explosion plein écran avec attribution automatique et gage immédiat
 */
export default function BombRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [bombState, setBombState] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [joinCode, setJoinCode] = useState(urlCode ?? '')

  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    const p = evt.payload || {}

    switch (evt.type) {
      case 'BOMB_THEME_DRAW':
      case 'BOMB_STARTED':
        setError(null)
        setBombState({
          phase: 'THEME_DRAW',
          theme: p.theme,
          activePlayerId: p.activePlayerId || p.firstPlayerId || p.holderId,
          activePlayerName: p.activePlayerName || p.firstPlayerName,
          passCount: 0,
        })
        bombAudio.unlock()
        break

      case 'BOMB_TICKING':
        setError(null)
        setBombState(prev => ({
          ...prev,
          phase: 'TICKING',
          theme: p.theme || prev?.theme,
          activePlayerId: p.activePlayerId || p.holderId,
          activePlayerName: p.activePlayerName,
          passCount: p.passCount ?? 0,
        }))
        bombAudio.startTicking(1.0)
        break

      case 'ACTIVE_PLAYER_CHANGED':
      case 'BOMB_PASSED':
        setBombState(prev => ({
          ...prev,
          phase: 'TICKING',
          activePlayerId: p.activePlayerId || p.holderId,
          activePlayerName: p.activePlayerName,
          passCount: p.passCount ?? ((prev?.passCount || 0) + 1),
          theme: p.theme || prev?.theme,
        }))
        bombAudio.speedUp(0.12)
        break

      case 'BOMB_EXPLODED':
        setBombState(prev => ({
          ...prev,
          phase: 'EXPLODED',
          victimId: p.victimId || p.loserId,
          victimName: p.victimName || p.loserName,
          gage: p.gage,
          theme: p.theme || prev?.theme,
          passCount: p.passCount || prev?.passCount || 0,
        }))
        bombAudio.playBoom()
        break

      case 'BOMB_GAGE_RESOLVED':
        setBombState(prev => ({
          ...prev,
          phase: 'GAGE_RESOLVED',
        }))
        break

      case 'BOMB_ERROR':
        setError(p.message || 'Une erreur est survenue.')
        break

      default:
        break
    }
  }, [])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent)

  // Arrivée directe via URL partagée
  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Boom boom 💣 – Loustic` : 'Boom boom en ligne 💣 – Loustic'
    return () => bombAudio.stop()
  }, [room])

  const run = async fn => {
    if (!playerName.trim()) return setError('Choisis un pseudo d’abord !')
    bombAudio.unlock()
    setBusy(true)
    setError(null)
    try {
      const r = await fn()
      setRoom(r)
      navigate(`/salle/bomb/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'Backend injoignable (Spring Boot est-il lancé ?)' : e.message)
    } finally {
      setBusy(false)
    }
  }

  const quit = () => {
    bombAudio.stop()
    if (room) leaveRoom(room.code, playerId).catch(() => {})
    navigate('/?mode=multi')
  }

  const isHost = room?.hostId === playerId
  const holdsBomb = bombState?.phase === 'TICKING' && bombState?.activePlayerId === playerId
  const isVictim = bombState?.victimId === playerId

  const handleStart = () => {
    bombAudio.unlock()
    send('bomb/start', { playerId })
  }

  const handlePass = () => {
    if (!holdsBomb) return
    send('bomb/pass', { playerId })
  }

  const handleResolveGage = () => {
    send('bomb/resolve', { playerId })
  }

  // ---------- Écran 1 : pseudo + créer / rejoindre ----------
  if (!room) {
    return (
      <GameLayout gameKey="bomb" title="Boom boom 💣" color={COLOR} backTo="/?mode=multi">
        <section className="game-stage-card lobby-card">
          <div className="bomb-emoji bomb-idle" aria-hidden="true">💣</div>
          <h2>Boom boom multi-téléphones</h2>
          <p className="hint">
            Un compte à rebours secret tourne. Dès que la bombe arrive sur ton téléphone, cite un mot du thème et passe-la vite !
          </p>

          <label className="field-label" htmlFor="pseudo-input">Ton pseudo</label>
          <input
            id="pseudo-input"
            type="text"
            maxLength={20}
            value={playerName}
            placeholder="Ex : Louis"
            onChange={e => setPlayerName(e.target.value)}
          />

          <CartoonButton
            id="create-room-btn"
            disabled={busy}
            onClick={() => run(() => createRoom('bomb', playerId, playerName.trim()))}
          >
            🏠 Créer une salle
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
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
            />
            <CartoonButton
              id="join-room-btn"
              variant="secondary"
              disabled={busy || joinCode.length !== 5}
              onClick={() => run(() => joinRoom(joinCode, playerId, playerName.trim()))}
            >
              Rejoindre
            </CartoonButton>
          </div>

          {error && <p className="error-text" role="alert">{error}</p>}
        </section>
      </GameLayout>
    )
  }

  const statusIndicator = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  // ---------- Écran 2 : Jeu en cours (THEME_DRAW, TICKING, EXPLODED, GAGE_RESOLVED) ----------
  const isGameActive = bombState && ['THEME_DRAW', 'TICKING', 'EXPLODED', 'GAGE_RESOLVED'].includes(bombState.phase)

  if (isGameActive) {
    const isThemeDraw = bombState.phase === 'THEME_DRAW'
    const isTicking = bombState.phase === 'TICKING'
    const isExploded = bombState.phase === 'EXPLODED'

    const footer = isTicking && holdsBomb ? (
      <CartoonButton id="pass-bomb-btn" variant="danger" onClick={handlePass}>
        ⚡ MOT DIT ! PASSER LA BOMBE AU SUIVANT 📲
      </CartoonButton>
    ) : isExploded && isHost ? (
      <CartoonButton id="replay-btn" onClick={handleStart}>
        🔄 Relancer une manche ({room.players.length} joueurs)
      </CartoonButton>
    ) : null

    return (
      <GameLayout gameKey="bomb" title={`Salle ${room.code}`} color={COLOR} right={statusIndicator} onBack={quit} footer={footer}>
        <section
          key={bombState.activePlayerId}
          className={`game-stage-card stage-pop ${holdsBomb ? 'bomb-active' : 'bomb-waiting'}`}
        >
          {/* Tag de phase */}
          <span className="stage-tag">
            {isThemeDraw ? '🎲 Tirage du thème...' : holdsBomb ? '🔥 TU AS LA BOMBE !' : `Bombe chez ${bombState.activePlayerName || '???'}`}
          </span>

          {/* Thème imposé */}
          <div className="prompt-envelope" style={{ margin: '8px 0', minHeight: '80px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff4757', textTransform: 'uppercase' }}>
              Thème :
            </span>
            <h2 className="word-display" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.85rem)', margin: '4px 0' }}>
              {bombState.theme || 'Thème en cours...'}
            </h2>
          </div>

          {/* Composant Visuel Bombe Animée (Mèche qui brûle, vibrations, étincelles) */}
          <BombVisual
            isTicking={isTicking}
            isExploded={isExploded}
            holdsBomb={holdsBomb}
            passCount={bombState.passCount}
            victimName={bombState.victimName}
            isVictim={isVictim}
            gage={bombState.gage}
            onReplay={handleStart}
            onResolve={handleResolveGage}
            isHost={isHost}
          />

          {isTicking && !holdsBomb && (
            <div style={{ marginTop: '12px' }}>
              <h3 style={{ margin: '4px 0', color: '#57606f' }}>
                La bombe est entre les mains de <strong>{bombState.activePlayerName || 'ton adversaire'}</strong>...
              </h3>
              <p className="hint">Prépare déjà une idée de mot au cas où elle arrive chez toi !</p>
            </div>
          )}

          {isTicking && holdsBomb && (
            <p className="hint" style={{ color: '#ff4757', fontWeight: 700, margin: '8px 0 0 0' }}>
              Donne vite un mot à voix haute et appuie sur « PASSER LA BOMBE » !
            </p>
          )}

          {/* Liste des participants */}
          <div className="player-chips" style={{ marginTop: '14px' }}>
            {room.players.map(p => {
              const hasIt = p.id === bombState.activePlayerId
              return (
                <span
                  key={p.id}
                  className={`player-chip ${p.id === playerId ? 'is-me' : ''} ${hasIt ? 'is-active-turn' : ''}`}
                  style={hasIt ? { border: '2.5px solid #ff4757', background: '#ffebee', fontWeight: 800 } : {}}
                >
                  {hasIt && '💣 '}
                  {p.id === room.hostId && '👑 '}
                  {p.name}
                </span>
              )
            })}
          </div>
        </section>
      </GameLayout>
    )
  }

  // ---------- Écran 3 : Salle d'attente (LOBBY) ----------
  const shareUrl = `${window.location.origin}/salle/bomb/${room.code}`

  return (
    <GameLayout
      gameKey="bomb"
      title={`Salle ${room.code}`}
      color={COLOR}
      right={statusIndicator}
      onBack={quit}
      footer={
        isHost ? (
          <CartoonButton
            id="start-bomb-btn"
            disabled={!connected || room.players.length < 2}
            onClick={handleStart}
          >
            💣 Allumer la mèche ({room.players.length} joueurs)
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">L’hôte ({room.players.find(p => p.id === room.hostId)?.name || 'Hôte'}) va allumer la mèche…</p>
        )
      }
    >
      <section className="game-stage-card lobby-card">
        <span className="stage-tag">Code de la salle</span>
        <button
          id="copy-code-btn"
          type="button"
          className="room-code"
          title="Copier le code"
          onClick={() => navigator.clipboard?.writeText(room.code)}
        >
          {room.code}
        </button>

        {/* QR Code pour rejoindre d'un seul scan caméra */}
        <RoomQRCode url={shareUrl} code={room.code} />

        <p className="hint">Faites scanner ce QR Code ou entrez le code à 5 lettres pour rejoindre.</p>

        <div className="player-chips">
          {room.players.map(p => (
            <span key={p.id} className={`player-chip ${p.id === playerId ? 'is-me' : ''}`}>
              {p.id === room.hostId && '👑 '}{p.name}
            </span>
          ))}
        </div>

        {room.players.length < 2 && (
          <p className="hint" style={{ color: '#e17055' }}>
            ⚠️ En attente d’au moins un 2ème joueur pour lancer !
          </p>
        )}

        {error && <p className="error-text" role="alert">{error}</p>}
      </section>
    </GameLayout>
  )
}
