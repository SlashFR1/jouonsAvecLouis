// --- DONNÉES : Liste des icônes Concept ---
const concepts = [
    { icon: "👨", label: "Homme" }, { icon: "👩", label: "Femme" },
    { icon: "👶", label: "Enfant" }, { icon: "👴", label: "Vieux" },
    { icon: "🌍", label: "Monde / Terre" }, { icon: "🏠", label: "Bâtiment" },
    { icon: "💀", label: "Mort / Danger" }, { icon: "❤️", label: "Amour / Bien" },
    { icon: "🔥", label: "Feu / Chaud" }, { icon: "❄️", label: "Froid / Glace" },
    { icon: "💧", label: "Eau / Liquide" }, { icon: "💨", label: "Air / Vent" },
    { icon: "🍔", label: "Nourriture" }, { icon: "🔨", label: "Outil / Travail" },
    { icon: "🚗", label: "Transport" }, { icon: "✈️", label: "Voler" },
    { icon: "🎨", label: "Art / Création" }, { icon: "📚", label: "Savoir / Livre" },
    { icon: "⚽", label: "Sport / Jeu" }, { icon: "🎵", label: "Musique / Son" },
    { icon: "😂", label: "Joyeux" }, { icon: "😭", label: "Triste" },
    { icon: "😠", label: "Colère" }, { icon: "😱", label: "Peur" },
    { icon: "🔴", label: "Rouge" }, { icon: "🔵", label: "Bleu" },
    { icon: "🟢", label: "Vert" }, { icon: "🟡", label: "Jaune" },
    { icon: "⚪", label: "Blanc" }, { icon: "⚫", label: "Noir" },
    { icon: "🐰", label: "Animal" }, { icon: "🌿", label: "Plante / Nature" },
    { icon: "👕", label: "Vêtement" }, { icon: "⚙️", label: "Mécanique" },
    { icon: "⚕️", label: "Santé" }, { icon: "⚔️", label: "Guerre" },
    { icon: "🛑", label: "Stop / Interdit" }, { icon: "⛪", label: "Religion / Croyance" },
    { icon: "👑", label: "Pouvoir / Chef" }, { icon: "💰", label: "Argent" },
    { icon: "🕐", label: "Temps" }, { icon: "📅", label: "Histoire" },
    { icon: "⬆️", label: "Haut / Grand" }, { icon: "⬇️", label: "Bas / Petit" },
    { icon: "🔩", label: "Matière / Dur" }, { icon: "🪶", label: "Léger / Mou" },
    { icon: "📦", label: "Objet / Boîte" }, { icon: "👽", label: "Fiction" },
    { icon: "👁️", label: "Voir / Œil" }, { icon: "👂", label: "Entendre / Oreille" },
    { icon: "👃", label: "Sentir / Odeur" }, { icon: "👄", label: "Goût / Bouche" },
    { icon: "✋", label: "Toucher / Main" }, { icon: "🧠", label: "Pensée / Cerveau" },
    { icon: "🏔️", label: "Montagne / Roche" }, { icon: "🌊", label: "Mer / Océan" },
    { icon: "🏜️", label: "Désert / Sec" }, { icon: "🏝️", label: "Île / Isolé" },
    { icon: "☁️", label: "Nuage / Ciel" }, { icon: "⛈️", label: "Orage / Tempête" },
    { icon: "🌌", label: "Espace / Étoile" }, { icon: "🐦", label: "Oiseau / Volant" },
    { icon: "🐟", label: "Poisson / Marin" }, { icon: "🐛", label: "Insecte / Petit" },
    { icon: "🦖", label: "Dinosaure / Ancien" }, { icon: "🟠", label: "Orange" },
    { icon: "🟣", label: "Violet" }, { icon: "🟤", label: "Marron" },
    { icon: "🌫️", label: "Gris / Invisible" }, { icon: "🔺", label: "Triangle / Pointu" },
    { icon: "⭕", label: "Rond / Cercle" }, { icon: "⬛", label: "Carré / Bloc" },
    { icon: "📏", label: "Ligne / Long" }, { icon: "💻", label: "Ordi / Virtuel" },
    { icon: "📱", label: "Téléphone / Com." }, { icon: "📷", label: "Photo / Image" },
    { icon: "📺", label: "Télé / Écran" }, { icon: "🔌", label: "Énergie / Prise" },
    { icon: "🔫", label: "Arme / Tirer" }, { icon: "💎", label: "Bijou / Précieux" },
    { icon: "📄", label: "Papier / Écrit" }, { icon: "🎁", label: "Cadeau / Surprise" },
    { icon: "💤", label: "Dormir / Rêve" }, { icon: "🍴", label: "Manger / Cuisine" },
    { icon: "🏃", label: "Courir / Vite" }, { icon: "🐢", label: "Lent / Attendre" },
    { icon: "🔁", label: "Répéter / Cycle" }, { icon: "👣", label: "Marcher / Trace" },
    { icon: "🛀", label: "Laver / Propre" }, { icon: "🚮", label: "Jeter / Sale" },
    { icon: "👮", label: "Police / Loi" }, { icon: "🎓", label: "École / Apprendre" },
    { icon: "🧪", label: "Science / Chimie" }, { icon: "🎭", label: "Théâtre / Comédie" },
    { icon: "💍", label: "Mariage / Couple" }, { icon: "👻", label: "Esprit / Âme" },
    { icon: "🎲", label: "Hasard / Chance" }, { icon: "🏆", label: "Victoire / Sport" },
    { icon: "♾️", label: "Infini / Toujours" }
];

