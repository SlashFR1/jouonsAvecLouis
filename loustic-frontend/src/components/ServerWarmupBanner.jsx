import React from 'react'
import '../styles/app.css'

/**
 * Toast non bloquant affiché en haut d'écran dans la charte cartoon Rubber Hose Loustic.
 * Informe l'utilisateur avec humour lorsque le serveur Render sort d'hibernation (cold start).
 */
export default function ServerWarmupBanner({ isVisible, isDismissing }) {
  if (!isVisible && !isDismissing) return null

  return (
    <div className={`loustic-warmup-toast ${isDismissing ? 'toast-dismiss' : 'toast-visible'}`}>
      <div className="toast-content">
        <span className="toast-emoji" role="img" aria-label="cafe">
          {isDismissing ? '✨' : '☕'}
        </span>
        <span className="toast-text">
          {isDismissing ? (
            <strong>Serveur prêt, amusez-vous bien ! 🚀</strong>
          ) : (
            <>
              Le serveur se réveille tranquillement... <strong>(quelques secondes)</strong>
            </>
          )}
        </span>
      </div>
    </div>
  )
}
