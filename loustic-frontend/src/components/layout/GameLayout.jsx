import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GAME_RULES } from '../../config/rules'
import { PASTEL_COLORS, MULTI_GAMES, OTHER_GAMES } from '../../config/games'
import BurgerDrawer from './BurgerDrawer'

/**
 * App shell universel homogène pour toute l'application :
 * - Navbar supérieure avec Bouton Retour (⬅️), Menu Burger (☰), Titre badge centré, Bouton Règles (📜).
 * - Tiroir Burger latéral (navigation rapide vers Accueil et tous les jeux).
 * - Modale de Règles popup avec les explications du jeu actif.
 * - Fond pastel dynamique (--pastel-bg) adapté au jeu, avec trame Rubber Hose.
 * - Thumb zone ergonomique (boutons d'action) + Footer uniforme.
 */
export default function GameLayout({
  gameKey,
  title,
  color,
  pastelBg,
  right,
  footer,
  children,
  backTo,
  onBack,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  // Résolution intelligente de la destination de retour
  const resolvedBackTo = useMemo(() => {
    if (backTo) return backTo

    const pathname = location.pathname || ''
    // 1. Salles multi-joueurs (/salle/*) -> Retour vers Plusieurs Téléphones
    if (pathname.startsWith('/salle/')) return '/?mode=multi'

    // 2. Jeux multijoueurs (Switch, Galerie, Mess Meme, Débat...)
    const isMultiGame = MULTI_GAMES.some(g => g.id === gameKey || (g.route && pathname.startsWith(g.route)))
    if (isMultiGame) return '/?mode=multi'

    // 3. Autres Jeux
    const isOtherGame = OTHER_GAMES.some(g => g.id === gameKey)
    if (isOtherGame) return '/?mode=other'

    // 4. Par défaut : Jeux 1 Seul Téléphone
    return '/?mode=local'
  }, [backTo, location.pathname, gameKey])

  // Couleur pastel unique par jeu (la seule fantaisie autorisée)
  const resolvedPastel = pastelBg || (gameKey && PASTEL_COLORS[gameKey]) || '#faf6eb'

  // Récupération des règles officielles du jeu
  const rules = gameKey ? GAME_RULES[gameKey] : null

  return (
    <div
      className="game-layout"
      style={{
        '--pastel-bg': resolvedPastel,
        ...(color ? { '--game-color': color } : {}),
      }}
    >
      {/* 1. NAVBAR SUPÉRIEURE UNIFORME */}
      <header className="game-layout-header">
        <div className="nav-group-left">
          <button
            id="nav-back-btn"
            type="button"
            className="nav-touch-btn"
            aria-label="Retour"
            title="Retour"
            onClick={() => (onBack ? onBack() : navigate(resolvedBackTo))}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button
            id="nav-burger-btn"
            type="button"
            className="nav-touch-btn"
            aria-label="Menu"
            title="Tous les jeux"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="nav-title-center">
          <h1 className="header-title-badge">{title}</h1>
        </div>

        <div className="nav-group-right">
          {rules && (
            <button
              id="nav-rules-btn"
              type="button"
              className="nav-touch-btn"
              aria-label="Règles du jeu"
              title="Règles"
              onClick={() => setRulesOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          )}
          {right}
        </div>
      </header>

      {/* 2. SCÈNE CENTRALE */}
      <main className="game-layout-content">{children}</main>

      {/* 3. FOOTER UNIFORME AVEC THUMB ZONE & SIGNATURE */}
      <footer className="game-layout-footer">
        {footer && <div className="action-footer-inner">{footer}</div>}
        <p className="game-layout-subfooter">© 2026 Loustic • Jeux d'ambiance</p>
      </footer>

      {/* 4. MENU BURGER LATERAL (DRAWER) */}
      <BurgerDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* 5. MODALE DES RÈGLES OFFICIELLES */}
      {rulesOpen && rules && (
        <div
          id="rules-backdrop"
          className="rules-modal-overlay"
          role="presentation"
          onClick={() => setRulesOpen(false)}
        >
          <div
            id="rules-modal"
            className="rules-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="rules-modal-header">
              <h2 id="rules-title">{rules.title}</h2>
              {rules.tagline && <p className="rules-modal-tagline">{rules.tagline}</p>}
              {rules.equivalent && (
                <div
                  id="rules-equivalent-badge"
                  style={{
                    background: '#f9c835',
                    border: '2px solid #161513',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#161513',
                    display: 'inline-block',
                    marginTop: '6px',
                    boxShadow: '2px 2px 0 #161513',
                  }}
                >
                  🎲 Équivalent : {rules.equivalent}
                </div>
              )}
            </div>

            <div className="rules-modal-body">
              {rules.sections.map((sec, idx) => (
                <div key={idx} className="rules-section-item">
                  <h3 className="rules-section-subtitle">{sec.subtitle}</h3>
                  <p className="rules-section-text">{sec.text}</p>
                </div>
              ))}
            </div>

            <button
              id="close-rules-btn"
              type="button"
              className="btn-cta btn-action-primary"
              style={{ marginTop: '8px' }}
              onClick={() => setRulesOpen(false)}
            >
              Compris ! 🎲
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
