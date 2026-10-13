import { useEffect, useMemo, useState } from 'react'
import '../../styles/bomb-visual.css'
import CartoonButton from '../common/CartoonButton'

/**
 * Composant Bombe Animée (Style Rubber Hose 1930s) :
 * - Mèche qui se consume avec flammèche et étincelles
 * - Yeux cartoon animés expressifs
 * - Vibrations haptiques mobiles navigator.vibrate()
 * - Écran d'explosion plein écran avec affichage du gage
 */
export default function BombVisual({
  isTicking = false,
  isExploded = false,
  holdsBomb = false,
  passCount = 0,
  victimName = '',
  isVictim = false,
  gage = '',
  onReplay,
  onResolve,
  isHost = false,
}) {
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Chronomètre visuel interne pour faire évoluer l'angoisse
  useEffect(() => {
    if (!isTicking) return
    const startMs = Date.now()
    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startMs) / 1000))
    }, 1000)
    return () => {
      clearInterval(interval)
      setSecondsElapsed(0)
    }
  }, [isTicking])

  // Vibration haptique sur mobile à l'explosion
  useEffect(() => {
    if (isExploded && isVictim) {
      navigator.vibrate?.([400, 150, 400, 150, 600])
    }
  }, [isExploded, isVictim])

  // Vibration haptique quand le joueur reçoit la bombe
  useEffect(() => {
    if (isTicking && holdsBomb) {
      navigator.vibrate?.([100, 50, 100])
    }
  }, [isTicking, holdsBomb, passCount])

  // Niveau de stress / accélération de la secousse
  const shakeClass = useMemo(() => {
    if (!isTicking) return ''
    if (secondsElapsed > 22 || passCount > 10) return 'is-ticking-fast'
    if (secondsElapsed > 12 || passCount > 5) return 'is-ticking-mid'
    return 'is-ticking-low'
  }, [isTicking, secondsElapsed, passCount])

  // Pourcentage de combustion de la mèche (progression visuelle)
  const fuseProgress = Math.min(100, (secondsElapsed / 28) * 100)

  return (
    <div className="bomb-stage-wrapper">
      {/* Badge du tour si en cours */}
      {isTicking && (
        <span className="bomb-pass-badge">
          ⚡ Passes : {passCount} {holdsBomb ? '• 🔥 C’EST À TOI !' : ''}
        </span>
      )}

      {/* Visuel Bombe Cartoon */}
      <div className={`bomb-visual-box ${shakeClass}`}>
        <svg
          viewBox="0 0 200 200"
          className="bomb-svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bombe animée"
        >
          {/* Mèche incurvée */}
          <path
            d="M 100 45 C 105 25, 130 20, 145 35 C 155 45, 160 30, 165 20"
            fill="none"
            stroke="#8c7ae6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="90"
            strokeDashoffset={`${(fuseProgress / 100) * 60}`}
          />

          {/* Étincelle / Flammèche animée au bout de la mèche */}
          {isTicking && (
            <g className="fuse-spark" transform="translate(165, 20)">
              <circle cx="0" cy="0" r="10" fill="#ffd32a" />
              <circle cx="0" cy="0" r="6" fill="#ff3f34" />
              <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" />

              {/* Particules d'étincelles */}
              <circle className="sparkle-particle" cx="8" cy="-8" r="2.5" fill="#ffd32a" style={{ '--tx': '12px', '--ty': '-12px' }} />
              <circle className="sparkle-particle" cx="-8" cy="-6" r="2" fill="#ff5e57" style={{ '--tx': '-14px', '--ty': '-8px' }} />
              <circle className="sparkle-particle" cx="6" cy="8" r="2" fill="#ffa801" style={{ '--tx': '10px', '--ty': '10px' }} />
            </g>
          )}

          {/* Douille métallique du détonateur */}
          <rect x="85" y="40" width="30" height="14" rx="4" fill="#57606f" stroke="#161513" strokeWidth="4" />

          {/* Corps sphérique de la bombe */}
          <circle cx="100" cy="115" r="70" fill="#161513" stroke="#161513" strokeWidth="5" />

          {/* Reflet brillant cartoon Rubber Hose */}
          <path
            d="M 60 70 A 52 52 0 0 1 125 60 A 58 58 0 0 0 55 95 Z"
            fill="#ffffff"
            opacity="0.3"
          />

          {/* Yeux expressifs cartoon */}
          <g transform="translate(0, 0)">
            {/* Oeil Gauche */}
            <ellipse cx="80" cy="105" rx="14" ry="19" fill="#ffffff" stroke="#161513" strokeWidth="3.5" />
            <circle
              cx={isTicking ? '82' : '80'}
              cy={isTicking ? (secondsElapsed > 15 ? '108' : '105') : '104'}
              r={isTicking && secondsElapsed > 20 ? '5' : '7.5'}
              fill="#161513"
            />
            <circle cx="83" cy="102" r="2.5" fill="#ffffff" />

            {/* Oeil Droit */}
            <ellipse cx="120" cy="105" rx="14" ry="19" fill="#ffffff" stroke="#161513" strokeWidth="3.5" />
            <circle
              cx={isTicking ? '118' : '120'}
              cy={isTicking ? (secondsElapsed > 15 ? '108' : '105') : '104'}
              r={isTicking && secondsElapsed > 20 ? '5' : '7.5'}
              fill="#161513"
            />
            <circle cx="123" cy="102" r="2.5" fill="#ffffff" />

            {/* Bouche (sourire tremblant ou crispé) */}
            {isTicking ? (
              <path
                d="M 85 142 Q 100 135 115 142"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M 85 138 Q 100 152 115 138"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

            {/* Goutte de sueur cartoon en cas de stress */}
            {isTicking && secondsElapsed > 10 && (
              <path
                className="cartoon-sweat"
                d="M 138 85 Q 146 95 142 102 Q 138 108 132 104 Q 128 98 138 85 Z"
                fill="#00d2d3"
                stroke="#161513"
                strokeWidth="2.5"
              />
            )}
          </g>
        </svg>
      </div>

      {/* --- ÉCRAN MODALE PLEIN ÉCRAN D'EXPLOSION --- */}
      {isExploded && (
        <div className="explosion-fullscreen-overlay" role="dialog" aria-modal="true">
          <div className="explosion-modal-card">
            <h1 className="comic-boom-burst">💥 BOOM !</h1>

            <h2 style={{ margin: '4px 0 10px 0', fontSize: '1.45rem', color: '#161513' }}>
              {isVictim ? (
                <span style={{ color: '#ff4757' }}>LA BOMBE A EXPLOSÉ DANS TES MAINS !</span>
              ) : (
                <span>La bombe a explosé chez <strong style={{ color: '#ff4757' }}>{victimName || 'un joueur'}</strong> !</span>
              )}
            </h2>

            {/* Encadré du Gage tiré au sort */}
            <div className="gage-box">
              <span className="gage-box-title">GAGE / PÉNALITÉ :</span>
              <p className="gage-box-text">{gage || 'Bois 2 gorgées cul-sec !'}</p>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#57606f', fontStyle: 'italic' }}>
              {isVictim
                ? 'Effectue ton gage immédiatement pour sauver ton honneur !'
                : 'Tout le monde s’assure que le gage est respecté !'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {onReplay && isHost && (
                <CartoonButton id="replay-bomb-btn" onClick={onReplay}>
                  🔄 Rejouer une manche
                </CartoonButton>
              )}
              {onResolve && (
                <CartoonButton id="resolve-gage-btn" variant="secondary" onClick={onResolve}>
                  👌 Gage validé
                </CartoonButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
