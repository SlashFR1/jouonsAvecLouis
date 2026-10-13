import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import SevenSecRadialTimer from '../../components/games/SevenSecRadialTimer'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import { sevenSecAudio } from '../../utils/sevenSecAudio'
import '../../styles/seven-sec-visual.css'

const COLOR = CARD_COLORS.blue

export default function SevenSecRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const playedSoundRef = useRef({ gong: false, result: null })

  // Synchronisation des transitions audio
  const handleAudioEvents = useCallback((phase, success) => {
    if (phase === 'COUNTDOWN') {
      playedSoundRef.current.gong = false
      playedSoundRef.current.result = null
      sevenSecAudio.startUrgentCountdown(7000)
    } else if (phase === 'REFEREE_VOTE') {
      if (!playedSoundRef.current.gong) {
        playedSoundRef.current.gong = true
        sevenSecAudio.playGong()
      }
    } else if (phase === 'SCORE_UPDATE') {
      sevenSecAudio.stop()
      if (playedSoundRef.current.result !== success) {
        playedSoundRef.current.result = success
        if (success) {
          sevenSecAudio.playSuccess()
        } else {
          sevenSecAudio.playFail()
        }
      }
    } else {
      sevenSecAudio.stop()
    }
  }, [])

  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    switch (evt.type) {
      case '7SEC_DRAW':
      case '7SEC_TURN_READY':
        setGameState(evt.payload)
        handleAudioEvents('DRAW', null)
        setError(null)
        break
      case '7SEC_COUNTDOWN_STARTED':
      case '7SEC_TIMER_STARTED':
        setGameState(evt.payload)
        handleAudioEvents('COUNTDOWN', null)
        break
      case '7SEC_REFEREE_VOTE':
        setGameState(evt.payload)
        handleAudioEvents('REFEREE_VOTE', null)
        break
      case '7SEC_SCORE_UPDATE':
      case '7SEC_RESULT':
        setGameState(evt.payload)
        handleAudioEvents('SCORE_UPDATE', evt.payload?.lastSuccess)
        break
      case '7SEC_ERROR':
        setError(evt.payload?.message || 'Erreur inconnue')
        break
      default:
    }
  }, [handleAudioEvents])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent)

  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – 7 secondes – Loustic` : '7 secondes – Loustic'
    return () => sevenSecAudio.stop()
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('7sec', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/7sec/${r.code}`, { replace: true })
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
      navigate(`/salle/7sec/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleQuit = () => {
    sevenSecAudio.stop()
    if (room) leaveRoom(room.code, playerId).catch(() => {})
    navigate('/?mode=multi')
  }

  const isHost = room?.hostId === playerId
  const isActive = gameState?.activePlayerId === playerId
  const isReferee = gameState?.refereePlayerId === playerId
  const activePlayerName = room?.players.find(p => p.id === gameState?.activePlayerId)?.name || 'Joueur'
  const refereePlayerName = room?.players.find(p => p.id === gameState?.refereePlayerId)?.name || 'Arbitre'

  // Normalisation de la phase FSM
  const rawPhase = gameState?.phase || 'LOBBY'
  const phase = rawPhase === 'READY' ? 'DRAW' : rawPhase === 'RUNNING' ? 'COUNTDOWN' : rawPhase === 'RESULT' ? 'SCORE_UPDATE' : rawPhase

  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="7sec" title="7 secondes ⏱️" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="7 secondes 📲"
          emoji="⏱️"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={2}
          startLabel="⏱️ Démarrer la partie"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('7sec/start', { playerId })}
        />
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  const footer = (
    <>
      {phase === 'DRAW' && (
        isActive ? (
          <CartoonButton
            id="launch-7sec-btn"
            variant="primary"
            onClick={() => send('7sec/launch-timer', { playerId })}
          >
            🚀 Top Chrono (7.0s) !
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">En attente que {activePlayerName} lance son chrono…</p>
        )
      )}

      {phase === 'COUNTDOWN' && (
        isActive ? (
          <CartoonButton
            id="stop-early-7sec-btn"
            variant="warning"
            onClick={() => send('7sec/stop-timer', { playerId })}
          >
            🏁 J'ai cité mes 3 réponses !
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">Écoutez bien {activePlayerName} citer 3 éléments !</p>
        )
      )}

      {phase === 'REFEREE_VOTE' && (
        isActive ? (
          <p className="hint footer-hint">⚖️ La table et {refereePlayerName} votent ton résultat…</p>
        ) : (
          <div className="referee-buttons-grid" style={{ width: '100%' }}>
            <button
              id="7sec-fail-btn"
              type="button"
              className="referee-btn referee-btn-fail"
              onClick={() => send('7sec/vote', { playerId, success: false })}
            >
              <span>❌ Raté !</span>
              <span className="referee-btn-sub">Pénalité 1 gorgée</span>
            </button>
            <button
              id="7sec-win-btn"
              type="button"
              className="referee-btn referee-btn-success"
              onClick={() => send('7sec/vote', { playerId, success: true })}
            >
              <span>✅ Validé !</span>
              <span className="referee-btn-sub">+1 Point</span>
            </button>
          </div>
        )
      )}

      {phase === 'SCORE_UPDATE' && (
        (isHost || isReferee) ? (
          <CartoonButton id="7sec-next-btn" onClick={() => send('7sec/next', { playerId })}>
            📲 Tour suivant ➡️
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">En attente du joueur suivant…</p>
        )
      )}
    </>
  )

  return (
    <GameLayout
      gameKey="7sec"
      title={`Tour de ${activePlayerName}`}
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={footer}
    >
      <section className="game-stage-card stage-pop">
        {/* Rôles actifs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span className="stage-tag">🎯 Joueur : <strong>{activePlayerName}</strong></span>
          <span className="stage-tag" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#d97706' }}>
            ⚖️ Arbitre : <strong>{refereePlayerName}</strong>
          </span>
        </div>

        {/* Chrono radial 60fps haute précision */}
        <SevenSecRadialTimer
          isRunning={phase === 'COUNTDOWN'}
          duration={7.0}
          countdownEndsAt={gameState.countdownEndsAt}
          onComplete={() => {
            if (isActive || isHost) {
              send('7sec/stop-timer', { playerId })
            }
          }}
          phase={phase}
        />

        {/* Zone de carte & Intitulé */}
        <div className="seven-sec-prompt-card">
          <div className="theme-pill">🏷️ Thème : {gameState.theme || 'Général'}</div>

          {/* Confidentialité : le joueur actif voit le prompt, la table voit le thème en COUNTDOWN */}
          {phase === 'DRAW' || phase === 'COUNTDOWN' ? (
            isActive ? (
              <p className="prompt-text">
                {gameState.challenge || gameState.prompt}
              </p>
            ) : (
              <div className="secret-theme-banner">
                🤫 Défi secret pour <strong>{activePlayerName}</strong> !
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem' }}>
                  Écoutez bien ses 3 propositions dès que le chrono démarre !
                </p>
              </div>
            )
          ) : (
            // À partir de REFEREE_VOTE : tout le monde voit la question pour arbitrer
            <div>
              <p className="prompt-text">
                {gameState.challenge || gameState.prompt}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                (Question complète révélée à toute la table pour l’arbitrage)
              </p>
            </div>
          )}
        </div>

        {/* Interface d'arbitrage tactile pour les non-actifs pendant REFEREE_VOTE */}
        {phase === 'REFEREE_VOTE' && (
          <div className="referee-decision-card" style={{ width: '100%', maxWidth: '500px', margin: '8px auto 14px' }}>
            {isActive ? (
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                ⚖️ La table et {refereePlayerName} votent ton résultat…
              </p>
            ) : (
              <>
                <div className="referee-title">
                  <span>⚖️ Vote de la table / Arbitre :</span>
                </div>
                <div className="referee-buttons-grid" style={{ width: '100%', marginTop: '6px' }}>
                  <button
                    id="7sec-fail-btn"
                    type="button"
                    className="referee-btn referee-btn-fail"
                    onClick={() => send('7sec/vote', { playerId, success: false })}
                  >
                    <span>❌ Raté !</span>
                    <span className="referee-btn-sub">Gorgée 🍻</span>
                  </button>
                  <button
                    id="7sec-win-btn"
                    type="button"
                    className="referee-btn referee-btn-success"
                    onClick={() => send('7sec/vote', { playerId, success: true })}
                  >
                    <span>✅ Validé !</span>
                    <span className="referee-btn-sub">+1 Point 🏆</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Résultat & Gages */}
        {phase === 'SCORE_UPDATE' && (
          <div className="secret-theme-banner" style={{
            background: gameState.lastSuccess ? '#dcfce7' : '#fee2e2',
            borderColor: gameState.lastSuccess ? '#16a34a' : '#dc2626',
            color: gameState.lastSuccess ? '#166534' : '#991b1b',
          }}>
            {gameState.lastSuccess ? (
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                🎉 VALIDÉ ! +1 point attribué à {activePlayerName} !
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                🍻 RATÉ ! {activePlayerName} boit 1 gorgée de pénalité !
              </p>
            )}
          </div>
        )}

        {/* Tableau des scores en direct */}
        <div className="player-chips" style={{ marginTop: '14px' }}>
          {room.players.map(p => (
            <span
              key={p.id}
              className={`player-chip ${p.id === gameState.activePlayerId ? 'is-active' : ''}`}
            >
              {p.name} : <strong>{gameState.scores?.[p.id] || 0} pts</strong>
            </span>
          ))}
        </div>
      </section>
    </GameLayout>
  )
}
