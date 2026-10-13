// ----- INITIALISATION -----
const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || [];
let currentJoueurIndex = Number(localStorage.getItem('currentJoueurIndex')) || 0;

const tourActuel = Number(localStorage.getItem('tourActuel')) || 1;
const maxTours = Number(localStorage.getItem('maxTours')) || 3;
const day = Number(localStorage.getItem('day')) || 1;

// ----- ELEMENTS DOM -----
const joueurNomDiv = document.getElementById("joueurNom");
const motDiv = document.getElementById("mot");
const nextBtn = document.getElementById("nextBtn");

// ----- AFFICHAGE -----
function afficherJoueur() {
    // S'il n'y a plus de joueurs, on passe directement au vote (sécurité)
    if (listJoueurs.length === 0 || currentJoueurIndex >= listJoueurs.length) {
        window.location.href = "lataupe4.html";
        return;
    }

    const joueurActuel = listJoueurs[currentJoueurIndex];
    joueurNomDiv.textContent = `${joueurActuel}`;
    motDiv.innerHTML = `Jour ${day} — Tour ${tourActuel} / ${maxTours}<br>Donnez votre indice à voix haute.`;
}

// ----- PASSER AU PROCHAIN JOUEUR -----
function joueurSuivant() {
    currentJoueurIndex++;
    localStorage.setItem('currentJoueurIndex', currentJoueurIndex);

    // Si tous les joueurs ont parlé pour ce tour
    if (currentJoueurIndex >= listJoueurs.length) {
        // On réinitialise l'index pour le prochain tour de parole et on passe au vote
        localStorage.setItem('currentJoueurIndex', '0');
        window.location.href = "lataupe4.html";
        return;
    }

    // Sinon, on affiche le joueur suivant
    afficherJoueur();
}

// ----- ÉVÉNEMENTS -----
nextBtn.addEventListener("click", joueurSuivant);

// ----- PREMIER AFFICHAGE -----
afficherJoueur();