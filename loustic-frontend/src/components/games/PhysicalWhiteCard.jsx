import '../../styles/limite-prison-visual.css'

/**
 * Composant Carte Blanche Physique pour Limite PRISON :
 * - Carte de punchline satirique
 * - Draggable (glisser-déposer) & clic tactile direct
 */
export default function PhysicalWhiteCard({
  card,
  isSelected = false,
  badgeNumber = null,
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
      style={{ position: 'relative' }}
    >
      {badgeNumber != null && (
        <span
          className="white-card-selection-badge"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2.5px solid #ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 10,
          }}
        >
          {badgeNumber}
        </span>
      )}
      <p className="white-card-text">{cardText}</p>
      <div className="white-card-corner">
        <span>🃏</span>
        <span>Limite PRISON</span>
      </div>
    </div>
  )
}
