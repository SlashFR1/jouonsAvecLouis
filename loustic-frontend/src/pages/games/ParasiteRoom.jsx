import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy, Moon, Sun, RotateCcw, LogOut, Skull, Rocket, Crosshair } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import RoomLobby from '../../components/common/RoomLobby'
import RoleCard from '../../components/games/RoleCard'
import NightActionModal from '../../components/games/NightActionModal'
import DayVoteView from '../../components/games/DayVoteView'
import { CARD_COLORS } from '../../config/games'
import { createRoom, joinRoom, leaveRoom } from '../../api/client'
import { useGameSocket } from '../../hooks/useGameSocket'
import { usePlayerIdentity } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.blue || '#bae6fd'

export default function ParasiteRoom() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [room, setRoom] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [myRoleData, setMyRoleData] = useState(null)
  const [alienVotes, setAlienVotes] = useState({})
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [selectedRevengeTarget, setSelectedRevengeTarget] = useState('')

  // Gestion des événements publics
  const onEvent = useCallback((evt) => {
    if (evt.room) setRoom(evt.room)
    switch (evt.type) {
      case 'PARASITE_STATE_UPDATED':
        setGameState(evt.payload)
        setError(null)
        break
      case 'PARASITE_ERROR':
        setError(evt.payload?.message || 'Erreur Parasite')
        break
      default:
    }
  }, [])

  // Canaux privés pour le joueur (Zero-Knowledge)
  const extraSubscriptions = useMemo(() => {
    if (!room?.code || !playerId) return {}
    const handlePrivate = (data) => {
      if (data?.type === 'PARASITE_PRIVATE_ROLE') {
        setMyRoleData(data)
      } else if (data?.type === 'ALIENS_VOTE_UPDATE') {
        setAlienVotes(data.votes || {})
      } else if (data?.type === 'SCIENTIFIQUE_RESULT') {
        setScanResult(data)
      }
    }
    return {
      [`/queue/player/${playerId}`]: handlePrivate,
      [`/topic/room/${room.code}/player/${playerId}`]: handlePrivate
    }
  }, [room?.code, playerId])

  const { connected, send } = useGameSocket(room?.code ?? null, onEvent, extraSubscriptions)

  // Reconnexion automatique et synchronisation F5
  useEffect(() => {
    if (connected && room?.code) {
      send('parasite/sync', { playerId })
    }
  }, [connected, room?.code, playerId, send])

  // Rejoindre la salle depuis l'URL
  useEffect(() => {
    if (!urlCode || room || !playerName) return
    joinRoom(urlCode, playerId, playerName)
      .then((r) => setRoom(r))
      .catch((e) => setError(e.message))
  }, [urlCode, room, playerId, playerName])

  useEffect(() => {
    document.title = room ? `Salle ${room.code} – Parasite – Loustic` : 'Parasite – Loustic'
  }, [room])

  const isHost = room?.hostId === playerId

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = await createRoom('parasite', playerId, playerName.trim())
      setRoom(r)
      navigate(`/salle/parasite/${r.code}`, { replace: true })
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
      navigate(`/salle/parasite/${r.code}`, { replace: true })
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

  // --- ACTIONS SERVEUR ---
  const handleOfficierAction = (lover1Id, lover2Id) => {
    send('parasite/officier', { playerId, lover1Id, lover2Id })
  }

  const handleGardeAction = (targetId) => {
    send('parasite/garde', { playerId, targetId })
  }

  const handleAlienVoteAction = (targetId) => {
    send('parasite/alien-vote', { playerId, targetId })
  }

  const handleAlphaKillAction = (targetId) => {
    send('parasite/alpha-kill', { playerId, targetId })
  }

  const handleScientifiqueScanAction = (targetId) => {
    send('parasite/scan', { playerId, targetId })
  }

  const handleMedecinAction = (useSave, killTargetId) => {
    send('parasite/medecin', { playerId, useSave, killTargetId })
  }

  const handleIngenieurRevenge = (targetId) => {
    send('parasite/ingenieur-revenge', { playerId, targetId })
  }

  const handleDayVote = (targetId) => {
    send('parasite/vote', { playerId, targetId })
  }

  const handleResolveDayVote = () => {
    send('parasite/resolve-vote', { playerId })
  }

  const connStatus = (
    <span
      className={`conn-dot ${connected ? 'is-on' : ''}`}
      title={connected ? 'Connecté' : 'Connexion…'}
    />
  )

  // 1. LOBBY INITIAL
  if (!room || !gameState || gameState.phase === 'LOBBY') {
    return (
      <GameLayout gameKey="parasite" title="Parasite 🦠" color={COLOR} onBack={handleQuit}>
        <RoomLobby
          title="Parasite 🦠"
          emoji="🚀"
          room={room}
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          connected={connected}
          busy={busy}
          error={error}
          minPlayers={3}
          startLabel="🚀 Lancer la partie Parasite"
          onCreate={handleCreate}
          onJoin={handleJoin}
          onStart={() => send('parasite/start', { playerId })}
        />
      </GameLayout>
    )
  }

  // 2. RÉVÉLATION SECRÈTE DES RÔLES (ROLE_REVEAL)
  if (gameState.phase === 'ROLE_REVEAL') {
    return (
      <GameLayout
        gameKey="parasite"
        title="Attribution des Rôles 🚀"
        color={COLOR}
        right={connStatus}
        onBack={handleQuit}
      >
        <RoleCard roleData={myRoleData} />
        {isHost && (
          <div className="flex justify-center mt-3">
            <CartoonButton
              onClick={() => send('parasite/night', { playerId })}
              color="black"
              className="!py-3 !px-6 text-sm flex items-center gap-2"
            >
              <Moon className="w-4 h-4 text-amber-300" />
              <span>Lancer la Nuit 1</span>
            </CartoonButton>
          </div>
        )}
      </GameLayout>
    )
  }

  // 3. PHASES DE NUIT (NIGHT_START, NIGHT_OFFICIER, NIGHT_GARDE, etc.)
  const isNightPhase = gameState.phase.startsWith('NIGHT_')
  if (isNightPhase) {
    return (
      <GameLayout
        gameKey="parasite"
        title={`Nuit ${gameState.dayNumber} 🌙`}
        color="#0f172a"
        right={connStatus}
        onBack={handleQuit}
      >
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          {gameState.lastAction && (
            <div className="text-xs font-bold text-amber-200 bg-neutral-900/90 px-3 py-1 rounded-full border border-amber-300 my-2 text-center">
              {gameState.lastAction}
            </div>
          )}

          <NightActionModal
            phase={gameState.phase}
            myPlayerId={playerId}
            myRoleData={myRoleData}
            players={gameState.players || []}
            alienVotes={alienVotes}
            scanResult={scanResult}
            onOfficierAction={handleOfficierAction}
            onGardeAction={handleGardeAction}
            onAlienVoteAction={handleAlienVoteAction}
            onAlphaKillAction={handleAlphaKillAction}
            onScientifiqueScanAction={handleScientifiqueScanAction}
            onMedecinAction={handleMedecinAction}
          />
        </div>
      </GameLayout>
    )
  }

  // 4. TIR DE VENGEANCE DE L'INGÉNIEUR
  if (gameState.phase === 'DAY_INGENIEUR_REVENGE') {
    const isMeEngineer = gameState.revengeEngineerId === playerId

    return (
      <GameLayout
        gameKey="parasite"
        title="💥 Tir de Vengeance !"
        color="#f87171"
        right={connStatus}
        onBack={handleQuit}
      >
        <div className="w-full max-w-md mx-auto my-4 p-5 bg-red-100 border-3 border-red-900 rounded-3xl shadow-[0_6px_0_#991b1b] text-center flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 text-red-950 font-black text-lg">
            <Crosshair className="w-6 h-6 text-red-600" />
            <span>Ultime Souffle de l’Ingénieur !</span>
          </div>
          <p className="text-xs font-bold text-neutral-800">
            L’Ingénieur a été éliminé ! Avant de succomber, il emporte un suspect dans la mort avec son arme d’appoint.
          </p>

          {isMeEngineer ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-red-900">Choisissez qui vous emportez avec vous :</span>
              <div className="grid grid-cols-2 gap-2 my-2">
                {(gameState.players || [])
                  .filter((p) => p.alive && p.id !== playerId)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedRevengeTarget(p.id)}
                      className={`p-3 rounded-2xl border-2 border-neutral-900 font-black text-xs ${
                        selectedRevengeTarget === p.id ? 'bg-red-600 text-white' : 'bg-white text-neutral-900'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
              <CartoonButton
                disabled={!selectedRevengeTarget}
                onClick={() => handleIngenieurRevenge(selectedRevengeTarget)}
                color="black"
                className="w-full !py-3 flex items-center justify-center gap-2"
              >
                <Skull className="w-4 h-4 text-red-400" />
                <span>Déclencher le tir fatal</span>
              </CartoonButton>
            </div>
          ) : (
            <div className="p-4 bg-white/70 rounded-2xl border-2 border-neutral-900 text-xs font-bold italic text-neutral-700">
              ⏳ L’Ingénieur agonisant ajuste sa mire sur un suspect...
            </div>
          )}
        </div>
      </GameLayout>
    )
  }

  // 5. AUBE / ANNONCE DES MORTS DU MATIN (DAY_REVEAL)
  if (gameState.phase === 'DAY_REVEAL') {
    const deadList = gameState.deadThisCycle || []

    return (
      <GameLayout
        gameKey="parasite"
        title={`Jour ${gameState.dayNumber} ☀️`}
        color="#fed7aa"
        right={connStatus}
        onBack={handleQuit}
      >
        <div className="w-full max-w-md mx-auto my-4 p-5 bg-amber-50 border-3 border-neutral-900 rounded-3xl shadow-[0_6px_0_#161513] text-center flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 text-neutral-900 font-black text-lg">
            <Sun className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>L’Aube se Lève sur la Colonie</span>
          </div>

          {deadList.length === 0 ? (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-800 rounded-2xl text-emerald-950 font-black text-sm">
              ✨ Miraculeux ! Aucun habitant n’a péri cette nuit !
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-red-800 uppercase tracking-wide">
                Victimes découvertes au matin :
              </span>
              <div className="flex flex-col gap-2">
                {deadList.map((victim, i) => (
                  <div
                    key={i}
                    className="p-3 bg-red-100 border-2 border-red-800 rounded-2xl text-red-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_2px_0_#991b1b]"
                  >
                    <Skull className="w-4 h-4 text-red-600" />
                    <span>{victim}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isHost && (
            <CartoonButton
              onClick={() => send('parasite/debate', { playerId })}
              color="black"
              className="w-full !py-3 flex items-center justify-center gap-2 mt-2"
            >
              <span>Lancer le débat colonial (90s) 🗣️</span>
            </CartoonButton>
          )}
        </div>
      </GameLayout>
    )
  }

  // 6. DÉBAT GÉNÉRAL (DAY_DEBATE)
  if (gameState.phase === 'DAY_DEBATE') {
    return (
      <GameLayout
        gameKey="parasite"
        title="Débat Général 🗣️"
        color="#fef08a"
        right={connStatus}
        onBack={handleQuit}
      >
        <div className="w-full max-w-md mx-auto my-4 p-5 bg-white border-3 border-neutral-900 rounded-3xl shadow-[0_6px_0_#161513] text-center flex flex-col gap-4">
          <h3 className="text-2xl font-black text-neutral-900 uppercase">
            Phase de Débat Colonial
          </h3>
          <p className="text-xs sm:text-sm font-bold text-neutral-700 leading-relaxed">
            Échangez à voix haute ! Analysez les absences, les accusations et les hésitations.
            Qui est le parasite infiltré à bord ?
          </p>

          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-neutral-900 text-xs font-bold text-neutral-800">
            Survivants en jeu : <strong>{gameState.players?.filter((p) => p.alive).length}</strong>
          </div>

          {isHost && (
            <CartoonButton
              onClick={() => send('parasite/start-vote', { playerId })}
              color="black"
              className="w-full !py-3 flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Ouvrir le Vote du Sas Spatial</span>
            </CartoonButton>
          )}
        </div>
      </GameLayout>
    )
  }

  // 7. VOTE DU SAS (DAY_VOTE)
  if (gameState.phase === 'DAY_VOTE') {
    return (
      <GameLayout
        gameKey="parasite"
        title="Tribunal du Sas 🚀"
        color="#fecaca"
        right={connStatus}
        onBack={handleQuit}
      >
        <DayVoteView
          players={gameState.players || []}
          myPlayerId={playerId}
          isHost={isHost}
          votesCount={gameState.votesCount || 0}
          onVote={handleDayVote}
          onResolveVote={handleResolveDayVote}
        />
      </GameLayout>
    )
  }

  // 8. RÉSULTAT DU VOTE & ÉJECTION (DAY_VOTE_RESULT)
  if (gameState.phase === 'DAY_VOTE_RESULT') {
    const eliminated = gameState.lastEliminated

    return (
      <GameLayout
        gameKey="parasite"
        title="Verdict du Sas 🚀"
        color="#cbd5e1"
        right={connStatus}
        onBack={handleQuit}
      >
        <div className="w-full max-w-md mx-auto my-4 p-5 bg-white border-3 border-neutral-900 rounded-3xl shadow-[0_6px_0_#161513] text-center flex flex-col gap-4">
          <div className="w-16 h-16 rounded-full bg-neutral-900 text-white border-3 border-red-500 flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <Rocket className="w-8 h-8 text-red-400 rotate-45" />
          </div>

          {eliminated ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black text-neutral-900 uppercase">
                {eliminated.name} est éjecté(e) !
              </h3>
              <div className="p-3 bg-neutral-900 text-amber-300 rounded-2xl border-2 border-neutral-900 text-sm font-black">
                Rôle révélé : {eliminated.roleName}
              </div>
              <p className="text-xs text-neutral-600 font-bold italic px-2">
                {eliminated.description}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-100 rounded-2xl border-2 border-neutral-900 text-sm font-black text-neutral-800">
              🤝 Égalité de voix ! Personne n’a été éjecté par le sas aujourd’hui.
            </div>
          )}

          {isHost && (
            <CartoonButton
              onClick={() => send('parasite/night', { playerId })}
              color="black"
              className="w-full !py-3 flex items-center justify-center gap-2 mt-2"
            >
              <Moon className="w-4 h-4 text-amber-300" />
              <span>Lancer la Nuit Suivante</span>
            </CartoonButton>
          )}
        </div>
      </GameLayout>
    )
  }

  // 9. FIN DE PARTIE / PODIUM (GAME_OVER)
  return (
    <GameLayout
      gameKey="parasite"
      title="Partie Terminée 🏆"
      color={COLOR}
      right={connStatus}
      onBack={handleQuit}
    >
      <div className="w-full max-w-lg mx-auto my-4 p-6 bg-white border-4 border-neutral-900 rounded-3xl shadow-[0_8px_0_#161513] text-center flex flex-col items-center gap-4 animate-bounce-in">
        <div className="w-16 h-16 rounded-full bg-yellow-300 border-3 border-neutral-900 flex items-center justify-center shadow-[0_4px_0_#161513]">
          <Trophy className="w-8 h-8 text-neutral-900 fill-amber-500" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase">
            {gameState.winnerCamp === 'COLONIE'
              ? 'Victoire de la Colonie ! 🧑‍🚀'
              : gameState.winnerCamp === 'ALIENS'
              ? 'Victoire des Aliens ! 👽'
              : gameState.winnerCamp === 'ALPHA'
              ? 'Victoire de l’Alpha Solitaire ! 🐺'
              : gameState.winnerCamp === 'AMOUREUX'
              ? 'Victoire des Amoureux ! 💕'
              : 'Égalité Spatiale 🌌'}
          </h2>
          <p className="text-sm font-bold text-neutral-600 mt-1">
            {gameState.winMessage || gameState.lastAction}
          </p>
        </div>

        {/* RÉVÉLATION COMPLÈTE DE TOUS LES RÔLES */}
        <div className="w-full bg-amber-50 p-3 rounded-2xl border-2 border-neutral-900 text-left my-2">
          <span className="text-xs font-black uppercase text-neutral-900 block mb-2">
            Rôles de tous les joueurs :
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(gameState.players || []).map((p) => (
              <div
                key={p.id}
                className="p-2 bg-white rounded-xl border border-neutral-300 flex items-center justify-between"
              >
                <span className="font-bold text-neutral-800">{p.name}</span>
                <span className="font-black text-neutral-900 bg-amber-200 px-2 py-0.5 rounded-md border border-neutral-900">
                  {p.revealedRole || 'Inconnu'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOUTONS NOUVELLE PARTIE / QUITTER */}
        <div className="flex gap-2 w-full pt-2">
          {isHost ? (
            <CartoonButton
              onClick={() => send('parasite/new-game', { playerId })}
              color="black"
              className="flex-1 !py-3 text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nouvelle Partie</span>
            </CartoonButton>
          ) : (
            <div className="flex-1 text-xs font-bold text-neutral-500 py-2">
              L’hôte peut relancer la partie...
            </div>
          )}
          <CartoonButton
            onClick={handleQuit}
            color="yellow"
            className="!py-3 text-xs flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Quitter</span>
          </CartoonButton>
        </div>
      </div>
    </GameLayout>
  )
}
