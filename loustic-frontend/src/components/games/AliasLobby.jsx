import { Shield, Sparkles, Eye, Users, Play, CheckCircle2 } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

const TEAMS_CONFIG = [
  {
    id: 'BLUE',
    name: 'Équipe Bleu',
    headerBg: 'bg-blue-600 text-white',
    border: 'border-blue-950',
    icon: <Sparkles className="w-4 h-4 stroke-[2.5]" />,
  },
  {
    id: 'RED',
    name: 'Équipe Rouge',
    headerBg: 'bg-red-600 text-white',
    border: 'border-red-950',
    icon: <Shield className="w-4 h-4 stroke-[2.5]" />,
  },
  {
    id: 'GREEN',
    name: 'Équipe Vert',
    headerBg: 'bg-emerald-600 text-white',
    border: 'border-emerald-950',
    icon: <Sparkles className="w-4 h-4 stroke-[2.5]" />,
  },
]

export default function AliasLobby({
  players = [],
  slots = [],
  gameMode = 'TWO_TEAMS',
  allSlotsOccupied = false,
  myPlayerId,
  isHost,
  onChangeMode,
  onSelectTeamAndRole,
  onStartGame,
}) {
  const isThreeTeams = gameMode === 'THREE_TEAMS'
  const activeTeams = isThreeTeams ? TEAMS_CONFIG : TEAMS_CONFIG.slice(0, 2)
  const requiredCount = isThreeTeams ? 6 : 4

  // Trouver mon slot actuel
  const mySlot = slots.find((s) => s.playerId === myPlayerId)

  // Vérifier si tous les slots nécessaires sont occupés
  const occupiedSlotsCount = slots.filter((s) => {
    const isRelevantTeam = activeTeams.some((t) => t.id === s.team)
    return isRelevantTeam && s.occupied
  }).length

  const canStart = isHost && (allSlotsOccupied || occupiedSlotsCount >= requiredCount)

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 flex flex-col gap-5">
      {/* En-tête */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Lobby Codenames (Alias)
        </h2>
        <p className="text-xs sm:text-sm font-bold text-neutral-600 max-w-md">
          Chaque joueur doit sélectionner un slot exclusif (1 Maître Espion et 1 Agent par équipe).
        </p>
      </div>

      {/* Sélecteur de Mode (Hôte) */}
      <div className="p-3 bg-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">
            Format de jeu
          </span>
          <div className="text-sm font-black text-neutral-900">
            {isThreeTeams ? '3 Équipes (6 Joueurs, 30 cartes 6×5)' : '2 Équipes (4 Joueurs, 20 cartes 5×4)'}
          </div>
        </div>

        {isHost ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChangeMode?.(2)}
              className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs transition-all ${
                !isThreeTeams
                  ? 'bg-yellow-400 text-neutral-900 border-neutral-900 shadow-[2px_2px_0_#161513]'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-300'
              }`}
            >
              2 Équipes (4 Joueurs)
            </button>
            <button
              type="button"
              onClick={() => onChangeMode?.(3)}
              className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs transition-all ${
                isThreeTeams
                  ? 'bg-yellow-400 text-neutral-900 border-neutral-900 shadow-[2px_2px_0_#161513]'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-300'
              }`}
            >
              3 Équipes (6 Joueurs)
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
            Choisi par l'hôte
          </span>
        )}
      </div>

      {/* Cartes d'équipes et Slots Exclusifs */}
      <div className={`grid grid-cols-1 ${isThreeTeams ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3.5`}>
        {activeTeams.map((team) => {
          const teamSlots = slots.filter((s) => s.team === team.id)
          const masterSlot = teamSlots.find((s) => s.role === 'SPYMASTER')
          const agentSlot = teamSlots.find((s) => s.role === 'OPERATOR' || s.role === 'AGENT')

          return (
            <div
              key={team.id}
              className={`p-3.5 rounded-3xl border-3 ${team.border} bg-white shadow-[4px_4px_0_#161513] flex flex-col justify-between gap-3`}
            >
              <div className={`flex items-center justify-between p-2 rounded-xl border-2 border-neutral-900 ${team.headerBg}`}>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  {team.icon}
                  <span>{team.name}</span>
                </div>
                <span className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded-md">
                  2 rôles requis
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {/* Slot Maître Espion */}
                <div className="p-2.5 rounded-xl border-2 border-neutral-900 bg-neutral-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-black uppercase text-purple-900">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Maître Espion</span>
                    </div>
                    <div className="text-xs font-extrabold text-neutral-800 mt-0.5">
                      {masterSlot?.occupied ? (
                        <span className="text-purple-700">
                          {masterSlot.playerName}
                          {masterSlot.playerId === myPlayerId && ' (Vous)'}
                        </span>
                      ) : (
                        <span className="italic text-neutral-400 font-medium">Slot Libre</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={masterSlot?.occupied && masterSlot.playerId !== myPlayerId}
                    onClick={() => onSelectTeamAndRole?.(team.id, 'SPYMASTER')}
                    className={`px-2.5 py-1.5 rounded-lg border-2 font-black text-[10px] uppercase transition-all ${
                      masterSlot?.playerId === myPlayerId
                        ? 'bg-purple-600 text-white border-purple-950'
                        : masterSlot?.occupied
                        ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
                        : 'bg-white hover:bg-yellow-300 text-neutral-900 border-neutral-900 shadow-[1px_1px_0_#161513]'
                    }`}
                  >
                    {masterSlot?.playerId === myPlayerId ? 'Occupé' : masterSlot?.occupied ? 'Pris' : 'Prendre'}
                  </button>
                </div>

                {/* Slot Agent / Opérateur */}
                <div className="p-2.5 rounded-xl border-2 border-neutral-900 bg-neutral-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-black uppercase text-emerald-900">
                      <Users className="w-3.5 h-3.5" />
                      <span>Agent</span>
                    </div>
                    <div className="text-xs font-extrabold text-neutral-800 mt-0.5">
                      {agentSlot?.occupied ? (
                        <span className="text-emerald-700">
                          {agentSlot.playerName}
                          {agentSlot.playerId === myPlayerId && ' (Vous)'}
                        </span>
                      ) : (
                        <span className="italic text-neutral-400 font-medium">Slot Libre</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={agentSlot?.occupied && agentSlot.playerId !== myPlayerId}
                    onClick={() => onSelectTeamAndRole?.(team.id, 'OPERATOR')}
                    className={`px-2.5 py-1.5 rounded-lg border-2 font-black text-[10px] uppercase transition-all ${
                      agentSlot?.playerId === myPlayerId
                        ? 'bg-emerald-600 text-white border-emerald-950'
                        : agentSlot?.occupied
                        ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
                        : 'bg-white hover:bg-yellow-300 text-neutral-900 border-neutral-900 shadow-[1px_1px_0_#161513]'
                    }`}
                  >
                    {agentSlot?.playerId === myPlayerId ? 'Occupé' : agentSlot?.occupied ? 'Pris' : 'Prendre'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bouton de lancement */}
      <div className="mt-2 flex flex-col items-center gap-2">
        {isHost ? (
          <CartoonButton
            id="start-alias-btn"
            variant="default"
            disabled={!canStart}
            onClick={onStartGame}
            className="w-full max-w-md text-base"
          >
            <Play className="w-5 h-5 mr-2" />
            {canStart
              ? 'Lancer la Partie'
              : `En attente des slots (${occupiedSlotsCount}/${requiredCount} occupés)`}
          </CartoonButton>
        ) : (
          <div className="p-3 bg-neutral-100 rounded-2xl border-2 border-neutral-300 text-center text-xs font-bold text-neutral-600 w-full max-w-md">
            {canStart
              ? "Tous les slots sont remplis ! En attente de l'hôte..."
              : `En attente des autres joueurs (${occupiedSlotsCount}/${requiredCount} occupés)...`}
          </div>
        )}
      </div>
    </div>
  )
}
