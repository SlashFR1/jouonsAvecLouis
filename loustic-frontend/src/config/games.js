/**
 * Catalogue des jeux Loustic.
 *
 * - `route` : le jeu est migré en React → navigation interne.
 * - `legacy` : pas encore migré → ouvre l'ancienne page HTML (migration progressive).
 * - `deck` (jeux de cartes simples) : config lue par <DeckGame />, données servies par Spring Boot (CSV).
 */
export const LEGACY_BASE_URL =
  import.meta.env.VITE_LEGACY_BASE_URL ?? 'https://slashfr1.github.io/jouonsAvecLouis/'

export const CARD_COLORS = {
  purple: '#8c7ae6',
  blue: '#00a8ff',
  pink: '#e84393',
  yellow: '#f5cd79',
  green: '#4cd137',
  orange: '#e17055',
  red: '#eb2f06',
  black: '#2f3542',
}

/**
 * Couleurs de fond pastel douces uniques par jeu (la seule fantaisie autorisée).
 * S'harmonisent avec le style Rubber Hose (encre #161513 et trame halftone dots).
 */
export const PASTEL_COLORS = {
  // Jeux 1 téléphone (Pass & Play / Solo / Local)
  switch: '#e1f5fe',        // Pastel Azur
  jenaijamais: '#fce4ec',   // Pastel Rose Fraise
  tupreferes: '#fff3e0',    // Pastel Pêche Abricot
  vraioufaux: '#e8f5e9',    // Pastel Vert Amande
  voteoushot: '#fff8e1',    // Pastel Vanille / Jaune doux
  juge: '#ffebee',          // Pastel Rouge / Corail doux
  '7sec': '#e0f7fa',        // Pastel Cyan givré
  yams: '#ffebee',          // Pastel Rubis clair
  bomb: '#ffebee',          // Pastel Rouge doux
  lataupe: '#ede7f6',       // Pastel Lavande
  spy: '#e8f5e9',           // Pastel Menthe
  alias: '#fff9c4',         // Pastel Beurre doux
  classemoica: '#fce4ec',   // Pastel Bonbon
  limiteprison: '#eceff1',  // Pastel Ardoise clair
  debat: '#e1f5fe',         // Pastel Ciel
  racontemoi: '#fff3e0',    // Pastel Chamois
  synapse: '#e8eaf6',       // Pastel Pervenche
  devinequi: '#f3e5f5',     // Pastel Mauve
  universalmind: '#ede7f6', // Pastel Lilas
  desole: '#fffde7',        // Pastel Crème
  parasite: '#e0f2f1',      // Pastel Céladon
  galerie: '#fce4ec',       // Pastel Poudré
  messmeme: '#f5f5f5',      // Pastel Brume lin

  // Salles multi-téléphones
  'bomb-online': '#ffebee',
  'limiteprison-multi': '#eceff1',
  'classemoica-multi': '#fce4ec',
  'lataupe-multi': '#ede7f6',
  'spy-multi': '#e8f5e9',
  'alias-multi': '#fff9c4',
  '7sec-multi': '#e0f7fa',
  'galerie-multi': '#fce4ec',
}

/** Jeux "pioche une carte" génériques, rendus par DeckGame. */
export const DECK_GAMES = {
  jenaijamais: {
    title: "Je n'ai jamais",
    emoji: '🍷',
    color: 'pink',
    deck: 'jenaijamais',
    field: 'texte',
    hasModes: true,
    prefix: "Je n'ai jamais… ",
    hint: 'Ceux qui l’ont déjà fait boivent une gorgée !',
  },
  tupreferes: {
    title: 'Tu préfères',
    emoji: '🔥',
    color: 'yellow',
    deck: 'tupreferes',
    field: 'texte',
    hint: 'Chacun choisit… la minorité trinque !',
  },
  voteoushot: {
    title: 'Vote ou shot',
    emoji: '🗳️',
    color: 'orange',
    deck: 'voteoushot',
    field: 'texte',
    hint: 'À 3, tout le monde pointe quelqu’un du doigt !',
  },
  juge: {
    title: 'Juge',
    emoji: '⚖️',
    color: 'red',
    deck: 'juge',
    field: 'texte',
    hasModes: true,
    hint: 'Alors… tu lui mets combien sur 10 ?',
  },
  vraioufaux: {
    title: 'Vrai ou Faux',
    emoji: '🧠',
    color: 'green',
    deck: 'vraioufaux',
    field: 'affirmation',
    tagField: 'categorie',
    revealField: 'reponse',
    hint: 'Votez, puis révélez la réponse !',
  },
}

