import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import UnicornLivesBar from '../../components/games/UnicornLivesBar'
import SecretNumberCard from '../../components/games/SecretNumberCard'
import CaptainReorderList from '../../components/games/CaptainReorderList'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import { cmcAudio } from '../../utils/cmcAudio'
import '../../styles/classe-moica-visual.css'

const COLOR = CARD_COLORS.orange

export default function ClasseMoiCaRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [mySecretNumber, setMySecretNumber] = useState(null)
  const [orderedIds, setOrderedIds] = useState([])
  const [myOralText, setMyOralText] = useState('')
  const [hasSubmittedOral, setHasSubmittedOral] = useState(false)
  const [anchorZero, setAnchorZero] = useState('')
  const [anchorEleven, setAnchorEleven] = useState('')
  const [hotMode, setHotMode] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Gestion des effets sonores lors des révélations pas à pas
  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    switch (evt.type) {
      case 'CMC_ROUND_STARTED':
        setGameState(evt.payload)
        setOrderedIds([])
        setHasSubmittedOral(false)
        setMyOralText('')
        setAnchorZero('')
        setAnchorEleven('')
        setError(null)
        break
      case 'CMC_ANCHORS_UPDATED':
      case 'CMC_SUBMISSION_RECEIVED':
        setGameState(evt.payload)
        break
      case 'CMC_ORDERING_PHASE':
        setGameState(evt.payload)
        setOrderedIds(evt.payload.orderedPlayerIds || [])
        break
      case 'CMC_REVEAL_STARTED':
        setGameState(evt.payload)
        break
      case 'CMC_REVEAL_STEP':
        setGameState(evt.payload)
        if (evt.payload.lastStepError) {
          cmcAudio.playStepError()
        } else {
          cmcAudio.playStepSuccess()
        }
        break
      case 'CMC_ROUND_RESULTS':
        setGameState(evt.payload)
        break
      case 'CMC_GAME_OVER':
        setGameState(evt.payload)
        if (evt.payload.lives > 0) {
          cmcAudio.playVictory()
        } else {
          cmcAudio.playGameOver()
        }
        break
      case 'CMC_ERROR':
        setError(evt.payload?.message || 'Erreur inconnue')
        break
      default:
    }
  }, [])

  // Abonnement au canal confidentiel du chiffre secret
  const extraSubscriptions = useMemo(() => {
    if (!room?.code || !playerId) return {}
    return {
      [`/topic/cmc/${room.code}/player/${playerId}/number`]: (data) => {
        if (data && typeof data.secretNumber === 'number') {
          setMySecretNumber(data.secretNumber)
        }
      },
      [`/topic/room/${room.code}/number/${playerId}`]: (data) => {
        if (data && typeof data.secretNumber === 'number') {
          setMySecretNumber(data.secretNumber)
        }
      },
    }
  }, [room?.code, playerId])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName).then(setRoom).catch(e => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Classe moi ça – Loustic` : 'Classe moi ça – Loustic'
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('classemoica', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/classemoica/${r.code}`, { replace: true })
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
      navigate(`/salle/classemoica/${r.code}`, { replace: true })
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
  const isCaptain = gameState?.captainId === playerId
  const captainName = room?.players.find(p => p.id === gameState?.captainId)?.name || 'Le Capitaine'

  const rawPhase = gameState?.phase || 'LOBBY'
  const phase = rawPhase === 'SUBMITTING' ? 'ORAL_PROPOSALS' : rawPhase === 'ORDERING' ? 'CAPTAIN_ORDERING' : rawPhase === 'RESULTS' ? 'ROUND_RESULT' : rawPhase

  // Soumission de la proposition orale
  const handleSendOral = () => {
    send('cmc/submit', { playerId, text: myOralText || 'Prêt 🗣️' })
    setHasSubmittedOral(true)
  }

  // Définition des repères 0 et 11 par le Capitaine
  const handleSaveAnchors = () => {
    send('cmc/anchors', { playerId, anchorZero, anchorEleven })
  }

  // Validation de l'ordre par le Capitaine
  const handleValidateOrder = () => {
    if (!orderedIds.length || !isCaptain) return
    send('cmc/order', { playerId, order: orderedIds })
  }

  // Révélation d'un cran supplémentaire
  const handleRevealNext = () => {
    send('cmc/reveal-next', { playerId })
  }

  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="classemoica" title="Classe moi ça 🔢" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Classe moi ça 🔢"
          emoji="🥐"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={2}
          startLabel="🦄 Lancer l'aventure (5 manches)"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('cmc/start', { playerId, hotMode })}
        />

        {isHost && (
          <div style={{ maxWidth: '420px', margin: '14px auto', padding: '12px', background: '#fff', border: '3px solid #111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Mode Hot / NSFW 🔥</span>
            <input
              type="checkbox"
              id="hot-mode-toggle"
              checked={hotMode}
              onChange={(e) => setHotMode(e.target.checked)}
              style={{ width: '22px', height: '22px', cursor: 'pointer' }}
            />
          </div>
        )}
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  const currentThemeText = gameState.currentTheme || gameState.theme?.themeA || 'De la pire à la meilleure excuse de retard.'

  const footer = (
    <>
      {phase === 'ORAL_PROPOSALS' && (
        isCaptain ? (
          <p className="hint footer-hint">
            👑 Tu es le Capitaine : écoute les propositions des autres ({Object.keys(gameState.submissions || {}).length}/{Math.max(1, room.players.length - 1)}) !
          </p>
        ) : hasSubmittedOral ? (
          <p className="hint footer-hint">
            🗣️ Proposition enregistrée ! En attente des coéquipiers ({Object.keys(gameState.submissions || {}).length}/{Math.max(1, room.players.length - 1)})…
          </p>
        ) : (
          <CartoonButton id="cmc-oral-done-btn" onClick={handleSendOral}>
            🗣️ J'ai dit ma proposition !
          </CartoonButton>
        )
      )}

      {phase === 'CAPTAIN_ORDERING' && (
        isCaptain ? (
          <CartoonButton id="cmc-validate-order-btn" variant="success" onClick={handleValidateOrder}>
            ✅ Valider mon classement de 1 à 10
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">
            🧑‍✈️ Le Capitaine {captainName} classe la table du plus petit au plus grand…
          </p>
        )
      )}

      {phase === 'REVEAL_STEP_BY_STEP' && (
        (isCaptain || isHost) ? (
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <CartoonButton
              id="cmc-reveal-step-btn"
              variant="primary"
              disabled={gameState.revealedIndex >= (gameState.orderedPlayerIds?.length || 0)}
              onClick={handleRevealNext}
            >
              🔍 Révéler le chiffre suivant ({gameState.revealedIndex || 0}/{gameState.orderedPlayerIds?.length || 0})
            </CartoonButton>
          </div>
        ) : (
          <p className="hint footer-hint">
            🔍 Révélation suspense sur l'écran du Capitaine ({gameState.revealedIndex || 0}/{gameState.orderedPlayerIds?.length || 0})…
          </p>
        )
      )}

      {phase === 'ROUND_RESULT' && (
        (isCaptain || isHost) ? (
          <CartoonButton id="cmc-next-round-btn" onClick={() => send('cmc/next', { playerId })}>
            📲 Manche suivante ➡️
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">Le Capitaine va lancer la manche suivante…</p>
        )
      )}

      {phase === 'GAME_OVER' && (
        isHost ? (
          <CartoonButton id="cmc-restart-btn" onClick={() => send('cmc/start', { playerId, hotMode })}>
            🔄 Rejouer une partie
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">Partie terminée !</p>
        )
      )}
    </>
  )

  return (
    <GameLayout
      gameKey="classemoica"
      title={`Manche ${gameState.roundNumber}/5 – Capitaine : ${captainName}`}
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={footer}
    >
      <section className="cmc-stage">
        {/* BARRE DE VIES : CROISSANTS DE LICORNE */}
        <UnicornLivesBar
          lives={gameState.lives ?? 4}
          maxLives={4}
          round={gameState.roundNumber || 1}
          maxRounds={5}
        />

        {/* THÈME D'INTENSITÉ 1 À 10 */}
        <div className="cmc-theme-card">
          <span className="cmc-theme-badge">ÉCHELLE D'INTENSITÉ 1 ➔ 10</span>
          <h2 className="cmc-theme-title">{currentThemeText}</h2>

          {/* Bornes 0 et 11 définies par le Capitaine */}
          {(gameState.anchorZero || gameState.anchorEleven) && (
            <div className="cmc-anchors-container">
              {gameState.anchorZero && (
                <div className="cmc-anchor-card anchor-zero">
                  <span className="cmc-anchor-tag">Borne 0 (Pire)</span>
                  <p className="cmc-anchor-text">{gameState.anchorZero}</p>
                </div>
              )}
              {gameState.anchorEleven && (
                <div className="cmc-anchor-card anchor-eleven">
                  <span className="cmc-anchor-tag">Borne 11 (Meilleur)</span>
                  <p className="cmc-anchor-text">{gameState.anchorEleven}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ÉCRAN DE FIN DE PARTIE */}
        {phase === 'GAME_OVER' && (
          <div className="cmc-theme-card" style={{ background: gameState.lives > 0 ? '#dcfce7' : '#fee2e2', borderColor: gameState.lives > 0 ? '#16a34a' : '#dc2626' }}>
            <span style={{ fontSize: '3.5rem' }}>{gameState.lives > 0 ? '🏆' : '💀'}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: gameState.lives > 0 ? '#166534' : '#991b1b', margin: '8px 0' }}>
              {gameState.lives > 0 ? 'VICTOIRE COLLECTIVE !' : 'DÉFAITE DE L’ÉQUIPE !'}
            </h2>
            <p style={{ fontWeight: 800 }}>
              {gameState.lives > 0
                ? `L'équipe a survécu aux 5 manches avec ${gameState.lives} croissants de licorne restants ! 🎉`
                : 'Tous les croissants de licorne ont été perdus suite aux inversions...'}
            </p>
          </div>
        )}

        {/* PHASE 1 : PROPOSITION ORALE & CHIFFRE SECRET */}
        {phase === 'ORAL_PROPOSALS' && (
          <>
            {/* Si je suis le Capitaine : PAS de numéro secret, je fixe les repères et j'écoute */}
            {isCaptain ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '460px', alignItems: 'center' }}>
                <div style={{
                  background: '#fef3c7',
                  border: '3.5px solid #d97706',
                  borderRadius: '20px',
                  padding: '18px 16px',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0 6px 0 #d97706',
                }}>
                  <span style={{ fontSize: '2.4rem' }}>👑</span>
                  <h3 style={{ margin: '4px 0', fontFamily: 'Carter One, cursive', color: '#92400e', fontSize: '1.4rem' }}>
                    Tu es le Capitaine !
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, color: '#78350f' }}>
                    Tu n'as <strong>pas de numéro</strong>. C'est à toi de poser les bornes (0 et 11) et d'écouter les propositions des autres téléphones pour les classer de 1 à 10 !
                  </p>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    border: '2px solid #d97706',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    color: '#b45309'
                  }}>
                    ⏳ Réponses reçues : {Object.keys(gameState.submissions || {}).length} / {Math.max(1, room.players.length - 1)}
                  </div>
                </div>

                <div className="cmc-anchor-card" style={{ width: '100%', padding: '16px' }}>
                  <span style={{ fontWeight: 900, color: '#d97706', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
                    🧑‍✈️ Bornes repères du Capitaine (Pose ton 0 et ton 11) :
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Ex: 0 (le pire absolu)"
                      value={anchorZero}
                      onChange={(e) => setAnchorZero(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '10px', border: '2px solid #111', fontWeight: 700 }}
                    />
                    <input
                      type="text"
                      placeholder="Ex: 11 (le top absolu)"
                      value={anchorEleven}
                      onChange={(e) => setAnchorEleven(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '10px', border: '2px solid #111', fontWeight: 700 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAnchors}
                    style={{ marginTop: '8px', padding: '6px 14px', borderRadius: '8px', border: '2px solid #111', background: '#f59e0b', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ⚓ Publier les repères 0 et 11
                  </button>
                </div>
              </div>
            ) : (
              /* Pour tous les autres téléphones : ils reçoivent leur numéro secret et proposent */
              <>
                <div style={{ textAlign: 'center', margin: '4px 0' }}>
                  <span style={{ background: '#fce4ec', color: '#be185d', fontWeight: 900, fontSize: '0.85rem', padding: '4px 14px', borderRadius: '999px', border: '2px solid #f43f5e' }}>
                    🤫 TON NUMÉRO SECRET (Donne une réponse selon ce chiffre)
                  </span>
                </div>

                <SecretNumberCard number={mySecretNumber || '?'} />

                {/* Champ optionnel de proposition écrite */}
                <div style={{ width: '100%', maxWidth: '420px' }}>
                  <input
                    type="text"
                    placeholder="Une phrase / idée pour t'en souvenir (optionnel)"
                    value={myOralText}
                    onChange={(e) => setMyOralText(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '3px solid #1e293b', fontWeight: 700, fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* PHASE 2 : RÉORGANISATION PAR LE CAPITAINE (Uniquement les autres joueurs) */}
        {phase === 'CAPTAIN_ORDERING' && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span className="cmc-theme-badge">
                {isCaptain ? '🧑‍✈️ Classe les réponses des joueurs du plus petit (1) au plus grand (10)' : `Attente du Capitaine ${captainName}`}
              </span>
            </div>

            <CaptainReorderList
              players={room.players.filter(p => p.id !== gameState.captainId)}
              orderedIds={orderedIds.length ? orderedIds : (gameState.orderedPlayerIds?.filter(id => id !== gameState.captainId) || room.players.filter(p => p.id !== gameState.captainId).map(p => p.id))}
              submissions={gameState.submissions || {}}
              onReorder={setOrderedIds}
              disabled={!isCaptain}
            />
          </div>
        )}

        {/* PHASE 3 & 4 : RÉVÉLATION PAS À PAS & RÉSULTAT */}
        {(phase === 'REVEAL_STEP_BY_STEP' || phase === 'ROUND_RESULT') && (
          <div className="cmc-reveal-grid">
            <div style={{ textAlign: 'center' }}>
              <span className="cmc-theme-badge">
                {phase === 'REVEAL_STEP_BY_STEP' ? '🔍 Révélation pas à pas' : '📊 Bilan de la manche'}
              </span>
            </div>

            {(gameState.orderedPlayerIds || []).map((pid, idx) => {
              const player = room.players.find(p => p.id === pid) || { name: pid }
              const isRevealed = idx < (gameState.revealedIndex || 0) || phase === 'ROUND_RESULT'
              const num = (gameState.revealedNumbers && gameState.revealedNumbers[pid]) || '?'

              // Détection d'inversion pour les classes CSS
              let isError = false
              let isSuccess = false
              if (isRevealed && idx > 0) {
                const prevPid = gameState.orderedPlayerIds[idx - 1]
                const prevNum = (gameState.revealedNumbers && gameState.revealedNumbers[prevPid]) || 0
                if (typeof num === 'number' && typeof prevNum === 'number') {
                  if (num < prevNum) isError = true
                  else isSuccess = true
                }
              }

              return (
                <div
                  key={pid}
                  className={`cmc-reveal-card ${!isRevealed ? 'is-hidden-step' : ''} ${isError ? 'is-step-error' : isSuccess ? 'is-step-success' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#64748b' }}>#{idx + 1}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{player.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        « {gameState.submissions?.[pid] || 'A parlé'} »
                      </p>
                    </div>
                  </div>

                  <div className="cmc-reveal-badge-number">
                    {isRevealed ? num : '❓'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CHIPS DES JOUEURS CONNECTÉS */}
        <div className="player-chips" style={{ marginTop: '16px' }}>
          {room.players.map(p => {
            const isCap = p.id === gameState.captainId
            const isSubmitted = Boolean(gameState.submissions?.[p.id])
            return (
              <span key={p.id} className={`player-chip ${p.id === playerId ? 'is-active' : ''}`}>
                {isCap ? '🧑‍✈️ ' : ''}{p.name}
                {phase === 'ORAL_PROPOSALS' && (
                  <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>
                    {isSubmitted ? '✅' : '⏳'}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      </section>
    </GameLayout>
  )
}
