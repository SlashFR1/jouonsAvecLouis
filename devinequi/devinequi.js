

/* =========================================
   DONNÉES (JSON MOCK)
   ========================================= */

const THEMES = {
    classique: [
        "Donne ton avis sur le télétravail",
        "Parle de l’école aujourd’hui",
        "Que penses-tu des réseaux sociaux ?",
        "Donne ton avis sur les IA",
        "Raconte tes dernières vacances",
        "Ta recette de cuisine préférée",
        "Pourquoi les chats dominent le monde",
        "Le meilleur super-pouvoir à avoir",
        "Ton endroit préféré dans ta ville",
        "Une invention qui te faciliterait la vie",
        "Ton livre préféré et pourquoi",
        "Ton film préféré et pourquoi",
        "Un hobby que tu aimerais commencer",
        "Ta saison préférée et pourquoi",
        "Ton plat préféré pour le petit déjeuner",
        "Une activité relaxante après une longue journée",
        "Ton sport favori à regarder ou pratiquer",
        "Un animal que tu aimerais avoir comme compagnon",
        "Ton endroit idéal pour les vacances",
        "Une compétence que tu aimerais apprendre",
        "Ton dessin animé préféré",
        "Une expérience qui t’a fait rire récemment",
        "Ton personnage historique préféré",
        "Un objet que tu ne pourrais pas oublier en voyage",
        "Ton endroit préféré pour lire ou écouter de la musique",
        "Ton jeu de société préféré",
        "Un métier que tu aimerais tester",
        "Ton plat préféré pour le dîner",
        "Une journée parfaite selon toi",
        "Ton personnage de fiction préféré",
        "Ton meilleur souvenir d’enfance",
        "Ton moyen de transport préféré",
        "Une ville que tu aimerais visiter",
        "Ton festival ou événement préféré",
        "Ton loisir préféré en hiver",
        "Ton loisir préféré en été",
        "Une chose que tu collectionnes ou aimerais collectionner",
        "Ton endroit préféré pour te promener",
        "Un objet qui te rend heureux",
        "Un instrument de musique que tu aimerais savoir jouer",
        "Ton dessert préféré",
        "Une invention du futur qui te fascine",
        "Ton moyen préféré pour te détendre",
        "Une série télé que tu adores",
        "Ton plat préféré pour le goûter",
        "Un jeu vidéo que tu aimes",
        "Une compétence pratique que tu admires",
        "Une chose insolite que tu as vue récemment",
        "Ton acteur ou actrice préféré(e)",
        "Ton animal sauvage préféré",
        "Ton super-héros préféré",
        "Ton accessoire de mode favori",
        "Un loisir que tu aimerais tester",
        "Une activité créative que tu aimes",
        "Ton sport préféré à pratiquer",
        "Ton moyen de communication favori",
        "Une personne qui t’inspire",
        "Ton pays préféré à visiter",
        "Ton fruit préféré",
        "Ton légume préféré",
        "Ton petit-déjeuner idéal",
        "Un objet utile pour le quotidien",
        "Ton film d’animation préféré",
        "Ton endroit préféré pour faire du sport",
        "Une invention que tu détestes",
        "Une invention que tu adores",
        "Une tradition familiale que tu aimes",
        "Un cadeau idéal selon toi",
        "Ton moyen préféré pour voyager",
        "Ton loisir créatif préféré",
        "Une activité que tu trouves relaxante",
        "Ton moyen préféré pour écouter de la musique",
        "Ton endroit préféré pour manger dehors",
        "Une habitude quotidienne que tu aimes",
        "Ton objet technologique favori",
        "Ton moyen préféré pour apprendre quelque chose de nouveau",
        "Un animal que tu trouves drôle",
        "Une activité sportive que tu aimerais essayer",
        "Ton endroit préféré dans la nature",
        "Ton moyen préféré pour passer le temps",
        "Ton jeu de cartes préféré",
        "Ton endroit préféré pour te reposer",
        "Une compétence que tu admires chez les autres",
        "Une expérience amusante que tu as vécue",
        "Ton endroit préféré pour rencontrer des amis",
        "Ton activité préférée le weekend",
        "Un objet qui te rend nostalgique",
        "Ton moyen préféré pour te déplacer en ville",
        "Ton fruit exotique préféré",
        "Une activité que tu fais souvent",
        "Ton plat préféré pour les fêtes",
        "Une activité relaxante à la maison",
        "Ton dessert préféré en été",
        "Ton jeu de société préféré en famille",
        "Ton endroit préféré pour faire des photos",
        "Une tradition que tu aimerais instaurer",
        "Ton loisir préféré quand il pleut",
        "Ton endroit préféré pour écouter un podcast",
        "Ton moyen préféré pour te réveiller",
        "Ton activité préférée après l’école ou le travail",
        "Une activité manuelle que tu aimes",
        "Ton repas préféré entre amis",
        "Ton moyen préféré pour te concentrer",
        "Ton accessoire technologique préféré",
        "Une activité que tu trouves relaxante en vacances",
        "Ton endroit préféré pour lire un livre",
        "Une compétence que tu aimerais transmettre",
        "Ton endroit préféré pour prendre l’air",
        "Ton endroit préféré pour une balade",
        "Ton plat préféré pour un dîner rapide",
        "Ton moment préféré de la journée",
        "Ton activité préférée en groupe",
        "Ton loisir préféré en solo",
        "Ton moyen préféré pour te divertir",
        "Une chose que tu fais souvent avec tes amis",
        "Ton endroit préféré pour rêver",
        "Ton endroit préféré pour observer les étoiles",
        "Ton plat préféré pour un pique-nique",
        "Ton moyen préféré pour pratiquer le sport",
        "Ton dessert préféré en hiver",
        "Ton endroit préféré pour écouter de la musique",
        "Ton moment préféré en vacances",
        "Ton activité préférée pour apprendre",
        "Ton endroit préféré pour dessiner ou peindre",
        "Ton moment préféré pour réfléchir",
        "Ton plat préféré pour un brunch",
        "Ton loisir préféré le soir",
        "Ton endroit préféré pour jouer dehors",
        "Ton moment préféré en famille",
        "Ton moyen préféré pour communiquer avec les amis",
        "Ton dessert préféré après un repas",
        "Ton activité préférée pour se détendre",
        "Ton endroit préféré pour jouer à des jeux",
        "Ton moment préféré en nature",
        "Ton endroit préféré pour te relaxer",
        "Ton plat préféré pour une soirée cinéma",
        "Ton moment préféré pour lire",
        "Ton activité préférée pour t’amuser",
        "Ton loisir préféré pour créer",
        "Ton moyen préféré pour explorer de nouvelles idées",
        "Ton endroit préféré pour pratiquer un hobby",
        "Ton moment préféré pour cuisiner",
        "Ton activité préférée pour te concentrer",
        "Ton dessert préféré pour un anniversaire",
        "Ton moment préféré pour écrire",
        "Ton activité préférée pour partager avec les autres",
        "Ton loisir préféré pour apprendre quelque chose de nouveau",
        "Ton endroit préféré pour faire du sport en plein air",
        "Ton moment préféré pour observer la nature",
        "Ton activité préférée pour te divertir seul",
        "Ton loisir préféré pour t’exprimer",
        "Ton moment préféré pour méditer",
        "Ton activité préférée pour rire",
        "Ton plat préféré pour une collation",
        "Ton moment préféré pour écouter de la musique",
        "Ton activité préférée pour passer le temps libre",
        "Ton loisir préféré pour rester créatif",
        "Ton moment préféré pour sortir avec des amis",
        "Ton activité préférée pour rester actif",
        "Ton plat préféré pour un repas rapide",
        "Ton moment préféré pour prendre des photos",
        "Ton activité préférée pour te relaxer en intérieur",
        "Ton loisir préféré pour jouer à des jeux de société",
        "Ton moment préféré pour découvrir quelque chose de nouveau",
        "Ton activité préférée pour partager avec la famille",
        "Ton plat préféré pour un déjeuner léger",
        "Ton moment préféré pour écouter un podcast",
        "Ton activité préférée pour t’amuser à la maison",
        "Ton loisir préféré pour créer de nouvelles choses",
        "Ton moment préféré pour profiter du calme",
        "Ton activité préférée pour explorer l’extérieur",
        "Ton plat préféré pour un repas convivial",
        "Ton moment préféré pour faire du sport",
        "Ton activité préférée pour apprendre en s’amusant",
        "Ton loisir préféré pour se détendre",
        "Ton moment préféré pour se reconnecter avec soi-même",
        "Ton activité préférée pour améliorer une compétence",
        "Ton plat préféré pour un dîner entre amis",
        "Ton moment préféré pour observer le ciel",
        "Ton activité préférée pour partager un moment",
        "Ton loisir préféré pour se concentrer",
        "Ton moment préféré pour te relaxer après une journée",
        "Ton activité préférée pour découvrir de nouvelles passions",
        "Ton plat préféré pour un repas familial",
        "Ton moment préféré pour jouer à l’extérieur",
        "Ton activité préférée pour exprimer sa créativité",
        "Ton loisir préféré pour explorer de nouvelles idées",
        "Ton moment préféré pour te détendre avec un livre",
        "Ton activité préférée pour passer du temps en famille",
        "Ton plat préféré pour un repas en solo",
        "Ton moment préféré pour cuisiner avec plaisir",
        "Ton activité préférée pour s’amuser avec des amis",
        "Ton loisir préféré pour se divertir",
        "Ton moment préféré pour pratiquer une activité artistique",
        "Ton activité préférée pour profiter de la nature",
        "Ton plat préféré pour un petit-déjeuner gourmand",
        "Ton moment préféré pour pratiquer une activité physique",
        "Ton activité préférée pour apprendre de nouvelles choses",
        "Décris ta journée idéale",
        "Ton loisir préféré après l’école",
        "Une anecdote drôle récente",
        "Ton animal de compagnie préféré",
        "Une invention que tu aimerais voir",
        "Ton film d’animation préféré",
        "Une activité relaxante à la maison",
        "Ton moyen de transport favori",
        "Ton endroit préféré pour te promener",
        "Un talent que tu aimerais avoir",
        "Ton dessert préféré",
        "Une activité sportive que tu adores",
        "Ton jeu de société préféré",
        "Un livre que tu relirais volontiers",
        "Ton endroit préféré pour observer la nature",
        "Une activité créative que tu aimes",
        "Ton repas préféré de la semaine",
        "Ton personnage de fiction préféré",
        "Ton souvenir d’enfance le plus drôle",
        "Ton fruit préféré",
        "Ton légume préféré",
        "Une compétence que tu aimerais apprendre",
        "Ton endroit préféré pour voyager",
        "Ton moment préféré de la journée",
        "Une habitude quotidienne que tu apprécies",
        "Ton moyen préféré pour écouter de la musique",
        "Ton endroit préféré pour te détendre",
        "Un objet qui te rend heureux",
        "Une activité manuelle que tu apprécies",
        "Ton film préféré pour te divertir",
        "Ton activité favorite le weekend",
        "Une passion que tu aimerais développer",
        "Ton loisir préféré en été",
        "Ton loisir préféré en hiver",
        "Ton plat préféré pour le dîner",
        "Ton endroit préféré pour lire",
        "Ton hobby préféré en solo",
        "Ton activité préférée en groupe",
        "Ton moment préféré pour cuisiner",
        "Une activité que tu trouves amusante",
        "Ton jeu vidéo préféré",
        "Ton personnage historique préféré",
        "Ton endroit préféré pour observer le ciel",
        "Ton dessert préféré en été",
        "Ton endroit idéal pour passer les vacances",
        "Une tradition familiale que tu aimes",
        "Ton moment préféré pour pratiquer un hobby",
        "Une expérience qui t’a fait sourire récemment",
        "Ton moyen préféré pour apprendre quelque chose de nouveau",
        "Ton endroit préféré pour une balade en nature",
        "Ton plat préféré pour un brunch",
        "Ton activité préférée pour te relaxer",
        "Ton moment préféré pour rêver",
        "Ton loisir préféré pour créer",
        "Ton endroit préféré pour faire du sport",
        "Ton activité préférée pour t’amuser",
        "Ton objet technologique favori",
        "Une chose insolite que tu as vue récemment",
        "Ton endroit préféré pour rencontrer des amis",
        "Ton moment préféré pour méditer",
        "Ton activité préférée pour partager avec les autres",
        "Ton endroit préféré pour pratiquer un hobby créatif",
        "Ton moment préféré pour écrire",
        "Ton plat préféré pour un goûter",
        "Ton activité favorite après l’école ou le travail",
        "Ton loisir préféré quand il pleut",
        "Ton moment préféré pour se détendre à la maison",
        "Ton endroit préféré pour explorer la ville",
        "Ton activité préférée pour t’exprimer",
        "Ton moment préféré pour découvrir quelque chose de nouveau",
        "Ton loisir préféré pour rester actif",
        "Ton endroit préféré pour écouter un podcast",
        "Ton activité préférée pour profiter de la nature",
        "Ton moment préféré pour cuisiner un dessert",
        "Ton loisir préféré pour apprendre quelque chose de nouveau",
        "Ton endroit préféré pour observer les étoiles",
        "Ton moment préféré pour pratiquer un sport",
        "Ton activité préférée pour partager un moment en famille",
        "Ton endroit préféré pour se reposer",
        "Ton loisir préféré pour jouer à des jeux de société",
        "Ton moment préféré pour explorer de nouvelles idées",
        "Ton activité favorite pour se divertir seul",
        "Ton endroit préféré pour créer",
        "Ton moment préféré pour passer du temps avec des amis",
        "Ton loisir préféré pour rester créatif",
        "Ton plat préféré pour un dîner rapide",
        "Ton activité favorite pour s’amuser à la maison",
        "Ton moment préféré pour prendre des photos",
        "Ton loisir préféré pour se concentrer",
        "Ton activité favorite pour méditer",
        "Ton endroit préféré pour une promenade relaxante",
        "Ton moment préféré pour découvrir un nouvel endroit",
        "Ton loisir préféré pour s’exprimer artistiquement",
        "Ton activité favorite pour rire",
        "Ton moment préféré pour écouter de la musique",
        "Ton plat préféré pour un repas familial",
        "Ton activité favorite pour rester motivé",
        "Ton loisir préféré pour explorer la nature",
        "Ton moment préféré pour partager une activité",
        "Ton activité préférée pour se relaxer après une longue journée",
        "Ton endroit préféré pour observer la vie autour de toi",
        "Ton loisir préféré pour jouer dehors",
        "Ton moment préféré pour réfléchir",
        "Ton activité favorite pour apprendre en s’amusant",
        "Ton endroit préféré pour une activité créative",
        "Ton moment préféré pour cuisiner avec plaisir",
        "Ton loisir préféré pour jouer à des jeux en famille",
        "Ton activité favorite pour explorer de nouvelles passions",
        "Ton moment préféré pour t’amuser en solo",
        "Ton plat préféré pour un repas entre amis",
        "Ton loisir préféré pour se détendre à l’intérieur",
        "Ton moment préféré pour pratiquer une activité artistique",
        "Ton activité favorite pour profiter de la journée",
        "Ton endroit préféré pour observer la nature en été",
        "Ton moment préféré pour jouer dehors",
        "Ton loisir préféré pour se divertir seul",
        "Ton activité favorite pour se concentrer sur une tâche",
        "Ton moment préféré pour cuisiner un plat délicieux",
        "Ton loisir préféré pour découvrir quelque chose de nouveau",
        "Ton activité favorite pour créer quelque chose",
        "Ton moment préféré pour partager avec la famille",
        "Ton plat préféré pour un déjeuner léger",
        "Ton loisir préféré pour passer le temps libre",
        "Ton moment préféré pour pratiquer le sport",
        "Ton activité favorite pour apprendre de nouvelles compétences",
        "Ton endroit préféré pour se relaxer en vacances",
        "Ton moment préféré pour se détendre",
        "Ton loisir préféré pour observer la nature",
        "Ton activité favorite pour explorer un nouvel endroit",
        "Ton moment préféré pour se divertir avec des amis",
        "Ton plat préféré pour une soirée cinéma",
        "Ton loisir préféré pour s’exprimer",
        "Ton moment préféré pour pratiquer une activité physique",
        "Ton activité favorite pour t’amuser",
        "Ton endroit préféré pour explorer un hobby",
        "Ton moment préféré pour passer du temps avec soi-même",
        "Ton loisir préféré pour créer des œuvres artistiques",
        "Ton activité favorite pour découvrir de nouvelles idées",
        "Ton moment préféré pour se détendre après une journée chargée",
        "Ton plat préféré pour un repas rapide et savoureux",
        "Ton loisir préféré pour passer du temps en extérieur",
        "Ton moment préféré pour écrire ou dessiner",
        "Ton activité favorite pour partager avec des amis",
        "Ton endroit préféré pour pratiquer un sport en plein air",
        "Ton moment préféré pour s’amuser seul ou en groupe",
        "Ton loisir préféré pour rester créatif et motivé",
        "Ton activité favorite pour explorer de nouvelles passions",
        "Ton moment préféré pour cuisiner un plat original",
        "Ton loisir préféré pour passer un bon moment à la maison"
    ],
    hot: [
        "Ton plus gros fantasme",
        "La pire honte amoureuse",
        "Ta dernière expérience gênante",
        "Le pire date de ta vie",
        "Ce que tu regardes en cachette",
        "Un endroit insolite pour l'amour",
        "Ta technique de drague foireuse", 
        "Vivre controle de police"
    ]
};

