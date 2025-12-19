

class GameApp {
    constructor() {
        this.state = {
            mode: null, // 'pictionary' ou 'flashguess'
            teamsCount: 2,
            wordCount: 20,
            turnDuration: 60,
            teams: [], // [{name: 'Equipe 1', score: 0}, ...]
            currentTeamIndex: 0,
            isHotMode: false,

            // Gestion des cartes
            masterDeck: [], // Le paquet total de la partie
            activeDeck: [], // Le paquet de la manche en cours
            guessedInRound: [], // Cartes devinées dans la manche en cours (pour Time's Up)

            // État de jeu
            currentRoundIndex: 0, // 0, 1, 2 pour Time's Up
            roundsConfig: [], // ['Parler', 'Un Mot', 'Mime']
            timerInterval: null,
            timeLeft: 0,
            isGameRunning: false,

            playedWordsThisRound: {},
        };

        this.init();
    }

    init() {
        // 1. Gestion des boutons du Menu (si vous avez utilisé des IDs dans le HTML)
        const btnPico = document.getElementById('btn-pictionary');
        if (btnPico) {
            btnPico.addEventListener('click', () => this.selectMode('pictionary'));
        }

        const btnTime = document.getElementById('btn-flashguess');
        if (btnTime) {
            btnTime.addEventListener('click', () => this.selectMode('flashguess'));
        }
        const hotModeCheckbox = document.getElementById('hot-mode');
        if (hotModeCheckbox) {
            hotModeCheckbox.addEventListener('change', (e) => {
                this.state.isHotMode = e.target.checked;
            });
        }
    }

    // --- Configuration ---

    selectMode(mode) {
        this.state.mode = mode;
        this.showView('setup-view');

        // Titre dynamique
        const titleEl = document.getElementById('setup-title');
        if (titleEl) {
            titleEl.innerText = mode === 'pictionary' ? 'Config sketchit 🎨' : "Config Time's Up ⏳";
        }

        // Afficher les options spécifiques
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
            // On compare la valeur int du bouton avec la valeur demandée
            if (parseInt(btn.innerText) === val) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    }

    // --- Lancement de la partie ---

    startGame() {
        // 1. Créer les équipes
        this.state.teams = [];
        for (let i = 1; i <= this.state.teamsCount; i++) {
            this.state.teams.push({ name: `Équipe ${i}`, score: 0 });
        }
        this.state.currentTeamIndex = 0;

        // 2. Choisir la liste de mots selon le mode Hot
        const baseWordList = this.state.isHotMode && typeof hotWordList !== 'undefined'
            ? hotWordList
            : wordList;

        if (!baseWordList || baseWordList.length === 0) {
            alert("Erreur : liste de mots non chargée !");
            return;
        }

        this.state.masterDeck = this.getRandomWords(this.state.wordCount, baseWordList);
        this.state.activeDeck = [...this.state.masterDeck];
        this.shuffle(this.state.activeDeck);

        // 3. Configurer les manches dynamiquement
        this.state.roundsConfig = [];
        this.state.roundTypes = []; // ← NOUVEAU : on garde le type pour les règles

        if (this.state.mode === 'flashguess') {
            const r1 = document.getElementById('round1');
            const r2 = document.getElementById('round2');
            const r3 = document.getElementById('round3');
            const r4 = document.getElementById('round4'); // ← Statue

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

            // Fallback si aucune manche sélectionnée
            if (this.state.roundsConfig.length === 0) {
                this.state.roundsConfig = ['Manche Unique : Parler'];
                this.state.roundTypes = ['speak'];
            }
        } else {
            // Mode Pictionary
            this.state.roundsConfig = ['Sketchit ✏️'];
            this.state.roundTypes = ['draw'];
        }

        this.state.currentRoundIndex = 0;
        this.prepareNextTurn();
        this.prepareNextTurn();
    }

    // --- Logique de Tour ---

    prepareNextTurn() {
        // Vérifier si la manche est finie (plus de cartes)
        if (this.state.activeDeck.length === 0) {
            this.endRound();
            return;
        }

        // Afficher l'écran intermédiaire
        this.showView('interim-view');
        this.updateScoreboard('scoreboard');

        const phaseEl = document.getElementById('phase-indicator');
        if (phaseEl) phaseEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex];

