import { useState, useEffect, useMemo } from 'react'
import { Sparkles, Eye, X, Check, Award, AlertCircle } from 'lucide-react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import PlayerSetup from '../../components/common/PlayerSetup'
import { CARD_COLORS } from '../../config/games'
import { useLocalPlayers } from '../../hooks/usePlayers'

const COLOR = CARD_COLORS.purple

// Définition des 4 collections d'œuvres connectées aux dossiers dans public/images/galerie/images/
export const GALERIE_THEMES = [
  {
    id: 'Reve',
    title: 'Rêve & Onirique',
    folder: 'Reve',
    totalImages: 60,
    desc: '60 illustrations oniriques, surréalistes et mystiques.',
    badgeColor: '#00a8ff',
    badgeText: '60 cartes',
  },
  {
    id: 'art',
    title: 'Art & Tableaux',
    folder: 'art',
    totalImages: 111,
    desc: "111 peintures inspirantes, classiques et contemporaines.",
    badgeColor: '#8c7ae6',
    badgeText: '111 cartes',
  },
  {
    id: 'nature',
    title: 'Merveilles de la Nature',
    folder: 'nature',
    totalImages: 45,
    desc: '45 toiles immersives de paysages et faune sauvage.',
    badgeColor: '#4cd137',
    badgeText: '45 cartes',
  },
  {
    id: 'memes',
    title: 'Culture Mèmes',
    folder: 'memes',
    totalImages: 107,
    desc: "107 mèmes cultes revisités façon musée.",
    badgeColor: '#f5cd79',
    badgeText: '107 cartes',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GalerieGame() {
  const [players, setPlayers] = useLocalPlayers()
  const [started, setStarted] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState('Reve')

  // Scores des joueurs
  const [scores, setScores] = useState({})
  const [conteurIdx, setConteurIdx] = useState(0)
  const [round, setRound] = useState(1)

  // Réserve de cartes (deck) & Mains de 6 cartes par joueur
  const [deck, setDeck] = useState([])
  const [playerHands, setPlayerHands] = useState({}) // { [playerName]: [card, ...] }

  // Cycle Dixit en 4 phases :
  // 'STORYTELLER' | 'IMPOSTURE' | 'VOTE' | 'RESULTS'
  const [phase, setPhase] = useState('STORYTELLER')
  const [clue, setClue] = useState('')
  const [storytellerCard, setStorytellerCard] = useState(null)

  // Phase d'imposture : sélection par joueur
  const [impostureSubmissions, setImpostureSubmissions] = useState({}) // { [playerName]: card }
  const [currentImposteurIdx, setCurrentImposteurIdx] = useState(0)

  // Phase de vote : cartes en lice mélangées côté serveur/moteur
  const [votingCards, setVotingCards] = useState([]) // [ { card, ownerName, isStoryteller } ]
  const [playerVotes, setPlayerVotes] = useState({}) // { [voterName]: cardId }
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0)

  // Résultats & calcul des points de la manche
  const [roundScores, setRoundScores] = useState({}) // { [playerName]: pointsGagnés }
  const [scoreBreakdown, setScoreBreakdown] = useState({}) // { [playerName]: raison }

  // Modal de zoom grand écran
  const [zoomedCard, setZoomedCard] = useState(null)
  const [selectedHandCard, setSelectedHandCard] = useState(null)

  const activeTheme = useMemo(() => {
    return GALERIE_THEMES.find(t => t.id === selectedThemeId) || GALERIE_THEMES[0]
  }, [selectedThemeId])

  const currentStoryteller = players[conteurIdx % players.length] || 'Conteur'
  const otherPlayers = useMemo(() => players.filter(p => p !== currentStoryteller), [players, currentStoryteller])
  const currentImposteur = otherPlayers[currentImposteurIdx] || 'Joueur'
  const currentVoter = otherPlayers[currentVoterIdx] || 'Joueur'

  useEffect(() => {
    document.title = 'Galerie (Dixit) – Loustic'
  }, [])

  // Construction du deck de 60 à 80 images
  const buildDeck = (theme) => {
    const list = []
    const count = theme.totalImages
    for (let i = 1; i <= count; i++) {
      list.push({
        id: i,
        title: `${theme.title} #${i}`,
        src: `/images/galerie/images/${theme.folder}/img${i}.png`,
      })
    }
    return shuffle(list)
  }

  // Lancement de la partie
  const handleStart = () => {
    if (players.length < 3) return

    const initScores = {}
    players.forEach(p => { initScores[p] = 0 })
    setScores(initScores)

    const fullDeck = buildDeck(activeTheme)
    
    // Distribuer 6 cartes à chaque joueur
    const hands = {}
    let remainingDeck = [...fullDeck]
    players.forEach(p => {
      hands[p] = remainingDeck.slice(0, 6)
      remainingDeck = remainingDeck.slice(6)
    })

    setDeck(remainingDeck)
    setPlayerHands(hands)
    setRound(1)
    setConteurIdx(0)
    resetRoundState()
    setStarted(true)
  }

  const resetRoundState = () => {
    setPhase('STORYTELLER')
    setClue('')
    setStorytellerCard(null)
    setImpostureSubmissions({})
    setCurrentImposteurIdx(0)
    setVotingCards([])
    setPlayerVotes({})
    setCurrentVoterIdx(0)
    setRoundScores({})
    setScoreBreakdown({})
    setSelectedHandCard(null)
    setZoomedCard(null)
  }

  // --- PHASE 1 : Le Conteur valide son œuvre et son indice ---
  const handleStorytellerSubmit = () => {
    if (!selectedHandCard || !clue.trim()) return
    setStorytellerCard(selectedHandCard)
    setSelectedHandCard(null)
    setCurrentImposteurIdx(0)
    setPhase('IMPOSTURE')
  }

  // --- PHASE 2 : Un imposteur sélectionne sa carte secrète ---
  const handleImpostureSubmit = () => {
    if (!selectedHandCard) return
    const updated = {
      ...impostureSubmissions,
      [currentImposteur]: selectedHandCard,
    }
    setImpostureSubmissions(updated)
    setSelectedHandCard(null)

    if (currentImposteurIdx + 1 < otherPlayers.length) {
      setCurrentImposteurIdx(i => i + 1)
    } else {
      // Tout le monde a soumis sa carte -> Préparer le vote
      const boardCards = [
        { card: storytellerCard, ownerName: currentStoryteller, isStoryteller: true },
        ...otherPlayers.map(p => ({
          card: updated[p],
          ownerName: p,
          isStoryteller: false,
        }))
      ]
      // RÈGLE CRITIQUE : Mélange obligatoire pour que la position ne trahisse pas le conteur
      setVotingCards(shuffle(boardCards))
      setPhase('VOTE')
      setCurrentVoterIdx(0)
    }
  }

  // --- PHASE 3 : Un joueur vote pour une carte ---
  const handleVoteCard = (votedCardId) => {
    const updatedVotes = {
      ...playerVotes,
      [currentVoter]: votedCardId,
    }
    setPlayerVotes(updatedVotes)

    if (currentVoterIdx + 1 < otherPlayers.length) {
      setCurrentVoterIdx(i => i + 1)
    } else {
      // Tout le monde a voté -> Calcul des scores officiel Dixit
      resolveDixitScores(updatedVotes)
    }
  }

  // --- PHASE 4 : Algorithme officiel de calcul des scores Dixit ---
  const resolveDixitScores = (finalVotes) => {
    const storytellerCardId = storytellerCard.id
    const totalVoters = otherPlayers.length

    // Compter le nombre de votes reçus par la vraie carte du conteur
    const correctVotes = Object.values(finalVotes).filter(cid => cid === storytellerCardId).length

    const roundPts = {}
    const breakdown = {}
    players.forEach(p => { roundPts[p] = 0; breakdown[p] = '' })

    // CAS 1 : Tout le monde a trouvé OU Personne n'a trouvé
    // (Indice trop évident ou trop nébuleux)
    if (correctVotes === totalVoters || correctVotes === 0) {
      roundPts[currentStoryteller] = 0
      breakdown[currentStoryteller] = correctVotes === totalVoters
        ? '0 pt (Indice trop évident : tout le monde a trouvé)'
        : '0 pt (Indice trop difficile : personne n’a trouvé)'

      otherPlayers.forEach(p => {
        roundPts[p] = 2
        breakdown[p] = '+2 pts (Conteur en échec)'
      })
    }
    // CAS 2 : Une partie des joueurs a trouvé (au moins 1, mais pas tous)
    else {
      roundPts[currentStoryteller] = 3
      breakdown[currentStoryteller] = `+3 pts (Indice subtil : ${correctVotes}/${totalVoters} trouvés)`

      otherPlayers.forEach(p => {
        if (finalVotes[p] === storytellerCardId) {
          roundPts[p] = 3
          breakdown[p] = '+3 pts (Bonne carte trouvée)'
        } else {
          roundPts[p] = 0
          breakdown[p] = '0 pt (Erreur de carte)'
        }
      })
    }

    // BONUS POUR LES IMPOSTEURS :
    // +1 point par vote reçu sur sa propre carte piège (hors conteur)
    otherPlayers.forEach(imposteur => {
      const impCard = impostureSubmissions[imposteur]
      if (impCard) {
        const votesReceived = Object.values(finalVotes).filter(cid => cid === impCard.id).length
        if (votesReceived > 0) {
          roundPts[imposteur] += votesReceived
          breakdown[imposteur] += ` | +${votesReceived} pt(s) piège`
        }
      }
    })

    // Mise à jour des scores globaux
    setScores(prev => {
      const next = { ...prev }
      players.forEach(p => {
        next[p] = (next[p] || 0) + (roundPts[p] || 0)
      })
      return next
    })

    setRoundScores(roundPts)
    setScoreBreakdown(breakdown)

    // Défausse des cartes jouées et pioche pour compléter à 6 cartes
    setPlayerHands(prevHands => {
      const updatedHands = { ...prevHands }
      let currentDeck = [...deck]

      // Conteur
      updatedHands[currentStoryteller] = updatedHands[currentStoryteller].filter(c => c.id !== storytellerCard.id)
      if (currentDeck.length > 0) {
        updatedHands[currentStoryteller].push(currentDeck[0])
        currentDeck = currentDeck.slice(1)
      }

      // Imposteurs
      otherPlayers.forEach(p => {
        const played = impostureSubmissions[p]
        if (played) {
          updatedHands[p] = updatedHands[p].filter(c => c.id !== played.id)
          if (currentDeck.length > 0) {
            updatedHands[p].push(currentDeck[0])
            currentDeck = currentDeck.slice(1)
          }
        }
      })

      setDeck(currentDeck)
      return updatedHands
    })

    setPhase('RESULTS')
  }

  // Passer à la manche suivante
  const nextRound = () => {
    setRound(r => r + 1)
    setConteurIdx(i => (i + 1) % players.length)
    resetRoundState()
  }

  // ----------------------------------------------------
  // ÉCRAN 1 : LOBBY & SÉLECTION DU THÈME
  // ----------------------------------------------------
  if (!started) {
    return (
      <GameLayout
        gameKey="galerie"
        title="Galerie (Dixit)"
        color={COLOR}
        footer={
          <CartoonButton
            id="start-galerie-btn"
            variant="success"
            disabled={players.length < 3}
            onClick={handleStart}
          >
            Lancer l'exposition ({players.length >= 3 ? 'Min. 3 joueurs validé' : '3 joueurs requis'})
          </CartoonButton>
        }
      >
        <div className="w-full flex flex-col gap-4 max-w-lg mx-auto">
          {/* Sélection du Thème d'images */}
          <div className="p-3.5 bg-purple-50 rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513]">
            <h3 className="font-black text-sm uppercase text-neutral-900 mb-1">
              Collection de peintures
            </h3>
            <p className="text-xs font-bold text-neutral-600 mb-3">
              Chaque joueur recevra 6 cartes secrètes issues de la collection :
            </p>

            <div className="grid grid-cols-2 gap-2">
              {GALERIE_THEMES.map(t => {
                const isSelected = selectedThemeId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-yellow-300 border-neutral-900 shadow-[2px_2px_0_#161513] scale-[0.98]'
                        : 'bg-white border-neutral-900 shadow-[1px_1px_0_#161513] hover:bg-neutral-50'
                    }`}
                  >
                    <strong className="text-xs font-black block text-neutral-900">{t.title}</strong>
                    <span className="text-[10px] font-bold text-neutral-500 block mt-0.5">
                      {t.badgeText}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Joueurs (Min 3 pour Dixit) */}
          <PlayerSetup players={players} onChange={setPlayers} />
        </div>
      </GameLayout>
    )
  }

  // Cartes en main pour le joueur courant de la phase
  const activeHandPlayer = phase === 'STORYTELLER' ? currentStoryteller : currentImposteur
  const currentHand = playerHands[activeHandPlayer] || []

  // ----------------------------------------------------
  // ÉCRAN DE JEU (4 PHASES)
  // ----------------------------------------------------
  return (
    <GameLayout
      gameKey="galerie"
      title={`Galerie (Manche ${round})`}
      color={COLOR}
      footer={
        phase === 'STORYTELLER' ? (
          <CartoonButton
            id="submit-storyteller-btn"
            disabled={!selectedHandCard || !clue.trim()}
            onClick={handleStorytellerSubmit}
          >
            Valider l'indice et l'œuvre
          </CartoonButton>
        ) : phase === 'IMPOSTURE' ? (
          <CartoonButton
            id="submit-imposture-btn"
            disabled={!selectedHandCard}
            onClick={handleImpostureSubmit}
          >
            Poser ma carte piège
          </CartoonButton>
        ) : phase === 'RESULTS' ? (
          <CartoonButton id="next-galerie-btn" variant="success" onClick={nextRound}>
            Manche suivante
          </CartoonButton>
        ) : null
      }
    >
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 pb-6">
        {/* Bandeau supérieur de statut & Scores */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl border-3 border-neutral-900 shadow-[3px_3px_0_#161513] gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
              Manche {round}
            </span>
            <span className="text-xs font-black">
              Conteur : <strong className="text-yellow-400">{currentStoryteller}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {players.map(p => (
              <span
                key={p}
                className="text-[11px] font-black bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded-lg border border-neutral-700"
              >
                {p}: {scores[p] || 0} pt{scores[p] > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* PHASE 1 : LE CONTEUR */}
        {phase === 'STORYTELLER' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                Phase 1 : Le Conteur
              </span>
              <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                {currentStoryteller}, donne ton énigme
              </h2>
              <p className="text-xs font-bold text-neutral-600">
                Choisis une œuvre de ta main (clique pour zoomer), puis écris un indice subtil :
              </p>
            </div>

            {/* Saisie de l'indice */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                placeholder="Une phrase, un mot, un titre..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-900 font-bold text-sm uppercase bg-amber-50 focus:outline-none"
              />
            </div>

            {/* Carrousel horizontal fluide de la main de 6 cartes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span>Ta main secrète ({currentHand.length} cartes) :</span>
                {selectedHandCard && (
                  <span className="text-purple-700 font-bold text-[11px]">
                    Sélectionnée : {selectedHandCard.title}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 overflow-x-auto snap-x py-2 px-1 scrollbar-none">
                {currentHand.map((card) => {
                  const isSelected = selectedHandCard?.id === card.id
                  return (
                    <div
                      key={card.id}
                      className={`shrink-0 w-28 sm:w-32 aspect-3/4 rounded-xl border-3 overflow-hidden relative cursor-pointer snap-start transition-transform ${
                        isSelected
                          ? 'border-purple-600 ring-3 ring-purple-400 scale-105 shadow-[0_4px_0_#8c7ae6]'
                          : 'border-neutral-900 shadow-[2px_2px_0_#161513] hover:scale-102'
                      }`}
                      onClick={() => setSelectedHandCard(card)}
                    >
                      <img
                        src={card.src}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setZoomedCard(card)
                        }}
                        className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-black/80"
                        title="Agrandir l'œuvre"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* PHASE 2 : L'IMPOSTURE */}
        {phase === 'IMPOSTURE' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                Phase 2 : L'Imposture
              </span>
              <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                Au tour de {currentImposteur}
              </h2>

              {/* Rappel de l'indice du conteur */}
              <div className="my-2 p-2.5 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-sm uppercase">
                Indice du conteur : "{clue}"
              </div>

              <p className="text-xs font-bold text-neutral-600">
                Choisis secrètement l'œuvre de ta main qui correspond le plus à cet indice pour tromper les autres :
              </p>
            </div>

            {/* Carrousel de la main de l'imposteur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span>Ta main secrète ({currentHand.length} cartes) :</span>
                {selectedHandCard && (
                  <span className="text-emerald-700 font-bold text-[11px]">
                    Sélectionnée : {selectedHandCard.title}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 overflow-x-auto snap-x py-2 px-1 scrollbar-none">
                {currentHand.map((card) => {
                  const isSelected = selectedHandCard?.id === card.id
                  return (
                    <div
                      key={card.id}
                      className={`shrink-0 w-28 sm:w-32 aspect-3/4 rounded-xl border-3 overflow-hidden relative cursor-pointer snap-start transition-transform ${
                        isSelected
                          ? 'border-emerald-600 ring-3 ring-emerald-400 scale-105 shadow-[0_4px_0_#064e3b]'
                          : 'border-neutral-900 shadow-[2px_2px_0_#161513] hover:scale-102'
                      }`}
                      onClick={() => setSelectedHandCard(card)}
                    >
                      <img
                        src={card.src}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setZoomedCard(card)
                        }}
                        className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-black/80"
                        title="Agrandir l'œuvre"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* PHASE 3 : LE VOTE (BLIND VOTE) */}
        {phase === 'VOTE' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                Phase 3 : Vote Secret
              </span>
              <h2 className="text-lg font-black text-neutral-900 mt-0.5">
                Vote de : <span className="text-blue-600">{currentVoter}</span>
              </h2>

              <div className="my-2 p-2.5 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-sm uppercase">
                Indice : "{clue}"
              </div>

              <p className="text-xs font-bold text-neutral-600">
                Retrouve la véritable carte du conteur parmi les œuvres exposées :
              </p>
            </div>

            {/* Grille 2 colonnes × 3 lignes centrée des cartes en lice */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
              {votingCards.map((item) => {
                const card = item.card
                // Interdiction stricte : on ne peut pas voter pour sa propre carte
                const isMyOwnCard = item.ownerName === currentVoter
                return (
                  <div
                    key={card.id}
                    className={`aspect-3/4 rounded-2xl border-3 overflow-hidden relative flex flex-col justify-end p-2 transition-transform ${
                      isMyOwnCard
                        ? 'border-neutral-400 bg-neutral-200 opacity-60 cursor-not-allowed'
                        : 'border-neutral-900 shadow-[3px_3px_0_#161513] hover:scale-102 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isMyOwnCard) handleVoteCard(card.id)
                    }}
                  >
                    <img
                      src={card.src}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                    />

                    {/* Badge de zoom */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setZoomedCard(card)
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-md hover:bg-black/80"
                      title="Agrandir l'œuvre"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {isMyOwnCard ? (
                      <div className="bg-neutral-900/90 text-white text-[10px] font-bold p-1 rounded-lg text-center leading-tight">
                        Votre carte (vote interdit)
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full py-1.5 bg-blue-600 text-white font-black text-xs uppercase rounded-xl border-2 border-neutral-900 shadow-[1px_1px_0_#161513] active:translate-y-0.5"
                      >
                        Voter pour cette œuvre
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* PHASE 4 : RÉSULTATS & CALCUL DES POINTS */}
        {phase === 'RESULTS' && (
          <section className="p-4 bg-white rounded-3xl border-3 border-neutral-900 shadow-[4px_4px_0_#161513] flex flex-col gap-4">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Phase 4 : Révélation & Verdict
              </span>
              <h2 className="text-xl font-black text-neutral-900 mt-0.5">
                Révélation des œuvres
              </h2>
              <div className="my-1.5 p-2 bg-yellow-300 rounded-xl border-2 border-neutral-900 inline-block font-black text-xs uppercase">
                Indice : "{clue}"
              </div>
            </div>

            {/* Exposition des cartes avec révélation du propriétaire et des votes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {votingCards.map((item) => {
                const card = item.card
                const isStoryteller = item.isStoryteller
                const voters = otherPlayers.filter(p => playerVotes[p] === card.id)

                return (
                  <div
                    key={card.id}
                    className={`aspect-3/4 rounded-2xl border-3 overflow-hidden relative flex flex-col justify-between p-2 shadow-[3px_3px_0_#161513] ${
                      isStoryteller
                        ? 'border-amber-500 ring-4 ring-yellow-400'
                        : 'border-neutral-900'
                    }`}
                  >
                    <img
                      src={card.src}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                    />

                    {/* Propriétaire en haut */}
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          isStoryteller
                            ? 'bg-yellow-400 text-neutral-950 border-neutral-900'
                            : 'bg-neutral-900/80 text-white border-white/20'
                        }`}
                      >
                        {isStoryteller ? `Conteur (${item.ownerName})` : item.ownerName}
                      </span>

                      <button
                        type="button"
                        onClick={() => setZoomedCard(card)}
                        className="p-1 bg-black/60 text-white rounded-md"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Votes reçus en bas */}
                    <div className="bg-black/75 text-white p-1.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold block text-neutral-300">
                        {voters.length} vote{voters.length > 1 ? 's' : ''} :
                      </span>
                      <div className="text-[11px] font-black text-yellow-300 truncate">
                        {voters.length > 0 ? voters.join(', ') : 'Aucun'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tableau récapitulatif des points gagnés */}
            <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-900 space-y-1.5">
              <h4 className="font-black text-xs uppercase text-neutral-700">
                Points de la manche :
              </h4>
              {players.map(p => (
                <div key={p} className="flex justify-between items-center text-xs border-b border-neutral-200 pb-1">
                  <div>
                    <strong className="text-neutral-900">{p}</strong>
                    <span className="text-[10px] text-neutral-500 ml-1.5">
                      {scoreBreakdown[p]}
                    </span>
                  </div>
                  <span className="font-black text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    +{roundScores[p] || 0} pts
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MODAL ZOOM PLEIN ÉCRAN */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] bg-neutral-900 rounded-3xl border-4 border-yellow-400 overflow-hidden flex flex-col items-center p-3 shadow-[0_8px_0_#161513]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedCard(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={zoomedCard.src}
              alt={zoomedCard.title}
              className="max-h-[70vh] w-auto object-contain rounded-xl my-2 border border-neutral-700"
            />

            <div className="w-full flex justify-between items-center px-2 pt-2">
              <span className="text-white font-black text-sm">{zoomedCard.title}</span>
              {(phase === 'STORYTELLER' || phase === 'IMPOSTURE') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHandCard(zoomedCard)
                    setZoomedCard(null)
                  }}
                  className="px-3 py-1.5 bg-yellow-400 text-neutral-950 font-black text-xs uppercase rounded-xl border-2 border-neutral-900"
                >
                  Choisir cette œuvre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GameLayout>
  )
}
