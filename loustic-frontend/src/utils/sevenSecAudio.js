/**
 * Moteur Audio Haute Précision pour "7 Secondes" (Style 5 Second Rule).
 * Utilise la Web Audio API pour synthétiser un décompte d'urgence montant
 * et un gong final percutant avec 0 latence et 0 dépendance réseau externe.
 */

class SevenSecAudioEngine {
  constructor() {
    this.audioCtx = null
    this.unlocked = false
    this.intervalId = null
    this.rafId = null
    this.isRunning = false
  }

  initContext() {
    if (this.unlocked && this.audioCtx) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass()
    }
    this.unlocked = true
  }

  unlock() {
    this.initContext()
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
  }

  /**
   * Lance les bips d'urgence accélérant sur 7 secondes.
   * La fréquence sonore et le rythme augmentent au fur et à mesure que le temps s'écoule.
   */
  startUrgentCountdown(durationMs = 7000) {
    this.unlock()
    this.stop()
    this.isRunning = true

    const startTime = performance.now()
    const ctx = this.audioCtx
    if (!ctx) return

    let nextBeepTime = startTime

    const scheduleNext = () => {
      if (!this.isRunning) return
      const now = performance.now()
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / durationMs)

      if (progress >= 1) {
        this.stop()
        return
      }

      // Intervalle entre les bips : de 900ms au début à 160ms vers la fin
      const currentInterval = 900 - Math.pow(progress, 1.4) * 740

      if (now >= nextBeepTime) {
        // Fréquence sonore qui monte en tension de 440Hz (La) à 880Hz (La aigu)
        const freq = 440 + progress * 440
        this.playBeep(freq, progress > 0.65 ? 0.08 : 0.05, progress > 0.65 ? 0.35 : 0.2)
        nextBeepTime = now + currentInterval
      }

      this.rafId = requestAnimationFrame(scheduleNext)
    }

    this.rafId = requestAnimationFrame(scheduleNext)
  }

  /**
   * Bip sonore synthétique propre
   */
  playBeep(frequency = 520, duration = 0.06, volume = 0.25) {
    if (!this.audioCtx) return
    try {
      const ctx = this.audioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)

      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio context silencieux si restreint
    }
  }

  /**
   * Gong final percutant et résonant (harmoniques métalliques cuivrées)
   */
  playGong() {
    this.stop()
    this.unlock()
    if (!this.audioCtx) return

    try {
      const ctx = this.audioCtx
      const now = ctx.currentTime

      // Fréquences harmoniques d'un gong résonant
      const partials = [
        { freq: 220, gain: 0.5, decay: 2.2 },
        { freq: 330, gain: 0.35, decay: 1.8 },
        { freq: 440, gain: 0.25, decay: 1.4 },
        { freq: 587, gain: 0.18, decay: 1.0 },
        { freq: 880, gain: 0.12, decay: 0.8 },
      ]

      partials.forEach(({ freq, gain: initGain, decay }) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        gainNode.gain.setValueAtTime(initGain, now)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + decay)
      })

      // Déclenche une vibration haptique percutante
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([250, 100, 400])
      }
    } catch {
      // Ignorer
    }
  }

  /**
   * Son de succès joyeux (arpège majeur montant)
   */
  playSuccess() {
    this.unlock()
    if (!this.audioCtx) return
    const notes = [523.25, 659.25, 783.99, 1046.5] // Do - Mi - Sol - Do
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.18, 0.25)
      }, idx * 75)
    })
  }

  /**
   * Son d'échec / pénalité (buzzer descendant)
   */
  playFail() {
    this.unlock()
    if (!this.audioCtx) return
    try {
      const ctx = this.audioCtx
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.linearRampToValueAtTime(90, now + 0.35)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.35)
    } catch {
      // Ignorer
    }
  }

  stop() {
    this.isRunning = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export const sevenSecAudio = new SevenSecAudioEngine()
