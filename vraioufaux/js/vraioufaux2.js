// ==========================================
// 1. RÉCUPÉRATION ET FILTRAGE (NOUVEAU)
// ==========================================

// Récupération des joueurs
let joueurs = JSON.parse(localStorage.getItem("joueurs"));
// Sécurité si on lance la page sans passer par l'accueil
if (!joueurs || joueurs.length === 0) joueurs = ["Joueur 1", "Joueur 2"];

// Récupération de la catégorie
const selectedCategory = localStorage.getItem("selectedCategory") || "Toutes les catégories 🌈";

// Création du tableau de questions pour cette partie (gameQuestions)
let gameQuestions = [];

if (selectedCategory === "Toutes les catégories 🌈") {
    // Si "Toutes", on mélange tout
    Object.values(affirmations).forEach(arr => {
        gameQuestions = gameQuestions.concat(arr);
    });
} else {
    // Sinon on prend juste la catégorie choisie
    gameQuestions = affirmations[selectedCategory] || [];
}

// Vérification qu'il y a des questions
if (gameQuestions.length === 0) {
    alert("Aucune question trouvée pour cette catégorie ! Retour à l'accueil.");
    window.location.href = "index.html"; // Retour accueil
}

// ==========================================
// 2. LOGIQUE DU JEU (TON CODE ADAPTÉ)
// ==========================================

let scores = Array(joueurs.length).fill(0);
let currentPlayer = 0;
let currentQuestionIndex = 0;
let timerInterval;

function showPlayer() {
    const nomJoueur = joueurs[currentPlayer];
    document.getElementById("joueurActuel").textContent = `Au tour de ${nomJoueur} (Score: ${scores[currentPlayer]})`;
}

function showQuestion() {
    clearInterval(timerInterval);
    document.getElementById("answer").textContent = "";
    document.getElementById("nextBtn").style.display = "none";

    // --- CHANGEMENT ICI : On utilise gameQuestions au lieu de questions ---
    const randomIndex = Math.floor(Math.random() * gameQuestions.length);
    currentQuestionIndex = randomIndex;

    const q = gameQuestions[currentQuestionIndex];
    document.getElementById("question").textContent = q.question;
    // ---------------------------------------------------------------------

    let timeLeft = 10;
    document.getElementById("timer").textContent = `Temps restant: ${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Temps restant: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            revealAnswer();
        }
    }, 1000);
}

function revealAnswer(playerAnswer = null) {
    clearInterval(timerInterval);
    
    // --- CHANGEMENT ICI ---
    const q = gameQuestions[currentQuestionIndex];

    if (playerAnswer === null) {
        document.getElementById("answer").textContent = `⏱️ Temps écoulé ! C'était : ${q.answer ? "VRAI" : "FAUX"}`;
    } else if (playerAnswer === q.answer) {
        document.getElementById("answer").textContent = "✅ Correct !";
        scores[currentPlayer]++;
    } else {
        document.getElementById("answer").textContent = `❌ Faux ! C'était : ${q.answer ? "VRAI" : "FAUX"}`;
    }

    // Condition de victoire (ex: 10 points)
    if (scores[currentPlayer] >= 10) {
        alert(`${joueurs[currentPlayer]} a gagné la partie ! 🎉`);
        window.location.reload();
        return;
    }

    document.getElementById("nextBtn").style.display = "inline-block";
}

// Event Listeners
document.getElementById("trueBtn").addEventListener("click", () => revealAnswer(true));
document.getElementById("falseBtn").addEventListener("click", () => revealAnswer(false));

document.getElementById("nextBtn").addEventListener("click", () => {
    currentPlayer = (currentPlayer + 1) % joueurs.length;
    showPlayer();
    showQuestion();
});

// Lancer le premier tour
showPlayer();
showQuestion();