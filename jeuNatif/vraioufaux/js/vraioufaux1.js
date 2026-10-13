// --- 1. CHARGEMENT DES CATÉGORIES ---
const select = document.getElementById("categorySelect");

// On remplit le menu déroulant avec les catégories de data.js
categoryNames.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
});

// --- 2. GESTION DES JOUEURS ---
let joueursListe = [];

function ajouterJoueur() {
    const input = document.getElementById("playerInput");
    const nom = input.value.trim();

    if (nom !== "") {
        joueursListe.push(nom);
        afficherJoueurs();
        input.value = ""; // Vider le champ
        input.focus();
    }
}

// Permet d'ajouter avec la touche Entrée
document.getElementById("playerInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") ajouterJoueur();
});

function afficherJoueurs() {
    const container = document.getElementById("listeJoueurs");
    container.innerHTML = ""; // On nettoie la zone avant de réafficher

    joueursListe.forEach((nom, index) => {
        // Création de la div pour le prénom
        const div = document.createElement("div");
        div.className = "player-tag"; // IMPORTANT : C'est ce lien avec le CSS
        
        // Le contenu HTML (Nom + croix de suppression)
        div.innerHTML = `
            ${nom} 
            <span onclick="supprimerJoueur(${index})" title="Supprimer">✕</span>
        `;
        
        container.appendChild(div);
    });
}
function supprimerJoueur(index) {
    joueursListe.splice(index, 1);
    afficherJoueurs();
}

// --- 3. LANCEMENT DU JEU ---
function validerEtLancer() {
    if (joueursListe.length < 2) {
        alert("Il faut au moins 2 joueurs pour commencer !");
        return;
    }

    // 1. Sauvegarde les joueurs
    localStorage.setItem("joueurs", JSON.stringify(joueursListe));
    
    // 2. Sauvegarde la catégorie choisie
    const selectedCat = select.value;
    localStorage.setItem("selectedCategory", selectedCat);

    // 3. Redirection vers la page de jeu (adapte le nom du fichier HTML si besoin)
    window.location.href = "vraioufaux2.html"; 
}

// Fonctions pour la modale des règles (déjà présentes dans ton HTML)
function toggleRules() {
    const modal = document.getElementById("rulesModal");
    modal.style.display = (modal.style.display === "none" || modal.style.display === "") ? "flex" : "none";
}