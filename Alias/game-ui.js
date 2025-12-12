/* -------------------------------------------------------------------------- */
/*                                INITIALISATION                              */
/* -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentSeed = urlParams.get('game');
    const role = urlParams.get('role');

    // Gestion de la seed si absente
    if (!currentSeed) {
        currentSeed = Math.floor(Math.random() * 100000);
        const newUrl = window.location.pathname + '?game=' + currentSeed;
        window.history.replaceState(null, '', newUrl);
    }

    // 1. Initialiser le Moteur (Engine)
    // On s'assure que LISTE_MOTS existe, sinon tableau vide
    const mots = (typeof LISTE_MOTS !== 'undefined') ? LISTE_MOTS : [];
    initEngine(currentSeed, mots);

    // 2. Initialiser la Vue (UI) : On configure le CSS et les titres
    if (role === 'master') {
        initMasterView();
    } else if (role === 'map') {
        initMapView();
    } else {
        initBoardView();
    }

    // 3. Lancer la partie
    // On calcule une seule fois si on doit tout révéler
    const isRevealed = (role === 'master' || role === 'map');
    startGame(isRevealed);

    // 4. Activer les boutons
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('new-game-btn')?.addEventListener('click', () => window.location.href = window.location.pathname);
    document.getElementById('validate-clue-btn')?.addEventListener('click', uiSubmitClue);
    document.getElementById('pass-turn-btn')?.addEventListener('click', uiEndTurn);

    const toggleQrBtn = document.getElementById('toggle-qr-btn');
    const qrContainer = document.getElementById('qrcode-container');
    if (toggleQrBtn && qrContainer) {
        toggleQrBtn.addEventListener('click', () => {
            const isHidden = qrContainer.style.display === 'none';
            qrContainer.style.display = isHidden ? 'block' : 'none';
            toggleQrBtn.textContent = isHidden ? '📱 Masquer QR Code Maître' : '📱 Afficher QR Code Maître';
        });
    }
}

/* -------------------------------------------------------------------------- */
/*                         GESTION DE L'AFFICHAGE                             */
/* -------------------------------------------------------------------------- */

function startGame(isMaster) {
    // Le moteur réinitialise les scores
    resetGameState();
    // Le moteur génère les données
    generateGridData();

    updateUI();
    renderGrid(isMaster);
}
function renderGrid(forceReveal) {
    const container = document.getElementById('board-container');
    container.innerHTML = '';
    // ... config grille ...

    const isMapMode = document.body.classList.contains('map-mode');

    gridData.forEach(card => {
        const btn = document.createElement('button');
        btn.innerText = isMapMode ? "" : card.word;
        btn.className = 'game-card'; // Classe de base
        
        // Est-ce qu'on doit montrer la couleur ?
        const showColor = forceReveal || card.revealed || isMapMode;

        if (showColor) {
            // MAGIE DU CSS : On ajoute juste la classe du type (ex: "team-rouge")
            btn.classList.add(`team-${card.type}`);
            btn.disabled = true;

            // Si c'est le maître et que la carte n'est pas encore jouée
            if (forceReveal && !card.revealed && !isMapMode) {
                btn.classList.add('master-hint'); // Ajoute les pointillés
            }
        } else {
            // Carte cachée
            btn.style.backgroundColor = '#bdc3c7'; // Tu peux aussi faire une classe .hidden
            btn.onclick = () => uiHandleCardClick(card);
        }

        container.appendChild(btn);
    });
}
/* -------------------------------------------------------------------------- */
/*                         INTERACTIONS UTILISATEUR                           */
/* -------------------------------------------------------------------------- */

function uiSubmitClue() {
    const wordInput = document.getElementById('clue-word');
    const numInput = document.getElementById('clue-number');
    const word = wordInput.value.trim();
    const num = parseInt(numInput.value);

    if (!word) return showCustomModal("ERREUR", "Il faut entrer un mot indice !", "danger");

    gameState.canClick = true;
    gameState.guessesAllowed = num + 1;

    document.getElementById('validate-clue-btn').disabled = true;
    document.getElementById('pass-turn-btn').disabled = false;
    document.getElementById('game-status-message').innerText = `Trouvez ${num} mots !`;

    addToHistory(`Maitre ${gameState.currentTeam} : "${word}" (${num})`);
    updateUI();
}

