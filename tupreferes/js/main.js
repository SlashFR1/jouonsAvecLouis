/* ==========================================================================
   TU PRÉFÈRES - LOGIQUE DE JEU REFACTORISÉE
   State Management étanche, Choix A / B interactifs, Tirage sans remise & Reset
   ========================================================================== */

(function() {
  'use strict';

  const state = {
    deck: [],
    currentIndex: 0,
    totalCards: 0,
    isCompleted: false,
    votesA: 0,
    votesB: 0
  };

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function parseDilemma(rawText) {
    let clean = rawText.trim();
    if (clean.toLowerCase().startsWith("tu préfères")) {
      clean = clean.substring("tu préfères".length).trim();
    }
    clean = clean.replace(/\?$/, "").trim();

    // Split par " ou "
    const parts = clean.split(/\bou\b/i);
    if (parts.length >= 2) {
      const optA = parts[0].trim();
      const optB = parts.slice(1).join(" ou ").trim();
      return { optA, optB };
    }
    return { optA: clean, optB: null };
  }

  function initDeck() {
    state.deck = shuffle(typeof words !== 'undefined' ? words : []);
    state.totalCards = state.deck.length;
    state.currentIndex = 0;
    state.isCompleted = false;
    window.isGameInProgress = false;
    renderCard();
  }

  function renderCard() {
    const container = document.getElementById("dilemma-content");
    const counterBadge = document.getElementById("card-counter");
    const nextBtn = document.getElementById("btn-next-card");
    const restartBtn = document.getElementById("btn-restart-deck");

    if (!container) return;

    state.votesA = 0;
    state.votesB = 0;

    if (state.deck.length === 0) {
      container.innerHTML = "<p>Aucun dilemme disponible.</p>";
      return;
    }

    if (state.currentIndex >= state.deck.length) {
      state.isCompleted = true;
      window.isGameInProgress = false;
      container.innerHTML = `
        <div class="deck-finished-notice">
          <span style="font-size: 2.8rem; display: block; margin-bottom: 8px;">👑</span>
          <strong>Fin de tous les dilemmes !</strong>
          <p style="font-size: 1.05rem; margin-top: 8px;">Toutes les options ont été votées sans doublon.</p>
        </div>
      `;
      if (counterBadge) counterBadge.textContent = `${state.totalCards} / ${state.totalCards} terminés`;
      if (nextBtn) nextBtn.style.display = "none";
      if (restartBtn) restartBtn.style.display = "inline-flex";
      return;
    }

    window.isGameInProgress = true;
    if (nextBtn) nextBtn.style.display = "inline-flex";
    if (restartBtn) restartBtn.style.display = "none";

    const raw = state.deck[state.currentIndex];
    const { optA, optB } = parseDilemma(raw);

    container.classList.add("fade-out");
    setTimeout(() => {
      if (optB) {
        container.innerHTML = `
          <div class="choices-container">
            <div class="choice-box" id="box-a" onclick="voteOption('A')">
              <span>${optA}</span>
              <div class="vote-counter" id="cnt-a">0 vote</div>
            </div>
            <div class="vs-badge">VS</div>
            <div class="choice-box" id="box-b" onclick="voteOption('B')">
              <span>${optB}</span>
              <div class="vote-counter" id="cnt-b">0 vote</div>
            </div>
          </div>
          <div class="penalty-hint">👉 Tapote pour compter les votes | La minorité boit !</div>
        `;
      } else {
        container.innerHTML = `
          <div class="word-display">${raw}</div>
          <div class="penalty-hint">👉 La minorité boit 1 gorgée !</div>
        `;
      }
      container.classList.remove("fade-out");
      container.classList.add("fade-in");
      setTimeout(() => container.classList.remove("fade-in"), 250);
    }, 150);

    if (counterBadge) {
      counterBadge.textContent = `Dilemme ${state.currentIndex + 1} / ${state.totalCards}`;
    }
  }

  window.voteOption = function(opt) {
    if (opt === 'A') {
      state.votesA++;
      const el = document.getElementById("cnt-a");
      if (el) el.textContent = `${state.votesA} vote${state.votesA > 1 ? 's' : ''}`;
    } else {
      state.votesB++;
      const el = document.getElementById("cnt-b");
      if (el) el.textContent = `${state.votesB} vote${state.votesB > 1 ? 's' : ''}`;
    }
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
    state.currentIndex = 0;
    state.isCompleted = false;
    window.isGameInProgress = false;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initDeck();
  });
})();
