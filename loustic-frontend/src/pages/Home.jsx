import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CARD_COLORS, LEGACY_BASE_URL, LOCAL_GAMES, MULTI_GAMES, OTHER_GAMES } from '../config/games'
import BurgerDrawer from '../components/layout/BurgerDrawer'

const CURRENT_YEAR = 2026

export default function Home() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const mode = params.get('mode') // null | 'local' | 'multi' | 'other'

  useEffect(() => {
    document.title = 'Loustic – Jeux de soirée sur un ou plusieurs téléphones'
  }, [])

  const setMode = m => {
    setParams(m ? { mode: m } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const open = game => {
    if (game.route) navigate(game.route)
    else if (game.external) window.open(game.external, '_blank', 'noopener')
    else window.location.assign(LEGACY_BASE_URL + game.legacy)
  }

  const games = mode === 'local' ? LOCAL_GAMES : mode === 'multi' ? MULTI_GAMES : OTHER_GAMES

  return (
    <div className="home">
      <header className="home-header" style={{ position: 'relative' }}>
        <button
          id="home-burger-btn"
          type="button"
          className="nav-touch-btn"
          aria-label="Menu Burger"
          title="Tous les jeux"
          style={{ position: 'absolute', left: '16px', top: '16px' }}
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>
        <h1>
          Bienvenue sur <span className="home-logo">Loustic</span>
        </h1>
        <p className="home-tagline">Des jeux de soirée cartoon, sans prise de tête 🎈</p>
      </header>
      <BurgerDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {!mode ? (
        <main className="home-grid home-grid-choice">
          <ModeCard
            id="mode-local-card"
            color={CARD_COLORS.purple}
            icon="📱"
            title="1 Seul Téléphone"
            desc="Jouez ensemble en vous passant un unique téléphone (Pass & Play)."
            onClick={() => setMode('local')}
          />
          <ModeCard
            id="mode-multi-card"
            gold
            icon="📲"
            title="Plusieurs Téléphones"
            desc="Chacun joue sur son propre téléphone, synchronisé en temps réel."
            onClick={() => setMode('multi')}
          />
          <ModeCard
            id="mode-other-card"
            color={CARD_COLORS.blue}
            icon="🌐"
            title="Autres Jeux"
            desc="Découvrez nos autres jeux en ligne (Petit Bac, Toon Insight, Belote & Blind Test) !"
            onClick={() => setMode('other')}
          />
        </main>
      ) : (
        <main className="home-grid">
          <div className="home-back">
            <button id="home-back-btn" type="button" className="btn-back" onClick={() => setMode(null)}>
              ⬅️ Retour
            </button>
          </div>
          {games.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} onClick={() => open(g)} />
          ))}
        </main>
      )}

      <footer className="home-footer">
        <p>© {CURRENT_YEAR} Loustic. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

function ModeCard({ id, color, gold, icon, title, desc, onClick }) {
  return (
    <button
      id={id}
      type="button"
      className={`home-card home-card-choice ${gold ? 'home-card-gold' : ''}`}
      style={color ? { '--card-bg': color } : undefined}
      onClick={onClick}
    >
      <span className="home-card-icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <p>{desc}</p>
    </button>
  )
}

function GameCard({ game, index, onClick }) {
  const isComingSoon = Boolean(game.isComingSoon)
  return (
    <button
      id={`game-card-${game.id}`}
      type="button"
      className={`home-card ${isComingSoon ? 'is-coming-soon' : ''}`}
      style={{
        '--card-bg': CARD_COLORS[game.color],
        '--delay': `${index * 35}ms`,
        opacity: isComingSoon ? 0.85 : 1,
      }}
      onClick={() => {
        if (isComingSoon) {
          alert('Blind Test arrive très bientôt sur Loustic ! Restez connectés 🎵🎈')
          return
        }
        onClick()
      }}
    >
      {game.isNew && <span className="home-badge home-badge-new">Nouveau</span>}
      {isComingSoon && <span className="home-badge" style={{ background: '#ca8a04', color: '#fff' }}>Bientôt</span>}
      {game.external && <span className="home-badge" style={{ background: '#0284c7', color: '#fff' }}>Lien externe ↗</span>}
      <h2>
        {game.title} <span aria-hidden="true">{game.emoji}</span>
      </h2>
      <p>{game.desc}</p>
    </button>
  )
}
