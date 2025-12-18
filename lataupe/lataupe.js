let players = [];

function getEl(id) {
    return document.getElementById(id);
}

function addPlayer() {
    const input = getEl('input-player-name');
    const name = input.value.trim();
    
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

function startGame() {
    if (players.length < 3) {
        alert("Il faut au moins 3 joueurs pour lancer une partie ! 🧐");
        return;
    }
    const listePrenoms = players.map(joueur => joueur.name);
    localStorage.setItem('joueurs', JSON.stringify(listePrenoms));
    window.location.href = 'lataupe2.html';
}


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