const deckRoute = id => `/jeux/${id}`

/**
 * Jeux 1 Seul Téléphone (Pass & Play / Cartes de soirée).
 * Strictement restreint aux 5 jeux spécifiés par l'utilisateur :
 * - Je n'ai jamais
 * - Tu préfères
 * - Vote ou shot
 * - Juge
 * - Vrai ou Faux
 */
export const LOCAL_GAMES = [
  { id: 'jenaijamais', title: "Je n'ai jamais", emoji: '🍷', color: 'pink', desc: 'Révèle tes secrets (ou bois un coup si tu veux rester mystérieux).', route: deckRoute('jenaijamais') },
  { id: 'tupreferes', title: 'Tu préfères', emoji: '🔥', color: 'yellow', desc: 'Choisis entre deux galères… et trinque à tes choix !', route: deckRoute('tupreferes') },
  { id: 'voteoushot', title: 'Vote ou shot', emoji: '🗳️', color: 'orange', desc: 'Connaissez-vous vraiment vos amis ?', route: deckRoute('voteoushot') },
  { id: 'juge', title: 'Juge', emoji: '⚖️', color: 'red', desc: 'Et sur 10 il/elle vaut combien ?!', route: deckRoute('juge') },
  { id: 'vraioufaux', title: 'Vrai ou Faux', emoji: '🧠', color: 'green', desc: 'Qui de vous aura le plus de culture !', route: deckRoute('vraioufaux') },
  { id: 'parasite', title: 'Parasite', emoji: '🦠', color: 'blue', desc: 'Jeu de rôle secret spatial (Pass & Play) : deck personnalisé, nuit noire et démasquage !', route: '/jeux/parasite', isNew: true },
  { id: 'debat', title: 'Débat', emoji: '📢', color: 'blue', desc: 'Défends l’indéfendable avec panache !', route: '/jeux/debat' },
  { id: 'racontemoi', title: 'Raconte-moi', emoji: '📖', color: 'orange', desc: 'Construisez une histoire délirante phrase après phrase !', route: '/jeux/racontemoi' },
  { id: 'universalmind', title: 'Universal mind', emoji: '🌐', color: 'purple', desc: 'Faites deviner des idées avec la force des symboles !', route: '/jeux/universalmind' },
]

/**
 * Jeux Plusieurs Téléphones (Multijoueurs / Salles en direct & Équipes).
 * Tous les jeux multi-appareils synchronisés de Loustic.
 */
