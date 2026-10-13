// État de l'application
let currentIndex = 0;
let isHotMode = false;

// On initialise avec un tableau vide, il sera rempli au chargement
let propositions = [];

// Fonction pour mélanger un tableau (Algorithme de Fisher-Yates)
// Cela permet d'avoir un ordre aléatoire à chaque partie
function shuffleArray(array) {
    let shuffled = [...array]; // On crée une copie pour ne pas modifier l'original dans data.js
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialiser l'app au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // On charge et on mélange les propositions normales par défaut
    propositions = shuffleArray(propositionsNormal);
    displayProposition();
    setupEventListeners();
});

// Afficher la proposition à l'écran
function displayProposition() {
    const cardContent = document.querySelector('.card-content');
    
    // Sécurité si le tableau est vide
    if (propositions.length === 0) return;

    const proposition = propositions[currentIndex];
    
    cardContent.textContent = proposition;
    
    // Relancer l'animation CSS à chaque changement
    cardContent.style.animation = 'none';
    cardContent.offsetHeight; // "Trick" pour forcer le navigateur à reset l'animation
    cardContent.style.animation = 'fadeIn 0.5s ease-in';
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const nextBtn = document.getElementById('nextBtn');
    const hotToggle = document.getElementById('hotToggle');
    const body = document.body;
    
    // Bouton suivant
    nextBtn.addEventListener('click', () => {
        currentIndex++;
        
        // Si on arrive au bout des 500 questions, on remélange et on repart à zéro
        if (currentIndex >= propositions.length) {
            propositions = shuffleArray(isHotMode ? propositionsHot : propositionsNormal);
            currentIndex = 0;
        }
        
        displayProposition();
    });
    
    // Toggle mode hot (🔥 / ❄️)
    hotToggle.addEventListener('click', () => {
        isHotMode = !isHotMode;
        
        // On change la source de données ET on mélange la nouvelle liste
        const sourceOriginale = isHotMode ? propositionsHot : propositionsNormal;
        propositions = shuffleArray(sourceOriginale);
        
        // On remet l'index à zéro pour la nouvelle liste mélangée
        currentIndex = 0;
        
        // Mise à jour visuelle de l'interface
        body.classList.toggle('extreme-mode');
        hotToggle.classList.toggle('active');
        hotToggle.textContent = isHotMode ? '🔥 Mode Extrême' : '❄️ Mode Normal';
        
        displayProposition();
    });
    
    // Navigation au clavier (Flèche droite ou Barre Espace)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault(); // Empêche le scroll avec la barre espace
            nextBtn.click();
        }
    });
}