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

// Reveal
const revealTitle = $('#reveal-title');
const stepDisplay = $('#step-display');
const stepLegend = $('#step-legend');
const nextStepBtn = $('#next-step-btn');
const prevStepBtn = $('#prev-step-btn');
const nextAlbumBtn = $('#next-album-btn');
const albumSelector = $('#album-selector'); // NOUVEAU
const timelineDisplay = $('#timeline-display'); // nouveau
const replayBtn = $('#replay-btn'); // C'est lui qui était mal déclaré avant.

// ==================== State ====================
let players = [];
let albums = [];
let totalRounds = 0;
let currentRound = 0;
let turnIndex = 0;
let currentReveal = { albumIndex: 0, stepIndex: 0 };
const ctx = canvas.getContext('2d');
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
  startGameBtn.disabled = players.length < 4 || players.length > 20;
}

addPlayerBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (!name || players.length >= 20) return;
  players.push(name);
  playerNameInput.value = '';
  playerNameInput.focus();
  renderPlayers();
});

playerNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayerBtn.click(); });
clearPlayersBtn.addEventListener('click', () => { players = []; renderPlayers(); });
startGameBtn.addEventListener('click', () => { if (players.length >= 4) startGame(); });

// ==================== Game Flow ====================
function startGame() {
  // Lit la valeur de l'input pour le nombre de manches
  const chosenRounds = parseInt(roundsNumberInput.value, 10);

  // Si une valeur valide et positive a été entrée, on l'utilise.
  // Sinon, on prend le nombre de joueurs par défaut.
  if (chosenRounds > 0) {
    totalRounds = chosenRounds;
  } else {
    totalRounds = players.length;
  }

  // Le reste de la fonction est inchangé
  currentRound = 1;
  turnIndex = 0;
  albums = players.map(p => ({ proprietaire: p, etapes: [] }));
  showScreen('game');
  showTurn();
}

/**
 * C'EST LA FONCTION CLÉ QUI A ÉTÉ CORRIGÉE
 * Elle décide quoi afficher à chaque tour.
 */
function showTurn() {
  if (currentRound > totalRounds) {
    startReveal();
    return;
  }

  const currentPlayer = players[turnIndex];
  turnInfo.textContent = `Tour ${currentRound}/${totalRounds}`;
  playerTurn.textContent = `C'est au tour de ${currentPlayer} !`;

  // Redistribution des albums au début de chaque nouveau tour (sauf le premier)
  if (turnIndex === 0 && currentRound > 1) {
    albums.unshift(albums.pop()); // Décale simplement les albums d'une position
  }

  const albumToActOn = albums[turnIndex];
  const lastStep = albumToActOn.etapes[albumToActOn.etapes.length - 1];

  // Déterminons le mode en fonction de l'état du jeu
  let mode = '';
  // Si c'est le premier tour, tout le monde écrit une phrase.
  if (currentRound === 1) {
    mode = 'phrase';
  }
  // Sinon, on regarde la dernière étape de l'album reçu.
  else if (lastStep && lastStep.type === 'phrase') {
    mode = 'dessin';
  }
  // Si la dernière étape est un dessin, ou si par erreur il n'y a pas d'étape
  else {
    mode = 'phrase';
  }

  // Maintenant on affiche le bon mode et la bonne consigne
  if (mode === 'phrase') {
    // Si on doit écrire une phrase, c'est soit le début, soit pour décrire un dessin
    if (currentRound === 1) {
      instruction.textContent = "Écris une phrase de départ !";
      promptDisplay.classList.add('hidden'); // Pas de consigne au début
    } else {
      instruction.textContent = "Décris ce que tu vois !";
      promptDisplay.innerHTML = `<img src="${lastStep.contenu}" alt="Dessin à décrire">`;
      promptDisplay.classList.remove('hidden');
    }
    showPhraseMode(albumToActOn);
  }
  else { // mode === 'dessin'
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
  // Très important : on redimensionne le canvas chaque fois qu'on l'affiche
  // pour l'effacer et s'assurer qu'il a la bonne taille.
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
  canvas.height = Math.floor(rect.width * (3 / 4) * scale); // Maintenir un ratio 4:3

  // Mettre à jour le style CSS pour qu'il corresponde
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
  drawing = true;
  const p = pointerPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  draw(e);
}

function draw(e) {
  if (!drawing) return;
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

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); stopDrawing(e); });

colorInput.addEventListener('input', () => { ctx.strokeStyle = colorInput.value; });
sizeInput.addEventListener('input', () => {
  const scale = window.devicePixelRatio || 1;
  ctx.lineWidth = parseInt(sizeInput.value, 10) * scale;
});
eraserBtn.addEventListener('click', () => {
  erasing = !erasing;
  eraserBtn.classList.toggle('active');
  ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
});
clearCanvasBtn.addEventListener('click', clearCanvas);


// ==================== Reveal Logic (Version Finale Corrigée) ====================

