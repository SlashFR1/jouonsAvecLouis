// ==========================================
// FICHIER 1 : CONFIGURATION & ÉTAT (DATA)
// ==========================================

// --- CONFIGURATION GLOBALE ---
const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || ["Joueur1", "Joueur2", "Joueur3", "Joueur4"];
const nbJoueurs = listJoueurs.length;
const totalManches = 3;

// Mapping des thèmes
const themesConfig = {
    art: { folder: 'images/art', ext: 'png' },
    histoire: { folder: 'images/histoire', ext: 'png' },
    memes: { folder: 'images/memes', ext: 'png' },
    nature: { folder: 'images/nature', ext: 'png' },
    cosmos: { folder: 'images/cosmos', ext: 'png' }
};

// --- ÉTAT DU JEU (STATE) ---
const GameState = {
    scores: {},
    mancheActuelle: 1,
    cartesDeck: [],
    mains: {},          // { joueur: [src1, src2...] }
    selections: {},     // { joueur: { carte, isMaster, phrase } }
    votes: {},          // { votant: ownerName }
    revealList: [],     // Liste mélangée pour l'affichage final
    masterIndex: Math.floor(Math.random() * nbJoueurs),
    phase: "init",      // master_pick, players_pick, voting, results
    activePlayer: null,
    pickOrder: [],      // Ordre de sélection des joueurs (hors maître)
    currentPickerIdx: 0,
    votingOrder: [],
    currentVoterIdx: 0,

    // Accesseurs rapides
    getMaster: () => listJoueurs[GameState.masterIndex],
    initScores: () => listJoueurs.forEach(j => GameState.scores[j] = 0)
};

GameState.initScores();

// --- GESTION DU DECK ---

// Utilitaire de préchargement
function testImageExists(url, timeout = 3000) {
    return new Promise(resolve => {
        const img = new Image();
        let done = false;
        const t = setTimeout(() => { if (!done) { done = true; resolve(false); } }, timeout);
        img.onload = () => { if (!done) { done = true; clearTimeout(t); resolve(true); } };
        img.onerror = () => { if (!done) { done = true; clearTimeout(t); resolve(false); } };
        img.src = url;
    });
}

// Construction du deck (Cherche img1, img2... jusqu'à X échecs)
async function buildDeckForTheme(themeKey) {
    const cfg = themesConfig[themeKey] || themesConfig['memes'];
    const result = [];
    let consecutiveMiss = 0;
    const stopAfterMisses = 12; // Arrête après 12 images manquantes d'affilée

    for (let i = 1; i <= 300; i++) {
        const url = `${cfg.folder}/img${i}.${cfg.ext || 'png'}`;
        const ok = await testImageExists(url, 1000);
        if (ok) {
            result.push(url);
            consecutiveMiss = 0;
        } else {
            consecutiveMiss++;
        }
        if (consecutiveMiss >= stopAfterMisses && result.length > 0) break;
    }
    return result;
}

// Distribution des cartes
function distribuerCartes() {
    // Mélange d'une copie du deck
    const paquet = [...GameState.cartesDeck];
    for (let i = paquet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paquet[i], paquet[j]] = [paquet[j], paquet[i]];
    }
    
    GameState.mains = {};
    let ptr = 0;
    listJoueurs.forEach(j => {
        GameState.mains[j] = [];
        // On donne jusqu'à 6 cartes (standard Dixit) ou 4 selon ton code original
        for (let k = 0; k < 4; k++) {
            if (ptr < paquet.length) GameState.mains[j].push(paquet[ptr++]);
        }
    });
}