        const currentTeam = this.state.teams[this.state.currentTeamIndex];
        const teamNameEl = document.getElementById('next-team-name');
        if (teamNameEl) {
            teamNameEl.innerText = currentTeam.name;
            teamNameEl.style.color = this.getTeamColor(this.state.currentTeamIndex);
        }
    }

    startTurn() {
        this.showView('game-view');
        this.state.timeLeft = this.state.turnDuration;
        this.updateTimerDisplay();

        const phaseNameEl = document.getElementById('game-phase-name');
        if (phaseNameEl) phaseNameEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex];

        const instructionsEl = document.getElementById('game-instructions'); // ← tu dois ajouter cet élément dans ton HTML
        if (instructionsEl) {
            const currentType = this.state.roundTypes[this.state.currentRoundIndex];
            switch (currentType) {
                case 'speak':
                    instructionsEl.innerText = "Décrivez avec des mots, sans dire le mot !";
                    break;
                case 'oneword':
                    instructionsEl.innerText = "Un seul mot autorisé pour faire deviner !";
                    break;
                case 'mime':
                    instructionsEl.innerText = "Mimez sans parler ni faire de sons !";
                    break;
                case 'statue':
                    instructionsEl.innerText = "Prenez une pose immobile comme une statue 🗽 – pas de mouvement ni de son !";
                    break;
                case 'draw':
                    instructionsEl.innerText = "Dessinez sur le tableau ! Pas de lettres ni chiffres.";
                    break;
                default:
                    instructionsEl.innerText = "";
            }
        }
        // Afficher la première carte
        this.showNextCard();

        // Lancer timer
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
        clearInterval(this.state.timerInterval);
        this.state.isGameRunning = false;

        // Passer à l'équipe suivante
        this.state.currentTeamIndex = (this.state.currentTeamIndex + 1) % this.state.teamsCount;

        this.prepareNextTurn();
    }


    endRound() {
        // Si c'était la dernière manche → fin du jeu
        if (this.state.currentRoundIndex >= this.state.roundsConfig.length - 1) {
            this.endGame();
            return;
        }

        // Passage à la manche suivante
        this.state.currentRoundIndex++;

        // Rotation de l'équipe de départ selon la manche
        this.state.currentTeamIndex = this.state.currentRoundIndex % this.state.teamsCount;

        // Réinitialiser les cartes pour la nouvelle manche
        this.state.playedWordsThisRound = {}; // reset des cartes devinées
        this.state.activeDeck = [...this.state.masterDeck];
        this.shuffle(this.state.activeDeck);

        // === AFFICHAGE DU POPUP ===
        const popup = document.getElementById('round-transition-popup');
        const titleEl = document.getElementById('round-transition-title');
        const textEl = document.getElementById('round-transition-text');
        const teamEl = document.getElementById('round-transition-team');
        const continueBtn = document.getElementById('round-transition-continue');

        if (popup && titleEl && textEl && teamEl) {
            titleEl.innerText = "Nouvelle Manche !";
            textEl.innerText = this.state.roundsConfig[this.state.currentRoundIndex];

            const startingTeam = this.state.teams[this.state.currentTeamIndex];
            teamEl.innerText = startingTeam.name;
            teamEl.style.color = this.getTeamColor(this.state.currentTeamIndex);

            popup.classList.remove('hidden');

            // Clic sur le bouton pour continuer
            continueBtn.onclick = () => {
                popup.classList.add('hidden');
                this.prepareNextTurn();
            };
        } else {
            // Fallback si le popup n'existe pas (pour éviter bug)
            this.prepareNextTurn();
        }
    }


    endGame() {
        this.showView('gameover-view');
        this.updateScoreboard('final-scoreboard');

        // Trouver le vainqueur
        let maxScore = -1;
        let winners = [];
        this.state.teams.forEach(t => {
            if (t.score > maxScore) {
                maxScore = t.score;
                winners = [t.name];
            } else if (t.score === maxScore) {
                winners.push(t.name);
            }
        });

        const display = document.getElementById('winner-display');
        if (display) {
            if (winners.length === 1) {
                display.innerHTML = `Vainqueurs : <span style="color:var(--success)">${winners[0]}</span> 🎉`;
            } else {
                display.innerHTML = `Égalité : <span style="color:var(--accent)">${winners.join(' & ')}</span> 🤝`;
            }
        }
    }

    // --- Actions Jeu ---

    showNextCard() {
        const cardEl = document.getElementById('word-display');
        const counterEl = document.getElementById('cards-left');

        // Filtrer les cartes déjà devinées par toutes les équipes
        this.state.activeDeck = this.state.activeDeck.filter(word => {
            const guessedTeams = this.state.playedWordsThisRound[word] || [];
            return guessedTeams.length < this.state.teamsCount;
        });

        if (counterEl) counterEl.innerText = this.state.activeDeck.length;

        if (this.state.activeDeck.length === 0) {
            if (cardEl) cardEl.innerText = "Terminé !";
            clearInterval(this.state.timerInterval);
            setTimeout(() => {
                if (this.state.mode === 'flashguess') this.endRound();
                else this.endGame();
            }, 1000);
            return;
        }

        // Afficher la prochaine carte
        if (cardEl) {
            cardEl.classList.remove('fade-in');
            cardEl.classList.add('fade-out');

            setTimeout(() => {
                const word = this.state.activeDeck.shift();
                cardEl.innerText = word;
                cardEl.classList.remove('fade-out');
                cardEl.classList.add('fade-in');
                if (counterEl) counterEl.innerText = this.state.activeDeck.length;
            }, 200);
        }
    }

    validateWord() {
        if (!this.state.isGameRunning) return;

        const currentTeamIndex = this.state.currentTeamIndex;
        const cardEl = document.getElementById('word-display');
        const word = cardEl ? cardEl.innerText : "";
        if (!word || word === "Terminé !") return;

        // Marquer la carte comme devinée par l'équipe actuelle
        if (!this.state.playedWordsThisRound[word]) {
            this.state.playedWordsThisRound[word] = [];
        }
        if (!this.state.playedWordsThisRound[word].includes(currentTeamIndex)) {
            this.state.playedWordsThisRound[word].push(currentTeamIndex);
        }

        // Ajouter le score
        this.state.teams[currentTeamIndex].score++;

        this.showNextCard();
    }


    passWord() {
        if (!this.state.isGameRunning) return;

        const cardEl = document.getElementById('word-display');
        const currentWord = cardEl ? cardEl.innerText : "";

        this.state.activeDeck.push(currentWord);
        this.showNextCard();
    }

    // --- Utilitaires ---

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

    getRandomWords(count, sourceList = wordList) {
        if (!sourceList || sourceList.length === 0) {
            return ["Erreur Data", "Vérifiez", "Chargement"];
        }
        const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active', 'hidden'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
    }

    goHome() {
        clearInterval(this.state.timerInterval);
        this.showView('menu-view');
    }

    getTeamColor(index) {
        const colors = ['#4D96FF', '#FF6B6B', '#6BCB77', '#FFD93D'];
        return colors[index % colors.length];
    }
} // <--- C'est ici que la classe doit fermer !

// Initialisation globale
const app = new GameApp();
window.app = app; // Permet aux 'onclick' dans le HTML de fonctionner