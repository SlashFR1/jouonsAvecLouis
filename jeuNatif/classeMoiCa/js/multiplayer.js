// Classe moi ça - Multi-téléphones (Supabase Realtime)
// Fidèle aux règles coopératives (Top Ten) et inspiré de l'architecture d'Alias, Mess Meme & Galerie

class ClasseMoiCaMultiplayerGame {
    constructor() {
        this.gameState = null;
        this.selectedMode = 'standard';
        this.sortableInstance = null;
        this.app = document.getElementById('app');

        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        // Initialiser LousticMultiplayer
        LousticMultiplayer.init("Classe moi ça 🔟");

        // Injecter le sélecteur de mode (Classique / HOT) dans le panneau de l'hôte
        LousticMultiplayer.onPlayersChange(() => {
            this.injectHostModeSelector();
        });

        // Écouter les événements de jeu
        LousticMultiplayer.onEvent((event, payload) => {
            if (event === 'state_updated') {
                this.handleStateUpdate(payload);
            }
            if (LousticMultiplayer.isHost) {
                this.handleHostEvents(event, payload);
            }
        });

        // Démarrage de la partie par l'hôte
        LousticMultiplayer.onStart((payload) => {
            if (LousticMultiplayer.isHost) {
                this.setupHostGame(payload.players);
            }
        });

        this.bindDOMEvents();
    }

    // ==========================================
    // INJECTION DU SÉLECTEUR DE MODE DANS LE LOBBY
    // ==========================================

    injectHostModeSelector() {
        if (!LousticMultiplayer.isHost) return;
        const hostControls = document.getElementById('host-controls');
        if (!hostControls || document.getElementById('cmc-mode-selector')) return;

        const div = document.createElement('div');
        div.id = 'cmc-mode-selector';
        div.style.marginBottom = '20px';
        div.style.textAlign = 'center';
        div.innerHTML = `
            <label style="display:block; font-weight:bold; font-size:1.1rem; margin-bottom:8px; color:#2d3436;">Mode de jeu :</label>
            <div style="display:flex; gap:10px;">
                <button type="button" id="btn-mode-standard" class="lobby-btn" style="flex:1; padding:10px; background:#6c5ce7; color:white;">Classique 🦄</button>
                <button type="button" id="btn-mode-hot" class="lobby-btn" style="flex:1; padding:10px; background:white; color:#2d3436;">HOT 🌶️</button>
            </div>
        `;
        hostControls.insertBefore(div, hostControls.firstChild);

        const btnStd = document.getElementById('btn-mode-standard');
        const btnHot = document.getElementById('btn-mode-hot');

        btnStd.onclick = () => {
            this.selectedMode = 'standard';
            btnStd.style.background = '#6c5ce7';
            btnStd.style.color = 'white';
            btnHot.style.background = 'white';
            btnHot.style.color = '#2d3436';
        };

        btnHot.onclick = () => {
            this.selectedMode = 'hot';
            btnHot.style.background = '#e84118';
            btnHot.style.color = 'white';
            btnStd.style.background = 'white';
            btnStd.style.color = '#2d3436';
        };
    }

