import { useState } from 'react'
import { EyeOff, Heart, Check } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

/**
 * Carte secrète de rôle avec mécanisme "Hold-to-reveal" / Toucher pour afficher.
 * Préserve le secret visuel absolu dans une pièce avec d'autres joueurs.
 */
export default function RoleCard({
  roleData,
  onConfirmed
}) {
  const [revealed, setRevealed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (!roleData) {
    return (
      <div className="p-4 bg-amber-100 rounded-3xl border-3 border-neutral-900 text-center font-bold text-sm">
        Attribution de votre identité spatiale en cours...
      </div>
    )
  }

  const { role, roleName, camp, description, isLover, loverName, accomplices } = roleData
  const isAlienCamp = camp === 'ALIENS' || camp === 'ALPHA' || role === 'ALIEN' || role === 'ALPHA'

  return (
    <div className="w-full max-w-md mx-auto my-3 p-4 flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight">
          Votre Identité Secrète
        </h3>
        <p className="text-xs font-bold text-neutral-600 mt-1">
          Ne montrez votre écran à personne !
        </p>
      </div>

      {/* CARTE TACTILE SECRÈTE */}
      <div
        onMouseDown={() => setRevealed(true)}
        onMouseUp={() => setRevealed(false)}
        onTouchStart={() => setRevealed(true)}
        onTouchEnd={() => setRevealed(false)}
        className={`w-full aspect-[4/5] rounded-3xl border-4 border-neutral-900 transition-all duration-300 p-6 flex flex-col items-center justify-between select-none cursor-pointer shadow-[0_6px_0_#161513] active:translate-y-1 active:shadow-[0_2px_0_#161513] ${
          revealed
            ? isAlienCamp
              ? 'bg-gradient-to-b from-red-600 to-neutral-950 text-white'
              : 'bg-gradient-to-b from-sky-500 to-indigo-900 text-white'
            : 'bg-neutral-800 text-amber-200 hover:bg-neutral-750'
        }`}
      >
        {!revealed ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-3 border-amber-300 flex items-center justify-center animate-pulse">
              <EyeOff className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <p className="text-lg font-black uppercase text-amber-300 tracking-wide">
                Maintenez pour Révéler
              </p>
              <p className="text-xs font-bold text-neutral-400 mt-1">
                (Appuyez et maintenez votre doigt sur la carte)
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-between text-center w-full animate-fade-in">
            {/* Header rôle */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/40 border border-white/20">
                {isAlienCamp ? '👽 Menace Extraterrestre' : '🧑‍🚀 Membre de la Colonie'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 text-amber-300">
                {roleName || role}
              </h2>
            </div>

            {/* Description */}
            <div className="bg-black/30 p-3 rounded-2xl border border-white/10 text-xs sm:text-sm font-bold leading-relaxed text-neutral-100 my-2">
              {description}
            </div>

            {/* Infos additionnelles : Amoureux / Complices Aliens */}
            <div className="w-full flex flex-col gap-1.5 text-xs font-black">
              {isLover && (
                <div className="p-2 rounded-xl bg-pink-500/30 border border-pink-400 flex items-center justify-center gap-1.5 text-pink-200">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span>Lié d’amour avec : <strong>{loverName || 'Un habitant secret'}</strong></span>
                </div>
              )}

              {accomplices && accomplices.length > 0 && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 flex flex-col items-center gap-1 text-red-200">
                  <span className="text-[10px] text-red-300">Vos complices aliens :</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {accomplices.map((acc, i) => (
                      <span key={i} className="bg-red-800/80 px-2 py-0.5 rounded-md border border-red-400 text-xs">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] font-bold opacity-75 mt-2">
              (Relâchez le doigt pour masquer immédiatement)
            </div>
          </div>
        )}
      </div>

      {/* BOUTON CONFIRMATION */}
      {!confirmed ? (
        <CartoonButton
          onClick={() => {
            setConfirmed(true)
            if (onConfirmed) onConfirmed()
          }}
          color="black"
          className="w-full flex items-center justify-center gap-2 !py-3 text-sm"
        >
          <Check className="w-4 h-4" />
          <span>J’ai bien mémorisé mon rôle secret</span>
        </CartoonButton>
      ) : (
        <div className="text-xs font-black text-emerald-800 bg-emerald-100 px-4 py-2 rounded-2xl border-2 border-emerald-800 flex items-center gap-1.5 shadow-[0_2px_0_#064e3b]">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Rôle confirmé ! En attente de la première nuit...</span>
        </div>
      )}
    </div>
  )
}
