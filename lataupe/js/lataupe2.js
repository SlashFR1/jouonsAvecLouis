// ----- DICTIONNAIRE DES MOTS -----


// ----- INITIALISATION DES VARIABLES -----
let listJoueurs = JSON.parse(localStorage.getItem('joueurs'));

// Fallback si aucun joueur n'est trouvé (pour les tests)
if (!listJoueurs || listJoueurs.length === 0) {
    console.warn("Aucun joueur trouvé ! Utilisation de joueurs tests.");
    listJoueurs = ["Alice", "Bob", "Charlie", "David"];
    localStorage.setItem('joueurs', JSON.stringify(listJoueurs)); // Sauvegarder pour les autres pages
}

const nbJoueurs = listJoueurs.length;
let joueursMots = []; // Ce tableau contiendra les mots/rôles dans l'ordre de listJoueurs

// ----- FONCTIONS UTILITAIRES -----
function melangerTableau(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRolesConfig(nbJoueurs) {
    if (nbJoueurs <= 5) return { taupes: 1, fantomes: 0 };
    if (nbJoueurs >= 6 && nbJoueurs <= 8) return { taupes: 1, fantomes: 1 };
    return { taupes: 2, fantomes: 1 }; // Pour 9 joueurs et plus
}


// ----- DISTRIBUTION DES MOTS -----
function distribuerMots() {
    // Si des mots existent déjà pour le jour actuel, on ne redistribue pas
    if (localStorage.getItem('joueursMots')) {
        joueursMots = JSON.parse(localStorage.getItem('joueursMots'));
        console.log("Mots réutilisés pour le jour en cours.");
        return;
    }

    // --- BLOC DE CODE CORRIGÉ SELON VOTRE PRINCIPE ---

    // 1. Choisir la catégorie (la clé de l'objet)
    const keys = Object.keys(mots);
    const categorieChoisie = keys[Math.floor(Math.random() * keys.length)];

    // 2. Le mot de la Foule est le nom de la catégorie elle-même
    const motPrincipal = categorieChoisie; // Ex: "Plage"

    // 3. Les mots pour la Taupe sont dans le tableau associé à la catégorie
    const motsTaupePossibles = mots[categorieChoisie]; // Ex: ["Vacances", "Sable", "desert"]

    // 4. On en choisit un au hasard pour la Taupe
    const motSimilaire = motsTaupePossibles[Math.floor(Math.random() * motsTaupePossibles.length)];

    console.log("ESPION N°3.1: Catégorie choisie ->", categorieChoisie);
    console.log("ESPION N°3.2: Mots possibles pour la taupe ->", motsTaupePossibles);
  if (!motsTaupePossibles) {
        console.error("ERREUR FATALE: La catégorie '" + categorieChoisie + "' n'a pas de tableau de mots associé ! Vérifiez votre objet 'mots'.");
        return;
    }

    // Le reste de la fonction ne change pas
    let distribution = Array(nbJoueurs).fill(motPrincipal);
    let indices = Array.from({ length: nbJoueurs }, (_, i) => i);
    indices = melangerTableau(indices);

    const { taupes, fantomes } = getRolesConfig(nbJoueurs);

    let cursor = 0;
    // Assigner le(s) Fantôme(s)
    for (let i = 0; i < fantomes; i++) {
        distribution[indices[cursor]] = null;
        cursor++;
    }
    // Assigner la/les Taupe(s)
    for (let i = 0; i < taupes; i++) {
        distribution[indices[cursor]] = motSimilaire;
        cursor++;
    }

    joueursMots = distribution;
    console.log("ESPION N°5: Distribution finale des rôles ->", joueursMots);

    // Debug dans la console pour vérifier que tout fonctionne
    console.log(`Thème du tour : ${motPrincipal}`);
    console.log(`Mot de la Taupe : ${motSimilaire}`);
    console.log("Rôles attribués :", joueursMots);
}

// ----- LOGIQUE D’AFFICHAGE INTERACTIF -----
let current = 0;
const joueurDiv = document.getElementById("joueur");
const motDiv = document.getElementById("mot");
const btnVoir = document.getElementById("voirMot");
const btnSuivant = document.getElementById("suivant");
const boutonContinuer = document.getElementById("monBouton");

function updateUI() {
    if (current >= nbJoueurs) {
        // Fin de la distribution
        joueurDiv.textContent = "Distribution terminée !";
        motDiv.textContent = "Tout le monde a reçu son rôle secret.";
        btnVoir.style.display = "none";
        btnSuivant.style.display = "none";
        boutonContinuer.style.display = "block"; // On affiche le bouton pour continuer
        return;
    }

    joueurDiv.textContent = `Passez le téléphone à ${listJoueurs[current]}`;
    motDiv.textContent = "Prêt à découvrir ton rôle ?";
    btnVoir.style.display = "inline-block";
    btnSuivant.style.display = "none";
    boutonContinuer.style.display = "none"; // On cache le bouton pendant la distribution
}

btnVoir.addEventListener("click", () => {
    const sonMot = joueursMots[current];

    if (sonMot === null) {
        motDiv.textContent = "Tu es le Fantôme ! 👻";
    } else {
        motDiv.textContent = `Ton mot est : ${sonMot}`;
    }
    btnVoir.style.display = "none";
    btnSuivant.style.display = "inline-block";
});

btnSuivant.addEventListener("click", () => {
    current++;
    updateUI();
});

// ----- GESTION DE LA TRANSITION VERS LA PHASE DE JEU -----
boutonContinuer.addEventListener("click", () => {
    // 1. Sauvegarder la liste des joueurs de départ (utile pour la fin de partie et pour rejouer)
    if (!localStorage.getItem('joueursInitiale')) {
        localStorage.setItem('joueursInitiale', JSON.stringify(listJoueurs));
    }

    // 2. Sauvegarder les mots qui viennent d'être distribués
    localStorage.setItem('joueursMots', JSON.stringify(joueursMots));

    // 3. Préparer les variables pour le NOUVEAU jour de jeu
    let maxTours = (listJoueurs.length === 4) ? 2 : 3;
    localStorage.setItem('maxTours', maxTours);
    localStorage.setItem('tourActuel', '1');

    // S'assurer que le jour est bien initialisé (commence à 1)
    const currentDay = Number(localStorage.getItem('day')) || 1;
    localStorage.setItem('day', currentDay);

    // Réinitialiser l'index du joueur qui parle pour la page suivante
    localStorage.setItem('currentJoueurIndex', '0');
    localStorage.setItem('jeuTermine', JSON.stringify(false));

    // 4. Rediriger vers la page des tours de parole
    window.location.href = "lataupe3.html";
});

// ----- DÉMARRAGE DU SCRIPT -----
distribuerMots();
updateUI();