const CONTRAINTES = {
    classique: [
        "comme si tu avais 6 ans",
        "comme un politicien en campagne",
        "comme une pub télé",
        "comme un documentaire animalier",
        "en parlant en vieux françois",
        "comme un robot sans émotion",
        "en faisant des rimes",
        "comme un rappeur énervé",
        "comme un explorateur en mission",
        "comme un présentateur météo",
        "comme un poète romantique",
        "comme un détective mystérieux",
        "comme un coach sportif motivant",
        "comme un professeur passionné",
        "comme un scientifique fou",
        "comme un personnage de dessin animé",
        "comme un super-héros confiant",
        "comme un pirate des mers",
        "comme un acteur dramatique",
        "comme un narrateur de conte",
        "comme un journaliste sérieux",
        "comme un animateur de jeu télé",
        "comme un joueur de football célèbre",
        "comme un animal qui parle",
        "comme un explorateur du futur",
        "comme un chef cuisinier renommé",
        "comme un musicien célèbre",
        "comme un voyageur dans le temps",
        "comme un guide touristique enthousiaste",
        "comme un écrivain célèbre",
        "comme un magicien mystérieux",
        "comme un astronaute en mission",
        "comme un robot intelligent",
        "comme un détective comique",
        "comme un conteur d’histoire captivant",
        "comme un enfant curieux",
        "comme un vieil érudit",
        "comme un héros de film d’action",
        "comme un entraîneur motivant",
        "comme un philosophe réfléchi",
        "comme un scientifique sérieux",
        "comme un joueur de jeu vidéo passionné",
        "comme un comique de stand-up",
        "comme un musicien excentrique",
        "comme un explorateur de jungle",
        "comme un reporter aventureux",
        "comme un écrivain excentrique",
        "comme un roi ou une reine",
        "comme un personnage de roman historique",
        "comme un chevalier courageux",
        "comme un inventeur créatif",
        "comme un coach de vie",
        "comme un mentor sage",
        "comme un réalisateur de film",
        "comme un présentateur radio",
        "comme un pilote de course",
        "comme un animateur pour enfants",
        "comme un directeur de cirque",
        "comme un artiste de rue",
        "comme un maître d’arts martiaux",
        "comme un explorateur polaire",
        "comme un scientifique du futur",
        "comme un poète de rue",
        "comme un créateur de jeux",
        "comme un astronome passionné",
        "comme un joueur d’échecs stratégique",
        "comme un professeur de yoga",
        "comme un photographe d’aventure",
        "comme un détective farfelu",
        "comme un scientifique observateur",
        "comme un narrateur enthousiaste",
        "comme un musicien de jazz",
        "comme un pilote d’avion",
        "comme un guide de montagne",
        "comme un joueur de basketball célèbre",
        "comme un philosophe rigolo",
        "comme un chanteur de pop",
        "comme un peintre célèbre",
        "comme un explorateur urbain",
        "comme un inventeur fou",
        "comme un guide sous-marin",
        "comme un explorateur spatial",
        "comme un poète dramatique",
        "comme un chef de projet organisé",
        "comme un entraîneur d’équipe",
        "comme un historien curieux",
        "comme un auteur de bande dessinée",
        "comme un acteur comique",
        "comme un scientifique méticuleux",
        "comme un musicien de rue",
        "comme un artiste conceptuel",
        "comme un animateur de podcast",
        "comme un joueur de tennis célèbre",
        "comme un explorateur de forêt",
        "comme un guide touristique local",
        "comme un écrivain humoristique",
        "comme un philosophe sage",
        "comme un conteur passionné",
        "comme un détective intelligent",
        "comme un aventurier téméraire",
        "comme un astronaute créatif",
        "comme un journaliste curieux",
        "comme un chef pâtissier",
        "comme un pilote de fusée",
        "comme un professeur amusant",
        "comme un joueur de rugby célèbre",
        "comme un explorateur historique",
        "comme un poète mélancolique",
        "comme un présentateur enthousiaste",
        "comme un chanteur lyrique",
        "comme un coach de danse",
        "comme un écrivain de science-fiction",
        "comme un détective classique",
        "comme un acteur dramatique célèbre",
        "comme un musicien inspiré",
        "comme un explorateur intrépide",
        "comme un narrateur de documentaire",
        "comme un présentateur motivant",
        "comme un artiste excentrique",
        "comme un philosophe contemplatif",
        "comme un conteur captivant",
        "comme un joueur stratégique",
        "comme un pilote expérimenté",
        "comme un scientifique inventif",
        "comme un écrivain poétique",
        "comme un poète romantique moderne",
        "comme un professeur dynamique",
        "comme un joueur enthousiaste",
        "comme un animateur original",
        "comme un historien passionné",
        "comme un explorateur des océans",
        "comme un détective inspirant",
        "comme un musicien passionné",
        "comme un réalisateur talentueux",
        "comme un artiste créatif",
        "comme un philosophe amusant",
        "comme un conteur original",
        "comme un astronaute courageux",
        "comme un présentateur comique",
        "comme un joueur de football inspirant",
        "comme un écrivain motivant",
        "comme un explorateur aventureux",
        "comme un inventeur curieux",
        "comme un chef innovant",
        "comme un joueur de basketball inspirant",
        "comme un professeur farfelu",
        "comme un scientifique rêveur",
        "comme un musicien excentrique",
        "comme un conteur malicieux",
        "comme un explorateur audacieux",
        "comme un détective prudent",
        "comme un poète mélancolique",
        "comme un animateur pétillant",
        "comme un écrivain sarcastique",
        "comme un philosophe contemplatif",
        "comme un artiste exubérant",
        "comme un astronaute timide",
        "comme un présentateur enthousiaste",
        "comme un joueur comique",
        "comme un inventeur distrait",
        "comme un chef inventif",
        "comme un explorateur studieux",
        "comme un professeur jovial",
        "comme un scientifique méticuleux",
        "comme un conteur dramatique",
        "comme un musicien rêveur",
        "comme un joueur stratégique",
        "comme un écrivain curieux",
        "comme un philosophe réfléchi",
        "comme un animateur moqueur",
        "comme un artiste rêveur",
        "comme un astronaute courageux",
        "comme un présentateur sérieux",
        "comme un explorateur enthousiaste",
        "comme un inventeur optimiste",
        "comme un chef audacieux",
        "comme un joueur nerveux",
        "comme un professeur excentrique",
        "comme un scientifique passionné",
        "comme un conteur mystérieux",
        "comme un musicien hilarant",
        "comme un écrivain poétique",
        "comme un philosophe amusé",
        "comme un animateur vif",
        "comme un artiste curieux",
        "comme un astronaute imaginatif",
        "comme un présentateur énergique",
        "comme un joueur confiant",
        "comme un inventeur fougueux",
        "comme un chef concentré",
        "comme un explorateur persévérant",
        "comme un professeur attentif",
        "comme un scientifique inspiré",
        "comme un conteur humoristique",
        "comme un musicien passionné",
        "comme un écrivain mystérieux",
        "comme un philosophe rêveur",
        "comme un animateur inventif",
        "comme un artiste dramatique",
        "comme un astronaute curieux",
        "comme un présentateur drôle",
        "comme un explorateur minutieux",
        "comme un inventeur malin",
        "comme un chef motivé",
        "comme un joueur joueur de hasard",
        "comme un professeur inventif",
        "comme un scientifique observateur",
        "comme un conteur imaginatif",
        "comme un musicien vibrant",
        "comme un écrivain espiègle",
        "comme un philosophe drôle",
        "comme un animateur enjoué",
        "comme un artiste inspiré",
        "comme un astronaute farfelu",
        "comme un présentateur original",
        "comme un explorateur curieux",
        "comme un inventeur créatif",
        "comme un chef astucieux",
        "comme un joueur audacieux",
        "comme un professeur malin",
        "comme un scientifique innovant",
        "comme un conteur malicieux",
        "comme un musicien imaginatif",
        "comme un écrivain talentueux",
        "comme un philosophe amusant",
        "comme un animateur captivant",
        "comme un artiste excentrique",
        "comme un astronaute réfléchi",
        "comme un présentateur amusé",
        "comme un explorateur aventureux",
        "comme un inventeur brillant",
        "comme un chef créatif",
        "comme un joueur inspiré",
        "comme un professeur passionné",
        "comme un scientifique attentif",
        "comme un conteur dramatique",
        "comme un musicien curieux",
        "comme un écrivain original",
        "comme un philosophe vif",
        "comme un animateur joyeux",
        "comme un artiste persévérant",
        "comme un astronaute attentif",
        "comme un présentateur poétique",
        "comme un explorateur malicieux",
        "comme un inventeur curieux",
        "comme un chef joueur",
        "comme un joueur inventif",
        "comme un professeur studieux",
        "comme un scientifique vigilant",
        "comme un conteur malin",
        "comme un musicien inspiré",
        "comme un écrivain observateur",
        "comme un philosophe rêveur",
        "comme un animateur vif",
        "comme un artiste humoristique",
        "comme un astronaute concentré",
        "comme un présentateur énergique",
        "comme un explorateur créatif",
        "comme un inventeur drôle",
        "comme un chef enthousiaste",
        "comme un joueur malicieux",
        "comme un professeur inventif",
        "comme un scientifique curieux",
        "comme un conteur excentrique",
        "comme un musicien fougueux",
        "comme un écrivain inspirant",
        "comme un philosophe original",
        "comme un animateur perspicace",
        "comme un artiste rêveur",
        "comme un astronaute inventif",
        "comme un présentateur passionné",
        "comme un explorateur ingénieux",
        "comme un inventeur audacieux",
        "comme un chef malin",
        "comme un joueur créatif",
        "comme un professeur énergique",
        "comme un scientifique malin",
        "comme un conteur inspiré",
        "comme un musicien drôle",
        "comme un écrivain inventif",
        "comme un philosophe enthousiaste",
        "comme un animateur imaginatif",
        "comme un artiste inspiré",
        "comme un astronaute rigoureux",
        "comme un présentateur créatif",
        "comme un explorateur audacieux",
        "comme un inventeur drôle",
        "comme un chef joyeux",
        "comme un joueur malicieux",
        "comme un professeur passionné",
        "comme un scientifique curieux",
        "comme un conteur captivant",
        "comme un musicien original",
        "comme un écrivain inventif",
        "comme un philosophe attentif",
        "comme un animateur créatif",
        "comme un artiste audacieux",
        "comme un astronaute joueur",
        "comme un présentateur espiègle",
        "comme un explorateur imaginatif",
        "comme un inventeur inventif",
        "comme un chef original",
        "comme un joueur vif",
        "comme un professeur observateur",
        "comme un scientifique réfléchi",
        "comme un conteur perspicace",
        "comme un musicien attentif",
        "comme un écrivain drôle",
        "comme un philosophe joyeux",
        "comme un animateur inventif",
        "comme un artiste malicieux",
        "comme un astronaute créatif",
        "comme un présentateur imaginatif",
        "comme un explorateur drôle",
        "comme un inventeur curieux",
        "comme un chef créatif",
        "comme un joueur inspiré",
        "comme un professeur inventif",
        "comme un scientifique original",
        "comme un conteur rigoureux",
        "comme un musicien inventif",
        "comme un écrivain perspicace",
        "comme un philosophe vif",
        "comme un animateur créatif",
        "comme un artiste joyeux",
        "comme un astronaute inventif",
        "comme un présentateur original"
    ],
    hot: [
        "comme si tu étais ivre mort",
        "en étant excessivement dramatique",
        "comme un film X mal joué",
        "comme un secret très mal gardé",
        "avec beaucoup de sous-entendus",
        "comme une ligne rose (téléphone)",
        "en gémissant entre les mots", 
        "en chuchotant sensuellement",

    ]
};

