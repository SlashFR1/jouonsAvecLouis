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
function renderPlayers(){
  playersList.innerHTML = '';
  players.forEach((p,i)=>{
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${p}`;
    playersList.appendChild(li);
  });
  startGameBtn.disabled = players.length < 4 || players.length > 20;
}

addPlayerBtn.addEventListener('click', ()=>{
  const name = playerNameInput.value.trim();
  if(!name) return;
  if(players.length>=20) return alert('Limite 20 joueurs');
  players.push(name);
  playerNameInput.value = '';
  renderPlayers();
});
playerNameInput.addEventListener('keydown', e=>{ if(e.key==='Enter') addPlayerBtn.click(); });
clearPlayersBtn.addEventListener('click', ()=>{ players=[]; renderPlayers(); });

startGameBtn.addEventListener('click', ()=>{
  if(players.length < 4) return;
  startGame();
});

// ---------- Game flow ----------
function startGame(){
  totalRounds = players.length;
  currentRound = 1;
  turnIndex = 0;
  // initialize albums
  albums = players.map(p=>({proprietaire:p, etapes:[]}));
  // set UI
  showScreen('game');
  showTurn();
}

function showTurn(){
  // If we completed all rounds, go to reveal
  if(currentRound > totalRounds){
    startReveal();
    return;
  }

  const currentPlayer = players[turnIndex];
  turnInfo.textContent = `Tour ${currentRound}/${totalRounds}`;
  playerTurn.textContent = `C'est au tour de ${currentPlayer} !`;

  // Determine which album this player should act on
  // For round 1, each player acts on their own album
  let albumToAct;
  if(currentRound === 1){
    albumToAct = albums[turnIndex];
  } else {
    // shuffle albums at start of this round if at first player
    if(turnIndex===0){
      albums = shuffle(albums);
    }
    albumToAct = albums[turnIndex];
  }

  // Determine mode based on last step
  const last = albumToAct.etapes[albumToAct.etapes.length-1];
  if(!last || last.type === 'dessin'){
    // show phrase mode
    showPhraseMode(albumToAct);
  } else {
    // show drawing mode
    showDrawingMode(albumToAct);
  }
}

function nextTurn(saved){
  // saved is boolean to indicate user submitted
  // Advance turn index and maybe round
  turnIndex++;
  if(turnIndex >= players.length){
    turnIndex = 0;
    currentRound++;
  }
  // reset UI states
  phraseInput.value = '';
  clearCanvas();
  erasing = false; eraserBtn.classList.remove('active');
  showTurn();
}

function startReveal(){
  showScreen('reveal');
  // prepare reveal indices
  currentReveal = {albumIndex:0, stepIndex:0};
  showAlbumStep();
}

// ---------- Modes ----------
function showPhraseMode(album){
  instruction.textContent = "Écris une phrase amusante";
  phraseMode.classList.remove('hidden');
  drawingMode.classList.add('hidden');
  phraseInput.focus();

  readyBtn.onclick = ()=>{
    const text = phraseInput.value.trim();
    if(!text) return alert('Entrez une phrase.');
    album.etapes.push({type:'phrase', auteur: players[turnIndex], contenu:text});
    nextTurn(true);
  };
}

function showDrawingMode(album){
  instruction.textContent = "Dessine la phrase suivante :\n" + (album.etapes[album.etapes.length-1] ? album.etapes[album.etapes.length-1].contenu : '---');
  phraseMode.classList.add('hidden');
  drawingMode.classList.remove('hidden');

  readyBtn.onclick = ()=>{
    // save canvas image
    const data = canvas.toDataURL('image/png');
    album.etapes.push({type:'dessin', auteur: players[turnIndex], contenu:data});
    nextTurn(true);
  };
}

// ---------- Canvas code ----------
function resizeCanvasToDisplay(){
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.scale(scale, scale);
  // initial white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,rect.width,rect.height);
}

function clearCanvas(){
  ctx.setTransform(1,0,0,1,0,0);
  const w = canvas.width / (window.devicePixelRatio||1);
  const h = canvas.height / (window.devicePixelRatio||1);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,w,h);
}

function startDrawing(e){
  drawing = true;
  ctx.beginPath();
  const p = pointerPos(e);
  ctx.moveTo(p.x,p.y);
}
function draw(e){
  if(!drawing) return;
  const p = pointerPos(e);
  ctx.lineTo(p.x,p.y);
  ctx.stroke();
}
function stopDrawing(){ drawing = false; ctx.closePath(); }

function pointerPos(e){
  const rect = canvas.getBoundingClientRect();
  const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
  const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
  return { x: clientX - rect.left, y: clientY - rect.top };
}

// Canvas control handlers
colorInput.addEventListener('input', ()=>{
  ctx.strokeStyle = colorInput.value;
});
sizeInput.addEventListener('input', ()=>{ ctx.lineWidth = parseInt(sizeInput.value,10); });
eraserBtn.addEventListener('click', ()=>{
  erasing = !erasing; eraserBtn.classList.toggle('active');
  if(erasing){ ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 16; }
  else{ ctx.globalCompositeOperation = 'source-over'; ctx.lineWidth = parseInt(sizeInput.value,10); }
});
clearCanvasBtn.addEventListener('click', clearCanvas);

canvas.addEventListener('mousedown', (e)=>{ startDrawing(e); });
canvas.addEventListener('mousemove', (e)=>{ draw(e); });
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); startDrawing(e); });
canvas.addEventListener('touchmove', (e)=>{ e.preventDefault(); draw(e); });
canvas.addEventListener('touchend', (e)=>{ e.preventDefault(); stopDrawing(); });

