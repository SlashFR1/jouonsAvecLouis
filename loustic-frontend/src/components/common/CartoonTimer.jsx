/**
 * Composant CartoonTimer
 * Chronomètre Rubber Hose animé avec clochettes, tremblement d'urgence comique et sueur cartoon
 */
export default function CartoonTimer({
  seconds,
  isRunning = false,
  isExpired = false,
  urgentThreshold = 10,
  onToggleRunning,
  showControls = true,
  size = 'medium', // 'small' | 'medium' | 'large'
}) {
  const isUrgent = isRunning && seconds <= urgentThreshold && seconds > 0
  const isFinished = isExpired || seconds === 0

  const containerClasses = [
    'cartoon-timer-wrap',
    isRunning && !isUrgent && !isFinished ? 'cartoon-timer-running' : '',
    isUrgent ? 'cartoon-timer-urgent' : '',
    isFinished ? 'cartoon-timer-expired' : '',
  ].filter(Boolean).join(' ')

  const formatTime = s => {
    if (s < 0) return '0s'
    return `${s}s`
  }

  return (
    <div className={containerClasses}>
      {/* Contrôle pause/play optionnel sans emoji superflu */}
      {showControls && onToggleRunning && (
        <button
          type="button"
          onClick={onToggleRunning}
          title={isRunning ? 'Mettre en pause' : 'Démarrer le chrono'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            color: '#161513',
          }}
        >
          {isRunning ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      )}

      {/* Boîtier du chronomètre avec clochettes */}
      <div className="cartoon-stopwatch">
        <div className="cartoon-btn-top" />
        <div className="cartoon-bell-left" />
        <div className="cartoon-bell-right" />

        <span>{formatTime(seconds)}</span>

        {/* Goutte de sueur cartoon en phase d'urgence */}
        {isUrgent && <span className="cartoon-sweat">💦</span>}
      </div>
    </div>
  )
}
