import { useState, useEffect } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CardStage from '../../components/common/CardStage'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'

const COLOR = CARD_COLORS.yellow

const PROMPTS = [
  "Raconte la pire excuse que tu aies inventée pour annuler une soirée au dernier moment.",
  "Avoue la chose la plus honteuse que tu aies cachée à tes parents pendant des années.",
  "Quel est le secret d'un de tes amis autour de la table que tu n'aurais jamais dû apprendre ?",
  "Quelle est la plus grosse gaffe que tu aies commise lors d'un premier date ?",
  "Si tu devais donner le défaut le plus insupportable de la personne à ta gauche, ce serait quoi ?",
  "Quelle est la pire chose que tu aies faite par pure jalousie ?",
  "Avoue un mensonge que tu maintiens encore aujourd'hui auprès de quelqu'un.",
  "Quelle est la dernière fois où tu t'es senti affreusement coupable et pourquoi ?",
]

export default function DesoleGame() {
  const [idx, setIdx] = useState(0)
  const [votes, setVotes] = useState({ pardonne: 0, coupable: 0, shot: 0 })

  useEffect(() => {
    document.title = 'Désolé 💌 – Loustic'
  }, [])

  const nextCard = () => {
    setIdx(i => (i + 1) % PROMPTS.length)
    setVotes({ pardonne: 0, coupable: 0, shot: 0 })
  }

  const castVote = type => {
    setVotes(v => ({ ...v, [type]: v[type] + 1 }))
  }

  const footer = (
    <CartoonButton id="next-desole-btn" onClick={nextCard}>
      Confession suivante
    </CartoonButton>
  )

  return (
    <GameLayout gameKey="desole" title="Désolé" color={COLOR} footer={footer}>
      <CardStage cardKey={`${idx}`} tag="Confession & Tribunal">
        <div className="prompt-envelope">
          <p className="word-display" style={{ fontSize: 'clamp(1.15rem, 3.8vw, 1.6rem)' }}>
            {PROMPTS[idx]}
          </p>
        </div>

        <p className="hint">
          Le joueur ciblé raconte son anecdote. Le tribunal des potes vote son verdict :
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '100%', marginTop: '12px' }}>
          <button
            id="vote-pardon-btn"
            type="button"
            style={{
              padding: '10px 4px',
              borderRadius: '12px',
              border: '2.5px solid #161513',
              background: '#2ed573',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #161513',
            }}
            onClick={() => castVote('pardonne')}
          >
            😇 Pardonné ({votes.pardonne})
          </button>
          <button
            id="vote-coupable-btn"
            type="button"
            style={{
              padding: '10px 4px',
              borderRadius: '12px',
              border: '2.5px solid #161513',
              background: '#ff4757',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #161513',
            }}
            onClick={() => castVote('coupable')}
          >
            🚨 Coupable ({votes.coupable})
          </button>
          <button
            id="vote-shot-btn"
            type="button"
            style={{
              padding: '10px 4px',
              borderRadius: '12px',
              border: '2.5px solid #161513',
              background: '#e17055',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #161513',
            }}
            onClick={() => castVote('shot')}
          >
            🥃 1 Shot ({votes.shot})
          </button>
        </div>

        <p className="deck-counter" style={{ marginTop: '14px' }}>
          Carte {idx + 1} / {PROMPTS.length}
        </p>
      </CardStage>
    </GameLayout>
  )
}