function uiHandleCardClick(card) {
    if (gameState.gameOver || !gameState.canClick || card.revealed) return;

    card.revealed = true;
    gameState.guessesAllowed--;
    renderGrid(false); // Re-render partiel pour afficher la couleur

    // 1. ASSASSIN
    if (card.type === TYPES.ASSASSIN) {
        addToHistory(`☠️ ASSASSIN (${card.word})`);
        uiEndGame(false);
        return;
    }

    // 2. BONNE RÉPONSE
    if (card.type === gameState.currentTeam) {
        gameState.scores[gameState.currentTeam]--;
        addToHistory(`✅ ${card.word}`);

        const victory = checkVictoryCondition();
        if (victory.over) {
            uiEndGame(true, victory.winner);
            return;
        }

        if (gameState.guessesAllowed === 0) {
            uiEndTurn();
        } else {
            document.getElementById('game-status-message').innerText = `Bien ! Encore ${gameState.guessesAllowed} essai(s).`;
        }
    }
    // 3. MAUVAISE RÉPONSE
    else {
        if (card.type === TYPES.NEUTRE) {
            addToHistory(`😐 Neutre (${card.word}) -> Fin du tour`);
            showCustomModal("TÉMOIN NEUTRE", `Passant innocent (${card.word}). Fin du tour !`, "neutral");
        } else {
            // Point à l'adversaire
            gameState.scores[card.type]--;
            addToHistory(`❌ Aïe ! (${card.word}) -> Point pour l'adversaire`);
            showCustomModal("OUPS !", `Agent ennemi (${card.word}) ! Ils gagnent le point.`, "danger");

            const victory = checkVictoryCondition();
            if (victory.over) {
                uiEndGame(true, victory.winner);
                return;
            }
        }
        uiEndTurn();
    }
    updateUI();
}

function uiEndTurn() {
    if (gameState.gameOver) return;

    processTurnSwitch(); // Appel Engine

    document.getElementById('clue-word').value = '';
    document.getElementById('clue-number').value = '1';
    document.getElementById('validate-clue-btn').disabled = false;
    document.getElementById('pass-turn-btn').disabled = true;

    updateUI();
}

function uiEndGame(success, winner) {
    gameState.gameOver = true;
    gameState.canClick = false;
    renderGrid(true); // Tout révéler

    if (success) {
        showCustomModal("MISSION ACCOMPLIE", `VICTOIRE DES ${winner.toUpperCase()} !`, "success");
        document.getElementById('game-status-message').innerText = `VICTOIRE ${winner.toUpperCase()} !`;
    } else {
        showCustomModal("MISSION ÉCHOUÉE", "L'ASSASSIN A ÉTÉ TROUVÉ ! BOUM !", "danger");
        document.getElementById('game-status-message').innerText = "DÉFAITE (ASSASSIN)";
    }
}

/* -------------------------------------------------------------------------- */
/*                         HELPERS UI & MODALES                               */
/* -------------------------------------------------------------------------- */

function updateUI() {
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    safeSetText('score-rouge', `Rouge : ${Math.max(0, gameState.scores.rouge)}`);
    safeSetText('score-bleu', `Bleu : ${Math.max(0, gameState.scores.bleu)}`);

    const teamDisplay = document.getElementById('current-team-name');
    if (teamDisplay) {
        teamDisplay.innerText = gameState.currentTeam.toUpperCase();
        teamDisplay.style.color = (gameState.currentTeam === 'rouge') ? '#e74c3c' : '#3498db';
    }

    const statusMsg = document.getElementById('game-status-message');
    if (statusMsg && !gameState.gameOver && !gameState.canClick) {
        statusMsg.innerText = `Au tour des ${gameState.currentTeam.toUpperCase()}`;
    }
}

function addToHistory(msg) {
    const ul = document.getElementById('history-list');
    if (!ul) return;
    const li = document.createElement('li');
    li.innerText = msg;
    li.style.color = (gameState.currentTeam === 'rouge') ? 'darkred' : 'darkblue';
    ul.prepend(li);
}

function showCustomModal(title, message, type = 'info') {
    const modal = document.getElementById('custom-modal');
    if (!modal) {
        alert(`${title}\n\n${message}`);
        return;
    }
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;

    const content = modal.querySelector('.modal-content');
    if (content) content.className = `modal-content modal-type-${type}`; // Assurez-vous d'avoir CSS pour ça ou gardez simple

    modal.classList.add('visible');
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('visible');
}

function initMasterView() {
    document.body.classList.add('spymaster-mode');
    const header = document.getElementById('game-header');
    if (header) header.innerHTML = `<h2 style="color:white; text-align:center;">VUE MAÎTRE (#${gameState.seed})</h2>`;
    hidePlayerControls();
}

function initMapView() {
    document.body.classList.add('map-mode');
    const header = document.getElementById('game-header');
    if (header) header.innerHTML = `<h2 style="color:white; text-align:center;">CARTE CLÉ (#${gameState.seed})</h2>`;
    hidePlayerControls();
}

function initBoardView() {
    const fullUrl = window.location.href + (window.location.search ? '&' : '?') + "role=master";
    const qrDiv = document.getElementById("qrcode");
    if (qrDiv) {
        qrDiv.innerHTML = "";
        try { new QRCode(qrDiv, { text: fullUrl, width: 128, height: 128 }); } catch (e) { }
    }
    const inputLink = document.getElementById('share-link-input');
    if (inputLink) inputLink.value = fullUrl;
}

function hidePlayerControls() {
    const controls = document.getElementById('spymaster-controls');
    if (controls) controls.style.display = 'none';
    const sidebar = document.getElementById('game-sidebar');
    if (sidebar) sidebar.style.display = 'none';
}