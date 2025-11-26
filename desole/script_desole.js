// ==================== Helpers ====================
const $ = sel => document.querySelector(sel);

// ==================== UI elements ====================
// Screens
const setupScreen = $('#setup-screen');
const gameScreen = $('#game-screen');
const revealScreen = $('#reveal-screen');

// Setup
const playerNameInput = $('#player-name');
const addPlayerBtn = $('#add-player-btn');
const playersList = $('#players-list');
const startGameBtn = $('#start-game-btn');
const clearPlayersBtn = $('#clear-players-btn');
const roundsNumberInput = $('#rounds-number'); // N'était pas déclaré

// Game
const turnInfo = $('#turn-info');
const playerTurn = $('#player-turn');
const instruction = $('#instruction');
const promptDisplay = $('#prompt-display');
const phraseMode = $('#phrase-mode');
const drawingMode = $('#drawing-mode');
const phraseInput = $('#phrase-input');
const readyBtn = $('#ready-btn');

// Canvas
const canvas = $('#draw-canvas');
const colorInput = $('#color-input');
const sizeInput = $('#size-input');
const eraserBtn = $('#eraser-btn');
const clearCanvasBtn = $('#clear-canvas-btn');
const ctx = canvas.getContext('2d');

// Reveal
const revealTitle = $('#reveal-title');
const albumSelector = $('#album-selector');
const timelineDisplay = $('#timeline-display');
const replayBtn = $('#replay-btn');

// ==================== State ====================
let players = [];
let albums = [];
let totalRounds = 0;
let currentRound = 0;
let turnIndex = 0;
let drawing = false;
let erasing = false;

