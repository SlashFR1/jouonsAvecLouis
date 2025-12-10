const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || [];
const joueursMots = JSON.parse(localStorage.getItem('joueursMots')) || [];

let current = 0;
let tour = 1;
const MAX_TOURS = 1;

const tourWidget = document.getElementById("tourWidget");
const joueurNomDiv = document.getElementById("joueurNom");
const motDiv = document.getElementById("mot");
const nextBtn = document.getElementById("nextBtn");

function afficherJoueur() {
    if (listJoueurs.length === 0) {
        joueurNomDiv.textContent = "Plus de joueurs restants !";
        motDiv.textContent = "";
        nextBtn.style.display = "none";
        return;
    }
    joueurNomDiv.textContent = `${listJoueurs[current]} (Tour ${tour})`;
    motDiv.textContent = ""; // ne pas montrer le mot pendant le tour
}

nextBtn.addEventListener("click", () => {
    current++;
    if (current >= listJoueurs.length) {
        tour++;
        current = 0;
        if (tour > MAX_TOURS) {
            // Redirection vers la page d'élimination
            window.location.href = "lataupe4.html";
            return;
        }
    }
    afficherJoueur();
});

// Lancer le premier joueur
afficherJoueur();