/* ==========================================================================
   MESS MEME - LOGIQUE DE JEU REFACTORISÉE
   Cycle équitable des maîtres, Deck de 107 images sans doublon, Teardown & Navigation
   ========================================================================== */

(function() {
  'use strict';

  class MessMemeGame {
    constructor() {
      try {
        this.players = JSON.parse(localStorage.getItem('joueurs_messmeme')) || [];
      } catch(e) {
        this.players = [];
      }

      if (!Array.isArray(this.players) || this.players.length < 2) {
        alert("Il faut au moins 2 joueurs pour jouer ! Retour au choix des joueurs.");
        window.location.href = "messmeme.html";
        return;
      }

      this.app = document.getElementById('game-app');
      this.scores = this.players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
      this.round = 1;
      this.totalAvailableImages = 107; // 107 images réelles dans le dossier images/
      this.imageDeck = [];
      this.masterOrder = this.shuffle([...Array(this.players.length).keys()]);
      this.currentMasterPointer = 0;
      this.submissions = [];
      this.currentPlayerIndex = 0;
      this.selectedSubmissionIndex = null;

      this.initImageDeck();
      this.startRound();
    }

    initImageDeck() {
      const arr = [];
      for (let i = 1; i <= this.totalAvailableImages; i++) {
        arr.push(i);
      }
      this.imageDeck = this.shuffle(arr);
    }

    startRound() {
      window.isGameInProgress = true;
      this.submissions = [];
      this.currentPlayerIndex = 0;
      this.selectedSubmissionIndex = null;

      // Rotation équitable du maître
      if (this.currentMasterPointer >= this.masterOrder.length) {
        this.masterOrder = this.shuffle([...Array(this.players.length).keys()]);
        this.currentMasterPointer = 0;
      }
      this.currentMasterIndex = this.masterOrder[this.currentMasterPointer++];

      // Image sans doublon
      if (this.imageDeck.length === 0) {
        this.initImageDeck();
      }
      const imgNum = this.imageDeck.shift();
      this.currentImage = `images/img${imgNum}.png`;

      this.showImageToAll();
    }

    showImageToAll() {
      const masterName = this.players[this.currentMasterIndex];
      this.app.innerHTML = `
        <div class="screen active widget">
          <span class="badge">Round ${this.round}</span>
          <h2 style="margin: 12px 0;">Maître du Meme : <strong style="color:var(--game-color);">${masterName}</strong></h2>
          <div class="image-container">
            <img src="${this.currentImage}" class="round-image" alt="Meme du round" onerror="this.src='../loustic-icon.png'">
          </div>
          <p style="font-size: 1.15rem; font-weight: 600;">Tous les joueurs sauf ${masterName} : préparez-vous à écrire en secret votre meilleure légende !</p>
          <div style="margin-top: 16px;">
            <button class="btn-start" onclick="game.startCaptionTurns()">Lancer les légendes ✍️</button>
          </div>
        </div>
      `;
    }

    startCaptionTurns() {
      this.nextCaptionTurn();
    }

    nextCaptionTurn() {
      let attempts = 0;
      while (attempts < this.players.length) {
        const playerName = this.players[this.currentPlayerIndex % this.players.length];
        this.currentPlayerIndex++;

        const alreadySubmitted = this.submissions.some(s => s.playerName === playerName);
        if (playerName !== this.players[this.currentMasterIndex] && !alreadySubmitted) {
          this.showCaptionInput(playerName);
          return;
        }
        attempts++;
      }

      this.showMasterChoice();
    }

    showCaptionInput(playerName) {
      this.app.innerHTML = `
        <div class="screen active widget">
          <span class="badge">${playerName}, à ton tour en secret !</span>
          <div class="image-container">
            <img src="${this.currentImage}" class="round-image" alt="Image">
          </div>
          <p style="font-weight: 700; margin: 12px 0;">Écris une légende bien drôle pour ce meme :</p>
          <textarea id="captionInput" placeholder="Ta punchline ici..." maxlength="200" style="width: 100%; max-width: 440px; min-height: 90px;"></textarea>
          <div style="margin-top: 16px;">
            <button class="btn-start" onclick="game.submitCaption('${playerName}')">Valider et passer ➡</button>
          </div>
        </div>
      `;
      const input = document.getElementById('captionInput');
      if (input) input.focus();
    }

    submitCaption(playerName) {
      const input = document.getElementById('captionInput');
      const caption = input ? input.value.trim() : "";
      if (!caption) {
        alert("Tu dois écrire une légende !");
        return;
      }

      this.submissions.push({ playerName, caption });
      this.nextCaptionTurn();
    }

    showMasterChoice() {
      this.shuffle(this.submissions);
      const masterName = this.players[this.currentMasterIndex];

      const captionsHTML = this.submissions.map((sub, i) => `
        <div class="caption-card" data-index="${i}">
          <p style="margin: 0; font-size: 1.15rem;">"${sub.caption}"</p>
        </div>
      `).join('');

      this.app.innerHTML = `
        <div class="screen active widget">
          <span class="badge">Le vote de ${masterName}</span>
          <h2 style="margin: 12px 0;">Choisis ta légende préférée :</h2>
          <div class="image-container">
            <img src="${this.currentImage}" class="round-image" alt="Image">
          </div>
          <div class="captions-grid">
            ${captionsHTML || '<p>Aucune proposition...</p>'}
          </div>
          <div id="confirm-area" style="display:none; margin-top:20px;">
            <button class="btn-start" onclick="game.confirmWinner()">Élire ce Meme Vainqueur 🏆</button>
          </div>
        </div>
      `;

      document.querySelectorAll('.caption-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.caption-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedSubmissionIndex = parseInt(card.dataset.index);
          const confirmArea = document.getElementById('confirm-area');
          if (confirmArea) confirmArea.style.display = 'block';
        });
      });
    }

    confirmWinner() {
      if (this.selectedSubmissionIndex === null) {
        alert("Choisis une légende d'abord !");
        return;
      }

      const winner = this.submissions[this.selectedSubmissionIndex];
      this.scores[winner.playerName]++;
      this.showRoundResult(winner);
    }

    showRoundResult(winner) {
      const winnerName = winner.playerName;
      const targetWinScore = 3; // 3 points pour remporter la couronne
      const hasGameWinner = Object.values(this.scores).some(score => score >= targetWinScore);
      const gameWinner = hasGameWinner ? Object.keys(this.scores).find(p => this.scores[p] >= targetWinScore) : null;

      if (hasGameWinner) {
        window.isGameInProgress = false;
      }

      this.app.innerHTML = `
        <div class="screen active widget">
          <h2 style="margin: 8px 0;">🏆 ${winnerName} gagne le round !</h2>
          <div class="winner-caption">"${winner.caption}"</div>
          <div class="image-container">
            <img src="${this.currentImage}" class="round-image" alt="Meme">
          </div>

          <h3 style="margin-top: 20px;">Tableau des Scores :</h3>
          <div class="scoreboard" style="margin: 12px auto;">
            ${this.players.map(p => `
              <div class="score-row">
                <span>${p}</span>
                <span>${this.scores[p]} pt${this.scores[p] > 1 ? 's' : ''}</span>
              </div>
            `).join('')}
          </div>

          ${hasGameWinner ? `
            <div style="background:#2ed573; color:#fff; padding:16px; border-radius:16px; margin: 20px 0; border: 3px solid var(--rh-ink); box-shadow: var(--rh-shadow);">
              <h2 style="margin:0;">👑 ${gameWinner} remporte la partie de Mess Meme ! 👑</h2>
            </div>
            <div class="action-buttons-group">
              <button class="btn-start" onclick="window.handleSafeNavigation('../index.html')">Retour au portail 🏠</button>
              <button class="btn-secondary" onclick="window.location.reload()">Rejouer une partie 🔄</button>
            </div>
          ` : `
            <div style="margin-top: 20px;">
              <button class="btn-start" onclick="game.round++; game.startRound()">Round suivant ➡</button>
            </div>
          `}
        </div>
      `;
    }

    shuffle(array) {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    teardown() {
      window.isGameInProgress = false;
    }
  }

  window.game = new MessMemeGame();

  window.onGameTeardown = function() {
    if (window.game) window.game.teardown();
  };
})();