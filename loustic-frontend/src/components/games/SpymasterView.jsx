import { useState } from 'react'
import { AlertTriangle, Send, Shield, Sparkles, User, Skull } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'
import AliasScoreTracker from './AliasScoreTracker'

const TEAM_NAMES = {
  BLUE: 'Bleu',
  RED: 'Rouge',
  GREEN: 'Vert',
  JAUNE: 'Bleu',
  ROSE: 'Rouge',
}

const TEAM_COLORS = {
  BLUE: 'bg-blue-600 text-white border-blue-950',
  RED: 'bg-red-600 text-white border-red-950',
  GREEN: 'bg-emerald-600 text-white border-emerald-950',
  JAUNE: 'bg-blue-600 text-white border-blue-950',
  ROSE: 'bg-red-600 text-white border-red-950',
}

export default function SpymasterView({
  gameState,
  cards = [],
  myTeam = 'BLUE',
  onSubmitClue,
  onEndTurn
}) {
  const [clueWord, setClueWord] = useState('')
  const [clueCount, setClueCount] = useState(1)

  const activeTeam = gameState?.activeTeam || 'BLUE'
  const isMyTeamActive = activeTeam === myTeam ||
    (activeTeam === 'BLUE' && myTeam === 'JAUNE') ||
    (activeTeam === 'RED' && myTeam === 'ROSE')

  const isCluePhase = gameState?.phase === 'CLUE_PHASE' || gameState?.phase === 'SPYMASTER_CLUE'
  const isMyTurn = isCluePhase && isMyTeamActive

  // Normalisation du type de mon équipe
  const getNormalizedTeam = (t) => {
    if (!t) return 'BLUE'
    if (t === 'ROSE') return 'RED'
    if (t === 'JAUNE') return 'BLUE'
    return t
  }
  const normMyTeam = getNormalizedTeam(myTeam)

  // Partition des mots
  const myCards = cards.filter((c) => {
    if (normMyTeam === 'BLUE') return c.type === 'TEAM_BLUE' || c.type === 'TEAM_JAUNE'
    if (normMyTeam === 'RED') return c.type === 'TEAM_RED' || c.type === 'TEAM_ROSE'
    if (normMyTeam === 'GREEN') return c.type === 'TEAM_GREEN'
    return false
  })

  const assassinCards = cards.filter((c) => c.type === 'ASSASSIN' || c.type === 'BOMB')

  const opponentCards = cards.filter((c) => {
    const t = c.type
    if (t === 'NEUTRAL' || t === 'ASSASSIN' || t === 'BOMB') return false
    if (normMyTeam === 'BLUE') return t === 'TEAM_RED' || t === 'TEAM_ROSE' || t === 'TEAM_GREEN'
    if (normMyTeam === 'RED') return t === 'TEAM_BLUE' || t === 'TEAM_JAUNE' || t === 'TEAM_GREEN'
    if (normMyTeam === 'GREEN') return t === 'TEAM_BLUE' || t === 'TEAM_JAUNE' || t === 'TEAM_RED' || t === 'TEAM_ROSE'
    return false
  })

  const neutralCards = cards.filter((c) => c.type === 'NEUTRAL')

  const myRemaining = myCards.filter((c) => !c.revealed).length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!clueWord.trim() || clueCount < 1) return
    onSubmitClue?.(clueWord.trim(), Number(clueCount))
    setClueWord('')
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 px-2 sm:px-4 pb-8">
      {/* En-tête rôle */}
      <div className="flex items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-yellow-400">
              Rôle Maître Espion
            </div>
            <div className="text-sm font-black">
              Équipe {TEAM_NAMES[normMyTeam] || normMyTeam}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase text-neutral-400">
            Mots restants
          </div>
          <div className="text-xl font-black text-yellow-300">
            {myRemaining} / {myCards.length}
          </div>
        </div>
      </div>

      {/* Tracker global des scores */}
      <AliasScoreTracker
        remainingByTeam={gameState?.remainingByTeam || {}}
        activeTeam={gameState?.activeTeam}
      />

      {/* Formulaire d'indice si c'est notre tour */}
      {isMyTurn ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-yellow-300 rounded-2xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-900 tracking-wider">
              À vous de jouer : donnez votre indice
            </span>
            <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
              Phase Indice
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={clueWord}
              onChange={(e) => setClueWord(e.target.value)}
              placeholder="Un seul mot (ex: ANIMAL)"
              className="flex-1 px-3 py-2 bg-white text-neutral-900 font-black text-sm uppercase rounded-xl border-2 border-neutral-900 focus:outline-none"
              required
            />
            <select
              value={clueCount}
              onChange={(e) => setClueCount(Number(e.target.value))}
              className="w-20 px-2 py-2 bg-white text-neutral-900 font-black text-sm rounded-xl border-2 border-neutral-900 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} mot{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <CartoonButton type="submit" variant="default" className="w-full">
            <Send className="w-4 h-4 mr-1.5" />
            Transmettre l’indice aux Agents
          </CartoonButton>
        </form>
      ) : (
        <div className="p-3 bg-white/90 rounded-2xl border-2 border-neutral-900 shadow-[2px_2px_0_#161513] text-center">
          <p className="text-xs font-bold text-neutral-600 m-0">
            {gameState?.phase === 'GUESS_PHASE' || gameState?.phase === 'AGENTS_GUESSING'
              ? `Les Agents de l'équipe ${TEAM_NAMES[activeTeam] || activeTeam} délibèrent... (Essais restants : ${gameState?.guessesRemaining ?? 0})`
              : `En attente du Maître Espion adverse...`}
          </p>
        </div>
      )}

      {/* SECTION 1 : Nos mots à faire deviner */}
      <section className="p-3.5 bg-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] space-y-2.5">
        <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase text-neutral-900">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Nos mots à faire deviner</span>
          </div>
          <span className="text-[11px] font-black text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
            {myRemaining} restants
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {myCards.map((c) => (
            <span
              key={c.id}
              className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all ${
                c.revealed
                  ? 'bg-neutral-200 text-neutral-400 border-neutral-300 line-through opacity-60'
                  : `${TEAM_COLORS[normMyTeam] || 'bg-blue-600 text-white'} shadow-[2px_2px_0_#161513]`
              }`}
            >
              {c.word}
              {c.revealed && <span className="ml-1 text-[9px] font-normal">(trouvé)</span>}
            </span>
          ))}
        </div>
      </section>

      {/* SECTION 2 : L'Assassin (DANGER) */}
      <section className="p-3.5 bg-neutral-950 text-white rounded-2xl border-3 border-red-600 shadow-[3px_3px_0_#dc2626] space-y-2.5">
        <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase text-red-400 tracking-wider">
            <Skull className="w-4 h-4 text-red-500" />
            <span>L'Assassin</span>
          </div>
          <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full tracking-widest">
            DANGER MORTEL
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {assassinCards.map((c) => (
            <span
              key={c.id}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-red-500 font-black text-xs uppercase tracking-wide bg-neutral-900 text-red-300 shadow-[2px_2px_0_#dc2626] ${
                c.revealed ? 'line-through opacity-40' : ''
              }`}
            >
              {c.word}
            </span>
          ))}
        </div>
      </section>

      {/* SECTION 3 : Mots adverses */}
      <section className="p-3.5 bg-rose-50/70 rounded-2xl border-3 border-rose-300 shadow-[3px_3px_0_#161513] space-y-2.5">
        <div className="flex items-center justify-between border-b border-rose-200 pb-2">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Mots adverses à éviter</span>
          </div>
          <span className="text-[10px] font-bold text-rose-700">Donne 1 point à l'autre équipe</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {opponentCards.map((c) => {
            const oppTeam = c.type === 'TEAM_GREEN' ? 'Vert' : (c.type === 'TEAM_RED' || c.type === 'TEAM_ROSE') ? 'Rouge' : 'Bleu'
            return (
              <span
                key={c.id}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                  c.revealed
                    ? 'bg-neutral-200 text-neutral-400 border-neutral-300 line-through opacity-50'
                    : 'bg-white text-neutral-800 border-rose-300 shadow-xs'
                }`}
              >
                {c.word} <span className="text-[9px] text-rose-600 font-normal">({oppTeam})</span>
              </span>
            )
          })}
        </div>
      </section>

      {/* SECTION 4 : Mots neutres */}
      <section className="p-3.5 bg-neutral-100 rounded-2xl border-3 border-neutral-300 shadow-[2px_2px_0_#161513] space-y-2">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase text-neutral-700">
            <User className="w-3.5 h-3.5 text-neutral-500" />
            <span>Mots neutres (Témoins)</span>
          </div>
          <span className="text-[10px] font-medium text-neutral-500">Arrête le tour</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {neutralCards.map((c) => (
            <span
              key={c.id}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                c.revealed
                  ? 'bg-neutral-200 text-neutral-400 border-neutral-300 line-through'
                  : 'bg-white text-neutral-700 border-neutral-300'
              }`}
            >
              {c.word}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