// initial canvas settings
ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = colorInput.value; ctx.lineWidth = parseInt(sizeInput.value,10);
window.addEventListener('load', ()=>{
  // size canvas to element display size
  // set an initial CSS size
  const styleW = 800; const styleH = 500;
  canvas.style.width = '100%';
  canvas.style.height = styleH+'px';
  resizeCanvasToDisplay();
});
window.addEventListener('resize', ()=>{ /* optional: don't reflow to avoid losing drawing */ });

// ---------- Reveal UI ----------
let currentReveal = {albumIndex:0, stepIndex:0};
function showAlbumStep(){
  const album = albums[currentReveal.albumIndex];
  revealTitle.textContent = `L'album commencé par ${album.proprietaire}`;
  const step = album.etapes[currentReveal.stepIndex];
  if(!step) {
    stepDisplay.innerHTML = '<em>Pas d\'étape</em>';
    stepLegend.textContent = '';
    return;
  }
  if(step.type === 'phrase'){
    stepDisplay.innerHTML = `<div class="phrase">${escapeHtml(step.contenu)}</div>`;
  } else {
    stepDisplay.innerHTML = `<img src="${step.contenu}" alt="dessin" style="max-width:100%;height:auto;border-radius:6px;box-shadow:0 8px 18px rgba(0,0,0,0.6)">`;
  }
  stepLegend.textContent = `${step.auteur} — ${step.type === 'phrase' ? 'a écrit :' : 'a dessiné :'}`;
}

nextStepBtn.addEventListener('click', ()=>{
  const album = albums[currentReveal.albumIndex];
  if(currentReveal.stepIndex < album.etapes.length - 1){
    currentReveal.stepIndex++;
    showAlbumStep();
  }
});
prevStepBtn.addEventListener('click', ()=>{
  if(currentReveal.stepIndex > 0){ currentReveal.stepIndex--; showAlbumStep(); }
});
nextAlbumBtn.addEventListener('click', ()=>{
  if(currentReveal.albumIndex < albums.length - 1){
    currentReveal.albumIndex++; currentReveal.stepIndex = 0; showAlbumStep();
  }
});
replayBtn.addEventListener('click', ()=>{
  // reset everything
  players = []; albums = []; totalRounds = 0; currentRound = 0; turnIndex = 0;
  renderPlayers();
  showScreen('setup');
});

// ---------- Utilities ----------
function showScreen(name){
  setupScreen.classList.toggle('active', name==='setup');
  gameScreen.classList.toggle('active', name==='game');
  revealScreen.classList.toggle('active', name==='reveal');
}

function shuffle(arr){
  // Fisher-Yates but return new array
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// initial render
renderPlayers();
