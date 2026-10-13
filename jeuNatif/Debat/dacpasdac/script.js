// État de l'application
let currentIndex = 0;
let isHotMode = false;

// On crée une copie de travail pour ne pas modifier l'original dans data.js
let propositions = [];

// Fonction pour mélanger un tableau (Algorithme de Fisher-Yates)
function shuffleArray(array) {
    let shuffled = [...array]; // On crée une copie pour ne pas toucher au tableau source
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialiser l'app
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation avec mélange
    propositions = shuffleArray(propositionsNormal);
    displayProposition();
    setupEventListeners();
});

// Afficher la proposition
function displayProposition() {
    const cardContent = document.querySelector('.card-content');
    const proposition = propositions[currentIndex];
    
    cardContent.textContent = proposition;
    
    // Animation de réinitialisation (on enlève et remet la classe pour relancer l'anim)
    cardContent.style.animation = 'none';
    cardContent.offsetHeight; // Force le reflow
    cardContent.style.animation = 'fadeIn 0.5s ease-in';
}

// Événements
function setupEventListeners() {
    const nextBtn = document.getElementById('nextBtn');
    const hotToggle = document.getElementById('hotToggle');
    const body = document.body;
    
    // Bouton suivant
    nextBtn.addEventListener('click', () => {
        currentIndex++;
        
        // Si on arrive à la fin du tableau, on remélange tout pour ne pas avoir le même ordre
        if (currentIndex >= propositions.length) {
            propositions = shuffleArray(isHotMode ? propositionsHot : propositionsNormal);
            currentIndex = 0;
        }
        
        displayProposition();
    });
    
    // Toggle mode hot
    hotToggle.addEventListener('click', () => {
        isHotMode = !isHotMode;
        
        // On change de source ET on mélange
        const source = isHotMode ? propositionsHot : propositionsNormal;
        propositions = shuffleArray(source);
        currentIndex = 0;
        
        // Changer l'UI
        body.classList.toggle('hot-mode');
        hotToggle.classList.toggle('active');
        hotToggle.textContent = isHotMode ? '🔥 Mode HOT' : '❄️ Mode Normal';
        
        displayProposition();
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextBtn.click();
        }
    });
}