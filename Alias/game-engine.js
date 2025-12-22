/* -------------------------------------------------------------------------- */
/*                                CONSTANTES & ÉTAT                           */
/* -------------------------------------------------------------------------- */

const TEAMS = { rose: 'rose', jaune: 'jaune' };
const TYPES = { rose: 'rose', jaune: 'jaune', NEUTRE: 'neutre', ASSASSIN: 'assassin' };

let gameWords = [];
let gridData = [];
let seededRandom;

let gameState = {
    currentTeam: TEAMS.rose,
    scores: { rose: 9, jaune: 8 },
    gameOver: false,
    guessesAllowed: 0,
    canClick: false,
    seed: null
};

/* -------------------------------------------------------------------------- */
/*                         GÉNÉRATEUR ALÉATOIRE (RNG)                         */
/* -------------------------------------------------------------------------- */

function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

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
/*                            LOGIQUE MÉTIER                                  */
/* -------------------------------------------------------------------------- */

function initEngine(seed, wordsList) {
    gameState.seed = parseInt(seed);
    seededRandom = mulberry32(gameState.seed);
    
    // Initialisation des mots
    if (Array.isArray(wordsList) && wordsList.length >= 25) {
        gameWords = [...wordsList];
    } else {
        gameWords = ["ERREUR", "CHARGEMENT", "MOTS", "...", "TEST"];
    }
    
    resetGameState();
}

function resetGameState() {
    gameState.currentTeam = TEAMS.rose;
    gameState.scores = { rose: 8, jaune: 7 };
    gameState.gameOver = false;
    gameState.guessesAllowed = 0;
    gameState.canClick = false;
}

function generateGridData() {
    const shuffledWords = shuffleArray([...gameWords]).slice(0, 25);

    let types = [TYPES.ASSASSIN];
    for (let i = 0; i < 8; i++) types.push(TEAMS.rose);
    for (let i = 0; i < 7; i++) types.push(TEAMS.jaune);
    for (let i = 0; i < 9; i++) types.push(TYPES.NEUTRE);
    
    const shuffledTypes = shuffleArray(types);

    gridData = shuffledWords.map((word, index) => ({
        id: index,
        word: word,
        type: shuffledTypes[index],
        revealed: false
    }));
    
    return gridData;
}

function processTurnSwitch() {
    gameState.canClick = false;
    gameState.currentTeam = (gameState.currentTeam === TEAMS.rose) ? TEAMS.jaune : TEAMS.rose;
    return gameState.currentTeam;
}

function checkVictoryCondition() {
    if (gameState.scores.rose <= 0) return { over: true, winner: TEAMS.rose };
    if (gameState.scores.jaune <= 0) return { over: true, winner: TEAMS.jaune };
    return { over: false, winner: null };
}