// ==================== Setup Logic ====================
function renderPlayers() {
    playersList.innerHTML = '';
    players.forEach((p, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${p}`;
        playersList.appendChild(li);
    });
    // La logique d'activation/désactivation du bouton est centralisée ici
    startGameBtn.disabled = players.length < 4 || players.length > 20;
}

function addPlayer() {
    const name = playerNameInput.value.trim();
    if (name && players.length < 20) {
        players.push(name);
        playerNameInput.value = '';
        playerNameInput.focus();
        renderPlayers();
    }
}

// --- Événements de la page de configuration ---
addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Empêche le comportement par défaut
        addPlayer();
    }
});
clearPlayersBtn.addEventListener('click', () => {
    players = [];
    renderPlayers();
});
startGameBtn.addEventListener('click', () => {
    // La vérification est redondante car le bouton est désactivé si la condition n'est pas remplie,
    // mais c'est une sécurité supplémentaire.
    if (!startGameBtn.disabled) {
        startGame();
    }
});


// ==================== Game Flow ====================
function startGame() {
    const chosenRounds = parseInt(roundsNumberInput.value, 10);
    totalRounds = (chosenRounds > 0) ? chosenRounds : players.length;

    currentRound = 1;
    turnIndex = 0;
    albums = players.map(p => ({
        proprietaire: p,
        etapes: []
    }));
    showScreen('game');
    showTurn();
}

function showTurn() {
    if (currentRound > totalRounds) {
        startReveal();
        return;
    }

    const currentPlayer = players[turnIndex];
    turnInfo.textContent = `Tour ${currentRound}/${totalRounds}`;
    playerTurn.textContent = `C'est au tour de ${currentPlayer} !`;

    if (turnIndex === 0 && currentRound > 1) {
        albums.unshift(albums.pop());
    }

    const albumToActOn = albums[turnIndex];
    const lastStep = albumToActOn.etapes[albumToActOn.etapes.length - 1];

    let mode = 'phrase'; // Par défaut
    if (currentRound > 1) {
        mode = (lastStep && lastStep.type === 'phrase') ? 'dessin' : 'phrase';
    }

    if (mode === 'phrase') {
        if (currentRound === 1) {
            instruction.textContent = "Écris une phrase de départ !";
            promptDisplay.classList.add('hidden');
        } else {
            instruction.textContent = "Décris ce que tu vois !";
            promptDisplay.innerHTML = `<img src="${lastStep.contenu}" alt="Dessin à décrire">`;
            promptDisplay.classList.remove('hidden');
        }
        showPhraseMode(albumToActOn);
    } else { // mode === 'dessin'
        instruction.textContent = "Dessine cette phrase !";
        promptDisplay.innerHTML = `<div class="phrase-prompt">${escapeHtml(lastStep.contenu)}</div>`;
        promptDisplay.classList.remove('hidden');
        showDrawingMode(albumToActOn);
    }
}

function nextTurn() {
    turnIndex++;
    if (turnIndex >= players.length) {
        turnIndex = 0;
        currentRound++;
    }
    showTurn();
}

// ==================== Game Modes ====================
function showPhraseMode(album) {
    drawingMode.classList.add('hidden');
    phraseMode.classList.remove('hidden');
    phraseInput.value = '';
    phraseInput.focus();

    readyBtn.onclick = () => {
        album.etapes.push({
            type: 'phrase',
            contenu: phraseInput.value.trim() || '(Rien...)',
            auteur: players[turnIndex]
        });
        nextTurn();
    };
}

function showDrawingMode(album) {
    phraseMode.classList.add('hidden');
    drawingMode.classList.remove('hidden');
    resizeCanvasToDisplay();

    readyBtn.onclick = () => {
        album.etapes.push({
            type: 'dessin',
            contenu: canvas.toDataURL(),
            auteur: players[turnIndex]
        });
        nextTurn();
    };
}


// ==================== Canvas Logic ====================
function resizeCanvasToDisplay() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.width * (3 / 4) * scale);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.width * (3 / 4)}px`;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorInput.value;
    ctx.lineWidth = parseInt(sizeInput.value, 10) * scale;
    clearCanvas();
}

function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scale,
        y: (clientY - rect.top) * scale
    };
}

function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    draw(e);
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pointerPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
}

function stopDrawing() {
    if (drawing) {
        ctx.closePath();
        drawing = false;
    }
}

// --- Événements du Canvas ---
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

colorInput.addEventListener('input', () => {
    ctx.strokeStyle = colorInput.value;
});
sizeInput.addEventListener('input', () => {
    const scale = window.devicePixelRatio || 1;
    ctx.lineWidth = parseInt(sizeInput.value, 10) * scale;
});
eraserBtn.addEventListener('click', () => {
    erasing = !erasing;
    eraserBtn.classList.toggle('active', erasing);
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
});
clearCanvasBtn.addEventListener('click', clearCanvas);


// ==================== Reveal Logic ====================
function startReveal() {
    showScreen('reveal');
    albumSelector.innerHTML = '';

    albums.forEach((album, index) => {
        const btn = document.createElement('button');
        btn.textContent = album.proprietaire;
        btn.addEventListener('click', () => {
            renderFullAlbum(index);
        });
        albumSelector.appendChild(btn);
    });

    if (albums.length > 0) {
        renderFullAlbum(0);
    }
}

function renderFullAlbum(albumIndex) {
    const album = albums[albumIndex];
    if (!album) return;

    revealTitle.textContent = `L'album commencé par ${album.proprietaire}`;
    timelineDisplay.innerHTML = '';

    Array.from(albumSelector.children).forEach((btn, index) => {
        btn.classList.toggle('active', index === albumIndex);
    });

    album.etapes.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'timeline-step';

        const contentHTML = step.type === 'phrase' ?
            `<div class="phrase-content">"${escapeHtml(step.contenu)}"</div>` :
            `<div class="drawing-content"><img src="${step.contenu}" alt="dessin"></div>`;

        stepElement.innerHTML = `
            <p class="legend">${step.auteur} a ${step.type === 'phrase' ? 'écrit' : 'dessiné'} :</p>
            ${contentHTML}
        `;
        timelineDisplay.appendChild(stepElement);
    });
}


// ==================== Game Reset Logic ====================
function resetGame() {
    players = [];
    albums = [];
    totalRounds = 0;
    currentRound = 0;
    turnIndex = 0;
    playerNameInput.value = '';
    roundsNumberInput.value = '';

    renderPlayers();
    showScreen('setup');
}

// --- Événement de fin de partie ---
replayBtn.addEventListener('click', resetGame);


// ==================== Utilities ====================
function showScreen(name) {
    setupScreen.classList.toggle('active', name === 'setup');
    gameScreen.classList.toggle('active', name === 'game');
    revealScreen.classList.toggle('active', name === 'reveal');
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== Initialisation ====================
// Au chargement de la page, s'assurer que l'état initial est correct.
document.addEventListener('DOMContentLoaded', () => {
    renderPlayers();
    showScreen('setup');
});