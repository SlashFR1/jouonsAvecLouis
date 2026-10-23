import { useState } from 'react'
import '../../styles/limite-prison-visual.css'

/**
 * Composant Carte Noire Physique pour Limite PRISON :
 * - Insertion dynamique de la carte blanche dans le trou `___`
 * - Support Drag-and-Drop (glisser-déposer) & clic tactile
 * - Finition papier sombre avec badge d'avertissement prisonnier
 */
export default function PhysicalBlackCard({
  text = 'Pour séduire, rien de tel que ___.',
  slottedText = null,
  onRemoveSlotted,
  onDropCard,
  judgeName = '',
  isJudge = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  // Découper le texte autour des blancs "___"
  const parts = text.split(/_{2,}/)
  const slottedParts = slottedText ? slottedText.split(' // ') : []

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const cardData = e.dataTransfer.getData('text/plain')
    if (cardData && onDropCard) {
      try {
        const parsed = JSON.parse(cardData)
        onDropCard(parsed)
      } catch {
        onDropCard({ text: cardData, id: cardData })
      }
    }
  }

  return (
    <article
      className={`physical-black-card ${isDragOver ? 'is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Carte Noire"
    >
      <div className="black-card-header">
        <span className="black-card-badge">⚠️ CARTE NOIRE</span>
        {judgeName && (
          <span className="black-card-judge-tag">
            ⚖️ Juge de manche : <strong>{judgeName}</strong> {isJudge ? '(C’est toi !)' : ''}
          </span>
        )}
      </div>

      <div className="black-card-body">
        {parts.map((part, idx) => {
          const isLastPart = idx === parts.length - 1
          const slottedForThisBlank = slottedParts[idx]

          return (
            <span key={idx}>
              {part}
              {!isLastPart && (
                slottedForThisBlank ? (
                  <span className="slotted-white-card" title={`Carte blanche insérée (${idx + 1})`}>
                    <span>{slottedForThisBlank}</span>
                    {onRemoveSlotted && (
                      <button
                        type="button"
                        className="slotted-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveSlotted(idx)
                        }}
                        aria-label={`Retirer la carte ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ) : (
                  <span className={`blank-drop-target ${isDragOver ? 'is-highlighted' : ''}`}>
                    {isJudge ? '___' : (parts.length > 2 ? `👉 Carte ${idx + 1} ici 👈` : '👉 Insère ta carte ici 👈')}
                  </span>
                )
              )}
            </span>
          )
        })}
      </div>

      <div className="black-card-footer">
        <span>LIMITE PRISON ©</span>
        <span>{slottedText ? '🔒 Carte prête' : 'Glisse ou clique une carte blanche'}</span>
      </div>
    </article>
  )
}
