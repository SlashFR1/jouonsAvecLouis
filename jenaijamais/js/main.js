let index = 0;
let isHotMode = false; // état du mode hot
let currentWordList = words; // liste active par défaut

function toggleMenu() {
    const nav = document.getElementById("main-nav");
    nav.classList.toggle("active");
}

// Fonction pour changer les mots animés
function changeWord() {
    const motEl = document.getElementById("words");
    motEl.classList.add("fade-out");

    setTimeout(() => {
        let newWord;
        do {
            newWord = currentWordList[Math.floor(Math.random() * currentWordList.length)];
        } while (newWord === motEl.textContent);

        motEl.textContent = newWord;
        motEl.classList.remove("fade-out");
        motEl.classList.add("fade-in");
        setTimeout(() => motEl.classList.remove("fade-in"), 400);
    }, 400);
}

// === Gestion du Mode Hot ===
const hotToggle = document.getElementById("hot-mode-toggle");

if (hotToggle) {
    hotToggle.addEventListener("change", function () {
        isHotMode = this.checked;

        if (isHotMode) {
            currentWordList = hotWords; // passe aux mots hot
            document.body.classList.add("hot-mode-active"); // optionnel : pour changer le style global
        } else {
            currentWordList = words; // revient aux mots normaux
            document.body.classList.remove("hot-mode-active");
        }

        // Optionnel : change immédiatement le mot affiché pour refléter le nouveau mode
        changeWord();
    });
}

// Lancement automatique de l'animation (si tu l’as déjà)
setInterval(changeWord, 3000); // change toutes les 3 secondes par exemple
changeWord(); // premier mot au chargement