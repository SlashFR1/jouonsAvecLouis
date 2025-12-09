// Liste globale des joueurs
let joueurs = [];

// Écouteur pour la touche "Entrée" dans l'input
document.getElementById('playerInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault(); // Empêche le rechargement du formulaire
    ajouterJoueur();
  }
});

// Fonction pour ajouter un joueur visuellement et dans le tableau
function ajouterJoueur() {
  const input = document.getElementById('playerInput');
  const prenom = input.value.trim();

  if (prenom !== "") {
    // Ajout au tableau
    joueurs.push(prenom);
    
    // Mise à jour de l'affichage
    afficherJoueurs();
    
    // Vider l'input et remettre le focus
    input.value = "";
    input.focus();
  }
}

// Fonction pour supprimer un joueur
function supprimerJoueur(index) {
  joueurs.splice(index, 1);
  afficherJoueurs();
}

// Fonction pour afficher la liste (rendu HTML)
function afficherJoueurs() {
  const container = document.getElementById('listeJoueurs');
  container.innerHTML = ""; // On vide avant de reconstruire

  joueurs.forEach((joueur, index) => {
    // Création de l'élément visuel
    const tag = document.createElement('div');
    tag.className = 'player-tag';
    
    tag.innerHTML = `
      <span>${joueur}</span>
      <button class="delete-btn" onclick="supprimerJoueur(${index})">&times;</button>
    `;
    
    container.appendChild(tag);
  });
}

// Validation finale et redirection
function validerEtLancer() {
  if (joueurs.length < 2) {
    // Petite animation ou alerte si pas assez de joueurs
    alert("Il faut au moins 2 joueurs pour s'amuser !");
    return;
  }

  // Stocker les joueurs dans le localStorage
  localStorage.setItem("joueurs", JSON.stringify(joueurs));

  // Redirection
  window.location.href = "vraioufaux2.html";
}

// Gestion de la modale Règles
function toggleRules() {
  const modal = document.getElementById('rulesModal');
  if (modal.classList.contains('show-modal')) {
    modal.classList.remove('show-modal');
  } else {
    modal.classList.add('show-modal');
  }
}