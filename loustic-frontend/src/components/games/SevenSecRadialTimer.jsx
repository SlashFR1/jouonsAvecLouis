import { useEffect, useRef, useState } from 'react'
import '../../styles/seven-sec-visual.css'

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~552.92

/**
 * Composant Chrono Radial 7 Secondes :
 * - Progression radiale 60fps ultra-fluide synchronisée via requestAnimationFrame
 * - Affichage au dixième de seconde (7.0s -> 0.0s)
 * - Esthétique Cartoon / Rubber Hose (clochettes vintage, secousses urgentes, yeux animés)
 */
export default function SevenSecRadialTimer({
  isRunning = false,
  duration = 7.0,
  countdownEndsAt = null,
  onComplete,
  phase = 'READY', // READY | COUNTDOWN | REFEREE_VOTE | SCORE_UPDATE
}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const animRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    completedRef.current = false
    const targetEnd = countdownEndsAt || (performance.now() + duration * 1000)

    const tick = () => {
      const now = countdownEndsAt ? Date.now() : performance.now()
      const remainingMs = Math.max(0, targetEnd - now)
      const sec = remainingMs / 1000

      setTimeLeft(sec)

      if (sec <= 0.01) {
        setTimeLeft(0)
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        return
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isRunning, duration, countdownEndsAt, onComplete])

  const currentTime = isRunning ? timeLeft : (phase === 'REFEREE_VOTE' || phase === 'SCORE_UPDATE' ? 0 : duration)
  const progress = Math.max(0, Math.min(1, currentTime / duration))
  const strokeOffset = CIRCUMFERENCE * (1 - progress)
  const isUrgent = isRunning && currentTime <= 3.0

  return (
    <div className="seven-sec-container">
      <div className={`stopwatch-wrapper ${isUrgent ? 'is-urgent' : ''}`}>
        <svg
          className="stopwatch-svg"
          viewBox="0 0 260 260"
          aria-label={`Temps restant : ${currentTime.toFixed(1)} secondes`}
          role="timer"
        >
          {/* Anneau d'attache supérieur et bouton poussoir de chronomètre */}
          <g className="clock-bells">
            {/* Cloche gauche */}
            <path d="M 52 48 C 42 36 28 42 22 56 C 26 62 44 60 52 48 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="5" />
            {/* Cloche droite */}
            <path d="M 208 48 C 218 36 232 42 238 56 C 234 62 216 60 208 48 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="5" />
            {/* Bouton pressoir haut */}
            <rect x="118" y="10" width="24" height="22" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="5" />
            <circle cx="130" cy="8" r="8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="4" />
          </g>

          {/* Corps rond du chronomètre */}
          <circle className="radial-track" cx="130" cy="130" r={RADIUS + 18} />

          {/* Rail du fond */}
          <circle className="radial-rail" cx="130" cy="130" r={RADIUS} />

          {/* Arc de cercle de progression fluide 60fps */}
          <circle
            className="radial-progress"
            cx="130"
            cy="130"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
          />

          {/* Décorations Rubber Hose centrales */}
          <g opacity={isUrgent ? 1 : 0.85}>
            {/* Yeux cartoon expressifs */}
            <ellipse cx="112" cy="100" rx="7" ry="11" fill="#1e293b" />
            <ellipse cx="148" cy="100" rx="7" ry="11" fill="#1e293b" />
            <circle cx="114" cy="97" r="3" fill="#ffffff" />
            <circle cx="150" cy="97" r="3" fill="#ffffff" />

            {/* Goutte de sueur cartoon en mode urgent */}
            {isUrgent && (
              <path
                d="M 172 90 C 172 82 178 72 178 72 C 178 72 184 82 184 90 C 184 96 178 100 172 90 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="2"
              />
            )}
          </g>
        </svg>

        {/* Affichage digital percutant au centre */}
        <div className="stopwatch-dial-content">
          <span className="time-number">{currentTime.toFixed(1)}</span>
          <span className="time-unit">{isUrgent ? '🚨 VITE !' : 'SECONDES'}</span>
        </div>
      </div>

      {/* Badge indicateur d'état */}
      <div
        className={`seven-sec-status-badge ${
          phase === 'COUNTDOWN'
            ? isUrgent
              ? 'status-urgent'
              : 'status-running'
            : phase === 'REFEREE_VOTE'
            ? 'status-done'
            : 'status-ready'
        }`}
      >
        {phase === 'READY' && '⏳ Prêt pour le top départ'}
        {phase === 'COUNTDOWN' && (isUrgent ? '🔥 PLUS QUE 3s, PARLE !' : '⚡ Top chrono, cite 3 éléments !')}
        {phase === 'REFEREE_VOTE' && '🛑 STOP ! Vote de la table en cours'}
        {phase === 'SCORE_UPDATE' && '⚖️ Verdict prononcé !'}
      </div>
    </div>
  )
}
