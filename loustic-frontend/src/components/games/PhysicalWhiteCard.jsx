import '../../styles/limite-prison-visual.css'

/**
 * Composant Carte Blanche Physique pour Limite PRISON :
 * - Carte de punchline satirique
 * - Draggable (glisser-déposer) & clic tactile direct
 */
export default function PhysicalWhiteCard({
  card,
  isSelected = false,
  onSelect,
  disabled = false,
}) {
  const cardText = card?.text || card || ''
  const cardId = card?.id || cardText

  const handleDragStart = (e) => {
    if (disabled) return
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: cardId, text: cardText }))
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`physical-white-card ${isSelected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onClick={() => !disabled && onSelect?.(card)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect?.(card)
        }
      }}
      aria-label={`Carte blanche : ${cardText}`}
    >
      <p className="white-card-text">{cardText}</p>
      <div className="white-card-corner">
        <span>🃏</span>
        <span>Limite PRISON</span>
      </div>
    </div>
  )
}