// --- ÉTAT DU JEU ---
let currentState = {
    selectedColor: 'green',
    selectedType: 'symbol',
    tokenLocations: {
        'green': null, 'blue': null, 'red': null, 'yellow': null
    }
};

// --- VARIABLES TIMER ---
let timerInterval = null;
let timeRemaining = 300; // 5 minutes en secondes
let isTimerRunning = false;

// --- INITIALISATION ---
window.onload = function () {
    renderBoard();
    updateToolUI();
};

// Générer la grille HTML
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    concepts.forEach((c, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${index}`;
        card.innerHTML = `
            <div class="card-icon">${c.icon}</div>
            <div class="card-label">${c.label}</div>
            <div class="markers-area" id="markers-${index}"></div>
        `;

        card.addEventListener('click', () => handleCardClick(index));
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            clearCard(index);
        });

        board.appendChild(card);
    });
}

// --- LOGIQUE DE JEU ---

function selectTool(color, type) {
    currentState.selectedColor = color;
    currentState.selectedType = type;
    updateToolUI();
}

function updateToolUI() {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const btnId = `btn-${currentState.selectedColor}-${currentState.selectedType}`;
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
}

// Clic sur une carte
function handleCardClick(index) {
    const area = document.getElementById(`markers-${index}`);
    const color = currentState.selectedColor;
    const type = currentState.selectedType;

    // --- CORRECTION : DÉMARRER LE TIMER ICI ---
    // Si on pose le Symbole '?' Vert, le timer démarre
    if (type === 'symbol' && color === 'green') {
        startTimer();
    }
    // -----------------------------------------

    // 1. LOGIQUE DU PION UNIQUE (Symbole ? ou !)
    if (type === 'symbol') {
        const oldLocation = currentState.tokenLocations[color];

        if (oldLocation !== null) {
            removeSpecificSymbol(oldLocation, color);
        }

        currentState.tokenLocations[color] = index;

        const marker = document.createElement('div');
        marker.className = `marker marker-symbol bg-${color} symbol-${color}`;
        marker.innerText = (color === 'green') ? '?' : '!';
        area.prepend(marker);
    }
    // 2. LOGIQUE DES CUBES (Illimités)
    else {
        const cube = document.createElement('div');
        cube.className = `marker marker-cube bg-${color}`;
        area.appendChild(cube);
    }
}

function removeSpecificSymbol(cardIndex, color) {
    const area = document.getElementById(`markers-${cardIndex}`);
    if (!area) return;
    const symbolToRemove = area.querySelector(`.symbol-${color}`);
    if (symbolToRemove) symbolToRemove.remove();
}

function clearCard(index) {
    const area = document.getElementById(`markers-${index}`);
    ['green', 'blue', 'red', 'yellow'].forEach(c => {
        if (currentState.tokenLocations[c] === index) {
            currentState.tokenLocations[c] = null;
        }
    });
    area.innerHTML = '';
}

// Tout effacer
function resetBoard() {
    if (confirm("Effacer tout le plateau et réinitialiser le chrono ?")) {
        document.querySelectorAll('.markers-area').forEach(el => el.innerHTML = '');
        currentState.tokenLocations = { green: null, blue: null, red: null, yellow: null };

        // --- CORRECTION : RESET DU TIMER ICI ---
        stopAndResetTimer();
    }
}

// --- LOGIQUE DU CHRONOMÈTRE ---
function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    const display = document.getElementById('timerDisplay');

    if (!display) {
        console.error("Erreur : timerDisplay introuvable dans le HTML");
        return;
    }

    display.classList.add('running');

    timerInterval = setInterval(() => {
        timeRemaining--;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        display.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            display.innerText = "00:00";
            display.classList.remove('running');
            display.classList.add('finished');
            alert("⏰ TEMPS ÉCOULÉ !");
        }
    }, 1000);
}

function stopAndResetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeRemaining = 300; // Reset à 5 min

    const display = document.getElementById('timerDisplay');
    if (display) {
        display.innerText = "05:00";
        display.classList.remove('running', 'finished');
    }
}

// --- UI DIVERS ---
function toggleWord() {
    const input = document.getElementById('secretWord');
    input.type = (input.type === 'password') ? 'text' : 'password';
}

function toggleRules() {
    const modal = document.getElementById('rulesModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('rulesModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}