/* ==========================================================================
   7 SECONDES - LOGIQUE DE JEU REFACTORISÉE
   Chrono 7s sans fuite mémoire, Tirage sans remise, Rotation des joueurs & Scores
   ========================================================================== */

(function() {
  'use strict';

  // État du jeu
  const state = {
    joueurs: ["Joueur 1", "Joueur 2"],
    currentPlayerIndex: 0,
    scores: {},
    deck: [],
    timer: 7,
    interval: null,
    isRunning: false,
    isCompleted: false
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
    clearChrono();
    const source = (typeof questions !== 'undefined' && Array.isArray(questions)) ? questions : [
      "Cite 3 capitales européennes.",
      "Cite 3 marques de chocolat.",
      "Donne 3 animaux marins.",
      "Cite 3 acteurs français célèbres."
    ];
    state.deck = shuffle(source);
    state.isCompleted = false;
    window.isGameInProgress = false;
  }

  function clearChrono() {
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = null;
    }
    state.isRunning = false;
  }

  window.onGameTeardown = function() {
    clearChrono();
    window.isGameInProgress = false;
  };

  function renderTurn() {
    clearChrono();
    window.isGameInProgress = true;

    const timerEl = document.getElementById('timer');
    const messageEl = document.getElementById('message');
    const questionEl = document.getElementById('question');
    const joueurEl = document.getElementById('joueur');
    const startBtn = document.getElementById('demarrerbtn');
    const resetBtn = document.getElementById('resetbtn');
    const nextBtn = document.getElementById('suivante');
    const resultBox = document.getElementById('result-actions');

    if (timerEl) {
      timerEl.textContent = "7";
      timerEl.classList.remove('urgent');
    }
    if (messageEl) messageEl.textContent = "Prêt ? Appuie sur GO !";
    if (resultBox) resultBox.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";
    if (startBtn) {
      startBtn.style.display = "inline-flex";
      startBtn.disabled = false;
    }

    // Vérifier fin de paquet
    if (state.deck.length === 0) {
      state.isCompleted = true;
      window.isGameInProgress = false;
      if (questionEl) {
        questionEl.innerHTML = `
          <div style="text-align: center;">
            <span style="font-size: 2.8rem; display: block; margin-bottom: 8px;">👑</span>
            <strong>Toutes les questions 7s sont épuisées !</strong>
            <p style="font-size: 1rem; margin-top: 8px;">Reb гражданин / Rebattre le paquet pour continuer.</p>
          </div>
        `;
      }
      if (startBtn) startBtn.style.display = "none";
      if (nextBtn) {
        nextBtn.textContent = "🔄 Rejouer une session";
        nextBtn.style.display = "inline-flex";
        nextBtn.onclick = () => window.location.reload();
      }
      return;
    }

    // Rotation des joueurs
    const joueurNom = state.joueurs[state.currentPlayerIndex];
    if (joueurEl) {
      const score = state.scores[joueurNom] || 0;
      joueurEl.textContent = `Au tour de ${joueurNom} (${score} pts)`;
    }

    // Question
    let rawQuestion = state.deck.shift();
    rawQuestion = rawQuestion.replace("{joueur}", joueurNom);
    if (questionEl) questionEl.textContent = rawQuestion;
  }

  // Démarrer le décompte
  window.demarrer = function() {
    if (state.isRunning) return;
    state.isRunning = true;
    state.timer = 7;

    const timerEl = document.getElementById('timer');
    const messageEl = document.getElementById('message');
    const startBtn = document.getElementById('demarrerbtn');
    const resetBtn = document.getElementById('resetbtn');
    const resultBox = document.getElementById('result-actions');

    if (startBtn) startBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "inline-flex";
    if (messageEl) messageEl.textContent = "⚡ Top chrono, parle !";

    state.interval = setInterval(() => {
      state.timer--;
      if (timerEl) {
        timerEl.textContent = state.timer;
        if (state.timer <= 3) {
          timerEl.classList.add('urgent');
          if (navigator.vibrate) navigator.vibrate(60);
        }
      }

      if (state.timer <= 0) {
        clearChrono();
        if (timerEl) {
          timerEl.textContent = "0";
          timerEl.classList.remove('urgent');
        }
        if (messageEl) messageEl.textContent = "⏰ TEMPS ÉCOULÉ !";
        if (navigator.vibrate) navigator.vibrate([200, 100, 400]);

        if (resetBtn) resetBtn.style.display = "none";
        if (resultBox) resultBox.style.display = "flex";
      }
    }, 1000);
  };

  // Arrêter manuellement avant la fin si réussi
  window.validerReussite = function(reussi) {
    clearChrono();
    const joueurNom = state.joueurs[state.currentPlayerIndex];
    const messageEl = document.getElementById('message');
    const resultBox = document.getElementById('result-actions');
    const nextBtn = document.getElementById('suivante');
    const resetBtn = document.getElementById('resetbtn');

    if (reussi) {
      state.scores[joueurNom] = (state.scores[joueurNom] || 0) + 1;
      if (messageEl) messageEl.textContent = `✅ Validé par le groupe ! +1 point pour ${joueurNom} !`;
    } else {
      if (messageEl) messageEl.textContent = `❌ Raté ! ${joueurNom} boit 2 gorgées !`;
    }

    if (resetBtn) resetBtn.style.display = "none";
    if (resultBox) resultBox.style.display = "none";
    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
      nextBtn.textContent = "Question Suivante ➡";
    }
  };

  window.resetTimer = function() {
    clearChrono();
    const timerEl = document.getElementById('timer');
    const startBtn = document.getElementById('demarrerbtn');
    const resetBtn = document.getElementById('resetbtn');
    const messageEl = document.getElementById('message');

    if (timerEl) {
      timerEl.textContent = "7";
      timerEl.classList.remove('urgent');
    }
    if (startBtn) startBtn.style.display = "inline-flex";
    if (resetBtn) resetBtn.style.display = "none";
    if (messageEl) messageEl.textContent = "Prêt ? Appuie sur GO !";
  };

  window.nouvelleQuestion = function() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.joueurs.length;
    renderTurn();
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Récupérer joueurs depuis localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("joueurs"));
      if (Array.isArray(stored) && stored.length > 0) {
        state.joueurs = stored;
      }
    } catch(e) {
      state.joueurs = ["Joueur 1", "Joueur 2"];
    }

    state.joueurs.forEach(j => { state.scores[j] = 0; });

    initDeck();
    renderTurn();
  });

  window.addEventListener("beforeunload", () => {
    window.onGameTeardown();
  });
})();
