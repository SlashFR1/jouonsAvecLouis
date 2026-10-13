import { Shield, Sparkles } from 'lucide-react'

export default function AliasScoreTracker({
  remainingByTeam = {},
  activeTeam = 'BLUE'
}) {
  const isBlue = activeTeam === 'BLUE' || activeTeam === 'JAUNE'
  const isRed = activeTeam === 'RED' || activeTeam === 'ROSE'
  const isGreen = activeTeam === 'GREEN'

  const blueLeft = remainingByTeam.BLUE ?? remainingByTeam.JAUNE ?? 7
  const redLeft = remainingByTeam.RED ?? remainingByTeam.ROSE ?? 6
  const greenLeft = remainingByTeam.GREEN

  const hasGreen = greenLeft !== undefined

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-2">
      {/* ÉQUIPE BLEU */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-3 border-blue-950 bg-blue-600 text-white font-black text-xs sm:text-sm shadow-[0_3px_0_#1e3a8a] transition-all ${
          isBlue ? 'ring-3 ring-blue-400 scale-105' : 'opacity-85'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Bleu</span>
        <div className="bg-black/30 px-1.5 py-0.5 rounded-lg text-xs font-black border border-white/20">
          {blueLeft}
        </div>
        {isBlue && <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />}
      </div>

      <span className="text-xs font-black text-neutral-500">VS</span>

      {/* ÉQUIPE ROUGE */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-3 border-red-950 bg-red-600 text-white font-black text-xs sm:text-sm shadow-[0_3px_0_#7f1d1d] transition-all ${
          isRed ? 'ring-3 ring-red-400 scale-105' : 'opacity-85'
        }`}
      >
        <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Rouge</span>
        <div className="bg-black/30 px-1.5 py-0.5 rounded-lg text-xs font-black border border-white/20">
          {redLeft}
        </div>
        {isRed && <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />}
      </div>

      {/* ÉQUIPE VERT (SI MODE 3 ÉQUIPES) */}
      {hasGreen && (
        <>
          <span className="text-xs font-black text-neutral-500">VS</span>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-3 border-emerald-950 bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-[0_3px_0_#064e3b] transition-all ${
              isGreen ? 'ring-3 ring-emerald-400 scale-105' : 'opacity-85'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Vert</span>
            <div className="bg-black/30 px-1.5 py-0.5 rounded-lg text-xs font-black border border-white/20">
              {greenLeft}
            </div>
            {isGreen && <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />}
          </div>
        </>
      )}
    </div>
  )
}
