import { useState } from 'react'

/** Saisie des joueurs pour le mode Pass & Play. */
export default function PlayerSetup({ players, onChange, min = 2 }) {
  const [name, setName] = useState('')

  const add = e => {
    e.preventDefault()
    const n = name.trim()
    if (!n || players.includes(n)) return
    onChange([...players, n])
    setName('')
  }

  return (
    <section className="game-stage-card player-setup">
      <h2>Qui joue ? 🎉</h2>
      <form className="player-form" onSubmit={add}>
        <input
          id="player-name-input"
          type="text"
          value={name}
          maxLength={20}
          placeholder="Prénom du joueur"
          onChange={e => setName(e.target.value)}
        />
        <button id="add-player-btn" type="submit" className="btn-add" aria-label="Ajouter le joueur">＋</button>
      </form>
      <div className="player-chips">
        {players.map(p => (
          <span key={p} className="player-chip">
            {p}
            <button
              type="button"
              className="chip-remove"
              aria-label={`Retirer ${p}`}
              onClick={() => onChange(players.filter(x => x !== p))}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      {players.length < min && <p className="hint">Ajoute au moins {min} joueurs.</p>}
    </section>
  )
}
