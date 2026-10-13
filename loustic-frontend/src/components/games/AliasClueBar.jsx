import { Send, AlertCircle, ArrowRight } from 'lucide-react'
import CartoonButton from '../common/CartoonButton'

export default function AliasClueBar({
  phase = 'SPYMASTER_CLUE',
  isSpymaster = false,
  isMyTeamActive = false,
  activeTeam = 'RED',
  clueWord = null,
  clueCount = 0,
  guessesRemaining = 0,
  onSubmitClue,
  onEndTurn,
  boardCards = []
}) {
  const [word, setWord] = useState('')
  const [count, setCount] = useState(1)
  const [error, setError] = useState(null)

  const normalize = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

  const handleSubmit = (e) => {
    e?.preventDefault()
    setError(null)
    const trimmed = word.trim()

    if (!trimmed) {
      setError('Veuillez entrer un mot pour l’indice.')
      return
    }

    if (trimmed.includes(' ') || trimmed.includes('-')) {
      setError('L’indice doit être composé d’UN SEUL mot.')
      return
    }

    const normInput = normalize(trimmed)

    // Vérification stricte : le mot ne doit pas figurer sur une carte non révélée du plateau
    const foundOnBoard = boardCards.some(
      (c) => !c.revealed && normalize(c.word) === normInput
    )

    if (foundOnBoard) {
      setError(`Le mot "${trimmed}" est présent non révélé sur le plateau !`)
      return
    }

    onSubmitClue(trimmed, Number(count))
    setWord('')
  }

  const getTeamName = (code) => {
    switch (code) {
      case 'RED':
        return 'Équipe Rouge'
      case 'BLUE':
        return 'Équipe Bleue'
      case 'GREEN':
        return 'Équipe Verte'
      default:
        return code
    }
  }

  // --- 1. Le Maître Espion de l'équipe active donne son indice ---
  if (phase === 'SPYMASTER_CLUE' && isSpymaster && isMyTeamActive) {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl mx-auto my-2 p-3 bg-amber-200/90 rounded-2xl border-3 border-neutral-900 shadow-[0_4px_0_#161513] flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-neutral-900 uppercase">
          <span className="flex items-center gap-1.5">
            🕵️ C’est à vous (Maître Espion) : Donnez un indice !
          </span>
          <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full">
            1 mot + 1 chiffre
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 p-2 rounded-xl border-2 border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ex: Animal, Océan..."
            value={word}
            onChange={(e) => {
              setWord(e.target.value)
              if (error) setError(null)
            }}
            maxLength={25}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-neutral-900 bg-white font-black text-sm uppercase placeholder:normal-case placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
          />

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border-2 border-neutral-900 bg-white font-black text-sm cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? '0 (Aucun)' : n}
              </option>
            ))}
            <option value={99}>∞</option>
          </select>

          <CartoonButton
            type="submit"
            color="black"
            className="!py-2 !px-3 sm:!px-4 flex items-center gap-1 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Envoyer</span>
          </CartoonButton>
        </div>
      </form>
    )
  }

  // --- 2. En attente du Maître Espion (pour les autres ou équipe inactive) ---
  if (phase === 'SPYMASTER_CLUE') {
    return (
      <div className="w-full max-w-xl mx-auto my-2 p-3 bg-neutral-100 rounded-2xl border-3 border-neutral-900 shadow-[0_3px_0_#161513] text-center text-sm font-black text-neutral-800 flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
        <span>
          Le Maître Espion de l’{getTeamName(activeTeam)} réfléchit à un indice...
        </span>
      </div>
    )
  }

  // --- 3. Phase de découverte / Devineurs (Agents en jeu) ---
  return (
    <div className="w-full max-w-xl mx-auto my-2 p-3 bg-amber-100 rounded-2xl border-3 border-neutral-900 shadow-[0_4px_0_#161513] flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="bg-neutral-900 text-white px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
          Indice
        </div>
        <div className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
          « {clueWord || '—'} »
          <span className="ml-1.5 text-amber-900 bg-amber-300 px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold border border-neutral-900">
            {clueCount === 99 ? 'Illimité' : clueCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs sm:text-sm font-bold text-neutral-700">
          Essais restants :{' '}
          <strong className="text-neutral-900 font-black text-base">
            {guessesRemaining}
          </strong>
        </div>

        {/* Bouton de fin de tour accessible aux agents de l'équipe active */}
        {isMyTeamActive && !isSpymaster && (
          <CartoonButton
            onClick={onEndTurn}
            color="yellow"
            className="!py-1.5 !px-3 text-xs flex items-center gap-1"
          >
            <span>Fin du tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </CartoonButton>
        )}
      </div>
    </div>
  )
}
