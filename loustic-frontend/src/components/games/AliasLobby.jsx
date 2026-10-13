import { Shield, Sparkles, Eye, Users, Play } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

export default function AliasLobby({
  players = [],
  myPlayerId,
  isHost,
  onSelectTeamAndRole,
  onStartGame
}) {
  const myPlayer = players.find((p) => p.id === myPlayerId)
  const myTeam = myPlayer?.team || 'ROSE'
  const myRole = myPlayer?.role || 'OPERATOR'

  const teams = [
    {
      id: 'ROSE',
      aliasId: 'RED',
      name: 'Équipe Rose',
      color: 'bg-pink-500 text-white',
      border: 'border-pink-900',
      badge: 'bg-pink-700',
      icon: <Shield className="w-5 h-5 stroke-[2.5]" />
    },
    {
      id: 'JAUNE',
      aliasId: 'BLUE',
      name: 'Équipe Jaune',
      color: 'bg-amber-400 text-neutral-950',
      border: 'border-amber-800',
      badge: 'bg-amber-500',
      icon: <Sparkles className="w-5 h-5 stroke-[2.5]" />
    }
  ]

  const isPlayerInTeam = (p, t) => p.team === t.id || p.team === t.aliasId

  const canStart =
    isHost &&
    teams.every((t) => players.some((p) => isPlayerInTeam(p, t)))

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Choix des Équipes & des Rôles
        </h2>
        <p className="text-sm font-bold text-neutral-600 max-w-md">
          Chaque équipe (Rose & Jaune) doit désigner <strong>1 Maître Espion</strong> qui voit
          la grille secrète, et des <strong>Opérateurs</strong> qui désamorcent les mots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((t) => {
          const teamPlayers = players.filter((p) => isPlayerInTeam(p, t))
          const spymaster = teamPlayers.find((p) => p.role === 'SPYMASTER')
          const operators = teamPlayers.filter((p) => p.role === 'OPERATOR' || p.role === 'AGENT')
          const isMyTeam = myTeam === t.id || myTeam === t.aliasId

          return (
            <div
              key={t.id}
              className={`p-4 rounded-3xl border-3 ${t.border} bg-white shadow-[0_4px_0_#161513] flex flex-col justify-between gap-4`}
            >
              <div>
                <div
                  className={`flex items-center justify-between p-2.5 rounded-2xl border-2 border-neutral-900 ${t.color}`}
                >
                  <div className="flex items-center gap-2 font-black text-base">
                    {t.icon}
                    <span>{t.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-lg border border-white/20">
                    {teamPlayers.length} joueur{teamPlayers.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2.5 text-xs">
                  {/* Maître Espion */}
                  <div className="p-2 rounded-xl bg-purple-50 border-2 border-neutral-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Eye className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                      <span>Maître Espion :</span>
                    </div>
                    {spymaster ? (
                      <span className="font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-300">
                        {spymaster.name}
                        {spymaster.id === myPlayerId && ' (Vous)'}
                      </span>
                    ) : (
                      <span className="italic text-neutral-400 font-semibold">(Libre)</span>
                    )}
                  </div>

                  {/* Opérateurs */}
                  <div className="p-2 rounded-xl bg-amber-50 border-2 border-neutral-900 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Users className="w-4 h-4 text-neutral-800 stroke-[2.5]" />
                      <span>Opérateurs :</span>
                    </div>
                    {operators.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {operators.map((a) => (
                          <span
                            key={a.id}
                            className="font-bold text-neutral-800 bg-white px-2 py-0.5 rounded-lg border border-neutral-300"
                          >
                            {a.name}
                            {a.id === myPlayerId && ' (Vous)'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-neutral-400 font-semibold">(Aucun opérateur)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons rejoindre */}
              <div className="flex flex-col gap-2 pt-2 border-t-2 border-dashed border-neutral-200">
                <button
                  type="button"
                  onClick={() => onSelectTeamAndRole(t.id, 'SPYMASTER')}
                  className={`w-full py-2 px-3 rounded-xl border-2 border-neutral-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isMyTeam && myRole === 'SPYMASTER'
                      ? 'bg-purple-600 text-white shadow-[0_2px_0_#161513]'
                      : 'bg-purple-100 text-purple-950 hover:bg-purple-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {isMyTeam && myRole === 'SPYMASTER'
                      ? '✓ Vous êtes Maître Espion'
                      : 'Devenir Maître Espion'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTeamAndRole(t.id, 'OPERATOR')}
                  className={`w-full py-2 px-3 rounded-xl border-2 border-neutral-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isMyTeam && myRole !== 'SPYMASTER'
                      ? 'bg-neutral-900 text-white shadow-[0_2px_0_#161513]'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {isMyTeam && myRole !== 'SPYMASTER'
                      ? '✓ Vous êtes Opérateur'
                      : 'Rejoindre comme Opérateur'}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2 mt-2">
        {isHost ? (
          <CartoonButton
            onClick={onStartGame}
            disabled={!canStart}
            color="black"
            className="!py-3 !px-8 text-base flex items-center gap-2 shadow-[0_4px_0_#161513]"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Lancer la partie Alias (Grille 5×5)</span>
          </CartoonButton>
        ) : (
          <div className="text-sm font-bold text-neutral-600 italic bg-amber-100 px-4 py-2 rounded-2xl border-2 border-neutral-900">
            ⏳ En attente du lancement par l’hôte...
          </div>
        )}
      </div>
    </div>
  )
}
