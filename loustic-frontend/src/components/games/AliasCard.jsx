import { Shield, Sparkles, User, Bomb } from 'lucide-react'

/**
 * Composant de carte pour la grille Alias (5x5 = 25 mots).
 * Respecte la règle Zero-Knowledge :
 * - Les opérateurs reçoivent le type "UNKNOWN" tant que la carte n'est pas révélée.
 * - Le Maître Espion voit la coloration secrète intégrale (Rose, Jaune, Neutre, Bombe).
 */
export default function AliasCard({
  card,
  isSpymaster = false,
  canClick = false,
  onReveal
}) {
  const { id, word, type, revealed } = card

  const getTypeStyles = (t) => {
    switch (t) {
      case 'TEAM_ROSE':
      case 'TEAM_RED':
        return {
          bg: 'bg-pink-500 text-white border-pink-900 shadow-[0_4px_0_#831843]',
          spymasterBg: 'bg-pink-100 text-pink-950 border-pink-800 shadow-[0_3px_0_#831843]',
          badgeBg: 'bg-pink-600 text-white',
          label: 'Rose',
          icon: <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
        }
      case 'TEAM_JAUNE':
      case 'TEAM_BLUE':
        return {
          bg: 'bg-amber-400 text-neutral-950 border-amber-800 shadow-[0_4px_0_#78350f]',
          spymasterBg: 'bg-amber-100 text-amber-950 border-amber-700 shadow-[0_3px_0_#78350f]',
          badgeBg: 'bg-amber-500 text-white',
          label: 'Jaune',
          icon: <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
        }
      case 'BOMB':
      case 'ASSASSIN':
        return {
          bg: 'bg-neutral-900 text-red-400 border-black shadow-[0_4px_0_#000]',
          spymasterBg: 'bg-neutral-800 text-red-300 border-black shadow-[0_3px_0_#000]',
          badgeBg: 'bg-black text-red-400',
          label: 'BOMBE',
          icon: <Bomb className="w-3.5 h-3.5 stroke-[2.5]" />
        }
      case 'NEUTRAL':
      default:
        return {
          bg: 'bg-stone-200 text-neutral-700 border-stone-800/40 shadow-[0_4px_0_#44403c33]',
          spymasterBg: 'bg-stone-100 text-neutral-800 border-stone-400 shadow-[0_2px_0_#78716c]',
          badgeBg: 'bg-stone-300 text-neutral-800',
          label: 'Neutre',
          icon: <User className="w-3.5 h-3.5 stroke-[2.5]" />
        }
    }
  }

  const revealedStyles = getTypeStyles(type)
  const spymasterStyles = isSpymaster ? getTypeStyles(type) : null

  const handleClick = () => {
    if (canClick && !revealed && onReveal) {
      onReveal(id)
    }
  }

  // 1. CARTE RÉVÉLÉE
  if (revealed) {
    return (
      <div
        className={`relative aspect-[4/3] rounded-2xl border-3 flex flex-col items-center justify-center p-2 transition-all duration-300 transform scale-95 opacity-90 select-none ${revealedStyles.bg}`}
      >
        <div className="absolute top-1.5 right-1.5 opacity-80">
          {revealedStyles.icon}
        </div>
        <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider line-through decoration-3 decoration-neutral-950/70 text-center px-1 break-words">
          {word}
        </span>
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-90">
          {revealedStyles.label}
        </span>
      </div>
    )
  }

  // 2. VUE MAÎTRE ESPION (CARTE SECRÈTE NON RÉVÉLÉE)
  if (isSpymaster) {
    return (
      <div
        className={`relative aspect-[4/3] rounded-2xl border-3 flex flex-col items-center justify-center p-2 transition-all select-none hover:-translate-y-0.5 ${spymasterStyles.spymasterBg}`}
      >
        <div
          className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs ${spymasterStyles.badgeBg}`}
          title={spymasterStyles.label}
        >
          {spymasterStyles.icon}
        </div>
        <span className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-center px-1 break-words ${type === 'BOMB' || type === 'ASSASSIN' ? 'text-red-400 font-extrabold' : ''}`}>
          {word}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5 opacity-80">
          {spymasterStyles.label}
        </span>
      </div>
    )
  }

  // 3. VUE OPÉRATEUR / JOUEUR STANDARD
  return (
    <button
      type="button"
      disabled={!canClick}
      onClick={handleClick}
      className={`relative aspect-[4/3] rounded-2xl border-3 border-neutral-900 bg-amber-50 text-neutral-900 flex flex-col items-center justify-center p-2 transition-all select-none shadow-[0_4px_0_#161513] active:translate-y-1 active:shadow-[0_1px_0_#161513] focus:outline-hidden ${
        canClick
          ? 'cursor-pointer hover:bg-amber-100 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#161513]'
          : 'cursor-default opacity-95'
      }`}
    >
      <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-center px-1 break-words">
        {word}
      </span>
      {canClick && (
        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600 mt-1">
          Désamorcer 🔍
        </span>
      )}
    </button>
  )
}
