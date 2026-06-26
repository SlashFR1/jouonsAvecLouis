// Multiplayer Classe moi ça (Top Ten) game logic

class ClasseMoiCaMultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.sortableInstance = null;

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Classe moi ça 📲");

        // Injecter le selecteur de mode (classique vs extrême) pour l'hôte
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

        // Ecouter les évènements de jeu
        LousticMultiplayer.onEvent((event, payload) => {
            if (event === 'state_updated') {
                this.handleStateUpdate(payload);
            }
            if (LousticMultiplayer.isHost) {
                this.handleHostEvents(event, payload);
            }
        });

        // Démarrage par l'hôte
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
            players: players,
            scores: 0, // Score global (coopératif)
            currentRound: 1,
            maxRounds: Math.min(5, players.length), // Autant de manches que de joueurs, max 5
            captainIndex: 0,
            theme: "",
            themeChoices: {},
            responses: [],
            roundScore: 0,
            resultHtml: ""
        };

        this.hostStartRound();
    }

    hostStartRound() {
        // Selectionner 2 themes aléatoires
        let pool = (this.gameState.mode === 'extreme') ? [...hotThemes] : [...themes];
        this.shuffle(pool);

        const t1 = pool[0];
        const t2 = pool[1];

        this.gameState.phase = "theme_selection";
        this.gameState.themeChoices = {
            A: t1.themeA,
            B: t2.themeB || t2.themeA // Parfois themeB est vide
        };
        this.gameState.theme = "";
        this.gameState.responses = [];
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        const captainName = this.gameState.players[this.gameState.captainIndex].name;
        
        if (event === 'theme_selected') {
            this.gameState.theme = payload.theme;
            
            // Attribuer des numéros secrets 1-10 aléatoires aux joueurs
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.shuffle(numbers);

            this.gameState.responses = [];
            this.gameState.players.forEach(p => {
                if (p.name !== captainName) {
                    this.gameState.responses.push({
                        playerName: p.name,
                        number: numbers.pop(),
                        response: ""
                    });
                }
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

            // Vérifier si toutes les réponses sont là
            const allSubmitted = this.gameState.responses.every(r => r.response !== "");
            if (allSubmitted) {
                // Mélanger l'ordre des réponses pour l'anonymat
                this.gameState.responses = this.shuffle([...this.gameState.responses]);
                this.gameState.phase = "sort_responses";
            }
            this.broadcastState();
        }
        else if (event === 'captain_order_submitted') {
            this.computeScores(payload.orderedNames);
        }
        else if (event === 'next_round_requested') {
            if (this.gameState.currentRound >= this.gameState.maxRounds) {
                this.gameState.phase = "game_over";
                this.broadcastState();
            } else {
                this.gameState.currentRound++;
                this.gameState.captainIndex = (this.gameState.captainIndex + 1) % this.gameState.players.length;
                this.hostStartRound();
            }
        }
    }

    computeScores(orderedNames) {
        // Classer par ordre croissant du numéro réel pour la solution
        const correctOrder = [...this.gameState.responses].sort((a, b) => a.number - b.number);
        
        let roundScore = 0;
        let html = `<div class="result-column"><h3>Ordre du CAP'TEN</h3><ul class="result-list">`;

        // Reconstruire l'ordre placé par le capitaine
        const placedResponses = orderedNames.map(name => 
            this.gameState.responses.find(r => r.playerName === name)
        );

        placedResponses.forEach((res, index) => {
            const correctRes = correctOrder[index];
            const isCorrect = (res.number === correctRes.number);
            if (isCorrect) roundScore++;

            html += `
                <li class="result-item ${isCorrect ? 'correct' : 'incorrect'}" style="background:${isCorrect ? '#e3f2fd' : '#ffebee'}; border:2px solid black; padding:10px; margin:5px 0; border-radius:8px; display:flex; align-items:center; gap:10px; font-weight:bold;">
                    <span class="badge" style="background:${isCorrect ? '#4cd137' : '#e84118'}; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">${res.number}</span> 
                    <strong>${res.playerName}</strong>: ${res.response}
                </li>`;
        });
        html += `</ul></div>`;

        html += `<div class="result-column" style="margin-top:20px;"><h3>Solution Parfaite</h3><ul class="result-list">`;
        correctOrder.forEach(res => {
            html += `
                <li class="result-item correct" style="background:#e8f5e9; border:2px solid black; padding:10px; margin:5px 0; border-radius:8px; display:flex; align-items:center; gap:10px; font-weight:bold;">
                    <span class="badge" style="background:#4cd137; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">${res.number}</span> 
                    <strong>${res.playerName}</strong>: ${res.response}
                </li>`;
        });
        html += `</ul></div>`;

        this.gameState.roundScore = roundScore;
        this.gameState.scores += roundScore;
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
        const myName = LousticMultiplayer.username;
        const captain = this.gameState.players[this.gameState.captainIndex];
        const isCaptain = (captain.name === myName);

        // Masquer le lobby, afficher l'aire de jeu
        document.getElementById('app').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');

        // Gérer les affichages d'écrans
        this.hideAllScreens();

        switch (state.phase) {
            case "theme_selection":
                this.renderThemeSelection(isCaptain, captain.name);
                break;
            case "write_responses":
                this.renderWriteResponses(isCaptain, captain.name);
                break;
            case "sort_responses":
                this.renderSortResponses(isCaptain, captain.name);
                break;
            case "results":
                this.renderResults(isCaptain, captain.name);
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
    renderThemeSelection(isCaptain, captainName) {
        if (isCaptain) {
            document.getElementById('theme-screen').classList.add('active');
            
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
            document.getElementById('wait-captain-name').textContent = `Le Capitaine ${captainName}`;
        }
    }

    // Vue 2 : Rédaction des réponses
    renderWriteResponses(isCaptain, captainName) {
        const myName = LousticMultiplayer.username;

        if (isCaptain) {
            const screen = document.getElementById('wait-responses-screen');
            screen.classList.add('active');
            
            document.getElementById('wait-responses-theme').textContent = this.gameState.theme;
            
            const count = this.gameState.responses.filter(r => r.response !== "").length;
            const total = this.gameState.responses.length;
            document.getElementById('response-counter').textContent = `Réponses reçues : ${count} / ${total}`;
        } else {
            const myRes = this.gameState.responses.find(r => r.playerName === myName);
            
            if (myRes && myRes.response !== "") {
                // Déjà répondu
                const screen = document.getElementById('wait-responses-screen');
                screen.classList.add('active');
                
                document.getElementById('wait-responses-theme').textContent = this.gameState.theme;
                
                const count = this.gameState.responses.filter(r => r.response !== "").length;
                const total = this.gameState.responses.length;
                document.getElementById('response-counter').textContent = `Réponses : ${count} / ${total}`;
            } else {
                // Doit répondre
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
    }

    // Vue 3 : Tri du capitaine
    renderSortResponses(isCaptain, captainName) {
        if (isCaptain) {
            document.getElementById('captain-screen').classList.add('active');

            const listDiv = document.getElementById('sortable-responses');
            listDiv.innerHTML = this.gameState.responses.map(res => `
                <div class="sortable-item" data-player-name="${res.playerName}">
                    <p style="margin:0;">${res.response}</p>
                </div>
            `).join('');

            // Initialiser Sortable
            if (this.sortableInstance) this.sortableInstance.destroy();
            this.sortableInstance = new Sortable(listDiv, {
                animation: 150,
                ghostClass: 'blue-background-class'
            });

            document.getElementById('submit-order-btn').onclick = () => {
                const items = listDiv.querySelectorAll('.sortable-item');
                const orderedNames = Array.from(items).map(item => item.dataset.playerName);
                
                LousticMultiplayer.send('captain_order_submitted', {
                    orderedNames: orderedNames
                });
            };
        } else {
            const screen = document.getElementById('wait-responses-screen');
            screen.classList.add('active');
            document.getElementById('wait-responses-theme').textContent = this.gameState.theme;
            document.getElementById('response-counter').textContent = `Le Capitaine ${captainName} trie les réponses !`;
        }
    }

    // Vue 4 : Résultats manche
    renderResults(isCaptain, captainName) {
        document.getElementById('round-result-screen').classList.add('active');

        const playersCount = this.gameState.players.length - 1;
        document.getElementById('round-score').textContent = `${this.gameState.roundScore} / ${playersCount}`;
        document.getElementById('total-score-display').textContent = this.gameState.scores;
        document.getElementById('result-comparison').innerHTML = this.gameState.resultHtml;

        const nextBtn = document.getElementById('next-round-btn');
        
        // Supprimer message d'attente precedent si présent
        const oldMsg = document.getElementById('results-wait-msg');
        if (oldMsg) oldMsg.remove();

        if (isCaptain) {
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
            waitMsg.textContent = `En attente du Capitaine ${captainName} pour passer à la suite...`;
            nextBtn.parentNode.appendChild(waitMsg);
        }
    }

    // Vue 5 : Fin de partie
    renderGameOver() {
        document.getElementById('final-screen').classList.add('active');

        document.getElementById('final-total-score').textContent = this.gameState.scores;
        
        // Evaluer la performance
        const maxScore = (this.gameState.players.length - 1) * this.gameState.maxRounds;
        const pct = (this.gameState.scores / maxScore) * 100;
        let msg = "";

        if (pct >= 90) msg = "Incroyable ! Connexion mentale parfaite, vous êtes des génies ! 🧠👑";
        else if (pct >= 70) msg = "Superbe partie ! Le Capitaine a d'excellents instincts. 👍";
        else if (pct >= 50) msg = "Pas mal ! Mais vous pouvez faire mieux. Essayez encore ! 🎯";
        else msg = "Oulah... Il va falloir apprendre à mieux vous connaître ! 😬";

        document.getElementById('final-performance-message').textContent = msg;

        document.getElementById('restart-game-btn').onclick = () => {
            location.reload();
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
