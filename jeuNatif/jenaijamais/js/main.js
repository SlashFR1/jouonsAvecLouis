/* ==========================================================================
   JE N'AI JAMAIS - LOGIQUE DE JEU REFACTORISÉE
   State Management étanche, Tirage sans remise, Gestion de fin de deck & Reset
   ========================================================================== */

(function() {
  'use strict';

  // État du jeu
  const state = {
    isHotMode: false,
    deck: [],
    currentIndex: 0,
    totalCards: 0,
    isCompleted: false
  };

  // Fisher-Yates shuffle
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Initialisation ou réinitialisation du deck
  function initDeck(resetIndex = true) {
    const source = (state.isHotMode && typeof hotWords !== 'undefined') ? hotWords : (typeof words !== 'undefined' ? words : []);
    state.deck = shuffleArray(source);
    state.totalCards = state.deck.length;
    if (resetIndex) {
      state.currentIndex = 0;
      state.isCompleted = false;
    }
    window.isGameInProgress = (state.currentIndex > 0 && !state.isCompleted);
    renderCard();
  }

  // Rendu de la carte ou écran de fin
  function renderCard() {
    const cardBox = document.getElementById("words");
    const counterBadge = document.getElementById("card-counter");
    const nextBtn = document.getElementById("btn-next-card");
    const restartBtn = document.getElementById("btn-restart-deck");

    if (!cardBox) return;

    if (state.deck.length === 0) {
      cardBox.textContent = "Aucune question disponible.";
      return;
    }

    if (state.currentIndex >= state.deck.length) {
      // Fin de deck propre
      state.isCompleted = true;
      window.isGameInProgress = false;
      cardBox.innerHTML = `
        <div class="deck-finished-notice">
          <span style="font-size: 2.8rem; display: block; margin-bottom: 8px;">🎉</span>
          <strong>Fin du paquet !</strong>
          <p style="font-size: 1.05rem; margin-top: 8px;">Toutes les affirmations de ce mode ont été jouées sans aucun doublon.</p>
        </div>
      `;
      if (counterBadge) counterBadge.textContent = `${state.totalCards} / ${state.totalCards} terminées`;
      if (nextBtn) nextBtn.style.display = "none";
      if (restartBtn) restartBtn.style.display = "inline-flex";
      return;
    }

    // Affichage d'une question
    window.isGameInProgress = true;
    if (nextBtn) nextBtn.style.display = "inline-flex";
    if (restartBtn) restartBtn.style.display = "none";

    const currentQuestion = state.deck[state.currentIndex];

    // Animation de transition
    cardBox.classList.add("fade-out");
    setTimeout(() => {
      cardBox.textContent = currentQuestion;
      cardBox.classList.remove("fade-out");
      cardBox.classList.add("fade-in");
      setTimeout(() => cardBox.classList.remove("fade-in"), 250);
    }, 150);

    if (counterBadge) {
      counterBadge.textContent = `Question ${state.currentIndex + 1} / ${state.totalCards}`;
    }
  }

  // Passer à la question suivante
  window.nextCard = function() {
    if (state.isCompleted) return;
    state.currentIndex++;
    renderCard();
  };

  // Rebattre le deck
  window.restartDeck = function() {
    initDeck(true);
  };

  // Teardown universel pour éviter les fuites
  window.onGameTeardown = function() {
    state.currentIndex = 0;
    state.isCompleted = false;
    window.isGameInProgress = false;
  };

  // Initialisation DOM
  document.addEventListener("DOMContentLoaded", function() {
    const hotToggle = document.getElementById("hot-mode-toggle");
    if (hotToggle) {
      hotToggle.addEventListener("change", function() {
        state.isHotMode = this.checked;
        if (state.isHotMode) {
          document.body.classList.add("hot-mode-active");
        } else {
          document.body.classList.remove("hot-mode-active");
        }
        initDeck(true);
      });
    }

    initDeck(true);
  });
})();