import { Shield, Sparkles } from 'lucide-react'

export default function AliasScoreTracker({
  remainingByTeam = {},
  activeTeam = 'ROSE'
}) {
  const isRose = activeTeam === 'ROSE' || activeTeam === 'RED'
  const isJaune = activeTeam === 'JAUNE' || activeTeam === 'BLUE'

  const roseLeft = remainingByTeam.ROSE ?? remainingByTeam.RED ?? 9
  const jauneLeft = remainingByTeam.JAUNE ?? remainingByTeam.BLUE ?? 8

  return (
    <div className="w-full flex items-center justify-center gap-3 sm:gap-6 my-2">
      {/* ÉQUIPE ROSE */}
      <div
        className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border-3 border-pink-900 bg-pink-500 text-white font-black text-sm sm:text-base shadow-[0_4px_0_#831843] transition-all ${
          isRose ? 'ring-4 ring-pink-400 ring-offset-2 scale-105' : 'opacity-85'
        }`}
      >
        <Shield className="w-4 h-4 stroke-[2.5]" />
        <span>Équipe Rose</span>
        <div className="bg-black/30 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black border border-white/20">
          {roseLeft} restante{roseLeft > 1 ? 's' : ''}
        </div>
        {isRose && <span className="w-2 h-2 rounded-full bg-white animate-ping ml-1" />}
      </div>

      <span className="text-xl font-black text-neutral-800">VS</span>

      {/* ÉQUIPE JAUNE */}
      <div
        className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border-3 border-amber-800 bg-amber-400 text-neutral-950 font-black text-sm sm:text-base shadow-[0_4px_0_#78350f] transition-all ${
          isJaune ? 'ring-4 ring-amber-400 ring-offset-2 scale-105' : 'opacity-85'
        }`}
      >
        <Sparkles className="w-4 h-4 stroke-[2.5]" />
        <span>Équipe Jaune</span>
        <div className="bg-black/20 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black border border-black/20">
          {jauneLeft} restante{jauneLeft > 1 ? 's' : ''}
        </div>
        {isJaune && <span className="w-2 h-2 rounded-full bg-neutral-900 animate-ping ml-1" />}
      </div>
    </div>
  )
}
