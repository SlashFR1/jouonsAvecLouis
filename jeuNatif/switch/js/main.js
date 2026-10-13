/* ==========================================================================
   SWITCH (PARTY GAME) - LOGIQUE DE JEU REFACTORISÉE
   State Management étanche, Timers sans fuite mémoire, Transitions & Teardown
   ========================================================================== */

class GameApp {
  constructor() {
    this.state = {
      mode: null, // 'pictionary' ou 'flashguess'
      teamsCount: 2,
      wordCount: 20,
      turnDuration: 60,
      teams: [],
      currentTeamIndex: 0,
      isHotMode: false,

      // Gestion des cartes
      masterDeck: [],
      activeDeck: [],
      playedWordsThisRound: {},

      // État de jeu
      currentRoundIndex: 0,
      roundsConfig: [],
      roundTypes: [],
      timerInterval: null,
      timeLeft: 0,
      isGameRunning: false
    };

    this.init();
  }

  init() {
    const btnPico = document.getElementById('btn-pictionary');
    if (btnPico) btnPico.addEventListener('click', () => this.selectMode('pictionary'));

    const btnTime = document.getElementById('btn-flashguess');
    if (btnTime) btnTime.addEventListener('click', () => this.selectMode('flashguess'));

    const hotModeCheckbox = document.getElementById('hot-mode');
    if (hotModeCheckbox) {
      hotModeCheckbox.addEventListener('change', (e) => {
        this.state.isHotMode = e.target.checked;
      });
    }
  }

  selectMode(mode) {
    this.state.mode = mode;
    this.showView('setup-view');

    const titleEl = document.getElementById('setup-title');
    if (titleEl) {
      titleEl.innerText = mode === 'pictionary' ? 'Config Sketch It ! 🎨' : "Config Flash Guess ⏳";
    }

    const flashguessOpts = document.getElementById('flashguess-options');
    if (flashguessOpts) {
      if (mode === 'flashguess') {
        flashguessOpts.classList.remove('hidden');
      } else {
        flashguessOpts.classList.add('hidden');
      }
    }
  }

  setTeams(n) {
    this.state.teamsCount = n;
    this.updateSegmentedControl('team-selector', n);
  }

  setWordCount(n) {
    this.state.wordCount = n;
    this.updateSegmentedControl('cards-selector', n);
  }

  setTime(n) {
    this.state.turnDuration = n;
    this.updateSegmentedControl('time-selector', n);
  }