    bindDOMEvents() {
        // Validation de réponse joueur
        const btnSubmitRes = document.getElementById('btn-submit-response');
        if (btnSubmitRes) {
            btnSubmitRes.addEventListener('click', () => this.handlePlayerSubmit());
        }

        // Validation du classement Capitaine
        const btnValidateOrder = document.getElementById('btn-validate-order');
        if (btnValidateOrder) {
            btnValidateOrder.addEventListener('click', () => this.handleCaptainValidateOrder());
        }

        // Manche suivante (Hôte)
        const btnNextRound = document.getElementById('btn-next-round');
        if (btnNextRound) {
            btnNextRound.addEventListener('click', () => this.handleNextRound());
        }

        // Rejouer (Hôte)
        const btnRestart = document.getElementById('btn-restart-game');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => this.handleRestartGame());
        }
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    setupHostGame(players) {
        this.gameState = {
            phase: "theme",
            mode: this.selectedMode,
            players: players.map(p => ({
                id: p.id,
                name: p.name,
                isHost: p.isHost || false
            })),
            currentRound: 0,
            maxRounds: 5,
            totalScore: 0,
            roundHistory: [],
            roundData: null
        };

        this.hostStartRound();
    }

    hostStartRound() {
        this.gameState.currentRound++;

        const players = this.gameState.players;
        const captainIndex = (this.gameState.currentRound - 1) % players.length;
        const captain = players[captainIndex];

        // Tirage aléatoire des 2 thèmes
        const pool = (this.gameState.mode === 'hot' && typeof hotThemes !== 'undefined' && hotThemes.length > 0)
            ? [...hotThemes]
            : [...themes];
        this.shuffle(pool);
        const t1 = pool[0] || { themeA: "Scénario A", themeB: "Scénario B" };
        const t2 = pool[1] || pool[0];

        // Tirage aléatoire des numéros secrets 1 à 10 pour les non-capitaines
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.shuffle(numbers);

        const nonCaptainPlayers = players.filter((_, idx) => idx !== captainIndex);
        const responses = nonCaptainPlayers.map((p, idx) => ({
            playerId: p.id,
            playerName: p.name,
            number: numbers[idx],
            response: ""
        }));

        this.gameState.roundData = {
            roundNumber: this.gameState.currentRound,
            captainIndex: captainIndex,
            captainId: captain.id,
            captainName: captain.name,
            themeChoices: {
                A: t1.themeA,
                B: t2.themeB || t2.themeA
            },
            theme: null,
            responses: responses,
            shuffledResponses: [],
            captainOrder: null,
            correctOrder: null,
            roundScore: 0,
            maxRoundScore: responses.length
        };

        this.gameState.phase = 'theme';
        this.broadcastState();
    }

    broadcastState() {
        LousticMultiplayer.send('state_updated', this.gameState);
        this.handleStateUpdate(this.gameState);
    }

    handleHostEvents(event, payload) {
        if (!this.gameState || !this.gameState.roundData) return;

        // 1. Le Capitaine a choisi le thème
        if (event === 'captain_chose_theme') {
            if (payload.theme) {
                this.gameState.roundData.theme = payload.theme;
                this.gameState.phase = 'player-turn';
                this.broadcastState();
            }
        }
        // 2. Un joueur a soumis sa réponse
        else if (event === 'player_submitted_response') {
            const entry = this.gameState.roundData.responses.find(r => r.playerId === payload.playerId);
            if (entry) {
                entry.response = (payload.response || '').trim();
            }

            // Vérifier si toutes les réponses sont arrivées
            const allDone = this.gameState.roundData.responses.every(r => r.response && r.response.trim() !== "");
            if (allDone) {
                const shuffled = this.shuffle([...this.gameState.roundData.responses]);
                this.gameState.roundData.shuffledResponses = shuffled;
                this.gameState.phase = 'captain-sort';
            }

            this.broadcastState();
        }
        // 3. Le Capitaine a validé l'ordre
        else if (event === 'captain_submitted_order') {
            const roundData = this.gameState.roundData;
            const orderedIds = payload.orderedPlayerIds || [];

            // Solution parfaite triée par numéro croissant
            const correctOrder = [...roundData.responses].sort((a, b) => a.number - b.number);

            let roundScore = 0;
            const captainOrder = orderedIds.map((pid, idx) => {
                const res = roundData.responses.find(r => r.playerId === pid);
                if (!res) return null;
                const isCorrect = (res.number === correctOrder[idx].number);
                if (isCorrect) roundScore++;
                return {
                    playerId: res.playerId,
                    playerName: res.playerName,
                    response: res.response,
                    number: res.number,
                    isCorrect: isCorrect
                };
            }).filter(Boolean);

            this.gameState.totalScore = (this.gameState.totalScore || 0) + roundScore;
            roundData.roundScore = roundScore;
            roundData.maxRoundScore = correctOrder.length;
            roundData.captainOrder = captainOrder;
            roundData.correctOrder = correctOrder;

            this.gameState.roundHistory.push({
                round: this.gameState.currentRound,
                theme: roundData.theme,
                captainName: roundData.captainName,
                roundScore: roundScore,
                maxRoundScore: correctOrder.length
            });

            this.gameState.phase = 'results';
            this.broadcastState();
        }
    }

    // ==========================================
    // RÉACTIONS AUX ÉVÉNEMENTS (CLIENT SYNC)
    // ==========================================

    handleStateUpdate(state) {
        this.gameState = state;
        if (!state) return;

        // Cacher le lobby et afficher la zone de jeu
        const lobbyRoot = document.getElementById('lobby-root');
        const gameArea = document.getElementById('game-area');
        if (lobbyRoot) lobbyRoot.style.display = 'none';
        if (gameArea) gameArea.classList.remove('hidden');

        switch (state.phase) {
            case 'theme':
                this.renderThemePhase();
                break;
            case 'player-turn':
                this.renderPlayerTurnPhase();
                break;
            case 'captain-sort':
                this.renderCaptainSortPhase();
                break;
            case 'results':
                this.renderResultsPhase();
                break;
            case 'final':
                this.renderFinalPhase();
                break;
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('#game-area .screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Phase 1 : Choix du thème
    renderThemePhase() {
        const roundData = this.gameState.roundData;
        const myId = LousticMultiplayer.getPlayerId();
        const isCaptain = (myId === roundData.captainId);

        if (isCaptain) {
            document.getElementById('theme-a').textContent = roundData.themeChoices.A;
            document.getElementById('theme-b').textContent = roundData.themeChoices.B;

            const cardA = document.getElementById('theme-a-card');
            const cardB = document.getElementById('theme-b-card');

            cardA.onclick = () => this.selectTheme(roundData.themeChoices.A);
            cardB.onclick = () => this.selectTheme(roundData.themeChoices.B);

            this.showScreen('theme-screen');
        } else {
            document.getElementById('wait-captain-tag').textContent = `Capitaine : ${roundData.captainName}`;
            document.getElementById('wait-theme-text').textContent = `Le Capitaine ${roundData.captainName} réfléchit et choisit le scénario du tour...`;
            this.showScreen('wait-theme-screen');
        }
    }

    selectTheme(themeText) {
        if (LousticMultiplayer.isHost) {
            this.handleHostEvents('captain_chose_theme', { theme: themeText });
        } else {
            LousticMultiplayer.send('captain_chose_theme', { theme: themeText });
        }
    }

    // Phase 2 : Rédaction des réponses
    renderPlayerTurnPhase() {
        const roundData = this.gameState.roundData;
        const myId = LousticMultiplayer.getPlayerId();
        const isCaptain = (myId === roundData.captainId);

        if (isCaptain) {
            this.renderWaitingResponsesUI();
            this.showScreen('wait-responses-screen');
            return;
        }

        const myEntry = roundData.responses.find(r => r.playerId === myId);
        if (myEntry && myEntry.response !== "") {
            this.renderWaitingResponsesUI();
            this.showScreen('wait-responses-screen');
        } else {
            document.getElementById('turn-captain-name').textContent = `Capitaine : ${roundData.captainName}`;
            document.getElementById('current-theme-display').textContent = roundData.theme;

            const circle = document.getElementById('secret-number-circle');
            const num = myEntry ? myEntry.number : 5;
            circle.textContent = num;

            if (num <= 3) {
                circle.style.background = '#00b894';
            } else if (num <= 6) {
                circle.style.background = '#e17055';
            } else {
                circle.style.background = '#d63031';
            }

            this.showScreen('player-turn-screen');
        }
    }

    renderWaitingResponsesUI() {
        const roundData = this.gameState.roundData;
        document.getElementById('wait-responses-theme-display').textContent = roundData.theme;

        const count = roundData.responses.filter(r => r.response && r.response.trim() !== "").length;
        const total = roundData.responses.length;
        document.getElementById('response-progress-counter').textContent = `Réponses reçues : ${count} / ${total}`;

        const statusList = document.getElementById('responses-status-list');
        if (statusList) {
            statusList.innerHTML = roundData.responses.map(r => {
                const done = (r.response && r.response.trim() !== "");
                return `
                    <div style="background:${done ? '#d4edda' : '#fff3cd'}; border:2px solid black; padding:6px 14px; border-radius:15px; font-weight:700; font-size:0.95rem;">
                        ${done ? '✅' : '⏳'} ${this.escapeHtml(r.playerName)}
                    </div>
                `;
            }).join('');
        }
    }

    handlePlayerSubmit() {
        const input = document.getElementById('player-response-input');
        const text = (input.value || '').trim();
        if (!text) return alert("Veuillez écrire votre réponse !");

        const btn = document.getElementById('btn-submit-response');
        btn.disabled = true;
        btn.textContent = "Envoi...";

        const payload = {
            playerId: LousticMultiplayer.getPlayerId(),
            response: text
        };

        if (LousticMultiplayer.isHost) {
            this.handleHostEvents('player_submitted_response', payload);
        } else {
            LousticMultiplayer.send('player_submitted_response', payload);
        }

        input.value = "";
        btn.disabled = false;
        btn.textContent = "Valider ma réponse ✍️";

        // Afficher l'attente immédiatement côté client
        this.renderWaitingResponsesUI();
        this.showScreen('wait-responses-screen');
    }

    // Phase 3 : Tri par le Capitaine
    renderCaptainSortPhase() {
        const roundData = this.gameState.roundData;
        const myId = LousticMultiplayer.getPlayerId();
        const isCaptain = (myId === roundData.captainId);

        if (isCaptain) {
            const container = document.getElementById('sortable-responses-container');
            container.innerHTML = roundData.shuffledResponses.map(r => `
                <div class="sortable-item" data-player-id="${r.playerId}">
                    <span class="sortable-handle">☰</span>
                    <div class="sortable-item-content">
                        <strong>${this.escapeHtml(r.playerName)}</strong>
                        <p>${this.escapeHtml(r.response)}</p>
                    </div>
                </div>
            `).join('');

            if (this.sortableInstance) this.sortableInstance.destroy();
            this.sortableInstance = new Sortable(container, {
                animation: 200,
                handle: '.sortable-item',
                ghostClass: 'sortable-ghost'
            });

            this.showScreen('captain-screen');
        } else {
            document.getElementById('wait-sort-captain-tag').textContent = `Capitaine : ${roundData.captainName}`;
            document.getElementById('wait-sort-text').textContent = `Le Capitaine ${roundData.captainName} tente de remettre vos réponses dans le bon ordre de 1 à 10...`;
            this.showScreen('wait-sort-screen');
        }
    }

    handleCaptainValidateOrder() {
        const container = document.getElementById('sortable-responses-container');
        const items = container.querySelectorAll('.sortable-item');
        const orderedPlayerIds = Array.from(items).map(item => item.dataset.playerId);

        const payload = { orderedPlayerIds };

        if (LousticMultiplayer.isHost) {
            this.handleHostEvents('captain_submitted_order', payload);
        } else {
            LousticMultiplayer.send('captain_submitted_order', payload);
        }
    }

    // Phase 4 : Résultats de la manche
    renderResultsPhase() {
        const roundData = this.gameState.roundData;
        document.getElementById('result-round-title').textContent = `Résultat de la Manche ${roundData.roundNumber} / ${this.gameState.maxRounds}`;
        document.getElementById('round-points-display').textContent = `${roundData.roundScore} / ${roundData.maxRoundScore}`;
        document.getElementById('total-team-score-display').textContent = `${this.gameState.totalScore} pts`;

        // Colonne Ordre du Capitaine
        const captainList = document.getElementById('captain-result-list');
        captainList.innerHTML = (roundData.captainOrder || []).map(item => `
            <li class="result-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                <span class="result-badge ${item.isCorrect ? 'badge-green' : 'badge-red'}">${item.number}</span>
                <div>
                    <strong>${this.escapeHtml(item.playerName)}</strong>: ${this.escapeHtml(item.response)}
                </div>
            </li>
        `).join('');

        // Colonne Solution Parfaite
        const perfectList = document.getElementById('perfect-result-list');
        perfectList.innerHTML = (roundData.correctOrder || []).map(item => `
            <li class="result-item correct">
                <span class="result-badge badge-green">${item.number}</span>
                <div>
                    <strong>${this.escapeHtml(item.playerName)}</strong>: ${this.escapeHtml(item.response)}
                </div>
            </li>
        `).join('');

        // Contrôles Manche suivante
        const nextBtn = document.getElementById('btn-next-round');
        const waitMsg = document.getElementById('next-round-waiting-msg');

        const isLastRound = (this.gameState.currentRound >= this.gameState.maxRounds);
        nextBtn.textContent = isLastRound ? "Voir le score final 🏆" : "Manche Suivante ➡️";

        if (LousticMultiplayer.isHost) {
            nextBtn.classList.remove('hidden');
            waitMsg.classList.add('hidden');
        } else {
            nextBtn.classList.add('hidden');
            waitMsg.classList.remove('hidden');
        }

        this.showScreen('round-result-screen');
    }

    handleNextRound() {
        if (!LousticMultiplayer.isHost) return;

        if (this.gameState.currentRound >= this.gameState.maxRounds) {
            this.gameState.phase = 'final';
            this.broadcastState();
        } else {
            this.hostStartRound();
        }
    }

    // Phase 5 : Fin de partie
    renderFinalPhase() {
        const total = this.gameState.totalScore || 0;
        const maxPerRound = this.gameState.players.length - 1;
        const maxPossible = this.gameState.maxRounds * maxPerRound;
        const percent = Math.round((total / (maxPossible || 1)) * 100);

        document.getElementById('final-score-display').textContent = `${total} / ${maxPossible} pts`;
        document.getElementById('final-percentage-display').textContent = `Taux de réussite de l'équipe : ${percent} %`;

        const verdictBox = document.getElementById('final-verdict-box');
        if (percent >= 80) {
            verdictBox.innerHTML = `🧠✨ <strong>Légendaire !</strong> Vous êtes télépathes, une harmonie absolue !`;
            verdictBox.style.borderColor = '#00b894';
        } else if (percent >= 50) {
            verdictBox.innerHTML = `👏 <strong>Belle équipe !</strong> Bonne communication et très peu de malentendus.`;
            verdictBox.style.borderColor = '#f1c40f';
        } else {
            verdictBox.innerHTML = `💩 <strong>C'était... le chaos total !</strong> Mais on a bien rigolé !`;
            verdictBox.style.borderColor = '#d63031';
        }

        const recap = document.getElementById('final-recap-rounds');
        if (recap && this.gameState.roundHistory) {
            recap.innerHTML = `<h4>Détail des 5 manches :</h4>` + this.gameState.roundHistory.map(h => `
                <div style="background:white; border:2px solid black; border-radius:8px; padding:8px 12px; margin:6px 0; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>Manche ${h.round}</strong> (Cap'ten: ${this.escapeHtml(h.captainName)})<br>
                        <small style="color:#636e72;">${this.escapeHtml(h.theme)}</small>
                    </div>
                    <div style="font-weight:800; font-size:1.1rem; color:var(--primary);">
                        ${h.roundScore} / ${h.maxRoundScore}
                    </div>
                </div>
            `).join('');
        }

        const restartBtn = document.getElementById('btn-restart-game');
        if (LousticMultiplayer.isHost) {
            restartBtn.style.display = 'block';
        } else {
            restartBtn.style.display = 'none';
        }

        this.showScreen('final-screen');
    }

    handleRestartGame() {
        if (!LousticMultiplayer.isHost) return;
        this.setupHostGame(this.gameState.players);
    }

    // Utilitaires
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ClasseMoiCaMultiplayerGame();
    window.game.init();
});
