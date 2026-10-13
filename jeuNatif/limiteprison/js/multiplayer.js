// Multiplayer Limite Prison game implementation (Simultané)

class MultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.myHand = [];
        this.selectedCards = [];
        this.mySubmissionId = null;

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Limite prison 📲");

        LousticMultiplayer.onEvent((event, payload) => {
            if (event === 'state_updated') {
                this.handleStateUpdate(payload);
            }
            if (LousticMultiplayer.isHost) {
                this.handleHostEvents(event, payload);
            }
        });

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
    // LOGIQUE DE L'HÔTE
    // ==========================================
    
    setupHostGame(players) {
        this.hostQuestions = this.shuffle([...GAME_DATA.questions]);
        
        this.gameState = {
            phase: "players_submitting",
            players: players.map(p => ({ ...p, score: 0 })),
            roundNumber: 1,
            maxRounds: players.length * 2,
            currentQuestion: "",
            submissions: [],
            votes: [],
            roundWinners: []
        };

        this.hostStartRound();
    }

    hostStartRound() {
        if (this.hostQuestions.length === 0) {
            this.hostQuestions = this.shuffle([...GAME_DATA.questions]);
        }
        
        this.gameState.currentQuestion = this.hostQuestions.pop();
        this.gameState.submissions = [];
        this.gameState.votes = [];
        this.gameState.phase = "players_submitting";
        this.gameState.roundWinners = [];
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        if (event === 'player_submitted') {
            const exists = this.gameState.submissions.some(s => s.playerId === payload.playerId);
            if (!exists) {
                this.gameState.submissions.push({
                    id: Math.random().toString(36).substring(2, 9),
                    playerId: payload.playerId,
                    playerName: payload.playerName,
                    cards: payload.cards,
                    votes: 0
                });
            }

            if (this.gameState.submissions.length >= this.gameState.players.length) {
                // Mélanger pour l'anonymat
                this.gameState.submissions = this.shuffle([...this.gameState.submissions]);
                this.gameState.phase = "voting";
            }
            this.broadcastState();
        }
        else if (event === 'player_voted') {
            const hasVoted = this.gameState.votes.some(v => v.playerId === payload.playerId);
            if (!hasVoted) {
                this.gameState.votes.push({
                    playerId: payload.playerId,
                    submissionId: payload.submissionId
                });

                const sub = this.gameState.submissions.find(s => s.id === payload.submissionId);
                if (sub) sub.votes++;
            }

            if (this.gameState.votes.length >= this.gameState.players.length) {
                let maxVotes = 0;
                this.gameState.submissions.forEach(s => {
                    if (s.votes > maxVotes) maxVotes = s.votes;
                });

                const winningSubs = this.gameState.submissions.filter(s => s.votes === maxVotes);
                this.gameState.roundWinners = winningSubs;

                winningSubs.forEach(wSub => {
                    const player = this.gameState.players.find(p => p.id === wSub.playerId);
                    if (player) player.score++;
                });

                this.gameState.phase = "round_result";
            }
            this.broadcastState();
        }
        else if (event === 'next_round_requested') {
            if (this.gameState.roundNumber >= this.gameState.maxRounds) {
                this.gameState.phase = "game_over";
                this.broadcastState();
            } else {
                this.gameState.roundNumber++;
                this.hostStartRound();
            }
        }
    }

    broadcastState() {
        LousticMultiplayer.send('state_updated', this.gameState);
    }

    // ==========================================
    // RENDER CLIENT-SIDE
    // ==========================================

    handleStateUpdate(state) {
        this.gameState = state;
        const myId = LousticMultiplayer.getPlayerId();

        const mySub = state.submissions.find(s => s.playerId === myId);
        if (mySub) this.mySubmissionId = mySub.id;

        if (this.myHand.length === 0) {
            this.drawHand(5);
        }

        switch (state.phase) {
            case "players_submitting":
                this.renderPlayersSubmitting();
                break;
            case "voting":
                this.renderVoting();
                break;
            case "round_result":
                this.renderRoundResult();
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    // Vue 1 : Soumissions
    renderPlayersSubmitting() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasSubmitted = this.gameState.submissions.some(s => s.playerId === myId);

        if (hasSubmitted) {
            const count = this.gameState.submissions.length;
            const total = this.gameState.players.length;
            this.app.innerHTML = `
                <div class="screen">
                    <div class="card blue" style="margin-bottom: 25px;">${this.gameState.currentQuestion}</div>
                    <h2>Réponse envoyée !</h2>
                    <p>En attente des autres joueurs... (${count} / ${total})</p>
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
                        <h2>Round ${this.gameState.roundNumber}</h2>
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
                        
                        LousticMultiplayer.send('player_submitted', {
                            playerId: myId,
                            playerName: LousticMultiplayer.username,
                            cards: submittedTexts
                        });

                        this.selectedCards.sort((a, b) => b - a).forEach(i => {
                            this.myHand.splice(i, 1);
                        });

                        this.drawHand(needed);
                        this.selectedCards = [];
                    });
                }
            };

            renderHandUI();
        }
    }

    // Vue 2 : Vote
    renderVoting() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasVoted = this.gameState.votes.some(v => v.playerId === myId);

        if (hasVoted) {
            const count = this.gameState.votes.length;
            const total = this.gameState.players.length;
            this.app.innerHTML = `
                <div class="screen">
                    <div class="card blue" style="margin-bottom: 25px;">${this.gameState.currentQuestion}</div>
                    <h2>A voté !</h2>
                    <p>En attente des autres votes... (${count} / ${total})</p>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
        } else {
            const cardsHtml = this.gameState.submissions.map((sub) => {
                const text = sub.cards.join(' / ');
                const isMine = (sub.id === this.mySubmissionId);
                return `
                    <div class="flip-container ${isMine ? 'disabled-card' : ''}" data-id="${sub.id}" style="cursor:pointer; ${isMine ? 'opacity:0.5;' : ''}"> 
                        <div class="flip-inner"> 
                            <div class="flip-front"></div> 
                            <div class="flip-back" style="display:flex; align-items:center; justify-content:center; padding:15px; box-sizing:border-box; height:100%; font-weight:bold; flex-direction:column;">
                                ${text}
                                ${isMine ? '<br><small style="color:#d63031; margin-top:10px;">(Tes cartes)</small>' : ''}
                            </div> 
                        </div> 
                    </div>`;
            }).join('');

            this.app.innerHTML = `
                <div class="screen"> 
                    <h2>Votez pour les meilleures cartes !</h2>
                    <div class="card blue" style="margin-bottom:20px; min-height:100px">${this.gameState.currentQuestion}</div> 
                    <p style="font-weight:bold;">Retournez les cartes et choisissez un gagnant :</p>
                    <div class="card-grid">${cardsHtml}</div> 
                    <div id="winner-action" style="margin-top:20px; display:none;"> 
                        <button class="btn" id="valid-winner-btn" style="width:100%; background-color:var(--c-green);">Voter pour ces cartes 🏆</button> 
                    </div> 
                </div>`;

            let selectedSubId = null;
            const containers = this.app.querySelectorAll('.flip-container:not(.disabled-card)');
            const confirmBtn = document.getElementById('valid-winner-btn');

            containers.forEach(container => {
                container.addEventListener('click', () => {
                    container.classList.add('flipped');
                    containers.forEach(c => c.style.border = 'none');
                    container.style.border = '4px solid #e84118';
                    container.style.borderRadius = '14px';
                    selectedSubId = container.dataset.id;
                    document.getElementById('winner-action').style.display = 'block';
                });
            });

            // Gérer aussi le retournement visuel de sa propre carte (sans la sélectionner)
            this.app.querySelectorAll('.disabled-card').forEach(c => {
                c.addEventListener('click', () => c.classList.add('flipped'));
            });

            confirmBtn.onclick = () => {
                if (!selectedSubId) return alert("Sélectionnez une réponse !");
                LousticMultiplayer.send('player_voted', {
                    playerId: myId,
                    submissionId: selectedSubId
                });
            };
        }
    }

    // Vue 3 : Résultat de la manche
    renderRoundResult() {
        const rows = [...this.gameState.players]
            .sort((a, b) => b.score - a.score)
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pts</td></tr>`)
            .join('');

        const winnersHTML = this.gameState.roundWinners.map(w => `
            <div class="card" style="background:#fff; color:#000; margin:10px auto; padding:15px; font-weight:bold; font-size:1.2rem; border:3px solid #000; box-shadow:4px 4px 0 #000;">
                <h3 style="color:var(--c-red); margin:0 0 10px 0;">${w.playerName}</h3>
                "${w.cards.join(' / ')}"
                <br><small style="color:#57606f; font-weight:normal; font-size:0.9rem;">${w.votes} vote(s)</small>
            </div>
        `).join('');

        this.app.innerHTML = `
            <div class="screen">
                <h1 style="color:var(--c-green);">🏆 Vainqueur(s) !</h1>
                
                <div class="card blue" style="margin-bottom: 20px;">${this.gameState.currentQuestion}</div>
                
                ${winnersHTML}
                
                <h3 style="margin-top:25px;">Scores actuels :</h3>
                <table class="score-table" style="width:100%; margin:10px 0 20px 0; border-collapse:collapse;">
                    ${rows}
                </table>

                ${LousticMultiplayer.isHost ? `<button class="btn" id="next-round-btn" style="width:100%; background-color:var(--c-red);">Manche Suivante ➡️</button>` : `<p style="font-style:italic; color:#57606f;">En attente de l'hôte pour la manche suivante...</p>`}
            </div>
        `;

        if (LousticMultiplayer.isHost) {
            document.getElementById('next-round-btn').onclick = () => {
                LousticMultiplayer.send('next_round_requested');
            };
        }
    }

    // Vue 4 : Fin du jeu
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
                
                <button class="btn" onclick="location.href='../index.html'" style="width:100%;">Retour au Lobby 🎮</button>
            </div>
        `;
    }

    // Helpers
    drawHand(n) {
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
}

// Lancement
document.addEventListener('DOMContentLoaded', () => {
    const game = new MultiplayerGame();
    game.init();
});
