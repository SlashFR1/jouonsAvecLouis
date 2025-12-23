/**
 * Main Game Controller
 * Handles the game loop, state management, and DOM updates.
 * @class Game
 */
class Game {
    constructor() {
        // --- DOM Elements ---
        this.app = document.getElementById('app');

        // --- Game State ---
        this.players = [];
        this.roundCount = 0;
        this.maxRounds = 5;
        this.masterIndex = 0;
        this.currentQuestion = null;
        this.gameMode = 'standard'; // 'standard' ou 'sandbox'
        this.pot = [];
        this.decks = {
            questions: [],
            answers: []
        };

        // --- Bindings ---
        this.init = this.init.bind(this);

        // --- Home Button Logic ---
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                if (confirm("Attention : La partie en cours sera perdue. Retourner à l'accueil ?")) {
                    this.init();
                }
            });
        }
    }

    /**
     * Initializes the game
     */
    init() {
        // Clone data to avoid mutating the original source
        this.decks.questions = this.shuffle([...GAME_DATA.questions]);
        this.decks.answers = this.shuffle([...GAME_DATA.answers]);
        this.roundCount = 0;
        this.gameMode = 'standard'; // Reset par défaut
        this.renderSetup();
    }

    /**
     * Utility: Fisher-Yates Shuffle
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Utility: Count occurrences of blanks in a question string
     */
    countBlanks(text) {
        const matches = text.match(/___/g);
        return matches ? matches.length : 0;
    }

    // -------------------------------------------------------------------------
    //                                  VIEWS
    // -------------------------------------------------------------------------

    /**
     * Phase 1: Setup Screen (Step 1: Numbers & Mode)
     */
    renderSetup() {
        this.app.innerHTML = `
        <div class="screen">
            <h1>Configuration</h1>
            <div class="input-group">
                <label>Mode de jeu</label>
                <button id="mode-toggle" class="btn" style="background-color: #2c3e50;">Mode: Classique</button>
                <small id="mode-desc" style="display:block; margin-top:5px; margin-bottom:10px; color:#666;">On garde ses cartes en main.</small>
            </div>

            <div class="input-group">
                <label>Nombre de joueurs (3-10)</label>
                <input type="number" id="p-count" value="3" min="3" max="10">
            </div>
            <div class="input-group">
                <label>Tours par joueur</label>
                <input type="number" id="r-count" value="2" min="1" max="10">
            </div>
            <button class="btn" id="next-btn">Suivant</button>
        </div>`;

        // Logic for Mode Toggle
        const modeBtn = document.getElementById('mode-toggle');
        const modeDesc = document.getElementById('mode-desc');

        modeBtn.addEventListener('click', () => {
            if (this.gameMode === 'standard') {
                this.gameMode = 'sandbox';
                modeBtn.textContent = "Mode: Bac à Sable";
                modeBtn.style.backgroundColor = "#e67e22"; // Orange visual cue
                modeDesc.textContent = "Cartes changées à chaque tour !";
            } else {
                this.gameMode = 'standard';
                modeBtn.textContent = "Mode: Classique";
                modeBtn.style.backgroundColor = "#2c3e50";
                modeDesc.textContent = "On garde ses cartes en main.";
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            const pCount = parseInt(document.getElementById('p-count').value);
            const rCount = parseInt(document.getElementById('r-count').value);

            if (pCount < 3) return alert("Minimum 3 joueurs !");

            this.renderNamingScreen(pCount, rCount);
        });
    }

    /**
     * Phase 1.5: Naming Screen
     */
    renderNamingScreen(playerCount, roundsPerPlayer) {
        let inputsHtml = '';
        for (let i = 1; i <= playerCount; i++) {
            inputsHtml += `<div class="input-group"> <input type="text" class="player-name-input" placeholder="Nom du Joueur ${i}" data-id="${i}" value="Joueur ${i}"> </div>`;
        }

        this.app.innerHTML = `<div class="screen"> <h1>Identités</h1> <p>Comment doit-on vous appeler ?</p> <div style="max-width: 400px; margin: 0 auto; margin-bottom: 20px;"> ${inputsHtml} </div> <button class="btn" id="start-btn">Lancer la partie</button> </div>`;

        document.getElementById('start-btn').addEventListener('click', () => {
            const inputs = document.querySelectorAll('.player-name-input');
            const playerNames = Array.from(inputs).map(input => input.value.trim() || `Joueur ${input.dataset.id}`);

            this.setupPlayers(playerNames);
            this.maxRounds = roundsPerPlayer * playerCount;
            this.startRound();
        });
    }

    setupPlayers(namesArray) {
        this.players = [];
        // --- FIX: Mélange des noms avant la création des joueurs ---
        const shuffledNames = this.shuffle([...namesArray]);

        shuffledNames.forEach((name, index) => {
            this.players.push({
                id: index + 1,
                name: name,
                score: 0,
                hand: this.drawCards(5)
            });
        });

        // Le maître commence à l'index 0 (qui est maintenant un joueur aléatoire)
        this.masterIndex = 0;
    }

    drawCards(n) {
        // Si le deck est vide, on recharge
        if (this.decks.answers.length < n) {
            this.decks.answers = this.shuffle([...GAME_DATA.answers]);
        }
        return this.decks.answers.splice(0, n);
    }

    /**
     * Start a new round
     */
    startRound() {
        if (this.roundCount >= this.maxRounds) {
            return this.renderEndGame();
        }

        this.roundCount++;
        this.pot = [];
        const master = this.players[this.masterIndex];

        this.renderTransition(
            `Tour du Maître : ${master.name}`,
            "Les autres, ne regardez pas !",
            () => this.renderMasterPick()
        );
    }

    /**
     * Phase 2: Master Picks a Question
     */
    renderMasterPick() {
        const options = this.decks.questions.splice(0, 2);

        // Safety check if questions run out
        if (options.length === 0) {
            this.decks.questions = this.shuffle([...GAME_DATA.questions]);
            options.push(...this.decks.questions.splice(0, 2));
        }

        const cardsHtml = options.map((q, idx) => `<div class="card blue" data-idx="${idx}"> ${q} </div>`).join('');

        this.app.innerHTML = `<div class="screen"> <h2>${this.players[this.masterIndex].name}, choisis une carte :</h2> <div class="card-grid"> ${cardsHtml} </div> </div>`;

        const cards = this.app.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const selectedQ = options[card.dataset.idx];
                this.currentQuestion = selectedQ;
                this.startPlayerTurns();
            });
        });
    }

    startPlayerTurns() {
        const responders = this.players.filter((_, idx) => idx !== this.masterIndex);
        this.handleNextResponder(responders, 0);
    }

    handleNextResponder(responders, idx) {
        if (idx >= responders.length) {
            return this.renderTransition(
                `Le Maître ${this.players[this.masterIndex].name} récupère l'appareil`,
                "Prêt pour le verdict ?",
                () => this.renderVerdict()
            );
        }

        const player = responders[idx];
        this.renderTransition(
            `Passe l'appareil à ${player.name}`,
            "C'est à toi de jouer !",
            () => this.renderPlayerPick(player, () => {
                this.handleNextResponder(responders, idx + 1);
            })
        );
    }

    /**
     * Phase 3: Player Selects Answers
     */
    renderPlayerPick(player, onComplete) {
        // --- LOGIQUE MODE BAC À SABLE ---
        if (this.gameMode === 'sandbox') {
            player.hand = this.drawCards(5);
        }

        const needed = this.countBlanks(this.currentQuestion);
        let selectedIndices = [];

        const renderHand = () => {
            const handHtml = player.hand.map((cardText, i) => {
                const isSelected = selectedIndices.includes(i);
                const selectOrder = selectedIndices.indexOf(i) + 1;
                return `<div class="card ${isSelected ? 'selected' : ''}" data-idx="${i}"> ${isSelected ? `<div class="selection-badge">${selectOrder}</div>` : ''} ${cardText} </div>`;
            }).join('');

            this.app.innerHTML = `
            <div class="screen">
                ${this.gameMode === 'sandbox' ? '<p style="color:#e67e22; font-weight:bold;">Mode Bac à Sable : Main renouvelée !</p>' : ''}
                <div class="card blue" style="margin-bottom: 20px; min-height: 100px;">${this.currentQuestion}</div>
                <p>Choisis ${needed} carte(s)</p>
                <div class="card-grid">
                    ${handHtml}
                </div>
                ${selectedIndices.length === needed ? `<button class="btn" id="confirm-btn">Valider</button>` : ''}
            </div>`;

            this.app.querySelectorAll('.card.blue ~ .card-grid .card').forEach(card => {
                card.addEventListener('click', () => {
                    const cardIdx = parseInt(card.dataset.idx);
                    if (selectedIndices.includes(cardIdx)) {
                        selectedIndices = selectedIndices.filter(id => id !== cardIdx);
                    } else {
                        if (selectedIndices.length < needed) {
                            selectedIndices.push(cardIdx);
                        }
                    }
                    renderHand();
                });
            });

            const btn = document.getElementById('confirm-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    const selectedCards = selectedIndices.map(i => player.hand[i]);

                    // Retrait des cartes jouées
                    selectedIndices.sort((a, b) => b - a).forEach(i => {
                        player.hand.splice(i, 1);
                    });

                    // Repioche logic
                    if (this.gameMode === 'standard') {
                        const newCards = this.drawCards(needed);
                        player.hand.push(...newCards);
                    } else {
                        const newCards = this.drawCards(needed);
                        player.hand.push(...newCards);
                    }

                    this.pot.push({
                        playerId: player.id,
                        cards: selectedCards
                    });

                    onComplete();
                });
            }
        };

        renderHand();
    }

    /**
     * Phase 4: The Verdict
     */
    renderVerdict() {
        const shuffledPot = this.shuffle([...this.pot]);

        const cardsHtml = shuffledPot.map((entry, idx) => {
            // --- MODIFICATION ICI : Suppression des BR et utilisation de Flexbox ---
            
            // On créé un bloc DIV pour chaque réponse
            const answersContent = entry.cards.map((text, i) => {
                // Petit séparateur visuel (border-bottom) sauf pour le dernier
                const borderStyle = (i < entry.cards.length - 1) ? 'border-bottom: 1px dashed #ccc;' : '';
                
                // Style: prend tout l'espace disponible (flex: 1), centre le texte, cache le débordement
                return `<div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 5px; box-sizing: border-box; overflow: hidden; ${borderStyle}">${text}</div>`;
            }).join(''); 

            return `
            <div class="flip-container" data-idx="${idx}"> 
                <div class="flip-inner"> 
                    <div class="flip-front"></div> 
                    <!-- Le conteneur arrière devient une Flex Column pour gérer la hauteur -->
                    <div class="flip-back" style="display: flex; flex-direction: column; justify-content: space-evenly; height: 100%;">
                        ${answersContent}
                    </div> 
                </div> 
            </div>`;
        }).join('');

        this.app.innerHTML = `
        <div class="screen"> 
            <div class="card blue" style="margin-bottom:20px; min-height:120px">${this.currentQuestion}</div> 
            <p>Retourne les cartes et choisis le vainqueur !</p> 
            <div class="card-grid"> ${cardsHtml} </div> 
            <div id="winner-action" style="margin-top:20px; display:none;"> 
                <p>Choisis la meilleure carte ci-dessus puis :</p> 
                <button class="btn" id="valid-winner">Confirmer ce choix</button> 
            </div> 
        </div>`;

        let selectedEntryIndex = null;
        const containers = this.app.querySelectorAll('.flip-container');

        containers.forEach(container => {
            container.addEventListener('click', (e) => {
                container.classList.add('flipped');
                containers.forEach(c => c.style.border = 'none');
                container.style.border = '4px solid black';
                selectedEntryIndex = parseInt(container.dataset.idx);
                document.getElementById('winner-action').style.display = 'block';
            });
        });

        document.getElementById('valid-winner').addEventListener('click', () => {
            if (selectedEntryIndex !== null) {
                const winnerEntry = shuffledPot[selectedEntryIndex];
                this.handleRoundWin(winnerEntry.playerId);
            }
        });
    }

    handleRoundWin(playerId) {
        const winner = this.players.find(p => p.id === playerId);
        winner.score++;

        this.app.innerHTML = `
        <div class="screen">
            <h1>${winner.name} gagne la manche !</h1>
            <p>+1 point</p>
            ${this.renderScoreTable()}
            <button class="btn" id="next-round">Manche Suivante</button>
        </div>`;

        document.getElementById('next-round').addEventListener('click', () => {
            this.masterIndex = (this.masterIndex + 1) % this.players.length;
            this.startRound();
        });
    }

    renderScoreTable() {
        const rows = this.players
            .sort((a, b) => b.score - a.score)
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pts</td></tr>`)
            .join('');

        return `
        <table class="score-table">
            <tr><th>Joueur</th><th>Score</th></tr>
            ${rows}
        </table>`;
    }

    renderTransition(title, subtitle, callback) {
        this.app.innerHTML = `<div class="screen"> <h1 style="margin-bottom:10px">${title}</h1> <p style="margin-bottom:30px">${subtitle}</p> <button class="btn">J'y suis</button> </div>`;
        this.app.querySelector('.btn').addEventListener('click', callback);
    }

    renderEndGame() {
        const winner = this.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);

        this.app.innerHTML = `
        <div class="screen">
            <h1>Partie Terminée !</h1>
            <h2>Le grand vainqueur est <br><span style="color:var(--text-main); font-size:2rem">${winner.name}</span></h2>
            ${this.renderScoreTable()}
            <button class="btn" onclick="location.reload()">Rejouer</button>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});