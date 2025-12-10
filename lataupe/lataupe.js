let players = [];

function getEl(id) {
    return document.getElementById(id);
}

function addPlayer() {
    const input = getEl('input-player-name');
    const name = input.value.trim();
    
    // Empêcher d'ajouter des noms vides
    if (name) {
        players.push({ name: name, score: 0 });
        input.value = '';
        renderPlayerList();
    }
}

function renderPlayerList() {
    const list = getEl('player-list');
    
    if (players.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#ccc; margin-top:10px;">Aucun joueur...</p>';
        return;
    }

    list.innerHTML = players.map((p, index) =>
        `<div>
            <span>🎭 ${p.name}</span> 
            <button class="btn btn-small" style="padding: 5px 10px; font-size: 12px;" onclick="removePlayer(${index})">❌</button>
        </div>`
    ).join('');
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayerList();
}

// --- FONCTION POUR LANCER LA PARTIE VERS LATAUPE2.HTML ---
function startGame() {
    // Vérification : il faut au moins 3 joueurs pour jouer à la Taupe
    if (players.length < 3) {
        alert("Il faut au moins 3 joueurs pour lancer une partie ! 🧐");
        return;
    }

    // Sauvegarde des joueurs dans le navigateur pour la page suivante
    localStorage.setItem('taupe_players', JSON.stringify(players));

    // Redirection vers la page de jeu
    window.location.href = 'lataupe2.html';
}

function openRules() {
    const modal = getEl('modal-rules');
    modal.classList.add('active'); // Utilise la classe CSS pour l'affichage flex
    modal.style.display = 'flex'; 
}

function closeRules() {
    const modal = getEl('modal-rules');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

// Gestionnaires d'événements
window.onclick = function (event) {
    const modal = getEl('modal-rules');
    if (event.target === modal) {
        closeRules();
    }
}

getEl('input-player-name').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
});