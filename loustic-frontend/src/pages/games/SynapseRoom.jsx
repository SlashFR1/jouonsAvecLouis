import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import '../../styles/synapse-visual.css'

const COLOR = CARD_COLORS.blue

export default function SynapseRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()

  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [isRisky, setIsRisky] = useState(false)
  const [refereeAnswer, setRefereeAnswer] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Gestion des événements STOMP publics
  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    switch (evt.type) {
      case 'SYNAPSE_ROUND_STARTED':
        setGameState(evt.payload)
        setSelectedLevel(1)
        setIsRisky(false)
        setRefereeAnswer(null)
        setError(null)
        break
      case 'SYNAPSE_QUESTION_DISPLAYED':
      case 'SYNAPSE_ROUND_RESOLVED':
      case 'SYNAPSE_BONUS_TRIGGERED':
      case 'SYNAPSE_GAME_OVER':
      case 'SYNAPSE_STATE_UPDATED':
        setGameState(evt.payload)
        break
      case 'SYNAPSE_ERROR':
        setError(evt.payload?.message || 'Erreur inconnue')
        break
      default:
    }
  }, [])

  // Écoute de la réponse officielle sur le canal secret des arbitres
  const extraSubscriptions = useMemo(() => {
    if (!room?.code) return {}
    return {
      [`/topic/room/${room.code}/synapse/referee`]: (data) => {
        if (data?.officialAnswer) setRefereeAnswer(data.officialAnswer)
      },
      [`/topic/synapse/${room.code}/referee`]: (data) => {
        if (data?.officialAnswer) setRefereeAnswer(data.officialAnswer)
      },
    }
  }, [room?.code])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Synapse – Loustic` : 'Synapse – Loustic'
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('synapse', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/synapse/${r.code}`, { replace: true })
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
      navigate(`/salle/synapse/${r.code}`, { replace: true })
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
  const phase = gameState?.phase || 'LOBBY'
  const isActivePlayer = gameState?.activePlayerId === playerId
  const activePlayerName = gameState?.activePlayerName || 'Joueur actif'
  const targetScore = gameState?.targetScore || 30

  // Actions
  const handleSelectLevel = () => {
    if (!isActivePlayer) return
    send('synapse/select-level', { playerId, level: selectedLevel, isRisky })
  }

  const handleValidate = (success) => {
    send('synapse/validate', { playerId, success })
  }

  const handleNextTurn = () => {
    send('synapse/next', { playerId })
  }

  // Écran d'attente / lobby
  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="synapse" title="Synapse ⚡" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Synapse ⚡ (TTMC)"
          emoji="⚡"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={2}
          startLabel="⚡ Lancer le duel de culture !"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('synapse/start', { playerId, targetScore: 30, bonusMode: true })}
        />
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  const activeScore = gameState?.scores?.[gameState?.activePlayerId] || 0
  const activeStreak = gameState?.streaks?.[gameState?.activePlayerId] || 0

  const footer = (
    <>
      {phase === 'LEVEL_SELECTION' && (
        isActivePlayer ? (
          <CartoonButton
            id="synapse-confirm-level-btn"
            variant="primary"
            onClick={handleSelectLevel}
          >
            🎯 Valider mon auto-évaluation ({selectedLevel}/10)
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">
            ⚡ {activePlayerName} choisit son niveau d'auto-évaluation…
          </p>
        )
      )}

      {phase === 'PEER_VALIDATION' && (
        isActivePlayer ? (
          <p className="hint footer-hint">
            🗣️ Donne ta réponse à voix haute ! La table valide sur son écran…
          </p>
        ) : (
          <p className="hint footer-hint">
            ⚖️ Écoute {activePlayerName} puis valide ci-dessus selon la réponse officielle !
          </p>
        )
      )}

      {(phase === 'ROUND_RESULT' || phase === 'BONUS_CHALLENGE') && (
        <CartoonButton id="synapse-next-btn" onClick={handleNextTurn}>
          📲 Tour suivant ➡️
        </CartoonButton>
      )}

      {phase === 'GAME_OVER' && isHost && (
        <CartoonButton id="synapse-restart-btn" onClick={handleNextTurn}>
          🔄 Relancer une partie
        </CartoonButton>
      )}
    </>
  )

  return (
    <GameLayout
      gameKey="synapse"
      title={`Tour de ${activePlayerName} – Manche ${gameState.roundNumber}`}
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={footer}
    >
      <section className="synapse-stage">
        {/* PODIUM / FIN DE PARTIE */}
        {phase === 'GAME_OVER' ? (
          <div className="synapse-card" style={{ background: '#fef08a', borderColor: '#ca8a04' }}>
            <span style={{ fontSize: '3rem' }}>👑</span>
            <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.8rem', color: '#854d0e', margin: '8px 0' }}>
              VICTOIRE SUPRÊME !
            </h2>
            <p style={{ fontWeight: 800, fontSize: '1.25rem', color: '#713f12' }}>
              {gameState.winnerPlayerName} atteint {gameState.scores?.[gameState.winnerPlayerId] || targetScore} points et remporte Synapse !
            </p>
            <div className="player-chips" style={{ justifyContent: 'center', marginTop: 16 }}>
              {room.players.map(p => (
                <span
                  key={p.id}
                  className={`player-chip ${p.id === gameState.winnerPlayerId ? 'is-active' : ''}`}
                >
                  {p.name} : <strong>{gameState.scores?.[p.id] || 0} pts</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* CARTE D'ÉVALUATION & QUESTION */}
            <div className="synapse-card">
              {/* Entête avec badge joueur actif et streak */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span className={`synapse-badge-hero ${isActivePlayer ? 'synapse-level-indicator' : ''}`} style={{ margin: 0 }}>
                  {isActivePlayer ? '🎯 C’EST TON TOUR' : `👤 Tour de ${activePlayerName}`}
                </span>
                {activeStreak > 0 && (
                  <span className="synapse-streak-badge">
                    🔥 Série de {activeStreak}
                  </span>
                )}
              </div>

              {/* JAUGE VERS LE SCORE CIBLE */}
              <div style={{ margin: '14px 0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
                  <span>Score : {activeScore} pts</span>
                  <span>Cible : {targetScore} pts</span>
                </div>
                <div className="synapse-progress-track">
                  <div
                    className="synapse-progress-fill"
                    style={{ width: `${Math.min(100, Math.round((activeScore / targetScore) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 1. PHASE DE CHOIX DU NIVEAU */}
              {phase === 'LEVEL_SELECTION' && (
                <div>
                  {/* EN-TÊTE DU THÈME MIS EN VALEUR */}
                  <div style={{
                    background: '#fef08a',
                    border: '3.5px solid #ca8a04',
                    borderRadius: '18px',
                    padding: '16px 14px',
                    margin: '10px 0 16px',
                    textAlign: 'center',
                    boxShadow: '0 6px 0 #ca8a04',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      background: '#ca8a04',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      padding: '3px 12px',
                      borderRadius: '999px',
                      marginBottom: '6px',
                      letterSpacing: '1px'
                    }}>
                      🏷️ THÈME DE LA MANCHE
                    </span>
                    <h3 style={{
                      fontFamily: 'Carter One, Fredoka, cursive',
                      fontSize: '1.6rem',
                      margin: '2px 0 6px',
                      color: '#713f12',
                      lineHeight: 1.2
                    }}>
                      {gameState.theme || 'Culture Générale 🧠'}
                    </h3>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#854d0e' }}>
                      Tu te mets combien de <strong>1 à 10</strong> en <em>{gameState.theme || 'ce sujet'}</em> ?
                    </p>
                  </div>


                  {/* Grille de 1 à 10 */}
                  <div className="synapse-level-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        disabled={!isActivePlayer}
                        className={`level-btn ${selectedLevel === lvl ? 'is-active' : ''}`}
                        onClick={() => setSelectedLevel(lvl)}
                      >
                        <span>{lvl}</span>
                        <span className="level-pts">+{lvl} pts</span>
                      </button>
                    ))}
                  </div>

                  {/* Mode Risqué */}
                  {isActivePlayer && (
                    <div
                      role="button"
                      tabIndex={0}
                      className={`synapse-risky-toggle ${isRisky ? 'is-active' : ''}`}
                      onClick={() => setIsRisky(prev => !prev)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsRisky(prev => !prev)
                        }
                      }}
                    >
                      <div className="risky-toggle-title">
                        <span>⚡ Mode Risqué</span>
                        {isRisky && <span className="synapse-badge-hero synapse-risky-badge" style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem' }}>ACTIVÉ</span>}
                      </div>
                      <div className="risky-toggle-desc">
                        {isRisky ? `Doubler (+${2 * selectedLevel} pts) ou Malus (-${selectedLevel} pts)` : 'Clique pour doubler tes points'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PHASE DE QUESTION & ARBITRAGE */}
              {phase === 'PEER_VALIDATION' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0 12px' }}>
                    <span className="synapse-badge-hero synapse-level-indicator">
                      Niveau {gameState.selectedLevel} / 10
                    </span>
                    {gameState.isRisky && (
                      <span className="synapse-badge-hero synapse-risky-badge">
                        ⚡ RISQUÉ (+{2 * gameState.selectedLevel} / -{gameState.selectedLevel})
                      </span>
                    )}
                  </div>

                  <p className="synapse-question-title">
                    {gameState.questionText}
                  </p>

                  {/* VUE ARBITRE : Réponse officielle + Boutons ✅ / ❌ */}
                  {!isActivePlayer ? (
                    <div className="synapse-referee-box">
                      <span className="referee-answer-label">📖 Réponse officielle (Secret des arbitres)</span>
                      <p className="referee-answer-text">
                        {refereeAnswer || 'En attente de transmission…'}
                      </p>
                      <div className="referee-actions-grid">
                        <CartoonButton
                          id="synapse-correct-btn"
                          variant="success"
                          onClick={() => handleValidate(true)}
                        >
                          ✅ Correct (+{gameState.isRisky ? 2 * gameState.selectedLevel : gameState.selectedLevel} pts)
                        </CartoonButton>
                        <CartoonButton
                          id="synapse-fail-btn"
                          variant="danger"
                          onClick={() => handleValidate(false)}
                        >
                          ❌ Raté ({gameState.isRisky ? `-${gameState.selectedLevel}` : '0'} pt)
                        </CartoonButton>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 16, border: '2px dashed #94a3b8', marginTop: 12 }}>
                      <p style={{ margin: 0, fontWeight: 800, color: '#334155' }}>
                        🗣️ Réponds à voix haute devant tout le monde !
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Les autres joueurs arbitrent sur leur téléphone.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. DÉFI BONUS SURPRISE */}
              {phase === 'BONUS_CHALLENGE' && (
                <div className="synapse-bonus-card">
                  <h3 className="synapse-bonus-title">🎉 DÉFI BONUS DÉBLOQUÉ !</h3>
                  <p style={{ margin: '0 0 12px', fontWeight: 800, color: '#854d0e' }}>
                    Série de 4 réussites consécutives pour {activePlayerName} !
                  </p>
                  <p className="synapse-bonus-text">
                    {gameState.bonusText || 'Réalise un défi surprise désigné par la table !'}
                  </p>
                </div>
              )}

              {/* 4. RÉSULTAT DU TOUR */}
              {phase === 'ROUND_RESULT' && (
                <div style={{
                  background: gameState.lastWasSuccess ? '#dcfce7' : '#fee2e2',
                  borderColor: gameState.lastWasSuccess ? '#16a34a' : '#ef4444',
                  borderWidth: 3,
                  borderStyle: 'solid',
                  borderRadius: 20,
                  padding: 18,
                  marginTop: 12
                }}>
                  <p style={{
                    fontFamily: 'Carter One, cursive',
                    fontSize: '1.35rem',
                    color: gameState.lastWasSuccess ? '#166534' : '#991b1b',
                    margin: '0 0 6px'
                  }}>
                    {gameState.lastWasSuccess ? '🎉 BRAVO, C’EST VALIDÉ !' : '💥 OUCH, C’EST RATÉ !'}
                  </p>
                  <p style={{ fontWeight: 800, margin: '4px 0', color: '#1e293b' }}>
                    {activePlayerName} marque <strong>{gameState.lastPointsDelta >= 0 ? `+${gameState.lastPointsDelta}` : gameState.lastPointsDelta} points</strong> !
                  </p>
                  {gameState.officialAnswer && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: '#475569' }}>
                      Réponse officielle : <strong>{gameState.officialAnswer}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* TABLEAU DES SCORES DES JOUEURS */}
            <div className="player-chips" style={{ marginTop: '12px' }}>
              {room.players.map(p => {
                const isPActive = p.id === gameState.activePlayerId
                const pStreak = gameState.streaks?.[p.id] || 0
                return (
                  <span
                    key={p.id}
                    className={`player-chip ${p.id === playerId ? 'is-active' : ''}`}
                  >
                    {isPActive ? '🎯 ' : ''}{p.name}
                    {pStreak >= 2 && ` 🔥${pStreak}`}
                    {' '}: <strong>{gameState.scores?.[p.id] || 0} / {targetScore} pts</strong>
                  </span>
                )
              })}
            </div>
          </>
        )}
      </section>
    </GameLayout>
  )
}
