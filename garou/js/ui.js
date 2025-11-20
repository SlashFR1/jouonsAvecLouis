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

    updatePlayerList(players, { onClick, selectable, maxSelection = 1, disabledIds = [], selectedIds = [] }) {
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
        this.gameInstruction.innerHTML = instruction;
        this.actionContainer.style.display = 'none';
    },

    promptAction(title, instruction, { showButton = true }) {
        this.gameTitle.textContent = title;
        this.gameInstruction.innerHTML = instruction;
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
    },

        speak() {
        // 1. Récupère le texte VISIBLE à l'écran (ignore le HTML)
        const titleText = this.gameTitle.innerText;
        const instructionText = this.gameInstruction.innerText;
        const textToSpeak = `${titleText}. ${instructionText}`;

        // Si il n'y a rien à dire, on ne fait rien
        if (!textToSpeak.trim() || textToSpeak.trim() === '.') return;

        // 2. Annule toute voix précédente et prépare la nouvelle
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9; // Vitesse légèrement plus lente pour la clarté

        // 3. ORCHESTRATION : Quand la voix commence, on met la musique en pause
        utterance.onstart = () => {
            AudioManager.pause();
        };

        // 4. ORCHESTRATION : Quand la voix a fini, on relance la musique
        utterance.onend = () => {
            AudioManager.resume();
        };

        // 5. SÉCURITÉ : Si la voix plante, on relance la musique aussi
        utterance.onerror = () => {
            console.error("Une erreur de synthèse vocale est survenue.");
            AudioManager.resume();
        };

        // 6. On lance la lecture vocale
        window.speechSynthesis.speak(utterance);
    },

    // Assurez-vous que vos fonctions d'affichage utilisent .innerHTML
    // pour que les rôles s'affichent correctement visuellement.
    showMessage(title, instruction) {
        this.gameTitle.textContent = title;
        this.gameInstruction.innerHTML = instruction; // Important pour l'affichage des rôles
        this.actionContainer.style.display = 'none';
    },

    promptAction(title, instruction, { showButton = true }) {
        this.gameTitle.textContent = title;
        this.gameInstruction.innerHTML = instruction; // Important pour l'affichage des rôles
        this.actionContainer.style.display = 'block';
        this.confirmActionBtn.style.display = showButton ? 'block' : 'none';
    },

};