/* =========================================
   ÉTAT DU JEU
   ========================================= */

let players = [];
let currentMode = 'classique';
let round = 1;
let investigatorIndex = 0;
let currentTheme = "";
let currentConstraint = "";
let phrases = []; // { player: "Name", text: "..." }
let writersQueue = []; // Liste des index des joueurs qui doivent écrire
let timerInterval;
let scoreValidationState = { theme: false, constraint: false }; // Pour éviter double clic

/* =========================================
   FONCTIONS UTILITAIRES
   ========================================= */

function getEl(id) { return document.getElementById(id); }

function showScreen(screenId) {
    // Cacher tous les écrans
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Afficher le bon
    getEl(screenId).classList.add('active');

    // Gestion bouton retour accueil
    if (screenId === 'screen-home') {
        getEl('btn-home').style.display = 'none';
    } else {
        getEl('btn-home').style.display = 'block';
    }
}

function updateScoreboard() {
    const container = getEl('scores-container');
    container.innerHTML = '';
    players.forEach(p => {
        const span = document.createElement('span');
        span.className = 'score-item';
        span.innerText = `${p.name}: ${p.score}pts`;
        container.appendChild(span);
    });
}

/* =========================================
   LOGIQUE : SETUP & ACCUEIL
   ========================================= */

