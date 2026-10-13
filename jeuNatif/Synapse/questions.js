// Base de données pour Synapse (TTMC - Tu Te Mets Combien ?)
const DB = {
  questions: {
    // NIVEAU 1
    "q1_1": { niveau: 1, texte: "De quelle couleur est le cheval blanc d'Henri IV ?", reponse: "Blanc" },
    "q1_2": { niveau: 1, texte: "Combien y a-t-il de jours dans une semaine ?", reponse: "7 jours" },
    "q1_3": { niveau: 1, texte: "Quel animal aboie et est le meilleur ami de l'homme ?", reponse: "Le chien" },
    "q1_4": { niveau: 1, texte: "Quel est l'astre qui éclaire la Terre pendant la journée ?", reponse: "Le Soleil" },
    
    // NIVEAU 2
    "q2_1": { niveau: 2, texte: "Quelle est la capitale de la France ?", reponse: "Paris" },
    "q2_2": { niveau: 2, texte: "Combien de côtés possède un triangle ?", reponse: "3 côtés" },
    "q2_3": { niveau: 2, texte: "Quel super-héros a été mordu par une araignée radioactive ?", reponse: "Spider-Man (Peter Parker)" },
    "q2_4": { niveau: 2, texte: "Combien de saisons compte une année ?", reponse: "4 saisons" },

    // NIVEAU 3
    "q3_1": { niveau: 3, texte: "Quel est le plus grand océan de la planète Terre ?", reponse: "L'océan Pacifique" },
    "q3_2": { niveau: 3, texte: "Dans quel pays se trouvent les pyramides de Gizeh ?", reponse: "En Égypte" },
    "q3_3": { niveau: 3, texte: "Qui est le créateur de Mickey Mouse ?", reponse: "Walt Disney" },
    "q3_4": { niveau: 3, texte: "Combien de joueurs composent une équipe de football sur le terrain ?", reponse: "11 joueurs" },

    // NIVEAU 4
    "q4_1": { niveau: 4, texte: "Quel est le symbole chimique de l'eau ?", reponse: "H2O" },
    "q4_2": { niveau: 4, texte: "Quel artiste de la Renaissance a peint La Joconde ?", reponse: "Léonard de Vinci" },
    "q4_3": { niveau: 4, texte: "En quelle année a eu lieu la Révolution française ?", reponse: "1789" },
    "q4_4": { niveau: 4, texte: "Quelle planète du système solaire est surnommée la planète rouge ?", reponse: "Mars" },

    // NIVEAU 5
    "q5_1": { niveau: 5, texte: "Combien d'os compte le squelette d'un être humain adulte ?", reponse: "206 os" },
    "q5_2": { niveau: 5, texte: "Quel célèbre détective réside au 221B Baker Street à Londres ?", reponse: "Sherlock Holmes" },
    "q5_3": { niveau: 5, texte: "Quelle est la capitale de l'Australie ?", reponse: "Canberra" },
    "q5_4": { niveau: 5, texte: "Quel gaz les plantes absorbent-elles lors de la photosynthèse ?", reponse: "Le dioxyde de carbone (CO2)" },

    // NIVEAU 6
    "q6_1": { niveau: 6, texte: "Quelle est la vitesse approximative de la lumière dans le vide (en km/s) ?", reponse: "300 000 km/s (exactement 299 792 km/s)" },
    "q6_2": { niveau: 6, texte: "Qui a écrit la pièce 'Roméo et Juliette' ?", reponse: "William Shakespeare" },
    "q6_3": { niveau: 6, texte: "Quel est le plus grand mammifère vivant sur Terre ?", reponse: "La baleine bleue (rorqual bleu)" },
    "q6_4": { niveau: 6, texte: "Quelle est la monnaie officielle du Japon ?", reponse: "Le Yen (¥)" },

    // NIVEAU 7
    "q7_1": { niveau: 7, texte: "En quelle année l'Homme a-t-il marché sur la Lune pour la première fois ?", reponse: "1969 (mission Apollo 11)" },
    "q7_2": { niveau: 7, texte: "Quel fleuve traverse l'Égypte de part en part ?", reponse: "Le Nil" },
    "q7_3": { niveau: 7, texte: "Combien de touches compte généralement un piano standard classique ?", reponse: "88 touches (52 blanches, 36 noires)" },
    "q7_4": { niveau: 7, texte: "Quel célèbre physicien a formulé la théorie de la relativité générale ?", reponse: "Albert Einstein" },

    // NIVEAU 8
    "q8_1": { niveau: 8, texte: "Quel est le métal le plus abondant dans la croûte terrestre ?", reponse: "L'aluminium" },
    "q8_2": { niveau: 8, texte: "Dans quel pays est né le peintre Pablo Picasso ?", reponse: "En Espagne (à Malaga)" },
    "q8_3": { niveau: 8, texte: "Quel est le plus long fleuve d'Amérique du Sud ?", reponse: "L'Amazone" },
    "q8_4": { niveau: 8, texte: "Quelle est la capitale du Canada ?", reponse: "Ottawa" },

    // NIVEAU 9
    "q9_1": { niveau: 9, texte: "Quel philosophe grec antique a été condamné à boire la ciguë en 399 av. J.-C. ?", reponse: "Socrate" },
    "q9_2": { niveau: 9, texte: "Combien de cordes comporte une harpe de concert classique à pédales ?", reponse: "47 cordes" },
    "q9_3": { niveau: 9, texte: "Quel est le point culminant du continent africain ?", reponse: "Le Kilimandjaro (5 895 mètres)" },
    "q9_4": { niveau: 9, texte: "Quel est l'élément chimique représenté par le symbole 'Au' ?", reponse: "L'Or (du latin Aurum)" },

    // NIVEAU 10
    "q10_1": { niveau: 10, texte: "En aviron, comment appelle-t-on le membre de l'équipage qui dirige le bateau et donne le rythme ?", reponse: "Le barreur" },
    "q10_2": { niveau: 10, texte: "Quelle est la capitale du Bhoutan, petit royaume de l'Himalaya ?", reponse: "Thimphou" },
    "q10_3": { niveau: 10, texte: "Quel prix Nobel n'a jamais été décerné car Alfred Nobel ne l'a pas inclus dans son testament initial ?", reponse: "Le prix Nobel de mathématiques" },
    "q10_4": { niveau: 10, texte: "Quel os du corps humain est le seul qui n'est relié directement à aucun autre os ?", reponse: "L'os hyoïde" }
  },

  bonus: [
    "CHALLENGE : Récite l'alphabet à l'envers jusqu'à M en moins de 10 secondes !",
    "CHALLENGE : Tout le monde applaudit le joueur actif ou boit 1 gorgée !",
    "BONUS : Vous volez 3 points à l'équipe de votre choix !",
    "CHALLENGE : Cite 5 marques de voitures en 5 secondes chrono !",
    "CADEAU : Votre équipe gagne immédiatement 5 points bonus !",
    "CHALLENGE : Mime un animal choisi par les adversaires pendant 15 secondes sans parler !"
  ]
};
