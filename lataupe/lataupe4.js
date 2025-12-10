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
                window.location.href = "lataupe3.html";
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
