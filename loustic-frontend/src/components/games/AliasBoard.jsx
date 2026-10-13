import AliasCard from './AliasCard'

/**
 * Grille dynamique pour Alias (5 colonnes pour 20 cartes, 6 colonnes pour 30 cartes).
 */
export default function AliasBoard({
  cards = [],
  columns = 5,
  isSpymaster = false,
  canClick = false,
  onRevealCard
}) {
  const cols = columns === 6 ? 'grid-cols-6' : 'grid-cols-5'

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-1 sm:px-2">
      <div className={`grid ${cols} gap-1.5 sm:gap-2.5 md:gap-3`}>
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
