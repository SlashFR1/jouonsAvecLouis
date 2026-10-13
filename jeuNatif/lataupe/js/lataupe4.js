// ----- INITIALISATION -----
const listJoueursInitiale = JSON.parse(localStorage.getItem('joueursInitiale')) || []; // Garde la liste de départ
let joueursRestants = JSON.parse(localStorage.getItem('joueurs')) || [];
const joueursMots = JSON.parse(localStorage.getItem('joueursMots')) || [];

const joueurListeDiv = document.getElementById("joueurListeDiv");
const popupVictoireDiv = document.getElementById("popup-victoire");
const resultatTexteH2 = document.getElementById("resultat-texte");
const motsFinauxDiv = document.getElementById("mots-finaux");
const recommencerBtn = document.getElementById("recommencerBtn");

// ----- LOGIQUE PRINCIPALE -----

// Affiche les joueurs restants sous forme de boutons cliquables pour le vote
function afficherJoueursPourVote() {
    joueurListeDiv.innerHTML = "<h2>Qui souhaitez-vous éliminer ?</h2>";
    joueursRestants.forEach(joueur => {
        const btn = document.createElement("button");
        btn.textContent = joueur;
        btn.addEventListener("click", () => eliminerJoueur(joueur));
        joueurListeDiv.appendChild(btn);
    });
}

// Gère l'élimination d'un joueur
function eliminerJoueur(joueurElimine) {
    const indexInitial = listJoueursInitiale.indexOf(joueurElimine);
    const motElimine = joueursMots[indexInitial];

    alert(`${joueurElimine} a été éliminé ! Son mot était : ${motElimine || "Fantôme"}`);

    // Met à jour la liste des joueurs restants
    joueursRestants = joueursRestants.filter(j => j !== joueurElimine);
    localStorage.setItem('joueurs', JSON.stringify(joueursRestants));

    // Vérifier les conditions de victoire après l'élimination
    if (verifierVictoire(joueurElimine, motElimine)) {
        return; // La fonction verifierVictoire affichera le popup et arrêtera le jeu
    }

    // Si la partie n'est pas terminée, on passe au tour/jour suivant
    passerALaSuite();
}

function verifierVictoire(joueurElimine, motElimine) {
    let messageVictoire = "";
    
    // Condition de victoire du Fantôme
    if (motElimine === null) {
        messageVictoire = "👻 Le Fantôme a été démasqué et gagne la partie !";
    }
    // Condition de victoire de la Foule (si la Taupe est éliminée)
    else if (joueursMots.some(mot => mot !== null && mot !== joueursMots[0]) && motElimine !== joueursMots[0]) {
        // Vérifie s'il reste une taupe. S'il n'y en a plus, la foule gagne.
        const motsRestants = joueursRestants.map(j => joueursMots[listJoueursInitiale.indexOf(j)]);
        if (!motsRestants.some(m => m !== null && m !== motsRestants[0])) {
             messageVictoire = "🕵️‍♂️ La Taupe a été trouvée ! La Foule gagne !";
        }
    }

    // Condition de victoire de la Taupe (s'ils sont 2 ou moins avec la taupe)
    if (joueursRestants.length <= 2) {
        const motsRestants = joueursRestants.map(j => joueursMots[listJoueursInitiale.indexOf(j)]);
         if (motsRestants.some(m => m !== null && m !== motsRestants[0])) {
            messageVictoire = "🕵️‍♂️ La Taupe a survécu ! La Taupe gagne !";
         }
    }

    // Condition de victoire de la Foule (plus de taupe ni de fantôme)
    if (!messageVictoire && joueursRestants.length > 0) {
        const motsRestants = joueursRestants.map(j => joueursMots[listJoueursInitiale.indexOf(j)]);
        const aUneTaupe = motsRestants.some(m => m !== null && m !== motsRestants[0]);
        const aUnFantome = motsRestants.includes(null);
        if(!aUneTaupe && !aUnFantome) {
            messageVictoire = "🧑‍🤝‍🧑 La Foule a éliminé toutes les menaces et gagne !";
        }
    }


    if (messageVictoire) {
        afficherPopupVictoire(messageVictoire);
        return true; // La partie est terminée
    }

    return false; // La partie continue
}

function passerALaSuite() {
    const tourActuel = Number(localStorage.getItem('tourActuel'));
    const maxTours = Number(localStorage.getItem('maxTours'));

    if (tourActuel >= maxTours) {
        // Fin de la journée, on passe à la suivante
        const nextDay = (Number(localStorage.getItem('day')) || 1) + 1;
        alert(`Fin du jour ! Préparation pour le Jour ${nextDay}.`);

        localStorage.setItem('day', nextDay);
        localStorage.setItem('tourActuel', '1'); // Reset pour le nouveau jour
        
        // On supprime les mots pour en générer de nouveaux
        localStorage.removeItem('joueursMots');
        localStorage.removeItem('currentJoueurIndex');
        
        // On redirige vers la distribution de mots
        window.location.href = "lataupe2.html";

    } else {
        // On passe simplement au tour de parole suivant
        localStorage.setItem('tourActuel', tourActuel + 1);
        window.location.href = "lataupe3.html";
    }
}

function afficherPopupVictoire(resultat) {
    resultatTexteH2.textContent = resultat;
    motsFinauxDiv.innerHTML = "<h4>Mots de tous les joueurs :</h4>";
    
    listJoueursInitiale.forEach((joueur, index) => {
        motsFinauxDiv.innerHTML += `<p><strong>${joueur}</strong> : ${joueursMots[index] || "Fantôme"}</p>`;
    });

    joueurListeDiv.style.display = 'none'; // Cache les boutons de vote
    popupVictoireDiv.style.display = 'flex';
}

recommencerBtn.addEventListener('click', () => {
    // On garde la liste des joueurs initiale
    localStorage.setItem('joueurs', localStorage.getItem('joueursInitiale'));
    
    // On nettoie tout le reste
    localStorage.removeItem('joueursMots');
    localStorage.removeItem('day');
    localStorage.removeItem('tourActuel');
    localStorage.removeItem('maxTours');
    localStorage.removeItem('currentJoueurIndex');
    
    // On retourne au début du jeu (distribution des mots)
    window.location.href = "lataupe2.html";
});


// ----- DÉMARRAGE -----
afficherJoueursPourVote();