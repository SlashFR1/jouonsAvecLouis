const DB = {
    // Structure dict imbriqué comme demandé
    "questions": {
        "q1": { "niveau": 1, "texte": "Quelle est la couleur du cheval blanc d'Henri IV ?", "reponse": "Blanc" },
        "q2": { "niveau": 1, "texte": "Combien font 2 + 2 ?", "reponse": "4" },
        "q3": { "niveau": 2, "texte": "Quelle est la capitale de la France ?", "reponse": "Paris" },
        "q4": { "niveau": 2, "texte": "Quel animal miaule ?", "reponse": "Le chat" },
        "q5": { "niveau": 3, "texte": "De quel pays vient la pizza ?", "reponse": "Italie" },
        "q6": { "niveau": 3, "texte": "Qui est le frère de Luigi ?", "reponse": "Mario" },
        "q7": { "niveau": 4, "texte": "Quelle planète est surnommée la planète rouge ?", "reponse": "Mars" },
        "q8": { "niveau": 4, "texte": "Combien de pattes a une araignée ?", "reponse": "8" },
        "q9": { "niveau": 5, "texte": "En quelle année a eu lieu la chute du mur de Berlin ?", "reponse": "1989" },
        "q10": { "niveau": 5, "texte": "Quel est le symbole chimique de l'eau ?", "reponse": "H2O" },
        "q11": { "niveau": 6, "texte": "Qui a peint la Joconde ?", "reponse": "Léonard de Vinci" },
        "q12": { "niveau": 6, "texte": "Quelle est la capitale de l'Australie ?", "reponse": "Canberra (et non Sydney)" },
        "q13": { "niveau": 7, "texte": "Combien d'états y a-t-il aux USA ?", "reponse": "50" },
        "q14": { "niveau": 7, "texte": "Qui a écrit 'Les Misérables' ?", "reponse": "Victor Hugo" },
        "q15": { "niveau": 8, "texte": "Quelle est la vitesse de la lumière (approx km/s) ?", "reponse": "300 000 km/s" },
        "q16": { "niveau": 8, "texte": "En quelle année a commencé la 1ère guerre mondiale ?", "reponse": "1914" },
        "q17": { "niveau": 9, "texte": "Quelle est la racine carrée de 144 ?", "reponse": "12" },
        "q18": { "niveau": 9, "texte": "Qui est le réalisateur de 'Pulp Fiction' ?", "reponse": "Quentin Tarantino" },
        "q19": { "niveau": 10, "texte": "Quel est l'élément chimique 'Au' ?", "reponse": "L'Or" },
        "q20": { "niveau": 10, "texte": "Combien de temps dure un mandat présidentiel aux USA ?", "reponse": "4 ans" },
        
        // Ajout de questions supplémentaires pour couvrir les manques éventuels
        "q21": { "niveau": 1, "texte": "Le soleil est-il une étoile ou une planète ?", "reponse": "Une étoile" },
        "q22": { "niveau": 10, "texte": "Quelle est la hauteur de l'Everest (à 100m près) ?", "reponse": "8848 m" }
    },

    "bonus": [
        "Chante le refrain de ta chanson préférée.",
        "Fais 5 pompes ou perds 2 points.",
        "Ne dis pas 'OUI' ni 'NON' jusqu'à ton prochain tour.",
        "Cite 5 animaux commençant par L en 10 secondes.",
        "Imite le cri d'un animal choisi par les adversaires.",
        "Raconte une blague. Si personne ne rit, -1 point."
    ]
};