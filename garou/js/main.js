document.addEventListener('DOMContentLoaded', () => {
    let playerCount = 0;
    const MIN_PLAYERS = 6; // Vous pouvez ajuster ce minimum
    let selectedRoles = {};

    // Références aux éléments du DOM pour la configuration
    const addPlayerBtn = document.getElementById('add-player-btn');
    const removePlayerBtn = document.getElementById('remove-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const playerInputsContainer = document.getElementById('player-inputs');
    const roleSelectionContainer = document.getElementById('role-selection');

    // --- Fonctions de Configuration de la Partie ---

    // Initialise l'écran avec un nombre minimum de joueurs
    function initialize() {
        for (let i = 0; i < MIN_PLAYERS; i++) {
            addPlayerInput();
        }
        populateRoles();
        updateCounts();
    }

    // FONCTION POUR AJOUTER UN JOUEUR
    function addPlayerInput() {
        playerCount++;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nom du Joueur ${playerCount}`;
        input.className = 'player-name-input';
        playerInputsContainer.appendChild(input);
        updateCounts();
    }

    // FONCTION POUR RETIRER UN JOUEUR
    function removePlayerInput() {
        if (playerCount > MIN_PLAYERS) {
            playerInputsContainer.removeChild(playerInputsContainer.lastChild);
            playerCount--;
            updateCounts();
        }
    }

    // FONCTION POUR AFFICHER LES RÔLES SÉLECTIONNABLES
    function populateRoles() {
        roleSelectionContainer.innerHTML = ''; // Vider pour éviter les doublons
        for (const key in ROLES) {
            const role = ROLES[key];
            const item = document.createElement('div');
            item.className = 'role-item';

            const label = document.createElement('label');
            label.textContent = role.name;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.value = 0;
            input.dataset.roleKey = key;
            // Chaque changement sur le nombre de rôles met à jour les comptes
            input.addEventListener('change', updateCounts);

            item.appendChild(label);
            item.appendChild(input);
            roleSelectionContainer.appendChild(item);
        }
    }

    // Met à jour les compteurs et vérifie si la partie peut commencer
    function updateCounts() {
        UI.playerCountSpan.textContent = playerCount;
        let totalRoles = 0;
        selectedRoles = {};
        document.querySelectorAll('#role-selection input').forEach(input => {
            const count = parseInt(input.value, 10);
            if (count > 0) {
                selectedRoles[input.dataset.roleKey] = count;
                totalRoles += count;
            }
        });
        UI.roleCountSpan.textContent = totalRoles;
        // Le bouton "Lancer la partie" n'est actif que si le nombre de joueurs = le nombre de rôles
        startGameBtn.disabled = !(totalRoles === playerCount && playerCount >= MIN_PLAYERS);
    }

    // --- Lancement du Jeu ---

    // La seule fonction qui renvoie vers game.js
    function startGame() {
    const playerNames = Array.from(document.querySelectorAll('.player-name-input'))
                                .map(input => input.value.trim());
    
    if (playerNames.some(name => name === '')) {
        alert("Veuillez donner un nom à chaque joueur.");
        return;
    }

    const audioEnabled = document.getElementById('enable-audio-checkbox').checked;


    if (audioEnabled) {
        AudioManager.play('nuit');
    }

    UI.showScreen(UI.gameScreen);

    const game = new Game(playerNames, selectedRoles, { audioEnabled });

    game.start();
}

    // --- Écouteurs d'événements pour les boutons ---
    addPlayerBtn.addEventListener('click', addPlayerInput);
    removePlayerBtn.addEventListener('click', removePlayerInput);
    startGameBtn.addEventListener('click', startGame);

    // Lancement de l'initialisation de la page de configuration
    initialize();
});