import { useNavigate } from 'react-router-dom'
import { LOCAL_GAMES, MULTI_GAMES, OTHER_GAMES } from '../../config/games'

export default function BurgerDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleNav = to => {
    onClose()
    navigate(to)
  }

  return (
    <div
      id="burger-drawer"
      className="drawer-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        id="burger-drawer-panel"
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-brand">
            <span>🎈 Loustic</span>
          </div>
          <button
            id="close-drawer-btn"
            type="button"
            className="drawer-close-btn"
            aria-label="Fermer le menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <div>
            <p className="drawer-nav-section-title">Navigation</p>
            <button
              id="drawer-home-link"
              type="button"
              className="drawer-link-btn"
              onClick={() => handleNav('/')}
            >
              🏠 Accueil Loustic
            </button>
          </div>

          <div>
            <p className="drawer-nav-section-title">📱 Jeux 1 Téléphone (Pass & Play)</p>
            <div className="drawer-game-list">
              {LOCAL_GAMES.map(g => (
                <button
                  key={g.id}
                  id={`drawer-game-${g.id}`}
                  type="button"
                  className="drawer-game-item"
                  onClick={() => handleNav(g.route || `/?mode=local`)}
                >
                  <span>{g.emoji} {g.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#747d8c' }}>Jouer ➔</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="drawer-nav-section-title">📲 Jeux Plusieurs Téléphones (Multijoueurs)</p>
            <div className="drawer-game-list">
              {MULTI_GAMES.filter(g => g.route).map(g => (
                <button
                  key={g.id}
                  id={`drawer-multi-${g.id}`}
                  type="button"
                  className="drawer-game-item"
                  onClick={() => handleNav(g.route)}
                >
                  <span>{g.emoji} {g.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#ff4757', fontWeight: 700 }}>Direct ⚡</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="drawer-nav-section-title">🌐 Autres Jeux (En Ligne & Liens)</p>
            <div className="drawer-game-list">
              {OTHER_GAMES.map(g => (
                <button
                  key={g.id}
                  id={`drawer-other-${g.id}`}
                  type="button"
                  className="drawer-game-item"
                  onClick={() => {
                    onClose()
                    if (g.isComingSoon) {
                      alert('Blind Test arrive très bientôt sur Loustic ! 🎵🎈')
                    } else if (g.external) {
                      window.open(g.external, '_blank', 'noopener')
                    } else if (g.route) {
                      navigate(g.route)
                    }
                  }}
                >
                  <span>{g.emoji} {g.title}</span>
                  <span style={{ fontSize: '0.8rem', color: g.isComingSoon ? '#ca8a04' : '#0284c7', fontWeight: 700 }}>
                    {g.isComingSoon ? 'Bientôt 🎵' : 'Ouvrir ↗'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
