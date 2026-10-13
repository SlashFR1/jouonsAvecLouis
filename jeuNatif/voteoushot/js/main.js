/* ==========================================================================
   VOTE OU SHOT - LOGIQUE DE JEU REFACTORISÉE
   State Management étanche, Compte à rebours 3-2-1, Tirage sans remise & Reset
   ========================================================================== */

(function() {
  'use strict';

  const state = {
    deck: [],
    currentIndex: 0,
    totalCards: 0,
    isCompleted: false,
    countdownTimer: null
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
    clearCountdown();
    state.deck = shuffle(typeof words !== 'undefined' ? words : []);
    state.totalCards = state.deck.length;
    state.currentIndex = 0;
    state.isCompleted = false;
    window.isGameInProgress = false;
    renderCard();
  }

  function clearCountdown() {
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  }

  function renderCard() {
    clearCountdown();
    const wordEl = document.getElementById("words");
    const counterBadge = document.getElementById("card-counter");
    const countBtn = document.getElementById("btn-countdown");
    const nextBtn = document.getElementById("btn-next-card");
    const restartBtn = document.getElementById("btn-restart-deck");

    if (!wordEl) return;

    if (countBtn) {
      countBtn.textContent = "⏱️ Lancer le 3... 2... 1...";
      countBtn.classList.remove("counting");
      countBtn.disabled = false;
      countBtn.style.display = "inline-flex";
    }

    if (state.deck.length === 0) {
      wordEl.textContent = "Aucune question disponible.";
      return;
    }

    if (state.currentIndex >= state.deck.length) {
      state.isCompleted = true;
      window.isGameInProgress = false;
      wordEl.innerHTML = `
        <div class="deck-finished-notice">
          <span style="font-size: 2.8rem; display: block; margin-bottom: 8px;">🏆</span>
          <strong>Toutes les questions ont été votées !</strong>
          <p style="font-size: 1.05rem; margin-top: 8px;">Tout le monde a pris sa dose de shots et de révélations.</p>
        </div>
      `;
      if (counterBadge) counterBadge.textContent = `${state.totalCards} / ${state.totalCards} terminées`;
      if (countBtn) countBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (restartBtn) restartBtn.style.display = "inline-flex";
      return;
    }

    window.isGameInProgress = true;
    if (nextBtn) nextBtn.style.display = "inline-flex";
    if (restartBtn) restartBtn.style.display = "none";

    const question = state.deck[state.currentIndex];

    wordEl.classList.add("fade-out");
    setTimeout(() => {
      wordEl.textContent = question;
      wordEl.classList.remove("fade-out");
      wordEl.classList.add("fade-in");
      setTimeout(() => wordEl.classList.remove("fade-in"), 250);
    }, 150);

    if (counterBadge) {
      counterBadge.textContent = `Question ${state.currentIndex + 1} / ${state.totalCards}`;
    }
  }

  window.startCountdown = function() {
    const btn = document.getElementById("btn-countdown");
    if (!btn || state.countdownTimer) return;

    let count = 3;
    btn.classList.add("counting");
    btn.disabled = true;
    btn.textContent = `🚨 POINTEZ DANS ${count}...`;

    if (navigator.vibrate) navigator.vibrate(100);

    state.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        btn.textContent = `🚨 POINTEZ DANS ${count}...`;
        if (navigator.vibrate) navigator.vibrate(100);
      } else {
        clearCountdown();
        btn.textContent = `👉 POINTEZ DU DOIGT MAINTENANT !`;
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
        setTimeout(() => {
          btn.classList.remove("counting");
          btn.textContent = `⏱️ Recommencer le 3... 2... 1...`;
          btn.disabled = false;
        }, 3000);
      }
    }, 1000);
  };

  window.nextCard = function() {
    if (state.isCompleted) return;
    state.currentIndex++;
    renderCard();
  };

  window.restartDeck = function() {
    initDeck();
  };

  window.onGameTeardown = function() {
    clearCountdown();
    state.currentIndex = 0;
    state.isCompleted = false;
    window.isGameInProgress = false;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initDeck();
  });
})();
