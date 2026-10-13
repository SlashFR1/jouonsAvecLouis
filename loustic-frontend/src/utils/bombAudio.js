/**
 * Moteur Audio Haute Précision pour "Boom boom" (La Bombe).
 * Combine les fichiers audio réels (tictac.mp3, boom.mp3) avec un synthétiseur
 * Web Audio API de secours (garantit 0 échec sur mobile/iOS même sans réseau).
 */

class BombAudioEngine {
  constructor() {
    this.audioCtx = null
    this.tickAudio = null
    this.boomAudio = null
    this.tickTimer = null
    this.currentIntervalMs = 850
    this.isTicking = false
    this.unlocked = false
  }

  initContext() {
    if (this.unlocked) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass()
    }
    try {
      this.tickAudio = new Audio('/audio/tictac.mp3')
      this.tickAudio.loop = true
      this.boomAudio = new Audio('/audio/boom.mp3')
    } catch {
      // Pas de support HTML5 Audio natif, Web Audio prend le relais
    }
    this.unlocked = true
  }

  unlock() {
    this.initContext()
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
    if (this.tickAudio) {
      this.tickAudio.play().then(() => {
        this.tickAudio.pause()
        this.tickAudio.currentTime = 0
      }).catch(() => {})
    }
    if (this.boomAudio) {
      this.boomAudio.play().then(() => {
        this.boomAudio.pause()
        this.boomAudio.currentTime = 0
      }).catch(() => {})
    }
  }

  /** Lance le tic-tac avec accélération progressive */
  startTicking(initialRate = 1.0) {
    this.unlock()
    this.stop()
    this.isTicking = true
    this.currentIntervalMs = 850

    if (this.tickAudio) {
      this.tickAudio.playbackRate = initialRate
      this.tickAudio.currentTime = 0
      this.tickAudio.play().catch(() => {
        // En cas de blocage navigateur, bascule sur Web Audio synthétisé
        this.startSynthTicking()
      })
    } else {
      this.startSynthTicking()
    }
  }

  /** Accélère la cadence du tic-tac */
  speedUp(step = 0.15) {
    if (!this.isTicking) return
    if (this.tickAudio && !this.tickAudio.paused) {
      this.tickAudio.playbackRate = Math.min(3.6, this.tickAudio.playbackRate + step)
    }
    this.currentIntervalMs = Math.max(120, this.currentIntervalMs * 0.82)
  }

  /** Joue le son de détonation explosif */
  playBoom() {
    this.stop()
    if (this.boomAudio) {
      this.boomAudio.currentTime = 0
      this.boomAudio.play().catch(() => {
        this.playSynthBoom()
      })
    } else {
      this.playSynthBoom()
    }
  }

  stop() {
    this.isTicking = false
    if (this.tickAudio) {
      this.tickAudio.pause()
      this.tickAudio.currentTime = 0
    }
    if (this.tickTimer) {
      clearTimeout(this.tickTimer)
      this.tickTimer = null
    }
  }

  // --- Synthétiseur Web Audio de secours (0 latence, autonome) ---
  startSynthTicking() {
    if (!this.isTicking) return
    this.playSynthClick(this.currentIntervalMs < 300)

    this.tickTimer = setTimeout(() => {
      if (this.isTicking) {
        this.currentIntervalMs = Math.max(130, this.currentIntervalMs * 0.96)
        this.startSynthTicking()
      }
    }, this.currentIntervalMs)
  }

  playSynthClick(highPitch = false) {
    if (!this.audioCtx) return
    try {
      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(highPitch ? 1100 : 750, this.audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.audioCtx.destination)
      osc.start()
      osc.stop(this.audioCtx.currentTime + 0.04)
    } catch {
      // Ignoré si audio context indisponible
    }
  }

  playSynthBoom() {
    if (!this.audioCtx) return
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.9
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = this.audioCtx.createBufferSource()
      noise.buffer = buffer

      const filter = this.audioCtx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.8)

      const gain = this.audioCtx.createGain()
      gain.gain.setValueAtTime(1.0, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.9)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.audioCtx.destination)
      noise.start()
      noise.stop(this.audioCtx.currentTime + 0.9)
    } catch {
      // Ignoré
    }
  }
}

export const bombAudio = new BombAudioEngine()
