import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GAME_RULES } from '../../config/rules'
import { PASTEL_COLORS } from '../../config/games'
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
  backTo = '/?mode=local',
  onBack,
}) {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

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
            onClick={() => (onBack ? onBack() : navigate(backTo))}
          >
            ⬅️
          </button>
          <button
            id="nav-burger-btn"
            type="button"
            className="nav-touch-btn"
            aria-label="Menu Burger"
            title="Tous les jeux"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
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
              📜
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
        <p className="game-layout-subfooter">© 2026 Loustic • Rires & Cartoons garantis 🎈</p>
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
