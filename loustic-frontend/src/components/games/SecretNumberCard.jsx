import { useState } from 'react'
import '../../styles/classe-moica-visual.css'

/**
 * Composant Carte Secrète Sécurisée :
 * - Empêche les voisins de table de voir le chiffre secret
 * - Révélation dynamique par pression maintenue (Pointer / Touch)
 */
export default function SecretNumberCard({ number = '?' }) {
  const [isPressed, setIsPressed] = useState(false)
  const [isToggled, setIsToggled] = useState(false)

  const isVisible = isPressed || isToggled

  const handlePointerDown = (e) => {
    e.preventDefault()
    setIsPressed(true)
  }

  const handlePointerUp = () => {
    setIsPressed(false)
  }

  return (
    <div className="cmc-secret-box">
      <div className={`secret-number-display ${isVisible ? 'is-revealed' : 'is-hidden'}`}>
        {isVisible ? (
          <>
            <span className="secret-number-value">{number}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#92400e', textTransform: 'uppercase' }}>
              Sur 10
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '2.8rem' }}>🔒</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>
              Secret
            </span>
          </>
        )}
      </div>

      <button
        type="button"
        className={`secret-touch-trigger ${isPressed ? 'is-pressed' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Maintenir pour afficher votre chiffre secret"
      >
        <span>👁️</span>
        <span>{isVisible ? 'Relâcher pour masquer' : 'Maintenir pour voir mon chiffre'}</span>
      </button>

      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: '0.75rem',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '4px',
        }}
        onClick={() => setIsToggled(t => !t)}
      >
        {isToggled ? 'Masquer définitivement' : 'Mode accessible (cliquer pour afficher)'}
      </button>
    </div>
  )
}