export const MULTI_GAMES = [
  // Salles multi-téléphones en temps réel
  { id: 'bomb-online', title: 'Boom boom', emoji: '💣', color: 'red', desc: 'La bombe saute de téléphone en téléphone avec son tic-tac explosif !', route: '/salle/bomb', isNew: true },
  { id: 'limiteprison-multi', title: 'Limite PRISON', emoji: '⚠️', color: 'black', desc: 'Complétez les questions sales et votez pour la pire réponse !', route: '/salle/limiteprison', isNew: true },
  { id: 'classemoica-multi', title: 'Classe moi ça', emoji: '🔢', color: 'pink', desc: 'Coopérez pour que le capitaine classe vos réponses de 1 à 10 !', route: '/salle/classemoica', isNew: true },
  { id: '7sec-multi', title: '7 secondes', emoji: '⏱️', color: 'blue', desc: 'Chaque joueur relève son défi en 7 secondes chrono synchronisées !', route: '/salle/7sec', isNew: true },
  { id: 'lataupe-multi', title: 'La taupe', emoji: '🔍', color: 'purple', desc: 'Débattez et démasquez la taupe cachée parmi vous !', route: '/salle/lataupe', isNew: true },
  { id: 'spy-multi', title: 'SPY', emoji: '🕵️', color: 'green', desc: 'Posez des questions pour trouver qui ne connaît pas le lieu secret !', route: '/salle/spy', isNew: true },
  { id: 'alias-multi', title: 'Alias', emoji: '🕵️', color: 'yellow', desc: 'Démineur espion 5×5 : Équipe Rose vs Jaune avec carte bombe !', route: '/salle/alias', isNew: true },
  { id: 'parasite-multi', title: 'Parasite', emoji: '🦠', color: 'blue', desc: 'Rôles secrets spatiaux, actions de nuit séquentielles et vote du sas !', route: '/salle/parasite', isNew: true },
  { id: 'synapse-multi', title: 'Synapse', emoji: '⚡', color: 'blue', desc: 'Auto-évaluation de 1 à 10, mode risqué et arbitrage par les pairs en direct !', route: '/salle/synapse', isNew: true },
  { id: 'galerie-multi', title: 'Galerie (Dixit)', emoji: '🎨', color: 'purple', desc: 'Indice poétique du conteur, cartes pièges et vote secret en direct !', route: '/salle/galerie', isNew: true },

  // Jeux multi-joueurs en équipe et interactifs
  { id: 'switch', title: 'Switch', emoji: '⚡', color: 'blue', desc: 'Flash Guess (Time’s Up) & Sketch It (Pictionary) en équipes !', route: '/jeux/switch', isNew: true },
  { id: 'galerie', title: 'Galerie', emoji: '🎨', color: 'purple', desc: 'Associez la bonne œuvre d’art au bon indice poétique du conteur !', route: '/jeux/galerie' },
  { id: 'messmeme', title: 'Mess Meme', emoji: '😂', color: 'black', desc: 'Votez pour la meilleure légende de mème entre amis !', route: '/jeux/messmeme' },
  { id: 'synapse', title: 'Synapse (Pass & Play)', emoji: '⚡', color: 'blue', desc: 'Notez vos connaissances de 1 à 10 et relevez le défi !', route: '/jeux/synapse' },
  { id: 'devinequi', title: 'Devine qui ?', emoji: '🎭', color: 'purple', desc: 'Qui suis-je ? Posez vos questions pour vous identifier !', route: '/jeux/devinequi' },
  { id: 'desole', title: 'Désolé', emoji: '💌', color: 'yellow', desc: 'Défis piquants et vérités sans filtre !', route: '/jeux/desole' },
  { id: 'yams', title: 'Yams', emoji: '🎲', color: 'red', desc: 'Partie officielle de Yam’s à plusieurs avec grille de score !', route: '/jeux/yams' },
]

/**
 * Autres Jeux (Jeux en ligne avec liens externes & nouveautés à venir).
 */
export const OTHER_GAMES = [
  { id: 'petitbac', title: 'Petit Bac', emoji: '📝', color: 'yellow', desc: 'Soyez les plus rapides pour trouver des réponses associées à chaque catégorie !', external: 'https://petit-juppdbemh-slashfr1s-projects.vercel.app/' },
  { id: 'tooninsight', title: 'Toon Insight', emoji: '🎨', color: 'red', desc: 'Quiz visuel cartoon en ligne : devinez l’univers et les détails cachés !', external: 'https://toon-insight.vercel.app/' },
  { id: 'belote', title: 'Belote & Quinch', emoji: '🃏', color: 'blue', desc: 'La Belote officielle à 4 joueurs en direct avec la variante Quinch !', external: 'https://belote-gamma.vercel.app/' },
  { id: 'blindtest', title: 'Blind Test', emoji: '🎵', color: 'purple', desc: 'Reconnaissez le morceau musical ou le générique culte avant les autres !', isComingSoon: true },
]
