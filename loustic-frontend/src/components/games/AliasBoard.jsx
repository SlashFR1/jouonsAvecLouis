import AliasCard from './AliasCard'

/**
 * Grille de 25 cartes (5 colonnes × 5 lignes).
 */
export default function AliasBoard({
  cards = [],
  isSpymaster = false,
  canClick = false,
  onRevealCard
}) {
  return (
    <div className="w-full max-w-3xl mx-auto my-3 px-1 sm:px-2">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3">
        {cards.map((card) => (
          <AliasCard
            key={card.id}
            card={card}
            isSpymaster={isSpymaster}
            canClick={canClick}
            onReveal={onRevealCard}
          />
        ))}
      </div>
    </div>
  )
}
