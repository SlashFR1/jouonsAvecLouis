import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import PhysicalBlackCard from '../../components/games/PhysicalBlackCard'
import PhysicalWhiteCard from '../../components/games/PhysicalWhiteCard'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import '../../styles/limite-prison-visual.css'

const COLOR = CARD_COLORS.black

export default function LimitePrisonRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [myHand, setMyHand] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [pickedProposal, setPickedProposal] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Événements STOMP publics
  const onEvent = useCallback(evt => {
    setRoom(evt.room)
    switch (evt.type) {
      case 'LIMITE_ROUND_STARTED':
      case 'LIMITE_QUESTION_CHOSEN':
        setGameState(evt.payload)
        setSelectedCard(null)
        setPickedProposal(null)
        setError(null)
        break
      case 'LIMITE_SUBMISSION_RECEIVED':
      case 'LIMITE_ANONYMOUS_REVEAL':
      case 'LIMITE_ROUND_WINNER':
      case 'LIMITE_PODIUM':
        setGameState(evt.payload)
        break
      case 'LIMITE_ERROR':
        setError(evt.payload?.message || 'Erreur inconnue')
        break
      default:
    }
  }, [])

  // Écoute de la main privée sur son canal dédié
  const extraSubscriptions = useMemo(() => {
    if (!room?.code || !playerId) return {}
    return {
      [`/topic/limite/${room.code}/player/${playerId}/hand`]: (hand) => {
        if (Array.isArray(hand)) setMyHand(hand)
      },
      [`/topic/room/${room.code}/hand/${playerId}`]: (hand) => {
        if (Array.isArray(hand)) setMyHand(hand)
      },
      [`/topic/limite/${room.code}/proposals`]: (proposals) => {
        if (Array.isArray(proposals)) {
          setGameState(prev => prev ? { ...prev, anonymousProposals: proposals } : prev)
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
    document.title = room ? `Salle ${room.code} – Limite PRISON – Loustic` : 'Limite PRISON – Loustic'
  }, [room])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('limiteprison', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/limiteprison/${r.code}`, { replace: true })
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
      navigate(`/salle/limiteprison/${r.code}`, { replace: true })
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
  const isJudge = gameState?.judgePlayerId === playerId
  const judgePlayerName = room?.players.find(p => p.id === gameState?.judgePlayerId)?.name || 'Le Juge'
  const hasSubmitted = Boolean(gameState?.submittedPlayerIds?.includes(playerId))

  const phase = gameState?.phase || 'LOBBY'

  // Sélection de la question par le Maître
  const handleSelectQuestion = (cardId) => {
    if (!isJudge) return
    send('limite/select-question', { playerId, cardId, payload: { cardId } })
  }

  // Soumission de la carte blanche
  const handleSubmitCard = () => {
    if (!selectedCard) return
    const id = selectedCard.id || (typeof selectedCard === 'string' ? selectedCard : selectedCard.text)
    const text = typeof selectedCard === 'string' ? selectedCard : (selectedCard.text || selectedCard.id)
    send('limite/submit', {
      playerId,
      cardId: id,
      card: text,
      text: text,
      payload: { cardId: id, card: text, text }
    })
  }

  // Élection par le Juge
  const handlePickWinner = () => {
    if (!pickedProposal || !isJudge) return
    send('limite/pick', { playerId, token: pickedProposal.token, payload: { token: pickedProposal.token } })
  }

  // Texte à afficher dans le trou de la carte noire
  const slottedText = useMemo(() => {
    if (phase === 'SUBMISSION_PHASE') {
      return typeof selectedCard === 'string' ? selectedCard : (selectedCard?.text || null)
    }
    if (phase === 'JUDGING' || phase === 'ANONYMOUS_REVEAL') {
      return pickedProposal?.text || null
    }
    if (phase === 'ROUND_WINNER' || phase === 'PODIUM') {
      return gameState?.winningCard?.text || null
    }
    return null
  }, [phase, selectedCard, pickedProposal, gameState?.winningCard])

  // Écran d'attente / lobby
  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="limiteprison" title="Limite PRISON ⚠️" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Limite PRISON ⛓️"
          emoji="⚠️"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={2}
          startLabel="⛓️ Lancer la prison !"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('limite/start', { playerId })}
        />
      </GameLayout>
    )
  }

  const connStatus = (
    <span className={`conn-dot ${connected ? 'is-on' : ''}`} title={connected ? 'Connecté' : 'Connexion…'} />
  )

  const footer = (
    <>
      {phase === 'MASTER_PICK' && (
        isJudge ? (
          <p className="hint footer-hint">
            👮‍♂️ Choisis l'une des 2 cartes bleues pour lancer les soumissions !
          </p>
        ) : (
          <p className="hint footer-hint">
            👮‍♂️ Le Gardien {judgePlayerName} choisit la question…
          </p>
        )
      )}

      {phase === 'SUBMISSION_PHASE' && (
        isJudge ? (
          <p className="hint footer-hint">
            ⚖️ Tu es le Gardien : attends les soumissions des détenus ({gameState?.submissionsCount || 0}/{gameState?.expectedSubmissions || 0})
          </p>
        ) : hasSubmitted ? (
          <p className="hint footer-hint">
            🔒 Ta carte est au coffre ! En attente des autres détenus ({gameState?.submissionsCount || 0}/{gameState?.expectedSubmissions || 0})…
          </p>
        ) : (
          <CartoonButton
            id="limite-submit-btn"
            variant="success"
            disabled={!selectedCard}
            onClick={handleSubmitCard}
          >
            🔒 Poser ma carte secrètement
          </CartoonButton>
        )
      )}

      {(phase === 'JUDGING' || phase === 'ANONYMOUS_REVEAL') && (
        isJudge ? (
          <CartoonButton
            id="limite-pick-btn"
            variant="primary"
            disabled={!pickedProposal}
            onClick={handlePickWinner}
          >
            👑 Élire cette carte gagnante !
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">
            ⚖️ Le Juge {judgePlayerName} délibère… Suspense !
          </p>
        )
      )}

      {phase === 'ROUND_WINNER' && (
        (isHost || isJudge) ? (
          <CartoonButton id="limite-next-btn" onClick={() => send('limite/next', { playerId })}>
            📲 Manche suivante ➡️
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">L'hôte ou le Juge va lancer la manche suivante…</p>
        )
      )}

      {phase === 'PODIUM' && (
        isHost ? (
          <CartoonButton id="limite-restart-btn" onClick={() => send('limite/next', { playerId })}>
            🔄 Rejouer une nouvelle partie
          </CartoonButton>
        ) : (
          <p className="hint footer-hint">Partie terminée ! Bien joué !</p>
        )
      )}
    </>
  )

  const blackCardText = gameState?.currentBlackCard?.text || gameState?.currentQuestion || 'Pour séduire, rien de tel que ___.'

  return (
    <GameLayout
      gameKey="limiteprison"
      title={`Manche ${gameState.roundNumber} – Juge : ${judgePlayerName}`}
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
      footer={footer}
    >
      <section className="limite-prison-stage">
        {/* ÉCRAN DE VICTOIRE / PODIUM */}
        {phase === 'PODIUM' ? (
          <div className="podium-container">
            <span className="podium-crown">👑</span>
            <h2 className="podium-winner-title">
              ÉVASION RÉUSSIE ! {gameState.winningPlayerName || 'Un joueur'} gagne la partie !
            </h2>
            <p style={{ fontWeight: 800, color: '#475569', marginBottom: '16px' }}>
              Premier à 5 points atteint ! Voici le classement final :
            </p>

            <div className="player-chips" style={{ justifyContent: 'center' }}>
              {room.players.map(p => (
                <span
                  key={p.id}
                  className={`player-chip ${p.id === gameState.winningPlayerId ? 'is-active' : ''}`}
                  style={{ fontSize: '1.1rem', padding: '8px 16px' }}
                >
                  {p.name} : <strong>{gameState.scores?.[p.id] || 0} pts</strong>
                </span>
              ))}
            </div>
          </div>
        ) : phase === 'MASTER_PICK' ? (
          /* PHASE CHOIX DU MAÎTRE : 2 CARTES BLEUES */
          isJudge ? (
            <div className="master-pick-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="judge-status-card" style={{ background: '#eff6ff', borderColor: '#2563eb', color: '#1e3a8a' }}>
                <span className="judge-badge-hero" style={{ background: '#2563eb', color: '#fff' }}>👮‍♂️ TU ES LE GARDIEN</span>
                <p style={{ margin: '8px 0 0 0', fontWeight: 900, fontSize: '1.2rem' }}>
                  Choisis la question qui sera jouée cette manche :
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%' }}>
                {(gameState.proposedBlackCards || []).map((card, idx) => (
                  <div
                    key={card.id || idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectQuestion(card.id)}
                    style={{
                      background: '#18181b',
                      color: '#f8fafc',
                      borderRadius: 18,
                      border: '3.5px solid #09090b',
                      padding: 20,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 180,
                      boxShadow: '0 8px 0 #000',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="black-card-badge">Option #{idx + 1}</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Carte Bleue</span>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.4, margin: '8px 0 16px' }}>
                      {card.text}
                    </p>
                    <CartoonButton variant="primary" style={{ width: '100%' }}>
                      👉 Choisir cette question
                    </CartoonButton>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="judge-status-card" style={{ width: '100%', background: '#f8fafc', borderColor: '#94a3b8', color: '#334155', padding: '28px 20px' }}>
              <span className="judge-badge-hero" style={{ background: '#64748b', color: '#fff' }}>👮‍♂️ GARDIEN EN ACTION</span>
              <p style={{ margin: '12px 0 6px', fontWeight: 900, fontSize: '1.3rem' }}>
                Le Gardien ({judgePlayerName}) choisit la question parmi 2 cartes bleues…
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                Prépare tes meilleures répliques dans ta tête !
              </p>
            </div>
          )
        ) : (
          <>
            {/* CARTE NOIRE PHYSIQUE AVEC TROU INSERTION DYNAMIQUE */}
            <PhysicalBlackCard
              text={blackCardText}
              slottedText={slottedText}
              onRemoveSlotted={!hasSubmitted && phase === 'SUBMISSION_PHASE' ? () => setSelectedCard(null) : null}
              onDropCard={!hasSubmitted && phase === 'SUBMISSION_PHASE' ? (c) => setSelectedCard(c) : null}
              judgeName={judgePlayerName}
              isJudge={isJudge}
            />

            {/* MESSAGE DU JUGE OU DE RÉSULTAT */}
            {phase === 'SUBMISSION_PHASE' && isJudge && (
              <div className="judge-status-card" style={{ width: '100%' }}>
                <span className="judge-badge-hero">⚖️ TU ES LE GARDIEN</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 800, fontSize: '1.1rem' }}>
                  Attends que les détenus soumettent leurs cartes…
                </p>
                {/* JAUGE EN DIRECT : X/Y joueurs ont répondu */}
                <div style={{ margin: '14px 0 8px', width: '100%', background: '#e2e8f0', borderRadius: 999, overflow: 'hidden', height: 18, border: '2.5px solid #0f172a' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round(((gameState.submissionsCount || 0) / Math.max(1, gameState.expectedSubmissions || 1)) * 100))}%`,
                    background: '#22c55e',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 900 }}>
                  {gameState.submissionsCount || 0} / {gameState.expectedSubmissions || 0} détenus ont répondu…
                </p>
              </div>
            )}

            {phase === 'ROUND_WINNER' && (
              <div className="judge-status-card" style={{ background: '#dcfce7', borderColor: '#16a34a', color: '#166534' }}>
                <span className="judge-badge-hero" style={{ background: '#22c55e', color: '#fff' }}>
                  🏆 CARTE ÉLUE !
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 900 }}>
                  {gameState.winningPlayerName} remporte la manche ! (+1 pt)
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  Score : {gameState.scores?.[gameState.winningPlayerId] || 0} / 5 pts
                </p>
              </div>
            )}

            {/* PHASE DE SOUMISSION : MAIN PRIVÉE DU JOUEUR */}
            {phase === 'SUBMISSION_PHASE' && !isJudge && (
              <div className="white-cards-hand">
                <div className="hand-title">
                  <span>🃏 Ta main secrète ({myHand.length} cartes)</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {hasSubmitted ? '🔒 Soumis' : 'Glisse ou clique pour insérer'}
                  </span>
                </div>

                <div className="white-cards-grid">
                  {myHand.map((card, idx) => {
                    const cardObj = typeof card === 'string' ? { id: `wh_${idx}`, text: card } : card
                    const isCardSelected = selectedCard && (
                      (selectedCard.id && selectedCard.id === cardObj.id) ||
                      (selectedCard.text && selectedCard.text === cardObj.text) ||
                      (selectedCard === card)
                    )
                    return (
                      <PhysicalWhiteCard
                        key={cardObj.id || idx}
                        card={cardObj}
                        isSelected={isCardSelected}
                        disabled={hasSubmitted}
                        onSelect={() => setSelectedCard(cardObj)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* PHASE DE VOTE / JUGEMENT : PROPOSITIONS ANONYMISÉES */}
            {(phase === 'JUDGING' || phase === 'ANONYMOUS_REVEAL') && (
              <div className="white-cards-hand">
                <div className="hand-title">
                  <span>🎭 Cartes soumises ({gameState.anonymousProposals?.length || 0})</span>
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                    {isJudge ? '👉 Clique sur une carte pour l’insérer puis valide' : 'Clique pour prévisualiser'}
                  </span>
                </div>

                <div className="anonymous-proposals-grid">
                  {(gameState.anonymousProposals || []).map((prop, idx) => {
                    const isPicked = pickedProposal?.token === prop.token
                    return (
                      <div
                        key={prop.token || idx}
                        role="button"
                        tabIndex={0}
                        className={`anonymous-card ${isPicked ? 'is-picked' : ''}`}
                        onClick={() => setPickedProposal(prop)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setPickedProposal(prop)
                          }
                        }}
                      >
                        <p className="white-card-text">{prop.text}</p>
                        <div className="anonymous-token-label">
                          <span>Proposé #{idx + 1}</span>
                          {isPicked && <span> ⭐ Choix</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SCORES EN DIRECT */}
            <div className="player-chips" style={{ marginTop: '16px' }}>
              {room.players.map(p => {
                const isPJudge = p.id === gameState.judgePlayerId
                const hasPlayerSubmitted = gameState.submittedPlayerIds?.includes(p.id)
                return (
                  <span
                    key={p.id}
                    className={`player-chip ${p.id === playerId ? 'is-active' : ''}`}
                  >
                    {isPJudge ? '⚖️ ' : ''}{p.name}
                    {phase === 'SUBMISSION_PHASE' && !isPJudge && (
                      <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>
                        {hasPlayerSubmitted ? '✅' : '⏳'}
                      </span>
                    )}
                    {' '}: <strong>{gameState.scores?.[p.id] || 0} / 5 pts</strong>
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
