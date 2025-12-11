const ROLES = {
    colon: {
        name: "Colon",
        camp: "colonie",
        description: "Vous êtes un membre innocent de la colonie. Vous n'avez aucune compétence particulière, sauf votre intuition.",
    },
    aliens : {
        name: "Alien",
        camp: "loups",
        description: "Chaque nuit, vous et vos complices aliens prenez l'apparence des humains pour éliminer un colon.",
    },
    Scientifique: {
        name: "Scientifique",
        camp: "colonie",
        description: "Chaque nuit, vous pouvez analyser un joueur pour révéler s'il est un alien infiltré ou non.",
    },
    Medecin: {
        name: "Médecin",
        camp: "colonie",
        description: "Vous disposez d'un sérum de guérison pour sauver un colon et d'un sérum mortel pour éliminer un joueur.",
    },
    Ingenieur: {
        name: "Ingénieur",
        camp: "colonie",
        description: "Si vous mourez, vous déclenchez un mécanisme pour éliminer un joueur avec vous.",
    },
    Officier: {
        name: "Officier des relations",
        camp: "colonie",
        description: "La première nuit, vous désignez deux joueurs qui formeront un lien indestructible : s'ils survivent, ils survivront ensemble.",
    },
    Garde: {
        name: "Garde de la colonie",
        camp: "colonie",
        description: "Chaque nuit, vous pouvez protéger un joueur contre les attaques des aliens infiltrés.",
    },
    alpha: {
        name: "Alpha",
        camp: "loups",
        description: "Vous gagnez si vous êtes le dernier survivant. Une nuit sur deux, vous pouvez attaquer un autre alien infiltré.",
    },
    Android: {
        name: "Android",
        camp: "inconnu",
        description: "La première nuit, vous pouvez échanger votre identité avec celle d'un autre joueur et découvrir sa carte.",
    }
};
