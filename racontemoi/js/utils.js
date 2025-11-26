// Sélecteur rapide (comme jQuery)
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Gestion de l'affichage des écrans
const showScreen = (screenId) => {
    // Masquer tous les écrans
    $$('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    // Afficher l'écran demandé
    const target = $(`#${screenId}`);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
};

// Formattage du temps (secondes -> MM:SS)
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Créateur d'élément simple
const createBtn = (text, onClick, cssClass = 'btn-primary') => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = `btn ${cssClass}`;
    btn.onclick = onClick;
    return btn;
};