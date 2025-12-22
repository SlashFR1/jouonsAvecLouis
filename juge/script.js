// script.js

// Sélection des éléments HTML
const phraseBox = document.getElementById('phrase-box');
const nextButton = document.getElementById('next-btn');
const modeSwitch = document.getElementById('mode-switch'); // L'interrupteur
const body = document.body;

function generatePhrase() {
    // 1. Vérifier si on est en mode HOT ou NORMAL
    const isHot = modeSwitch.checked;
    
    // 2. Sélectionner la bonne liste dans la base de données (db)
    // On utilise la structure db.hot ou db.normal définie dans data.js
    const listToUse = isHot ? db.hot : db.normal;

    // 3. Piocher une phrase au hasard
    const randomIndex = Math.floor(Math.random() * listToUse.length);
    const selectedPhrase = listToUse[randomIndex];

    // 4. Animation "Pop"
    phraseBox.classList.remove('pop-anim'); 
    void phraseBox.offsetWidth; // Astuce pour redémarrer l'animation CSS
    phraseBox.classList.add('pop-anim');

    // 5. Afficher le texte
    phraseBox.innerText = selectedPhrase;
    
    // 6. Gestion du style du bouton selon le mode
    if (isHot) {
        nextButton.innerText = "Suivant 🔥";
        // En mode hot, on garde des couleurs chaudes pour le bouton
        nextButton.style.backgroundColor = "#ff0040"; 
    } else {
        nextButton.innerText = "Suivant 🎲";
        // En mode normal, couleur aléatoire fun
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        nextButton.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    }
}

// Fonction pour changer tout le thème de la page (Couleurs)
function toggleTheme() {
    if (modeSwitch.checked) {
        // Ajoute la classe .hot-mode au body pour changer le CSS
        body.classList.add('hot-mode');
        generatePhrase(); // Génère direct une phrase hot
    } else {
        body.classList.remove('hot-mode');
        generatePhrase(); // Revient à une phrase normale
    }
}

// Écouteurs d'événements
nextButton.addEventListener('click', generatePhrase);
modeSwitch.addEventListener('change', toggleTheme);

// Lancer une première fois
generatePhrase();