// Multiplayer Alias game logic - Time's Up style

class AliasMultiplayerGame {
    constructor() {
        this.gameState = null;
        this.app = document.getElementById('app');
        this.timerInterval = null;

        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Alias 🗣️");

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
                this.setupHostGame(payload.players);
            }
        });
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    setupHostGame(players) {
        // Mélanger les mots de words.js
        this.deck = this.shuffle([...LISTE_MOTS]);

        this.gameState = {
            phase: "waiting_next",
            players: players.map(p => ({ ...p, score: 0 })),
            describerIndex: 0,
            roundsPlayed: 0,
            maxRounds: players.length * 2, // Tout le monde passe 2 fois
            currentWord: "",
            endTime: 0
        };

        this.startNextTurn();
    }

    startNextTurn() {
        if (this.gameState.roundsPlayed >= this.gameState.maxRounds) {
            this.gameState.phase = "game_over";
            this.broadcastState();
            return;
        }

        this.gameState.currentWord = this.drawWord();
        // 45 secondes + petite marge réseau
        this.gameState.endTime = Date.now() + 45500;
        this.gameState.phase = "playing";
        
        this.broadcastState();

        // L'hôte surveille la fin du temps
        if (this.hostTimer) clearInterval(this.hostTimer);
        this.hostTimer = setInterval(() => {
            if (this.gameState.phase === "playing" && Date.now() >= this.gameState.endTime) {
                this.endTurn();
            }
        }, 1000);
    }

    endTurn() {
        if (this.hostTimer) clearInterval(this.hostTimer);
        this.gameState.roundsPlayed++;
        this.gameState.describerIndex = (this.gameState.describerIndex + 1) % this.gameState.players.length;
        this.gameState.phase = "waiting_next";
        this.broadcastState();

        // 3 secondes de pause, puis on enchaine
        setTimeout(() => {
            if (this.gameState.phase !== "game_over") {
                this.startNextTurn();
            }
        }, 3000);
    }

    drawWord() {
        if (this.deck.length === 0) {
            this.deck = this.shuffle([...LISTE_MOTS]);
        }
        return this.deck.pop();
    }

    handleHostEvents(event, payload) {
        if (event === 'point_awarded') {
            const describer = this.gameState.players[this.gameState.describerIndex];
            
            // Sécurité : seul le describer peut donner le point
            if (payload._sender !== describer.name) return;

            // +1 pour celui qui devine
            const guesser = this.gameState.players.find(p => p.id === payload.guesserId);
            if (guesser) guesser.score++;

            // +1 pour le descripteur
            describer.score++;

            // Nouveau mot
            this.gameState.currentWord = this.drawWord();
            this.broadcastState();
        }
        else if (event === 'skip_word') {
            const describer = this.gameState.players[this.gameState.describerIndex];
            if (payload._sender !== describer.name) return;

            this.gameState.currentWord = this.drawWord();
            this.broadcastState();
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

        document.getElementById('lobby-root').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');

        this.hideAllScreens();

        const describer = this.gameState.players[this.gameState.describerIndex];
        const isMyTurn = (describer.name === LousticMultiplayer.username);

        switch (state.phase) {
            case "waiting_next":
                this.renderWaiting(describer.name);
                break;
            case "playing":
                if (isMyTurn) this.renderDescriber();
                else this.renderWaiting(describer.name, true);
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    hideAllScreens() {
        ['waiting-screen', 'describer-screen', 'game-over-screen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    renderWaiting(describerName, isPlaying = false) {
        const screen = document.getElementById('waiting-screen');
        screen.classList.remove('hidden');

        const title = document.getElementById('current-describer');
        if (isPlaying) {
            title.innerHTML = `${describerName} <br><span style="color:var(--c-red); font-size:0.8em;">(EN COURS) ⏳</span>`;
        } else {
            title.innerHTML = `${describerName} <br><span style="color:var(--c-green); font-size:0.8em;">(PRÉPAREZ-VOUS) 🚀</span>`;
        }

        const lb = document.getElementById('leaderboard-waiting');
        lb.innerHTML = this.gameState.players
            .sort((a,b) => b.score - a.score)
            .map(p => `
                <div style="background:white; border:2px solid black; border-radius:10px; padding:10px; margin:5px 0; font-weight:bold; display:flex; justify-content:space-between;">
                    <span>${p.name}</span>
                    <span style="color:var(--c-purple);">${p.score} pts</span>
                </div>
            `).join('');
    }

    renderDescriber() {
        const screen = document.getElementById('describer-screen');
        screen.classList.remove('hidden');

        // Afficher le mot
        document.getElementById('secret-word').textContent = this.gameState.currentWord;

        // Timer
        const timeDisplay = document.getElementById('timer-value');
        this.updateTimerDisplay(timeDisplay);
        this.timerInterval = setInterval(() => this.updateTimerDisplay(timeDisplay), 500);

        // Boutons pour les autres joueurs
        const container = document.getElementById('player-buttons-container');
        container.innerHTML = "";

        const otherPlayers = this.gameState.players.filter(p => p.name !== LousticMultiplayer.username);
        
        otherPlayers.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'player-score-btn';
            btn.innerHTML = `
                <span>${p.name}</span>
                <span class="score-badge">+1 Point</span>
            `;
            btn.onclick = () => {
                LousticMultiplayer.send('point_awarded', { guesserId: p.id });
            };
            container.appendChild(btn);
        });

        const skipBtn = document.getElementById('skip-word-btn');
        skipBtn.onclick = () => {
            LousticMultiplayer.send('skip_word');
        };
    }

    updateTimerDisplay(el) {
        if (!this.gameState || this.gameState.phase !== "playing") return;
        const left = Math.max(0, Math.ceil((this.gameState.endTime - Date.now()) / 1000));
        el.textContent = left;
        if (left <= 5) el.style.color = "red";
        else el.style.color = "inherit";
    }

    renderGameOver() {
        const screen = document.getElementById('game-over-screen');
        screen.classList.remove('hidden');

        const sorted = [...this.gameState.players].sort((a,b) => b.score - a.score);
        
        document.getElementById('final-leaderboard').innerHTML = sorted.map((p, i) => `
            <div style="background:white; border:3px solid black; border-radius:12px; padding:15px; margin:10px 0; font-weight:bold; font-size:1.2rem; display:flex; justify-content:space-between; box-shadow:3px 3px 0 black; align-items:center;">
                <span>${i===0 ? '👑' : ''} ${p.name}</span>
                <span style="color:var(--c-red); font-size:1.5rem;">${p.score} pts</span>
            </div>
        `).join('');

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
    const game = new AliasMultiplayerGame();
    game.init();
});
