import { useState } from 'react'
import { Vote, Check, Rocket } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

/**
 * Vue tactile de vote de jour pour le Sas spatial.
 */
export default function DayVoteView({
  players = [],
  myPlayerId,
  isHost = false,
  votesCount = 0,
  onVote,
  onResolveVote
}) {
  const [selectedSuspect, setSelectedSuspect] = useState('')
  const [hasVoted, setHasVoted] = useState(false)

  const livingPlayers = players.filter((p) => p.alive)
  const myPlayer = players.find((p) => p.id === myPlayerId)

  const handleCastVote = (suspectId) => {
    setSelectedSuspect(suspectId)
    setHasVoted(true)
    if (onVote) {
      onVote(suspectId)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-3 p-5 bg-amber-100 rounded-3xl border-3 border-neutral-900 shadow-[0_6px_0_#161513] flex flex-col gap-4 text-center">
      <div className="flex items-center justify-center gap-2 text-neutral-900 font-black text-lg">
        <Vote className="w-6 h-6 text-red-600 stroke-[2.5]" />
        <span>Tribunal du Sas Spatial</span>
      </div>

      <p className="text-xs font-bold text-neutral-700">
        Désignez le suspect que vous souhaitez éjecter par le sas spatial. Votez en toute conscience !
      </p>

      {/* COMPTEUR DE VOTES */}
      <div className="flex items-center justify-center gap-2 text-xs font-black bg-white px-3 py-1.5 rounded-full border-2 border-neutral-900 shadow-[0_2px_0_#161513]">
        <span>Votes enregistrés :</span>
        <strong className="text-red-600 text-sm">{votesCount} / {livingPlayers.length}</strong>
      </div>

      {/* GRILLE DES SUSPECTS */}
      {myPlayer?.alive ? (
        <div className="grid grid-cols-2 gap-2.5 my-2">
          {livingPlayers.map((p) => {
            const isMe = p.id === myPlayerId
            const isSelected = selectedSuspect === p.id

            return (
              <button
                key={p.id}
                type="button"
                disabled={isMe}
                onClick={() => handleCastVote(p.id)}
                className={`p-3 rounded-2xl border-2 border-neutral-900 font-black text-xs flex items-center justify-between transition-all ${
                  isMe
                    ? 'opacity-40 cursor-not-allowed bg-neutral-200'
                    : isSelected
                    ? 'bg-red-600 text-white shadow-[0_3px_0_#161513] scale-102'
                    : 'bg-white text-neutral-900 hover:bg-red-50 cursor-pointer shadow-[0_2px_0_#161513]'
                }`}
              >
                <span>{p.name} {isMe && '(Vous)'}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="p-4 bg-neutral-800 text-neutral-300 rounded-2xl text-xs font-bold italic">
          👻 Vous êtes mort. Vous observez les débats depuis l’au-delà sans pouvoir voter.
        </div>
      )}

      {hasVoted && (
        <div className="text-xs font-black text-emerald-800 bg-emerald-100 p-2 rounded-xl border-2 border-emerald-800">
          ✓ Votre vote secret a bien été transmis au sas spatial !
        </div>
      )}

      {/* DÉPOUILLEMENT PAR L'HÔTE */}
      {isHost && (
        <div className="pt-2 border-t-2 border-dashed border-neutral-300">
          <CartoonButton
            onClick={onResolveVote}
            color="black"
            className="w-full !py-3 flex items-center justify-center gap-2 text-xs"
          >
            <Rocket className="w-4 h-4" />
            <span>Clôturer et Éjecter par le Sas</span>
          </CartoonButton>
        </div>
      )}
    </div>
  )
}
