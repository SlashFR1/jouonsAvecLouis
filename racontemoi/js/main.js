const state = {
    currentPlayerIndex: 1,
    currentCard: null,
    filteredCards: [], // Cartes du thème choisi
    currentCardIndex: 0, // Index pour parcourir filteredCards
    customClues: ["", "", ""],
    timer: 6 * 60, // 6 minutes en secondes
    timerInterval: null
};

// --- INITIALISATION ---
function initGame() {
    renderThemes();
    updatePlayerBadge();
    showScreen('screen-theme');
}

function updatePlayerBadge() {
    $('#current-player-name').textContent = `Joueur ${state.currentPlayerIndex}`;
}

// --- LOGIQUE THEME ---
function renderThemes() {
    const container = $('#theme-container');
    container.innerHTML = '';
    THEMES.forEach(theme => {
        const btn = createBtn(theme, () => selectTheme(theme));
        container.appendChild(btn);
    });
}

function selectTheme(theme) {
    // Filtrer et mélanger les cartes
    state.filteredCards = GAME_DATA.filter(c => c.theme === theme).sort(() => Math.random() - 0.5);
    state.currentCardIndex = 0;
    
    if(state.filteredCards.length > 0) {
        showCardPreview();
        showScreen('screen-select');
    } else {
        alert("Pas de cartes pour ce thème !");
    }
}

// --- LOGIQUE SÉLECTION CARTE ---
function showCardPreview() {
    const card = state.filteredCards[state.currentCardIndex];
    $('#preview-title').textContent = card.title;
    $('#preview-theme').textContent = card.theme;
}

$('#btn-pass').addEventListener('click', () => {
    // Carte suivante (boucle)
    state.currentCardIndex = (state.currentCardIndex + 1) % state.filteredCards.length;
    showCardPreview();
});

$('#btn-select').addEventListener('click', () => {
    state.currentCard = state.filteredCards[state.currentCardIndex];
    setupPrepScreen();
    showScreen('screen-prep');
});

// --- LOGIQUE PRÉPARATION ---
function setupPrepScreen() {
    $('#full-story-text').textContent = state.currentCard.story;
    // Reset inputs
    $('#input-clue-1').value = "";
    $('#input-clue-2').value = "";
    $('#input-clue-3').value = "";
}

$('#btn-start-game').addEventListener('click', () => {
    // Sauvegarde des indices
    state.customClues = [
        $('#input-clue-1').value || "Indice vide...",
        $('#input-clue-2').value || "Indice vide...",
        $('#input-clue-3').value || "Indice vide..."
    ];
    
    setupGameScreen();
    showScreen('screen-game');
    startTimer();
});

// --- LOGIQUE DE JEU (TIMER & INDICES) ---
function setupGameScreen() {
    $('#game-key-phrase').textContent = `"${state.currentCard.keyPhrase}"`;
    $('#timer-display').textContent = "06:00";
    
    // Reset indices visuels
    for(let i=1; i<=3; i++) {
        const box = $(`#clue-box-${i}`);
        box.className = 'clue-box locked';
        box.textContent = `🔒 Indice ${i} (dans ${(i*1.5)} min)`;
    }
}

function startTimer() {
    state.timer = 6 * 60; // 360 secondes
    const totalTime = 360;

    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.timer--;
        $('#timer-display').textContent = formatTime(state.timer);

        const elapsed = totalTime - state.timer; // Temps écoulé en secondes

        // Check indices (90s = 1m30, 180s = 3m00, 270s = 4m30)
        if(elapsed === 90) revealClue(1);
        if(elapsed === 180) revealClue(2);
        if(elapsed === 270) revealClue(3);

        if(state.timer <= 0) {
            endGame(false);
        }
    }, 1000);
}

function revealClue(index) {
    const box = $(`#clue-box-${index}`);
    box.className = 'clue-box unlocked';
    box.textContent = `💡 ${state.customClues[index-1]}`;
}

// --- FIN DE PARTIE ---
$('#btn-found').addEventListener('click', () => endGame(true));
$('#btn-giveup').addEventListener('click', () => endGame(false));

function endGame(success) {
    clearInterval(state.timerInterval);
    
    $('#end-title').textContent = success ? "🎉 VICTOIRE !" : "⏰ TEMPS ÉCOULÉ...";
    $('#end-title').style.color = success ? "var(--green)" : "var(--accent)";
    
    $('#reveal-title').textContent = state.currentCard.title;
    $('#reveal-text').textContent = state.currentCard.story;

    showScreen('screen-end');
}
function resetGameState() {
    state.currentCard = null;
    state.filteredCards = [];
    state.currentCardIndex = 0;
    state.customClues = ["", "", ""];
    clearInterval(state.timerInterval);
    state.timer = 6 * 60;
}
$('#btn-next-round').addEventListener('click', () => {
    resetGameState();
    state.currentPlayerIndex++;
    initGame();
});

// Lancer le jeu au chargement
initGame();