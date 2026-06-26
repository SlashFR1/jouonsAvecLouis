// Multiplayer Limite Prison game implementation

class MultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.myHand = [];
        this.selectedCards = [];

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        // Initialiser la connexion multiplayer avec LousticMultiplayer
        LousticMultiplayer.init("Limite prison 📲");

        // Ecouter les évènements de jeu
        LousticMultiplayer.onEvent((event, payload) => {
            if (event === 'state_updated') {
                this.handleStateUpdate(payload);
            }
            // Si on est l'hôte, on gère les actions des joueurs
            if (LousticMultiplayer.isHost) {
                this.handleHostEvents(event, payload);
            }
        });

        // Callback du lancement
        LousticMultiplayer.onStart((payload) => {
            if (LousticMultiplayer.isHost) {
                this.setupHostGame(payload.players);
            }
        });

        // Bouton Accueil
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                if (confirm("Quitter la partie ?")) {
                    location.href = "../index.html";
                }
            });
        }
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE (SERVEUR DE JEU DÉLÉGUÉ)
    // ==========================================
    
    setupHostGame(players) {
        // Initialisation de la pioche
        this.hostQuestions = this.shuffle([...GAME_DATA.questions]);
        
        this.gameState = {
            phase: "master_picking",
            players: players.map(p => ({ ...p, score: 0 })),
            masterIndex: 0,
            roundNumber: 1,
            maxRounds: players.length * 2,
            currentQuestion: "",
            submissions: [],
            winnerName: "",
            lastWinnerCaption: "",
            questionChoices: []
        };

        this.hostStartRound();
    }

    hostStartRound() {
        // Piocher deux questions pour le maître
        const qOptions = this.hostQuestions.splice(0, 2);
        if (qOptions.length < 2) {
            this.hostQuestions = this.shuffle([...GAME_DATA.questions]);
            qOptions.push(...this.hostQuestions.splice(0, 2 - qOptions.length));
        }

        this.gameState.phase = "master_picking";
        this.gameState.questionChoices = qOptions;
        this.gameState.submissions = [];
        this.gameState.currentQuestion = "";
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        if (event === 'question_selected') {
            this.gameState.currentQuestion = payload.question;
            this.gameState.phase = "players_submitting";
            this.gameState.submissions = [];
            this.broadcastState();
        } 
        else if (event === 'player_submitted') {
            // Ajouter la soumission
            const exists = this.gameState.submissions.some(s => s.playerId === payload.playerId);
            if (!exists) {
                this.gameState.submissions.push({
                    playerId: payload.playerId,
                    playerName: payload.playerName,
                    cards: payload.cards
                });
            }

            // Vérifier si tout le monde (sauf le maître) a soumis
            const respondersCount = this.gameState.players.length - 1;
            if (this.gameState.submissions.length >= respondersCount) {
                // Mélanger pour masquer l'anonymat
                this.gameState.submissions = this.shuffle([...this.gameState.submissions]);
                this.gameState.phase = "master_voting";
                this.broadcastState();
            } else {
                // Mettre à jour pour afficher le compteur de soumissions
                this.broadcastState();
            }
        }
        else if (event === 'winner_selected') {
            const winner = this.gameState.players.find(p => p.id === payload.winnerPlayerId);
            if (winner) {
                winner.score++;
                this.gameState.winnerName = winner.name;
                this.gameState.lastWinnerCaption = payload.caption;
            }
            this.gameState.phase = "round_result";
            this.broadcastState();
        }
        else if (event === 'next_round_requested') {
            if (this.gameState.roundNumber >= this.gameState.maxRounds) {
                this.gameState.phase = "game_over";
                this.broadcastState();
            } else {
                this.gameState.roundNumber++;
                this.gameState.masterIndex = (this.gameState.masterIndex + 1) % this.gameState.players.length;
                this.hostStartRound();
            }
        }
    }

    broadcastState() {
        LousticMultiplayer.send('state_updated', this.gameState);
    }

    // ==========================================
    // RENDER CLIENT-SIDE (POUR TOUS LES JOUEURS)
    // ==========================================

    handleStateUpdate(state) {
        this.gameState = state;
        const master = this.gameState.players[this.gameState.masterIndex];
        const isMaster = (master.name === LousticMultiplayer.username);

        // Initialiser la main si vide
        if (this.myHand.length === 0) {
            this.drawHand(5);
        }

        switch (state.phase) {
            case "master_picking":
                this.renderMasterPicking(isMaster, master.name);
                break;
            case "players_submitting":
                this.renderPlayersSubmitting(isMaster, master.name);
                break;
            case "master_voting":
                this.renderMasterVoting(isMaster, master.name);
                break;
            case "round_result":
                this.renderRoundResult(isMaster);
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    // Vue 1 : Le maître choisit la question
    renderMasterPicking(isMaster, masterName) {
        if (isMaster) {
            const cardsHtml = this.gameState.questionChoices.map((q, idx) => 
                `<div class="card blue cursor-pointer" data-idx="${idx}">${q}</div>`
            ).join('');

            this.app.innerHTML = `
                <div class="screen">
                    <h2>C'est à vous de choisir la question, Maître !</h2>
                    <p>Sélectionnez une carte :</p>
                    <div class="card-grid">${cardsHtml}</div>
                </div>
            `;

            this.app.querySelectorAll('.card').forEach(card => {
                card.addEventListener('click', () => {
                    const selectedQ = this.gameState.questionChoices[card.dataset.idx];
                    LousticMultiplayer.send('question_selected', { question: selectedQ });
                });
            });
        } else {
            this.app.innerHTML = `
                <div class="screen">
                    <h2>Tour ${this.gameState.roundNumber} / ${this.gameState.maxRounds}</h2>
                    <h3 style="color:var(--c-purple);">Maître : ${masterName}</h3>
                    <div class="loader-dots" style="margin: 30px auto;"></div>
                    <p>En attente que le maître choisisse sa question...</p>
                    ${this.renderMiniScoreboard()}
                </div>
            `;
        }
    }

    // Vue 2 : Soumissions des réponses
    renderPlayersSubmitting(isMaster, masterName) {
        const hasSubmitted = this.gameState.submissions.some(s => s.playerName === LousticMultiplayer.username);

        if (isMaster) {
            const count = this.gameState.submissions.length;
            const total = this.gameState.players.length - 1;
            this.app.innerHTML = `
                <div class="screen">
                    <div class="card blue" style="margin-bottom: 25px;">${this.gameState.currentQuestion}</div>
                    <h2>Attente des réponses (${count} / ${total})</h2>
                    <div class="loader-dots" style="margin: 20px auto;"></div>
                    <p>Vos complices choisissent leurs meilleures cartes...</p>
                </div>
            `;
        } else {
            if (hasSubmitted) {
                this.app.innerHTML = `
                    <div class="screen">
                        <h2>Réponse envoyée !</h2>
                        <p>En attente des autres joueurs...</p>
                        <div class="loader-dots" style="margin: 20px auto;"></div>
                    </div>
                `;
            } else {
                const needed = this.countBlanks(this.gameState.currentQuestion) || 1;
                
                const renderHandUI = () => {
                    const handHtml = this.myHand.map((cardText, i) => {
                        const isSelected = this.selectedCards.includes(i);
                        const selectOrder = this.selectedCards.indexOf(i) + 1;
                        return `
                            <div class="card ${isSelected ? 'selected' : ''}" data-idx="${i}" style="cursor:pointer; position:relative;">
                                ${isSelected ? `<div class="selection-badge" style="background:#e84118; color:white; border-radius:50%; width:24px; height:24px; position:absolute; top:5px; right:5px; font-weight:bold; display:flex; align-items:center; justify-content:center;">${selectOrder}</div>` : ''}
                                ${cardText}
                            </div>`;
                    }).join('');

                    this.app.innerHTML = `
                        <div class="screen">
                            <div class="card blue" style="margin-bottom: 20px; min-height: 100px;">${this.gameState.currentQuestion}</div>
                            <p>Choisissez <strong>${needed}</strong> carte(s) :</p>
                            <div class="card-grid">${handHtml}</div>
                            ${this.selectedCards.length === needed ? `<button class="btn" id="confirm-submit-btn" style="width:100%; margin-top:20px; background-color:var(--c-green);">Valider ma réponse</button>` : ''}
                        </div>
                    `;

                    this.app.querySelectorAll('.card:not(.blue)').forEach(card => {
                        card.addEventListener('click', () => {
                            const cardIdx = parseInt(card.dataset.idx);
                            if (this.selectedCards.includes(cardIdx)) {
                                this.selectedCards = this.selectedCards.filter(id => id !== cardIdx);
                            } else {
                                if (this.selectedCards.length < needed) {
                                    this.selectedCards.push(cardIdx);
                                }
                            }
                            renderHandUI();
                        });
                    });

                    const btn = document.getElementById('confirm-submit-btn');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const submittedTexts = this.selectedCards.map(i => this.myHand[i]);
                            
                            // Envoyer la soumission
                            LousticMultiplayer.send('player_submitted', {
                                playerId: LousticMultiplayer.getPlayerId(),
                                playerName: LousticMultiplayer.username,
                                cards: submittedTexts
                            });

                            // Retirer les cartes jouées de sa main
                            this.selectedCards.sort((a, b) => b - a).forEach(i => {
                                this.myHand.splice(i, 1);
                            });

                            // Piocher de nouvelles cartes
                            this.drawHand(needed);
                            this.selectedCards = [];

                            // Render attente
                            this.app.innerHTML = `
                                <div class="screen">
                                    <h2>Réponse envoyée !</h2>
                                    <p>En attente des autres joueurs...</p>
                                    <div class="loader-dots" style="margin: 20px auto;"></div>
                                </div>`;
                        });
                    }
                };

                renderHandUI();
            }
        }
    }

    // Vue 3 : Vote du maître
    renderMasterVoting(isMaster, masterName) {
        if (isMaster) {
            const cardsHtml = this.gameState.submissions.map((sub, idx) => {
                const text = sub.cards.join(' / ');
                return `
                    <div class="flip-container" data-idx="${idx}" style="cursor:pointer;"> 
                        <div class="flip-inner"> 
                            <div class="flip-front"></div> 
                            <div class="flip-back" style="display:flex; align-items:center; justify-content:center; padding:15px; box-sizing:border-box; height:100%; font-weight:bold;">
                                ${text}
                            </div> 
                        </div> 
                    </div>`;
            }).join('');

            this.app.innerHTML = `
                <div class="screen"> 
                    <div class="card blue" style="margin-bottom:20px; min-height:100px">${this.gameState.currentQuestion}</div> 
                    <h2>Retournez les cartes et choisissez le vainqueur !</h2> 
                    <div class="card-grid">${cardsHtml}</div> 
                    <div id="winner-action" style="margin-top:20px; display:none;"> 
                        <button class="btn" id="valid-winner-btn" style="width:100%; background-color:var(--c-green);">Confirmer le vainqueur</button> 
                    </div> 
                </div>`;

            let selectedIdx = null;
            const containers = this.app.querySelectorAll('.flip-container');

            containers.forEach(container => {
                container.addEventListener('click', () => {
                    container.classList.add('flipped');
                    containers.forEach(c => c.style.border = 'none');
                    container.style.border = '4px solid black';
                    selectedIdx = parseInt(container.dataset.idx);
                    document.getElementById('winner-action').style.display = 'block';
                });
            });

            document.getElementById('valid-winner-btn').addEventListener('click', () => {
                if (selectedIdx !== null) {
                    const winnerEntry = this.gameState.submissions[selectedIdx];
                    LousticMultiplayer.send('winner_selected', {
                        winnerPlayerId: winnerEntry.playerId,
                        caption: winnerEntry.cards.join(' / ')
                    });
                }
            });
        } else {
            this.app.innerHTML = `
                <div class="screen">
                    <div class="card blue" style="margin-bottom: 25px;">${this.gameState.currentQuestion}</div>
                    <h2>Le Maître délibère...</h2>
                    <div class="loader-dots" style="margin: 20px auto;"></div>
                    <p>Le maître examine et lit vos cartes de cellule.</p>
                </div>
            `;
        }
    }

    // Vue 4 : Résultat de la manche
    renderRoundResult(isMaster) {
        const rows = [...this.gameState.players]
            .sort((a, b) => b.score - a.score)
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pts</td></tr>`)
            .join('');

        this.app.innerHTML = `
            <div class="screen">
                <h1 style="color:var(--c-green); font-size:2.5rem;">🎉 ${this.gameState.winnerName} gagne la manche !</h1>
                <div class="card" style="background:#fff; color:#000; margin:20px auto; padding:15px; font-weight:bold; font-size:1.2rem; max-width:400px; border:3px solid #000; box-shadow:4px 4px 0 #000;">
                    "${this.gameState.lastWinnerCaption}"
                </div>
                
                <h3>Scores actuels :</h3>
                <table class="score-table" style="width:100%; margin:20px 0; border-collapse:collapse;">
                    ${rows}
                </table>

                ${isMaster ? `<button class="btn" id="next-round-btn" style="width:100%; background-color:var(--c-red);">Manche Suivante ➡️</button>` : `<p style="font-style:italic; color:#57606f;">En attente du maître pour la manche suivante...</p>`}
            </div>
        `;

        const btn = document.getElementById('next-round-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                LousticMultiplayer.send('next_round_requested');
            });
        }
    }

    // Vue 5 : Fin du jeu
    renderGameOver() {
        const sorted = [...this.gameState.players].sort((a, b) => b.score - a.score);
        const grandWinner = sorted[0];

        const rows = sorted
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pts</td></tr>`)
            .join('');

        this.app.innerHTML = `
            <div class="screen">
                <h1>Partie Terminée !</h1>
                <h2 style="color:var(--c-red);">Le grand vainqueur est <br><span style="font-size:2.2rem;">🏆 ${grandWinner.name} 🏆</span></h2>
                
                <table class="score-table" style="width:100%; margin:25px 0;">
                    ${rows}
                </table>
                
                <button class="btn" onclick="location.reload()" style="width:100%;">Retour au Lobby 🎮</button>
            </div>
        `;
    }

    // Helpers
    drawHand(n) {
        // Remplir la main du joueur avec des cartes aléatoires issues de son propre deck local
        const answers = GAME_DATA.answers;
        for (let i = 0; i < n; i++) {
            const randomCard = answers[Math.floor(Math.random() * answers.length)];
            this.myHand.push(randomCard);
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    countBlanks(text) {
        const matches = text.match(/___/g);
        return matches ? matches.length : 1;
    }

    renderMiniScoreboard() {
        const list = this.gameState.players.map(p => `<div><strong>${p.name}</strong>: ${p.score} pts</div>`).join('');
        return `<div style="margin-top:20px; font-size:0.9rem; padding:10px; background:rgba(255,255,255,0.2); border-radius:10px;">${list}</div>`;
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', () => {
    const game = new MultiplayerGame();
    game.init();
});