function startReveal() {
  showScreen('reveal');
  albumSelector.innerHTML = ''; // Toujours vider avant de reconstruire

  // 1. Créer les boutons de sélection
  albums.forEach((album, index) => {
    const btn = document.createElement('button');
    btn.textContent = album.proprietaire;

    // CORRECTION IMPORTANTE :
    // On attache un écouteur d'événement propre à chaque bouton.
    btn.addEventListener('click', () => {
      renderFullAlbum(index);
    });

    albumSelector.appendChild(btn);
  });

  // 2. Afficher le premier album par défaut
  renderFullAlbum(0);
}

/**
 * Affiche la timeline COMPLÈTE d'un album.
 * @param {number} albumIndex - L'index de l'album à afficher.
 */
function renderFullAlbum(albumIndex) {
  const album = albums[albumIndex];
  if (!album) return;

  // Met à jour le titre principal
  revealTitle.textContent = `L'album commencé par ${album.proprietaire}`;

  // Vide l'affichage précédent
  timelineDisplay.innerHTML = '';

  // Met en surbrillance le bouton du joueur sélectionné
  Array.from(albumSelector.children).forEach((btn, index) => {
    btn.classList.toggle('active', index === albumIndex);
  });

  // Construit la chaîne d'étapes en colonne
  album.etapes.forEach(step => {
    const stepElement = document.createElement('div');
    stepElement.className = 'timeline-step';

    let contentHTML = '';
    if (step.type === 'phrase') {
      contentHTML = `<div class="phrase-content">"${escapeHtml(step.contenu)}"</div>`;
    } else {
      contentHTML = `<div class="drawing-content"><img src="${step.contenu}" alt="dessin"></div>`;
    }

    stepElement.innerHTML = `
      <p class="legend">${step.auteur} a ${step.type === 'phrase' ? 'écrit' : 'dessiné'} :</p>
      ${contentHTML}
    `;

    timelineDisplay.appendChild(stepElement);
  });
}

// Lier l'événement au bouton Rejouer
replayBtn.addEventListener('click', () => {
  // Réinitialiser toutes les variables d'état
  players = [];
  albums = [];
  totalRounds = 0;
  currentRound = 0;
  turnIndex = 0;

  // Retourner à l'écran de configuration
  renderPlayers(); // Pour vider la liste affichée
  showScreen('setup');
});

function showAlbumStep() {
  const album = albums[currentReveal.albumIndex];
  if (!album) return;
  revealTitle.textContent = `L'album de ${album.proprietaire}`;
  const step = album.etapes[currentReveal.stepIndex];
  if (!step) {
    stepDisplay.innerHTML = '<em>Fin de l\'album !</em>';
    stepLegend.textContent = '';
    return;
  }
  if (step.type === 'phrase') {
    stepDisplay.innerHTML = `<div class="phrase">${escapeHtml(step.contenu)}</div>`;
  } else {
    stepDisplay.innerHTML = `<img src="${step.contenu}" alt="dessin">`;
  }
  stepLegend.textContent = `Étape ${currentReveal.stepIndex + 1}: ${step.auteur} a ${step.type === 'phrase' ? 'écrit' : 'dessiné'}`;
}

nextStepBtn.addEventListener('click', () => {
  const album = albums[currentReveal.albumIndex];
  if (album && currentReveal.stepIndex < album.etapes.length - 1) {
    currentReveal.stepIndex++;
    showAlbumStep();
  }
});
prevStepBtn.addEventListener('click', () => { if (currentReveal.stepIndex > 0) { currentReveal.stepIndex--; showAlbumStep(); } });
nextAlbumBtn.addEventListener('click', () => {
  if (currentReveal.albumIndex < albums.length - 1) {
    currentReveal.albumIndex++;
    currentReveal.stepIndex = 0;
    showAlbumStep();
  }
});
replayBtn.addEventListener('click', () => {
  players = []; albums = [];
  renderPlayers();
  showScreen('setup');
});

// ==================== Utilities ====================
function showScreen(name) {
  setupScreen.classList.toggle('active', name === 'setup');
  gameScreen.classList.toggle('active', name === 'game');
  revealScreen.classList.toggle('active', name === 'reveal');
}

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ==================== Initialisation ====================
window.addEventListener('load', () => renderPlayers());

// ==================== Game Reset Logic (NOUVEAU) ====================

/**
 * Réinitialise le jeu pour une nouvelle partie mais conserve les joueurs.
 */
function startNewGame() {
  // Réinitialiser les variables de jeu
  albums = [];
  totalRounds = 0;
  currentRound = 0;
  turnIndex = 0;

  // Retourner à l'écran de configuration avec la liste des joueurs intacte
  renderPlayers();
  showScreen('setup');
}

/**
 * Réinitialise complètement l'application, y compris la liste des joueurs.
 */
function resetEverything() {
  // Réinitialiser toutes les variables d'état
  players = [];
  albums = [];
  totalRounds = 0;
  currentRound = 0;
  turnIndex = 0;

  // Vider l'affichage de la liste des joueurs et retourner à l'écran de configuration
  renderPlayers();
  showScreen('setup');
}


// Lier les événements aux boutons de fin de partie
newGameBtn.addEventListener('click', startNewGame);
replayBtn.addEventListener('click', resetEverything);