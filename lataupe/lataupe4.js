const jeuTermine = JSON.parse(localStorage.getItem('jeuTermine')) || false;
const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || [];
const joueursMots = JSON.parse(localStorage.getItem('joueursMots')) || [];
let joueursRestants = [...listJoueurs];
let elimCount = Number(localStorage.getItem('elimCount')) || 0;

const joueurListeDiv = document.getElementById("joueurListeDiv");

function afficherFinJeu() {
    joueurListeDiv.innerHTML = "<h2>Joueurs restants et leurs mots :</h2>";

    // Affichage des joueurs restants
    joueursRestants.forEach(joueur => {
        const joueurDiv = document.createElement("div");
        joueurDiv.classList.add("carte-joueur"); // classe CSS pour le style
        joueurDiv.innerHTML = `<strong class="nom-joueur">${joueur}</strong> : ${joueursMots[listJoueurs.indexOf(joueur)]}`;
        joueurListeDiv.appendChild(joueurDiv);
    });

    // Détermination du vainqueur
    const motsRestants = joueursRestants.map(j => joueursMots[listJoueurs.indexOf(j)]);
    const contientNull = motsRestants.includes(null);
    const contientSimilaire = motsRestants.some(m => m !== null && m !== motsRestants[0]);

    let resultatTexte;
    if (contientNull) {
        resultatTexte = "👻 Le Fantôme a gagné !";
    } else if (contientSimilaire) {
        resultatTexte = "🕵️‍♂️ La Taupe a gagné !";
    } else {
        resultatTexte = "🧑‍🤝‍🧑 La Foule a gagné !";
    }

    const resultatDiv = document.createElement("div");
    resultatDiv.classList.add("resultat-final");
    resultatDiv.innerHTML = resultatTexte;
    joueurListeDiv.appendChild(resultatDiv);

    localStorage.removeItem('elimCount');

    localStorage.setItem('jeuTermine', true);
    localStorage.removeItem('elimCount');

}

// Affichage de fin de JOUR (révélation mais pas fin de la partie)
function afficherFinDuJour(nextDay) {
    joueurListeDiv.innerHTML = "<h2>Fin du jour — Joueurs restants et leurs mots :</h2>";

    joueursRestants.forEach(joueur => {
        const joueurDiv = document.createElement("div");
        joueurDiv.classList.add("carte-joueur");
        joueurDiv.innerHTML = `<strong class="nom-joueur">${joueur}</strong> : ${joueursMots[listJoueurs.indexOf(joueur)]}`;
        joueurListeDiv.appendChild(joueurDiv);
    });

    const btnContinue = document.createElement('button');
    btnContinue.textContent = nextDay > 3 ? 'Fin de la partie' : `Continuer vers Jour ${nextDay}`;
    btnContinue.addEventListener('click', () => {
        if (nextDay > 3) {
            // marquer fin de jeu et afficher le résultat final
            localStorage.setItem('jeuTermine', JSON.stringify(true));
            afficherFinJeu();
            return;
        }
        // Préparer jour suivant
        localStorage.setItem('day', String(nextDay));
        localStorage.setItem('cycle', '1');
        // forcer nouvelle distribution
        localStorage.removeItem('joueursMots');
        window.location.href = 'lataupe2.html';
    });

    joueurListeDiv.appendChild(document.createElement('hr'));
    joueurListeDiv.appendChild(btnContinue);
}

function afficherJoueurs() {
    joueurListeDiv.innerHTML = "";
    joueursRestants.forEach(joueur => {
        const btn = document.createElement("button");
        btn.textContent = joueur;

        btn.addEventListener("click", () => {
            const index = listJoueurs.indexOf(joueur);
            alert(`${joueur} est éliminé ! Son mot était : ${joueursMots[index]}`);

            listJoueurs.splice(index, 1);
            joueursMots.splice(index, 1);
            joueursRestants = joueursRestants.filter(j => j !== joueur);

            localStorage.setItem('joueurs', JSON.stringify(listJoueurs));
            localStorage.setItem('joueursMots', JSON.stringify(joueursMots));

            elimCount++;
            localStorage.setItem('elimCount', elimCount);

            btn.remove();

            if ((listJoueurs.length <= 6 && elimCount >= 3) ||
                (listJoueurs.length <= 10 && elimCount >= 4) ||
                listJoueurs.length === 0) {
                alert("Fin de la phase d'élimination !");
                afficherFinJeu();
            } else {
                // Si la condition d'élimination n'est pas atteinte, on gère les cycles dans la journée
                const currentDay = Number(localStorage.getItem('day')) || 1;
                const currentCycle = Number(localStorage.getItem('cycle')) || 1;
                const cyclesPerDay = Number(localStorage.getItem('cyclesPerDay')) || 3;

                if (currentCycle < cyclesPerDay) {
                    // Il reste des cycles dans la journée : on incrémente le cycle et on retourne au passage des joueurs
                    localStorage.setItem('cycle', String(currentCycle + 1));
                    // On garde les mêmes mots (ne pas supprimer 'joueursMots')
                    window.location.href = "lataupe3.html";
                } else {
                    // Fin de la journée : révélation du jour
                    const nextDay = currentDay + 1;
                    afficherFinDuJour(nextDay);
                }
            }
        });

        joueurListeDiv.appendChild(btn);
    });
}

if (jeuTermine) {
    afficherFinJeu();
} else {
    afficherJoueurs();
}
