// Multiplayer Mess Meme game logic

class MessMemeMultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.selectedSubIdx = null;

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Mess Meme 📲");

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
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    setupHostGame(players) {
        this.gameState = {
            phase: "caption_submission",
            players: players.map(p => ({ ...p, score: 0 })),
            masterIndex: 0,
            roundNumber: 1,
            currentImage: "",
            submissions: [],
            winnerName: "",
            winnerCaption: ""
        };

        this.hostStartRound();
    }

    hostStartRound() {
        const imgNum = Math.floor(Math.random() * 50) + 1; // 1 à 50
        this.gameState.currentImage = `images/img${imgNum}.png`;
        this.gameState.submissions = [];
        this.gameState.phase = "caption_submission";
        this.gameState.winnerName = "";
        this.gameState.winnerCaption = "";
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        const masterName = this.gameState.players[this.gameState.masterIndex].name;
        
        if (event === 'player_submitted') {
            // S'assurer qu'il n'y a pas de doublon
            const exists = this.gameState.submissions.some(s => s.playerId === payload.playerId);
            if (!exists) {
                this.gameState.submissions.push({
                    playerId: payload.playerId,
                    playerName: payload.playerName,
                    caption: payload.caption
                });
            }

            const respondersCount = this.gameState.players.length - 1;
            if (this.gameState.submissions.length >= respondersCount) {
                // Mélanger pour l'anonymat
                this.gameState.submissions = this.shuffle([...this.gameState.submissions]);
                this.gameState.phase = "master_voting";
            }
            this.broadcastState();
        }
        else if (event === 'winner_selected') {
            const winner = this.gameState.players.find(p => p.id === payload.winnerPlayerId);
            if (winner) {
                winner.score++;
                this.gameState.winnerName = winner.name;
                this.gameState.winnerCaption = payload.caption;
            }
            this.gameState.phase = "round_result";
            this.broadcastState();
        }
        else if (event === 'next_round_requested') {
            // Vérifier s'il y a un gagnant général (score >= 5)
            const hasWinner = this.gameState.players.some(p => p.score >= 5);
            
            if (hasWinner) {
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
    // RENDER CLIENT-SIDE
    // ==========================================

    handleStateUpdate(state) {
        this.gameState = state;
        const myName = LousticMultiplayer.username;
        const master = this.gameState.players[this.gameState.masterIndex];
        const isMaster = (master.name === myName);

        switch (state.phase) {
            case "caption_submission":
                this.renderCaptionSubmission(isMaster, master.name);
                break;
            case "master_voting":
                this.renderMasterVoting(isMaster, master.name);
                break;
            case "round_result":
                this.renderRoundResult(isMaster, master.name);
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    // Vue 1 : Proposition de légendes
    renderCaptionSubmission(isMaster, masterName) {
        const hasSubmitted = this.gameState.submissions.some(s => s.playerName === LousticMultiplayer.username);
        
        if (isMaster) {
            const count = this.gameState.submissions.length;
            const total = this.gameState.players.length - 1;
            
            this.app.innerHTML = `
                <div class="screen">
                    <h2>Round ${this.gameState.roundNumber} - Vous êtes le Maître !</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <h3>Soumissions reçues : ${count} / ${total}</h3>
                    <div class="loader-dots" style="margin: 20px auto;"></div>
                    <p>Attente que les autres joueurs écrivent leur légende...</p>
                </div>
            `;
        } else {
            if (hasSubmitted) {
                this.app.innerHTML = `
                    <div class="screen">
                        <h2>Round ${this.gameState.roundNumber}</h2>
                        <div class="image-container">
                            <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                        </div>
                        <h3>Légende envoyée !</h3>
                        <p>En attente des autres joueurs...</p>
                        <div class="loader-dots" style="margin: 20px auto;"></div>
                    </div>
                `;
            } else {
                this.app.innerHTML = `
                    <div class="screen">
                        <h2>Round ${this.gameState.roundNumber} - À toi de jouer !</h2>
                        <div class="image-container">
                            <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                        </div>
                        <p style="font-weight:bold; margin-top:10px;">Écris une légende drôle pour cette image :</p>
                        <textarea id="captionInput" placeholder="Ta légende ici..." maxlength="300"></textarea>
                        <br><br>
                        <button id="btn-submit-caption" class="btn" style="width:100%; background:var(--c-green);">Valider ma légende</button>
                    </div>
                `;
                document.getElementById('captionInput').focus();

                document.getElementById('btn-submit-caption').addEventListener('click', () => {
                    const caption = document.getElementById('captionInput').value.trim();
                    if (!caption) return alert("Vous devez écrire une légende !");
                    
                    LousticMultiplayer.send('player_submitted', {
                        playerId: LousticMultiplayer.getPlayerId(),
                        playerName: LousticMultiplayer.username,
                        caption: caption
                    });
                });
            }
        }
    }

    // Vue 2 : Choix du Maître
    renderMasterVoting(isMaster, masterName) {
        if (isMaster) {
            const captionsHTML = this.gameState.submissions.map((sub, i) => `
                <div class="caption-card" data-index="${i}">
                    <p>"${sub.caption}"</p>
                </div>
            `).join('');

            this.app.innerHTML = `
                <div class="screen">
                    <h2>Choisissez la meilleure légende !</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <div class="captions-grid">
                        ${captionsHTML}
                    </div>
                    <button id="btn-confirm-winner" class="btn hidden" style="width:100%; background:var(--c-red); margin-top:20px;">Confirmer ce vainqueur 🏆</button>
                </div>
            `;

            const cards = this.app.querySelectorAll('.caption-card');
            const confirmBtn = document.getElementById('btn-confirm-winner');

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedSubIdx = parseInt(card.dataset.index);
                    confirmBtn.classList.remove('hidden');
                });
            });

            confirmBtn.onclick = () => {
                if (this.selectedSubIdx === null) return alert("Sélectionnez une légende !");
                const winnerSub = this.gameState.submissions[this.selectedSubIdx];
                
                LousticMultiplayer.send('winner_selected', {
                    winnerPlayerId: winnerSub.playerId,
                    caption: winnerSub.caption
                });
                
                this.selectedSubIdx = null;
                confirmBtn.classList.add('hidden');
            };
        } else {
            this.app.innerHTML = `
                <div class="screen">
                    <h2>Délibération...</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <p style="font-weight:bold; font-size:1.2rem;">Le maître (${masterName}) choisit sa légende préférée !</p>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
        }
    }

    // Vue 3 : Résultat du round
    renderRoundResult(isMaster, masterName) {
        const rows = this.gameState.players
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pt${p.score > 1 ? 's' : ''}</td></tr>`)
            .join('');

        this.app.innerHTML = `
            <div class="screen">
                <h1 style="color:var(--c-green);">🏆 ${this.gameState.winnerName} remporte la manche !</h1>
                <div class="winner-caption">"${this.gameState.winnerCaption}"</div>
                
                <div class="image-container">
                    <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                </div>

                <h3>Tableau des scores :</h3>
                <table class="scores-table">
                    ${rows}
                </table>

                ${isMaster ? `
                    <button id="btn-next-round" class="btn" style="width:100%; background:var(--c-red); margin-top:20px;">Round Suivant ➡️</button>
                ` : `
                    <p style="font-style:italic; color:#57606f;">En attente du maître pour passer au round suivant...</p>
                `}
            </div>
        `;

        const nextBtn = document.getElementById('btn-next-round');
        if (nextBtn) {
            nextBtn.onclick = () => {
                LousticMultiplayer.send('next_round_requested');
            };
        }
    }

    // Vue 4 : Fin de partie
    renderGameOver() {
        const sorted = [...this.gameState.players].sort((a, b) => b.score - a.score);
        const grandWinner = sorted[0];

        const rows = sorted
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pts</td></tr>`)
            .join('');

        this.app.innerHTML = `
            <div class="screen" style="text-align:center;">
                <h1>🎉 Fin de Partie ! 🎉</h1>
                <h2 style="color:var(--c-red); margin:30px 0;">Le vainqueur ultime est :<br><span style="font-size:2.2rem;">🏆 ${grandWinner.name} 🏆</span></h2>
                
                <table class="scores-table">
                    ${rows}
                </table>

                <button onclick="location.reload()" class="btn" style="width:100%; background:var(--c-purple); margin-top:30px;">Rejouer 🎮</button>
            </div>
        `;
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
    const game = new MessMemeMultiplayerGame();
    game.init();
});
