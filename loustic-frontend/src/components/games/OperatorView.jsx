import AliasBoard from './AliasBoard'
import AliasScoreTracker from './AliasScoreTracker'
import CartoonButton from '../common/CartoonButton'
import { SkipForward } from 'lucide-react'

const TEAM_NAMES = {
  BLUE: 'Bleu',
  RED: 'Rouge',
  GREEN: 'Vert',
  JAUNE: 'Bleu',
  ROSE: 'Rouge',
}

export default function OperatorView({
  gameState,
  cards = [],
  myTeam = 'BLUE',
  onRevealCard,
  onEndTurn
}) {
  const activeTeam = gameState?.activeTeam || 'BLUE'
  const isMyTeamActive = activeTeam === myTeam ||
    (activeTeam === 'BLUE' && myTeam === 'JAUNE') ||
    (activeTeam === 'RED' && myTeam === 'ROSE')

  const isGuessPhase = gameState?.phase === 'GUESS_PHASE' || gameState?.phase === 'AGENTS_GUESSING'
  const canClick = isGuessPhase && isMyTeamActive && ((gameState?.guessesRemaining ?? 0) > 0)
  const columns = gameState?.columns || (cards.length > 20 ? 6 : 5)

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-1 sm:px-2 pb-8">
      {/* Tracker de score */}
      <AliasScoreTracker
        remainingByTeam={gameState?.remainingByTeam || {}}
        activeTeam={gameState?.activeTeam}
      />

      {/* Bandeau d'indice supérieur */}
      <div className={`w-full max-w-2xl my-2 p-3 bg-neutral-900 text-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] ${canClick ? 'your-turn-active' : ''}`}>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-black text-yellow-400 uppercase tracking-wider">
            Agent Équipe {TEAM_NAMES[myTeam] || myTeam}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
            isMyTeamActive && isGuessPhase ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-700 text-neutral-300'
          }`}>
            {isMyTeamActive && isGuessPhase
              ? `Votre tour (${gameState?.guessesRemaining ?? 0} essais restants)`
              : `Tour de l'équipe ${TEAM_NAMES[activeTeam] || activeTeam}`}
          </span>
        </div>

        {gameState?.clueWord ? (
          <div className="p-2.5 bg-yellow-400 text-neutral-950 rounded-xl border-2 border-neutral-900 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">
              Indice en cours :
            </span>
            <div className="text-base sm:text-lg font-black font-mono tracking-tight">
              "{gameState.clueWord}"{' '}
              <span className="text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md ml-1">
                {gameState.clueCount} mot{gameState.clueCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs font-bold text-neutral-400 py-1">
            En attente de l'indice du Maître Espion...
          </div>
        )}
      </div>

      {/* Grille spatiale dynamique */}
      <AliasBoard
        cards={cards}
        columns={columns}
        isSpymaster={false}
        canClick={canClick}
        onRevealCard={onRevealCard}
      />

      {/* Bouton pour terminer son tour volontairement */}
      {canClick && (
        <div className="w-full max-w-md mt-2 px-2">
          <CartoonButton
            id="alias-end-turn-btn"
            variant="warning"
            onClick={onEndTurn}
            className="w-full"
          >
            <SkipForward className="w-4 h-4 mr-1.5" />
            Finir le tour (Passer la main)
          </CartoonButton>
        </div>
      )}
    </div>
  )
}
