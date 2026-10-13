/**
 * Règles officielles de tous les jeux Loustic.
 * Présentées dans la modale uniforme de GameLayout.
 * Chaque jeu détaille ses équivalents dans la vraie vie (ex: Alias = Codenames / Taboo),
 * ses règles pas à pas, son décompte des points et conditions de victoire.
 */
export const GAME_RULES = {
  alias: {
    title: 'Alias 🗣️',
    equivalent: 'Codenames',
    tagline: 'Fais deviner un maximum de mots en 60 secondes chrono sans prononcer les interdits !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Très proche de Codenames, Taboo et Time’s Up (Manche 1) : faire deviner des mots avec des synonymes, contextes et associations d’idées sous la pression d’un sablier impitoyable.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Faire deviner le plus de mots possible à voix haute à tes coéquipiers avant la fin des 60 secondes.',
      },
      {
        subtitle: '📱 Déroulement du tour',
        text: '1. Le descripteur lance son chrono de 60s.\n2. Il explique le mot affiché avec des synonymes ou situations.\n3. Interdiction formelle de prononcer le mot, sa racine ou une traduction directe (ex: interdiction de dire « chanter » pour « chanteur ») !\n4. Dès que l’équipe trouve, clique sur « ✅ Trouvé ! » (+1 pt). Si tu bloques, clique sur « Passer ➡️ ».',
      },
      {
        subtitle: '🏆 Victoire & Points',
        text: 'Chaque joueur ou équipe passe descripteur à tour de rôle. Le camp qui totalise le plus de points après l’ensemble des manches remporte la partie !',
      },
    ],
  },

  bomb: {
    title: 'Boom boom 💣',
    equivalent: 'Tic Tac Boum / Pass the Bomb',
    tagline: 'Quand ça fait boom, il faut assumer ! La patate chaude explosive.',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'C’est le classique Tic Tac Boum / Pass the Bomb : un thème imposé, une bombe qui fait tic-tac de plus en plus vite, et une explosion dont le moment exact est gardé secret.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Ne surtout pas avoir la bombe en main au moment fatidique de la détonation !',
      },
      {
        subtitle: '📱 Déroulement',
        text: '1. Un thème est tiré au sort (ex: « Marques de voitures », « Choses dans un frigo »).\n2. Le joueur qui tient la bombe doit prononcer à voix haute un mot valide correspondant au thème.\n3. Dès que son mot est validé par la table, il appuie sur « Passer la bombe » et transmet le téléphone à son voisin.',
      },
      {
        subtitle: '💥 Explosion & Gage',
        text: 'La mèche brûle secrètement entre 18 et 40 secondes. Quand la bombe explose, l’écran devient rouge : le joueur éliminé doit accomplir le gage tiré au sort ou boire un shot !',
      },
    ],
  },

  '7sec': {
    title: '7 secondes ⏱️',
    equivalent: '5 Second Rule (5 Secondes Chrono)',
    tagline: 'Donne 3 réponses avant le buzzer… le chrono ne pardonne rien !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré du célèbre jeu de plateau 5 Second Rule (5 Secondes) et des défis YouTube : donner 3 réponses en un temps éclair avant que votre cerveau ne bloque.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Citer 3 éléments valides correspondant au défi imposé avant que les 7 secondes ne s’écoulent.',
      },
      {
        subtitle: '📱 Déroulement',
        text: '1. Le joueur actif découvre son défi (ex: « Donne 3 noms de fromages qui puent »).\n2. Il lance le compte à rebours de 7 secondes et donne ses réponses à voix haute.\n3. Les autres joueurs jugent de la validité et de la rapidité des réponses.',
      },
      {
        subtitle: '🍻 Points & Gorgées',
        text: 'Réussi avant la fin du temps ? Tu marques 1 point ou tu distribues une gorgée au joueur de ton choix ! Échoué ou bloqué ? Tu bois une gorgée de pénalité.',
      },
    ],
  },

  limiteprison: {
    title: 'Limite PRISON ⚠️',
    equivalent: 'Cards Against Humanity / Blanc Manger Coco',
    tagline: 'Humour noir conseillé… Âmes sensibles s’abstenir absolument !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré des monuments de l’humour noir : Cards Against Humanity, Blanc Manger Coco et Limite Limite. Associez les cartes les plus scandaleuses à la phrase à trou.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Créer l’association de phrase la plus hilarante, choquante ou absurde pour séduire le public ou le juge.',
      },
      {
        subtitle: '📱 Déroulement',
        text: '1. Une carte bleue « Question » avec un trou (« ___ ») est dévoilée à tout le monde.\n2. Chaque joueur sélectionne secrètement sa meilleure carte blanche pour compléter le trou.\n3. Les propositions sont révélées anonymement et lues avec emphase.',
      },
      {
        subtitle: '🗳️ Le Vote & Score',
        text: 'Tout le monde vote pour sa carte préférée. L’auteur de la carte victorieuse marque 1 point. Le premier à 5 points est couronné Roi de la Prison !',
      },
    ],
  },

  classemoica: {
    title: 'Classe moi ça 🔢',
    equivalent: 'Top Ten ',
    tagline: 'Coopérez pour que le Capitaine classe vos réponses de 1 à 10 !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Directement inspiré du jeu de l’année Top Ten (Cocktail Games) et de Wavelength / Ito. Un jeu d’ambiance coopératif basé sur l’estimation d’intensités subjectives.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Aider le Capitaine de la manche à deviner et replacer dans l’ordre croissant (de 1 à 10) les idées de toute l’équipe.',
      },
      {
        subtitle: '📱 Déroulement',
        text: '1. Un thème est tiré (ex: « De la pire à la meilleure cachette face à des zombies »).\n2. Chaque joueur reçoit secrètement un chiffre entre 1 (le pire) et 10 (le meilleur).\n3. Chacun invente une idée correspondant à son intensité et l’énonce au Capitaine.\n4. Le Capitaine écoute et annonce l’ordre croissant des joueurs.',
      },
      {
        subtitle: '❤️ Vies & Victoire',
        text: 'L’équipe dispose de 4 vies (croissants de licorne). Chaque inversion d’ordre commise par le Capitaine coûte 1 vie ! Réussissez les 5 manches pour triompher.',
      },
    ],
  },

  lataupe: {
    title: 'La taupe 🔍',
    equivalent: 'Undercover',
    tagline: 'Débattez et démasquez qui ne possède pas le même mot secret que vous !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré de Undercover et du Loup-Garou : un jeu de bluff et de déduction verbale où une minorité doit se fondre dans la masse.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Les Civils doivent démasquer la Taupe. La Taupe doit deviner le mot des civils et bluffer sans éveiller les soupçons.',
      },
      {
        subtitle: '📱 Rôles & Déroulement',
        text: '1. Les Civils reçoivent tous le mot secret (ex: « Chocolat »).\n2. La Taupe reçoit un mot très proche sans le savoir (ex: « Café »).\n3. S’il y a un Fantôme, il ne reçoit aucun mot !\n4. Tour de table : chacun donne un indice en un seul mot.\n5. Débattez des incohérences et votez pour éliminer le suspect.',
      },
      {
        subtitle: '🏆 Victoire',
        text: 'Si la Taupe est éliminée, les Civils gagnent ! Si la Taupe survit jusqu’à la fin ou devine le mot des civils, elle triomphe en solitaire.',
      },
    ],
  },

  spy: {
    title: 'SPY 🕵️',
    equivalent: 'Spyfall (L’Espion qui venait du froid)',
    tagline: 'L’Espion est parmi vous… Saura-t-il deviner où vous êtes tous ?',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré du chef-d’œuvre Spyfall (Cryptozoic) : tous les joueurs sont réunis dans un lieu secret, sauf un espion infiltré qui ignore où il se trouve.',
      },
      {
        subtitle: '🎯 Objectif',
        text: 'Pour les Agents : démasquer l’Espion via des questions ciblées. Pour l’Espion : deviner le lieu secret avant d’être découvert.',
      },
      {
        subtitle: '📱 Déroulement',
        text: '1. Les Agents voient le lieu secret (ex: « Sous-marin », « Casino », « Hôpital »).\n2. L’Espion voit uniquement « 🕵️ Tu es l’Espion ! ».\n3. Les joueurs se posent des questions mutuellement (ex: « Porte-t-on un uniforme ici ? », « Fait-il chaud ? »).\n4. Les réponses doivent être subtiles : trop précises, l’espion comprend ; trop vagues, vous devenez suspect !',
      },
      {
        subtitle: '⏱️ Délibération & Fin',
        text: 'À tout moment, un joueur peut accuser un suspect ou l’Espion peut interrompre pour annoncer le lieu. Si l’Espion trouve le lieu, il gagne la partie !',
      },
    ],
  },

  jenaijamais: {
    title: 'Je n’ai jamais 🍷',
    equivalent: 'Never Have I Ever / Picolo',
    tagline: 'Révèle tes secrets… ou bois une gorgée pour garder le mystère !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Le grand classique international des soirées : Never Have I Ever / Je n’ai jamais. Les langues se délient et les verres se vident.',
      },
      {
        subtitle: '🎯 Règle & Action',
        text: 'Une carte affirmant « Je n’ai jamais… » est lue à voix haute. Tous ceux qui l’ont DÉJÀ fait dans leur vie doivent immédiatement boire une gorgée !',
      },
      {
        subtitle: '🔥 Mode Hot',
        text: 'Basculez sur l’icône 🔥 pour passer en mode Hot avec des questions piquantes, intimes et sans filtre pour réchauffer l’ambiance.',
      },
    ],
  },

  tupreferes: {
    title: 'Tu préfères 🔥',
    equivalent: 'Would You Rather / Dilemmes Absurdes',
    tagline: 'Choisis entre deux galères… et trinque à tes choix !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Le jeu culte Would You Rather : choisir entre la peste et le choléra, l’embarras total ou la galère absolue.',
      },
      {
        subtitle: '🎯 Règle du vote',
        text: 'Deux options cornéliennes sont affichées (Option A vs Option B). Tout le monde compte jusqu’à 3 et annonce son choix simultanément.',
      },
      {
        subtitle: '🍻 Pénalité',
        text: 'Les joueurs qui ont choisi l’option minoritaire doivent boire une gorgée ! En cas d’égalité parfaite, tout le monde trinque !',
      },
    ],
  },

  vraioufaux: {
    title: 'Vrai ou Faux 🧠',
    equivalent: 'Trivial Pursuit / Tu mourras moins bête',
    tagline: 'Anecdotes insolites, records fous et science décalée !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré des jeux de quiz insolites et de culture générale décalée (Trivial Pursuit / Tu mourras moins bête / Les Incollables).',
      },
      {
        subtitle: '🎯 Règle',
        text: 'Une affirmation insolite est lue à voix haute (Sciences, Histoire, Insolite). Chacun vote à main levée si c’est VRAI ou FAUX.',
      },
      {
        subtitle: '👀 Révélation',
        text: 'Appuyez sur « 👀 Révéler la réponse ». Tous les joueurs qui se sont trompés boivent une gorgée ou perdent 1 point.',
      },
    ],
  },

  voteoushot: {
    title: 'Vote ou shot 🗳️',
    equivalent: 'Juduku / Qui pourrait… / Pointing Game',
    tagline: 'Connaissez-vous vraiment vos amis ? Pointez du doigt le coupable !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré des jeux de table piquants comme Juduku et Who’s Most Likely To : désigner collectivement le profil idéal de la situation.',
      },
      {
        subtitle: '🎯 Règle',
        text: 'Une question du type « Qui est le plus susceptible de… » apparaît à l’écran. Tout le monde compte jusqu’à 3 et pointe du doigt la personne visée.',
      },
      {
        subtitle: '🍻 Sentence',
        text: 'Le joueur qui reçoit le plus de doigts pointés vers lui boit autant de gorgées que de votes reçus !',
      },
    ],
  },

  switch: {
    title: 'Switch ⚡',
    equivalent: 'Time\'s up',
    tagline: 'Des gages express, des échanges surprises et des duels immédiats !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Le digne héritier des applications festives cultes (Picolo, Do or Drink, Ring of Fire / Roi du Verre) avec des cartes d’action immédiates.',
      },
      {
        subtitle: '🎯 Règle',
        text: 'Tirez une carte. Le joueur désigné doit accomplir le défi sans hésiter, sinon shot ! Attention aux cartes SWITCH qui inversent les rôles ou échangent vos verres.',
      },
    ],
  },

  juge: {
    title: 'Juge ⚖️',
    equivalent: 'C’est un 10 mais… / Tribunal de potes',
    tagline: 'C’est un 10 mais… il/elle vaut combien sur 10 ?',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Basé sur la célèbre trend virale « He/She’s a 10 but… » : réévaluer la note d’une personne idéale à qui l’on ajoute un trait toxique, ridicule ou rédhibitoire.',
      },
      {
        subtitle: '🎯 Règle',
        text: 'Une situation est affichée. Chaque joueur donne sa nouvelle note révisée de 1 à 10 et argumente son choix devant le tribunal de la table !',
      },
    ],
  },

  debat: {
    title: 'Débat 📢',
    equivalent: 'Taggle / Le Grand Débat / Stand-up',
    tagline: 'Défends l’indéfendable avec mauvaise foi et panache !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré de Taggle et des joutes verbales de stand-up : s’affronter sur des sujets absurdes ou polémiques et convaincre le public.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: 'Un sujet polémique est tiré. Le chrono de parole (30s, 60s ou 90s) est lancé. Les orateurs défendent leur position avec fougue.',
      },
      {
        subtitle: '🗳️ Le Vote du Public',
        text: 'Le reste de la table vote via les boutons Pour, Contre ou Égalité pour élire l’argumentaire le plus convaincant !',
      },
    ],
  },

  racontemoi: {
    title: 'Raconte-moi 📖',
    equivalent: 'Black Stories',
    tagline: 'Fais deviner une histoire vraie totalement folle en répondant par OUI ou NON !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Directement calqué sur la célèbre série d’énigmes morbides et insolites Black Stories (Dark Stories) et les vrais Darwin Awards.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Le conteur lit secrètement l’histoire complète.\n2. Il donne le titre et la situation de départ aux enquêteurs.\n3. Les autres joueurs posent des questions fermées : le conteur ne peut répondre que par OUI ou NON !\n4. Utilisez les 3 indices progressifs si les joueurs sèchent, puis révélez la phrase clé finale.',
      },
    ],
  },

  synapse: {
    title: 'Synapse (TTMC) ⚡',
    equivalent: 'TTMC (Tu Te Mets Combien ?)',
    tagline: 'Tu te mets combien de 1 à 10 sur ce sujet précis ?',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'L’adaptation fidèle du jeu culte TTMC (Tu Te Mets Combien ?) : auto-évaluez vos connaissances de 1 (facile) à 10 (niveau expert).',
      },
      {
        subtitle: '🎯 Règle',
        text: '1. Un thème est annoncé.\n2. Le joueur choisit sa note de 1 à 10 selon sa confiance.\n3. La question correspondant exactement à ce niveau est posée.\n4. S’il répond juste, il marque autant de points que sa note (ex: niveau 7 = 7 pts). S’il se trompe, 0 point !',
      },
      {
        subtitle: '🏆 Victoire',
        text: 'Le premier joueur ou la première équipe à franchir la barre des 30 points remporte le titre de Génie de la Soirée.',
      },
    ],
  },

  yams: {
    title: 'Yams 🎲',
    equivalent: 'Yahtzee / Yam’s officiel',
    tagline: 'Le grand classique du lancer de 5 dés avec feuille de score complète !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Le Yahtzee / Yam’s officiel historique : 5 dés, jusqu’à 3 lancers par tour, et une grille de combinaisons stratégiques.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Lancez les 5 dés.\n2. Vous avez jusqu’à 3 lancers : touchez les dés que vous souhaitez conserver (garder), puis relancez les autres.\n3. Inscrivez obligatoirement votre résultat dans une case libre de la feuille de score.',
      },
      {
        subtitle: '📝 Combinaisons & Bonus',
        text: 'Section supérieure (1 à 6) : si le sous-total atteint 63 points, vous décrochez le Bonus de +35 points ! Combinaisons : Brelan, Carré, Full (25 pts), Petite Suite (30 pts), Grande Suite (40 pts) et YAMS (50 pts).',
      },
    ],
  },

  devinequi: {
    title: 'Devine qui ? 🎭',
    equivalent: 'Post-it sur le front / Qui est-ce ?',
    tagline: 'Découvre le personnage secret collé sur ton front !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Le jeu du post-it collé sur le front (Hedbanz / Qui suis-je ? / Qui est-ce ?) : un personnage célèbre vous est attribué sans que vous ne le voyiez.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Chaque joueur reçoit un personnage secret affiché aux autres.\n2. À votre tour, posez des questions fermées (auxquelles on ne peut répondre que par OUI ou NON).\n3. Comptez le nombre de questions nécessaires pour deviner qui vous êtes !',
      },
    ],
  },

  universalmind: {
    title: 'Universal mind 🌐',
    equivalent: 'Concept / Pictionary avec symboles',
    tagline: 'Faites deviner des idées avec la seule force des symboles universels !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Directement inspiré du jeu récompensé Concept (Repos Production) : communiquer et faire deviner des mots sans parler ni dessiner, uniquement en combinant des pictogrammes universels.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Le guide découvre le mot secret.\n2. Il sélectionne des icônes sur la grille (Nature, Homme, Feu, Transport, Couleur, etc.) pour composer son indice.\n3. Son équipe tente de déduire le mot mystère sans qu’aucun son ne soit prononcé !',
      },
    ],
  },

  desole: {
    title: 'Désolé 💌',
    equivalent: 'Secret Identity',
    tagline: 'Confessions et dilemmes piquants… Quel sera votre verdict ?',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré des jeux de confessions et de débat moral intime (Secret Identity / Dilemme Express) : partager des anecdotes réelles et se soumettre au verdict du groupe.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: 'Le joueur interrogé raconte son anecdote face au dilemme ou à la situation. La table vote : Pardonné 😇, Coupable 🚨 ou 1 Shot 🥃 !',
      },
    ],
  },

  parasite: {
    title: 'Parasite 🦠',
    equivalent: 'Among Us / Loup-Garou',
    tagline: 'Méfiez-vous de vos proches… La colonie extraterrestre veille !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré du phénomène mondial Among Us et du film culte The Thing : un membre de l’équipage a été infecté et doit saboter la mission sans se faire éjecter du sas.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Chacun regarde secrètement son rôle sur le téléphone (Innocent ou Parasite).\n2. Phase de débat : tout le monde partage son alibi.\n3. Phase de vote : l’équipage désigne à la majorité le joueur à éjecter dans l’espace.',
      },
      {
        subtitle: '🏆 Victoire',
        text: 'Si le parasite est éjecté, l’équipage survit ! Si un innocent est éjecté par erreur, le parasite gagne du terrain.',
      },
    ],
  },

  galerie: {
    title: 'Galerie 🎨',
    equivalent: 'Dixit ',
    tagline: 'Associez la bonne œuvre d’art au bon indice poétique !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré du célèbre As d’Or Dixit et de Mysterium : un conteur donne un indice subtil sur une image onirique, et les joueurs doivent retrouver la carte originale.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Le conteur regarde son œuvre secrète et formule un indice poétique ou énigmatique.\n2. L’exposition de cartes est révélée à tous.\n3. Les joueurs votent pour la carte qui correspond selon eux à l’indice.',
      },
    ],
  },

  messmeme: {
    title: 'Mess Meme 😂',
    equivalent: 'What Do You Meme? / Meme Party',
    tagline: 'La meilleure légende pour le pire des mèmes de la culture web !',
    sections: [
      {
        subtitle: '🎲 Équivalent dans la vraie vie',
        text: 'Inspiré du jeu culte What Do You Meme? : associer la punchline la plus drôle à une image de mème culte pour faire rire toute la table.',
      },
      {
        subtitle: '🎯 Déroulement',
        text: '1. Une situation et un template de mème apparaissent à l’écran.\n2. Chaque joueur imagine et soumet sa meilleure légende.\n3. Tout le monde vote pour la punchline la plus hilarante !',
      },
    ],
  },
}
