import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Send, CheckCircle2, AlertTriangle, Eye, ThumbsUp } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import RoomLobby from '../../components/common/RoomLobby'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.black

export default function MessMemeRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()

  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Saisie de légende locale
  const [myCaption, setMyCaption] = useState('')
  const [votedSubId, setVotedSubId] = useState(null)
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState(false)

  // Gestion des événements WebSocket
  const onEvent = useCallback((evt) => {
    if (evt.room) setRoom(evt.room)
    switch (evt.type) {
      case 'MESSMEME_STATE_UPDATED':
        setGameState(evt.payload)
        setError(null)
        // Réinitialiser les états locaux sur nouvelle manche
        if (evt.payload.phase === 'SUBMIT_CAPTION' && evt.payload.votingCaptions?.length === 0) {
          const myStatus = evt.payload.players?.find(p => p.playerId === playerId)
          if (!myStatus?.hasSubmitted) {
            setHasSubmittedLocally(false)
            setMyCaption('')
            setVotedSubId(null)
          }
        }
        break
      case 'MESSMEME_ERROR':
        setError(evt.payload?.message || 'Erreur dans la partie')
        break
      default:
    }
  }, [playerId])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent)

  // Synchronisation initiale
  useEffect(() => {
    if (connected && room?.code) {
      send('messmeme/sync', { playerId })
    }
  }, [connected, room?.code, playerId, send])

  // Rejoindre la salle depuis l'URL
  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName)
      .then((r) => setRoom(r))
      .catch((e) => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('messmeme', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/messmeme/${r.code}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async (code) => {
    setBusy(true)
    setError(null)
    try {
      const r = await joinRoom(code, playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/messmeme/${r.code}`, { replace: true })
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
  const myPlayerStatus = gameState?.players?.find(p => p.playerId === playerId)
  const isSubmitted = hasSubmittedLocally || myPlayerStatus?.hasSubmitted

  // Actions
  const handleStartGame = () => {
    send('messmeme/start', { playerId })
  }

  const handleSubmitCaption = (e) => {
    e?.preventDefault()
    if (!myCaption.trim()) return
    send('messmeme/submit', { playerId, caption: myCaption.trim() })
    setHasSubmittedLocally(true)
  }

  const handleVoteCaption = (subId) => {
    send('messmeme/vote', { playerId, submissionId: subId })
    setVotedSubId(subId)
  }

  const handleNextRound = () => {
    send('messmeme/next', { playerId })
  }

  // 1. LOBBY
  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="messmeme" title="Mess Meme" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Mess Meme"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={3}
          startLabel="Lancer la partie"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={handleStartGame}
        />
      </GameLayout>
    )
  }

  return (
    <GameLayout
      gameKey="messmeme"
      title={`Mess Meme (Manche ${gameState?.roundNumber || 1})`}
      color={COLOR}
      onBack={handleQuit}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 pb-8">
        {/* Bandeau supérieur de statut */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full">
              Manche {gameState?.roundNumber}
            </span>
            <span className="text-xs font-black">
              {phase === 'SUBMIT_CAPTION' ? 'Inspiration' : phase === 'BLIND_VOTING' ? 'Vote du meilleur mème' : 'Verdict'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {gameState?.players?.map(p => (
              <span
                key={p.playerId}
                className="text-[11px] font-black bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded-lg border border-neutral-700"
              >
                {p.playerName}: {p.score || 0} pts
              </span>
            ))}
          </div>
        </div>

        {/* Mème affiché pour tout le monde */}
        <div className="p-3 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col items-center">
          <div className="w-full rounded-2xl overflow-hidden border-2 border-neutral-900 max-h-72 flex items-center justify-center bg-neutral-100">
            <img
              src={gameState?.memeUrl}
              alt="Mème"
              className="max-h-72 w-auto object-contain"
            />
          </div>

          {gameState?.situation && (
            <div className="mt-2.5 p-2 bg-yellow-300 rounded-xl border-2 border-neutral-900 text-center font-black text-xs uppercase text-neutral-950 w-full">
              Situation : "{gameState.situation}"
            </div>
          )}
        </div>

        {/* PHASE 2 : SAISIE DE LÉGENDE */}
        {phase === 'SUBMIT_CAPTION' && (
          <section className={`p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3 ${!isSubmitted ? 'your-turn-active' : ''}`} style={{ border: '3.5px solid #161513', boxShadow: '4px 4px 0 #161513' }}>
            <div className="text-center">
              <span style={{ fontFamily: 'Carter One, cursive', fontSize: '0.85rem', background: '#e0e7ff', color: '#4338ca', border: '2px solid #161513', padding: '3px 12px', borderRadius: '999px', display: 'inline-block', textTransform: 'uppercase' }}>
                ✍️ À toi de jouer
              </span>
              <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.45rem', margin: '8px 0 4px', color: '#161513' }}>
                Tape ta meilleure punchline !
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#4b5563' }}>
                La légende la plus drôle remportera les votes de toute la table :
              </p>
            </div>

            {isSubmitted ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', background: '#ecfdf5', borderRadius: '18px', border: '3px solid #10b981', boxShadow: '3px 3px 0 #059669' }}>
                <CheckCircle2 style={{ width: '36px', height: '36px', color: '#059669', margin: '0 auto 8px' }} />
                <span style={{ fontFamily: 'Carter One, cursive', fontSize: '1.2rem', color: '#065f46', display: 'block' }}>
                  🎉 Légende envoyée !
                </span>
                <p style={{ margin: '6px 0 0', fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>
                  En attente des autres joueurs ({gameState?.players?.filter(p => p.hasSubmitted)?.length}/{gameState?.players?.length})…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCaption} className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  id="messmeme-caption-input"
                  value={myCaption}
                  onChange={(e) => setMyCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitCaption(e)
                    }
                  }}
                  placeholder="Ex: Quand tu dis que tu vas dormir tôt mais qu'il est 4h du mat..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: '3px solid #161513',
                    fontSize: '1rem',
                    fontWeight: 800,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: '#fffbeb',
                    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.06)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <CartoonButton
                  id="messmeme-submit-btn"
                  variant="primary"
                  disabled={!myCaption.trim()}
                  onClick={handleSubmitCaption}
                  style={{ width: '100%', padding: '12px 18px', fontSize: '1.05rem', fontFamily: 'Carter One, cursive' }}
                >
                  <Send style={{ width: '18px', height: '18px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
                  🚀 Valider et envoyer ma légende
                </CartoonButton>
              </form>
            )}
          </section>
        )}

        {/* PHASE 3 : VOTE À L'AVEUGLE */}
        {phase === 'BLIND_VOTING' && (
          <section className={`p-4 bg-white rounded-3xl flex flex-col gap-3 ${votedSubId === null ? 'your-turn-active' : ''}`} style={{ border: '3.5px solid #161513', boxShadow: '4px 4px 0 #161513' }}>
            <div className="text-center">
              <span style={{ fontFamily: 'Carter One, cursive', fontSize: '0.85rem', background: '#dbeafe', color: '#1e40af', border: '2px solid #161513', padding: '3px 12px', borderRadius: '999px', display: 'inline-block', textTransform: 'uppercase' }}>
                🗳️ Phase de Vote
              </span>
              <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.45rem', margin: '8px 0 4px', color: '#161513' }}>
                Votez pour la meilleure légende !
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#4b5563' }}>
                Les propositions sont anonymes. Vous ne pouvez pas voter pour votre propre punchline.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gameState?.votingCaptions?.map((sub) => {
                const isVoted = votedSubId === sub.submissionId
                return (
                  <div
                    key={sub.submissionId}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '3px solid #161513',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: isVoted ? '#fef08a' : '#fffbeb',
                      boxShadow: isVoted ? '3px 3px 0 #ca8a04' : '3px 3px 0 #161513',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <p style={{ margin: 0, flex: 1, fontSize: '0.95rem', fontWeight: 800, color: '#161513', fontStyle: 'italic', lineHeight: 1.35 }}>
                      « {sub.caption} »
                    </p>

                    <button
                      type="button"
                      disabled={votedSubId !== null}
                      onClick={() => handleVoteCaption(sub.submissionId)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        border: '2.5px solid #161513',
                        fontFamily: 'Carter One, cursive',
                        fontSize: '0.88rem',
                        cursor: votedSubId !== null ? 'not-allowed' : 'pointer',
                        background: isVoted ? '#161513' : votedSubId !== null ? '#e5e7eb' : '#fbbf24',
                        color: isVoted ? '#ffffff' : votedSubId !== null ? '#9ca3af' : '#161513',
                        boxShadow: isVoted || votedSubId !== null ? 'none' : '2px 2px 0 #161513',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isVoted ? '✓ Ton vote' : 'Voter'}
                    </button>
                  </div>
                )
              })}
            </div>

            {votedSubId !== null && (
              <div style={{ textAlign: 'center', padding: '10px', background: '#fef3c7', borderRadius: '14px', border: '2px dashed #d97706', marginTop: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#92400e' }}>
                  ⏳ Vote enregistré ! En attente des autres joueurs ({gameState?.players?.filter(p => p.hasVoted)?.length}/{gameState?.players?.length})…
                </p>
              </div>
            )}
          </section>
        )}

        {/* PHASE 4 : RÉSULTATS */}
        {phase === 'RESULTS' && (
          <section className="p-4 bg-white rounded-3xl flex flex-col gap-4" style={{ border: '3.5px solid #161513', boxShadow: '4px 4px 0 #161513' }}>
            <div className="text-center">
              <span style={{ fontFamily: 'Carter One, cursive', fontSize: '0.85rem', background: '#d1fae5', color: '#065f46', border: '2px solid #161513', padding: '3px 12px', borderRadius: '999px', display: 'inline-block', textTransform: 'uppercase' }}>
                🏆 Résultats de la Manche
              </span>
              <h2 style={{ fontFamily: 'Carter One, cursive', fontSize: '1.5rem', margin: '8px 0 4px', color: '#161513' }}>
                Podium des Légendes
              </h2>
            </div>

            {/* Légendes révélées avec auteurs et votes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gameState?.votingCaptions?.map((sub, idx) => {
                const isWinner = idx === 0 && sub.votesCount > 0
                return (
                  <div
                    key={sub.submissionId}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '18px',
                      border: '3px solid #161513',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      background: isWinner ? '#fef08a' : '#fffbeb',
                      boxShadow: isWinner ? '4px 4px 0 #ca8a04' : '3px 3px 0 #161513'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Carter One, cursive', fontSize: '0.92rem', color: isWinner ? '#854d0e' : '#161513' }}>
                        {isWinner ? `👑 1ère place : ${sub.authorName}` : `Auteur : ${sub.authorName}`}
                      </span>
                      <span style={{ fontFamily: 'Carter One, cursive', fontSize: '0.82rem', background: '#161513', color: '#ffffff', padding: '2px 10px', borderRadius: '8px' }}>
                        {sub.votesCount} vote{sub.votesCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p style={{ margin: '4px 0', fontSize: '1.02rem', fontWeight: 800, color: '#161513', fontStyle: 'italic', lineHeight: 1.35 }}>
                      « {sub.caption} »
                    </p>

                    {sub.voters?.length > 0 && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6b7280' }}>
                        ❤️ A voté pour : {sub.voters.join(', ')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {isHost ? (
              <CartoonButton variant="success" onClick={handleNextRound} style={{ width: '100%', marginTop: '6px', padding: '12px 18px', fontSize: '1.05rem', fontFamily: 'Carter One, cursive' }}>
                ➡️ Manche suivante
              </CartoonButton>
            ) : (
              <p style={{ textAlign: 'center', margin: '4px 0', fontSize: '0.88rem', fontWeight: 800, color: '#6b7280' }}>
                L'hôte va lancer la manche suivante…
              </p>
            )}
          </section>
        )}
      </div>
    </GameLayout>
  )
}
