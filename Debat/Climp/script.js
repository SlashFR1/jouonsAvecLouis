// État de l'application
let currentIndex = 0;
let isHotMode = false;

// Récupérer les propositions depuis data.js
let propositions = propositionsNormal;

// Initialiser l'app
document.addEventListener('DOMContentLoaded', function() {
    displayProposition();
    setupEventListeners();
});

// Afficher la proposition
function displayProposition() {
    const cardContent = document.querySelector('.card-content');
    const proposition = propositions[currentIndex];
    
    cardContent.textContent = proposition;
    cardContent.style.animation = 'fadeIn 0.5s ease-in';
}

// Événements
function setupEventListeners() {
    const nextBtn = document.getElementById('nextBtn');
    const hotToggle = document.getElementById('hotToggle');
    const body = document.body;
    
    // Bouton suivant
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % propositions.length;
        displayProposition();
    });
    
    // Toggle mode hot
    hotToggle.addEventListener('click', () => {
        isHotMode = !isHotMode;
        propositions = isHotMode ? propositionsHot : propositionsNormal;
        currentIndex = 0;
        
        // Changer l'UI en fonction du mode
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
