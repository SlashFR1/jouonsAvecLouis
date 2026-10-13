// Multiplayer Mess Meme game logic (Simultané)

class MessMemeMultiplayerGame {
    constructor() {
        this.app = document.getElementById('app');
        this.gameState = null;
        this.mySubmissionId = null;

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
            roundNumber: 1,
            currentImage: "",
            submissions: [],
            votes: [],
            roundWinners: [] // Peut y avoir des égalités
        };

        this.hostStartRound();
    }

    hostStartRound() {
        const imgNum = Math.floor(Math.random() * 50) + 1; // 1 à 50
        this.gameState.currentImage = `images/img${imgNum}.png`;
        this.gameState.submissions = [];
        this.gameState.votes = [];
        this.gameState.phase = "caption_submission";
        this.gameState.roundWinners = [];
        
        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        if (event === 'player_submitted') {
            const exists = this.gameState.submissions.some(s => s.playerId === payload.playerId);
            if (!exists) {
                this.gameState.submissions.push({
                    id: Math.random().toString(36).substring(2, 9), // ID unique pour la soumission
                    playerId: payload.playerId,
                    playerName: payload.playerName,
                    caption: payload.caption,
                    votes: 0
                });
            }

            // Si tous les joueurs ont soumis
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

                // Ajouter un vote à la soumission correspondante
                const sub = this.gameState.submissions.find(s => s.id === payload.submissionId);
                if (sub) sub.votes++;
            }

            // Si tout le monde a voté
            if (this.gameState.votes.length >= this.gameState.players.length) {
                // Déterminer le(s) gagnant(s)
                let maxVotes = 0;
                this.gameState.submissions.forEach(s => {
                    if (s.votes > maxVotes) maxVotes = s.votes;
                });

                const winningSubs = this.gameState.submissions.filter(s => s.votes === maxVotes);
                this.gameState.roundWinners = winningSubs;

                // Mettre à jour les scores (1 pt par victoire)
                winningSubs.forEach(wSub => {
                    const player = this.gameState.players.find(p => p.id === wSub.playerId);
                    if (player) player.score++;
                });

                this.gameState.phase = "round_result";
            }
            this.broadcastState();
        }
        else if (event === 'next_round_requested') {
            // Un joueur a gagné s'il atteint 5 points
            const hasWinner = this.gameState.players.some(p => p.score >= 5);
            
            if (hasWinner) {
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

        // Récupérer mon ID de soumission pour l'exclure des votes
        const mySub = state.submissions.find(s => s.playerId === myId);
        if (mySub) this.mySubmissionId = mySub.id;

        switch (state.phase) {
            case "caption_submission":
                this.renderCaptionSubmission();
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

    // Vue 1 : Tout le monde propose une légende
    renderCaptionSubmission() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasSubmitted = this.gameState.submissions.some(s => s.playerId === myId);
        
        if (hasSubmitted) {
            const count = this.gameState.submissions.length;
            const total = this.gameState.players.length;
            this.app.innerHTML = `
                <div class="screen">
                    <h2>Round ${this.gameState.roundNumber}</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <h3>Légende envoyée !</h3>
                    <p>En attente des autres joueurs... (${count} / ${total})</p>
                    <div class="loader-dots" style="margin: 20px auto;"></div>
                </div>
            `;
        } else {
            this.app.innerHTML = `
                <div class="screen">
                    <h2>Round ${this.gameState.roundNumber} - À vous de jouer !</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <p style="font-weight:bold; margin-top:10px;">Écris la légende la plus drôle :</p>
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

    // Vue 2 : Tout le monde vote pour la meilleure
    renderVoting() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasVoted = this.gameState.votes.some(v => v.playerId === myId);

        if (hasVoted) {
            const count = this.gameState.votes.length;
            const total = this.gameState.players.length;
            this.app.innerHTML = `
                <div class="screen">
                    <h2>A voté !</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <p>En attente des votes des autres joueurs... (${count} / ${total})</p>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
        } else {
            const captionsHTML = this.gameState.submissions.map((sub) => {
                // On ne peut pas voter pour soi-même
                const isMine = (sub.id === this.mySubmissionId);
                return `
                    <div class="caption-card ${isMine ? 'disabled-card' : 'cursor-pointer'}" 
                         data-id="${sub.id}" 
                         style="${isMine ? 'opacity:0.5; background:#ddd;' : ''}">
                        <p>"${sub.caption}"</p>
                        ${isMine ? '<small style="color:#d63031;">(Ta légende)</small>' : ''}
                    </div>
                `;
            }).join('');

            this.app.innerHTML = `
                <div class="screen">
                    <h2>Votez pour la meilleure !</h2>
                    <div class="image-container">
                        <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                    </div>
                    <div class="captions-grid">
                        ${captionsHTML}
                    </div>
                    <button id="btn-confirm-vote" class="btn hidden" style="width:100%; background:var(--c-red); margin-top:20px;">Voter pour cette légende 🏆</button>
                </div>
            `;

            let selectedSubId = null;
            const cards = this.app.querySelectorAll('.caption-card:not(.disabled-card)');
            const confirmBtn = document.getElementById('btn-confirm-vote');

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedSubId = card.dataset.id;
                    confirmBtn.classList.remove('hidden');
                });
            });

            confirmBtn.onclick = () => {
                if (!selectedSubId) return alert("Sélectionnez une légende !");
                
                LousticMultiplayer.send('player_voted', {
                    playerId: myId,
                    submissionId: selectedSubId
                });
                
                confirmBtn.classList.add('hidden');
            };
        }
    }

    // Vue 3 : Résultat du round
    renderRoundResult() {
        const rows = [...this.gameState.players]
            .sort((a, b) => b.score - a.score)
            .map(p => `<tr><td>${p.name}</td><td>${p.score} pt${p.score > 1 ? 's' : ''}</td></tr>`)
            .join('');

        const winnersHTML = this.gameState.roundWinners.map(w => `
            <div style="background:#fff; border:3px solid #000; padding:15px; margin-bottom:15px; border-radius:10px;">
                <h3 style="color:var(--c-red); margin:0;">${w.playerName}</h3>
                <p style="font-weight:bold; font-size:1.2rem; margin:10px 0;">"${w.caption}"</p>
                <small>${w.votes} vote(s)</small>
            </div>
        `).join('');

        this.app.innerHTML = `
            <div class="screen">
                <h1 style="color:var(--c-green);">🏆 Vainqueur(s) du round !</h1>
                
                <div class="image-container" style="margin-bottom:15px;">
                    <img src="${this.gameState.currentImage}" class="round-image" onerror="this.src='images/placeholder.png'">
                </div>

                ${winnersHTML}

                <h3 style="margin-top:20px;">Tableau des scores :</h3>
                <table class="scores-table">
                    ${rows}
                </table>

                ${LousticMultiplayer.isHost ? `
                    <button id="btn-next-round" class="btn" style="width:100%; background:var(--c-purple); margin-top:20px;">Round Suivant ➡️</button>
                ` : `
                    <p style="font-style:italic; color:#57606f; margin-top:20px;">En attente de l'hôte pour passer au round suivant...</p>
                `}
            </div>
        `;

        if (LousticMultiplayer.isHost) {
            document.getElementById('btn-next-round').onclick = () => {
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
                <h2 style="color:var(--c-red); margin:30px 0;">Le grand vainqueur est :<br><span style="font-size:2.2rem;">🏆 ${grandWinner.name} 🏆</span></h2>
                
                <table class="scores-table">
                    ${rows}
                </table>

                <button onclick="location.href='../index.html'" class="btn" style="width:100%; background:var(--c-purple); margin-top:30px;">Retour au menu principal 🏠</button>
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
