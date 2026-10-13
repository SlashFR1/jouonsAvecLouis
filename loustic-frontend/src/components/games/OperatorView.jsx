import AliasBoard from './AliasBoard'
import AliasClueBar from './AliasClueBar'
import AliasScoreTracker from './AliasScoreTracker'

/**
 * Vue Spécialisée Opérateur / Agent de terrain.
 * - Ne voit que les mots neutres et les cartes déjà retournées.
 * - Peut cliquer sur les cartes pour désamorcer lors de GUESS_PHASE si son équipe est active.
 * - Peut cliquer sur "Fin du tour" à tout moment de sa phase de jeu.
 */
export default function OperatorView({
  gameState,
  cards,
  myTeam,
  onRevealCard,
  onEndTurn
}) {
  const isMyTeamActive = (gameState?.activeTeam === myTeam) ||
    (gameState?.activeTeam === 'RED' && myTeam === 'ROSE') ||
    (gameState?.activeTeam === 'BLUE' && myTeam === 'JAUNE')

  const isGuessPhase = gameState?.phase === 'GUESS_PHASE' || gameState?.phase === 'AGENTS_GUESSING'
  const canClick = isGuessPhase && isMyTeamActive && (gameState?.guessesRemaining > 0)

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-amber-100 text-neutral-800 text-xs font-black uppercase px-3 py-1 rounded-full border-2 border-neutral-900 mb-2 shadow-[0_2px_0_#161513]">
        🎯 VUE OPÉRATEUR DE TERRAIN — CLIQUEZ POUR DÉSAMORCER
      </div>

      <AliasScoreTracker
        remainingByTeam={gameState?.remainingByTeam || {}}
        activeTeam={gameState?.activeTeam}
      />

      <AliasClueBar
        phase={gameState?.phase}
        isSpymaster={false}
        isMyTeamActive={isMyTeamActive}
        activeTeam={gameState?.activeTeam}
        clueWord={gameState?.clueWord}
        clueCount={gameState?.clueCount}
        guessesRemaining={gameState?.guessesRemaining}
        onEndTurn={onEndTurn}
        boardCards={cards}
      />

      <AliasBoard
        cards={cards}
        isSpymaster={false}
        canClick={canClick}
        onRevealCard={onRevealCard}
      />
    </div>
  )
}
