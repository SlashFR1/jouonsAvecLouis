import { useState, useEffect, useMemo } from 'react'
import GameLayout from '../../components/layout/GameLayout'
import CartoonButton from '../../components/common/CartoonButton'
import { CARD_COLORS } from '../../config/games'
import parasiteData from '../../data/parasite.json'

const COLOR = CARD_COLORS.blue || '#0284c7'

export default function ParasiteGame() {
  const rolesMap = useMemo(() => parasiteData.roles || {}, [])

  // 1. Joueurs
  const [players, setPlayers] = useState(['Alex', 'Sam', 'Clara', 'Lucas', 'Maxime'])
  const [newPlayer, setNewPlayer] = useState('')

  // 2. Composition du Deck (comme dans un Loup-Garou)
  const [deckConfig, setDeckConfig] = useState({
    aliens: 1,
    colon: 2,
    Scientifique: true,
    Medecin: true,
    Ingenieur: false,
    Officier: false,
    Garde: false,
    alpha: false,
    Android: false,
  })

  // 3. État du jeu : 'setup' | 'reveal' | 'night_intro' | 'night_actions' | 'day_star' | 'day_debate' | 'vote' | 'ejection' | 'game_over'
  const [phase, setPhase] = useState('setup')
  const [roundNumber, setRoundNumber] = useState(1)

  // Distribution des rôles
  const [playerList, setPlayerList] = useState([]) // [{ id, name, roleKey, roleName, camp, desc, alive: true, lover: false, protected: false }]
  const [currentRevealIdx, setCurrentRevealIdx] = useState(0)
  const [isRoleCardRevealed, setIsRoleCardRevealed] = useState(false)

  // Actions de Nuit
  const [nightStep, setNightStep] = useState(0)
  const [nightKillTarget, setNightKillTarget] = useState(null)
  const [nightProtectedTarget, setNightProtectedTarget] = useState(null)
  const [nightScannedPlayer, setNightScannedPlayer] = useState(null)
  const [medecinHealed, setMedecinHealed] = useState(false)
  const [medecinPoisonedTarget, setMedecinPoisonedTarget] = useState(null)
  const [lovers, setLovers] = useState([]) // [id1, id2]

  // Bilan du matin
  const [morningCasualties, setMorningCasualties] = useState([])

  // Vote
  const [votes, setVotes] = useState({}) // { voterId: targetId }
  const [ejectedPlayer, setEjectedPlayer] = useState(null)
  const [winnerCamp, setWinnerCamp] = useState(null)

  useEffect(() => {
    document.title = 'Parasite 🦠 – Loustic'
  }, [])

  // Calcul du total des cartes dans le deck
  const totalDeckCards = useMemo(() => {
    let count = (deckConfig.aliens || 0) + (deckConfig.colon || 0)
    const specials = ['Scientifique', 'Medecin', 'Ingenieur', 'Officier', 'Garde', 'alpha', 'Android']
    specials.forEach(k => {
      if (deckConfig[k]) count++
    })
    return count
  }, [deckConfig])

  // Ajustement automatique du deck pour égaler le nombre de joueurs
  const autoBalanceDeck = () => {
    const playerCount = players.length
    const aliensCount = Math.max(1, Math.floor(playerCount / 4))
    const specialCount = Math.min(2, playerCount - aliensCount - 1)
    const colonsCount = playerCount - aliensCount - specialCount

    setDeckConfig({
      aliens: aliensCount,
      colon: Math.max(1, colonsCount),
      Scientifique: true,
      Medecin: specialCount >= 2,
      Ingenieur: false,
      Officier: false,
      Garde: false,
      alpha: false,
      Android: false,
    })
  }

  const addPlayer = () => {
    if (!newPlayer.trim()) return
    const updated = [...players, newPlayer.trim()]
    setPlayers(updated)
    setNewPlayer('')
    // ajuster les colons pour suivre
    setDeckConfig(prev => ({ ...prev, colon: Math.max(1, updated.length - totalDeckCards + prev.colon) }))
  }

  const removePlayer = (idx) => {
    if (players.length <= 3) return
    const updated = players.filter((_, i) => i !== idx)
    setPlayers(updated)
    setDeckConfig(prev => ({ ...prev, colon: Math.max(1, prev.colon - 1) }))
  }

  // Lancement de la partie et distribution
  const handleStartGame = () => {
    if (players.length !== totalDeckCards) {
      alert(`Le nombre de cartes dans le deck (${totalDeckCards}) doit être exactement égal au nombre de joueurs (${players.length}) !`)
      return
    }

    // Créer la réserve de rôles
    const rolePool = []
    for (let i = 0; i < deckConfig.aliens; i++) rolePool.push('aliens')
    for (let i = 0; i < deckConfig.colon; i++) rolePool.push('colon')
    const specials = ['Scientifique', 'Medecin', 'Ingenieur', 'Officier', 'Garde', 'alpha', 'Android']
    specials.forEach(k => {
      if (deckConfig[k]) rolePool.push(k)
    })

    // Mélanger les rôles
    const shuffledRoles = [...rolePool].sort(() => Math.random() - 0.5)

    const assignedPlayers = players.map((name, idx) => {
      const roleKey = shuffledRoles[idx]
      const info = rolesMap[roleKey] || { name: roleKey, camp: 'colonie', description: 'Membre de la station.' }
      return {
        id: `p_${idx}`,
        name,
        roleKey,
        roleName: info.name,
        camp: info.camp,
        desc: info.description,
        alive: true,
      }
    })

    setPlayerList(assignedPlayers)
    setCurrentRevealIdx(0)
    setIsRoleCardRevealed(false)
    setRoundNumber(1)
    setNightStep(0)
    setLovers([])
    setPhase('reveal')
  }

  // Découverte secrète de son rôle
  const handleNextReveal = () => {
    setIsRoleCardRevealed(false)
    if (currentRevealIdx + 1 < playerList.length) {
      setCurrentRevealIdx(i => i + 1)
    } else {
      // Tous les joueurs ont découvert leur rôle -> Lancement de la nuit !
      setPhase('night_intro')
    }
  }

  // Démarrer les étapes de la nuit
  const startNightActions = () => {
    setNightStep(0)
    setNightKillTarget(null)
    setNightProtectedTarget(null)
    setNightScannedPlayer(null)
    setMedecinHealed(false)
    setMedecinPoisonedTarget(null)
    setPhase('night_actions')
  }

  // Étapes de nuit ordonnées :
  // 1. Officier (Nuit 1 seulement)
  // 2. Garde (s'il existe et est en vie)
  // 3. Aliens (infiltrés)
  // 4. Scientifique (s'il existe et est en vie)
  // 5. Médecin (s'il existe et est en vie)
  const activeNightRoles = useMemo(() => {
    const list = []
    const hasAliveRole = (roleKey) => playerList.some(p => p.alive && p.roleKey === roleKey)

    if (roundNumber === 1 && deckConfig.Officier && hasAliveRole('Officier')) list.push('Officier')
    if (deckConfig.Garde && hasAliveRole('Garde')) list.push('Garde')
    list.push('aliens') // Toujours les aliens
    if (deckConfig.Scientifique && hasAliveRole('Scientifique')) list.push('Scientifique')
    if (deckConfig.Medecin && hasAliveRole('Medecin')) list.push('Medecin')
    return list
  }, [roundNumber, deckConfig, playerList])

  const currentNightRoleKey = activeNightRoles[nightStep]

  const handleNextNightStep = () => {
    if (nightStep + 1 < activeNightRoles.length) {
      setNightStep(s => s + 1)
    } else {
      // Fin de la nuit -> Résolution & Le retour de l'étoile !
      resolveNight()
    }
  }

  // Résolution des événements de la nuit
  const resolveNight = () => {
    const dead = []

    // Cible des aliens tuée sauf si protégée par le garde ou soignée par le médecin
    if (nightKillTarget && nightKillTarget !== nightProtectedTarget && !medecinHealed) {
      dead.push(nightKillTarget)
    }

    // Poison du médecin
    if (medecinPoisonedTarget && !dead.includes(medecinPoisonedTarget)) {
      dead.push(medecinPoisonedTarget)
    }

    // Si l'un des amoureux meurt, l'autre meurt aussi
    if (lovers.length === 2) {
      if (dead.includes(lovers[0]) && !dead.includes(lovers[1])) dead.push(lovers[1])
      if (dead.includes(lovers[1]) && !dead.includes(lovers[0])) dead.push(lovers[0])
    }

    // Mettre à jour les joueurs en vie
    const updatedPlayers = playerList.map(p => ({
      ...p,
      alive: p.alive && !dead.includes(p.id)
    }))
    setPlayerList(updatedPlayers)
    setMorningCasualties(dead)

    // Vérifier les conditions de victoire
    const aliveAliens = updatedPlayers.filter(p => p.alive && (p.roleKey === 'aliens' || p.roleKey === 'alpha'))
    const aliveColons = updatedPlayers.filter(p => p.alive && p.roleKey !== 'aliens' && p.roleKey !== 'alpha')

    if (aliveAliens.length === 0) {
      setWinnerCamp('Colonie')
      setPhase('game_over')
      return
    }
    if (aliveAliens.length >= aliveColons.length) {
      setWinnerCamp('Parasites')
      setPhase('game_over')
      return
    }

    setPhase('day_star')
  }

  // Validation du vote de jour
  const handleResolveVote = () => {
    // Compter les votes
    const counts = {}
    Object.values(votes).forEach(targetId => {
      counts[targetId] = (counts[targetId] || 0) + 1
    })

    let maxVotes = 0
    let eliminatedId = null
    Object.entries(counts).forEach(([targetId, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedId = targetId
      }
    })

    if (eliminatedId) {
      const eliminated = playerList.find(p => p.id === eliminatedId)
      setEjectedPlayer(eliminated)

      const updated = playerList.map(p => p.id === eliminatedId ? { ...p, alive: false } : p)
      setPlayerList(updated)

      // Vérifier victoire
      const aliveAliens = updated.filter(p => p.alive && (p.roleKey === 'aliens' || p.roleKey === 'alpha'))
      const aliveColons = updated.filter(p => p.alive && p.roleKey !== 'aliens' && p.roleKey !== 'alpha')

      if (aliveAliens.length === 0) {
        setWinnerCamp('Colonie')
        setPhase('game_over')
        return
      }
      if (aliveAliens.length >= aliveColons.length) {
        setWinnerCamp('Parasites')
        setPhase('game_over')
        return
      }
    } else {
      setEjectedPlayer(null)
    }

    setPhase('ejection')
  }

  // Passer à la nuit suivante
  const handleNextDayRound = () => {
    setRoundNumber(r => r + 1)
    setVotes({})
    setPhase('night_intro')
  }

  const restartAll = () => {
    setPhase('setup')
    setWinnerCamp(null)
    setEjectedPlayer(null)
  }

  return (
    <GameLayout
      gameKey="parasite"
      title="Parasite 🦠"
      color={phase.startsWith('night') ? '#090d16' : COLOR}
    >
      <section style={{ width: '100%', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. ÉCRAN SETUP : CRÉATION DU DECK & JOUEURS */}
        {phase === 'setup' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 14px', borderRadius: '999px', fontWeight: 900, fontSize: '0.8rem', border: '2px solid #0284c7' }}>
                🚀 LOBBY & COMPOSITION DU DECK
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '1.75rem', fontWeight: 900 }}>
                Station Orbitale Parasite
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>
                Configurez les membres de la station et composez votre deck de rôles secrets.
              </p>
            </div>

            {/* LISTE DES JOUEURS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                  Astronautes ({players.length}) :
                </span>
                <button
                  type="button"
                  onClick={autoBalanceDeck}
                  style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  ⚡ Équilibrer le deck
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {players.map((p, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🧑‍🚀 {p}
                    <button
                      type="button"
                      onClick={() => removePlayer(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 900, cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="Ajouter un astronaute..."
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '2.5px solid #1e293b', fontWeight: 700 }}
                />
                <button
                  type="button"
                  onClick={addPlayer}
                  style={{ padding: '0 16px', borderRadius: '12px', border: '2.5px solid #1e293b', background: '#0284c7', color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* CRÉATION DU DECK DE RÔLES (PARASITE.JSON) */}
            <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>🃏 Composition du Deck :</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  background: totalDeckCards === players.length ? '#dcfce7' : '#fee2e2',
                  color: totalDeckCards === players.length ? '#166534' : '#991b1b',
                  border: `2px solid ${totalDeckCards === players.length ? '#22c55e' : '#ef4444'}`
                }}>
                  {totalDeckCards} / {players.length} rôles
                </span>
              </div>

              {/* Rôles de base : Aliens et Colons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '14px', border: '2px solid #ef4444', background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#991b1b' }}>🦠 Aliens</strong>
                    <small style={{ color: '#64748b' }}>Infiltrés</small>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button type="button" onClick={() => setDeckConfig(d => ({ ...d, aliens: Math.max(1, d.aliens - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#fff', fontWeight: 900 }}>-</button>
                    <span style={{ fontWeight: 900 }}>{deckConfig.aliens}</span>
                    <button type="button" onClick={() => setDeckConfig(d => ({ ...d, aliens: d.aliens + 1 }))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#fff', fontWeight: 900 }}>+</button>
                  </div>
                </div>

                <div style={{ padding: '10px', borderRadius: '14px', border: '2px solid #0284c7', background: '#f0f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0369a1' }}>🧑‍🚀 Colons</strong>
                    <small style={{ color: '#64748b' }}>Innocents</small>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button type="button" onClick={() => setDeckConfig(d => ({ ...d, colon: Math.max(0, d.colon - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#fff', fontWeight: 900 }}>-</button>
                    <span style={{ fontWeight: 900 }}>{deckConfig.colon}</span>
                    <button type="button" onClick={() => setDeckConfig(d => ({ ...d, colon: d.colon + 1 }))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#fff', fontWeight: 900 }}>+</button>
                  </div>
                </div>
              </div>

              {/* Rôles Spéciaux issus de parasite.json */}
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>
                Rôles Spéciaux de la Station :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'Scientifique', name: '🔬 Scientifique', desc: 'Sonde un joueur chaque nuit' },
                  { key: 'Medecin', name: '💉 Médecin', desc: '1 sérum de vie + 1 poison' },
                  { key: 'Ingenieur', name: '🛠️ Ingénieur', desc: 'Tir mortel si éliminé' },
                  { key: 'Officier', name: '💘 Officier', desc: 'Lie 2 amoureux éternels' },
                  { key: 'Garde', name: '🛡️ Garde', desc: 'Protège un astronaute la nuit' },
                  { key: 'alpha', name: '🐺 Alpha', desc: 'Alien solitaire renégat' },
                  { key: 'Android', name: '🤖 Android', desc: 'Copie un rôle secret' },
                ].map(item => {
                  const isChecked = Boolean(deckConfig[item.key])
                  return (
                    <label
                      key={item.key}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: `2px solid ${isChecked ? '#1e293b' : '#e2e8f0'}`,
                        background: isChecked ? '#f8fafc' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.85rem' }}>{item.name}</strong>
                        <small style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.desc}</small>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setDeckConfig(d => ({ ...d, [item.key]: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </label>
                  )
                })}
              </div>
            </div>

            <CartoonButton
              id="start-parasite-btn"
              disabled={players.length < 3 || totalDeckCards !== players.length}
              onClick={handleStartGame}
              variant="primary"
            >
              🚀 Lancer la partie ({players.length} joueurs)
            </CartoonButton>
          </div>
        )}

        {/* 2. DÉCOUVERTE SECRÈTE DE SA CAPACITÉ */}
        {phase === 'reveal' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '24px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 14px', borderRadius: '999px', fontWeight: 900, fontSize: '0.85rem', border: '2px solid #f59e0b' }}>
              🤫 ATTRIBUTION DES RÔLES
            </span>

            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
              Passez le téléphone à : <span style={{ color: '#0284c7' }}>{playerList[currentRevealIdx]?.name}</span>
            </h3>

            {!isRoleCardRevealed ? (
              <div style={{
                width: '100%',
                padding: '40px 20px',
                borderRadius: '20px',
                border: '3px dashed #94a3b8',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              onClick={() => setIsRoleCardRevealed(true)}
              >
                <span style={{ fontSize: '3rem' }}>🔒</span>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#1e293b' }}>
                  Touche l'écran pour découvrir ta capacité secrète
                </p>
                <small style={{ color: '#64748b' }}>Assure-toi que personne d'autre ne regarde l'écran !</small>
              </div>
            ) : (
              /* CARTE DU RÔLE RÉVÉLÉE */
              <div style={{
                width: '100%',
                padding: '24px 18px',
                borderRadius: '20px',
                border: `3.5px solid ${playerList[currentRevealIdx]?.camp === 'aliens' ? '#dc2626' : '#0284c7'}`,
                background: playerList[currentRevealIdx]?.camp === 'aliens' ? '#fef2f2' : '#f0f9ff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 6px 0 rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '3rem' }}>
                  {playerList[currentRevealIdx]?.camp === 'aliens' ? '🦠' : '🧑‍🚀'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: playerList[currentRevealIdx]?.camp === 'aliens' ? '#991b1b' : '#0369a1' }}>
                  {playerList[currentRevealIdx]?.roleName}
                </h2>
                <span style={{
                  alignSelf: 'center',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  background: playerList[currentRevealIdx]?.camp === 'aliens' ? '#dc2626' : '#0284c7',
                  color: '#fff'
                }}>
                  Camp : {playerList[currentRevealIdx]?.camp === 'aliens' ? 'Infiltrés (Aliens)' : 'Colonie (Humains)'}
                </span>
                <p style={{ margin: 0, fontWeight: 800, color: '#334155', fontSize: '0.95rem', lineHeight: 1.4 }}>
                  {playerList[currentRevealIdx]?.desc}
                </p>
              </div>
            )}

            {isRoleCardRevealed && (
              <CartoonButton
                id="next-player-reveal-btn"
                variant="primary"
                onClick={handleNextReveal}
              >
                🔒 Cacher et passer au joueur suivant ({currentRevealIdx + 1}/{playerList.length}) ➡️
              </CartoonButton>
            )}
          </div>
        )}

        {/* 3. LE TOUR DANS LE NOIR (NUIT) */}
        {phase === 'night_intro' && (
          <div style={{
            background: '#090d16',
            color: '#f8fafc',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #000',
            padding: '32px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px'
          }}>
            <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.2))' }}>🌌🌙</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#93c5fd' }}>
              La Nuit Tombe sur la Station
            </h2>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              L'étoile s'est éclipsée... La station est plongée dans le noir absolu.
              Tous les astronautes ferment les yeux et s'endorment.
            </p>
            <CartoonButton
              id="start-night-actions-btn"
              onClick={startNightActions}
              variant="secondary"
            >
              🌙 Commencer le tour dans le noir
            </CartoonButton>
          </div>
        )}

        {/* ACTIONS DE NUIT ÉTAPE PAR ÉTAPE */}
        {phase === 'night_actions' && (
          <div style={{
            background: '#090d16',
            color: '#f8fafc',
            borderRadius: '24px',
            border: '3.5px solid #334155',
            boxShadow: '0 8px 0 #000',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontWeight: 900, fontSize: '0.85rem' }}>
                🌙 NUIT {roundNumber} (Étape {nightStep + 1}/{activeNightRoles.length})
              </span>
              <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                Tour dans le noir
              </span>
            </div>

            {/* ÉTAPE ACTUELLE DE LA NUIT */}
            {currentNightRoleKey === 'Officier' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#f472b6', fontSize: '1.25rem', fontWeight: 900 }}>
                  💘 L'Officier se réveille dans l'ombre...
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                  Désignez deux astronautes qui formeront un lien éternel. Si l'un meurt, l'autre succombera immédiatement !
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {playerList.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (lovers.includes(p.id)) setLovers(l => l.filter(x => x !== p.id))
                        else if (lovers.length < 2) setLovers(l => [...l, p.id])
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: `2px solid ${lovers.includes(p.id) ? '#ec4899' : '#334155'}`,
                        background: lovers.includes(p.id) ? '#831843' : '#1e293b',
                        color: '#fff',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {lovers.includes(p.id) ? '💘 ' : ''}{p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentNightRoleKey === 'Garde' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.25rem', fontWeight: 900 }}>
                  🛡️ Le Garde veille sur la station...
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                  Choisissez un membre d'équipage à protéger contre l'attaque alien de cette nuit :
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {playerList.filter(p => p.alive).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNightProtectedTarget(p.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: `2px solid ${nightProtectedTarget === p.id ? '#0284c7' : '#334155'}`,
                        background: nightProtectedTarget === p.id ? '#0369a1' : '#1e293b',
                        color: '#fff',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      🛡️ {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentNightRoleKey === 'aliens' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#ef4444', fontSize: '1.25rem', fontWeight: 900 }}>
                  🦠 Les Aliens se reconnaissent dans le noir...
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                  Les parasites choisissent secrètement leur victime à éliminer :
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {playerList.filter(p => p.alive && p.roleKey !== 'aliens').map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNightKillTarget(p.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: `2px solid ${nightKillTarget === p.id ? '#dc2626' : '#334155'}`,
                        background: nightKillTarget === p.id ? '#991b1b' : '#1e293b',
                        color: '#fff',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      🎯 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentNightRoleKey === 'Scientifique' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#a855f7', fontSize: '1.25rem', fontWeight: 900 }}>
                  🔬 Le Scientifique analyse un suspect...
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                  Touchez un astronaute pour sonder son identité :
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {playerList.filter(p => p.alive && p.roleKey !== 'Scientifique').map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNightScannedPlayer(p)}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: `2px solid ${nightScannedPlayer?.id === p.id ? '#a855f7' : '#334155'}`,
                        background: nightScannedPlayer?.id === p.id ? '#6b21a8' : '#1e293b',
                        color: '#fff',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      🔍 {p.name}
                    </button>
                  ))}
                </div>
                {nightScannedPlayer && (
                  <div style={{ marginTop: '6px', padding: '10px', borderRadius: '10px', background: nightScannedPlayer.camp === 'aliens' ? '#7f1d1d' : '#1e3a8a', textAlign: 'center', fontWeight: 900 }}>
                    Résultat du scan : {nightScannedPlayer.name} est un {nightScannedPlayer.camp === 'aliens' ? '🦠 ALIEN INFILTRÉ !' : '🧑‍🚀 HUMAIN INNOCENT'}
                  </div>
                )}
              </div>
            )}

            {currentNightRoleKey === 'Medecin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.25rem', fontWeight: 900 }}>
                  💉 Le Médecin inspecte l'infirmerie...
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                  La cible de la nuit est : <strong>{playerList.find(p => p.id === nightKillTarget)?.name || 'Personne'}</strong>
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMedecinHealed(h => !h)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                      background: medecinHealed ? '#065f46' : '#1e293b',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Utiliser sérum de guérison ({medecinHealed ? 'Oui' : 'Non'})
                  </button>
                </div>
              </div>
            )}

            <CartoonButton
              onClick={handleNextNightStep}
              variant="secondary"
            >
              Étape suivante ➡️
            </CartoonButton>
          </div>
        )}

        {/* 4. LE RETOUR DE L'ÉTOILE (JOURNÉE, DÉBAT & VOTE) */}
        {phase === 'day_star' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '24px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '3.5rem' }}>⭐☀️</span>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#b45309' }}>
                Le Retour de l'Étoile !
              </h2>
              <p style={{ margin: 0, fontWeight: 700, color: '#475569' }}>
                L'étoile éclaire à nouveau toute la station orbitale. L'équipage se réveille !
              </p>
            </div>

            {/* RAPPORT DU MATIN */}
            <div style={{ padding: '16px', borderRadius: '16px', background: morningCasualties.length > 0 ? '#fef2f2' : '#f0fdf4', border: `2px solid ${morningCasualties.length > 0 ? '#ef4444' : '#22c55e'}` }}>
              {morningCasualties.length > 0 ? (
                <div>
                  <strong style={{ color: '#991b1b', display: 'block', marginBottom: '6px' }}>
                    🚨 Victimes découvertes au petit matin :
                  </strong>
                  {morningCasualties.map(id => {
                    const p = playerList.find(x => x.id === id)
                    return <p key={id} style={{ margin: '2px 0', fontWeight: 800 }}>💀 {p?.name} ({p?.roleName})</p>
                  })}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#166534', fontWeight: 800 }}>
                  ✨ Miracle dans l'espace : Aucun mort cette nuit !
                </p>
              )}
            </div>

            <CartoonButton onClick={() => setPhase('day_debate')}>
              🗣️ Passer au Débat de l'Équipage ➡️
            </CartoonButton>
          </div>
        )}

        {/* 5. DÉBAT & VOTE */}
        {phase === 'day_debate' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 14px', borderRadius: '999px', fontWeight: 900, fontSize: '0.8rem', border: '2px solid #f59e0b' }}>
                🗣️ DÉBAT & TRIBUNAL SPATIAL
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900 }}>
                Qui est le Parasite infiltré ?
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>
                Discutez des comportements de la nuit et désignez qui doit être éjecté dans le sas.
              </p>
            </div>

            {/* SELECTION DU VOTE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>
                Votez pour un suspect à éjecter :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {playerList.filter(p => p.alive).map(p => {
                  const isVoted = Object.values(votes).includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVotes({ target: p.id })}
                      style={{
                        padding: '12px',
                        borderRadius: '14px',
                        border: `3px solid #1e293b`,
                        background: votes.target === p.id ? '#ef4444' : '#ffffff',
                        color: votes.target === p.id ? '#ffffff' : '#1e293b',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: votes.target === p.id ? 'none' : '0 4px 0 #1e293b',
                        transform: votes.target === p.id ? 'translateY(2px)' : 'none'
                      }}
                    >
                      🚀 {p.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <CartoonButton
              variant="danger"
              disabled={!votes.target}
              onClick={handleResolveVote}
            >
              ⚖️ Confirmer le vote et éjecter le suspect
            </CartoonButton>
          </div>
        )}

        {/* 6. ÉJECTION DANS LE SAS */}
        {phase === 'ejection' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '3.5px solid #1e293b',
            boxShadow: '0 8px 0 #1e293b',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '3.5rem' }}>🚀💨</span>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>
              Éjection dans le Sas Spatial !
            </h2>
            {ejectedPlayer ? (
              <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '2px solid #334155', width: '100%' }}>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>
                  {ejectedPlayer.name} a été éjecté dans le vide spatial !
                </p>
                <p style={{ margin: '6px 0 0 0', fontWeight: 800, color: ejectedPlayer.camp === 'aliens' ? '#dc2626' : '#0284c7' }}>
                  Il était : <strong>{ejectedPlayer.roleName}</strong> ({ejectedPlayer.camp === 'aliens' ? 'Infiltré Alien' : 'Innocent Colon'})
                </p>
              </div>
            ) : (
              <p style={{ fontWeight: 800 }}>Égalité des votes : personne n'est éjecté !</p>
            )}

            <CartoonButton onClick={handleNextDayRound}>
              🌙 Lancer la Nuit suivante ➡️
            </CartoonButton>
          </div>
        )}

        {/* 7. FIN DE PARTIE & VICTOIRE */}
        {phase === 'game_over' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: `4px solid ${winnerCamp === 'Colonie' ? '#16a34a' : '#dc2626'}`,
            boxShadow: `0 8px 0 ${winnerCamp === 'Colonie' ? '#15803d' : '#991b1b'}`,
            padding: '32px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '4rem' }}>{winnerCamp === 'Colonie' ? '👑🧑‍🚀' : '🏆🦠'}</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: winnerCamp === 'Colonie' ? '#15803d' : '#991b1b' }}>
              VICTOIRE : {winnerCamp === 'Colonie' ? 'LA COLONIE HUMAINE !' : 'LES PARASITES ALIENS !'}
            </h2>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
              {winnerCamp === 'Colonie'
                ? 'Tous les parasites ont été démasqués et éjectés de la station !'
                : 'Les parasites ont pris le contrôle total de la station orbitale !'}
            </p>

            <CartoonButton onClick={restartAll} variant="success">
              🔄 Rejouer une nouvelle partie
            </CartoonButton>
          </div>
        )}
      </section>
    </GameLayout>
  )
}