function selectMode(mode) {
    currentMode = mode;
    getEl('mode-classique').classList.remove('selected');
    getEl('mode-hot').classList.remove('selected');
    getEl(`mode-${mode}`).classList.add('selected');
}

function addPlayer() {
    const input = getEl('input-player-name');
    const name = input.value.trim();
    if (name) {
        players.push({ name: name, score: 0 });
        input.value = '';
        renderPlayerList();
        checkStartButton();
    }
}

function renderPlayerList() {
    const list = getEl('player-list');
    list.innerHTML = players.map((p, index) =>
        `<div>🎭 ${p.name} <button class="btn btn-small" onclick="removePlayer(${index})">X</button></div>`
    ).join('');
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayerList();
    checkStartButton();
}

function checkStartButton() {
    getEl('btn-start-game').disabled = players.length < 3;
}

/* =========================================
   LOGIQUE : DÉBUT DE PARTIE / MANCHE
   ========================================= */

function startGame() {
    round = 1;
    investigatorIndex = Math.floor(Math.random() * players.length); // Premier au hasard
    updateScoreboard();
    startRound();
}

function startRound() {
    // Reset data manche
    phrases = [];
    scoreValidationState = { theme: false, constraint: false };
    getEl('btn-next-round').style.display = 'none';

    // Selection data
    const themeList = THEMES[currentMode];
    const constraintList = CONTRAINTES[currentMode];
    currentTheme = themeList[Math.floor(Math.random() * themeList.length)];
    currentConstraint = constraintList[Math.floor(Math.random() * constraintList.length)];

    // Setup UI
    getEl('round-number').innerText = round;
    getEl('investigator-name').innerText = players[investigatorIndex].name;

    showScreen('screen-reveal');
}

