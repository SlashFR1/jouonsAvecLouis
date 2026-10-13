import { useState } from 'react'
import '../../styles/classe-moica-visual.css'

/**
 * Composant de réorganisation de l'ordre de la table par le Capitaine :
 * - Glisser-déposer HTML5 drag & drop
 * - Boutons tactiles ⬆️ et ⬇️ pour accessibilité et mobile
 */
export default function CaptainReorderList({
  players = [],
  orderedIds = [],
  submissions = {},
  onReorder,
  disabled = false,
}) {
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const moveItem = (index, direction) => {
    if (disabled) return
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= orderedIds.length) return
    const copy = [...orderedIds]
    const [removed] = copy.splice(index, 1)
    copy.splice(newIndex, 0, removed)
    onReorder?.(copy)
  }

  const handleDragStart = (id) => {
    if (disabled) return
    setDraggedId(id)
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    if (disabled) return
    setDragOverId(id)
  }

  const handleDrop = (id) => {
    if (disabled || !draggedId || draggedId === id) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const fromIdx = orderedIds.indexOf(draggedId)
    const toIdx = orderedIds.indexOf(id)
    if (fromIdx !== -1 && toIdx !== -1) {
      const copy = [...orderedIds]
      const [removed] = copy.splice(fromIdx, 1)
      copy.splice(toIdx, 0, removed)
      onReorder?.(copy)
    }

    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="cmc-reorder-list">
      {orderedIds.map((pid, idx) => {
        const player = players.find(p => p.id === pid) || { id: pid, name: pid }
        const subText = submissions[pid] || 'A parlé oralement'
        const isDragOver = dragOverId === pid

        return (
          <div
            key={pid}
            className={`cmc-player-row ${isDragOver ? 'is-drag-over' : ''}`}
            draggable={!disabled}
            onDragStart={() => handleDragStart(pid)}
            onDragOver={(e) => handleDragOver(e, pid)}
            onDrop={() => handleDrop(pid)}
          >
            <div className="cmc-row-rank">{idx + 1}</div>

            <div className="cmc-row-info">
              <span className="cmc-row-name">{player.name}</span>
              <span className="cmc-row-submission">« {subText} »</span>
            </div>

            {!disabled && (
              <div className="cmc-row-controls">
                <button
                  type="button"
                  className="cmc-control-btn"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, -1)}
                  aria-label="Monter"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="cmc-control-btn"
                  disabled={idx === orderedIds.length - 1}
                  onClick={() => moveItem(idx, 1)}
                  aria-label="Descendre"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
