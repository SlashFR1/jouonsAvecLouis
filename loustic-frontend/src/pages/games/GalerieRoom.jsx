import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, X, Trophy } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import RoomLobby from '../../components/common/RoomLobby'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.purple

export const GALERIE_THEMES = [
  { id: 'Reve', title: 'Rêve & Onirique' },
  { id: 'art', title: 'Art & Tableaux' },
  { id: 'nature', title: 'Merveilles de la Nature' },
  { id: 'memes', title: 'Culture Mèmes' },
]

export default function GalerieRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()

  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [privateHand, setPrivateHand] = useState([])
  const [submittedCardId, setSubmittedCardId] = useState(null)
  const [votedCardId, setVotedCardId] = useState(null)

  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('Reve')

  // Inputs locaux
  const [clue, setClue] = useState('')
  const [selectedHandCard, setSelectedHandCard] = useState(null)
  const [zoomedCard, setZoomedCard] = useState(null)

  // Événements WebSocket
  const onEvent = useCallback((evt) => {
    if (evt.room) setRoom(evt.room)
    switch (evt.type) {
      case 'GALERIE_STATE_UPDATED':
        setGameState(evt.payload)
        setError(null)
        break
      case 'GALERIE_ERROR':
        setError(evt.payload?.message || 'Erreur dans la partie')
        break
      default:
    }
  }, [])

  // Abonnement privé à la main du joueur
  const extraSubscriptions = useMemo(() => {
    if (!room?.code || !playerId) return {}
    return {
      [`/topic/galerie/${room.code}/hand/${playerId}`]: (data) => {
        if (data.hand) setPrivateHand(data.hand)
        if (data.submittedCardId !== undefined) setSubmittedCardId(data.submittedCardId)
        if (data.votedCardId !== undefined) setVotedCardId(data.votedCardId)
      }
    }
  }, [room?.code, playerId])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  // Synchronisation initiale
  useEffect(() => {
    if (connected && room?.code) {
      send('galerie/sync', { playerId })
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
      const r = await createRoom('galerie', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/galerie/${r.code}`, { replace: true })
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
      navigate(`/salle/galerie/${r.code}`, { replace: true })
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
  const isStoryteller = gameState?.storytellerId === playerId
  const phase = gameState?.phase || 'LOBBY'

  // Actions
  const handleStartGame = () => {
    send('galerie/start', { playerId, theme: selectedTheme })
  }

  const handleStorytellerSubmit = () => {
    if (!selectedHandCard || !clue.trim()) return
    send('galerie/clue', { playerId, cardId: selectedHandCard.id, clue: clue.trim() })
    setSelectedHandCard(null)
    setClue('')
  }

  const handleImpostureSubmit = () => {
    if (!selectedHandCard) return
    send('galerie/imposture', { playerId, cardId: selectedHandCard.id })
    setSelectedHandCard(null)
  }

  const handleVoteCard = (cardId) => {
    send('galerie/vote', { playerId, cardId })
  }

  const handleNextRound = () => {
    send('galerie/next', { playerId })
  }

  // 1. LOBBY
  if (!room || !gameState || phase === 'LOBBY') {
    return (
      <GameLayout gameKey="galerie" title="Galerie (Dixit)" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Galerie"
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
      gameKey="galerie"
      title={`Galerie (Manche ${gameState?.roundNumber || 1})`}
      color={COLOR}
      onBack={handleQuit}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 pb-8">
        {/* Bandeau supérieur de statut */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
              Manche {gameState?.roundNumber}
            </span>
            <span className="text-xs font-black">
              Conteur : <strong className="text-yellow-400">{gameState?.storytellerName}</strong>
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

        {/* PHASE 1 : LE CONTEUR */}
        {phase === 'STORYTELLER' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            {isStoryteller ? (
              <>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                    Vous êtes le Conteur
                  </span>
                  <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                    Donnez votre énigme poétique
                  </h2>
                  <p className="text-xs font-bold text-neutral-600">
                    Sélectionnez une carte de votre main et saisissez un indice subtil :
                  </p>
                </div>

                <input
                  type="text"
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  placeholder="Une phrase, un mot, un titre..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-900 font-bold text-sm uppercase bg-amber-50 focus:outline-none"
                />

                {/* Carrousel horizontal */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span>Votre main ({privateHand.length} cartes) :</span>
                    {selectedHandCard && (
                      <span className="text-purple-700 text-[11px]">
                        Sélectionnée : {selectedHandCard.title}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto snap-x py-2 px-1">
                    {privateHand.map((card) => {
                      const isSelected = selectedHandCard?.id === card.id
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedHandCard(card)}
                          className={`shrink-0 w-28 sm:w-32 aspect-3/4 rounded-xl border-3 overflow-hidden relative cursor-pointer snap-start transition-transform ${
                            isSelected
                              ? 'border-purple-600 ring-3 ring-purple-400 scale-105 shadow-[0_4px_0_#8c7ae6]'
                              : 'border-neutral-900 shadow-[2px_2px_0_#161513] hover:scale-102'
                          }`}
                        >
                          <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setZoomedCard(card); }}
                            className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <CartoonButton
                  disabled={!selectedHandCard || !clue.trim()}
                  onClick={handleStorytellerSubmit}
                  className="w-full mt-2"
                >
                  Valider l'indice et l'œuvre
                </CartoonButton>
              </>
            ) : (
              <div className="py-8 text-center space-y-2">
                <span className="text-xs font-black uppercase text-neutral-500">
                  En attente du Conteur
                </span>
                <p className="text-sm font-bold text-neutral-700">
                  {gameState?.storytellerName} choisit une œuvre secrète et rédige son énigme...
                </p>
              </div>
            )}
          </section>
        )}

        {/* PHASE 2 : L'IMPOSTURE */}
        {phase === 'IMPOSTURE' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                Phase d'Imposture
              </span>
              <div className="my-2 p-2.5 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-sm uppercase">
                Indice du conteur : "{gameState?.currentClue}"
              </div>
            </div>

            {!isStoryteller ? (
              submittedCardId > 0 ? (
                <div className="py-6 text-center space-y-2">
                  <span className="text-xs font-black uppercase text-emerald-700">
                    Carte piège validée
                  </span>
                  <p className="text-sm font-bold text-neutral-600">
                    Votre carte a été posée secrètement. En attente des autres joueurs...
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-neutral-600 text-center">
                    Sélectionnez dans votre main l'œuvre qui colle le plus à l'indice pour tromper vos adversaires :
                  </p>

                  <div className="flex gap-2.5 overflow-x-auto snap-x py-2 px-1">
                    {privateHand.map((card) => {
                      const isSelected = selectedHandCard?.id === card.id
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedHandCard(card)}
                          className={`shrink-0 w-28 sm:w-32 aspect-3/4 rounded-xl border-3 overflow-hidden relative cursor-pointer snap-start transition-transform ${
                            isSelected
                              ? 'border-emerald-600 ring-3 ring-emerald-400 scale-105 shadow-[0_4px_0_#064e3b]'
                              : 'border-neutral-900 shadow-[2px_2px_0_#161513] hover:scale-102'
                          }`}
                        >
                          <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setZoomedCard(card); }}
                            className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <CartoonButton
                    disabled={!selectedHandCard}
                    onClick={handleImpostureSubmit}
                    className="w-full mt-2"
                  >
                    Poser cette carte piège
                  </CartoonButton>
                </>
              )
            ) : (
              <div className="py-6 text-center space-y-2">
                <span className="text-xs font-black uppercase text-neutral-500">
                  Rôle Conteur
                </span>
                <p className="text-sm font-bold text-neutral-700">
                  Les autres joueurs choisissent leur carte pour tromper la table...
                </p>
              </div>
            )}
          </section>
        )}

        {/* PHASE 3 : LE VOTE (BLIND VOTE) */}
        {phase === 'VOTE' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                Phase de Vote
              </span>
              <div className="my-2 p-2 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-xs uppercase">
                Indice : "{gameState?.currentClue}"
              </div>
              <p className="text-xs font-bold text-neutral-600">
                {isStoryteller
                  ? 'Vous êtes le conteur : observez les votes de vos adversaires.'
                  : votedCardId > 0
                  ? 'Votre vote a été enregistré. En attente des autres...'
                  : 'Retrouvez la véritable carte du conteur parmi les œuvres en lice :'}
              </p>
            </div>

            {/* Grille responsive des cartes en lice */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
              {gameState?.votingCards?.map((c) => {
                const isMyOwnCard = !isStoryteller && submittedCardId === c.id
                const isVoted = votedCardId === c.id

                return (
                  <div
                    key={c.id}
                    className={`aspect-3/4 rounded-2xl border-3 overflow-hidden relative flex flex-col justify-end p-2 transition-transform ${
                      isMyOwnCard
                        ? 'border-neutral-400 bg-neutral-200 opacity-60 cursor-not-allowed'
                        : isVoted
                        ? 'border-blue-600 ring-4 ring-blue-400 scale-102 shadow-[3px_3px_0_#1e3a8a]'
                        : 'border-neutral-900 shadow-[3px_3px_0_#161513] hover:scale-102 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isStoryteller && !isMyOwnCard && !votedCardId) {
                        handleVoteCard(c.id)
                      }
                    }}
                  >
                    <img src={c.imageUrl} alt="Œuvre" className="absolute inset-0 w-full h-full object-cover -z-10" />

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setZoomedCard({ src: c.imageUrl, title: 'Œuvre' }); }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-md"
                    >
                      <Eye className="w-3 h-3" />
                    </button>

                    {isMyOwnCard ? (
                      <div className="bg-neutral-900/90 text-white text-[10px] font-bold p-1 rounded-lg text-center leading-tight">
                        Votre carte (vote interdit)
                      </div>
                    ) : isVoted ? (
                      <div className="bg-blue-600 text-white text-[10px] font-black p-1 rounded-lg text-center">
                        Votre choix
                      </div>
                    ) : !isStoryteller && !votedCardId ? (
                      <button
                        type="button"
                        className="w-full py-1.5 bg-blue-600 text-white font-black text-xs uppercase rounded-xl border-2 border-neutral-900"
                      >
                        Voter
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* PHASE 4 : RÉSULTATS */}
        {phase === 'RESULTS' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-4">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Révélation & Verdict
              </span>
              <h2 className="text-xl font-black text-neutral-900 mt-0.5">
                Cartes révélées
              </h2>
              <div className="my-1.5 p-2 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-xs uppercase">
                Indice : "{gameState?.currentClue}"
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gameState?.votingCards?.map((c) => {
                const isStorytellerCard = c.isStoryteller
                const voters = c.voters || []

                return (
                  <div
                    key={c.id}
                    className={`aspect-3/4 rounded-2xl border-3 overflow-hidden relative flex flex-col justify-between p-2 shadow-[3px_3px_0_#161513] ${
                      isStorytellerCard
                        ? 'border-amber-500 ring-4 ring-yellow-400'
                        : 'border-neutral-900'
                    }`}
                  >
                    <img src={c.imageUrl} alt="Œuvre" className="absolute inset-0 w-full h-full object-cover -z-10" />

                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          isStorytellerCard
                            ? 'bg-yellow-400 text-neutral-950 border-neutral-900'
                            : 'bg-neutral-900/80 text-white border-white/20'
                        }`}
                      >
                        {isStorytellerCard ? 'Vraie carte (Conteur)' : 'Piège'}
                      </span>
                    </div>

                    <div className="bg-black/75 text-white p-1.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold block text-neutral-300">
                        {voters.length} vote{voters.length > 1 ? 's' : ''} :
                      </span>
                      <div className="text-[11px] font-black text-yellow-300 truncate">
                        {voters.length > 0 ? voters.join(', ') : 'Aucun'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Scores de la manche */}
            <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-900 space-y-1.5">
              <h4 className="font-black text-xs uppercase text-neutral-700">
                Points attribués :
              </h4>
              {gameState?.players?.map(p => (
                <div key={p.playerId} className="flex justify-between items-center text-xs border-b border-neutral-200 pb-1">
                  <div>
                    <strong className="text-neutral-900">{p.playerName}</strong>
                    <span className="text-[10px] text-neutral-500 ml-1.5">
                      {gameState?.roundBreakdown?.[p.playerId] || ''}
                    </span>
                  </div>
                  <span className="font-black text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    +{gameState?.roundPoints?.[p.playerId] || 0} pts
                  </span>
                </div>
              ))}
            </div>

            {isHost ? (
              <CartoonButton variant="success" onClick={handleNextRound} className="w-full">
                Manche suivante
              </CartoonButton>
            ) : (
              <p className="text-center text-xs font-bold text-neutral-500">
                En attente de l'hôte pour lancer la manche suivante...
              </p>
            )}
          </section>
        )}
      </div>

      {/* MODAL ZOOM */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] bg-neutral-900 rounded-3xl border-4 border-yellow-400 overflow-hidden flex flex-col items-center p-3 shadow-[0_8px_0_#161513]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedCard(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={zoomedCard.imageUrl || zoomedCard.src}
              alt={zoomedCard.title}
              className="max-h-[70vh] w-auto object-contain rounded-xl my-2 border border-neutral-700"
            />
          </div>
        </div>
      )}
    </GameLayout>
  )
}
