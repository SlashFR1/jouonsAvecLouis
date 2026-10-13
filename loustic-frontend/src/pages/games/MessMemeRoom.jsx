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
          <section className={`p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3 ${!isSubmitted ? 'your-turn-active' : ''}`}>
            <div className="text-center">
              <span className="text-[11px] font-black uppercase text-purple-800 tracking-wider">
                À vous d'écrire
              </span>
              <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                Tape ta meilleure punchline
              </h2>
              <p className="text-xs font-extrabold text-neutral-900">
                La légende la plus drôle remportera les votes de la table :
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-6 text-center space-y-2 bg-neutral-50 rounded-2xl border-2 border-neutral-900 waiting-suspense">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <span className="text-xs font-black uppercase text-emerald-800 block">
                  Légende enregistrée !
                </span>
                <p className="text-xs font-extrabold text-neutral-900">
                  En attente des autres joueurs ({gameState?.players?.filter(p => p.hasSubmitted)?.length}/{gameState?.players?.length})...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCaption} className="flex flex-col gap-3">
                <textarea
                  value={myCaption}
                  onChange={(e) => setMyCaption(e.target.value)}
                  placeholder="Ex: Quand tu dis que tu vas dormir tôt mais qu'il est 4h du mat..."
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-neutral-900 font-bold text-sm bg-amber-50 focus:outline-none"
                />

                <CartoonButton
                  type="submit"
                  disabled={!myCaption.trim()}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Valider ma légende
                </CartoonButton>
              </form>
            )}
          </section>
        )}

        {/* PHASE 3 : VOTE À L'AVEUGLE */}
        {phase === 'BLIND_VOTING' && (
          <section className={`p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3 ${votedSubId === null ? 'your-turn-active' : ''}`}>
            <div className="text-center">
              <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider">
                Phase de Vote
              </span>
              <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                Votez pour la meilleure légende
              </h2>
              <p className="text-xs font-extrabold text-neutral-900">
                Les propositions sont anonymes. Vous ne pouvez pas voter pour votre propre légende.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {gameState?.votingCaptions?.map((sub) => {
                const isVoted = votedSubId === sub.submissionId
                return (
                  <div
                    key={sub.submissionId}
                    className={`p-3 rounded-2xl border-2 border-neutral-900 flex items-center justify-between gap-3 transition-transform ${
                      isVoted
                        ? 'card-stamp-selected bg-yellow-300 ring-3 ring-yellow-400'
                        : 'bg-neutral-50 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-extrabold text-neutral-900 m-0 flex-1">
                      "{sub.caption}"
                    </p>

                    <button
                      type="button"
                      disabled={votedSubId !== null}
                      onClick={() => handleVoteCaption(sub.submissionId)}
                      className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all ${
                        isVoted
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : votedSubId !== null
                          ? 'bg-neutral-200 text-neutral-500 border-neutral-400 cursor-not-allowed'
                          : 'bg-white hover:bg-yellow-400 text-neutral-900 border-neutral-900 shadow-[2px_2px_0_#161513] cursor-pointer'
                      }`}
                    >
                      {isVoted ? 'Votre vote' : 'Voter'}
                    </button>
                  </div>
                )
              })}
            </div>

            {votedSubId !== null && (
              <p className="text-center text-xs font-extrabold text-neutral-900 pt-2 waiting-suspense">
                Vote pris en compte ! En attente des autres joueurs ({gameState?.players?.filter(p => p.hasVoted)?.length}/{gameState?.players?.length})...
              </p>
            )}
          </section>
        )}

        {/* PHASE 4 : RÉSULTATS */}
        {phase === 'RESULTS' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-4">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Résultats de la Manche
              </span>
              <h2 className="text-xl font-black text-neutral-900 mt-0.5">
                Podium des Légendes
              </h2>
            </div>

            {/* Légendes révélées avec auteurs et votes */}
            <div className="flex flex-col gap-2.5">
              {gameState?.votingCaptions?.map((sub, idx) => {
                const isWinner = idx === 0 && sub.votesCount > 0
                return (
                  <div
                    key={sub.submissionId}
                    className={`p-3.5 rounded-2xl border-3 border-neutral-900 flex flex-col gap-1.5 shadow-[3px_3px_0_#161513] ${
                      isWinner ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-neutral-50'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-neutral-900 uppercase">
                        {isWinner ? `🏆 Gagnant : ${sub.authorName}` : `Auteur : ${sub.authorName}`}
                      </span>
                      <span className="font-black bg-neutral-900 text-white px-2 py-0.5 rounded-md text-[10px]">
                        {sub.votesCount} vote{sub.votesCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-sm font-black text-neutral-900 m-0">
                      "{sub.caption}"
                    </p>

                    {sub.voters?.length > 0 && (
                      <span className="text-[10px] font-bold text-neutral-500">
                        A voté pour : {sub.voters.join(', ')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {isHost ? (
              <CartoonButton variant="success" onClick={handleNextRound} className="w-full">
                Manche suivante
              </CartoonButton>
            ) : (
              <p className="text-center text-xs font-bold text-neutral-500">
                L'hôte va lancer la manche suivante...
              </p>
            )}
          </section>
        )}
      </div>
    </GameLayout>
  )
}
