// Téléphone Arabe Dessiné - script.js

// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

// ---------- State ----------
let players = [];
let albums = [];
let totalRounds = 0; // equals number of players
let currentRound = 0;
let turnIndex = 0; // index within players for current round
// Mode déterminé par l'album reçu (pas de mode globale)

// UI elements
const setupScreen = $('#setup-screen');
const gameScreen = $('#game-screen');
const revealScreen = $('#reveal-screen');

const playerNameInput = $('#player-name');
const addPlayerBtn = $('#add-player-btn');
const playersList = $('#players-list');
const startGameBtn = $('#start-game-btn');
const clearPlayersBtn = $('#clear-players-btn');

const turnInfo = $('#turn-info');
const playerTurn = $('#player-turn');
const instruction = $('#instruction');

const phraseMode = $('#phrase-mode');
const drawingMode = $('#drawing-mode');
const phraseInput = $('#phrase-input');
const readyBtn = $('#ready-btn');

// Canvas controls
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
const replayBtn = $('#replay-btn');

// Canvas state
const ctx = canvas.getContext('2d');
let drawing = false;
let erasing = false;

// ---------- UI actions ----------
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
  if (!name) return;
  if (players.length >= 20) return alert('Limite 20 joueurs');
  players.push(name);
  playerNameInput.value = '';
  renderPlayers();
});
playerNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayerBtn.click(); });
clearPlayersBtn.addEventListener('click', () => { players = []; renderPlayers(); });

startGameBtn.addEventListener('click', () => {
  if (players.length < 4) return;
  startGame();
});

// ---------- Game flow ----------
function startGame() {
  totalRounds = players.length;
  currentRound = 1;
  turnIndex = 0;
  // initialize albums
  albums = players.map(p => ({ proprietaire: p, etapes: [] }));
  // set UI
  showScreen('game');
  showTurn();
}

function showTurn() {
  // Si toutes les manches sont finies
  if (currentRound > totalRounds) {
    startReveal();
    return;
  }

  const currentPlayer = players[turnIndex];
  turnInfo.textContent = `Tour ${currentRound}/${totalRounds}`;
  playerTurn.textContent = `C'est au tour de ${currentPlayer} !`;

  // Redistribuer les albums seulement au début de chaque round
  if (turnIndex === 0 && currentRound > 1) {
    albums = shuffleAvoidSelf(albums, players);
  }

  const albumToAct = albums[turnIndex];
  // Déterminer le mode en fonction de la dernière étape de l'album reçu
  const last = albumToAct.etapes[albumToAct.etapes.length - 1];
  if (!last || last.type === 'dessin') {
    // si pas d'étape ou dernière étape est un dessin => écrire une phrase
    showPhraseMode(albumToAct);
  } else {
    // si dernière étape est une phrase => dessiner
    showDrawingMode(albumToAct);
  }
}



function nextTurn(saved) {
  turnIndex++;

  if (turnIndex >= players.length) {
    // Fin d’un tour complet
    turnIndex = 0;
    currentRound++;
  }

  // Réinitialiser les entrées UI
  phraseInput.value = '';
  clearCanvas();
  erasing = false;
  eraserBtn.classList.remove('active');

  showTurn();
}


// ---------- Modes ----------
function showPhraseMode(album) {
  // cacher le mode dessin
  drawingMode.classList.add('hidden');
  // afficher le mode phrase
  phraseMode.classList.remove('hidden');

  phraseInput.value = '';
  readyBtn.onclick = () => {
    // stocker dans `etapes` avec les clés attendues par le reste du code
    album.etapes.push({
      type: 'phrase',
      contenu: phraseInput.value.trim() || '(phrase vide)',
      auteur: players[turnIndex]
    });
    nextTurn();
  };
}


function showDrawingMode(album) {
  // cacher le mode phrase
  phraseMode.classList.add('hidden');
  // afficher le mode dessin
  drawingMode.classList.remove('hidden');

  clearCanvas();
  readyBtn.onclick = () => {
    album.etapes.push({
      type: 'dessin',
      contenu: canvas.toDataURL(),
      auteur: players[turnIndex]
    });
    nextTurn();
  };
}


// ---------- Canvas code ----------
// ---------- Canvas code (CORRIGÉ) ----------

// Fonction simplifiée pour redimensionner le canvas
function resizeCanvasToDisplay() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    // On ne touche PAS au ctx.scale() ici !
    
    // On réapplique les styles car le redimensionnement les réinitialise
    ctx.strokeStyle = colorInput.value;
    ctx.lineWidth = parseInt(sizeInput.value, 10);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Fond blanc initial
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    drawing = true;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
}

