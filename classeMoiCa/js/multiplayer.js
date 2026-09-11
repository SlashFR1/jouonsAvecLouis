// Multiplayer Classe moi ça (Top Ten) - Simultané Compétitif

class ClasseMoiCaMultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.sortableInstance = null;
        this.myOrder = [];

        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Classe moi ça 📲");

        LousticMultiplayer.onPlayersChange(() => {
            if (LousticMultiplayer.isHost && !document.getElementById('mode-toggle-wrapper')) {
                const hostControls = document.getElementById('host-controls');
                if (hostControls) {
                    const wrapper = document.createElement('div');
                    wrapper.id = 'mode-toggle-wrapper';
                    wrapper.className = 'mode-toggle-container';
                    wrapper.style.marginBottom = '15px';
                    wrapper.innerHTML = `
                        <button type="button" id="btn-mode-classic" class="mode-toggle-btn active">Classique 🦄</button>
                        <button type="button" id="btn-mode-extreme" class="mode-toggle-btn" style="background:#c0392b; color:white;">EXTRÊME 🌶️</button>
                    `;
                    hostControls.insertBefore(wrapper, hostControls.firstChild);

                    this.selectedMode = 'classic';
                    document.getElementById('btn-mode-classic').addEventListener('click', () => {
                        this.selectedMode = 'classic';
                        document.getElementById('btn-mode-classic').classList.add('active');
                        document.getElementById('btn-mode-extreme').classList.remove('active');
                    });
                    document.getElementById('btn-mode-extreme').addEventListener('click', () => {
                        this.selectedMode = 'extreme';
                        document.getElementById('btn-mode-extreme').classList.add('active');
                        document.getElementById('btn-mode-classic').classList.remove('active');
                    });
                }
            }
        });

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
                const mode = this.selectedMode || 'classic';
                this.setupHostGame(payload.players, mode);
            }
        });
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    setupHostGame(players, mode) {
        this.gameState = {
            mode: mode,
            phase: "theme_selection",
            players: players.map(p => ({ ...p, score: 0 })),
            currentRound: 1,
            maxRounds: 5,
            theme: "",
            themeChoices: {},
            responses: [],
            orders: {}, // orders[playerId] = [name1, name2...]
            resultHtml: ""
        };

        this.hostStartRound();
    }

    hostStartRound() {
        let pool = (this.gameState.mode === 'extreme') ? [...hotThemes] : [...themes];
        this.shuffle(pool);

        const t1 = pool[0];
        const t2 = pool[1];

        this.gameState.phase = "theme_selection";
        this.gameState.themeChoices = {
            A: t1.themeA,
            B: t2.themeB || t2.themeA
        };
        this.gameState.theme = "";
        this.gameState.responses = [];
        this.gameState.orders = {};
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        if (event === 'theme_selected') {
            this.gameState.theme = payload.theme;
            
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.shuffle(numbers);

            this.gameState.responses = [];
            this.gameState.players.forEach(p => {
                this.gameState.responses.push({
                    playerId: p.id,
                    playerName: p.name,
                    number: numbers.pop(),
                    response: ""
                });
            });

            this.gameState.phase = "write_responses";
            this.broadcastState();
        }
        else if (event === 'player_response_submitted') {
            const player = payload._sender;
            const resEntry = this.gameState.responses.find(r => r.playerName === player);
            if (resEntry) {
                resEntry.response = payload.response;
            }

            const allSubmitted = this.gameState.responses.every(r => r.response !== "");
            if (allSubmitted) {
                this.gameState.responses = this.shuffle([...this.gameState.responses]);
                this.gameState.phase = "sort_responses";
            }
            this.broadcastState();
        }
        else if (event === 'player_order_submitted') {
            this.gameState.orders[payload.playerId] = payload.orderedNames;

            const allSorted = Object.keys(this.gameState.orders).length === this.gameState.players.length;
            if (allSorted) {
                this.computeScores();
            } else {
                this.broadcastState();
            }
        }
        else if (event === 'next_round_requested') {
            if (this.gameState.currentRound >= this.gameState.maxRounds) {
                this.gameState.phase = "game_over";
                this.broadcastState();
            } else {
                this.gameState.currentRound++;
                this.hostStartRound();
            }
        }
    }

    computeScores() {
        // Solution correcte : tri par nombre croissant
        const correctOrder = [...this.gameState.responses].sort((a, b) => a.number - b.number);
        const correctNames = correctOrder.map(r => r.playerName);

        // Calculer les scores individuels
        this.gameState.players.forEach(p => {
            const playerOrder = this.gameState.orders[p.id] || [];
            let roundScore = 0;
            playerOrder.forEach((name, index) => {
                if (name === correctNames[index]) {
                    roundScore += 1;
                }
            });
            p.score += roundScore;
        });

        // Générer le HTML de la solution
        let html = `<div class="result-column" style="width:100%;"><h3 style="text-align:center;">La Solution Parfaite 🎯</h3><ul class="result-list">`;
        correctOrder.forEach(res => {
            html += `
                <li class="result-item correct" style="background:#e8f5e9; border:2px solid black; padding:10px; margin:5px 0; border-radius:8px; display:flex; align-items:center; gap:10px; font-weight:bold;">
                    <span class="badge" style="background:#4cd137; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">${res.number}</span> 
                    <strong>${res.playerName}</strong>: ${res.response}
                </li>`;
        });
        html += `</ul></div>`;

        this.gameState.resultHtml = html;
        this.gameState.phase = "results";
        this.broadcastState();
    }

    broadcastState() {
        LousticMultiplayer.send('state_updated', this.gameState);
    }

    // ==========================================
    // RENDER CLIENT-SIDE
    // ==========================================

    handleStateUpdate(state) {
        this.gameState = state;

        document.getElementById('app').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');

        this.hideAllScreens();

        switch (state.phase) {
            case "theme_selection":
                this.renderThemeSelection();
                break;
            case "write_responses":
                this.renderWriteResponses();
                break;
            case "sort_responses":
                this.renderSortResponses();
                break;
            case "results":
                this.renderResults();
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    hideAllScreens() {
        const screens = ['theme-screen', 'wait-theme-screen', 'player-turn-screen', 'wait-responses-screen', 'captain-screen', 'round-result-screen', 'final-screen'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active');
        });
    }

    // Vue 1 : Choix du thème
    renderThemeSelection() {
        if (LousticMultiplayer.isHost) {
            document.getElementById('theme-screen').classList.add('active');
            
            document.getElementById('captain-title-theme').textContent = "Choisis le Thème !";
            document.getElementById('theme-a').textContent = this.gameState.themeChoices.A;
            document.getElementById('theme-b').textContent = this.gameState.themeChoices.B;

            document.getElementById('theme-a-card').onclick = () => {
                LousticMultiplayer.send('theme_selected', { theme: this.gameState.themeChoices.A });
            };
            document.getElementById('theme-b-card').onclick = () => {
                LousticMultiplayer.send('theme_selected', { theme: this.gameState.themeChoices.B });
            };
        } else {
            const screen = document.getElementById('wait-theme-screen');
            screen.classList.add('active');
            document.getElementById('wait-captain-name').textContent = "Préparation du round...";
        }
    }

    // Vue 2 : Rédaction des réponses
    renderWriteResponses() {
        const myName = LousticMultiplayer.username;
        const myRes = this.gameState.responses.find(r => r.playerName === myName);
            
        if (myRes && myRes.response !== "") {
            const screen = document.getElementById('wait-responses-screen');
            screen.classList.add('active');
            
            document.getElementById('wait-responses-theme').textContent = this.gameState.theme;
            
            const count = this.gameState.responses.filter(r => r.response !== "").length;
            const total = this.gameState.responses.length;
            document.getElementById('response-counter').textContent = `Réponses reçues : ${count} / ${total}`;
        } else {
            document.getElementById('player-turn-screen').classList.add('active');
            
            document.getElementById('current-theme').textContent = this.gameState.theme;
            document.getElementById('secret-number').textContent = myRes ? myRes.number : "?";

            const submitBtn = document.getElementById('submit-response-btn');
            submitBtn.onclick = () => {
                const text = document.getElementById('player-response-input').value.trim();
                if (!text) return alert("Écris ta réponse d'abord !");
                
                LousticMultiplayer.send('player_response_submitted', {
                    response: text
                });
                document.getElementById('player-response-input').value = "";
            };
        }
    }

    // Vue 3 : Tri par TOUS les joueurs
    renderSortResponses() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasSorted = !!this.gameState.orders[myId];

        if (hasSorted) {
            const screen = document.getElementById('wait-responses-screen');
            screen.classList.add('active');
            document.getElementById('wait-responses-theme').textContent = this.gameState.theme;
            const count = Object.keys(this.gameState.orders).length;
            const total = this.gameState.players.length;
            document.getElementById('response-counter').textContent = `Joueurs ayant trié : ${count} / ${total}`;
        } else {
            document.getElementById('captain-screen').classList.add('active');
            document.querySelector('#captain-screen h2').textContent = "Triez les réponses !";

            const listDiv = document.getElementById('sortable-responses');
            listDiv.innerHTML = this.gameState.responses.map(res => `
                <div class="sortable-item" data-player-name="${res.playerName}">
                    <p style="margin:0;"><strong>${res.playerName}</strong> : ${res.response}</p>
                </div>
            `).join('');

            if (this.sortableInstance) this.sortableInstance.destroy();
            this.sortableInstance = new Sortable(listDiv, {
                animation: 150,
                ghostClass: 'blue-background-class'
            });

            const submitBtn = document.getElementById('submit-order-btn');
            submitBtn.textContent = "Valider mon classement 🏆";
            submitBtn.onclick = () => {
                const items = listDiv.querySelectorAll('.sortable-item');
                const orderedNames = Array.from(items).map(item => item.dataset.playerName);
                
                LousticMultiplayer.send('player_order_submitted', {
                    playerId: myId,
                    orderedNames: orderedNames
                });
            };
        }
    }

    // Vue 4 : Résultats manche
    renderResults() {
        document.getElementById('round-result-screen').classList.add('active');

        // Mettre à jour le header avec les scores de tout le monde
        const myScore = this.gameState.players.find(p => p.id === LousticMultiplayer.getPlayerId())?.score || 0;
        
        document.getElementById('round-score').textContent = `Mon Score : ${myScore}`;
        
        // Afficher les scores de tous
        const scoresHtml = [...this.gameState.players].sort((a,b) => b.score - a.score).map(p => `
            <div style="background:#f1c40f; padding:5px 10px; border-radius:10px; border:2px solid black; font-weight:bold;">
                ${p.name}: ${p.score} pts
            </div>
        `).join('');
        document.getElementById('total-score-display').innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:10px;">${scoresHtml}</div>`;
        
        document.getElementById('result-comparison').innerHTML = this.gameState.resultHtml;

        const nextBtn = document.getElementById('next-round-btn');
        const oldMsg = document.getElementById('results-wait-msg');
        if (oldMsg) oldMsg.remove();

        if (LousticMultiplayer.isHost) {
            nextBtn.classList.remove('hidden');
            nextBtn.onclick = () => {
                LousticMultiplayer.send('next_round_requested');
            };
        } else {
            nextBtn.classList.add('hidden');
            const waitMsg = document.createElement('p');
            waitMsg.id = 'results-wait-msg';
            waitMsg.style.fontStyle = 'italic';
            waitMsg.style.color = '#57606f';
            waitMsg.style.textAlign = 'center';
            waitMsg.style.marginTop = '15px';
            waitMsg.textContent = `En attente de l'hôte pour passer à la suite...`;
            nextBtn.parentNode.appendChild(waitMsg);
        }
    }

    // Vue 5 : Fin de partie
    renderGameOver() {
        document.getElementById('final-screen').classList.add('active');

        const sorted = [...this.gameState.players].sort((a,b) => b.score - a.score);
        const grandWinner = sorted[0];

        document.getElementById('final-total-score').textContent = `${grandWinner.name} gagne avec ${grandWinner.score} pts !`;
        
        const leaderboardHtml = sorted.map(p => `
            <div style="font-size:1.2rem; font-weight:bold; margin:5px 0;">${p.name} : ${p.score} pts</div>
        `).join('');

        document.getElementById('final-performance-message').innerHTML = leaderboardHtml;

        document.getElementById('restart-game-btn').onclick = () => {
            location.href = '../index.html';
        };
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClasseMoiCaMultiplayerGame();
    game.init();
});
