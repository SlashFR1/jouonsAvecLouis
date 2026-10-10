/* ==========================================================================
   VRAI OU FAUX - LOGIQUE DE JEU REFACTORISÉE
   Deck sans doublon, Timer 10s étanche sans fuite, Feedback & Victoire
   ========================================================================== */

(function() {
  'use strict';

  // Récupération des joueurs
  let joueurs = [];
  try {
    joueurs = JSON.parse(localStorage.getItem("joueurs")) || ["Joueur 1", "Joueur 2"];
  } catch(e) {
    joueurs = ["Joueur 1", "Joueur 2"];
  }
  if (!Array.isArray(joueurs) || joueurs.length === 0) joueurs = ["Joueur 1", "Joueur 2"];

  // Catégorie
  const selectedCategory = localStorage.getItem("selectedCategory") || "Toutes les catégories 🌈";

  // État du jeu
  const state = {
    deck: [],
    scores: Array(joueurs.length).fill(0),
    currentPlayer: 0,
    currentQuestion: null,
    timerInterval: null,
    isAnswered: false,
    isGameOver: false
  };

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function initDeck() {
    let pool = [];
    if (typeof affirmations !== 'undefined') {
      if (selectedCategory === "Toutes les catégories 🌈") {
        Object.values(affirmations).forEach(arr => {
          if (Array.isArray(arr)) pool = pool.concat(arr);
        });
      } else if (affirmations[selectedCategory]) {
        pool = [...affirmations[selectedCategory]];
      }
    }

    if (pool.length === 0) {
      pool = [
        { question: "La grande muraille de Chine est visible depuis la Lune à l'œil nu.", answer: false },
        { question: "Les pieuvres ont trois cœurs.", answer: true },
        { question: "Les bananes poussent sur des arbres.", answer: false },
        { question: "Le miel ne périme jamais s'il est bien conservé.", answer: true }
      ];
    }

    state.deck = shuffle(pool);
  }

  function clearTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updatePlayerBadge() {
    const nomJoueur = joueurs[state.currentPlayer];
    const badge = document.getElementById("joueurActuel");
    if (badge) {
      badge.textContent = `🎯 Tour de ${nomJoueur} (Score : ${state.scores[state.currentPlayer]} pts)`;
    }
  }

  function showQuestion() {
    clearTimer();
    state.isAnswered = false;
    window.isGameInProgress = true;

    const answerBox = document.getElementById("answer");
    const nextBtn = document.getElementById("nextBtn");
    const trueBtn = document.getElementById("trueBtn");
    const falseBtn = document.getElementById("falseBtn");
    const timerBadge = document.getElementById("timer");

    if (answerBox) {
      answerBox.textContent = "";
      answerBox.style.display = "none";
    }
    if (nextBtn) nextBtn.style.display = "none";
    if (trueBtn) trueBtn.disabled = false;
    if (falseBtn) falseBtn.disabled = false;

    // Vérifier fin de deck
    if (state.deck.length === 0) {
      state.isGameOver = true;
      window.isGameInProgress = false;
      document.getElementById("question").innerHTML = `
        <div style="text-align:center;">
          <span style="font-size:2.5rem;">🏆</span><br>
          <strong>Toutes les questions ont été jouées !</strong>
        </div>
      `;
      if (timerBadge) timerBadge.style.display = "none";
      if (nextBtn) {
        nextBtn.textContent = "🔄 Rejouer une partie";
        nextBtn.style.display = "inline-flex";
        nextBtn.onclick = () => window.location.reload();
      }
      return;
    }

    // Piocher la question sans répétition
    state.currentQuestion = state.deck.shift();
    const qEl = document.getElementById("question");
    if (qEl) qEl.textContent = state.currentQuestion.question;

    updatePlayerBadge();

    // Lancer le timer 10s
    let timeLeft = 10;
    if (timerBadge) {
      timerBadge.textContent = `⏳ ${timeLeft}s`;
      timerBadge.classList.remove("timer-urgent");
      timerBadge.style.display = "inline-flex";
    }

    state.timerInterval = setInterval(() => {
      timeLeft--;
      if (timerBadge) {
        timerBadge.textContent = `⏳ ${timeLeft}s`;
        if (timeLeft <= 3) timerBadge.classList.add("timer-urgent");
      }
      if (timeLeft <= 0) {
        clearTimer();
        revealAnswer(null);
      }
    }, 1000);
  }

  function revealAnswer(playerChoice) {
    if (state.isAnswered) return;
    state.isAnswered = true;
    clearTimer();

    const trueBtn = document.getElementById("trueBtn");
    const falseBtn = document.getElementById("falseBtn");
    const answerBox = document.getElementById("answer");
    const nextBtn = document.getElementById("nextBtn");

    if (trueBtn) trueBtn.disabled = true;
    if (falseBtn) falseBtn.disabled = true;

    const q = state.currentQuestion;
    const isCorrect = (playerChoice !== null && playerChoice === q.answer);

    if (answerBox) {
      answerBox.style.display = "block";
      if (playerChoice === null) {
        answerBox.innerHTML = `⏰ <strong>Temps écoulé !</strong> C'était : <u>${q.answer ? "VRAI" : "FAUX"}</u>. Tu bois 1 gorgée !`;
        answerBox.style.backgroundColor = "#ff7675";
      } else if (isCorrect) {
        state.scores[state.currentPlayer]++;
        answerBox.innerHTML = `✅ <strong>Bravo !</strong> C'était bien <u>${q.answer ? "VRAI" : "FAUX"}</u>. +1 point !`;
        answerBox.style.backgroundColor = "#55efc4";
      } else {
        answerBox.innerHTML = `❌ <strong>Raté !</strong> C'était <u>${q.answer ? "VRAI" : "FAUX"}</u>. Tu bois 1 gorgée !`;
        answerBox.style.backgroundColor = "#ff7675";
      }
    }

    updatePlayerBadge();

    // Condition de victoire à 10 points
    if (state.scores[state.currentPlayer] >= 10) {
      state.isGameOver = true;
      window.isGameInProgress = false;
      const winnerName = joueurs[state.currentPlayer];
      setTimeout(() => {
        alert(`🏆 VICTOIRE ! ${winnerName} a atteint 10 points et gagne la partie ! 🎉`);
        window.location.reload();
      }, 600);
      return;
    }

    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
    }
  }

  function nextTurn() {
    state.currentPlayer = (state.currentPlayer + 1) % joueurs.length;
    showQuestion();
  }

  window.onGameTeardown = function() {
    clearTimer();
    window.isGameInProgress = false;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initDeck();

    const tBtn = document.getElementById("trueBtn");
    const fBtn = document.getElementById("falseBtn");
    const nBtn = document.getElementById("nextBtn");

    if (tBtn) tBtn.addEventListener("click", () => revealAnswer(true));
    if (fBtn) fBtn.addEventListener("click", () => revealAnswer(false));
    if (nBtn) nBtn.addEventListener("click", nextTurn);

    showQuestion();
  });

  window.addEventListener("beforeunload", () => {
    window.onGameTeardown();
  });
})();