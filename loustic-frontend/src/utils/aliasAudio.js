/**
 * Moteur Audio Web Audio API pour "Alias" (variante Codenames).
 * Fournit les retours haptiques et sonores immersifs :
 * - Carte trouvée par son équipe (chime harmonieux)
 * - Carte adverse (warning / boing)
 * - Carte neutre (tap feutré)
 * - Carte Assassin (gong dramatique / dark rumble)
 * - Fin de partie / Victoire (fanfare)
 */

class AliasAudioEngine {
  constructor() {
    this.audioCtx = null
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
    return this.audioCtx
  }

  /**
   * Clic sur une carte de sa propre équipe : chime ascendant éclatant
   */
  playTeamCard() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime

    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)

      gain.gain.setValueAtTime(0.001, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.08 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.36)
    })
  }

  /**
   * Clic sur une carte neutre (témoin) : double tap feutré
   */
  playNeutralCard() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime

    ;[0, 0.1].forEach(offset => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now + offset)
      osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.09)

      gain.gain.setValueAtTime(0.25, now + offset)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + offset)
      osc.stop(now + offset + 0.11)
    })
  }

  /**
   * Clic sur une carte adverse : boing / avertissement dissonant
   */
  playOpponentCard() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'square'

    osc1.frequency.setValueAtTime(260, now)
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.35)

    osc2.frequency.setValueAtTime(245, now)
    osc2.frequency.exponentialRampToValueAtTime(170, now + 0.35)

    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.42)
    osc2.stop(now + 0.42)
  }

  /**
   * CARTE NOIRE ASSASSIN : Gong dramatique, distorsion basse et descente sombre
   */
  playAssassinCard() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Gong grave
    const oscGong = ctx.createOscillator()
    const gainGong = ctx.createGain()
    oscGong.type = 'sine'
    oscGong.frequency.setValueAtTime(110, now)
    oscGong.frequency.exponentialRampToValueAtTime(45, now + 1.8)

    gainGong.gain.setValueAtTime(0.7, now)
    gainGong.gain.exponentialRampToValueAtTime(0.0001, now + 2.0)

    oscGong.connect(gainGong)
    gainGong.connect(ctx.destination)
    oscGong.start(now)
    oscGong.stop(now + 2.05)

    // Bruit de distorsion / impact
    const oscDist = ctx.createOscillator()
    const gainDist = ctx.createGain()
    oscDist.type = 'sawtooth'
    oscDist.frequency.setValueAtTime(75, now)
    oscDist.frequency.exponentialRampToValueAtTime(30, now + 1.2)

    gainDist.gain.setValueAtTime(0.5, now)
    gainDist.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    oscDist.connect(gainDist)
    gainDist.connect(ctx.destination)
    oscDist.start(now)
    oscDist.stop(now + 1.25)
  }

  /**
   * Indice soumis par le Maître Espion
   */
  playClueSubmitted() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.setValueAtTime(880, now + 0.12) // A5

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  }

  /**
   * Fanfare de victoire
   */
  playVictory() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    const melody = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.4 },
      { f: 587.33, t: 0.9, d: 0.2 },
      { f: 783.99, t: 1.15, d: 0.6 }
    ]

    melody.forEach(n => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(n.f, now + n.t)

      gain.gain.setValueAtTime(0.001, now + n.t)
      gain.gain.linearRampToValueAtTime(0.3, now + n.t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + n.t)
      osc.stop(now + n.t + n.d + 0.05)
    })
  }
}

export const aliasAudio = new AliasAudioEngine()
