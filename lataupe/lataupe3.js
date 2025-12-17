const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || [];
const joueursMots = JSON.parse(localStorage.getItem('joueursMots')) || [];

let current = 0;
// Dans cette page on exécute UN passage complet des joueurs (un mini-round / cycle).
// Les cycles par jour sont gérés via localStorage (clé 'cyclesPerDay') et le compteur 'cycle'.
const day = Number(localStorage.getItem('day')) || 1;
const currentCycle = Number(localStorage.getItem('cycle')) || 1;
const cyclesPerDay = Number(localStorage.getItem('cyclesPerDay')) || 3;

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
    joueurNomDiv.textContent = `${listJoueurs[current]} (Cycle ${currentCycle} / ${cyclesPerDay})`;
    motDiv.textContent = `Jour ${day} — Parlez votre mot (secret)`; // invitation au cycle
}

nextBtn.addEventListener("click", () => {
    current++;
    if (current >= listJoueurs.length) {
        // Fin d'un cycle (un passage de tous les joueurs). On passe à l'élimination.
        window.location.href = "lataupe4.html";
        return;
    }
    afficherJoueur();
});

// Lancer le premier joueur
afficherJoueur();