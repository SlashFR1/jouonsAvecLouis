import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy, RotateCcw, AlertTriangle, LogOut } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import AliasLobby from '../../components/games/AliasLobby'
import SpymasterView from '../../components/games/SpymasterView'
import OperatorView from '../../components/games/OperatorView'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'
import { aliasAudio } from '../../utils/aliasAudio'

const COLOR = CARD_COLORS.yellow

export default function AliasRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [spymasterData, setSpymasterData] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const prevRevealedCountRef = useRef(0)
  const prevWinnerRef = useRef(null)

  // Gestion des événements WebSocket
  const onEvent = useCallback((evt) => {
    if (evt.room) setRoom(evt.room)
    switch (evt.type) {
      case 'ALIAS_STATE_UPDATED':
        setGameState(evt.payload)
        setError(null)
        break
      case 'ALIAS_ERROR':
        setError(evt.payload?.message || 'Erreur dans la partie')
        break
      default:
    }
  }, [])

  // Abonnement au canal secret du Maître Espion
  const extraSubscriptions = useMemo(() => {
    if (!room?.code) return {}
    return {
      [`/topic/alias/${room.code}/spymaster`]: (data) => {
        setSpymasterData(data)
      }
    }
  }, [room?.code])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  // Reconnexion ou synchronisation automatique
  useEffect(() => {
    if (connected && room?.code) {
      send('alias/sync', { playerId })
    }
  }, [connected, room?.code, playerId, send])

  // Rejoindre la salle depuis l'URL
  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName)
      .then((r) => {
        setRoom(r)
      })
      .catch((e) => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Alias (Codenames) – Loustic` : 'Alias – Loustic'
  }, [room])

  // Détection des sons lors des changements de cartes
  useEffect(() => {
    if (!gameState?.cards) return

    // 1. Détection de victoire
    if (gameState.winner && !prevWinnerRef.current) {
      aliasAudio.playVictory()
    }
    prevWinnerRef.current = gameState.winner

    // 2. Détection de carte révélée
    const revealedCards = gameState.cards.filter((c) => c.revealed)
    if (revealedCards.length > prevRevealedCountRef.current) {
      // Trouver la dernière carte révélée
      const lastRevealed = revealedCards[revealedCards.length - 1]
      if (lastRevealed) {
        if (lastRevealed.type === 'ASSASSIN') {
          aliasAudio.playAssassinCard()
        } else if (lastRevealed.type === `TEAM_${gameState.activeTeam}`) {
          aliasAudio.playTeamCard()
        } else if (lastRevealed.type === 'NEUTRAL') {
          aliasAudio.playNeutralCard()
        } else {
          aliasAudio.playOpponentCard()
        }
      }
    }
    prevRevealedCountRef.current = revealedCards.length
  }, [gameState?.cards, gameState?.winner, gameState?.activeTeam])

  // Informations joueur courant
  const myPlayer = gameState?.players?.find((p) => p.id === playerId)
  const isSpymaster = myPlayer?.role === 'SPYMASTER'
  const myTeam = myPlayer?.team || 'ROSE'
  const isHost = room?.hostId === playerId

  // Fusionner les cartes : si Maître Espion, injecter les vraies couleurs depuis spymasterData
  const displayCards = useMemo(() => {
    const cards = gameState?.cards
    if (!cards) return []
    if (isSpymaster && spymasterData?.fullCards) {
      return spymasterData.fullCards.map((sc) => {
        const publicCard = cards.find((c) => c.id === sc.id)
        return {
          ...sc,
          revealed: publicCard?.revealed ?? sc.revealed
        }
      })
    }
    return cards
  }, [gameState, isSpymaster, spymasterData])

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('alias', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/alias/${r.code}`, { replace: true })
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
      navigate(`/salle/alias/${r.code}`, { replace: true })
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

  // --- ACTIONS DU JEU ---
  const handleSelectTeamAndRole = (team, role) => {
    send('alias/join-team', { playerId, team, role })
  }

  const handleChangeTeamsCount = (count) => {
    send('alias/set-teams-count', { playerId, count })
  }

  const handleStartGame = () => {
    send('alias/start-game', { playerId })
  }

  const handleSubmitClue = (word, count) => {
    send('alias/submit-clue', { playerId, word, count })
  }

  const handleRevealCard = (cardId) => {
    send('alias/reveal-card', { playerId, cardId })
  }

  const handleEndTurn = () => {
    send('alias/end-turn', { playerId })
  }

  const handleNewGame = () => {
    send('alias/new-game', { playerId })
  }

  const connStatus = (
    <span
      className={`conn-dot ${connected ? 'is-on' : ''}`}
      title={connected ? 'Connecté' : 'Connexion…'}
    />
  )

  // 1. SALLE D'ATTENTE INITIALE (LOBBY)
  if (!room || !gameState || gameState.phase === 'LOBBY') {
    return (
      <GameLayout gameKey="alias" title="Alias (Codenames) 🕵️" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Alias 🕵️"
          emoji="🔍"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={2}
          startLabel="🕵️ Choisir les Équipes"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('alias/start', { playerId })}
        />
      </GameLayout>
    )
  }

  // 2. SÉLECTION DES ÉQUIPES ET RÔLES (ROLE_SELECTION)
  if (gameState.phase === 'ROLE_SELECTION') {
    return (
      <GameLayout
        gameKey="alias"
        title="Alias – Choix des Équipes 🕵️"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
      >
        {error && (
          <div className="w-full max-w-md mx-auto mb-3 p-2 bg-red-100 border-2 border-red-800 rounded-xl text-red-800 text-xs font-bold text-center">
            {error}
          </div>
        )}
        <AliasLobby
          players={gameState.players || []}
          myPlayerId={playerId}
          isHost={isHost}
          teamsCount={gameState.teamsCount || 2}
          onSelectTeamAndRole={handleSelectTeamAndRole}
          onChangeTeamsCount={handleChangeTeamsCount}
          onStartGame={handleStartGame}
        />
      </GameLayout>
    )
  }

  // 3. PLATEAU DE JEU EN COURS
  return (
    <GameLayout
      gameKey="alias"
      title="Alias (Codenames 5×5) 🕵️"
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Bannière de statut / Action récente */}
        {gameState.lastAction && (
          <div className="text-xs sm:text-sm font-bold text-neutral-800 bg-amber-100/90 px-3 py-1 rounded-full border-2 border-neutral-900 shadow-[0_2px_0_#161513] my-1 text-center">
            {gameState.lastAction}
          </div>
        )}

        {/* Message d'erreur éventuel */}
        {error && (
          <div className="w-full max-w-md mx-auto my-1 p-2 bg-red-100 border-2 border-red-800 rounded-xl text-red-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* VUE MAÎTRE ESPION OU OPÉRATEUR */}
        {isSpymaster ? (
          <SpymasterView
            gameState={gameState}
            cards={displayCards}
            myTeam={myTeam}
            onSubmitClue={handleSubmitClue}
            onEndTurn={handleEndTurn}
          />
        ) : (
          <OperatorView
            gameState={gameState}
            cards={displayCards}
            myTeam={myTeam}
            onRevealCard={handleRevealCard}
            onEndTurn={handleEndTurn}
          />
        )}

        {/* Modale / Écran de Fin de Partie */}
        {gameState.phase === 'GAME_OVER' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border-4 border-neutral-900 rounded-3xl p-6 text-center shadow-[0_8px_0_#161513] animate-bounce-in flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-300 border-3 border-neutral-900 flex items-center justify-center shadow-[0_4px_0_#161513]">
                <Trophy className="w-8 h-8 text-neutral-900 fill-amber-500" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase">
                  Victoire de l’{gameState.winner === 'ROSE' || gameState.winner === 'RED' ? 'Équipe Rose 🌸' : 'Équipe Jaune ⚡'} ! 🎉
                </h3>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  {gameState.lastAction || 'Tous les mots secrets ont été identifiés !'}
                </p>
              </div>

              {/* Roster de l'équipe gagnante */}
              <div className="w-full bg-amber-50 p-3 rounded-2xl border-2 border-neutral-900 text-xs font-bold text-neutral-800">
                <span className="font-black text-sm block mb-1">Équipe Championne :</span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {(gameState.players || [])
                    .filter((p) => p.team === gameState.winner)
                    .map((p) => (
                      <span
                        key={p.id}
                        className="bg-white px-2 py-0.5 rounded-lg border border-neutral-300 font-black"
                      >
                        {p.name} ({p.role === 'SPYMASTER' ? 'Maître Espion' : 'Agent'})
                      </span>
                    ))}
                </div>
              </div>

              {/* Bouton pour relancer un plateau */}
              <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                {isHost ? (
                  <CartoonButton
                    onClick={handleNewGame}
                    color="black"
                    className="flex-1 flex items-center justify-center gap-2 !py-2.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Nouvelle Grille 6×5</span>
                  </CartoonButton>
                ) : (
                  <div className="flex-1 text-xs font-bold text-neutral-500 py-2">
                    L’hôte peut relancer une partie...
                  </div>
                )}
                <CartoonButton
                  onClick={handleQuit}
                  color="yellow"
                  className="flex items-center justify-center gap-1.5 !py-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Quitter</span>
                </CartoonButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
