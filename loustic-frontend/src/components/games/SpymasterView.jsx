import AliasBoard from './AliasBoard'
import AliasClueBar from './AliasClueBar'
import AliasScoreTracker from './AliasScoreTracker'

/**
 * Vue Spécialisée Maître Espion (Démineur).
 * - Affiche la cartographie complète des couleurs secrètes (Rose, Jaune, Neutres, Bombe).
 * - Affiche la zone de saisie d'indice (1 mot + 1 chiffre) lors de CLUE_PHASE.
 */
export default function SpymasterView({
  gameState,
  cards,
  myTeam,
  onSubmitClue,
  onEndTurn
}) {
  const isMyTeamActive = (gameState?.activeTeam === myTeam) ||
    (gameState?.activeTeam === 'RED' && myTeam === 'ROSE') ||
    (gameState?.activeTeam === 'BLUE' && myTeam === 'JAUNE')

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-purple-900 text-purple-100 text-xs font-black uppercase px-3 py-1 rounded-full border-2 border-purple-400 mb-2 shadow-[0_2px_0_#161513]">
        🕵️ VUE MAÎTRE ESPION (DÉMINEUR) — CARTE SECRÈTE VISIBLE
      </div>

      <AliasScoreTracker
        remainingByTeam={gameState?.remainingByTeam || {}}
        activeTeam={gameState?.activeTeam}
      />

      <AliasClueBar
        phase={gameState?.phase}
        isSpymaster={true}
        isMyTeamActive={isMyTeamActive}
        activeTeam={gameState?.activeTeam}
        clueWord={gameState?.clueWord}
        clueCount={gameState?.clueCount}
        guessesRemaining={gameState?.guessesRemaining}
        onSubmitClue={onSubmitClue}
        onEndTurn={onEndTurn}
        boardCards={cards}
      />

      <AliasBoard
        cards={cards}
        isSpymaster={true}
        canClick={false}
      />
    </div>
  )
}
