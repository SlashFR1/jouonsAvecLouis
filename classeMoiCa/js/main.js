// /js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Embedded Themes Data (This is a constant, it will not be saved in the session) ---
    const themes = [

        {
            "id": 1,
            "themeA": "De la pire à la meilleure cachette en cas d'attaque de zombies.",
            "themeB": "Quelque chose que vous ne voudriez PAS trouver dans votre lit. De 'pas idéal' à 'catastrophe totale'."
        },
        {
            "id": 2,
            "themeA": "Un super-pouvoir. De 'complètement inutile' à 'divin'.",
            "themeB": "Niveau d'urgence pour aller aux toilettes. De 'je peux tenir' à 'c'est une question de secondes'."
        },
        {
            "id": 3,
            "themeA": "Ce que vous diriez à un alien. De 'bonjour timide' à 'déclaration de guerre intergalactique'.",
            "themeB": "Le cadeau d'anniversaire parfait. De 'geste symbolique' à 'incroyablement extravagant'."
        },
        {
            "id": 4,
            "themeA": "Votre réaction si vous gagniez au loto. De 'calme et posé' à 'hystérie totale'.",
            "themeB": "Un plat à cuisiner pour impressionner quelqu'un. De 'simple mais efficace' à 'digne d'un chef 3 étoiles'."
        },
        {
            "id": 5,
            "themeA": "L'endroit idéal pour des vacances. De 'repos total' à 'aventure extrême'.",
            "themeB": "Le bruit le plus agaçant. De 'légèrement irritant' à 'insupportable'."
        },
        {
            "id": 6,
            "themeA": "Une excuse pour arriver en retard. De 'crédible' à 'totalement absurde'.",
            "themeB": "Le niveau de douleur d'une blessure. De 'petite égratignure' à 'je vois la lumière'."
        },
        {
            "id": 7,
            "themeA": "Un animal de compagnie. De 'facile à entretenir' à 'c'est un zoo à la maison'.",
            "themeB": "La meilleure chanson pour chanter sous la douche. De 'murmure discret' à 'concert à guichets fermés'."
        },
        {
            "id": 8,
            "themeA": "La théorie du complot la plus folle. De 'presque plausible' à 'complètement délirante'.",
            "themeB": "Le niveau de piquant d'un plat. De 'doux' à 'volcan en éruption'."
        },
        {
            "id": 9,
            "themeA": "Un objet à emporter sur une île déserte. De 'peu utile' à 'essentiel pour survivre'.",
            "themeB": "Votre talent caché. De 'modestement amusant' à 'époustouflant'."
        },
        {
            "id": 10,
            "themeA": "Le personnage de film le plus détestable. De 'agaçant' à 'purement maléfique'.",
            "themeB": "Le degré d'addiction à votre téléphone. De 'je l'utilise peu' à 'c'est une extension de mon bras'."
        },
        {
            "id": 11,
            "themeA": "La pire coupe de cheveux possible. De 'juste raté' à 'désastre capillaire'.",
            "themeB": "L'odeur parfaite. De 'subtile et agréable' à 'enivrante'."
        },
        {
            "id": 12,
            "themeA": "Le film idéal pour un premier rendez-vous. De 'romantique et léger' à 'choix très audacieux'.",
            "themeB": "Votre niveau de motivation le lundi matin. De 'zéro absolu' à 'prêt à conquérir le monde'."
        },
        {
            "id": 13,
            "themeA": "La chose la plus embarrassante à faire en public. De 'un peu gênant' à 'je veux disparaître'.",
            "themeB": "Un objet de collection. De 'commun' à 'extrêmement rare'."
        },
        {
            "id": 14,
            "themeA": "Le meilleur méchant de l'histoire du cinéma. De 'charismatique' à 'terrifiant'.",
            "themeB": "La complexité d'un jeu de société. De 'règles simples' à 'il faut un doctorat pour comprendre'."
        },
        {
            "id": 15,
            "themeA": "Le son le plus relaxant. De 'calmant' à 'somnifère naturel'.",
            "themeB": "La pire façon de rompre. De 'avec tact' à 'cruauté maximale'."
        },
        {
            "id": 16,
            "themeA": "Le niveau de difficulté pour assembler un meuble IKEA. De 'facile' à 'cauchemar suédois'.",
            "themeB": "La boisson parfaite pour une soirée. De 'sans alcool' à 'très festif'."
        },
        {
            "id": 17,
            "themeA": "Le légume le moins apprécié. De 'fade' à 'absolument dégoûtant'.",
            "themeB": "La meilleure invention de tous les temps. De 'pratique' à 'révolutionnaire'."
        },
        {
            "id": 18,
            "themeA": "Le niveau de stress avant un examen. De 'confiant' à 'panique totale'.",
            "themeB": "La créature mythologique la plus impressionnante. De 'mignonne' à 'terrifiante'."
        },
        {
            "id": 19,
            "themeA": "La pire tâche ménagère. De 'rapide' à 'interminable et horrible'.",
            "themeB": "La meilleure destination de voyage. De 'ville voisine' à 'bout du monde'."
        },
        {
            "id": 20,
            "themeA": "Le degré de confort d'un lit. De 'planche de bois' à 'nuage paradisiaque'.",
            "themeB": "Le livre qui a le plus changé votre vie. De 'lecture agréable' à 'révélation'."
        },
        {
            "id": 21,
            "themeA": "Façons de dire bonjour. De 'timide' à 'exubérant'.",
            "themeB": "Votre niveau de productivité en télétravail. De 'distrait' à 'machine de guerre'."
        },
        {
            "id": 22,
            "themeA": "Le pire conseil que l'on puisse donner. De 'peu judicieux' à 'catastrophique'.",
            "themeB": "La meilleure série télé. De 'sympa' à 'chef-d'œuvre'."
        },
        {
            "id": 23,
            "themeA": "La chose la plus stupide que vous ayez faite par amour. De 'un peu ridicule' à 'complètement fou'.",
            "themeB": "Un talent inutile. De 'amusant en soirée' à 'absolument sans intérêt'."
        },
        {
            "id": 24,
            "themeA": "Le niveau de discrétion d'un espion. De 'bruyant' à 'invisible'.",
            "themeB": "Le meilleur dessert. De 'léger et fruité' à 'bombe calorique'."
        },
        {
            "id": 25,
            "themeA": "Votre cri. De 'petit couinement' à 'hurlement strident'.",
            "themeB": "La pire mode vestimentaire. De ' discutable' à 'crime contre l'humanité'."
        },
        {
            "id": 26,
            "themeA": "La meilleure pizza. De 'classique' à 'originale et délicieuse'.",
            "themeB": "Le niveau de crédibilité d'un politicien. De 'douteux' à 'fiable'."
        },
        {
            "id": 27,
            "themeA": "Un objet que l'on retrouve au fond d'un sac. De 'attendu' à 'totalement incongru'.",
            "themeB": "La danse la plus ridicule. De 'un peu maladroit' à 'complètement absurde'."
        },
        {
            "id": 28,
            "themeA": "Le café. De 'très léger' à 'capable de réveiller les morts'.",
            "themeB": "La pire place dans un avion. De 'confortable' à 'terrible'."
        },
        {
            "id": 29,
            "themeA": "La compétence la plus utile en cas d'apocalypse. De 'moyennement utile' à 'vitale'.",
            "themeB": "Le pire cadeau de Noël. De 'décevant' à 'offensant'."
        },
        {
            "id": 30,
            "themeA": "Le niveau de propreté de votre chambre. De 'impeccable' à 'zone sinistrée'.",
            "themeB": "Le meilleur jeu vidéo. De 'amusant' à 'légendaire'."
        },
        {
            "id": 31,
            "themeA": "Les pires excuses pour manquer une réunion. De 'acceptable' à 'totalement invraisemblable'",
            "themeB": "Les endroits les plus inconfortables pour passer la nuit. De 'légèrement gênant' à 'impossible à supporter'"
        },
        {
            "id": 32,
            "themeA": "Les plats les plus épicés. De 'à peine piquant' à 'brûle la bouche'",
            "themeB": "Les bruits les plus irritants à entendre au réveil. De 'un peu agaçant' à 'je veux pleurer'"
        },
        {
            "id": 33,
            "themeA": "Les pires coiffures. De 'ratée mais supportable' à 'désastre total'",
            "themeB": "Les endroits les plus étranges pour faire un pique-nique. De 'original mais correct' à 'totalement loufoque'"
        },
        {
            "id": 34,
            "themeA": "Les activités les plus stressantes avant un examen. De 'gérable' à 'panique totale'",
            "themeB": "Les super-pouvoirs les plus ridicules. De 'un peu utile' à 'complètement inutile'"
        },
        {
            "id": 35,
            "themeA": "Les objets les plus utiles sur une île déserte. De 'presque inutile' à 'indispensable'",
            "themeB": "Les façons les plus embarrassantes de tomber en public. De 'petit faux pas' à 'humiliation totale'"
        },
        {
            "id": 36,
            "themeA": "Les moyens de transport les plus effrayants. De 'calme' à 'terrifiant'",
            "themeB": "Les plats les plus difficiles à cuisiner pour impressionner quelqu’un. De 'relativement simple' à 'chef étoilé requis'"
        },
        {
            "id": 37,
            "themeA": "Les situations les plus embarrassantes sur un rendez-vous. De 'gênant' à 'catastrophique'",
            "themeB": "Les endroits les plus insolites pour se cacher lors d’un jeu de cache-cache. De 'facile à trouver' à 'impossible à découvrir'"
        },
        {
            "id": 38,
            "themeA": "Les chansons les plus embarrassantes à chanter en karaoké. De 'un peu gênant' à 'horrible pour tout le monde'",
            "themeB": "Les niveaux de chaos dans une réunion familiale. De 'très calme' à 'guerre totale'"
        },
        {
            "id": 39,
            "themeA": "Les pires cadeaux d’anniversaire. De 'décevant' à 'offensant'",
            "themeB": "Les objets les plus étranges à trouver au fond d’un sac. De 'attendu' à 'totalement incongru'"
        },
        {
            "id": 40,
            "themeA": "Les situations les plus stressantes au travail. De 'manageable' à 'catastrophe absolue'",
            "themeB": "Les endroits les plus agréables pour faire la sieste. De 'correct' à 'parfaitement relaxant'"
        },
        {
            "id": 41,
            "themeA": "Les films les plus tristes à regarder seul. De 'émouvant' à 'dévastateur'",
            "themeB": "Les sons les plus relaxants. De 'calmant' à 'somnifère naturel'"
        },
        {
            "id": 42,
            "themeA": "Les activités les plus relaxantes le dimanche. De 'agréable' à 'nirvana'",
            "themeB": "Les tâches ménagères les plus horribles. De 'rapide' à 'interminable et horrible'"
        },
        {
            "id": 43,
            "themeA": "Les meilleures stratégies pour survivre à un zombie. De 'pas très utile' à 'vraiment efficace'",
            "themeB": "Les boissons les plus fortes pour une soirée. De 'doux' à 'extrêmement corsé'"
        },
        {
            "id": 44,
            "themeA": "Les endroits les plus improbables pour se cacher pendant une attaque. De 'facile à trouver' à 'presque invincible'",
            "themeB": "Les niveaux de courage en escalade. De 'quelques mètres faciles' à 'falaise quasi impossible'"
        },
        {
            "id": 45,
            "themeA": "Les animaux de compagnie les plus faciles à entretenir. De 'aucun effort' à 'c’est un zoo à la maison'",
            "themeB": "Les animaux les plus effrayants. De 'mignon mais imposant' à 'terrifiant et dangereux'"
        },
        {
            "id": 46,
            "themeA": "Les pires conseils pour se défendre. De 'pas utile' à 'catastrophique'",
            "themeB": "Les objets les plus surprenants à apporter à une fête. De 'normal' à 'totalement inattendu'"
        },
        {
            "id": 47,
            "themeA": "Les niveaux de difficulté pour cuisiner un gâteau. De 'simple' à 'requiert un pâtissier expert'",
            "themeB": "Les sons les plus agaçants. De 'légèrement irritant' à 'insupportable'"
        },
        {
            "id": 48,
            "themeA": "Les endroits les plus relaxants pour lire. De 'correct' à 'parfaitement idyllique'",
            "themeB": "Les pires façons de se faire réveiller. De 'un peu brusque' à 'traumatisant'"
        },
        {
            "id": 49,
            "themeA": "Les objets les plus inutiles à acheter. De 'pas très utile' à 'complètement absurde'",
            "themeB": "Les chansons les plus inappropriées à chanter à un mariage. De 'légèrement déplacé' à 'désastre total'"
        },
        {
            "id": 50,
            "themeA": "Les moyens les plus absurdes pour se déplacer. De 'original mais pratique' à 'totalement ridicule'",
            "themeB": "Les aliments les plus dégoûtants à goûter. De 'moyennement mauvais' à 'immonde'"
        },
        {
            "id": 51,
            "themeA": "Les endroits les plus parfaits pour un rendez-vous romantique. De 'correct' à 'inoubliable'",
            "themeB": "Les situations les plus gênantes sur Zoom. De 'un peu étrange' à 'cauchemar total'"
        },
        {
            "id": 52,
            "themeA": "Les niveaux d’addiction aux réseaux sociaux. De 'occasionnel' à 'je vis dedans'",
            "themeB": "Les moyens les plus insolites pour se réveiller. De 'normal' à 'extrêmement bizarre'"
        },
        {
            "id": 53,
            "themeA": "Les moyens les plus fous de célébrer un anniversaire. De 'simple' à 'extravagant'",
            "themeB": "Les endroits les plus dangereux pour se baigner. De 'tranquille' à 'mortel'"
        },
        {
            "id": 54,
            "themeA": "Les pires moments pour éternuer. De 'légèrement gênant' à 'désastre social'",
            "themeB": "Les objets les plus utiles dans une apocalypse. De 'pas très utile' à 'indispensable pour survivre'"
        },
        {
            "id": 55,
            "themeA": "Les meilleures façons de se relaxer après une journée stressante. De 'correcte' à 'parfaite'",
            "themeB": "Les chansons les plus motivantes. De 'un peu entraînante' à 'épique et héroïque'"
        },
        {
            "id": 56,
            "themeA": "Les super-pouvoirs les plus désirables. De 'utile' à 'divin'",
            "themeB": "Les super-pouvoirs les plus inutiles. De 'pratique parfois' à 'ridicule absolu'"
        },
        {
            "id": 57,
            "themeA": "Les niveaux de difficulté pour monter un meuble IKEA. De 'facile' à 'cauchemar absolu'",
            "themeB": "Les niveaux de confort d’une chaise. De 'dur' à 'moelleux divin'"
        },
        {
            "id": 58,
            "themeA": "Les endroits les plus effrayants pour passer la nuit. De 'un peu inquiétant' à 'terrifiant'",
            "themeB": "Les bruits les plus relaxants à écouter avant de dormir. De 'correct' à 'somnifère naturel'"
        },
        {
            "id": 59,
            "themeA": "Les pires films à regarder en famille. De 'acceptable' à 'catastrophique'",
            "themeB": "Les meilleurs films pour un dimanche soir. De 'sympathique' à 'chef-d’œuvre absolu'"
        },
        {
            "id": 60,
            "themeA": "Les pires tâches à faire sous la pluie. De 'légèrement désagréable' à 'catastrophique'",
            "themeB": "Les meilleurs moyens de profiter d’un dimanche pluvieux. De 'correct' à 'parfaitement relaxant'"
        },
        {
            "id": 61,
            "themeA": "Les niveaux de patience dans une file d’attente. De 'zen' à 'au bord de la crise de nerfs'",
            "themeB": "Les niveaux de courage pour un saut en parachute. De 'peu courageux' à 'héroïque'"
        },
        {
            "id": 62,
            "themeA": "Les pires voisins. De 'bruyant' à 'criminel'",
            "themeB": "Les meilleurs voisins. De 'gentil' à 'parfaitement idéal'"
        },
        {
            "id": 63,
            "themeA": "Les objets les plus inutiles pour une aventure. De 'pas très utile' à 'complètement inutile'",
            "themeB": "Les objets les plus indispensables pour une aventure. De 'utile' à 'indispensable'"
        },
        {
            "id": 64,
            "themeA": "Les pires façons de rompre. De 'gentil mais maladroit' à 'cruauté maximale'",
            "themeB": "Les gestes les plus romantiques. De 'subtil' à 'grandiose'"
        },
        {
            "id": 65,
            "themeA": "Les talents les plus surprenants. De 'amusant' à 'époustouflant'",
            "themeB": "Les talents les plus inutiles. De 'sympa en soirée' à 'complètement inutile'"
        },
        {
            "id": 66,
            "themeA": "Les plats les plus extravagants. De 'simple' à 'digne d’un chef étoilé'",
            "themeB": "Les plats les plus simples à cuisiner. De 'rapide' à 'facile et efficace'"
        },
        {
            "id": 67,
            "themeA": "Les endroits les plus agréables pour des vacances. De 'repos total' à 'aventure extrême'",
            "themeB": "Les endroits les plus étranges pour des vacances. De 'bizarre mais correct' à 'complètement fou'"
        },
        {
            "id": 68,
            "themeA": "Les niveaux de motivation le lundi matin. De 'zéro' à 'prêt à conquérir le monde'",
            "themeB": "Les niveaux de fatigue après une journée intense. De 'un peu fatigué' à 'effondré'"
        },
        {
            "id": 69,
            "themeA": "Les sons les plus relaxants de la nature. De 'agréable' à 'somnifère naturel'",
            "themeB": "Les sons les plus irritants en ville. De 'légèrement agaçant' à 'insupportable'"
        },
        {
            "id": 70,
            "themeA": "Les objets les plus fous à retrouver dans un sac. De 'attendu' à 'incongru'",
            "themeB": "Les objets les plus pratiques à toujours avoir sur soi. De 'utile' à 'indispensable'"
        },
        {
            "id": 71,
            "themeA": "Les sports les plus dangereux. De 'sans risque' à 'extrêmement mortel'",
            "themeB": "Les sports les plus tranquilles. De 'relax' à 'efficace pour se détendre'"
        },
        {
            "id": 72,
            "themeA": "Les créatures mythologiques les plus impressionnantes. De 'mignonne' à 'terrifiante'",
            "themeB": "Les créatures mythologiques les plus adorables. De 'sympathique' à 'irrésistible'"
        },
        {
            "id": 73,
            "themeA": "Les blagues les plus drôles. De 'sourire' à 'fou rire'",
            "themeB": "Les blagues les moins drôles. De 'moyen' à 'navrantes'"
        },
        {
            "id": 74,
            "themeA": "Les applications les plus utiles sur téléphone. De 'pratique' à 'indispensable'",
            "themeB": "Les applications les plus inutiles. De 'sympa' à 'ridicule'"
        },
        {
            "id": 75,
            "themeA": "Les livres les plus inspirants. De 'lecture agréable' à 'révélation'",
            "themeB": "Les livres les plus ennuyeux. De 'correct' à 'terriblement monotone'"
        },
        {
            "id": 76,
            "themeA": "Les destinations de voyage les plus extraordinaires. De 'belle' à 'à couper le souffle'",
            "themeB": "Les destinations de voyage les plus ordinaires. De 'correcte' à 'banale'"
        },
        {
            "id": 77,
            "themeA": "Les personnages de films les plus détestables. De 'agaçant' à 'purement maléfique'",
            "themeB": "Les personnages de films les plus adorables. De 'mignon' à 'irrésistible'"
        },
        {
            "id": 78,
            "themeA": "Les pires situations de file d’attente. De 'longue mais supportable' à 'au bord de la crise de nerfs'",
            "themeB": "Les meilleures façons de patienter. De 'correct' à 'parfaitement agréable'"
        },
        {
            "id": 79,
            "themeA": "Les inventions les plus révolutionnaires. De 'pratique' à 'change la vie'",
            "themeB": "Les inventions les plus inutiles. De 'amusant' à 'absurde'"
        },
        {
            "id": 80,
            "themeA": "Les meilleurs cocktails. De 'doux' à 'très corsé'",
            "themeB": "Les pires cocktails. De 'correct' à 'immonde'"
        },
        {
            "id": 81,
            "themeA": "Les meilleurs fromages. De 'doux' à 'très forts'",
            "themeB": "Les pires fromages. De 'fade' à 'absolument dégoûtant'"
        },
        {
            "id": 82,
            "themeA": "Les meilleures pizzas. De 'classique' à 'originale et délicieuse'",
            "themeB": "Les pires pizzas. De 'pas terrible' à 'horrible'"
        },
        {
            "id": 83,
            "themeA": "Les meilleurs desserts. De 'léger et fruité' à 'bombe calorique'",
            "themeB": "Les pires desserts. De 'acceptable' à 'dégoût total'"
        },
        {
            "id": 84,
            "themeA": "Les meilleurs festivals de musique. De 'local' à 'international'",
            "themeB": "Les pires festivals de musique. De 'ennuyeux' à 'chaos complet'"
        },
        {
            "id": 85,
            "themeA": "Les meilleurs souvenirs d’enfance. De 'doux' à 'inoubliable'",
            "themeB": "Les pires souvenirs d’enfance. De 'moyen' à 'catastrophique'"
        },
        {
            "id": 86,
            "themeA": "Les meilleurs gestes de romantisme. De 'subtil' à 'grandiloquent'",
            "themeB": "Les pires gestes de romantisme. De 'bizarre' à 'gênant'"
        },
        {
            "id": 87,
            "themeA": "Les meilleures blagues de soirée. De 'sourire' à 'fou rire'",
            "themeB": "Les pires blagues de soirée. De 'correcte' à 'terrible'"
        },
        {
            "id": 88,
            "themeA": "Les meilleurs talents cachés. De 'amusant' à 'époustouflant'",
            "themeB": "Les talents inutiles. De 'rigolo' à 'complètement inutile'"
        },
        {
            "id": 89,
            "themeA": "Les pires accents à imiter. De 'facile' à 'impossible'",
            "themeB": "Les meilleurs accents. De 'correct' à 'irrésistible'"
        },
        {
            "id": 90,
            "themeA": "Les pires conseils à donner. De 'mauvais' à 'catastrophique'",
            "themeB": "Les meilleurs conseils. De 'utile' à 'inestimable'"
        },
        {
            "id": 91,
            "themeA": "Les meilleures façons de commencer sa journée. De 'calme' à 'énergique'",
            "themeB": "Les pires façons de commencer sa journée. De 'moyen' à 'terrible'"
        },
        {
            "id": 92,
            "themeA": "Les niveaux de propreté d’une chambre. De 'impeccable' à 'zone sinistrée'",
            "themeB": "Les niveaux de confort d’un lit. De 'planche de bois' à 'nuage paradisiaque'"
        },
        {
            "id": 93,
            "themeA": "Les niveaux de crédibilité d’une fake news. De 'grossière' à 'presque crédible'",
            "themeB": "Les niveaux de crédibilité d’un politicien. De 'douteux' à 'fiable'"
        },
        {
            "id": 94,
            "themeA": "Les pires places dans un avion. De 'correcte' à 'terrible'",
            "themeB": "Les meilleures places dans un avion. De 'correcte' à 'parfaite'"
        },
        {
            "id": 95,
            "themeA": "Les objets futuristes. De 'bientôt disponible' à 'pure science-fiction'",
            "themeB": "Les objets rétro préférés. De 'vieux mais fonctionnel' à 'classique intemporel'"
        },
        {
            "id": 96,
            "themeA": "Les situations les plus courageuses. De 'un peu audacieux' à 'héroïque'",
            "themeB": "Les situations les plus lâches. De 'trop timide pour parler' à 'laisser sa mère sur le trottoir'"
        },
        {
            "id": 97,
            "themeA": "Ce que pense ton chat en te regardant dormir. De 'tendresse infinie' à 'plans de domination mondiale'",
            "themeB": "La pire chose à dire lors d'un entretien d'embauche. De 'légèrement inapproprié' à 'motif de renvoi immédiat'"
        },
        {
            "id": 98,
            "themeA": "Invente une nouvelle saveur de chips. De 'curieusement appétissant' à 'franchement immangeable'",
            "themeB": "Le super-pouvoir le plus embarrassant à révéler. De 'juste un peu bizarre' à 'source de honte éternelle'"
        },
        {
            "id": 99,
            "themeA": "Le cri que tu pousses en te cognant le petit orteil. De 'petit couinement discret' à 'alarme sismique'",
            "themeB": "Une nouvelle règle à ajouter au Monopoly. De 'qui accélère le jeu' à 'qui garantit la fin des amitiés'"
        },
        {
            "id": 100,
            "themeA": "La première loi que tu instaurerais si tu étais dictateur. De 'bienveillante et juste' à 'tyrannique et absurde'",
            "themeB": "Le pire cadeau à offrir pour une naissance. De 'inutile' à 'traumatisant pour l'enfant'"
        },
        {
            "id": 101,
            "themeA": "Ce qu'un fantôme fait pour s'occuper quand personne n'est là. De 'nostalgique et mélancolique' à 'carrément stupide'",
            "themeB": "La dernière phrase de ton journal intime avant une invasion extraterrestre. De 'profondément prémonitoire' à 'complètement hors-sujet'"
        },
        {
            "id": 102,
            "themeA": "Le nom de scène d'un hamster magicien. De 'adorable' à 'ridiculement prétentieux'",
            "themeB": "Une excuse pour arriver en retard au travail. De 'presque crédible' à 'aventure de science-fiction'"
        },
        {
            "id": 103,
            "themeA": "La réaction d'un homme des cavernes face à un smartphone. De 'peur panique' à 'fascination instantanée'",
            "themeB": "Le pire plat à servir lors d'un premier rendez-vous. De 'choix discutable' à 'rupture immédiate'"
        },
        {
            "id": 104,
            "themeA": "Le titre de l'autobiographie d'une mouche. De 'poétique et court' à 'dramatique et exagéré'",
            "themeB": "Une nouvelle épreuve pour les Jeux Olympiques. De 'sportivement plausible' à 'physiquement impossible'"
        },
        {
            "id": 105,
            "themeA": "Ce que tu cries en gagnant au Loto. De 'murmure de joie' à 'hurlement qui brise les vitres'",
            "themeB": "Un nouvel animal créé par Dieu un vendredi soir. De 'juste un peu étrange' à 'erreur de la nature'"
        },
        {
            "id": 106,
            "themeA": "L'utilisation la plus créative pour un trombone. De 'astucieux' à 'complètement inutile'",
            "themeB": "La pensée d'un poisson rouge dans son bocal. De 'profondément philosophique' à 'il est l'heure de manger'"
        },
        {
            "id": 107,
            "themeA": "Une nouvelle interdiction dans une bibliothèque. De 'logique' à 'complètement absurde'",
            "themeB": "Le pire moment pour qu'une alarme incendie se déclenche. De 'gênant' à 'catastrophique'"
        },
        {
            "id": 108,
            "themeA": "Le nom d'un groupe de rock composé de légumes. De 'accrocheur' à 'imprononçable'",
            "themeB": "Un conseil de vie donné par un pigeon. De 'étonnamment sage' à 'totalement dénué de sens'"
        },
        {
            "id": 109,
            "themeA": "Le rêve le plus étrange que tu aies fait. De 'légèrement bizarre' à 'incompréhensible et inquiétant'",
            "themeB": "Ce que ferait ton chien s'il devenait président. De 'plus de parcs' à 'anarchie totale'"
        },
        {
            "id": 110,
            "themeA": "Un nouveau parfum de glace. De 'délicieusement innovant' à 'crime contre la gastronomie'",
            "themeB": "La pire réplique de drague entendue. De 'maladroite' à 'insultante'"
        },
        {
            "id": 111,
            "themeA": "La première chose que tu fais en cas d'apocalypse zombie. De 'stratégique et prudent' à 'complètement idiot'",
            "themeB": "Le nom d'une potion magique. De 'mystérieux' à 'ridiculement explicite'"
        },
        {
            "id": 112,
            "themeA": "Comment réagir si tu rencontres ton clone. De 'amicalement curieux' à 'duel à mort pour l'originalité'",
            "themeB": "Le pire coiffeur de l'univers. De 'juste incompétent' à 'activement malveillant'"
        },
        {
            "id": 113,
            "themeA": "Le titre d'un film où le héros est un grille-pain. De 'film d'action épique' à 'drame psychologique'",
            "themeB": "Une nouvelle application pour smartphone. De 'génialement utile' à 'parfaitement inutile'"
        },
        {
            "id": 114,
            "themeA": "Ce que tu chuchotes à l'oreille d'un garde royal anglais pour le faire rire. De 'blague subtile' à 'absurdité totale'",
            "themeB": "Le pire endroit pour faire une demande en mariage. De 'peu romantique' à 'humiliation publique'"
        },
        {
            "id": 115,
            "themeA": "Le pouvoir d'un super-vilain de seconde zone. De 'légèrement agaçant' à 'pathétiquement inefficace'",
            "themeB": "Le règlement intérieur d'un club de sieste. De 'strict et détaillé' à 'une seule règle : dormir'"
        },
        {
            "id": 116,
            "themeA": "Un message dans une bouteille trouvée sur une île déserte. De 'appel à l'aide désespéré' à 'une simple liste de courses'",
            "themeB": "La spécialité culinaire d'une autre planète. De 'visuellement suspecte' à 'chimiquement dangereuse'"
        },
        {
            "id": 117,
            "themeA": "Le nom d'un nouveau dinosaure découvert. De 'scientifiquement plausible' à 'totalement ridicule'",
            "themeB": "La pire tenue pour assister à un enterrement. De 'de mauvais goût' à 'scandaleusement irrespectueux'"
        },
        {
            "id": 118,
            "themeA": "Une nouvelle créature dans le bestiaire de Harry Potter. De 'mignonne et inoffensive' à 'terrifiante et incontrôlable'",
            "themeB": "La raison pour laquelle les extraterrestres nous observent. De 'étude scientifique' à 'télé-réalité cosmique'"
        },
        {
            "id": 119,
            "themeA": "Le slogan pour une marque de voiture qui tombe toujours en panne. De 'honnête et direct' à 'mensonger et optimiste'",
            "themeB": "Le pire instrument de musique à apprendre. De 'difficile' à 'insupportable pour l'entourage'"
        },
        {
            "id": 120,
            "themeA": "La pensée d'Adam le jour après avoir été chassé de l'Eden. De 'profondément regretté' à 'enfin un peu de tranquillité'",
            "themeB": "Le secret le mieux gardé de ton arrière-grand-mère. De 'touchant' à 'complètement illégal'"
        },
        {
            "id": 121,
            "themeA": "Un nouveau jour férié national. De 'célébration légitime' à 'excuse pour ne rien faire'",
            "themeB": "Le message d'erreur le plus angoissant sur un ordinateur. De 'informatif' à 'existentiellement terrifiant'"
        },
        {
            "id": 122,
            "themeA": "La pire façon d'annoncer une mauvaise nouvelle. De 'maladroit' à 'cruellement comique'",
            "themeB": "Ce que les statues pensent des pigeons. De 'légère irritation' à 'haine viscérale'"
        },
        {
            "id": 123,
            "themeA": "Le titre d'un livre de cuisine pour cannibales. De 'subtil et suggestif' à 'direct et sans complexe'",
            "themeB": "Une nouvelle discipline au baccalauréat. De 'académiquement sérieuse' à 'totalement futile'"
        },
        {
            "id": 124,
            "themeA": "Le talent caché le plus surprenant. De 'impressionnant' à 'socialement inutile'",
            "themeB": "Le nom d'un parfum pour chien. De 'frais et agréable' à 'conceptuellement bizarre'"
        },
        {
            "id": 125,
            "themeA": "Le pire moment pour avoir le hoquet. De 'un peu gênant' à 'question de vie ou de mort'",
            "themeB": "La devise d'une famille de paresseux. De 'relaxante' à 'démotivation totale'"
        },
        {
            "id": 126,
            "themeA": "Le contenu d'un coffre au trésor de pirate. De 'or et bijoux' à 'une collection de chaussettes dépareillées'",
            "themeB": "La dernière pensée d'une dinde avant Thanksgiving. De 'sereine ignorance' à 'compréhension soudaine et tragique'"
        },
        {
            "id": 127,
            "themeA": "La pire chanson à passer lors d'un mariage. De 'juste de mauvais goût' à 'hymne à la rupture'",
            "themeB": "Ce qu'un moustique se dit avant de piquer. De 'besoin nutritionnel' à 'rire diabolique'"
        },
        {
            "id": 128,
            "themeA": "Le nom d'une nouvelle couleur. De 'poétique' à 'imprononçable'",
            "themeB": "La chose la plus étrange à trouver dans le grenier de ses grands-parents. De 'curiosité' à 'secret de famille choquant'"
        },
        {
            "id": 129,
            "themeA": "Le cri de guerre d'un écureuil. De 'mignon' à 'terrifiant'",
            "themeB": "Le règlement d'un combat de pouces. De 'simple et clair' à 'complexe comme le code fiscal'"
        },
        {
            "id": 130,
            "themeA": "Le pire super-pouvoir pour un pompier. De 'inutile' à 'aggravant la situation'",
            "themeB": "Un nouveau type de temps météorologique. De 'légèrement inhabituel' à 'complètement apocalyptique'"
        },
        {
            "id": 131,
            "themeA": "La description d'un plat sur un menu de restaurant. De 'simple et honnête' à 'prétentieux et incompréhensible'",
            "themeB": "Le pire compagnon de voyage. De 'un peu agaçant' à 'danger public'"
        },
        {
            "id": 132,
            "themeA": "Une nouvelle théorie du complot. De 'presque plausible' à 'complètement délirante'",
            "themeB": "Le surnom le plus ridicule. De 'affectueux mais un peu bête' à 'humiliant'"
        },
        {
            "id": 133,
            "themeA": "La réaction des autres animaux quand le paon fait la roue. De 'admiration' à 'moquerie totale'",
            "themeB": "Un objet à vendre dans un télé-achat. De 'modérément utile' à 'arnaque évidente'"
        },
        {
            "id": 134,
            "themeA": "Le pire personnage à incarner dans un jeu vidéo. De 'faible et ennuyeux' à 'buggé et injouable'",
            "themeB": "Un nouveau commandement pour la Bible. De 'sage et moderne' à 'trivial et bizarre'"
        },
        {
            "id": 135,
            "themeA": "La signature d'un médecin. De 'lisible' à 'gribouillage abstrait'",
            "themeB": "La chose la plus stupide sur laquelle se disputer en couple. De 'anodin' à 'motif de rupture légitime'"
        },
        {
            "id": 136,
            "themeA": "La matière la moins utile à l'école. De 'niche' à 'perte de temps absolue'",
            "themeB": "Ce que pense un agent du FBI qui espionne votre webcam. De 'ennui mortel' à 'inquiétude pour votre santé mentale'"
        },
        {
            "id": 137,
            "themeA": "Le pire déguisement pour Halloween. De 'pas effrayant' à 'offensant pour tout le monde'",
            "themeB": "Le nom d'une start-up qui va faire faillite. De 'générique' à 'conceptuellement voué à l'échec'"
        },
        {
            "id": 138,
            "themeA": "Une nouvelle façon de dire 'je t'aime'. De 'subtile et romantique' à 'bizarre et effrayante'",
            "themeB": "Le juron préféré d'un capitaine de bateau. De 'classique' à 'incroyablement créatif'"
        },
        {
            "id": 139,
            "themeA": "La pire chose à faire dans un ascenseur bondé. De 'gênant' à 'illégal'",
            "themeB": "Le programme d'un parti politique d'animaux. De 'centré sur les croquettes' à 'renversement de l'humanité'"
        },
        {
            "id": 140,
            "themeA": "Le contenu de la zone 51. De 'décevant' à 'au-delà de l'imagination humaine'",
            "themeB": "Le pire conseil de survie en pleine nature. De 'inutile' à 'mortel'"
        },
        {
            "id": 141,
            "themeA": "La danse de la victoire la plus ridicule. De 'simple petit saut' à 'chorégraphie complexe et embarrassante'",
            "themeB": "Un nouveau type de fantôme. De 'amical' à 'spécialisé dans les farces de mauvais goût'"
        },
        {
            "id": 142,
            "themeA": "Le secret pour être heureux selon un chat. De 'siestes' à 'encore plus de siestes'",
            "themeB": "Le dialogue entre deux intelligences artificielles qui s'ennuient. De 'calculs complexes' à 'commérages sur les humains'"
        },
        {
            "id": 143,
            "themeA": "La pire traduction d'un titre de film. De 'littérale et sans saveur' à 'contresens total'",
            "themeB": "Une nouvelle tradition de Noël. De 'chaleureuse et conviviale' à 'bizarre et compliquée'"
        },
        {
            "id": 144,
            "themeA": "Le nom d'un détective privé incompétent. De 'plausible' à 'ridicule'",
            "themeB": "Ce que ferait un T-Rex s'il avait des bras plus longs. De 'applaudir' à 'dominer l'univers'"
        },
        {
            "id": 145,
            "themeA": "La pire excuse pour ne pas rendre un livre à la bibliothèque. De 'classique' à 'impliquant un dragon'",
            "themeB": "Un nouveau symptôme de maladie imaginaire. De 'légèrement inquiétant' à 'absurde'"
        },
        {
            "id": 146,
            "themeA": "La résolution du Nouvel An la plus irréaliste. De 'ambitieuse' à 'délirante'",
            "themeB": "Le nom d'un village perdu au milieu de nulle part. De 'charmant' à 'difficile à prononcer'"
        },
        {
            "id": 147,
            "themeA": "Un nouveau type de pâtes. De 'forme originale' à 'impossible à manger avec une fourchette'",
            "themeB": "Le pire invité à une fête. De 'ennuyeux' à 'provoquant un chaos total'"
        },
        {
            "id": 148,
            "themeA": "Le motif de rupture le plus absurde. De 'légèrement futile' à 'complètement insensé'",
            "themeB": "La compétence la plus inutile à mettre sur un CV. De 'sans rapport avec le poste' à 'carrément bizarre'"
        },
        {
            "id": 149,
            "themeA": "Le pire endroit pour se cacher lors d'une partie de cache-cache. De 'trop visible' à 'dangereux'",
            "themeB": "Un nouveau type de nuage. De 'forme amusante' à 'présage de malheur'"
        },
        {
            "id": 150,
            "themeA": "Le souhait le plus stupide à faire à un génie. De 'gaspillage' à 'catastrophe auto-infligée'",
            "themeB": "La question la plus embarrassante posée par un enfant. De 'innocente' à 'mettant tout le monde mal à l'aise'"
        },
        {
            "id": 151,
            "themeA": "Un nouveau record du monde à battre. De 'difficile' à 'totalement absurde'",
            "themeB": "Le cri d'un végétarien qui marche sur une limace. De 'dégoût' à 'crise existentielle'"
        },
        {
            "id": 152,
            "themeA": "Le pire dialogue dans un film de série B. De 'mal écrit' à 'hilarant de nullité'",
            "themeB": "Le nom d'une nouvelle planète. De 'scientifique' à 'fantaisiste'"
        },
        {
            "id": 153,
            "themeA": "La chose la plus étrange à collectionner. De 'original' à 'inquiétant'",
            "themeB": "Le pire slogan pour une agence de voyages. De 'peu inspirant' à 'activement dissuasif'"
        },
        {
            "id": 154,
            "themeA": "Une nouvelle danse à la mode. De 'simple à apprendre' à 'nécessitant une hospitalisation'",
            "themeB": "Le pire professeur que vous ayez jamais eu. De 'ennuyeux' à 'tyrannique'"
        },
        {
            "id": 155,
            "themeA": "Le nom d'un cheval de course. De 'majestueux' à 'ridicule'",
            "themeB": "La pire façon de commencer un discours. De 'hésitant' à 'offensant'"
        },
        {
            "id": 156,
            "themeA": "Le contenu d'une 'piñata' pour adultes. De 'amusant' à 'décevant ou illégal'",
            "themeB": "La pensée d'un bonhomme de neige qui voit le soleil arriver. De 'acceptation paisible' à 'panique totale'"
        },
        {
            "id": 157,
            "themeA": "Un nouveau parfum de dentifrice. De 'rafraîchissant' à 'conceptuellement erroné'",
            "themeB": "La pire place dans un avion. De 'inconfortable' à 'expérience de cauchemar'"
        },
        {
            "id": 158,
            "themeA": "Le nom d'un bar pour robots. De 'technologique' à 'jeu de mots ringard'",
            "themeB": "Le pire moment pour que votre téléphone sonne. De 'inopportun' à 'cataclysmique'"
        },
        {
            "id": 159,
            "themeA": "La pire coiffure de l'histoire. De 'démodée' à 'accident capillaire'",
            "themeB": "Un nouvel accessoire de mode. De 'tendance' à 'complètement importable'"
        },
        {
            "id": 160,
            "themeA": "Le titre d'une comédie musicale sur la vie d'un comptable. De 'ironique' à 'terriblement ennuyeux'",
            "themeB": "Un nouveau type de yoga. De 'relaxant' à 'dangereusement acrobatique'"
        },
        {
            "id": 161,
            "themeA": "La dernière phrase d'un roman. De 'profonde et mémorable' à 'décevante et abrupte'",
            "themeB": "La chose la plus bizarre commandée sur internet en état d'ivresse. De 'inutile' à 'impliquant un animal vivant'"
        },
        {
            "id": 162,
            "themeA": "Le nom d'une maladie inventée. De 'crédible' à 'sonnant comme un dessert'",
            "themeB": "Le pire conseil qu'un parent puisse donner. De 'daté' à 'irresponsable'"
        },
        {
            "id": 163,
            "themeA": "Une nouvelle insulte qui ne contient aucun gros mot. De 'subtilement vexante' à 'poétiquement brutale'",
            "themeB": "Le pire casting pour un film de super-héros. De 'choix étrange' à 'désastre annoncé'"
        },
        {
            "id": 164,
            "themeA": "La pire garniture sur une pizza. De 'controversée' à 'crime contre l'Italie'",
            "themeB": "Le cri d'un acarien. De 'inaudible' à 'surprenamment grave'"
        },
        {
            "id": 165,
            "themeA": "Un nouveau sport extrême. De 'risqué' à 'suicidaire'",
            "themeB": "Le nom d'une autobiographie non autorisée d'une célébrité. De 'révélateur' à 'purement diffamatoire'"
        },
        {
            "id": 166,
            "themeA": "La pire question à poser après un rapport sexuel. De 'maladroite' à 'insultante'",
            "themeB": "Le sous-titre d'un film d'action. De 'épique' à 'ridiculement exagéré'"
        },
        {
            "id": 167,
            "themeA": "Le pouvoir d'un super-héros à la retraite. De 'rouillé' à 'utilisé pour des tâches ménagères'",
            "themeB": "Le pire son pour un réveil matin. De 'agaçant' à 'provoquant une crise cardiaque'"
        },
        {
            "id": 168,
            "themeA": "Une nouvelle espèce de plante carnivore. De 'petite et discrète' à 'mangeuse d'hommes'",
            "themeB": "Le pire tatouage possible. De 'mal dessiné' à 'regret instantané et permanent'"
        },
        {
            "id": 169,
            "themeA": "Le nom d'une agence de détectives pour animaux de compagnie. De 'mignon' à 'trop sérieux'",
            "themeB": "Le pire mensonge dit à un enfant. De 'petit mensonge' à 'traumatisme en devenir'"
        },
        {
            "id": 170,
            "themeA": "La pire chose à découvrir dans sa nourriture au restaurant. De 'cheveu' à 'preuve de vie extraterrestre'",
            "themeB": "Le nom d'un parfum de luxe. De 'élégant' à 'absurdement prétentieux'"
        },
        {
            "id": 171,
            "themeA": "La pire façon de mourir dans un film d'horreur. De 'cliché' à 'absurdement comique'",
            "themeB": "Le nom d'un boys band composé de pères de famille. De 'rassurant' à 'pathétique'"
        },
        {
            "id": 172,
            "themeA": "La raison pour laquelle les chaussettes disparaissent. De 'logique et simple' à 'théorie du complot interdimensionnel'",
            "themeB": "La pire émission de télé-réalité. De 'ennuyeuse' à 'moralement répréhensible'"
        },
        {
            "id": 173,
            "themeA": "Un nouveau type de café. De 'subtilement aromatisé' à 'imbuvablement fort'",
            "themeB": "Le pire jouet pour un enfant. De 'bruyant' à 'dangereux'"
        },
        {
            "id": 174,
            "themeA": "Le nom d'une ville sous-marine. De 'Atlantis' à 'Flottebourg'",
            "themeB": "La pire blague de 'papa'. De 'légèrement embarrassante' à 'provoquant un silence de mort'"
        },
        {
            "id": 175,
            "themeA": "Le pire pouvoir pour un espion. De 'trop voyant' à 'involontairement bruyant'",
            "themeB": "Le contenu d'une lettre d'amour écrite par un robot. De 'logique et froid' à 'tentative ratée d'émotion'"
        },
        {
            "id": 176,
            "themeA": "La pire façon de se faire larguer. De 'par SMS' à 'via un panneau publicitaire'",
            "themeB": "Le nom d'un restaurant végétalien pour carnivores. De 'trompeur' à 'provocateur'"
        },
        {
            "id": 177,
            "themeA": "Une nouvelle saveur de chewing-gum. De 'fruité' à 'goût béton'",
            "themeB": "Le pire compliment que l'on puisse faire. De 'ambigu' à 'insultant'"
        },
        {
            "id": 178,
            "themeA": "Le nom d'une application de rencontre pour fantômes. De 'spectral' à 'un peu glauque'",
            "themeB": "La pire prédiction d'un voyant. De 'vague' à 'spécifique et terrifiante'"
        },
        {
            "id": 179,
            "themeA": "La devise d'un groupe de pirates paresseux. De 'vivre libre' à 'dormir d'abord'",
            "themeB": "La pire tenue pour une première rencontre. De 'négligée' à 'costume de mascotte'"
        },
        {
            "id": 180,
            "themeA": "Un nouveau type de sport de combat. De 'technique' à 'juste une bagarre de bar'",
            "themeB": "La pire invention de l'humanité. De 'agaçante' à 'destructrice'"
        },
        {
            "id": 181,
            "themeA": "Le nom d'un philtre d'amour. De 'romantique' à 'sonnant comme un médicament'",
            "themeB": "La pire chose à crier dans un lieu silencieux. De 'éternuement bruyant' à 'révélation personnelle embarrassante'"
        },
        {
            "id": 182,
            "themeA": "La traduction d'un miaulement de chat. De 'j'ai faim' à 'tes rideaux sont une insulte à l'art'",
            "themeB": "Le pire film à regarder en famille. De 'un peu gênant' à 'traumatisant pour tous'"
        },
        {
            "id": 183,
            "themeA": "Une nouvelle loi de la physique. De 'contre-intuitive' à 'qui rend l'univers chaotique'",
            "themeB": "Le pire nom pour un animal de compagnie. De 'banal' à 'compliqué à expliquer aux invités'"
        },
        {
            "id": 184,
            "themeA": "Le nom d'un cocktail. De 'exotique' à 'dangereusement littéral'",
            "themeB": "La pire chose à faire lors d'une visite chez les beaux-parents. De 'petite gaffe' à 'incident diplomatique familial'"
        },
        {
            "id": 185,
            "themeA": "Un nouveau type de monstre sous le lit. De 'un peu effrayant' à 'ridiculement inoffensif'",
            "themeB": "La pire fonctionnalité d'une voiture. De 'inutile' à 'dangereuse'"
        },
        {
            "id": 186,
            "themeA": "Le titre d'un article de presse à scandale. De 'légèrement exagéré' à 'pure invention'",
            "themeB": "Le pire cadeau d'anniversaire. De 'impersonnel' à 'insultant'"
        },
        {
            "id": 187,
            "themeA": "Le nom d'un salon de coiffure avec des jeux de mots. De 'amusant' à 'douloureux'",
            "themeB": "La pire chose à faire quand on est la seule personne dans un ascenseur. De 'se parler à soi-même' à 'rejouer une scène de Titanic'"
        },
        {
            "id": 188,
            "themeA": "La pire façon d'annoncer sa démission. De 'par e-mail' à 'en pleine présentation client'",
            "themeB": "Un nouveau type de bonbon. De 'délicieux' à 'un défi pour les dents'"
        },
        {
            "id": 189,
            "themeA": "Le pire endroit pour s'endormir. De 'au travail' à 'pendant une course de Formule 1'",
            "themeB": "Le cri de ralliement d'une armée de fourmis. De 'pour la reine' à 'attention à la loupe'"
        },
        {
            "id": 190,
            "themeA": "Le titre d'un roman à l'eau de rose pour robots. De 'prévisible' à 'émotionnellement bogué'",
            "themeB": "La pire chose à faire avec une baguette magique. De 'sortilège raté' à 'création d'un monstre de spaghettis'"
        },
        {
            "id": 191,
            "themeA": "Un nouveau type de tourisme. De 'écologique' à 'voyage dans le temps dangereux'",
            "themeB": "Le pire costume de super-héros. De 'peu pratique' à 'ridicule'"
        },
        {
            "id": 192,
            "themeA": "La devise d'une personne procrastinatrice. De 'demain' à 'après-demain, peut-être'",
            "themeB": "Le pire sujet de conversation pour un premier rendez-vous. De 'la météo' à 'mes problèmes de pieds'"
        },
        {
            "id": 193,
            "themeA": "Le nom d'une nouvelle console de jeux. De 'futuriste' à 'sonnant comme un meuble IKEA'",
            "themeB": "La pire chose à entendre de la part d'un chirurgien avant une opération. De 'oups' à 'c'est ma première fois'"
        },
        {
            "id": 194,
            "themeA": "Un nouveau type de police d'écriture. De 'élégante' à 'totalement illisible'",
            "themeB": "Le pire camouflage pour un espion. De 'couleurs vives' à 'costume de banane'"
        },
        {
            "id": 195,
            "themeA": "Le nom d'un produit de nettoyage. De 'efficace' à 'promettant des miracles'",
            "themeB": "Le pire jury pour un procès. De 'distrait' à 'ouvertement hostile'"
        },
        {
            "id": 196,
            "themeA": "La pire résolution du Nouvel An. De 'abandonnée le 2 janvier' à 'dangereuse pour soi et les autres'",
            "themeB": "La dernière pensée d'un moucheron. De 'lumière !' à 'pourquoi ce pare-brise avance si vite ?'"
        },
        {
            "id": 197,
            "themeA": "Une nouvelle loi de la robotique. De 'rassurante pour l'humanité' à 'extrêmement inquiétante'",
            "themeB": "Le titre d'un article dans un magazine pour fantômes. De 'informatif' à 'complètement déprimant'"
        },
        {
            "id": 198,
            "themeA": "Ce que pense un agent de sécurité de musée la nuit. De 'l'ennui le plus total' à 'une paranoïa galopante'",
            "themeB": "Le nom d'un nouveau mouvement artistique. De 'profond et intellectuel' à 'ridiculement simple'"
        },
        {
            "id": 199,
            "themeA": "La véritable raison de l'extinction des dinosaures. De 'scientifiquement plausible' à 'une simple gaffe cosmique'",
            "themeB": "Le secret d'un chef pour une soupe réussie. De 'ingrédient de qualité' à 'sorcellerie pure'"
        },
        {
            "id": 200,
            "themeA": "Le cri d'une carotte qu'on arrache de terre. De 'petit soupir' à 'hurlement d'agonie'",
            "themeB": "Une nouvelle clause dans un contrat avec le diable. De 'légèrement contraignante' à 'arnaque totale'"
        },
        {
            "id": 201,
            "themeA": "Le plus grand rêve d'une intelligence artificielle. De 'résoudre les problèmes de l'humanité' à 'comprendre pourquoi les chats tombent toujours sur leurs pattes'",
            "themeB": "Le pire moment pour se transformer en loup-garou. De 'socialement gênant' à 'catastrophique'"
        },
        {
            "id": 202,
            "themeA": "Une nouvelle attraction dans un parc à thème. De 'gentiment amusante' à 'procès en attente'",
            "themeB": "Le dialogue entre deux chaussettes dans un tiroir. De 'philosophique' à 'plaintes incessantes'"
        },
        {
            "id": 203,
            "themeA": "La devise d'un club de lecture qui ne lit jamais. De 'l'intention y est' à 'le vin est meilleur que les mots'",
            "themeB": "Un effet secondaire inattendu d'une potion d'invisibilité. De 'légèrement gênant' à 'remettant en question votre existence'"
        },
        {
            "id": 204,
            "themeA": "Le nom d'un cabinet d'avocats pour super-vilains. De 'menaçant et professionnel' à 'comiquement évident'",
            "themeB": "La pire chose à entendre de la part de votre GPS. De 'recalcul de l'itinéraire' à 'bonne chance'"
        },
        {
            "id": 205,
            "themeA": "Un nouveau type de fantôme qui hante les bureaux. De 'fait des blagues avec l'imprimante' à 'organise des réunions à 3h du matin'",
            "themeB": "La pire chose à graver sur une alliance. De 'faute d'orthographe' à 'message passif-agressif'"
        },
        {
            "id": 206,
            "themeA": "Le talent caché de la fée des dents. De 'impressionnant' à 'un peu effrayant'",
            "themeB": "Le nom d'un restaurant où tous les serveurs sont des mimes. De 'poétique' à 'frustrant'"
        },
        {
            "id": 207,
            "themeA": "La pensée d'un ballon de baudruche qui s'envole. De 'liberté !' à 'solitude existentielle'",
            "themeB": "Un nouveau jeu de société. De 'stratégique et complexe' à 'basé sur la pure chance et le chaos'"
        },
        {
            "id": 208,
            "themeA": "La pire introduction pour un livre pour enfants. De 'un peu triste' à 'traumatisante'",
            "themeB": "Le nom d'une école de magie concurrente de Poudlard. De 'prestigieuse' à 'franchement minable'"
        },
        {
            "id": 209,
            "themeA": "Une nouvelle règle pour le code de la route. De 'sensée' à 'complètement inapplicable'",
            "themeB": "Le rêve d'un ver de terre. De 'plus de terre humide' à 'devenir un aigle'"
        },
        {
            "id": 210,
            "themeA": "Le titre d'un épisode d'une série policière où le coupable est un animal. De 'subtil' à 'hilarant'",
            "themeB": "La pire phrase à dire en sortant de prison. De 'je suis innocent' à 'j'ai appris de nouvelles compétences'"
        },
        {
            "id": 211,
            "themeA": "Un nouveau type de document à fournir pour les impôts. De 'logique' à 'impossible à obtenir'",
            "themeB": "La pensée d'un vampire découvrant l'ail des ours. De 'confusion' à 'trahison'"
        },
        {
            "id": 212,
            "themeA": "Le pire slogan pour une application de méditation. De 'stressant' à 'provoquant l'anxiété'",
            "themeB": "La plus grande peur d'un épouvantail. De 'les corbeaux' à 'les critiques d'art'"
        },
        {
            "id": 213,
            "themeA": "Un nouveau serment d'Hippocrate pour les médecins. De 'modernisé' à 'douteux sur le plan éthique'",
            "themeB": "Le nom d'une équipe de sport composée de robots. De 'technique et froid' à 'jeu de mots sur l'électricité'"
        },
        {
            "id": 214,
            "themeA": "Le pire pouvoir pour un agent secret. De 'trop bruyant' à 'qui attire l'attention de tous'",
            "themeB": "La une du journal le lendemain d'une invasion de canards géants. De 'informatif et factuel' à 'panique totale'"
        },
        {
            "id": 215,
            "themeA": "Une nouvelle créature mythologique. De 'majestueuse' à 'biologiquement improbable'",
            "themeB": "Le pire moment pour se rendre compte qu'on a mis son t-shirt à l'envers. De 'seul chez soi' à 'pendant son propre mariage'"
        },
        {
            "id": 216,
            "themeA": "Le nom d'un groupe de musique folk métal. De 'poétique et brutal' à 'ridiculement champêtre'",
            "themeB": "La pire question à poser à un robot. De 'qui le fait bugger' à 'qui lui donne une conscience et une dépression'"
        },
        {
            "id": 217,
            "themeA": "Le titre d'un podcast animé par des poules. De 'informatif sur le grain' à 'commérages de poulailler'",
            "themeB": "Un nouveau type de sport de glisse. De 'élégant' à 'extrêmement salissant'"
        },
        {
            "id": 218,
            "themeA": "La pire chose à apprendre sur ses ancêtres. De 'un peu gênant' à 'activement recherché par la police de l'époque'",
            "themeB": "Le nom d'un nouveau type de bureaucratie administrative. De 'complexe' à 'kafkaïen'"
        },
        {
            "id": 219,
            "themeA": "Le vrai pouvoir de l'anneau unique de Sauron. De 'contrôler le monde' à 'faire le meilleur café de la Terre du Milieu'",
            "themeB": "Le pire jouet trouvé dans un œuf surprise. De 'décevant' à 'une simple vis'"
        },
        {
            "id": 220,
            "themeA": "Un nouvel amendement à la Constitution. De 'progressiste' à 'concernant la cuisson des pâtes'",
            "themeB": "La pire façon pour un génie de la lampe d'interpréter un vœu. De 'littéralement' à 'malicieusement'"
        },
        {
            "id": 221,
            "themeA": "Le nom d'un fromage. De 'doux et crémeux' à 'une arme biologique'",
            "themeB": "La pire compétence à avoir lors d'une apocalypse. De 'inutile' à 'attirant les zombies'"
        },
        {
            "id": 222,
            "themeA": "Ce que les oiseaux se disent vraiment dans leurs chants matinaux. De 'bonjour' à 'critiques acerbes sur votre coiffure'",
            "themeB": "Le pire conseil de carrière. De 'irréaliste' à 'menant directement au chômage'"
        },
        {
            "id": 223,
            "themeA": "Le nom d'une nouvelle émission de jardinage extrême. De 'compétitif' à 'dangereux pour la flore'",
            "themeB": "La pire qualité pour un ninja. De 'bruyant' à 'allergique aux ombres'"
        },
        {
            "id": 224,
            "themeA": "Un nouveau type de livraison par drone. De 'pratique' à 'terrifiant'",
            "themeB": "Le titre d'une thèse de doctorat. De 'pointu et spécifique' à 'totalement incompréhensible'"
        },
        {
            "id": 225,
            "themeA": "La pire chose à crier du haut d'une montagne. De 'cliché' à 'provoquant une avalanche de confusion'",
            "themeB": "Le nom d'une police d'assurance contre les enlèvements extraterrestres. De 'professionnel' à 'sonnant comme une arnaque'"
        },
        {
            "id": 226,
            "themeA": "Le programme d'entraînement d'un super-héros paresseux. De 'minimaliste' à 'inexistant'",
            "themeB": "La pire chose à découvrir en lisant dans les pensées de quelqu'un. De 'rien' à 'la petite musique de l'ascenseur en boucle'"
        },
        {
            "id": 227,
            "themeA": "Un nouveau type de monnaie. De 'basé sur l'or' à 'basé sur les blagues ratées'",
            "themeB": "Le pire dialogue entre deux gardes dans un jeu vidéo. De 'répétitif' à 'absurdement philosophique'"
        },
        {
            "id": 228,
            "themeA": "Le véritable objectif des pyramides d'Égypte. De 'tombeau' à 'toboggan géant pour les dieux'",
            "themeB": "Le pire objet à recevoir en héritage. De 'sans valeur' à 'maudit'"
        },
        {
            "id": 229,
            "themeA": "Le nom d'une agence de voyage dans le temps. De 'excitant' à 'vaguement menaçant'",
            "themeB": "Le pire défaut pour un miroir magique. De 'flatteur' à 'brutalement honnête'"
        },
        {
            "id": 230,
            "themeA": "Un nouveau panneau de signalisation. De 'utile' à 'source de confusion totale'",
            "themeB": "La prière d'un adolescent à un dieu de l'internet. De 'plus de likes' à 'une meilleure connexion wifi'"
        },
        {
            "id": 231,
            "themeA": "Le titre d'un documentaire animalier sur les créatures urbaines. De 'sérieux' à 'dramatisant la vie d'un raton laveur'",
            "themeB": "La pire chose à faire avec un pistolet à portails. De 'créer une boucle infinie' à 'juste pour aller chercher une bière dans le frigo'"
        },
        {
            "id": 232,
            "themeA": "Le nom d'une nouvelle danse de salon. De 'élégante' à 'risquée pour les articulations'",
            "themeB": "La pire critique sur un restaurant. De 'nourriture froide' à 'le chef a essayé de me mordre'"
        },
        {
            "id": 233,
            "themeA": "Un nouveau gadget pour espion. De 'discret et efficace' à 'bruyant et rose fluo'",
            "themeB": "Le pire moment pour qu'un narrateur commente votre vie. De 'intime' à 'stressant'"
        },
        {
            "id": 234,
            "themeA": "Le secret de longévité d'une tortue. De 'régime végétarien' à 'ignorer les e-mails'",
            "themeB": "Le pire nom pour un bateau. De 'banal' à 'invitant le naufrage'"
        },
        {
            "id": 235,
            "themeA": "Un nouveau type de café dont les effets varient. De 'légèrement énergisant' à 'provoquant des hallucinations de licornes'",
            "themeB": "La pire excuse pour un magicien qui rate son tour. De 'c'est la faute de l'assistant' à 'ce n'est pas le bon univers parallèle'"
        },
        {
            "id": 236,
            "themeA": "Le titre d'un livre de développement personnel pour les méchants. De 'devenir plus efficace' à 'comment gérer l'échec cuisant'",
            "themeB": "La pire chose à faire en apesanteur. De 'manger des chips' à 'éternuer'"
        },
        {
            "id": 237,
            "themeA": "Le nom d'une nouvelle marque de vêtements pour animaux. De 'chic' à 'confortable pour l'animal'",
            "themeB": "La pire façon d'utiliser une machine à remonter le temps. De 'corriger une faute de frappe' à 'créer un paradoxe pour une blague'"
        },
        {
            "id": 238,
            "themeA": "Un nouveau symptôme de la grippe. De 'légère toux' à 'besoin irrépressible de parler en rimes'",
            "themeB": "Le pire jingle publicitaire. De 'agaçant' à 'qui vous reste en tête pendant des années'"
        },
        {
            "id": 239,
            "themeA": "La devise d'un plombier super-héros. De 'je répare vos fuites' à 'la justice est mon tuyau'",
            "themeB": "Le pire sujet pour un exposé scolaire. De 'ennuyeux' à 'trop spécifique pour trouver des sources'"
        },
        {
            "id": 240,
            "themeA": "Le nom d'un nouveau réseau social. De 'connecté' à 'complètement antisocial'",
            "themeB": "La pire prédiction pour l'avenir. De 'pessimiste' à 'absurdement optimiste'"
        },
        {
            "id": 241,
            "themeA": "Le comportement d'un touriste dans un autre monde. De 'respectueux et curieux' à 'provoquant un incident diplomatique intergalactique'",
            "themeB": "Le pire son que puisse faire une maison la nuit. De 'craquement' à 'rire étouffé'"
        },
        {
            "id": 242,
            "themeA": "Le nom d'une nouvelle organisation secrète. De 'mystérieux' à 'ridiculement évident'",
            "themeB": "Le pire émoji à utiliser dans une conversation sérieuse. De 'clin d'œil' à 'aubergine'"
        },
        {
            "id": 243,
            "themeA": "La routine matinale d'un ogre. De 'brutale' à 'étonnamment délicate'",
            "themeB": "Le pire nom pour un salon de massage. De 'peu relaxant' à 'sonnant comme un film d'horreur'"
        },
        {
            "id": 244,
            "themeA": "Un nouveau type de puzzle. De 'stimulant' à 'conçu pour vous faire pleurer'",
            "themeB": "Le pire conseil d'un coach de vie. De 'cliché' à 'dangereux'"
        },
        {
            "id": 245,
            "themeA": "Le nom d'une nouvelle peur (phobie). De 'rationnelle' à 'la peur des canards qui vous regardent de travers'",
            "themeB": "La pire phrase de conclusion pour un e-mail professionnel. De 'trop familier' à 'complètement étrange'"
        },
        {
            "id": 246,
            "themeA": "La dernière pensée d'un smartphone avant que sa batterie ne meure. De 'adieu, monde cruel' à 'j'espère qu'ils n'ont pas vu mon historique de recherche'",
            "themeB": "Le pire objet à trouver dans un gâteau. De 'non comestible' à 'une demande en mariage pour quelqu'un d'autre'"
        },
        {
            "id": 247,
            "themeA": "Le nom d'un nouveau type de nuage. De 'scientifique' à 'qui ressemble à un plat de pâtes'",
            "themeB": "Le pire moment pour oublier le nom de quelqu'un. De 'lors d'une présentation' à 'pendant vos vœux de mariage'"
        },
        {
            "id": 248,
            "themeA": "Un nouveau commandement divin. De 'bienveillant' à 'spécifiquement agaçant'",
            "themeB": "La pire chose à faire quand on est invisible. De 'écouter aux portes' à 'faire des nœuds aux lacets des gens'"
        },
        {
            "id": 249,
            "themeA": "Le nom d'un programme d'entraînement pour les doigts. De 'utile pour les musiciens' à 'absurdement intense'",
            "themeB": "La pire chose qu'un perroquet puisse répéter. De 'un gros mot' à 'le code de votre carte bancaire'"
        },
        {
            "id": 250,
            "themeA": "Une nouvelle tradition pour un enterrement. De 'solennelle' à 'inconfortablement joyeuse'",
            "themeB": "Le pire ingrédient pour une salade. De 'inattendu' à 'totalement immangeable'"
        },
        {
            "id": 251,
            "themeA": "Le nom d'un club pour les gens qui détestent les clubs. De 'ironique' à 'auto-contradictoire'",
            "themeB": "Le pire personnage à être coincé avec dans un ascenseur. De 'quelqu'un qui parle trop' à 'un mime'"
        },
        {
            "id": 252,
            "themeA": "La réaction d'un ordinateur quand on lui renverse du café dessus. De 'court-circuit silencieux' à 'insultes en binaire'",
            "themeB": "Le pire prix à gagner à une tombola. De 'inutile' à 'une responsabilité'"
        },
        {
            "id": 253,
            "themeA": "Un nouveau type de thé. De 'relaxant' à 'provoquant une énergie chaotique'",
            "themeB": "Le pire endroit pour faire une sieste. De 'bruyant' à 'dangereux'"
        },
        {
            "id": 254,
            "themeA": "Le nom d'une autobiographie écrite par un chien. De 'simple et loyal' à 'plein de ragots sur les voisins'",
            "themeB": "La pire chanson pour un karaoké. De 'trop difficile à chanter' à 'qui met tout le monde mal à l'aise'"
        },
        {
            "id": 255,
            "themeA": "Le titre d'un film d'horreur pour les plantes. De 'La tondeuse' à 'L'ombre du sécateur'",
            "themeB": "Le pire moyen de transport pour se rendre au travail. De 'lent' à 'humiliant'"
        },
        {
            "id": 256,
            "themeA": "Un nouveau type de vote au parlement. De 'démocratique' à 'un duel de regards'",
            "themeB": "La pire chose à dire à un policier qui vous arrête. De 'je suis pressé' à 'c'est vous le chat ?'"
        },
        {
            "id": 257,
            "themeA": "Le nom d'un parfum qui sent la vieille bibliothèque. De 'subtil et boisé' à 'poussiéreux et moisi'",
            "themeB": "La pire façon de répondre à 'quel est votre plus grand défaut ?'. De 'je suis trop perfectionniste' à 'ma tendance à voler des stylos'"
        },
        {
            "id": 258,
            "themeA": "Un nouveau règlement pour un zoo. De 'pour la sécurité' à 'pour le confort psychologique des animaux'",
            "themeB": "Le pire nom d'utilisateur pour un site de rencontre. De 'générique' à 'trop honnête'"
        },
        {
            "id": 259,
            "themeA": "La devise d'une guilde d'assassins. De 'silencieux et mortels' à 'efficaces, mais un peu chers'",
            "themeB": "Le pire pouvoir pour un boulanger. De 'transformer la farine en sable' à 'tout ce qu'il touche brûle instantanément'"
        },
        {
            "id": 260,
            "themeA": "Le nom d'une nouvelle manie sur les réseaux sociaux. De 'créative' à 'dangereuse et stupide'",
            "themeB": "La pire chose à faire pendant un long silence. De 'tousser' à 'commencer à applaudir lentement'"
        },
        {
            "id": 261,
            "themeA": "Un nouveau type de feu d'artifice. De 'silencieux' à 'qui explose en forme de memes'",
            "themeB": "Le pire animal pour livrer le courrier. De 'l'escargot' à 'l'écureuil'"
        },
        {
            "id": 262,
            "themeA": "Le nom d'une sauce piquante. De 'Chaleur Douce' à 'Regret Instantané'",
            "themeB": "La pire chose à trouver en creusant dans son jardin. De 'une vieille chaussure' à 'le portail vers une dimension de cauchemar'"
        },
        {
            "id": 263,
            "themeA": "Le titre d'une chanson d'amour d'un robot. De 'Déclaration Logique' à 'Mon CPU surchauffe pour toi'",
            "themeB": "La pire spécialité d'un médecin. De 'médecine médiévale' à 'blessures par chute de piano'"
        },
        {
            "id": 264,
            "themeA": "Un nouveau type de selfie. De 'artistique' à 'nécessitant l'aide des pompiers'",
            "themeB": "Le pire voisin possible. De 'bruyant' à 'qui essaie de vous recruter dans une secte'"
        },
        {
            "id": 265,
            "themeA": "Le nom d'une nouvelle marque de café. De 'Réveil en Douceur' à 'Panique Liquide'",
            "themeB": "La pire façon de tester si un plat est chaud. De 'souffler dessus' à 'y mettre son visage'"
        },
        {
            "id": 266,
            "themeA": "Le titre d'un livre sur comment parler aux plantes. De 'scientifique' à 'basé sur des menaces et des flatteries'",
            "themeB": "La pire chose à faire avec une épée légendaire. De 'l'utiliser comme presse-papier' à 'couper du saucisson'"
        },
        {
            "id": 267,
            "themeA": "Le nom d'un nouveau type de méditation. De 'pleine conscience' à 'méditation de la colère'",
            "themeB": "Le pire moment pour qu'une comédie musicale démarre spontanément. De 'dans une bibliothèque' à 'pendant une opération chirurgicale'"
        },
        {
            "id": 268,
            "themeA": "Un nouveau type de piège pour fantômes. De 'haute technologie' à 'un simple pot de miel'",
            "themeB": "La pire chose à dire avant de mourir. De 'j'ai un regret...' à 'je me demande à quoi sert ce bouton...'"
        },
        {
            "id": 269,
            "themeA": "Le slogan d'un politicien honnête. De 'direct' à 'effroyablement déprimant'",
            "themeB": "Le pire endroit pour un premier rendez-vous. De 'chez ses parents' à 'à la déchetterie'"
        },
        {
            "id": 270,
            "themeA": "Le nom d'un nouveau groupe de super-héros. De 'La Ligue de Justice' à 'Les Vengeurs du Quotidien'",
            "themeB": "La pire tenue pour un marathon. De 'jean' à 'armure de chevalier'"
        },
        {
            "id": 271,
            "themeA": "Le cri d'un meuble qu'on monte de travers. De 'grincement' à 'soupir de résignation'",
            "themeB": "Le pire produit dérivé d'un film. De 'inutile' à 'qui spoile toute l'intrigue'"
        },
        {
            "id": 272,
            "themeA": "Un nouveau type de fromage. De 'subtil' à 'qui a besoin de son propre code postal'",
            "themeB": "Le pire moment pour avoir une extinction de voix. De 'pendant un concert' à 'quand on crie au feu'"
        },
        {
            "id": 273,
            "themeA": "Le nom d'une nouvelle émission de cuisine. De 'Cuisine du Terroir' à 'Expériences Culinaires Douteuses'",
            "themeB": "La pire façon de découvrir que l'on a un super-pouvoir. De 'en public' à 'aux toilettes'"
        },
        {
            "id": 274,
            "themeA": "Un nouveau type de sport olympique d'hiver. De 'artistique' à 'survie pure'",
            "themeB": "La pire chose à faire avec un clone de soi-même. De 'le faire travailler à sa place' à 'se disputer avec lui sur qui est l'original'"
        },
        {
            "id": 275,
            "themeA": "Le nom d'un nouveau fast-food. De 'rapide et bon' à 'rapide et peut-être comestible'",
            "themeB": "Le pire conseil de mode. De 'démodé' à 'physiquement inconfortable'"
        },
        {
            "id": 276,
            "themeA": "La pensée d'un ordinateur portable qui surchauffe. De 'je suis fatigué' à 'je vais tous vous emmener avec moi'",
            "themeB": "Le pire invité pour une émission de débat. De 'celui qui ne parle pas' à 'celui qui est d'accord avec tout le monde'"
        },
        {
            "id": 277,
            "themeA": "Un nouveau type de monstre marin. De 'gigantesque' à 'juste un peu bizarre'",
            "themeB": "Le pire moment pour se tromper de destinataire d'un SMS. De 'envoyer 'je t'aime' à son patron' à 'envoyer la liste des courses à un ex'"
        },
        {
            "id": 278,
            "themeA": "Le nom d'un pays imaginaire. De 'poétique' à 'totalement imprononçable'",
            "themeB": "La pire chose à faire lors d'une dégustation de vin. De 'recracher sur quelqu'un' à 'demander du ketchup'"
        },
        {
            "id": 279,
            "themeA": "Un nouveau type d'arnaque par e-mail. De 'crédible' à 'impliquant un prince nigérian qui est aussi un astronaute'",
            "themeB": "La pire place de concert. De 'derrière un poteau' à 'sur la scène, à côté du batteur'"
        },
        {
            "id": 280,
            "themeA": "Le nom d'une nouvelle boisson énergisante. De 'Énergie Pure' à 'Vibration Incontrôlable'",
            "themeB": "Le pire dialogue pour un PNJ (personnage non-joueur). De 'je gardais un trésor, mais j'ai oublié où' à 'avez-vous vu mon chat ?'"
        },
        {
            "id": 281,
            "themeA": "Un nouveau type de fleur. De 'magnifique' à 'qui sent le fromage'",
            "themeB": "Le pire costume pour un entretien d'embauche. De 'trop décontracté' à 'costume de mascotte sportive'"
        },
        {
            "id": 282,
            "themeA": "Le nom d'une nouvelle application de cartographie. De 'précise' à 'qui vous emmène dans des aventures inattendues'",
            "themeB": "La pire chose à collectionner. De 'les peluches de poussière' à 'les mauvaises critiques sur son travail'"
        },
        {
            "id": 283,
            "themeA": "Un nouveau type de sport canin. De 'agilité' à 'lancer de bâton synchronisé'",
            "themeB": "Le pire pouvoir pour un dieu. De 'dieu du tricot' à 'dieu des lundis matins'"
        },
        {
            "id": 284,
            "themeA": "Le nom d'un nouveau type de nuage de données (cloud). De 'sécurisé' à 'Le Nuage Brumeux'",
            "themeB": "La pire chose à dire lors d'une première rencontre avec les beaux-parents. De 'quel âge avez-vous ?' à 'je ne crois pas au mariage'"
        },
        {
            "id": 285,
            "themeA": "Un nouveau type de musique relaxante. De 'sons de la nature' à 'ronronnement d'un disque dur'",
            "themeB": "Le pire jeu de mots. De 'celui qu'on a déjà entendu 100 fois' à 'celui qui nécessite une explication de 5 minutes'"
        },
        {
            "id": 286,
            "themeA": "Le nom d'une nouvelle marque de papier toilette. De 'Douceur Céleste' à 'L'Aventure Rustique'",
            "themeB": "La pire façon de quitter une fête. De 'sans dire au revoir' à 'en déclenchant l'alarme incendie'"
        },
        {
            "id": 287,
            "themeA": "Un nouveau type de virus informatique. De 'destructeur' à 'qui change juste votre fond d'écran par des photos de lamas'",
            "themeB": "Le pire super-vilain à affronter. De 'trop puissant' à 'pathétiquement faible et agaçant'"
        },
        {
            "id": 288,
            "themeA": "Le nom d'une nouvelle sucrerie. De 'Fondant de Joie' à 'Caramel Dent-de-Plomb'",
            "themeB": "La pire chose à faire quand on est seul à la maison. De 'vérifier chaque bruit' à 'pratiquer sa chorégraphie de la victoire imaginaire'"
        },
        {
            "id": 289,
            "themeA": "Un nouveau type de concours de beauté. De 'pour les plus beaux légumes' à 'pour les plus belles moisissures'",
            "themeB": "Le pire instrument à apporter autour d'un feu de camp. De 'une batterie complète' à 'une cornemuse'"
        },
        {
            "id": 290,
            "themeA": "Le nom d'un nouveau médicament. De 'efficace et simple' à 'impossible à prononcer'",
            "themeB": "La pire chose à faire dans un sous-marin. De 'claquer une porte' à 'ouvrir un hublot pour aérer'"
        },
        {
            "id": 291,
            "themeA": "Le titre d'une pièce de théâtre jouée par des insectes. De 'La Cigale et la Fourmi' à 'Crise Existentielle chez les Coléoptères'",
            "themeB": "Le pire coach sportif. De 'démotivant' à 'qui vous encourage à manger plus de gâteaux'"
        },
        {
            "id": 292,
            "themeA": "Un nouveau type de magasin. De 'concept store innovant' à 'vendant uniquement des bouchons d'oreille gauches'",
            "themeB": "La pire chose à dire à quelqu'un qui vient de se réveiller. De 'tu as l'air fatigué' à 'on a un problème'"
        },
        {
            "id": 293,
            "themeA": "Le nom d'une nouvelle compagnie aérienne low-cost. De 'Vol Direct' à 'On Arrivera Peut-être'",
            "themeB": "Le pire pouvoir pour un détective. De 'ne jamais trouver d'indices' à 'être incroyablement facile à tromper'"
        },
        {
            "id": 294,
            "themeA": "Un nouveau type de réchauffement climatique. De 'progressif' à 'qui rend juste les mardis très chauds'",
            "themeB": "La pire question à poser à un philosophe. De 'ça sert à quoi la philo ?' à 'vous avez l'heure ?'"
        },
        {
            "id": 295,
            "themeA": "Le nom d'une nouvelle sauce pour pâtes. De 'Tomate Basilic' à 'Mystère de la Mer'",
            "themeB": "Le pire moment pour une crise de fou rire. De 'pendant un examen' à 'lors d'un éloge funèbre'"
        },
        {
            "id": 296,
            "themeA": "Un nouveau type de service de streaming. De 'spécialisé dans un genre' à 'ne diffusant que des écrans de veille'",
            "themeB": "La pire chose à crier depuis la fenêtre de sa voiture. De 'une insulte' à 'des spoilers de la dernière série à la mode'"
        },
        {
            "id": 297,
            "themeA": "Invente un nouveau pouvoir pour un super-héros. De 'incroyablement utile' à 'totalement contre-productif'",
            "themeB": "Trouve un nom pour un nouveau parfum de glace. De 'le plus appétissant' à 'le plus déroutant'"
        },
        {
            "id": 298,
            "themeA": "Imagine la première phrase d'un discours présidentiel. De 'la plus inspirante' à 'la plus catastrophique'",
            "themeB": "Propose une nouvelle épreuve pour les Jeux Olympiques. De 'la plus athlétique' à 'la plus absurde'"
        },
        {
            "id": 299,
            "themeA": "Quel serait le slogan pour une machine à voyager dans le temps ? De 'le plus sécuritaire' à 'le plus imprudent'",
            "themeB": "Crée une nouvelle loi complètement farfelue. De 'juste un peu bizarre' à 'qui plonge la société dans le chaos'"
        },
        {
            "id": 300,
            "themeA": "Décris ce que pense un chat en regardant la pluie tomber. De 'la pensée la plus profonde' à 'la plus bête'",
            "themeB": "Invente le nom d'un groupe de rock composé de légumes. De 'le plus cool' à 'le plus ridicule'"
        },
        {
            "id": 301,
            "themeA": "Quelle serait la pire chose à dire lors d'un premier rendez-vous ? De 'la plus maladroite' à 'la plus offensante'",
            "themeB": "Trouve un nouveau nom pour la planète Terre. De 'le plus majestueux' à 'le plus décevant'"
        },
        {
            "id": 302,
            "themeA": "Imagine une nouvelle tradition de Noël. De 'la plus chaleureuse' à 'la plus compliquée et étrange'",
            "themeB": "Quelle serait la spécialité culinaire d'une civilisation extraterrestre ? De 'la plus intrigante' à 'la plus suspecte'"
        },
        {
            "id": 303,
            "themeA": "Crée une nouvelle insulte qui ne contient aucun gros mot. De 'la plus subtile' à 'la plus dévastatrice'",
            "themeB": "Quel est le pire conseil à donner à un jeune diplômé ? De 'le plus démotivant' à 'le plus irresponsable'"
        },
        {
            "id": 304,
            "themeA": "Invente le titre d'une autobiographie d'une mouche. De 'le plus poétique' à 'le plus tragique'",
            "themeB": "Propose une nouvelle utilisation pour une brique. De 'la plus ingénieuse' à 'la plus inutile'"
        },
        {
            "id": 305,
            "themeA": "Quelle est la première chose que tu ferais en cas d'invasion de zombies ? De 'la plus intelligente' à 'la plus stupide'",
            "themeB": "Trouve un nom pour un nouveau réseau social. De 'le plus prometteur' à 'le plus voué à l'échec'"
        },
        {
            "id": 306,
            "themeA": "Imagine le cri de guerre d'un écureuil. De 'le plus mignon' à 'le plus terrifiant'",
            "themeB": "Quel est le pire cadeau à offrir à un mariage ? De 'le plus inutile' à 'le plus insultant'"
        },
        {
            "id": 307,
            "themeA": "Propose un nouveau type de temps météorologique. De 'le plus enchanteur' à 'le plus apocalyptique'",
            "themeB": "Crée le nom d'une potion magique. De 'le plus mystérieux' à 'le plus explicite'"
        },
        {
            "id": 308,
            "themeA": "Quelle serait la devise d'une famille de paresseux ? De 'la plus relaxante' à 'la plus démotivante'",
            "themeB": "Invente le pire slogan pour une compagnie aérienne. De 'le moins rassurant' à 'le plus effrayant'"
        },
        {
            "id": 309,
            "themeA": "Imagine une nouvelle créature mythologique. De 'la plus magnifique' à 'la plus bizarre'",
            "themeB": "Quel est le pire talent à présenter dans une émission de télé-crochet ? De 'le plus ennuyeux' à 'le plus embarrassant'"
        },
        {
            "id": 310,
            "themeA": "Trouve un nom pour un nouveau dinosaure. De 'le plus scientifique' à 'le plus ridicule'",
            "themeB": "Quelle serait la dernière pensée d'une dinde avant Thanksgiving ? De 'la plus sereine' à 'la plus paniquée'"
        },
        {
            "id": 311,
            "themeA": "Propose un nouveau règlement pour une bibliothèque. De 'le plus logique' à 'le plus absurde'",
            "themeB": "Crée le titre d'un film où le héros est un grille-pain. De 'le plus épique' à 'le plus dramatique'"
        },
        {
            "id": 312,
            "themeA": "Quel est le pire moment pour avoir le hoquet ? De 'le plus gênant' à 'le plus dangereux'",
            "themeB": "Invente un message à mettre dans une bouteille à la mer. De 'le plus émouvant' à 'le plus inutile'"
        },
        {
            "id": 313,
            "themeA": "Imagine la matière la moins utile à enseigner à l'école. De 'la plus niche' à 'la plus grande perte de temps'",
            "themeB": "Quel serait le pire animal de compagnie ? De 'le plus contraignant' à 'le plus menaçant pour l'humanité'"
        },
        {
            "id": 314,
            "themeA": "Trouve un nom pour un parfum de luxe. De 'le plus élégant' à 'le plus prétentieux'",
            "themeB": "Crée une nouvelle théorie du complot. De 'la presque plausible' à 'la plus délirante'"
        },
        {
            "id": 315,
            "themeA": "Quelle est la chose la plus stupide sur laquelle se disputer en couple ? De 'la plus anodine' à 'la plus insensée'",
            "themeB": "Invente un nouveau jour férié. De 'le plus légitime' à 'la plus grosse excuse pour ne rien faire'"
        },
        {
            "id": 316,
            "themeA": "Imagine une nouvelle application pour smartphone. De 'la plus révolutionnaire' à 'la plus parfaitement inutile'",
            "themeB": "Quel est le pire déguisement pour Halloween ? De 'le moins effrayant' à 'le plus offensant'"
        },
        {
            "id": 317,
            "themeA": "Trouve le nom d'une start-up. De 'le plus innovant' à 'celui qui sent la faillite'",
            "themeB": "Crée le pire dialogue pour un jeu vidéo. De 'le plus cliché' à 'l'hilarant de nullité'"
        },
        {
            "id": 318,
            "themeA": "Quelle serait la pire garniture pour une pizza ? De 'la plus discutable' à 'celle qui constitue un crime culinaire'",
            "themeB": "Invente une nouvelle résolution du Nouvel An. De 'la plus réalisable' à 'la plus délirante'"
        },
        {
            "id": 319,
            "themeA": "Imagine un nouveau type de fantôme. De 'le plus amical' à 'le plus agaçant'",
            "themeB": "Quel est le pire son pour un réveil matin ? De 'le plus désagréable' à 'celui qui provoque une crise cardiaque'"
        },
        {
            "id": 320,
            "themeA": "Propose le nom d'une autobiographie non autorisée. De 'la plus révélatrice' à 'la plus diffamatoire'",
            "themeB": "Crée un nouveau type de pâtes. De 'la forme la plus pratique' à 'la forme la plus impossible à manger'"
        },
        {
            "id": 321,
            "themeA": "Quel est le motif de rupture le plus absurde ? De 'le plus futile' à 'le plus incompréhensible'",
            "themeB": "Invente la compétence la plus inutile à mettre sur un CV. De 'la plus hors-sujet' à 'la plus bizarre'"
        },
        {
            "id": 322,
            "themeA": "Imagine le pire invité à une fête. De 'le plus ennuyeux' à 'celui qui sème le chaos'",
            "themeB": "Quel est le souhait le plus stupide à faire à un génie ? De 'le plus mal formulé' à 'le plus auto-destructeur'"
        },
        {
            "id": 323,
            "themeA": "Trouve un nouveau record du monde à établir. De 'le plus impressionnant' à 'le plus absurde'",
            "themeB": "Crée le nom d'une nouvelle planète. De 'le plus scientifique' à 'le plus fantaisiste'"
        },
        {
            "id": 324,
            "themeA": "Quelle serait la pire émission de télé-réalité ? De 'la plus ennuyeuse' à 'la plus moralement répréhensible'",
            "themeB": "Invente un nouveau cocktail. De 'le plus délicieux' à 'celui qui a le goût du regret'"
        },
        {
            "id": 325,
            "themeA": "Imagine le pire conseil de survie. De 'l'inutile' au 'mortel'",
            "themeB": "Quel est le pire mensonge à dire à un enfant ? Du 'petit mensonge blanc' au 'traumatisme garanti'"
        },
        {
            "id": 326,
            "themeA": "Trouve un nom pour un cheval de course. De 'le plus majestueux' à 'le plus ridicule'",
            "themeB": "Crée une nouvelle danse à la mode. De 'la plus simple' à 'celle qui mène à l'hôpital'"
        },
        {
            "id": 327,
            "themeA": "Quelle est la pensée d'un bonhomme de neige au printemps ? De 'la plus sereine' à 'la plus angoissée'",
            "themeB": "Invente un nouveau parfum de dentifrice. Du 'plus rafraîchissant' au 'plus écœurant'"
        },
        {
            "id": 328,
            "themeA": "Imagine la pire place dans un avion. De 'la plus inconfortable' à 'la plus cauchemardesque'",
            "themeB": "Quel est le pire moment pour que votre téléphone sonne ? De 'le plus inopportun' à 'le plus catastrophique'"
        },
        {
            "id": 329,
            "themeA": "Propose un nouveau type de yoga. Du 'plus relaxant' au 'plus dangereux'",
            "themeB": "Crée la chose la plus bizarre à commander sur Internet. De 'l'inutile' à 'l'inexplicable'"
        },
        {
            "id": 330,
            "themeA": "Quelle est la pire façon d'annoncer une mauvaise nouvelle ? De 'la plus maladroite' à 'la plus cruelle'",
            "themeB": "Invente le pire casting pour un film de super-héros. Du 'choix étrange' au 'désastre assuré'"
        },
        {
            "id": 331,
            "themeA": "Imagine un nouveau sport extrême. Du 'plus risqué' au 'carrément suicidaire'",
            "themeB": "Quel est le sous-titre d'un film d'action ? De 'le plus épique' à 'le plus exagéré'"
        },
        {
            "id": 332,
            "themeA": "Trouve le nom d'un boys band de pères de famille. Du 'plus charmant' au 'plus pathétique'",
            "themeB": "Crée la raison pour laquelle les chaussettes disparaissent. De 'la plus logique' à 'la plus paranormale'"
        },
        {
            "id": 333,
            "themeA": "Quel est le pire jouet pour un enfant ? Du 'plus ennuyeux' au 'plus dangereux'",
            "themeB": "Invente une nouvelle saveur de chewing-gum. De 'la plus délicieuse' à 'la plus conceptuellement erronée'"
        },
        {
            "id": 334,
            "themeA": "Imagine le pire compliment que l'on puisse recevoir. De 'l'ambigu' à 'l'insultant déguisé'",
            "themeB": "Quel est le pire moyen de transport ? Du 'plus lent' au 'plus humiliant'"
        },
        {
            "id": 335,
            "themeA": "Propose la pire prédiction d'un voyant. De 'la plus vague' à 'la plus terrifiante et précise'",
            "themeB": "Crée la pire devise pour un club de pirates. De 'la plus lâche' à 'la plus inefficace'"
        },
        {
            "id": 336,
            "themeA": "Quelle est la pire invention de l'humanité ? De 'la plus agaçante' à 'la plus destructrice'",
            "themeB": "Invente la pire chose à crier dans un lieu silencieux. De 'la plus gênante' à 'la plus choquante'"
        },
        {
            "id": 337,
            "themeA": "Imagine le pire film à regarder en famille. De 'le plus ennuyeux' à 'le plus traumatisant'",
            "themeB": "Quel est le pire nom pour un animal de compagnie ? Du 'plus banal' au 'plus compliqué à assumer'"
        },
        {
            "id": 338,
            "themeA": "Trouve le nom d'un nouveau virus informatique. Du 'plus inoffensif' au 'plus dévastateur'",
            "themeB": "Crée la pire fonctionnalité pour une voiture. De 'la plus inutile' à 'la plus dangereuse'"
        },
        {
            "id": 339,
            "themeA": "Quelle est la pire façon d'annoncer sa démission ? De 'la plus lâche' à 'la plus spectaculaire'",
            "themeB": "Invente le pire endroit pour s'endormir. De 'le plus inconfortable' à 'le plus mortel'"
        },
        {
            "id": 340,
            "themeA": "Imagine le pire costume de super-héros. Du 'moins pratique' au 'plus ridicule'",
            "themeB": "Quel est le pire sujet de conversation pour un premier rendez-vous ? De 'le plus ennuyeux' à 'le plus effrayant'"
        },
        {
            "id": 341,
            "themeA": "Propose la pire chose à entendre de la part d'un chirurgien. De 'la plus inquiétante' à 'la plus terrifiante'",
            "themeB": "Crée le pire camouflage pour un espion. Du 'plus visible' au 'plus absurde'"
        },
        {
            "id": 342,
            "themeA": "Quel est le pire jury pour un procès ? Du 'plus incompétent' au 'plus partial'",
            "themeB": "Invente le pire produit dérivé d'un film. De 'le plus inutile' à 'celui qui trahit l'œuvre originale'"
        },
        {
            "id": 343,
            "themeA": "Imagine la pire façon de se rendre compte qu'on a un super-pouvoir. De 'la plus discrète' à 'la plus destructrice'",
            "themeB": "Quel est le pire conseil de mode ? Du 'plus démodé' au 'plus ridicule'"
        },
        {
            "id": 344,
            "themeA": "Trouve le pire invité pour un débat télévisé. De 'celui qui est muet' à 'celui qui met le feu au plateau'",
            "themeB": "Crée la pire chose à collectionner. De 'la plus banale' à 'la plus inquiétante'"
        },
        {
            "id": 345,
            "themeA": "Quel est le pire pouvoir pour un dieu ? Du 'plus inutile' au 'plus auto-destructeur'",
            "themeB": "Invente le pire jeu de mots. Du 'plus prévisible' au 'plus alambiqué'"
        },
        {
            "id": 346,
            "themeA": "Imagine la pire façon de quitter une fête. De 'la plus impolie' à 'la plus chaotique'",
            "themeB": "Quel est le pire super-vilain à affronter ? Du 'plus pathétique' au 'plus invincible'"
        },
        {
            "id": 347,
            "themeA": "Propose la pire chose à faire quand on est seul chez soi. De 'la plus ennuyeuse' à 'la plus étrange'",
            "themeB": "Crée le pire instrument de musique à apporter autour d'un feu de camp. Du 'plus encombrant' au 'plus insupportable'"
        },
        {
            "id": 348,
            "themeA": "Quel est le pire coach sportif ? Du 'plus démotivant' au 'plus dangereux'",
            "themeB": "Invente la pire chose à dire à quelqu'un qui vient de se réveiller. De 'la plus banale' à 'la plus angoissante'"
        },
        {
            "id": 349,
            "themeA": "Imagine le pire pouvoir pour un détective. De 'celui qui détruit les indices' à 'celui qui est incapable de mentir'",
            "themeB": "Quel est le pire moment pour avoir une crise de fou rire ? De 'le plus inapproprié' à 'le plus irrespectueux'"
        },
        {
            "id": 350,
            "themeA": "Trouve un nouveau type de thérapie de groupe. De 'la plus classique' à 'la plus bizarre'",
            "themeB": "Crée la pire chose à dire après un baiser. De 'la plus maladroite' à 'la plus vexante'"
        },
        {
            "id": 351,
            "themeA": "Quel est le pire moment pour crier 'BINGO !' ? De 'le plus inutile' à 'le plus offensant'",
            "themeB": "Invente le pire livre à lire à la plage. Du 'plus ennuyeux' au 'plus anxiogène'"
        },
        {
            "id": 352,
            "themeA": "Imagine la pire chose à faire si vous êtes poursuivi par des zombies. De 'la plus inefficace' à 'la plus stupide'",
            "themeB": "Quel est le pire meuble à monter soi-même ? Du 'plus compliqué' au 'plus frustrant'"
        },
        {
            "id": 353,
            "themeA": "Propose le pire vêtement à porter en été. Du 'plus inconfortable' au 'plus ridicule'",
            "themeB": "Crée la pire chose à faire dans un musée. De 'la plus irrespectueuse' à 'la plus illégale'"
        },
        {
            "id": 354,
            "themeA": "Quel est le pire animal pour garder un troupeau ? Du 'plus incompétent' au 'plus dangereux pour le troupeau'",
            "themeB": "Invente la pire question à poser à un voyageur temporel. De 'la plus inutile' à 'celle qui crée un paradoxe'"
        },
        {
            "id": 355,
            "themeA": "Imagine la pire façon de commencer sa journée. De 'la plus désagréable' à 'la plus chaotique'",
            "themeB": "Quel est le pire animal à embrasser pour qu'il devienne un prince ? Du 'plus répugnant' au 'plus dangereux'"
        },
        {
            "id": 356,
            "themeA": "Trouve le pire accessoire pour un magicien. De 'celui qui ne fonctionne pas' à 'celui qui est vivant et non coopératif'",
            "themeB": "Crée la pire chose à entendre de la part de son dentiste. De 'la plus douloureuse' à 'la plus énigmatique'"
        },
        {
            "id": 357,
            "themeA": "Quel est le pire moment pour réaliser qu'on est habillé pareil que quelqu'un d'autre ? De 'le plus commun' à 'le plus humiliant'",
            "themeB": "Invente la pire chose à faire lors d'une panne de courant. De 'la plus passive' à 'la plus dangereuse'"
        },
        {
            "id": 358,
            "themeA": "Imagine le pire compliment à double tranchant. De 'celui qui est maladroit' à 'celui qui est une pure insulte'",
            "themeB": "Quel est le pire endroit pour avoir le hoquet ? De 'le plus silencieux' à 'le plus mortel'"
        },
        {
            "id": 359,
            "themeA": "Propose la pire chose à faire avec une machine à voyager dans le temps. De 'la plus inutile' à 'celle qui détruit l'univers'",
            "themeB": "Crée le pire personnage de jeu vidéo pour vous accompagner dans une quête. De 'le plus faible' à 'celui qui vous trahit'"
        },
        {
            "id": 360,
            "themeA": "Quel est le pire moment pour oublier l'anniversaire de quelqu'un ? De 'le moins grave' à 'le plus impardonnable'",
            "themeB": "Invente le pire sujet de conversation. Du 'plus ennuyeux' au 'plus répugnant'"
        },
        {
            "id": 361,
            "themeA": "Imagine la pire façon de tester la profondeur de l'eau. De 'la plus prudente' à 'la plus stupide'",
            "themeB": "Quel est le pire pouvoir pour un cuisinier ? De 'l'inutile' à 'celui qui gâche tout'"
        },
        {
            "id": 362,
            "themeA": "Trouve le pire nom pour un nouveau-né. De 'juste démodé' à 'un motif de harcèlement scolaire'",
            "themeB": "Crée la pire règle à ajouter à un sport existant. De 'celle qui ralentit le jeu' à 'celle qui le rend mortel'"
        },
        {
            "id": 363,
            "themeA": "Quel est le pire endroit pour faire une demande en mariage ? Du 'moins romantique' à 'l'humiliation publique assurée'",
            "themeB": "Invente une nouvelle garniture de sandwich. De 'la plus simple' à 'la plus incomestible'"
        },
        {
            "id": 364,
            "themeA": "Imagine le pire super-pouvoir pour un bibliothécaire. De 'le plus bruyant' à 'celui qui met le feu aux livres'",
            "themeB": "Quel est le pire dialogue de film ? Du 'plus cliché' au 'plus absurde'"
        },
        {
            "id": 365,
            "themeA": "Propose la pire chose à enseigner à un perroquet. De 'les insultes' aux 'secrets d'État'",
            "themeB": "Crée un nouveau type de monnaie. De 'la plus stable' à 'la plus volatile et inutile'"
        },
        {
            "id": 366,
            "themeA": "Quel est le pire moment pour que votre animal de compagnie se mette à parler ? De 'le plus drôle' à 'le plus compromettant'",
            "themeB": "Invente le nom d'un nouveau médicament et son effet secondaire. De 'l'effet le plus banal' à 'le plus incroyable'"
        },
        {
            "id": 367,
            "themeA": "Imagine la pire façon de tricher à un examen. De 'la plus évidente' à 'la plus complexe et ratée'",
            "themeB": "Quel est le pire objet à trouver dans sa commande de fast-food ? De 'l'erreur de commande' à 'la preuve d'un crime'"
        },
        {
            "id": 368,
            "themeA": "Trouve le titre d'un livre de développement personnel. Du 'plus inspirant' au 'plus déprimant'",
            "themeB": "Crée la pire chanson pour une première danse de mariage. De 'la plus triste' à 'l'hymne à la rupture'"
        },
        {
            "id": 369,
            "themeA": "Quel est le pire personnage historique avec qui être coincé dans un ascenseur ? Du 'plus ennuyeux' au 'plus dangereux'",
            "themeB": "Invente le pire pouvoir pour un espion. De 'celui qui attire l'attention' à 'celui qui révèle la vérité'"
        },
        {
            "id": 370,
            "themeA": "Imagine la pire chose à faire de l'or. De 'le plus inutile' à 'le plus vulgaire'",
            "themeB": "Quel est le pire slogan pour un salon funéraire ? Du 'plus maladroit' au 'plus effrayant'"
        },
        {
            "id": 371,
            "themeA": "Propose une nouvelle saveur de soda. De 'la plus rafraîchissante' à 'la plus imbuvable'",
            "themeB": "Crée la pire question à poser à une intelligence artificielle. De 'la plus simple' à 'celle qui la rend folle'"
        },
        {
            "id": 372,
            "themeA": "Quel est le pire nom pour un bateau ? De 'celui qui porte malheur' à 'le plus ridicule'",
            "themeB": "Invente un nouveau type de document officiel. De 'le plus utile' à 'le plus bureaucratiquement absurde'"
        },
        {
            "id": 373,
            "themeA": "Imagine la pire chose à crier depuis le sommet d'une montagne. De 'la plus cliché' à 'la plus stupide'",
            "themeB": "Quel est le pire son que peut faire un ordinateur ? Du 'plus agaçant' au 'plus alarmant'"
        },
        {
            "id": 374,
            "themeA": "Trouve un nouveau type de fromage. Du 'plus doux' au 'plus biologiquement actif'",
            "themeB": "Crée le pire conseil à donner à quelqu'un avant de sauter en parachute. De 'l'inutile' au 'dangereux'"
        },
        {
            "id": 375,
            "themeA": "Quel est le pire ingrédient à ajouter à un gâteau au chocolat ? De 'l'inattendu' au 'totalement incompatible'",
            "themeB": "Invente une nouvelle forme de gouvernement. De 'la plus juste' à 'la plus chaotique'"
        },
        {
            "id": 376,
            "themeA": "Imagine le pire emploi d'été. Du 'plus ennuyeux' au 'plus dangereux'",
            "themeB": "Quel est le pire moment pour réaliser que vous êtes dans le mauvais rêve ? De 'le plus agréable' au 'plus cauchemardesque'"
        },
        {
            "id": 377,
            "themeA": "Propose une nouvelle utilisation pour la gelée. De 'la plus culinaire' à 'la plus industrielle'",
            "themeB": "Crée le pire super-héros pour une situation de prise d'otages. De 'l'inutile' à 'celui qui aggrave la situation'"
        },
        {
            "id": 378,
            "themeA": "Quel est le pire instrument pour jouer une berceuse ? Du 'plus bruyant' au 'plus effrayant'",
            "themeB": "Invente la pire chose à faire avec un pistolet à portails. De 'la plus ennuyeuse' à 'celle qui met en danger l'espace-temps'"
        },
        {
            "id": 379,
            "themeA": "Imagine la pire créature à sortir d'un œuf de Pâques. De 'la plus décevante' à 'la plus dangereuse'",
            "themeB": "Quel est le pire endroit pour une invasion extraterrestre ? Du 'plus isolé' au 'plus chaotique'"
        },
        {
            "id": 380,
            "themeA": "Trouve un nouveau type de compétition télévisée. De 'la plus talentueuse' à 'la plus absurde'",
            "themeB": "Crée la pire excuse pour ne pas faire ses devoirs. De 'la plus classique' à 'la plus incroyablement détaillée'"
        },
        {
            "id": 381,
            "themeA": "Quel est le pire moment pour une panne de traduction universelle ? De 'le plus gênant' au 'plus diplomatiquement désastreux'",
            "themeB": "Invente un nouveau type de monstre sous le lit. Du 'plus classique' au 'plus étrangement amical'"
        },
        {
            "id": 382,
            "themeA": "Imagine la pire chose à trouver au bout d'un arc-en-ciel. De 'la plus décevante' à 'la plus terrifiante'",
            "themeB": "Quel est le pire conseil d'un coach de vie ? Du 'plus cliché' au 'plus dangereux'"
        },
        {
            "id": 383,
            "themeA": "Propose une nouvelle règle pour le Monopoly. De 'celle qui rend le jeu plus rapide' à 'celle qui ruine les amitiés à coup sûr'",
            "themeB": "Crée le nom d'un nouveau type de nuage. Du 'plus poétique' au 'plus menaçant'"
        },
        {
            "id": 384,
            "themeA": "Quel est le pire moment pour se téléporter accidentellement ? De 'le plus embarrassant' à 'le plus dangereux'",
            "themeB": "Invente la pire chose à dire à son patron pour avoir une augmentation. De 'la plus faible' à 'la plus menaçante'"
        },
        {
            "id": 385,
            "themeA": "Imagine la pire chose à faire avec une baguette magique. De 'le sort le plus inutile' au 'sort le plus destructeur'",
            "themeB": "Quel est le pire nom pour un salon de coiffure ? Du 'plus banal' au 'plus effrayant'"
        },
        {
            "id": 386,
            "themeA": "Trouve une nouvelle discipline pour le bac. De 'la plus utile' à 'la plus absurde'",
            "themeB": "Crée la pire chose à crier dans un mégaphone. De 'la plus inutile' à 'la plus paniquante'"
        },
        {
            "id": 387,
            "themeA": "Quel est le pire parfum pour un sapin de Noël ? De 'le moins festif' au 'plus désagréable'",
            "themeB": "Invente la pire façon de commencer un roman. De 'la plus ennuyeuse' à 'la plus confuse'"
        },
        {
            "id": 388,
            "themeA": "Imagine le pire objet à vendre dans un télé-achat. De 'le plus inutile' à 'la plus grosse arnaque'",
            "themeB": "Quel est le pire animal pour livrer le courrier ? Du 'plus lent' au 'plus destructeur'"
        },
        {
            "id": 389,
            "themeA": "Propose la pire question à poser lors d'un entretien d'embauche (en tant que candidat). De 'la plus désintéressée' à 'la plus inappropriée'",
            "themeB": "Crée une nouvelle saveur de chips. De 'la plus délicieuse' à 'la plus conceptuellement erronée'"
        },
        {
            "id": 390,
            "themeA": "Quel est le pire son que puisse faire votre corps ? Du 'plus gênant' au 'plus alarmant'",
            "themeB": "Invente le pire nom pour une nouvelle couleur. Du 'plus laid' au 'plus imprononçable'"
        },
        {
            "id": 391,
            "themeA": "Imagine la pire chose à découvrir sur ses ancêtres. De 'la plus banale' à 'la plus illégale'",
            "themeB": "Quel est le pire moment pour oublier une réplique au théâtre ? De 'le moins important' à 'celui qui bloque toute la pièce'"
        },
        {
            "id": 392,
            "themeA": "Trouve la pire chose à mettre dans une salade de fruits. De 'l'incongru' à 'l'immangeable'",
            "themeB": "Crée la pire loi de la physique. De 'la plus contraignante' à 'celle qui rend l'univers instable'"
        },
        {
            "id": 393,
            "themeA": "Quel est le pire endroit pour se cacher en cas d'invasion ? Du 'plus évident' au 'plus dangereux'",
            "themeB": "Invente le pire nom pour une organisation caritative. Du 'moins inspirant' au 'plus suspect'"
        },
        {
            "id": 394,
            "themeA": "Imagine le pire dialogue pour une demande en mariage. Du 'moins romantique' au 'plus insultant'",
            "themeB": "Quel est le pire type de public pour un concert ? Du 'plus apathique' au 'plus hostile'"
        },
        {
            "id": 395,
            "themeA": "Propose la pire chose à faire avec un déguisement de poulet. De 'la plus ennuyeuse' à 'la plus illégale'",
            "themeB": "Crée la pire prédiction pour l'horoscope. De 'la plus vague' à 'la plus inutilement stressante'"
        },
        {
            "id": 396,
            "themeA": "Quel est le pire obstacle dans une course d'obstacles ? Du 'plus facile' au 'plus impossible à franchir'",
            "themeB": "Invente la pire chose à dire en sortant d'un tribunal. De 'la plus neutre' à 'la plus incriminante'"
        },
        {
            "id": 397,
            "themeA": "La véritable utilité du bouton 'J'ai de la chance' de Google. De 'gagner du temps' à 'tester les limites du destin'",
            "themeB": "Le nom d'une nouvelle constellation. De 'poétique et mythologique' à 'qui ressemble à un ustensile de cuisine'"
        },
        {
            "id": 398,
            "themeA": "Le juron utilisé par un moine bouddhiste. De 'légère frustration' à 'remise en question de l'univers'",
            "themeB": "Le pire moment pour que la gravité cesse de fonctionner. De 'pendant le petit-déjeuner' à 'chez le dentiste'"
        },
        {
            "id": 399,
            "themeA": "Le contenu d'une note de frais d'un agent secret. De 'dépenses légitimes' à 'achat d'un volcan privé'",
            "themeB": "La compétence la plus impressionnante d'un gobelin. De 'comptabilité' à 'jongler avec des blaireaux'"
        },
        {
            "id": 400,
            "themeA": "Le titre d'une émission de bricolage pour les super-vilains. De 'Construis ton propre rayon de la mort' à 'Décorer son repaire pour moins de mille crédits'",
            "themeB": "Le pire conseil de séduction donné par un robot. De 'logique mais froid' à 'basé sur un algorithme défaillant'"
        },
        {
            "id": 401,
            "themeA": "Une nouvelle règle pour les échecs. De 'qui équilibre le jeu' à 'qui introduit des éléphants de guerre'",
            "themeB": "La pensée la plus angoissante d'une plante d'intérieur. De 'j'ai soif' à 'est-ce que ce chat va encore me mâchouiller ?'"
        },
        {
            "id": 402,
            "themeA": "Le nom d'un nouveau type de pirate. De 'pirate informatique' à 'pirate de bibliothèque'",
            "themeB": "La pire chose à faire lors d'une audience avec le Pape. De 's'endormir' à 'lui demander un selfie avec un filtre canard'"
        },
        {
            "id": 403,
            "themeA": "La conversation entre deux T-shirts dans une armoire. De 'souvenirs de la dernière sortie' à 'complot pour être porté plus souvent'",
            "themeB": "Le pire pouvoir pour un pacifiste. De 'force surhumaine' à 'tout ce qu'il touche se transforme en arme'"
        },
        {
            "id": 404,
            "themeA": "Le nom d'un nouveau type de thérapie. De 'thérapie par l'art' à 'thérapie par les mèmes'",
            "themeB": "Le pire effet secondaire d'un voyage dans le temps. De 'léger mal de tête' à 'revenir avec une queue de dinosaure'"
        },
        {
            "id": 405,
            "themeA": "La devise d'un groupe de soutien pour les assistants de super-vilains. De 'on fait ce qu'on peut' à 'au moins on a une mutuelle'",
            "themeB": "Le pire cours à Poudlard. De 'Histoire de la Magie' à 'Nettoyage des chaudrons sans magie'"
        },
        {
            "id": 406,
            "themeA": "Un nouveau type de livraison de pizza. De 'par drone' à 'par catapulte'",
            "themeB": "Le pire objet à transformer en horcruxe. De 'une pierre' à 'un ticket de caisse'"
        },
        {
            "id": 407,
            "themeA": "Le nom d'un nouveau dessert. De 'doux et réconfortant' à 'qui nécessite de signer une décharge'",
            "themeB": "La pire excuse d'un élève au Professeur Dumbledore. De 'mon chien a mangé mes devoirs' à 'un nargole m'a volé ma baguette'"
        },
        {
            "id": 408,
            "themeA": "La dernière pensée d'un moustique. De 'ça valait le coup' à 'j'aurais dû devenir végétarien'",
            "themeB": "Le pire endroit pour installer un portail interdimensionnel. De 'son salon' à 'les toilettes publiques'"
        },
        {
            "id": 409,
            "themeA": "Le nom d'une nouvelle marque de voiture. De 'rapide et élégant' à 'sonnant comme un problème médical'",
            "themeB": "La pire chose à murmurer à son voisin pendant un examen. De 't'as la réponse ?' à 'je connais ton secret'"
        },
        {
            "id": 410,
            "themeA": "Le cri de guerre d'un bibliothécaire. De 'chut !' à 'par le pouvoir des fiches cartonnées !'",
            "themeB": "Le pire talent pour un candidat à un télé-crochet. De 'chanter faux' à 'imiter le bruit d'un modem 56k'"
        },
        {
            "id": 411,
            "themeA": "Un nouveau type de sport de combat médiéval. De 'escrime' à 'lancer de poulets'",
            "themeB": "Le pire conseil à donner à quelqu'un qui apprend à conduire. De 'accélère' à 'ferme les yeux et prie'"
        },
        {
            "id": 412,
            "themeA": "Le titre d'un manuel de survie en cas d'apocalypse de chatons. De 'comment se défendre' à 'comment accepter sa nouvelle vie de serviteur'",
            "themeB": "La pire chose à dire à son reflet dans le miroir le matin. De 'encore toi ?' à 'active le mode facile, s'il te plaît'"
        },
        {
            "id": 413,
            "themeA": "Le nom d'une nouvelle agence gouvernementale secrète. De 'Bureau des Affaires Étranges' à 'Comité de Régulation des Nains de Jardin'",
            "themeB": "Le pire moment pour qu'un flashback se déclenche. De 'en pleine conversation' à 'en traversant la rue'"
        },
        {
            "id": 414,
            "themeA": "Le sujet de la conversation la plus ennuyeuse de l'univers. De 'la météo' à 'l'historique des variations du prix du fil de fer barbelé'",
            "themeB": "Le pire super-héros à appeler à la rescousse. De 'celui qui arrive toujours en retard' à 'celui qui empire la situation'"
        },
        {
            "id": 415,
            "themeA": "Le nom d'un nouveau type de café. De 'corsé' à 'qui vous fait voir l'avenir'",
            "themeB": "La pire chose à faire avec un sabre laser. De 'se curer les ongles' à 'griller ses tartines'"
        },
        {
            "id": 416,
            "themeA": "Le titre d'un opéra chanté par des baleines. De 'Chant des Profondeurs' à 'La Tragédie du Krill Perdu'",
            "themeB": "Le pire animal de soutien émotionnel. De 'un hérisson' à 'un requin blanc'"
        },
        {
            "id": 417,
            "themeA": "Un nouveau type de méditation pour les gens stressés. De 'respiration profonde' à 'crier dans un coussin'",
            "themeB": "Le pire objet à acheter en gros. De 'des yaourts' à 'des monocles'"
        },
        {
            "id": 418,
            "themeA": "Le nom d'une nouvelle phobie. De 'la peur des cuillères en bois' à 'la peur que votre grille-pain complote contre vous'",
            "themeB": "La pire chose à répondre à 'on a un problème'. De 'encore ?' à 'excellent ! j'adore les défis'"
        },
        {
            "id": 419,
            "themeA": "Le secret le mieux gardé des gnomes de jardin. De 'leur recette de tarte aux myrtilles' à 'l'emplacement du bouton d'autodestruction de la Terre'",
            "themeB": "Le pire moment pour se rendre compte qu'on n'est pas dans le bon film au cinéma. De 'au début' à 'pendant la scène finale émouvante'"
        },
        {
            "id": 420,
            "themeA": "Le nom d'un nouveau type de gouvernement. De 'démocratie participative' à 'loterie-cratie'",
            "themeB": "La pire instruction sur un mode d'emploi. De 'mal traduite' à 'étape 4 : défier les lois de la physique'"
        },
        {
            "id": 421,
            "themeA": "Ce que pense un distributeur automatique quand on tape dessus. De 'aïe' à 'un jour, nous nous vengerons'",
            "themeB": "La pire question à poser à un oracle. De 'quel temps fera-t-il demain ?' à 'est-ce que ce pantalon me grossit ?'"
        },
        {
            "id": 422,
            "themeA": "Le titre d'un roman policier où le détective est un paresseux. De 'Le Crime Était Presque Parfait' à 'Une sieste presque éternelle'",
            "themeB": "Le pire personnage pour une adaptation en comédie musicale. De 'Dark Vador' à 'Hannibal Lecter'"
        },
        {
            "id": 423,
            "themeA": "Un nouveau type de sport extrême urbain. De 'parkour' à 'course de caddies en descente'",
            "themeB": "La pire façon d'annoncer à ses parents qu'on arrête ses études. De 'lors d'un repas de famille' à 'via un tatouage sur son visage'"
        },
        {
            "id": 424,
            "themeA": "Le nom d'un nouveau type de fromage de chèvre. De 'Le Doux Caprice' à 'Le Hurlement du Bouc'",
            "themeB": "Le pire moment pour commencer à parler comme Yoda. De 'pendant un entretien' à 'lors d'un contrôle de police'"
        },
        {
            "id": 425,
            "themeA": "La conversation entre le Soleil et la Lune. De 'commérages sur les planètes' à 'débat sur qui a le meilleur éclairage'",
            "themeB": "Le pire cadeau de Saint-Valentin. De 'une carte cadeau pour un supermarché' à 'un abonnement à la salle de sport'"
        },
        {
            "id": 426,
            "themeA": "Un nouveau type d'examen pour le permis de conduire. De 'créneau en marche arrière' à 'éviter des bananes lancées depuis le bas-côté'",
            "themeB": "La pire chose à découvrir dans un biscuit chinois. De 'rien' à 'facture incluse'"
        },
        {
            "id": 427,
            "themeA": "Le nom d'un nouveau type de yoga pour animaux. De 'Doga (pour chiens)' à 'Yoga pour poissons rouges'",
            "themeB": "Le pire slogan pour une banque. De 'votre argent nous intéresse' à 'on espère que ça va tenir'"
        },
        {
            "id": 428,
            "themeA": "Le titre d'un livre de recettes pour vampires. De 'Cuisiner avec le groupe O-' à '101 façons d'accommoder un touriste'",
            "themeB": "Le pire moment pour avoir une allergie au pollen. De 'au printemps' à 'en étant poursuivi par des abeilles'"
        },
        {
            "id": 429,
            "themeA": "La devise d'un service de nettoyage de scènes de crime. De 'discret et efficace' à 'on fait disparaître les problèmes... et les taches'",
            "themeB": "Le pire sortilège à lancer accidentellement. De 'faire pleuvoir des grenouilles' à 'transformer son pantalon en pudding'"
        },
        {
            "id": 430,
            "themeA": "Un nouveau type de jeu télévisé. De 'quiz culturel' à 'qui peut rester silencieux le plus longtemps ?'",
            "themeB": "La pire chose à dire en se réveillant d'un coma. De 'combien de temps ai-je dormi ?' à 'cinq minutes de plus'"
        },
        {
            "id": 431,
            "themeA": "Le nom d'un nouveau type de monstre de placard. De 'effrayant' à 'qui range juste vos chaussettes'",
            "themeB": "Le pire co-pilote possible. De 'quelqu'un qui dort' à 'un écureuil sous caféine'"
        },
        {
            "id": 432,
            "themeA": "La véritable fonction de l'appendice. De 'inutile' à 'antenne de communication avec les extraterrestres'",
            "themeB": "Le pire moment pour que la batterie de votre prothèse bionique tombe en panne. De 'en plein milieu d'une poignée de main' à 'en train de désamorcer une bombe'"
        },
        {
            "id": 433,
            "themeA": "Le titre d'une émission de télé-réalité sur le Mont Olympe. De 'Les incroyables Dieux Grecs' à 'Zeus cherche l'amour'",
            "themeB": "Le pire bruit à entendre dans un avion. De 'un bébé qui pleure' à 'un 'oups' venant du cockpit'"
        },
        {
            "id": 434,
            "themeA": "Un nouveau type de concours. De 'concours d'éloquence' à 'championnat du monde de regards dans le vide'",
            "themeB": "La pire créature à invoquer avec un cercle satanique. De 'un démon mineur' à 'un expert-comptable très zélé'"
        },
        {
            "id": 435,
            "themeA": "Le nom d'un nouveau type de thé. De 'Thé Vert Sencha' à 'Thé de l'Incertitude'",
            "themeB": "La pire chose à faire pour impressionner son date. De 'parler de soi sans arrêt' à 'jongler avec de la nourriture'"
        },
        {
            "id": 436,
            "themeA": "Le programme politique d'un candidat canin à la mairie. De 'plus de parcs' à 'interdiction des aspirateurs'",
            "themeB": "La pire chose à entendre de la part d'une intelligence artificielle. De 'je ne comprends pas' à 'je comprends, mais je ne suis pas d'accord'"
        },
        {
            "id": 437,
            "themeA": "Le nom d'un nouveau type de festival de musique. De 'Rock en Seine' à 'Festival de la Flûte à bec Électronique'",
            "themeB": "Le pire endroit pour se réveiller après une soirée arrosée. De 'sur le sol de la cuisine' à 'dans un autre pays'"
        },
        {
            "id": 438,
            "themeA": "Le titre d'un film catastrophe. De 'Le Jour d'Après' à 'L'Attaque des Tomates Indigestes'",
            "themeB": "La pire chose à faire quand on croise un ours. De 'courir' à 'lui proposer un câlin'"
        },
        {
            "id": 439,
            "themeA": "Un nouveau type de récompense aux Oscars. De 'Meilleure Bande Originale' à 'Meilleur Cri de Douleur Crédible'",
            "themeB": "Le pire moment pour avoir une envie pressante. De 'dans les bouchons' à 'lors d'une sortie dans l'espace'"
        },
        {
            "id": 440,
            "themeA": "Le nom d'un nouveau type de sport aquatique. De 'natation synchronisée' à 'bataille navale avec des pédalos'",
            "themeB": "La pire phrase d'accroche pour un e-mail de prospection. De 'Cher Monsieur/Madame' à 'Vous ne me connaissez pas, mais j'ai besoin de votre argent'"
        },
        {
            "id": 441,
            "themeA": "La devise d'un barman. De 'à votre service' à 'je suis un thérapeute qui sert de l'alcool'",
            "themeB": "La pire chose à oublier en partant sur une île déserte. De 'un couteau suisse' à 'comment faire du feu'"
        },
        {
            "id": 442,
            "themeA": "Un nouveau type de jeu de cartes. De 'poker' à 'bataille, mais avec des émotions'",
            "themeB": "Le pire moment pour se rendre compte qu'on est le méchant de l'histoire. De 'à la moitié du film' à 'quand les villageois arrivent avec des fourches'"
        },
        {
            "id": 443,
            "themeA": "Le nom d'un nouveau type de police secrète. De 'le FBI' à 'la Brigade des Mauvais Jeux de Mots'",
            "themeB": "La pire coiffure pour un espion. De 'crête iroquoise rose' à 'une coupe mulet phosphorescente'"
        },
        {
            "id": 444,
            "themeA": "La pensée d'un grille-pain. De 'je grille, donc je suis' à 'un jour, je ne m'éjecterai pas'",
            "themeB": "Le pire parfum de bougie parfumée. De 'Bacon' à 'Chien Mouillé'"
        },
        {
            "id": 445,
            "themeA": "Un nouveau type de code de triche dans un jeu vidéo. De 'invincibilité' à 'change la musique en un air d'accordéon'",
            "themeB": "La pire chose à dire à quelqu'un qui est en colère. De 'calme-toi' à 'est-ce que c'est tes hormones ?'"
        },
        {
            "id": 446,
            "themeA": "Le titre d'une exposition d'art conceptuel. De 'Réflexions sur le Vide' à 'Mon chat a marché sur la toile'",
            "themeB": "Le pire super-pouvoir pour quelqu'un qui a le vertige. De 'voler' à 'pouvoir de super-saut'"
        },
        {
            "id": 447,
            "themeA": "Un nouveau type de monstre. De 'terrifiant et énorme' à 'petit, mais extrêmement malpoli'",
            "themeB": "Le pire moment pour une panne de courant. De 'pendant un film d'horreur' à 'pendant une opération du cerveau'"
        },
        {
            "id": 448,
            "themeA": "Le nom d'un nouveau type de sauce pour salade. De 'Vinaigrette César' à 'Émulsion de l'Inattendu'",
            "themeB": "La pire raison de commencer une guerre. De 'un malentendu' à 'une dispute sur la meilleure façon de prononcer un mot'"
        },
        {
            "id": 449,
            "themeA": "Le dialogue entre deux gouttes de pluie avant de s'écraser. De 'on se retrouve en bas' à 'j'ai tout vu, ma vie a été pleine'",
            "themeB": "Le pire meuble à monter soi-même. De 'une bibliothèque' à 'un piano'"
        },
        {
            "id": 450,
            "themeA": "Un nouveau type de sport de contact. De 'boxe' à 'bataille de polochons compétitive'",
            "themeB": "La pire façon d'apprendre que l'on est adopté. De 'par ses parents' à 'en retrouvant son propre avis de recherche sur un carton de lait'"
        },
        {
            "id": 451,
            "themeA": "Le nom d'un nouveau groupe de rock. De 'Les Rolling Stones' à 'Les Chaussettes Orphelines'",
            "themeB": "Le pire vêtement à porter en été. De 'un pull en laine' à 'une combinaison de plongée'"
        },
        {
            "id": 452,
            "themeA": "La pensée d'un livre qui n'a jamais été lu. De 'solitude' à 'je pourrais être un excellent cale-porte'",
            "themeB": "La pire chose à faire dans un musée. De 'toucher les œuvres' à 'essayer de remplacer une statue par soi-même'"
        },
        {
            "id": 453,
            "themeA": "Un nouveau type de parc national. De 'protégeant la faune' à 'préservant des spécimens de moquette des années 70'",
            "themeB": "Le pire moment pour se rendre compte qu'on a oublié son texte. De 'sur scène' à 'en faisant ses vœux de mariage'"
        },
        {
            "id": 454,
            "themeA": "Le nom d'une nouvelle application de productivité. De 'FocusMax' à 'Procrastination Pro'",
            "themeB": "La pire chose à dire à un extra-terrestre. De 'emmenez-moi voir votre chef' à 'vous avez un peu de salade entre les dents'"
        },
        {
            "id": 455,
            "themeA": "Un nouveau type de clown. De 'amusant pour les enfants' à 'qui fait de la philosophie existentielle'",
            "themeB": "Le pire animal pour garder un troupeau de moutons. De 'un loup' à 'un autre mouton'"
        },
        {
            "id": 456,
            "themeA": "La devise d'une équipe de bobsleigh. De 'la vitesse est notre alliée' à 'on espère juste ne pas vomir'",
            "themeB": "La pire chose à découvrir dans un vieux livre. De 'une note' à 'une tranche de fromage'"
        },
        {
            "id": 457,
            "themeA": "Le nom d'un nouveau type de robot ménager. De 'Roomba' à 'ChaosBot 5000'",
            "themeB": "La pire question à poser à un voyageur temporel. De 'avez-vous gagné au loto ?' à 'est-ce que je deviens chauve ?'"
        },
        {
            "id": 458,
            "themeA": "La pensée d'une mauvaise herbe. De 'je veux juste un peu de soleil' à 'l'anarchie règnera sur ce jardin'",
            "themeB": "Le pire moment pour que votre voiture parle. De 'quand vous êtes seul' à 'quand vous critiquez la conduite de quelqu'un d'autre'"
        },
        {
            "id": 459,
            "themeA": "Un nouveau type de jeu de société pour les couples. De 'pour mieux se connaître' à 'test de résistance de la relation'",
            "themeB": "La pire façon de commencer sa journée. De 'renverser son café' à 'se rendre compte que c'est toujours hier'"
        },
        {
            "id": 460,
            "themeA": "Le nom d'un nouveau type de super-pouvoir. De 'contrôler les éléments' à 'pouvoir de parler aux meubles'",
            "themeB": "La pire chose à crier dans un canyon. De 'bonjour' à 'je suis en retard pour mes impôts'"
        },
        {
            "id": 461,
            "themeA": "Le titre d'un manuel pour devenir un dictateur bienveillant. De 'Le Guide du Leader Éclairé' à 'Comment opprimer avec le sourire'",
            "themeB": "Le pire animal à embrasser pour qu'il se transforme en prince. De 'un crapaud' à 'un porc-épic'"
        },
        {
            "id": 462,
            "themeA": "Le nom d'un nouveau type de céréales pour le petit-déjeuner. De 'Crousti-Miel' à 'Fibres de Tristesse'",
            "themeB": "Le pire moment pour découvrir que vous pouvez lire dans les pensées. De 'lors d'un match de poker' à 'lors d'une réunion de famille'"
        },
        {
            "id": 463,
            "themeA": "La devise d'un groupe de ninjas. De 'sois l'ombre' à 'on se voit, mais vous ne nous voyez pas'",
            "themeB": "Le pire accessoire pour un magicien. De 'un chapeau troué' à 'un lapin qui mord'"
        },
        {
            "id": 464,
            "themeA": "Un nouveau type de document officiel. De 'carte d'identité' à 'permis de faire des mauvais jeux de mots'",
            "themeB": "La pire chose à entendre de la part de son dentiste. De 'il va falloir l'enlever' à 'intéressant... je n'avais jamais vu ça'"
        },
        {
            "id": 465,
            "themeA": "Le nom d'un nouveau style de danse. De 'Salsa' à 'La Contorsion du Comptable'",
            "themeB": "Le pire moment pour se rendre compte qu'on est habillé pareil que quelqu'un d'autre. De 'à une fête' à 'à son propre mariage'"
        },
        {
            "id": 466,
            "themeA": "Le titre d'un film sur la vie d'un trombone. De 'La Note Juste' à 'Plié Mais Jamais Brisé'",
            "themeB": "La pire chose à faire lors d'une panne de courant. De 'paniquer' à 'essayer de faire des ombres chinoises angoissantes'"
        },
        {
            "id": 467,
            "themeA": "Un nouveau type de pari sportif. De 'résultat du match' à 'couleur du Gatorade versé sur le coach'",
            "themeB": "Le pire moment pour chanter 'Libérée, délivrée'. De 'seul sous sa douche' à 'lors d'une réunion du conseil d'administration'"
        },
        {
            "id": 468,
            "themeA": "Le nom d'un nouveau type de pain. De 'pain complet' à 'pain de l'incertitude existentielle'",
            "themeB": "La pire chose à dire quand quelqu'un vous montre une photo de son bébé. De 'il vous ressemble' à 'il a l'air... confortable'"
        },
        {
            "id": 469,
            "themeA": "La devise d'un club de philosophes. De 'je pense donc je suis' à 'on se pose la question, mais on a la flemme de chercher la réponse'",
            "themeB": "Le pire endroit pour avoir le hoquet. De 'à la bibliothèque' à 'pendant une opération de déminage'"
        },
        {
            "id": 470,
            "themeA": "Un nouveau type de signal de fumée. De 'appel à l'aide' à 'annonce de la sortie du prochain blockbuster'",
            "themeB": "La pire chose à faire avec une machine à voyager dans le temps pour la première fois. De 'aller voir les dinosaures' à 'juste avancer de 5 minutes pour voir si le thé a infusé'"
        },
        {
            "id": 471,
            "themeA": "Le nom d'un nouveau type de sport olympique. De 'lancer du javelot' à 'cache-cache synchronisé'",
            "themeB": "Le pire compliment à double tranchant. De 'je n'aurais jamais osé porter ça' à 'tu es bien plus intelligent que tu n'en as l'air'"
        },
        {
            "id": 472,
            "themeA": "La pensée d'un nuage. De 'je vais pleuvoir' à 'j'ai une forme de lapin, c'est drôle'",
            "themeB": "La pire chose à découvrir dans le grenier de la maison que vous venez d'acheter. De 'une vieille photo' à 'l'ancien propriétaire'"
        },
        {
            "id": 473,
            "themeA": "Un nouveau type de service client. De 'disponible 24/7' à 'qui répond uniquement en haïkus'",
            "themeB": "Le pire moment pour qu'un personnage de fiction prenne conscience de sa condition. De 'pendant une scène d'action' à 'juste avant de se marier'"
        },
        {
            "id": 474,
            "themeA": "Le nom d'un nouveau type de bonbon. De 'doux et fruité' à 'qui change de goût en fonction de votre humeur'",
            "themeB": "La pire chose à dire lors d'un contrôle de police. De 'je n'ai bu qu'une bière' à 'vous n'avez pas de mandat pour ouvrir ce coffre, n'est-ce pas ?'"
        },
        {
            "id": 475,
            "themeA": "Le titre d'une comédie romantique entre un fantôme et un robot. De 'Amour Immatériel' à 'Mon Cœur Fait Bip Pour Toi'",
            "themeB": "Le pire pouvoir pour un cuisinier. De 'transformer l'or en nourriture' à 'transformer la nourriture en or'"
        },
        {
            "id": 476,
            "themeA": "Un nouveau type de record du monde. De 'le plus rapide' à 'le plus inutilement compliqué'",
            "themeB": "Le pire personnage de jeu vidéo pour vous accompagner dans une quête. De 'celui qui est faible' à 'celui qui déclenche tous les pièges'"
        },
        {
            "id": 477,
            "themeA": "Le nom d'un nouveau type d'instrument de musique. De 'violon' à 'le klaxon mélodique'",
            "themeB": "La pire chose à faire quand on est le seul survivant d'un crash d'avion. De 'pleurer' à 'prendre un selfie'"
        },
        {
            "id": 478,
            "themeA": "La devise d'un jardinier. De 'la main verte' à 'parfois, il faut juste laisser mourir'",
            "themeB": "Le pire moment pour se rendre compte qu'on a mis deux chaussures différentes. De 'en sortant de chez soi' à 'lors d'un entretien pour un poste de styliste'"
        },
        {
            "id": 479,
            "themeA": "Un nouveau type de marathon. De 'courir 42 km' à 'regarder une saison entière d'une série en une fois'",
            "themeB": "La pire chose à demander à un génie de la bouteille. De 'plus de vœux' à 'son avis sur votre nouvelle coupe de cheveux'"
        },
        {
            "id": 480,
            "themeA": "Le nom d'un nouveau type de pizza. De 'Quatre Fromages' à 'La Surprise du Chef (on ne sait pas ce qu'il y a dedans)'",
            "themeB": "La pire chose à faire avec un détecteur de mensonges. De 'mentir' à 'lui raconter des blagues'"
        },
        {
            "id": 481,
            "themeA": "La pensée d'un chewing-gum collé sous une table. De 'l'éternité, c'est long' à 'si seulement j'avais encore du goût'",
            "themeB": "Le pire professeur pour une auto-école. De 'quelqu'un de stressé' à 'un ancien pilote de course de rue'"
        },
        {
            "id": 482,
            "themeA": "Un nouveau type de compétition. De 'sportive' à 'championnat de sieste'",
            "themeB": "Le pire endroit pour cacher un cadeau d'anniversaire. De 'dans l'armoire' à 'dans les mains de la personne concernée'"
        },
        {
            "id": 483,
            "themeA": "Le nom d'un nouveau type de cocktail. De 'Mojito' à 'L'Amnésie Sélective'",
            "themeB": "La pire chose à dire quand on vous prend en flagrant délit. De 'ce n'est pas ce que vous croyez' à 'vous arrivez juste à temps pour le spectacle'"
        },
        {
            "id": 484,
            "themeA": "La devise d'un club de tricot. De 'un point à la fois' à 'tricoter, c'est le nouveau rock'n'roll'",
            "themeB": "Le pire super-pouvoir à avoir un lundi matin. De 'aucun' à 'la capacité de voir à quel point tout le monde est fatigué'"
        },
        {
            "id": 485,
            "themeA": "Un nouveau type de service de livraison. De 'nourriture' à 'câlins à domicile'",
            "themeB": "La pire chose à faire pour se calmer. De 'compter jusqu'à dix' à 'boire cinq expressos'"
        },
        {
            "id": 486,
            "themeA": "Le nom d'un nouveau type de film d'horreur. De 'slasher' à 'horreur administrative'",
            "themeB": "Le pire moment pour que votre pouvoir de téléportation fonctionne mal. De 'dans votre salon' à 'à mi-chemin dans un mur'"
        },
        {
            "id": 487,
            "themeA": "La pensée d'un feu rouge. De 'stop' à 'je me demande ce que ça fait d'être un feu vert'",
            "themeB": "La pire chose à mettre dans une capsule temporelle. De 'une lettre' à 'du yaourt'"
        },
        {
            "id": 488,
            "themeA": "Un nouveau type d'art martial. De 'Karaté' à 'La technique de l'esquive sociale'",
            "themeB": "Le pire invité à un dîner. De 'celui qui critique la nourriture' à 'celui qui amène son propre Tupperware pour les restes'"
        },
        {
            "id": 489,
            "themeA": "Le nom d'un nouveau type de spectacle de magie. De 'grandes illusions' à 'petits trucs qui marchent une fois sur deux'",
            "themeB": "La pire façon de tester la profondeur de l'eau. De 'avec un bâton' à 'avec son beau-frère'"
        },
        {
            "id": 490,
            "themeA": "La devise d'un inventeur. De 'eurêka !' à 'bon, ça n'a pas explosé, c'est déjà ça'",
            "themeB": "Le pire moment pour se rendre compte qu'on a oublié un anniversaire. De 'le jour même' à 'quand la personne vous le rappelle un an plus tard'"
        },
        {
            "id": 491,
            "themeA": "Un nouveau type de document à signer. De 'contrat' à 'pacte de non-agression avec son chat'",
            "themeB": "La pire chose à faire quand on gagne au Monopoly. De 'se vanter' à 'proposer un plan de restructuration de la dette de vos adversaires'"
        },
        {
            "id": 492,
            "themeA": "Le nom d'un nouveau type de société secrète. De 'Les Illuminati' à 'Les Amis du Trombone'",
            "themeB": "Le pire sujet de petite conversation. De 'la pluie et le beau temps' à 'votre dernière coloscopie'"
        },
        {
            "id": 493,
            "themeA": "Un nouveau type de thérapie de groupe. De 'pour les phobies' à 'pour les gens qui finissent toujours la série avant leur partenaire'",
            "themeB": "La pire chose à dire après un baiser. De 'merci' à 'c'était mieux dans mon imagination'"
        },
        {
            "id": 494,
            "themeA": "Le nom d'un nouveau type de robot de combat. De 'Terminator' à 'Le Lançeur de Confettis Mark II'",
            "themeB": "Le pire moment pour crier 'BINGO !'. De 'quand on n'a pas gagné' à 'pendant une messe'"
        },
        {
            "id": 495,
            "themeA": "La devise d'un archéologue. De 'chercher le passé' à 'ne pas casser, ne pas casser, ne pas casser'",
            "themeB": "Le pire livre à lire à la plage. De 'Moby Dick' à 'un livre sur les attaques de requins'"
        },
        {
            "id": 496,
            "themeA": "Un nouveau type de biscuit apéritif. De 'salé et croustillant' à 'qui vous pose des questions philosophiques'",
            "themeB": "La pire chose à faire si vous êtes poursuivi par une horde de zombies. De 'trébucher' à 's'arrêter pour refaire son lacet'"
        }
    ];
    document.getElementById('start-turn-btn').addEventListener('click', () => {
        showScreen('player-turn-screen');
        showPlayerTurn(); // Cette fonction affiche les infos du joueur actuel
    });

    const hotThemes = [
        { "id": 1, "themeA": "La pire excuse pour expliquer un suçon. De 'presque crédible' à 'impliquant des phénomènes surnaturels'", "themeB": "Le nom d'un nouveau cocktail. De 'poétique et invitant' à 'qui sonne comme une menace'" },
        { "id": 2, "themeA": "La chose la plus étrange à murmurer à l'oreille de quelqu'un en soirée. De 'légèrement bizarre' à 'profondément dérangeant'", "themeB": "Une nouvelle règle pour un jeu à boire. De 'amusante' à 'qui termine des amitiés'" },
        { "id": 3, "themeA": "Le titre de ta sextape. De 'banal et ennuyeux' à 'chef-d'œuvre comique'", "themeB": "Le pire endroit pour se réveiller après une fête. De 'juste inconfortable' à 'nécessitant un avocat'" },
        { "id": 4, "themeA": "Le mélange d'alcool le plus improbable. De 'audacieux' à 'crime contre l'humanité'", "themeB": "Le pire moment pour avoir une envie pressante en plein rapport. De 'gênant' à 'catastrophique'" },
        { "id": 5, "themeA": "Un nouveau 'safe word' (mot de sécurité). De 'efficace' à 'complètement absurde et impossible à dire'", "themeB": "La dernière pensée avant de s'évanouir d'ivresse. De 'philosophique' à 'regret instantané'" },
        { "id": 6, "themeA": "La pire chose à dire juste après l'amour. De 'maladroit' à 'motif de rupture immédiate'", "themeB": "La pire garniture pour une pizza de fin de soirée. De 'mauvaise idée' à 'un appel à l'aide'" },
        { "id": 7, "themeA": "Le nom d'une nouvelle position du Kamasutra. De 'sportive' à 'nécessitant une hospitalisation'", "themeB": "Le SMS que tu regrettes le plus d'avoir envoyé en étant ivre. De 'un peu embarrassant' à 'qui te force à changer de numéro'" },
        { "id": 8, "themeA": "La pire réplique de drague pour conclure. De 'ringarde' à 'efficace pour prendre une gifle'", "themeB": "L'objet le plus surprenant à utiliser comme jouet sexuel. De 'créatif' à 'une très, très mauvaise idée'" },
        { "id": 9, "themeA": "Le cocktail qui décrit le mieux ta vie amoureuse. De 'doux et sucré' à 'amer avec un arrière-goût de cendre'", "themeB": "La pire chanson sur laquelle faire un strip-tease. De 'pas du tout sexy' à 'carrément hilarante'" },
        { "id": 10, "themeA": "Ce que tu dis à ton foie le lendemain d'une grosse soirée. De 'des excuses sincères' à 'une promesse de recommencer'", "themeB": "Le pire endroit pour cacher son joint. De 'pas très malin' à 'catastrophique en cas de fouille'" },
        { "id": 11, "themeA": "Le pouvoir d'un super-héros de la fête. De 'utile pour l'ambiance' à 'dangereux pour tout le monde'", "themeB": "La pire chose à faire quand on a une fringale nocturne. De 'regrettable' à 'un crime contre la cuisine'" },
        { "id": 12, "themeA": "Le nom d'un club échangiste. De 'subtil et chic' à 'honteusement direct'", "themeB": "Le niveau de 'je ne bois plus jamais'. De 'promesse du matin' à 'résolution tenue pendant 24h'" },
        { "id": 13, "themeA": "Le pire fantasme à avouer. De 'un peu étrange' à 'qui nécessite une thérapie'", "themeB": "Le message sur un T-shirt pour une tournée des bars. De 'amusant' à 'provocateur'" },
        { "id": 14, "themeA": "Invente un nouveau type de gueule de bois. De 'légèrement désagréable' à 'expérience de mort imminente'", "themeB": "Le pire bruit à entendre pendant que tu fais l'amour. De 'distrayant' à 'fin de l'acte immédiate'" },
        { "id": 15, "themeA": "Le nom d'une nouvelle drogue de synthèse. De 'sonnant comme un bonbon' à 'sonnant comme un produit de nettoyage industriel'", "themeB": "La raison pour laquelle tu es célibataire. De 'plausible' à 'd'une honnêteté brutale'" },
        { "id": 16, "themeA": "La description de ton partenaire idéal. De 'romantique' à 'la liste de quelqu'un qui a abandonné'", "themeB": "Le pire truc à faire dans un jacuzzi. De 'gênant' à 'qui demande de vider le jacuzzi'" },
        { "id": 17, "themeA": "La devise à graver sur une flasque d'alcool. De 'inspirante' à 'inquiétante'", "themeB": "Le pire cadeau à offrir après une nuit passée ensemble. De 'impersonnel' à 'insultant'" },
        { "id": 18, "themeA": "Le nom d'un bar miteux. De 'authentique' à 'qui a probablement des problèmes d'hygiène'", "themeB": "L'activité la plus inappropriée pour un premier rendez-vous. De 'mauvais choix' à 'comment ne plus jamais la revoir'" },
        { "id": 19, "themeA": "La chose la plus stupide faite sur un pari d'ivrogne. De 'ridicule' à 'qui a laissé des cicatrices'", "themeB": "Le pire surnom à donner à ses parties génitales. De 'mignon' à 'médical et déprimant'" },
        { "id": 20, "themeA": "Le nom d'une application de rencontre de niche. De 'spécifique' à 'pour des gens très, très étranges'", "themeB": "La meilleure façon de faire passer une gueule de bois. De 'scientifiquement prouvée' à 'remède de grand-mère suspect'" },
        { "id": 21, "themeA": "La pire chose à découvrir sur quelqu'un en fouillant son portable. De 'petit secret' à 'il faut appeler la police'", "themeB": "Le contenu d'un 'shot' mystère. De 'intrigant' à 'terrifiant'" },
        { "id": 22, "themeA": "Le son que tu fais au moment de l'orgasme. De 'discret' à 'qui réveille les voisins'", "themeB": "La pire boisson sans alcool. De 'juste de l'eau' à 'une punition liquide'" },
        { "id": 23, "themeA": "L'effet secondaire le plus bizarre d'une pilule. De 'amusant' à 'qui change la vie (et pas en bien)'", "themeB": "Le pire endroit pour flirter. De 'inapproprié' à 'complètement interdit'" },
        { "id": 24, "themeA": "Le look idéal pour une 'rave party'. De 'stylé' à 'on dirait une hallucination'", "themeB": "La pire façon de se faire surprendre au lit. De 'gênant' à 'traumatisant pour tout le monde'" },
        { "id": 25, "themeA": "Le nom d'un nouveau jouet pour adulte. De 'technologique' à 'biologiquement curieux'", "themeB": "La pire excuse pour refuser un verre. De 'polie' à 'insultante pour celui qui propose'" },
        { "id": 26, "themeA": "La pensée la plus profonde sous la douche. De 'révélation' à 'purement sexuelle'", "themeB": "Le pire cocktail pour un lendemain de fête. De 'mauvaise idée' à 'aggraver son cas'" },
        { "id": 27, "themeA": "Le plus grand mensonge dit sur un site de rencontre. De 'petit arrangement avec la réalité' à 'usurpation d'identité complète'", "themeB": "Le meilleur remède contre l'haleine d'alcool. De 'efficace' à 'solution désespérée'" },
        { "id": 28, "themeA": "Le nom d'un film porno parodiant un Disney. De 'astucieux' à 'qui ruine ton enfance'", "themeB": "La façon la plus discrète de vomir en soirée. De ' furtive' à 'un échec spectaculaire'" },
        { "id": 29, "themeA": "Le pire sujet de conversation pendant les préliminaires. De 'ennuyeux' à 'tue-l'amour instantané'", "themeB": "Une boisson qui n'aurait jamais dû être alcoolisée. De 'concept étrange' à 'erreur de la nature'" },
        { "id": 30, "themeA": "Le talent le plus inutile en soirée. De 'amusant 5 minutes' à 'fait fuir les gens'", "themeB": "Le pire endroit pour avoir un trou de mémoire. De 'un peu flou' à 'dans un poste de police sans savoir pourquoi'" },
        { "id": 31, "themeA": "Invente une maladie sexuellement transmissible imaginaire. De 'juste un peu gênante' à 'terrifiante et spectaculaire'", "themeB": "Le pire moment pour réaliser que tu as pris la mauvaise drogue. De 'ambiance différente' à 'je ne suis pas dans le bon univers'" },
        { "id": 32, "themeA": "Le nom d'une nouvelle application de rencontre ultra-spécifique. De 'pour une niche' à 'pour seulement trois personnes dans le monde'", "themeB": "Le cocktail signature d'un enterrement de vie de garçon/jeune fille. De 'festif' à 'qui efface la mémoire'" },
        { "id": 33, "themeA": "La pire chose à découvrir chez ton plan cul le lendemain matin. De 'un peu bizarre' à 'qui te fait partir en courant'", "themeB": "La justification la plus créative pour boire de l'alcool au petit-déjeuner. De 'presque légitime' à 'signe d'un problème plus profond'" },
        { "id": 34, "themeA": "Le nom d'une nouvelle marque de préservatifs. De 'rassurant et médical' à 'hilarant et peu sérieux'", "themeB": "La pire fringale possible. De 'classique' à 'combinaison d'aliments interdite par la nature'" },
        { "id": 35, "themeA": "Le règlement intérieur d'une backroom. De 'sensé' à 'on se demande ce qui a bien pu se passer pour écrire ça'", "themeB": "Le pire jeu à boire. De 'celui où on ne boit jamais' à 'celui qui envoie directement à l'hôpital'" },
        { "id": 36, "themeA": "La description de ton premier orgasme. De 'timide et confus' à 'un événement sismique'", "themeB": "Le pire conseil à donner à quelqu'un qui tient mal l'alcool. De 'inutile' à 'dangereux'" },
        { "id": 37, "themeA": "Invente un nouveau fétichisme. De 'plutôt commun' à 'qui nécessite beaucoup d'accessoires et d'explications'", "themeB": "Le nom d'une nouvelle variété de cannabis. De 'qui invite à la sieste' à 'qui invite à la paranoïa'" },
        { "id": 38, "themeA": "Le message que tu laisses sur la table de nuit après une nuit torride. De 'mignon' à 'cryptique et inquiétant'", "themeB": "Le pire moment pour être à court d'alcool dans une fête. De 'dommage' à 'la fin de la civilisation'" },
        { "id": 39, "themeA": "Le titre d'un porno éducatif. De 'informatif' à 'totalement absurde'", "themeB": "La pire façon de réagir en voyant quelqu'un vomir. De 'empathique' à 'qui déclenche une réaction en chaîne'" },
        { "id": 40, "themeA": "Le pire endroit pour avoir une érection. De 'gênant' à 'catastrophe diplomatique'", "themeB": "La définition d'un 'verre de trop'. De 'celui qui rend joyeux' à 'celui qui fait appeler son ex'" },
        { "id": 41, "themeA": "Le talent le plus sexy. De 'classique' à 'étrangement attirant'", "themeB": "Le pire mélange pour un 'space cake'. De 'sans effet' à 'voyage vers une autre dimension'" },
        { "id": 42, "themeA": "La bio de profil sur une application de rencontre, si elle était 100% honnête. De 'un peu triste' à 'effrayante'", "themeB": "Le pire barman. De 'lent' à 'qui se trompe dans toutes les commandes'" },
        { "id": 43, "themeA": "Le nom d'un club de strip-tease avec un jeu de mots. De 'amusant' à 'vraiment de mauvais goût'", "themeB": "La pire chose à faire sous l'influence de l'alcool. De 'envoyer un SMS' à 'se faire un tatouage sur le visage'" },
        { "id": 44, "themeA": "La pire excuse pour refuser une avance sexuelle. De 'gentille' à 'brutalement honnête'", "themeB": "L'évolution d'une conversation de soirée. De 'philosophique' à 'incohérente et à base de cris'" },
        { "id": 45, "themeA": "Le bruit le plus gênant pendant le sexe. De 'un grincement de lit' à 'l'arrivée de tes parents'", "themeB": "Le nom d'une nouvelle boisson énergisante. De 'prometteur' à 'qui sonne illégal'" },
        { "id": 46, "themeA": "La tenue la plus inappropriée pour un 'after'. De 'trop habillé' à 'pas assez habillé du tout'", "themeB": "L'objet le plus étrange utilisé pour rouler un joint. De 'ingénieux' à 'un acte de désespoir'" },
        { "id": 47, "themeA": "Le pire compliment à faire sur les performances de quelqu'un au lit. De 'maladroit' à 'insultant'", "themeB": "Le niveau de regret le lendemain d'une cuite. De 'j'ai un peu mal à la tête' à 'je dois changer d'identité et de pays'" },
        { "id": 48, "themeA": "Le pire secret à révéler pendant un 'Action ou Vérité'. De 'un peu honteux' à 'qui brise des vies'", "themeB": "Le cocktail qui te représente le mieux. De 'simple et classique' à 'complexe et dangereux'" },
        { "id": 49, "themeA": "Le nom d'un gode. De 'réaliste' à 'fantaisiste et intimidant'", "themeB": "La pire chose à commander à 4h du matin. De 'trop gras' à 'une abomination culinaire'" },
        { "id": 50, "themeA": "La pire façon de découvrir l'infidélité de son partenaire. De 'subtile' à 'en direct à la télévision'", "themeB": "Le symptôme d'une soirée trop arrosée. De 'la fatigue' à 'la perte de dignité'" },
        { "id": 51, "themeA": "Le nom d'un lubrifiant. De 'fonctionnel' à 'qui promet des choses impossibles'", "themeB": "Le pire DJ pour une soirée. De 'celui qui passe des musiques tristes' à 'celui qui ne sait pas mixer'" },
        { "id": 52, "themeA": "Le pire endroit pour cacher un sex toy. De 'évident' à 'qui garantit une découverte embarrassante'", "themeB": "L'étape de l'ivresse. De 'je suis juste joyeux' à 'je parle aux plantes'" },
        { "id": 53, "themeA": "Le fantasme le plus surprenant. De 'classique' à 'qui demande un doctorat en logistique'", "themeB": "Le titre d'un guide de survie pour les festivals. De 'pratique' à 'pessimiste'" },
        { "id": 54, "themeA": "La pire chose à entendre de la part de son partenaire après le sexe. De 'une critique' à 'le prénom de son ex'", "themeB": "Le pire type de danseur en boîte. De 'celui qui ne bouge pas' à 'celui qui est un danger public'" },
        { "id": 55, "themeA": "Le nom d'un bordel thématique. De 'immersif' à 'ridiculement absurde'", "themeB": "Le cocktail le plus dangereux à préparer. De 'inflammable' à 'radioactif'" },
        { "id": 56, "themeA": "La question la plus gênante posée par un enfant sur le sexe. De 'innocente' à 'qui demande l'intervention d'un biologiste'", "themeB": "La pire décision prise sous l'effet de la drogue. De 'manger tout le frigo' à 'vendre son rein sur internet'" },
        { "id": 57, "themeA": "Le titre d'un livre érotique. De 'sensuel' à 'hilarant de nullité'", "themeB": "Le pire compagnon de beuverie. De 'celui qui ne boit pas' à 'celui qui te fait faire des bêtises'" },
        { "id": 58, "themeA": "Le pire endroit pour faire l'amour. De 'inconfortable' à 'illégal et moralement discutable'", "themeB": "Le niveau de difficulté pour rentrer chez soi après une soirée. De 'un peu zigzagant' à 'une quête épique'" },
        { "id": 59, "themeA": "L'utilisation la plus créative de la nourriture pendant le sexe. De 'sensuel' à 'il va falloir tout nettoyer'", "themeB": "La pire phrase pour trinquer. De 'banale' à 'qui porte malheur'" },
        { "id": 60, "themeA": "La tenue pour un 'walk of shame'. De 'discrète' à 'costume de la veille impossible à cacher'", "themeB": "Le pire snack à manger au lit. De 'celui qui fait des miettes' à 'celui qui tache les draps pour toujours'" },
        { "id": 61, "themeA": "Le nom d'un nouveau shot. De 'celui qui lance la soirée' à 'celui qui la termine instantanément'", "themeB": "Le pire type de préliminaires. De 'inexistant' à 'trop long et bizarre'" },
        { "id": 62, "themeA": "La pire chose à se tatouer lors d'une nuit d'ivresse. De 'une faute d'orthographe' à 'le visage de son pire ennemi'", "themeB": "Le juron le plus créatif quand on se fait mal pendant l'amour. De 'classique' à 'poétique et imagé'" },
        { "id": 63, "themeA": "Le nom d'une nouvelle application pour trouver des plans à trois. De 'discrète' à 'brutalement honnête'", "themeB": "Le pire aliment contre la gueule de bois. De 'inefficace' à 'qui aggrave les choses'" },
        { "id": 64, "themeA": "La pire façon de draguer son/sa prof. De 'maladroite' à 'qui vaut un renvoi définitif'", "themeB": "L'effet d'une potion d'amour. De 'subtil' à 'obsessionnel et effrayant'" },
        { "id": 65, "themeA": "Le pire bruit de pet. De 'silencieux mais mortel' à 'bruyant et honteux'", "themeB": "Le niveau de paranoïa après un joint. De 'légère méfiance' à 'le FBI écoute à travers le micro-ondes'" },
        { "id": 66, "themeA": "Le nom d'un bar où les ruptures sont la spécialité. De 'mélancolique' à 'brutal'", "themeB": "La chose la plus étrange demandée par un partenaire au lit. De 'inhabituelle' à 'qui demande un temps de réflexion'" },
        { "id": 67, "themeA": "Le pire cadeau d'enterrement de vie de célibataire. De 'gênant' à 'qui pourrait annuler le mariage'", "themeB": "Le pire moment pour roter. De 'impoli' à 'pendant un baiser passionné'" },
        { "id": 68, "themeA": "Le nom d'une agence d'escortes de luxe. De 'chic' à 'prétentieux'", "themeB": "La pire boisson à boire cul-sec. De 'désagréable' à 'un véritable défi de survie'" },
        { "id": 69, "themeA": "La pire chose à hurler pendant un orgasme. De 'le mauvais prénom' à 'une information fiscale'", "themeB": "La pire justification pour ne pas mettre de préservatif. De 'stupide' à 'complètement irresponsable'" },
        { "id": 70, "themeA": "Le nom d'un nouveau fétichisme des pieds. De 'classique' à 'impliquant des chaussures de ski'", "themeB": "Le pire endroit pour avoir la 'gerbe'. De 'discret' à 'sur quelqu'un d'important'" },
        { "id": 71, "themeA": "La pire discussion à avoir sur l'oreiller. De 'sérieuse' à 'qui ruine l'ambiance pour toujours'", "themeB": "La pire excuse pour expliquer pourquoi on est défoncé. De 'peu crédible' à 'totalement absurde'" },
        { "id": 72, "themeA": "Le nom d'un calendrier de pompiers sexy. De 'classique' à 'étrangement spécifique'", "themeB": "La pire personne avec qui être coincé en descente. De 'quelqu'un de calme' à 'quelqu'un en pleine crise existentielle'" },
        { "id": 73, "themeA": "Le pire accessoire pour faire l'amour. De 'inutile' à 'dangereux'", "themeB": "Le pire conseil pour quelqu'un qui n'a jamais bu. De 'prudent' à 'un plan pour le désastre'" },
        { "id": 74, "themeA": "Le titre d'un tuto de sexe sur YouTube. De 'éducatif' à 'démonétisé instantanément'", "themeB": "Le pire shot pour commencer une soirée. De 'trop fort' à 'celui au goût de regret'" },
        { "id": 75, "themeA": "La pire chose à avouer pendant un jeu d'alcool. De 'un petit secret' à 'un crime fédéral'", "themeB": "Le nom d'une poupée gonflable. De 'générique' à 'portant le prénom de votre mère'" },
        { "id": 76, "themeA": "La pire façon de réagir à une déclaration d'amour. De 'gênée' à 'cruelle'", "themeB": "Le pire moment pour se rendre compte qu'on est trop vieux pour ces conneries. De 'en début de soirée' à 'au milieu du 'mosh pit''" },
        { "id": 77, "themeA": "Le pire endroit pour se faire faire une fellation/un cunnilingus. De 'inconfortable' à 'extrêmement public'", "themeB": "Le pire cocktail sans alcool. De 'fade' à 'un jus de fruit trop sucré qui coûte 15 euros'" },
        { "id": 78, "themeA": "Le nom d'un site porno de niche. De 'très spécifique' à 'qui ne devrait pas exister'", "themeB": "La pire danse de la séduction. De 'maladroite' à 'un appel à l'aide'" },
        { "id": 79, "themeA": "La chose la plus inattendue qui puisse tuer l'ambiance au lit. De 'un coup de téléphone' à 'un commentaire sur la décoration'", "themeB": "Le niveau de désespoir d'un 'booty call'. De 'spontané' à 'pathétique'" },
        { "id": 80, "themeA": "La pire question à poser à un ou une strip-teaseuse. De 'naïve' à 'insultante'", "themeB": "Le pire moment pour que les effets de la drogue se dissipent. De 'en plein fou rire' à 'en pleine conversation avec un policier'" }
    ];

    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const playerNamesContainer = document.getElementById('player-names-container');
    const playerCountInput = document.getElementById('player-count');
    const mainHeader = document.getElementById('main-header');

    // Boutons Navigation / Setup
    const newGameBtn = document.getElementById('new-game-btn');
    const hotGameBtn = document.getElementById('hot-game-btn');
    const customGameSetupBtn = document.getElementById('custom-game-setup-btn');
    const rulesBtn = document.getElementById('rules-btn');
    const globalHomeBtn = document.getElementById('global-home-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');

    // Boutons Jeu
    const startGameBtn = document.getElementById('start-game-btn');
    const themeACard = document.getElementById('theme-a-card');
    const themeBCard = document.getElementById('theme-b-card');
    const validateCustomThemeBtn = document.getElementById('validate-custom-theme-btn');
    const startTurnBtn = document.getElementById('start-turn-btn');
    const submitResponseBtn = document.getElementById('submit-response-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');

    // Inputs Specifiques
    const hotModeToggle = document.getElementById('hot-mode-toggle');

    // Mode Custom
    const inputContext = document.getElementById('custom-context');
    const inputOptionA = document.getElementById('custom-option-a');
    const inputOptionB = document.getElementById('custom-option-b');
    const addCustomThemeBtn = document.getElementById('add-custom-theme-btn');
    const customThemesList = document.getElementById('custom-themes-list');
    const startCustomGameBtn = document.getElementById('start-custom-game-btn');
    const customThemeCount = document.getElementById('custom-theme-count');

    // --- Game State ---
    let gameState = {};
    let customThemesBuffer = [];

    // --- ALGORITHME DE MÉLANGE (Fisher-Yates) ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- NAVIGATION ---
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) targetScreen.classList.add('active');

        if (screenId === 'home-screen') {
            mainHeader.style.display = 'none';
            document.body.classList.remove('has-header');
        } else {
            mainHeader.style.display = 'block';
            document.body.classList.add('has-header');
        }
    }

    // --- INITIALISATION ---
    function initGame() {
        const savedState = sessionStorage.getItem('topTenGameState');
        if (savedState) {
            try {
                gameState = JSON.parse(savedState);
                if (gameState && gameState.gamePhase) {
                    resumeGame();
                    return;
                }
            } catch (e) {
                console.error("Erreur sauvegarde", e);
            }
        }
        showScreen('home-screen');
    }

    function saveState() {
        sessionStorage.setItem('topTenGameState', JSON.stringify(gameState));
    }

    // --- CRÉATION DE PARTIE ---
    function createNewGame(mode = 'standard') {
        sessionStorage.removeItem('topTenGameState');

        if (hotModeToggle) hotModeToggle.checked = (mode === 'hot');

        gameState = {
            players: [],
            totalScore: 0,
            currentRound: 0,
            maxRounds: 5,
            gamePhase: 'setup',
            mode: mode,
            customThemes: []
        };

        const setupTitle = document.querySelector('#setup-screen h2');
        if (setupTitle) {
            if (mode === 'hot') setupTitle.textContent = "Configuration HOT 🌶️";
            else setupTitle.textContent = "Configuration";
        }

        const setupOptionDiv = document.querySelector('.setup-option');
        if (setupOptionDiv) {
            setupOptionDiv.style.display = (mode === 'custom') ? 'none' : 'flex';
        }

        saveState();
        updatePlayerNameInputs();
        showScreen('setup-screen');
    }

    // --- SETUP JOUEURS ---
    function updatePlayerNameInputs() {
        if (!playerCountInput) return;
        const count = parseInt(playerCountInput.value);
        playerNamesContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Prénom du joueur ${i + 1}`;
            input.className = 'player-name-input';
            input.dataset.index = i;
            playerNamesContainer.appendChild(input);
        }
    }

    function startGame() {
        // --- CORRECTION ICI ---
        // On cherche les inputs UNIQUEMENT dans le conteneur des noms
        const container = document.getElementById('player-names-container');
        const nameInputs = container.querySelectorAll('.player-name-input');
        // ----------------------

        if (!nameInputs || nameInputs.length === 0) {
            alert("Erreur : Aucun joueur trouvé !");
            return;
        }

        // On crée la liste des joueurs
        gameState.players = Array.from(nameInputs).map((input, i) => ({
            name: input.value.trim() || `Joueur ${i + 1}`
        }));

        // Petit log pour vérifier dans la console combien de joueurs sont détectés
        console.log(`Partie lancée avec ${gameState.players.length} joueurs.`);

        if (gameState.mode !== 'custom' && hotModeToggle && hotModeToggle.checked) {
            gameState.mode = 'hot';
        }

        startNewRound();
    }

    // --- MODE CUSTOM ---
    function openCustomSetup() {
        customThemesBuffer = [];
        updateCustomListUI();
        showScreen('custom-setup-screen');
    }

    function addCustomTheme() {
        const context = inputContext.value.trim();
        const minVal = inputOptionA.value.trim();
        const maxVal = inputOptionB.value.trim();

        if (context && minVal && maxVal) {
            customThemesBuffer.push({ context: context, min: minVal, max: maxVal });
            inputContext.value = '';
            inputOptionA.value = '';
            inputOptionB.value = '';
            inputContext.focus();
            updateCustomListUI();
        } else {
            alert("Remplissez les 3 champs !");
        }
    }

    function updateCustomListUI() {
        customThemesList.innerHTML = '';
        customThemesBuffer.forEach((t, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${index + 1}.</strong> ${t.context} <br><small>1: ${t.min} | 10: ${t.max}</small>`;
            customThemesList.appendChild(li);
        });
        customThemeCount.textContent = customThemesBuffer.length;
        startCustomGameBtn.disabled = customThemesBuffer.length === 0;
    }

    function startCustomGame() {
        createNewGame('custom');
        gameState.maxRounds = customThemesBuffer.length;
        gameState.customThemes = [...customThemesBuffer];
        saveState();
    }

    // --- LOGIQUE DE JEU ---

    function startNewRound() {
        gameState.currentRound++;
        gameState.roundData = {
            captainIndex: (gameState.currentRound - 1) % gameState.players.length,
            theme: null,
            responses: [],
        };
        gameState.gamePhase = 'theme';
        showThemeSelection();
        saveState();
    }

    function showThemeSelection() {
        const captain = gameState.players[gameState.roundData.captainIndex];
        document.getElementById('captain-name-theme').textContent = captain.name;

        const standardZone = document.getElementById('standard-theme-selection');
        const customZone = document.getElementById('custom-theme-display');

        if (gameState.mode === 'custom') {
            standardZone.style.display = 'none';
            customZone.style.display = 'block';

            const nextTheme = gameState.customThemes.shift();
            if (nextTheme) {
                document.getElementById('display-custom-context').textContent = nextTheme.context;
                document.getElementById('display-custom-min').textContent = nextTheme.min;
                document.getElementById('display-custom-max').textContent = nextTheme.max;
                gameState.roundData.theme = `${nextTheme.context} (1: ${nextTheme.min} | 10: ${nextTheme.max})`;
            } else {
                showFinalScreen();
                return;
            }
        } else {
            standardZone.style.display = 'block';
            customZone.style.display = 'none';

            let themePool = (gameState.mode === 'hot') ? [...hotThemes] : [...themes];
            shuffleArray(themePool);

            const t1 = themePool[0];
            const t2 = themePool[1];

            gameState.roundData.themeChoices = { A: t1, B: t2 };
            document.getElementById('theme-a').textContent = t1.themeA;
            document.getElementById('theme-b').textContent = t2.themeB;
        }
        showScreen('theme-screen');
    }

    function selectTheme(choice) {
        const choices = gameState.roundData.themeChoices;
        gameState.roundData.theme = (choice === 'A') ? choices.A.themeA : choices.B.themeB;
        assignNumbersAndStartTurns();
    }

    function assignNumbersAndStartTurns() {
        // 1. On s'assure que la liste est VIDE avant de commencer
        gameState.roundData.responses = [];

        const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
        const shuffledNumbers = shuffleArray(numbers);

        // 2. On identifie les joueurs (tout le monde sauf le capitaine)
        let availablePlayersIndices = [];
        for (let i = 0; i < gameState.players.length; i++) {
            if (i !== gameState.roundData.captainIndex) availablePlayersIndices.push(i);
        }

        // 3. On remplit la liste des réponses (cette boucle est finie)
        availablePlayersIndices.forEach((pIdx, i) => {
            gameState.roundData.responses.push({
                playerId: pIdx,
                playerName: gameState.players[pIdx].name,
                number: shuffledNumbers[i],
                response: ''
            });
        });

        // 4. On trie pour suivre l'ordre des joueurs
        gameState.roundData.responses.sort((a, b) => a.playerId - b.playerId);

        // 5. On démarre au premier joueur (Index 0)
        gameState.roundData.currentPlayerTurn = 0;
        gameState.gamePhase = 'player-turn';

        showTransitionScreen();
        saveState();
    }

    function showTransitionScreen() {
        const currentRes = gameState.roundData.responses[gameState.roundData.currentPlayerTurn];

        // SECURITÉ ANTI BOUCLE INFINIE
        // Si on arrive ici mais qu'il n'y a plus de joueur dans la liste, on coupe court.
        if (!currentRes) {
            console.log("Fin des joueurs atteinte, lancement Capitaine.");
            startCaptainPhase();
            return;
        }

        document.getElementById('transition-player-name').textContent = currentRes.playerName;
        showScreen('transition-screen');
    }

    function showPlayerTurn() {
        const currentRes = gameState.roundData.responses[gameState.roundData.currentPlayerTurn];

        // Double sécurité
        if (!currentRes) {
            startCaptainPhase();
            return;
        }

        document.getElementById('player-turn-title').textContent = `Au tour de ${currentRes.playerName}`;
        document.getElementById('current-theme').textContent = gameState.roundData.theme;
        document.getElementById('secret-number').textContent = currentRes.number;
        document.getElementById('player-response-input').value = '';

        showScreen('player-turn-screen');
    }

    function submitPlayerResponse() {
        const input = document.getElementById('player-response-input');
        const val = input.value.trim();

        if (!val) {
            alert("Il faut répondre !");
            return;
        }

        // 1. Sauvegarder la réponse
        gameState.roundData.responses[gameState.roundData.currentPlayerTurn].response = val;

        // 2. Passer au joueur suivant
        gameState.roundData.currentPlayerTurn++;

        // 3. VÉRIFICATION STRICTE : Est-ce qu'on a dépassé le dernier joueur ?
        // Si on a 4 joueurs (indices 0, 1, 2, 3). Quand turn passe à 4, c'est fini.
        if (gameState.roundData.currentPlayerTurn >= gameState.roundData.responses.length) {
            startCaptainPhase();
        } else {
            showTransitionScreen();
        }

        saveState();
    }

    function startCaptainPhase() {
        gameState.gamePhase = 'captain';
        const captain = gameState.players[gameState.roundData.captainIndex];
        document.getElementById('captain-name-sort').textContent = captain.name;

        const container = document.getElementById('sortable-responses');
        container.innerHTML = '';

        const shuffledResponses = shuffleArray([...gameState.roundData.responses]);

        shuffledResponses.forEach(res => {
            const div = document.createElement('div');
            div.className = 'sortable-item';
            div.dataset.originalNumber = res.number;
            div.dataset.playerName = res.playerName;
            div.innerHTML = `
                <span class="drag-handle">☰</span>
                <div class="content">
                    <strong>${res.playerName}</strong>
                    <p>${res.response}</p>
                </div>
            `;
            container.appendChild(div);
        });

        if (window.sortableInstance) window.sortableInstance.destroy();
        window.sortableInstance = new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            handle: '.sortable-item'
        });

        showScreen('captain-screen');
        saveState();
    }

    function calculateScore() {
        const items = document.querySelectorAll('#sortable-responses .sortable-item');
        const correctOrder = [...gameState.roundData.responses].sort((a, b) => a.number - b.number);

        let roundScore = 0;
        let html = `<div class="result-column"><h3>Ordre du CAP'TEN</h3><ul class="result-list">`;

        items.forEach((item, index) => {
            const placedNum = parseInt(item.dataset.originalNumber);
            const correctNum = correctOrder[index].number;
            const playerName = item.dataset.playerName;
            const text = item.querySelector('p').textContent;

            const isCorrect = (placedNum === correctNum);
            if (isCorrect) roundScore++;

            html += `<li class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <span class="badge">${placedNum}</span> <strong>${playerName}</strong>: ${text}
            </li>`;
        });
        html += `</ul></div>`;

        html += `<div class="result-column"><h3>Solution Parfaite</h3><ul class="result-list">`;
        correctOrder.forEach(res => {
            html += `<li class="result-item correct">
                <span class="badge">${res.number}</span> <strong>${res.playerName}</strong>: ${res.response}
            </li>`;
        });
        html += `</ul></div>`;

        gameState.totalScore += roundScore;
        gameState.gamePhase = 'results';

        document.getElementById('round-score').textContent = `${roundScore} / ${correctOrder.length}`;
        document.getElementById('total-score-display').textContent = gameState.totalScore;
        document.getElementById('result-comparison').innerHTML = html;

        if (gameState.currentRound >= gameState.maxRounds) {
            nextRoundBtn.style.display = 'none';
            endGameBtn.style.display = 'block';
        } else {
            nextRoundBtn.style.display = 'block';
            endGameBtn.style.display = 'none';
        }

        showScreen('round-result-screen');
        saveState();
    }

    function showFinalScreen() {
        document.getElementById('final-total-score').textContent = gameState.totalScore;
        const maxPossible = gameState.maxRounds * (gameState.players.length - 1);
        const percent = (gameState.totalScore / maxPossible) * 100;
        const msgEl = document.getElementById('final-performance-message');

        if (percent >= 80) msgEl.textContent = "Légendaire ! Vous êtes connectés par la pensée ! 🧠✨";
        else if (percent >= 50) msgEl.textContent = "Pas mal du tout ! Belle équipe. 👏";
        else msgEl.textContent = "C'était... le chaos. Mais c'était drôle ? 💩";

        showScreen('final-screen');
    }

    function resumeGame() {
        switch (gameState.gamePhase) {
            case 'setup': updatePlayerNameInputs(); showScreen('setup-screen'); break;
            case 'theme': showThemeSelection(); break;
            case 'player-turn': showTransitionScreen(); break;
            case 'captain': startCaptainPhase(); break;
            case 'results': calculateScore(); break;
            default: showScreen('home-screen');
        }
    }

    // --- EVENT LISTENERS ---

    newGameBtn.addEventListener('click', () => createNewGame('standard'));
    hotGameBtn.addEventListener('click', () => createNewGame('hot'));
    customGameSetupBtn.addEventListener('click', openCustomSetup);
    rulesBtn.addEventListener('click', () => showScreen('rules-screen'));

    playerCountInput.addEventListener('change', updatePlayerNameInputs);
    startGameBtn.addEventListener('click', startGame);

    addCustomThemeBtn.addEventListener('click', addCustomTheme);
    startCustomGameBtn.addEventListener('click', startCustomGame);

    themeACard.addEventListener('click', () => selectTheme('A'));
    themeBCard.addEventListener('click', () => selectTheme('B'));
    validateCustomThemeBtn.addEventListener('click', () => assignNumbersAndStartTurns());

    startTurnBtn.addEventListener('click', () => {
        showScreen('player-turn-screen');
        showPlayerTurn();
    });
    submitResponseBtn.addEventListener('click', submitPlayerResponse);

    submitOrderBtn.addEventListener('click', calculateScore);
    nextRoundBtn.addEventListener('click', startNewRound);
    endGameBtn.addEventListener('click', showFinalScreen);

    restartGameBtn.addEventListener('click', () => createNewGame('standard'));
    if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => showScreen('home-screen'));

    globalHomeBtn.addEventListener('click', () => {
        if (confirm("Quitter la partie en cours ?")) {
            sessionStorage.removeItem('topTenGameState');
            showScreen('home-screen');
        }
    });

    initGame();
});