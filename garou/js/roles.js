const ROLES = {
    simple_villageois: {
        name: "Simple Villageois",
        camp: "villageois",
        description: "Vous n'avez aucune compétence particulière, sauf votre intuition.",
    },
    loup_garou: {
        name: "Loup-Garou",
        camp: "loups",
        description: "Chaque nuit, vous vous réveillez avec vos compères pour dévorer un villageois.",
    },
    voyante: {
        name: "Voyante",
        camp: "villageois",
        description: "Chaque nuit, vous pouvez sonder la véritable identité d'un joueur.",
    },
    sorciere: {
        name: "Sorcière",
        camp: "villageois",
        description: "Vous avez une potion de vie pour sauver quelqu'un et une potion de mort pour tuer.",
    },
    chasseur: {
        name: "Chasseur",
        camp: "villageois",
        description: "Si vous mourez, vous emportez quelqu'un avec vous dans la tombe.",
    },
    cupidon: {
        name: "Cupidon",
        camp: "villageois", // Peut changer
        description: "La première nuit, vous désignez deux joueurs qui tomberont éperdument amoureux.",
    },
    protecteur: {
        name: "Protecteur",
        camp: "villageois",
        description: "Chaque nuit, vous pouvez protéger un joueur des Loups-Garous.",
    },
    loup_blanc: {
        name: "Loup Blanc",
        camp: "loups", // Gagne seul
        description: "Vous gagnez si vous êtes le dernier survivant. Une nuit sur deux, vous pouvez tuer un loup.",
    },
    voleur: {
        name: "Voleur",
        camp: "inconnu",
        description: "La première nuit, si des rôles n'ont pas été distribués, vous pouvez en changer.",
    }
};