function showTask() {
    getEl('display-theme').innerText = currentTheme;
    getEl('display-constraint').innerText = currentConstraint;
    showScreen('screen-task');
}

/* =========================================
   LOGIQUE : ÉCRITURE
   ========================================= */

function startWritingPhase() {
    // Créer la file d'attente des écrivains (tous sauf l'enquêteur)
    writersQueue = players.map((_, i) => i).filter(i => i !== investigatorIndex);
    nextWriter();
}

function nextWriter() {
    if (writersQueue.length === 0) {
        // Tout le monde a écrit
        showScreen('screen-ready-investigate');
        return;
    }

    const currentPlayerIdx = writersQueue[0];
    const player = players[currentPlayerIdx];

    // Si on vient de l'écran "Pass", on affiche l'écran d'écriture
    // Sinon on affiche d'abord l'écran de transition si ce n'est pas le premier
    // Simplification : On affiche toujours l'écran d'écriture direct, 
    // mais on vide le champ.

    getEl('writer-name').innerText = player.name;
    getEl('reminder-theme').innerText = currentTheme;
    getEl('reminder-constraint').innerText = currentConstraint;
    getEl('input-phrase').value = '';

    showScreen('screen-writing');
}

function submitPhrase() {
    const input = getEl('input-phrase');
    if (input.value.trim() === "") return alert("Écris quelque chose !");

    const playerIdx = writersQueue.shift(); // Retire le joueur actuel de la file
    phrases.push({
        author: players[playerIdx].name,
        text: input.value.trim()
    });

    if (writersQueue.length > 0) {
        showScreen('screen-pass'); // Écran intermédiaire pour éviter de voir la suite
    } else {
        showScreen('screen-ready-investigate');
    }
}

