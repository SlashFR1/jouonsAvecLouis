// --- GESTION DES JOUEURS ---
let joueurs = [];

// Ajout avec la touche Entrée
document.getElementById('playerInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        ajouterJoueur();
    }
});

function toggleRules() {
  const modal = document.getElementById('rulesModal');
  // Cette ligne ajoute ou enlève la classe qui affiche la modale
  modal.classList.toggle('show-modal');
}

// Optionnel : Fermer la fenêtre si on clique sur le fond sombre (en dehors de la carte)
window.onclick = function(event) {
  const modal = document.getElementById('rulesModal');
  if (event.target === modal) {
    modal.classList.remove('show-modal');
  }
}

function ajouterJoueur() {
    const input = document.getElementById('playerInput');
    const prenom = input.value.trim();

    // Vérifie si vide ou déjà présent
    if (!prenom) return;
    if (joueurs.includes(prenom)) {
        alert("Ce joueur est déjà dans la partie !");
        return;
    }

    joueurs.push(prenom);
    afficherJoueurs();
    input.value = "";
    input.focus();
}

function supprimerJoueur(index) {
    joueurs.splice(index, 1);
    afficherJoueurs();
}

function afficherJoueurs() {
    const container = document.getElementById('listeJoueurs');
    container.innerHTML = "";

    joueurs.forEach((joueur, index) => {
        const tag = document.createElement('div');
        tag.className = 'player-tag';
        tag.innerHTML = `
            <span>${joueur}</span>
            <button class="delete-btn" onclick="supprimerJoueur(${index})">&times;</button>
        `;
        container.appendChild(tag);
    });
}

// --- GESTION DE LA CONFIGURATION ---
const modeSelect = document.getElementById('mode-select');
const manchesDiv = document.getElementById('manches-input-div');
const scoreDiv = document.getElementById('score-input-div');
const validerConfigBtn = document.getElementById('valider-config');

// Basculer l'affichage selon le select
modeSelect.addEventListener('change', () => {
    if (modeSelect.value === 'manches') {
        manchesDiv.style.display = 'block';
        scoreDiv.style.display = 'none';
    } else {
        manchesDiv.style.display = 'none';
        scoreDiv.style.display = 'block';
    }
});

// --- VALIDATION FINALE ---
validerConfigBtn.addEventListener('click', () => {
    // 1. Vérifier les joueurs
    if (joueurs.length < 1) { // Idéalement 2 pour jouer à plusieurs, mais ton code demandait 1
        alert("Ajoutez au moins un joueur !");
        return;
    }

    // 2. Récupérer la config
    let options = {};
    if (modeSelect.value === 'manches') {
        const nb = parseInt(document.getElementById('nombre-manches').value);
        if(nb < 1) { alert("Nombre de manches invalide"); return; }
        options.mode = 'manches';
        options.nombreManches = nb;
    } else {
        const sc = parseInt(document.getElementById('score-max').value);
        if(sc < 1) { alert("Score invalide"); return; }
        options.mode = 'score';
        options.scoreMax = sc;
    }

    // 3. Sauvegarder dans LocalStorage
    localStorage.setItem('joueurs', JSON.stringify(joueurs));
    localStorage.setItem('nombreJoueurs', joueurs.length);
    localStorage.setItem('modePartieConfig', JSON.stringify(options));

    // 4. Redirection
    // J'ai mis un petit délai pour voir l'effet du bouton appuyé (optionnel)
    setTimeout(() => {
        window.location.href = 'yams2.html';
    }, 100);
});

// --- GESTION MODALE RÈGLES ---
function toggleRules() {
    const modal = document.getElementById('rulesModal');
    if (modal.classList.contains('show-modal')) {
        modal.classList.remove('show-modal');
    } else {
        modal.classList.add('show-modal');
    }
}