function draw(e) {
    if (!drawing) return;
    const p = pointerPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
    ctx.closePath();
}

// Fonction CORRIGÉE pour obtenir la position, en tenant compte de l'échelle
function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    
    // On convertit les coordonnées de la souris (CSS pixels) en coordonnées du canvas (Bitmap pixels)
    return {
        x: (clientX - rect.left) * scale,
        y: (clientY - rect.top) * scale
    };
}
// Canvas control handlers
colorInput.addEventListener('input', () => {
  ctx.strokeStyle = colorInput.value;
});
sizeInput.addEventListener('input', () => { ctx.lineWidth = parseInt(sizeInput.value, 10); });
eraserBtn.addEventListener('click', () => {
  erasing = !erasing; eraserBtn.classList.toggle('active');
  if (erasing) { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 16; }
  else { ctx.globalCompositeOperation = 'source-over'; ctx.lineWidth = parseInt(sizeInput.value, 10); }
});
clearCanvasBtn.addEventListener('click', clearCanvas);

canvas.addEventListener('mousedown', (e) => { startDrawing(e); });
canvas.addEventListener('mousemove', (e) => { draw(e); });
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); stopDrawing(); });

// initial canvas settings
ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = colorInput.value; ctx.lineWidth = parseInt(sizeInput.value, 10);
window.addEventListener('load', () => {
  // size canvas to element display size
  // set an initial CSS size
  const styleW = 800; const styleH = 500;
  canvas.style.width = '100%';
  canvas.style.height = styleH + 'px';
  resizeCanvasToDisplay();
});
window.addEventListener('resize', () => { /* optional: don't reflow to avoid losing drawing */ });

// ---------- Reveal UI ----------
let currentReveal = { albumIndex: 0, stepIndex: 0 };
function showAlbumStep() {
  const album = albums[currentReveal.albumIndex];
  revealTitle.textContent = `L'album commencé par ${album.proprietaire}`;
  const step = album.etapes[currentReveal.stepIndex];
  if (!step) {
    stepDisplay.innerHTML = '<em>Pas d\'étape</em>';
    stepLegend.textContent = '';
    return;
  }
  if (step.type === 'phrase') {
    stepDisplay.innerHTML = `<div class="phrase">${escapeHtml(step.contenu)}</div>`;
  } else {
    stepDisplay.innerHTML = `<img src="${step.contenu}" alt="dessin" style="max-width:100%;height:auto;border-radius:6px;box-shadow:0 8px 18px rgba(0,0,0,0.6)">`;
  }
  stepLegend.textContent = `${step.auteur} — ${step.type === 'phrase' ? 'a écrit :' : 'a dessiné :'}`;
}

nextStepBtn.addEventListener('click', () => {
  const album = albums[currentReveal.albumIndex];
  if (currentReveal.stepIndex < album.etapes.length - 1) {
    currentReveal.stepIndex++;
    showAlbumStep();
  }
});
prevStepBtn.addEventListener('click', () => {
  if (currentReveal.stepIndex > 0) { currentReveal.stepIndex--; showAlbumStep(); }
});
nextAlbumBtn.addEventListener('click', () => {
  if (currentReveal.albumIndex < albums.length - 1) {
    currentReveal.albumIndex++; currentReveal.stepIndex = 0; showAlbumStep();
  }
});
replayBtn.addEventListener('click', () => {
  // reset everything
  players = []; albums = []; totalRounds = 0; currentRound = 0; turnIndex = 0;
  renderPlayers();
  showScreen('setup');
});

// ---------- Utilities ----------
function showScreen(name) {
  setupScreen.classList.toggle('active', name === 'setup');
  gameScreen.classList.toggle('active', name === 'game');
  revealScreen.classList.toggle('active', name === 'reveal');
}

function shuffle(arr) {
  // Fisher-Yates but return new array
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle albums trying to avoid giving a player their own album.
 * If a derangement cannot be found within attempts, falls back to plain shuffle.
 */
function shuffleAvoidSelf(albumsArr, playersArr) {
  if (albumsArr.length !== playersArr.length) return shuffle(albumsArr);
  const maxAttempts = 200;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = shuffle(albumsArr);
    let ok = true;
    for (let i = 0; i < candidate.length; i++) {
      if (candidate[i].proprietaire === playersArr[i]) { ok = false; break; }
    }
    if (ok) return candidate;
  }
  // fallback
  return shuffle(albumsArr);
}

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// initial render
renderPlayers();