/* =========================================
   LOGIQUE : ENQUÊTE
   ========================================= */

function startInvestigation() {
    // Mélanger les phrases
    phrases.sort(() => Math.random() - 0.5);

    getEl('timer-display').style.display = 'block';

    // Afficher les phrases
    const container = getEl('phrases-container');
    container.innerHTML = '';
    phrases.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<p style="font-size:1.3rem;">"${p.text}"</p>`;
        // On ne montre pas l'auteur évidemment
        container.appendChild(card);
    });

    // Reset inputs enquêteur
    getEl('guess-theme').value = '';
    getEl('guess-constraint').value = '';

    // Timer
    startTimer();

    showScreen('screen-investigation');
}

function startTimer() {
    let timeLeft = 180; // 3 minutes
    const display = getEl('timer-display');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        display.innerText = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitGuess(); // Force submit
        }
        timeLeft--;
    }, 1000);
}

function submitGuess() {
    clearInterval(timerInterval);

    getEl('timer-display').style.display = 'none';

    const themeGuess = getEl('guess-theme').value || "Rien proposé";
    const constraintGuess = getEl('guess-constraint').value || "Rien proposé";

    getEl('final-guess-theme').innerText = themeGuess;
    getEl('final-guess-constraint').innerText = constraintGuess;
    getEl('real-theme').innerText = currentTheme;
    getEl('real-constraint').innerText = currentConstraint;

    // Reset boutons validation
    scoreValidationState = { theme: false, constraint: false };
    const btns = document.querySelectorAll('#screen-results .btn');
    btns.forEach(b => b.disabled = false);
    getEl('btn-next-round').style.display = 'none';

    showScreen('screen-results');
}

/* =========================================
   LOGIQUE : SCORE & FIN DE MANCHE
   ========================================= */

function validateScore(isCorrect, type) {
    // type = 'theme' ou 'constraint'
    // Désactiver les boutons de ce type
    // Ajouter point si correct

    // Empêcher multiple click sur le même type
    if (type === 'theme') {
        if (scoreValidationState.theme) return;
        scoreValidationState.theme = true;
    }
    if (type === 'constraint') {
        if (scoreValidationState.constraint) return;
        scoreValidationState.constraint = true;
    }

    if (isCorrect) {
        players[investigatorIndex].score += 1;
        updateScoreboard();
    }

    // Désactiver visuellement les boutons de ce groupe (simple hack visuel)
    // Dans une vraie app on ciblerait mieux, ici on laisse les boutons actifs mais sans effet logique

    // Vérifier si les deux ont été votés
    if (scoreValidationState.theme && scoreValidationState.constraint) {
        getEl('btn-next-round').style.display = 'inline-block';
    }
}

function nextRound() {
    investigatorIndex = (investigatorIndex + 1) % players.length;
    round++;
    startRound();
}

function resetGame() {
    // Retour accueil complet
    showScreen('screen-home');
    getEl('timer-display').style.display = 'none';
    // On garde les joueurs mais on reset les scores ?
    // Ou reset total ? Faisons un reset des scores.
    players.forEach(p => p.score = 0);
    updateScoreboard();
    getEl('btn-home').style.display = 'none';
}

/* =========================================
   NAVIGATION & HEADER
   ========================================= */

getEl('btn-rules').onclick = () => getEl('modal-rules').style.display = 'flex';
function closeRules() { getEl('modal-rules').style.display = 'none'; }

getEl('btn-home').onclick = () => {
    if (confirm("Quitter la partie en cours ?")) {
        resetGame();
    }
};
