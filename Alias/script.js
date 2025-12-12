/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

let gameWords = []; 
let gridData = [];
let gameState = {
    currentTeam: 'rouge',
    scores: { rouge: 9, bleu: 8 },
    gameOver: false,
    guessesAllowed: 0,
    canClick: false,
    seed: null
};

const TEAMS = { ROUGE: 'rouge', BLEU: 'bleu' };
const TYPES = { ROUGE: 'rouge', BLEU: 'bleu', NEUTRE: 'neutre', ASSASSIN: 'assassin' };

/* -------------------------------------------------------------------------- */
/*                         GÉNÉRATEUR ALÉATOIRE & MÉLANGE                     */
/* -------------------------------------------------------------------------- */

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}
let seededRandom;

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(seededRandom() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

/* -------------------------------------------------------------------------- */
/*                         GESTION DE LA MODALE CUSTOM                        */
/* -------------------------------------------------------------------------- */

function showCustomModal(title, message, type = 'info') {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const content = document.querySelector('.modal-content');

    // Mise à jour du contenu
    titleEl.innerText = title;
    msgEl.innerText = message;
    
    // Reset des classes de couleur
    content.className = 'modal-content'; 
    modal.className = `modal visible modal-type-${type}`;

    // Fermeture
    document.getElementById('modal-close-btn').onclick = () => {
        modal.classList.remove('visible');
    };
}

/* -------------------------------------------------------------------------- */
/*                                INITIALISATION                              */
/* -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let currentSeed = urlParams.get('game');
    const role = urlParams.get('role');

    if (!currentSeed) {
        currentSeed = Math.floor(Math.random() * 100000);
        const newUrl = window.location.pathname + '?game=' + currentSeed;
        window.history.replaceState(null, '', newUrl);
    }
    
    gameState.seed = parseInt(currentSeed);
    seededRandom = mulberry32(gameState.seed);

    if (typeof LISTE_MOTS !== 'undefined' && Array.isArray(LISTE_MOTS) && LISTE_MOTS.length >= 25) {
        gameWords = [...LISTE_MOTS];
    } else {
        gameWords = ["ERREUR", "CHARGEMENT", "MOTS", "...", "TEST"]; // Fallback court
    }

    if (role === 'master') {
        initMasterView();
    } else {
        initBoardView();
    }

    startGame(role === 'master');

    document.getElementById('new-game-btn').addEventListener('click', () => {
        window.location.href = window.location.pathname; 
    });
    document.getElementById('validate-clue-btn').addEventListener('click', submitClue);
    document.getElementById('pass-turn-btn').addEventListener('click', endTurn);
});

function initMasterView() {
    document.body.classList.add('spymaster-mode');
    document.getElementById('game-header').innerHTML = `<h2 style="color:white; text-align:center;">VUE MAÎTRE (#${gameState.seed})</h2>`;
    document.getElementById('spymaster-controls').style.display = 'none';
    document.getElementById('game-sidebar').style.display = 'none';
}

function initBoardView() {
    const fullUrl = window.location.href + (window.location.search ? '&' : '?') + "role=master";
    const qrDiv = document.getElementById("qrcode");
    if(qrDiv) {
        qrDiv.innerHTML = "";
        try { new QRCode(qrDiv, { text: fullUrl, width: 128, height: 128 }); } catch(e) {}
    }
    const inputLink = document.getElementById('share-link-input');
    if(inputLink) inputLink.value = fullUrl;
}

/* -------------------------------------------------------------------------- */
/*                       GÉNÉRATION DE LA GRILLE                              */
/* -------------------------------------------------------------------------- */

function startGame(isMaster) {
    gameState.currentTeam = TEAMS.ROUGE; 
    gameState.scores = { rouge: 9, bleu: 8 };
    gameState.gameOver = false;
    gameState.guessesAllowed = 0;
    gameState.canClick = false;

    updateUI();
    generateGrid(isMaster);
}

function generateGrid(isMaster) {
    const shuffledWords = shuffleArray([...gameWords]).slice(0, 25);
    
    let types = [TYPES.ASSASSIN];
    for (let i = 0; i < 9; i++) types.push(TEAMS.ROUGE);
    for (let i = 0; i < 8; i++) types.push(TEAMS.BLEU);
    for (let i = 0; i < 7; i++) types.push(TYPES.NEUTRE);
    const shuffledTypes = shuffleArray(types);

    gridData = shuffledWords.map((word, index) => ({
        id: index,
        word: word,
        type: shuffledTypes[index], 
        revealed: false
    }));

    renderGrid(isMaster);
}

function renderGrid(forceReveal) {
    const container = document.getElementById('board-container');
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(5, 1fr)';
    container.style.gap = '10px';

    gridData.forEach(card => {
        const btn = document.createElement('button');
        btn.innerText = card.word;
        btn.id = `card-${card.id}`;
        btn.style.padding = "10px";
        btn.style.minHeight = "60px";
        btn.style.fontWeight = "bold";
        btn.style.cursor = "pointer";
        btn.style.border = "2px solid #333";
        btn.style.borderRadius = "5px";

        if (forceReveal || card.revealed) {
            applyColor(btn, card.type);
            btn.disabled = true; 
            if (forceReveal && !card.revealed) {
                btn.style.opacity = "0.7"; 
                btn.style.border = "2px dashed white";
            }
        } else {
            btn.style.backgroundColor = '#bdc3c7'; 
            btn.style.color = '#000';
            btn.onclick = () => handleCardClick(card);
        }
        container.appendChild(btn);
    });
}

function applyColor(element, type) {
    if (type === TYPES.ROUGE) {
        element.style.backgroundColor = '#e74c3c'; 
        element.style.color = 'white';
        element.style.borderColor = '#c0392b';
    } else if (type === TYPES.BLEU) {
        element.style.backgroundColor = '#3498db'; 
        element.style.color = 'white';
        element.style.borderColor = '#2980b9';
    } else if (type === TYPES.ASSASSIN) {
        element.style.backgroundColor = '#2c3e50'; 
        element.style.color = 'white';
        element.style.borderColor = '#000';
        if(!element.innerText.includes('☠️')) element.innerText = "☠️ " + element.innerText;
    } else {
        element.style.backgroundColor = '#f1c40f'; // Neutre (Jaune/Beige)
        element.style.color = '#333';
        element.style.borderColor = '#f39c12';
    }
}

/* -------------------------------------------------------------------------- */
/*                            DÉROULEMENT DU JEU                              */
/* -------------------------------------------------------------------------- */

function submitClue() {
    const word = document.getElementById('clue-word').value.trim();
    const num = parseInt(document.getElementById('clue-number').value);
    if (!word) return showCustomModal("ERREUR", "Il faut entrer un mot indice !", "danger");

    gameState.canClick = true;
    gameState.guessesAllowed = num + 1;
    
    document.getElementById('validate-clue-btn').disabled = true;
    document.getElementById('pass-turn-btn').disabled = false;
    document.getElementById('game-status-message').innerText = `Trouvez ${num} mots !`;
    
    addToHistory(`Maitre ${gameState.currentTeam} : "${word}" (${num})`);
    updateUI();
}

function handleCardClick(card) {
    if (gameState.gameOver || !gameState.canClick || card.revealed) return;

    card.revealed = true;
    gameState.guessesAllowed--;
    renderGrid(false); 

    // 1. ASSASSIN (Carte Noire)
    if (card.type === TYPES.ASSASSIN) {
        addToHistory(`☠️ ASSASSIN (${card.word})`);
        endGame(false); 
        return;
    } 
    
    // 2. BONNE RÉPONSE (Carte de mon équipe)
    if (card.type === gameState.currentTeam) {
        gameState.scores[gameState.currentTeam]--; 
        addToHistory(`✅ ${card.word}`);
        checkVictory();

        if (!gameState.gameOver) {
            if (gameState.guessesAllowed === 0) {
                endTurn(); 
            } else {
                // Pas de modal ici pour ne pas couper le rythme, juste le score qui bouge
                document.getElementById('game-status-message').innerText = `Bien ! Encore ${gameState.guessesAllowed} essai(s).`;
            }
        }
    } 
    // 3. MAUVAISE RÉPONSE (Neutre ou Adversaire)
    else {
        if (card.type === TYPES.NEUTRE) {
            addToHistory(`😐 Neutre (${card.word}) -> Fin du tour`);
            showCustomModal("TÉMOIN NEUTRE", `Vous êtes tombé sur un passant innocent (${card.word}). Fin du tour !`, "neutral");
        } else {
            addToHistory(`❌ Aïe ! (${card.word}) -> Point pour l'adversaire`);
            gameState.scores[card.type]--; // Point donné à l'adversaire
            showCustomModal("OUPS !", `C'est un agent ennemi (${card.word}) ! Ils gagnent le point. Fin du tour.`, "danger");
            checkVictory();
        }
        endTurn();
    }
    updateUI();
}

function endTurn() {
    if (gameState.gameOver) return;
    gameState.canClick = false;
    gameState.currentTeam = (gameState.currentTeam === TEAMS.ROUGE) ? TEAMS.BLEU : TEAMS.ROUGE;
    
    document.getElementById('clue-word').value = '';
    document.getElementById('clue-number').value = '1';
    document.getElementById('validate-clue-btn').disabled = false;
    document.getElementById('pass-turn-btn').disabled = true;
    
    updateUI();
}

function checkVictory() {
    if (gameState.scores.rouge <= 0) endGame(true, TEAMS.ROUGE);
    else if (gameState.scores.bleu <= 0) endGame(true, TEAMS.BLEU);
}

function endGame(success, winner) {
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

function updateUI() {
    document.getElementById('score-rouge').innerText = `Rouge : ${Math.max(0, gameState.scores.rouge)} restants`;
    document.getElementById('score-bleu').innerText = `Bleu : ${Math.max(0, gameState.scores.bleu)} restants`;
    
    const teamDisplay = document.getElementById('current-team-name');
    teamDisplay.innerText = gameState.currentTeam.toUpperCase();
    teamDisplay.style.color = (gameState.currentTeam === 'rouge') ? '#e74c3c' : '#3498db';

    const statusMsg = document.getElementById('game-status-message');
    if(!gameState.gameOver && !gameState.canClick) statusMsg.innerText = `Au tour des ${gameState.currentTeam.toUpperCase()}`;
}

function addToHistory(msg) {
    const ul = document.getElementById('history-list');
    const li = document.createElement('li');
    li.innerText = msg;
    li.style.color = (gameState.currentTeam === 'rouge') ? 'darkred' : 'darkblue';
    ul.prepend(li);
}