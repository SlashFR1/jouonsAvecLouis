/**
 * Moteur Audio Haute Précision pour "Classe moi ça" (Style Top Ten / Ito).
 * Synthétiseur Web Audio API pour les ding de validation et alertes d'inversion.
 */

class CmcAudioEngine {
  constructor() {
    this.audioCtx = null
    this.unlocked = false
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
   * Ding cristallin joyeux : ordre croissant respecté !
   */
  playStepSuccess() {
    this.unlock()
    if (!this.audioCtx) return
    try {
      const ctx = this.audioCtx
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, now) // Mi
      osc.frequency.setValueAtTime(880, now + 0.08) // La

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

  /**
   * Alerte sonore d'inversion / erreur : perte d'un croissant de licorne !
   */
  playStepError() {
    this.unlock()
    if (!this.audioCtx) return
    try {
      const ctx = this.audioCtx
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(240, now)
      osc.frequency.linearRampToValueAtTime(110, now + 0.35)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.4)

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 250])
      }
    } catch {
      // Ignorer
    }
  }

  /**
   * Fanfare de victoire de l'équipe (5 manches survécues)
   */
  playVictory() {
    this.unlock()
    if (!this.audioCtx) return
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5] // Do - Mi - Sol - Do - Mi
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const ctx = this.audioCtx
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, now)
          gain.gain.setValueAtTime(0.28, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.4)
        } catch {}
      }, idx * 100)
    })
  }

  /**
   * Game Over sonore (0 vies restantes)
   */
  playGameOver() {
    this.unlock()
    if (!this.audioCtx) return
    const notes = [293.66, 261.63, 220, 174.61]
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const ctx = this.audioCtx
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(freq, now)
          gain.gain.setValueAtTime(0.25, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.45)
        } catch {}
      }, idx * 120)
    })
  }
}

export const cmcAudio = new CmcAudioEngine()