  updateSegmentedControl(id, val) {
    const container = document.getElementById(id);
    if (!container) return;
    const buttons = container.getElementsByTagName('button');
    for (let btn of buttons) {
      if (parseInt(btn.innerText) === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  startGame() {
    this.clearTurnTimer();
    window.isGameInProgress = true;

    // 1. Créer les équipes
    this.state.teams = [];
    for (let i = 1; i <= this.state.teamsCount; i++) {
      this.state.teams.push({ name: `Équipe ${i}`, score: 0 });
    }
    this.state.currentTeamIndex = 0;

    // 2. Choisir la liste de mots
    const baseWordList = this.state.isHotMode && typeof hotWordList !== 'undefined'
      ? hotWordList
      : (typeof wordList !== 'undefined' ? wordList : ["Chocolat", "Astronaute", "Tour Eiffel", "Guitare"]);

    this.state.masterDeck = this.getRandomWords(this.state.wordCount, baseWordList);
    this.state.activeDeck = [...this.state.masterDeck];
    this.shuffle(this.state.activeDeck);

    // 3. Configurer les manches
    this.state.roundsConfig = [];
    this.state.roundTypes = [];

    if (this.state.mode === 'flashguess') {
      const r1 = document.getElementById('round1');
      const r2 = document.getElementById('round2');
      const r3 = document.getElementById('round3');
      const r4 = document.getElementById('round4');

      if (r1 && r1.checked) {
        this.state.roundsConfig.push('Manche 1 : Parler 🗣️');
        this.state.roundTypes.push('speak');
      }
      if (r2 && r2.checked) {
        this.state.roundsConfig.push('Manche 2 : Un Mot 🤐');
        this.state.roundTypes.push('oneword');
      }
      if (r3 && r3.checked) {
        this.state.roundsConfig.push('Manche 3 : Mime 🎭');
        this.state.roundTypes.push('mime');
      }
      if (r4 && r4.checked) {
        this.state.roundsConfig.push('Manche 4 : Statue 🗽');
        this.state.roundTypes.push('statue');
      }

      if (this.state.roundsConfig.length === 0) {
        this.state.roundsConfig = ['Manche Unique : Parler 🗣️'];
        this.state.roundTypes = ['speak'];
      }
    } else {
      this.state.roundsConfig = ['Sketch It ! ✏️'];
      this.state.roundTypes = ['draw'];
    }

    this.state.currentRoundIndex = 0;
    this.prepareNextTurn(); // FIX : un seul appel propre
  }

  prepareNextTurn() {
    this.clearTurnTimer();

    // Si la manche est finie (plus de cartes)
    if (this.state.activeDeck.length === 0) {
      this.endRound();
      return;
    }

    this.showView('interim-view');
    this.updateScoreboard('scoreboard');

    const phaseEl = document.getElementById('phase-indicator');
    if (phaseEl) phaseEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex] || "Manche en cours";

    const currentTeam = this.state.teams[this.state.currentTeamIndex];
    const teamNameEl = document.getElementById('next-team-name');
    if (teamNameEl && currentTeam) {
      teamNameEl.innerText = currentTeam.name;
      teamNameEl.style.color = this.getTeamColor(this.state.currentTeamIndex);
    }
  }

  startTurn() {
    this.showView('game-view');
    this.state.timeLeft = this.state.turnDuration;
    this.updateTimerDisplay();

    const phaseNameEl = document.getElementById('game-phase-name');
    if (phaseNameEl) phaseNameEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex] || "";

    const instructionsEl = document.getElementById('game-instructions');
    if (instructionsEl) {
      const currentType = this.state.roundTypes[this.state.currentRoundIndex];
      switch (currentType) {
        case 'speak':
          instructionsEl.innerText = "Décrivez avec des phrases sans prononcer le mot !";
          break;
        case 'oneword':
          instructionsEl.innerText = "1 seul mot autorisé pour faire deviner !";
          break;
        case 'mime':
          instructionsEl.innerText = "Mimez sans parler ni faire de bruits !";
          break;
        case 'statue':
          instructionsEl.innerText = "Prenez une pose immobile comme une statue 🗽 !";
          break;
        case 'draw':
          instructionsEl.innerText = "Dessinez ! Interdit d'écrire des lettres ou des chiffres.";
          break;
        default:
          instructionsEl.innerText = "Faites deviner le mot à votre équipe !";
      }
    }

    this.showNextCard();

    this.clearTurnTimer();
    this.state.isGameRunning = true;
    this.state.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      this.updateTimerDisplay();

      if (this.state.timeLeft <= 0) {
        this.endTurn();
      }
    }, 1000);
  }

  endTurn() {
    this.clearTurnTimer();
    this.state.isGameRunning = false;
    this.state.currentTeamIndex = (this.state.currentTeamIndex + 1) % this.state.teamsCount;
    this.prepareNextTurn();
  }

  endRound() {
    this.clearTurnTimer();

    if (this.state.currentRoundIndex >= this.state.roundsConfig.length - 1) {
      this.endGame();
      return;
    }

    this.state.currentRoundIndex++;
    this.state.currentTeamIndex = this.state.currentRoundIndex % this.state.teamsCount;
    this.state.playedWordsThisRound = {};
    this.state.activeDeck = [...this.state.masterDeck];
    this.shuffle(this.state.activeDeck);

    const popup = document.getElementById('round-transition-popup');
    const titleEl = document.getElementById('round-transition-title');
    const textEl = document.getElementById('round-transition-text');
    const teamEl = document.getElementById('round-transition-team');
    const continueBtn = document.getElementById('round-transition-continue');

    if (popup && titleEl && textEl && teamEl) {
      titleEl.innerText = "Nouvelle Manche !";
      textEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex];
      const startingTeam = this.state.teams[this.state.currentTeamIndex];
      if (startingTeam) {
        teamEl.innerText = startingTeam.name;
        teamEl.style.color = this.getTeamColor(this.state.currentTeamIndex);
      }
      popup.classList.remove('hidden');

      if (continueBtn) {
        continueBtn.onclick = () => {
          popup.classList.add('hidden');
          this.prepareNextTurn();
        };
      }
    } else {
      this.prepareNextTurn();
    }
  }

  endGame() {
    this.clearTurnTimer();
    window.isGameInProgress = false;
    this.showView('gameover-view');
    this.updateScoreboard('final-scoreboard');

    const winnerEl = document.getElementById('winner-display');
    if (winnerEl && this.state.teams.length > 0) {
      const sorted = [...this.state.teams].sort((a, b) => b.score - a.score);
      const winner = sorted[0];
      winnerEl.innerHTML = `
        <h2 style="font-size:2rem; color: var(--game-color);">🎉 Victoire de ${winner.name} avec ${winner.score} points !</h2>
      `;
    }
  }

  showNextCard() {
    const cardEl = document.getElementById('word-display');
    const counterEl = document.getElementById('cards-left');

    if (this.state.activeDeck.length === 0) {
      this.endTurn();
      return;
    }

    if (cardEl) {
      cardEl.classList.remove('fade-in');
      cardEl.classList.add('fade-out');

      setTimeout(() => {
        const word = this.state.activeDeck.shift();
        cardEl.innerText = word;
        cardEl.classList.remove('fade-out');
        cardEl.classList.add('fade-in');
        if (counterEl) counterEl.innerText = this.state.activeDeck.length;
      }, 150);
    }
  }

  validateWord() {
    if (!this.state.isGameRunning) return;

    const currentTeamIndex = this.state.currentTeamIndex;
    const cardEl = document.getElementById('word-display');
    const word = cardEl ? cardEl.innerText : "";
    if (!word || word === "Terminé !" || word === "Prêt ?") return;

    if (this.state.teams[currentTeamIndex]) {
      this.state.teams[currentTeamIndex].score++;
    }

    this.showNextCard();
  }

  passWord() {
    if (!this.state.isGameRunning) return;

    const cardEl = document.getElementById('word-display');
    const currentWord = cardEl ? cardEl.innerText : "";
    if (currentWord && currentWord !== "Prêt ?") {
      this.state.activeDeck.push(currentWord);
    }

    this.showNextCard();
  }

  updateScoreboard(elementId) {
    const board = document.getElementById(elementId);
    if (!board) return;
    board.innerHTML = '';
    this.state.teams.forEach(team => {
      const row = document.createElement('div');
      row.classList.add('score-row');
      row.innerHTML = `<span>${team.name}</span> <span>${team.score} pts</span>`;
      board.appendChild(row);
    });
  }

  updateTimerDisplay() {
    const el = document.getElementById('timer');
    if (el) el.innerText = this.state.timeLeft;
  }

  getRandomWords(count, sourceList) {
    const list = Array.isArray(sourceList) && sourceList.length > 0 ? sourceList : ["Café", "Plage", "Vague", "Chien"];
    const shuffled = this.shuffle([...list]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active', 'hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
  }

  clearTurnTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
    this.state.isGameRunning = false;
  }

  goHome() {
    this.clearTurnTimer();
    window.isGameInProgress = false;
    this.showView('menu-view');
  }

  teardown() {
    this.clearTurnTimer();
    window.isGameInProgress = false;
  }

  getTeamColor(index) {
    const colors = ['#2e86de', '#eb4d4b', '#20bf6b', '#f9ca24'];
    return colors[index % colors.length];
  }
}

// Initialisation globale
const app = new GameApp();
window.app = app;

window.onGameTeardown = function() {
  if (window.app) window.app.teardown();
};
