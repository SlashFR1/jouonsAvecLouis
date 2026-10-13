import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/responsive-global.css'
import './styles/game-layout.css'
import './styles/app.css'
import './styles/cartoon-timer.css'
import App from './App.jsx'

// Rétroaction tactile universelle : quand on clique sur un bouton, il reste enfoncé avec sa couleur
if (typeof document !== 'undefined') {
  let activeChoiceBtn = null

  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('button, .home-card, .footer-choice-btn, .drawer-game-item')
    if (!btn || btn.disabled) return

    const isChoice =
      btn.classList.contains('footer-choice-btn') ||
      btn.classList.contains('home-card') ||
      btn.classList.contains('drawer-game-item') ||
      btn.getAttribute('role') === 'tab'

    if (isChoice) {
      if (activeChoiceBtn && activeChoiceBtn !== btn) {
        activeChoiceBtn.removeAttribute('data-pressed')
        activeChoiceBtn.classList.remove('is-pressed')
      }
      activeChoiceBtn = btn
      btn.setAttribute('data-pressed', 'true')
      btn.classList.add('is-pressed')
    } else {
      btn.setAttribute('data-pressed', 'true')
      btn.classList.add('is-pressed')
      setTimeout(() => {
        if (!btn.classList.contains('selected') && btn.getAttribute('aria-pressed') !== 'true') {
          btn.removeAttribute('data-pressed')
          btn.classList.remove('is-pressed')
        }
      }, 450)
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
