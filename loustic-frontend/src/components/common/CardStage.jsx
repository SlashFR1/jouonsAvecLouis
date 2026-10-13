/**
 * Carte centrale de la scène. `cardKey` relance l'animation d'entrée à chaque nouvelle carte.
 */
export default function CardStage({ tag, cardKey, className = '', children }) {
  return (
    <section key={cardKey} className={`game-stage-card stage-pop ${className}`.trim()}>
      {tag && <span className="stage-tag">{tag}</span>}
      {children}
    </section>
  )
}

/** États de chargement / erreur communs à tous les jeux. */
export function StageStatus({ status, error }) {
  if (status === 'loading') {
    return (
      <section className="game-stage-card">
        <div className="stage-spinner" aria-hidden="true">🃏</div>
        <p>Mélange des cartes…</p>
      </section>
    )
  }
  if (status === 'error') {
    return (
      <section className="game-stage-card">
        <div className="stage-emoji" aria-hidden="true">😵</div>
        <h2>Oups !</h2>
        <p>{error}</p>
      </section>
    )
  }
  return null
}
