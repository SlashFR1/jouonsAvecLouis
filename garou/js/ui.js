const UI = {
    // Éléments du DOM
    setupScreen: document.getElementById('setup-screen'),
    gameScreen: document.getElementById('game-screen'),
    endScreen: document.getElementById('end-screen'),
    
    // Setup
    playerInputs: document.getElementById('player-inputs'),
    roleSelection: document.getElementById('role-selection'),
    playerCountSpan: document.getElementById('player-count'),
    roleCountSpan: document.getElementById('role-count'),
    startGameBtn: document.getElementById('start-game-btn'),
    
    // Game
    gameTitle: document.getElementById('game-title'),
    gameInstruction: document.getElementById('game-instruction'),
    playerList: document.getElementById('player-list'),
    actionContainer: document.getElementById('action-container'),
    confirmActionBtn: document.getElementById('confirm-action-btn'),

    // End
    winTitle: document.getElementById('win-title'),
    winMessage: document.getElementById('win-message'),

    // Méthodes
    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    },

    updatePlayerList(players, {onClick, selectable, maxSelection = 1, disabledIds = [], selectedIds = []}) {
        this.playerList.innerHTML = '';
        players.forEach(player => {
            if (player.isAlive) {
                const li = document.createElement('li');
                li.textContent = player.name;
                li.dataset.id = player.id;
                li.classList.add('player-item');
                if (disabledIds.includes(player.id)) {
                    li.classList.add('disabled');
                }
                if (selectedIds.includes(player.id)) {
                    li.classList.add('selected');
                }
                if (player.isProtected) {
                    li.classList.add('highlight');
                }
                li.addEventListener('click', () => {
                    if (selectable && !li.classList.contains('disabled')) {
                        onClick(player.id, maxSelection);
                    }
                });
                this.playerList.appendChild(li);
            }
        });
    },
    
    updateDeadPlayerList(players) {
        players.forEach(player => {
            if (!player.isAlive) {
                 const li = document.createElement('li');
                 li.textContent = `${player.name} (${player.role.name})`;
                 li.dataset.id = player.id;
                 li.classList.add('player-item', 'dead');
                 this.playerList.appendChild(li);
            }
        });
    },

    showMessage(title, instruction) {
        this.gameTitle.textContent = title;
        this.gameInstruction.textContent = instruction;
        this.actionContainer.style.display = 'none';
    },

    promptAction(title, instruction, {showButton = true}) {
        this.gameTitle.textContent = title;
        this.gameInstruction.textContent = instruction;
        this.actionContainer.style.display = 'block';
        this.confirmActionBtn.style.display = showButton ? 'block' : 'none';
    },

    clearActionContainer() {
        this.actionContainer.innerHTML = ''; // Vide tout sauf le bouton
        this.actionContainer.appendChild(this.confirmActionBtn);
    },

    addCustomButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClick;
        this.actionContainer.appendChild(button);
    }
};