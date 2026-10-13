import '../../styles/classe-moica-visual.css'

/**
 * Barre de vies "Croissants de licorne" (Top Ten coopératif) :
 * - 4 croissants de licorne au départ
 * - Chaque inversion d'ordre fait perdre 1 croissant
 */
export default function UnicornLivesBar({
  lives = 4,
  maxLives = 4,
  round = 1,
  maxRounds = 5,
}) {
  return (
    <div className="cmc-lives-bar">
      <span className="cmc-lives-label">
        Manche {round}/{maxRounds} • Vies :
      </span>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: maxLives }).map((_, idx) => {
          const isAlive = idx < lives
          return (
            <span
              key={idx}
              className={`unicorn-croissant ${!isAlive ? 'is-lost' : ''}`}
              title={isAlive ? 'Croissant de licorne actif' : 'Croissant perdu !'}
            >
              🥐
            </span>
          )
        })}
      </div>
    </div>
  )
}
