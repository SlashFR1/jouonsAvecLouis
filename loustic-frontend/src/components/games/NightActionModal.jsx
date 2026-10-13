import { useState } from 'react'
import { Moon, Shield, Heart, Skull, Search, Pill, Check } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

/**
 * Interface d'interaction de nuit pour Parasite.
 * Adapte son affichage selon la phase courante et le rôle du joueur connecté.
 */
export default function NightActionModal({
  phase,
  myPlayerId,
  myRoleData,
  players = [],
  alienVotes = {},
  scanResult = null,
  onOfficierAction,
  onGardeAction,
  onAlienVoteAction,
  onAlphaKillAction,
  onScientifiqueScanAction,
  onMedecinAction
}) {
  const [selected1, setSelected1] = useState('')
  const [selected2, setSelected2] = useState('')
  const [useSavePotion, setUseSavePotion] = useState(false)
  const [killTarget, setKillTarget] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const livingPlayers = players.filter((p) => p.alive)
  const role = myRoleData?.role

  // 1. TOUR DE L'OFFICIER (Nuit 1)
  if (phase === 'NIGHT_OFFICIER') {
    const isMyTurn = role === 'OFFICIER'

    if (!isMyTurn) {
      return <SleepingView roleName="l’Officier des relations" />
    }

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-pink-100 rounded-3xl border-3 border-pink-900 shadow-[0_6px_0_#831843] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-pink-900 font-black text-lg">
          <Heart className="w-5 h-5 fill-pink-600 text-pink-600" />
          <span>Tour de l’Officier</span>
        </div>
        <p className="text-xs font-bold text-neutral-700">
          Désignez deux habitants qui formeront un lien indéfectible d’amour. S’il l’un meurt, l’autre mourra de chagrin !
        </p>

        <div className="flex flex-col gap-2 text-left">
          <label className="text-xs font-black text-neutral-800">Premier Amoureux :</label>
          <select
            value={selected1}
            onChange={(e) => setSelected1(e.target.value)}
            className="p-2.5 rounded-xl border-2 border-neutral-900 bg-white font-bold text-sm"
          >
            <option value="">Sélectionner un joueur...</option>
            {livingPlayers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <label className="text-xs font-black text-neutral-800 mt-2">Second Amoureux :</label>
          <select
            value={selected2}
            onChange={(e) => setSelected2(e.target.value)}
            className="p-2.5 rounded-xl border-2 border-neutral-900 bg-white font-bold text-sm"
          >
            <option value="">Sélectionner un joueur...</option>
            {livingPlayers.filter((p) => p.id !== selected1).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <CartoonButton
          disabled={!selected1 || !selected2 || selected1 === selected2 || submitted}
          onClick={() => {
            setSubmitted(true)
            onOfficierAction(selected1, selected2)
          }}
          color="black"
          className="w-full !py-3 flex items-center justify-center gap-2 mt-2"
        >
          <Heart className="w-4 h-4" />
          <span>Lier les deux amants</span>
        </CartoonButton>
      </div>
    )
  }

  // 2. TOUR DU GARDE (Salvateur)
  if (phase === 'NIGHT_GARDE') {
    const isMyTurn = role === 'GARDE'

    if (!isMyTurn) {
      return <SleepingView roleName="le Garde de la station" />
    }

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-sky-100 rounded-3xl border-3 border-sky-900 shadow-[0_6px_0_#0369a1] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sky-950 font-black text-lg">
          <Shield className="w-5 h-5 text-sky-700 stroke-[2.5]" />
          <span>Tour du Garde</span>
        </div>
        <p className="text-xs font-bold text-neutral-700">
          Choisissez un joueur à protéger cette nuit contre l’attaque alien (interdiction du même joueur deux nuits consécutives).
        </p>

        <div className="grid grid-cols-2 gap-2 my-2">
          {livingPlayers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected1(p.id)}
              className={`p-3 rounded-2xl border-2 border-neutral-900 font-black text-xs transition-all ${
                selected1 === p.id
                  ? 'bg-sky-600 text-white shadow-[0_2px_0_#161513]'
                  : 'bg-white text-neutral-900 hover:bg-sky-50'
              }`}
            >
              {p.name} {p.id === myPlayerId && '(Vous)'}
            </button>
          ))}
        </div>

        <CartoonButton
          disabled={!selected1 || submitted}
          onClick={() => {
            setSubmitted(true)
            onGardeAction(selected1)
          }}
          color="black"
          className="w-full !py-3 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          <span>Activer le bouclier protecteur</span>
        </CartoonButton>
      </div>
    )
  }

  // 3. TOUR DES ALIENS (Vote synchronisé)
  if (phase === 'NIGHT_ALIENS') {
    const isMyTurn = role === 'ALIEN' || role === 'ALPHA'

    if (!isMyTurn) {
      return <SleepingView roleName="les Aliens infiltrés" />
    }

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-red-100 rounded-3xl border-3 border-red-900 shadow-[0_6px_0_#991b1b] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-red-950 font-black text-lg">
          <Skull className="w-5 h-5 text-red-600" />
          <span>Concertation des Aliens</span>
        </div>
        <p className="text-xs font-bold text-neutral-700">
          Votez pour votre cible coloniale à éliminer cette nuit. La cible majoritaire sera attaquée !
        </p>

        <div className="grid grid-cols-2 gap-2 my-2">
          {livingPlayers.map((p) => {
            const votesCount = Object.values(alienVotes || {}).filter((v) => v === p.id).length
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelected1(p.id)
                  onAlienVoteAction(p.id)
                }}
                className={`p-3 rounded-2xl border-2 border-neutral-900 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  selected1 === p.id
                    ? 'bg-red-600 text-white shadow-[0_2px_0_#161513]'
                    : 'bg-white text-neutral-900 hover:bg-red-50'
                }`}
              >
                <span>{p.name} {p.id === myPlayerId && '(Vous)'}</span>
                {votesCount > 0 && (
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                    {votesCount} vote{votesCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="text-xs font-bold text-neutral-600 italic">
          {selected1 ? '✓ Votre vote est enregistré.' : 'Cliquez sur une victime pour voter.'}
        </div>
      </div>
    )
  }

  // 4. TOUR DE L'ALPHA (Loup blanc solitaire)
  if (phase === 'NIGHT_ALPHA') {
    const isMyTurn = role === 'ALPHA'

    if (!isMyTurn) {
      return <SleepingView roleName="l’Alpha solitaire" />
    }

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-neutral-900 text-white rounded-3xl border-3 border-black shadow-[0_6px_0_#000] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-red-400 font-black text-lg">
          <Skull className="w-5 h-5 text-red-500" />
          <span>Tour de l’Alpha Solitaire</span>
        </div>
        <p className="text-xs font-bold text-neutral-300">
          Cette nuit, vous pouvez dévorer un habitant ou un autre alien pour assurer votre victoire en solitaire !
        </p>

        <div className="grid grid-cols-2 gap-2 my-2">
          {livingPlayers.filter((p) => p.id !== myPlayerId).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected1(p.id)}
              className={`p-3 rounded-2xl border-2 border-neutral-700 font-black text-xs transition-all ${
                selected1 === p.id
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <CartoonButton
            onClick={() => onAlphaKillAction(null)}
            color="black"
            className="flex-1 !py-3 text-xs"
          >
            Passer cette nuit
          </CartoonButton>
          <CartoonButton
            disabled={!selected1}
            onClick={() => onAlphaKillAction(selected1)}
            color="yellow"
            className="flex-1 !py-3 text-xs"
          >
            Dévorer la cible
          </CartoonButton>
        </div>
      </div>
    )
  }

  // 5. TOUR DU SCIENTIFIQUE (Voyante)
  if (phase === 'NIGHT_SCIENTIFIQUE') {
    const isMyTurn = role === 'SCIENTIFIQUE'

    if (!isMyTurn) {
      return <SleepingView roleName="le Scientifique de la colonie" />
    }

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-purple-100 rounded-3xl border-3 border-purple-900 shadow-[0_6px_0_#581c87] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-purple-950 font-black text-lg">
          <Search className="w-5 h-5 text-purple-700 stroke-[2.5]" />
          <span>Tour du Scientifique</span>
        </div>
        <p className="text-xs font-bold text-neutral-700">
          Sélectionnez un habitant pour analyser secrètement son ADN et découvrir s’il s’agit d’un colon ou d’un alien.
        </p>

        {scanResult ? (
          <div className="p-4 bg-white rounded-2xl border-2 border-purple-900 flex flex-col items-center gap-1">
            <span className="text-xs text-neutral-500 font-bold">Résultat de l’Analyse :</span>
            <span className="text-lg font-black text-neutral-900">{scanResult.targetName}</span>
            <span className="text-sm font-black text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-300 mt-1">
              {scanResult.camp}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 my-2">
            {livingPlayers.filter((p) => p.id !== myPlayerId).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected1(p.id)}
                className={`p-3 rounded-2xl border-2 border-neutral-900 font-black text-xs transition-all ${
                  selected1 === p.id
                    ? 'bg-purple-600 text-white shadow-[0_2px_0_#161513]'
                    : 'bg-white text-neutral-900 hover:bg-purple-50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {!scanResult && (
          <CartoonButton
            disabled={!selected1 || submitted}
            onClick={() => {
              setSubmitted(true)
              onScientifiqueScanAction(selected1)
            }}
            color="black"
            className="w-full !py-3 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Scanner cet habitant</span>
          </CartoonButton>
        )}
      </div>
    )
  }

  // 6. TOUR DU MÉDECIN (Sorcière)
  if (phase === 'NIGHT_MEDECIN') {
    const isMyTurn = role === 'MEDECIN'

    if (!isMyTurn) {
      return <SleepingView roleName="le Médecin en chef" />
    }

    const hasSave = myRoleData?.hasSavePotion
    const hasKill = myRoleData?.hasKillPotion

    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-emerald-100 rounded-3xl border-3 border-emerald-900 shadow-[0_6px_0_#064e3b] flex flex-col gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-950 font-black text-lg">
          <Pill className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
          <span>Tour du Médecin</span>
        </div>
        <p className="text-xs font-bold text-neutral-700">
          Vous pouvez utiliser vos sérums expérimentaux cette nuit.
        </p>

        <div className="flex flex-col gap-3 text-left">
          {/* Sérum de vie */}
          <div className="p-3 bg-white rounded-2xl border-2 border-neutral-900 flex items-center justify-between">
            <div>
              <span className="font-black text-xs block text-neutral-900">💉 Sérum de Guérison</span>
              <span className="text-[11px] text-neutral-500 font-bold">
                {hasSave ? 'Disponible (annule l’attaque alien)' : 'Déjà utilisé'}
              </span>
            </div>
            {hasSave && (
              <button
                type="button"
                onClick={() => setUseSavePotion(!useSavePotion)}
                className={`px-3 py-1.5 rounded-xl border-2 border-neutral-900 font-black text-xs cursor-pointer ${
                  useSavePotion ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {useSavePotion ? '✓ Activé' : 'Activer'}
              </button>
            )}
          </div>

          {/* Poison létal */}
          <div className="p-3 bg-white rounded-2xl border-2 border-neutral-900 flex flex-col gap-2">
            <div>
              <span className="font-black text-xs block text-neutral-900">☠️ Poison Mortel</span>
              <span className="text-[11px] text-neutral-500 font-bold">
                {hasKill ? 'Disponible (élimine 1 joueur de votre choix)' : 'Déjà utilisé'}
              </span>
            </div>
            {hasKill && (
              <select
                value={killTarget}
                onChange={(e) => setKillTarget(e.target.value)}
                className="p-2 rounded-xl border-2 border-neutral-900 text-xs font-bold"
              >
                <option value="">Ne pas utiliser de poison</option>
                {livingPlayers.filter((p) => p.id !== myPlayerId).map((p) => (
                  <option key={p.id} value={p.id}>Éliminer {p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <CartoonButton
          disabled={submitted}
          onClick={() => {
            setSubmitted(true)
            onMedecinAction(useSavePotion, killTarget || null)
          }}
          color="black"
          className="w-full !py-3 flex items-center justify-center gap-2 mt-2"
        >
          <Check className="w-4 h-4" />
          <span>Valider les soins / potions</span>
        </CartoonButton>
      </div>
    )
  }

  return <SleepingView roleName="les rôles nocturnes" />
}

function SleepingView({ roleName }) {
  return (
    <div className="w-full max-w-md mx-auto my-6 p-8 bg-neutral-900 text-white rounded-3xl border-4 border-black shadow-[0_8px_0_#000] flex flex-col items-center justify-center text-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-amber-300 flex items-center justify-center">
        <Moon className="w-8 h-8 text-amber-300 fill-amber-300/40" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-tight">
          La Colonie Dort... 🌙
        </h3>
        <p className="text-xs sm:text-sm font-bold text-neutral-300 mt-2 max-w-xs">
          C’est au tour de <strong>{roleName}</strong> d’agir dans l’ombre. Gardez le silence et attendez l’aube.
        </p>
      </div>
    </div>
  )
}
