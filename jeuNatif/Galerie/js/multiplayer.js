// Multiplayer Galerie game implementation (Simultané)

const GALERIE_PROMPTS = [
    "Moi le lundi matin.",
    "Quand tu vois le prix de ton loyer.",
    "La définition absolue de la galère.",
    "Ma réaction quand je lis mes anciens messages.",
    "Mon animal totem lors d'une soirée arrosée.",
    "La tête de mes parents quand je leur annonce une nouvelle.",
    "Mon look idéal pour un premier date.",
    "Moi essayant de comprendre le jeu.",
    "Quand tu vois que ton ex regarde tes stories.",
    "Le banquier qui analyse mon compte à la fin du mois.",
    "L'état de mon cerveau le vendredi à 17h.",
    "La meilleure excuse pour annuler une sortie.",
    "Quand le réveil sonne et que tu réalises que t'as dormi 3h.",
    "Ce que je ressens devant une pizza 4 fromages.",
    "Moi quand je gagne à ce jeu."
];

class GalerieMultiplayerGame {
    constructor() {
        this.gameState = null;
        this.selectedCardIdx = null;
        this.mySubmissionId = null;

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Galerie 📲");

        LousticMultiplayer.onPlayersChange(() => {
            if (LousticMultiplayer.isHost && !document.getElementById('theme-select-galerie')) {
                const hostControls = document.getElementById('host-controls');
                if (hostControls) {
                    const themeDiv = document.createElement('div');
                    themeDiv.className = 'theme-select-container';
                    themeDiv.innerHTML = `
                        <label style="font-weight:bold; display:block; margin-bottom:5px;">Thème des images :</label>
                        <select id="theme-select-galerie" style="margin-bottom: 15px;">
                            <option value="memes">Mèmes ⭐</option>
                            <option value="art">Art 🎨</option>
                            <option value="histoire">Histoire 📜</option>
                            <option value="nature">Nature 🌿</option>
                            <option value="cosmos">Cosmos 🌌</option>
                        </select>
                    `;
                    hostControls.insertBefore(themeDiv, hostControls.firstChild);
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

        LousticMultiplayer.onStart(async (payload) => {
            if (LousticMultiplayer.isHost) {
                const selectedTheme = document.getElementById('theme-select-galerie')?.value || 'memes';
                await this.setupHostGame(payload.players, selectedTheme);
            }
        });
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    async setupHostGame(players, theme) {
        const deck = await buildDeckForTheme(theme);
        this.hostDeck = this.shuffle([...deck]);
        this.prompts = this.shuffle([...GALERIE_PROMPTS]);

        const hands = {};
        players.forEach(p => {
            hands[p.id] = [];
            for (let k = 0; k < 4; k++) {
                if (this.hostDeck.length > 0) {
                    hands[p.id].push(this.hostDeck.pop());
                }
            }
        });

        this.gameState = {
            theme: theme,
            phase: "players_pick",
            players: players.map(p => ({ ...p, score: 0 })),
            mancheActuelle: 1,
            totalManches: 5,
            submissions: [],
            votes: [],
            revealList: [],
            hands: hands,
            currentPhrase: "",
            roundWinners: []
        };

        this.hostStartRound();
    }

    hostStartRound() {
        if (this.prompts.length === 0) {
            this.prompts = this.shuffle([...GALERIE_PROMPTS]);
        }

        this.gameState.currentPhrase = this.prompts.pop();
        this.gameState.submissions = [];
        this.gameState.votes = [];
        this.gameState.revealList = [];
        this.gameState.roundWinners = [];
        this.gameState.phase = "players_pick";
        
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
                    cardUrl: payload.cardUrl,
                    votes: 0
                });

                // Remove card from hand
                this.gameState.hands[payload.playerId] = this.gameState.hands[payload.playerId].filter(c => c !== payload.cardUrl);
            }

            if (this.gameState.submissions.length >= this.gameState.players.length) {
                this.gameState.revealList = this.shuffle([...this.gameState.submissions]);
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

                const sub = this.gameState.revealList.find(s => s.id === payload.submissionId);
                if (sub) sub.votes++;
            }

            if (this.gameState.votes.length >= this.gameState.players.length) {
                this.computeScoresAndAdvance();
            } else {
                this.broadcastState();
            }
        }
        else if (event === 'next_round_requested') {
            if (this.gameState.mancheActuelle >= this.gameState.totalManches) {
                this.gameState.phase = "game_over";
            } else {
                this.gameState.mancheActuelle++;
                
                // Repiocher une carte pour tout le monde
                this.gameState.players.forEach(p => {
                    if (this.hostDeck.length > 0) {
                        this.gameState.hands[p.id].push(this.hostDeck.pop());
                    }
                });

                this.hostStartRound();
            }
            this.broadcastState();
        }
    }

    computeScoresAndAdvance() {
        let maxVotes = 0;
        this.gameState.revealList.forEach(s => {
            if (s.votes > maxVotes) maxVotes = s.votes;
        });

        const winningSubs = this.gameState.revealList.filter(s => s.votes === maxVotes);
        this.gameState.roundWinners = winningSubs;

        // +1 pt per vote received! Very simple Jackbox style scoring.
        this.gameState.revealList.forEach(sub => {
            const player = this.gameState.players.find(p => p.id === sub.playerId);
            if (player) {
                player.score += sub.votes;
            }
        });

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
        const myId = LousticMultiplayer.getPlayerId();

        const mySub = state.submissions.find(s => s.playerId === myId);
        if (mySub) this.mySubmissionId = mySub.id;

        document.getElementById('app').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');

        const myPlayer = this.gameState.players.find(p => p.id === myId);
        const myScore = myPlayer ? myPlayer.score : 0;

        const infoJoueur = document.getElementById('infoJoueur');
        infoJoueur.innerHTML = `Joueur : <strong>${LousticMultiplayer.username}</strong> | Score : <strong>${myScore} pts</strong>`;
        
        const phraseMaitre = document.getElementById('phraseMaître');
        phraseMaitre.textContent = `Thème : "${this.gameState.currentPhrase}"`;
        phraseMaitre.style.color = "var(--c-blue)";
        phraseMaitre.style.fontWeight = "bold";
        phraseMaitre.style.fontSize = "1.3rem";

        const mancheInfo = document.getElementById('mancheInfo');
        mancheInfo.textContent = `Manche ${this.gameState.mancheActuelle} / ${this.gameState.totalManches}`;

        this.renderScoresTable();

        switch (state.phase) {
            case "players_pick":
                this.renderPlayersPick();
                break;
            case "voting":
                this.renderVoting();
                break;
            case "results":
                this.renderResults();
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    renderScoresTable() {
        const board = document.getElementById('scoresBoard');
        board.innerHTML = [...this.gameState.players].sort((a,b) => b.score - a.score).map(p => `
            <div style="background:white; border:2px solid black; border-radius:10px; padding:5px 10px; font-weight:bold; font-size:0.9rem; box-shadow:2px 2px 0 black;">
                ${p.name}: ${p.score} pts
            </div>
        `).join('');
    }

    // Phase 1 : Tout le monde choisit
    renderPlayersPick() {
        const myId = LousticMultiplayer.getPlayerId();
        const cards = this.gameState.hands[myId] || [];
        const hasSubmitted = this.gameState.submissions.some(s => s.playerId === myId);

        const validerBtn = document.getElementById('valider');
        const inputPhrase = document.getElementById('inputPhrase');
        const btnReveal = document.getElementById('btnReveal');
        
        if (inputPhrase) inputPhrase.classList.add('hidden');
        if (btnReveal) btnReveal.classList.add('hidden');

        if (hasSubmitted) {
            validerBtn.classList.add('hidden');
            const count = this.gameState.submissions.length;
            const total = this.gameState.players.length;
            const cardsContainer = document.getElementById('cartesContainer');
            cardsContainer.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h3>Image envoyée !</h3>
                    <p>En attente des autres joueurs... (${count}/${total})</p>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
            document.getElementById('zoneVote').innerHTML = "";
        } else {
            validerBtn.classList.remove('hidden');
            validerBtn.textContent = "Envoyer cette image 🖼️";
            
            this.renderCardsGrid(cards, true, (idx) => {
                this.selectedCardIdx = idx;
                validerBtn.dataset.selectedIndex = idx;
            });

            validerBtn.onclick = () => {
                if (this.selectedCardIdx === null) return alert("Sélectionnez une image d'abord !");
                
                const selectedCardUrl = cards[this.selectedCardIdx];
                this.selectedCardIdx = null;
                validerBtn.classList.add('hidden');

                LousticMultiplayer.send('player_submitted', {
                    playerId: myId,
                    playerName: LousticMultiplayer.username,
                    cardUrl: selectedCardUrl
                });
            };
        }
    }

    // Phase 2 : Vote
    renderVoting() {
        const myId = LousticMultiplayer.getPlayerId();
        const hasVoted = this.gameState.votes.some(v => v.playerId === myId);

        const validerBtn = document.getElementById('valider');
        if (validerBtn) validerBtn.classList.add('hidden');

        if (hasVoted) {
            const count = this.gameState.votes.length;
            const total = this.gameState.players.length;
            const cardsContainer = document.getElementById('cartesContainer');
            cardsContainer.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h3>Vote enregistré !</h3>
                    <p>En attente des autres votes... (${count}/${total})</p>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
        } else {
            const container = document.getElementById('cartesContainer');
            container.innerHTML = "<h3 style='width:100%; text-align:center;'>Votez pour la meilleure !</h3>";
            
            this.gameState.revealList.forEach((entry, idx) => {
                const isMine = (entry.id === this.mySubmissionId);
                const div = document.createElement('div');
                div.className = `carte-slot ${isMine ? 'disabled-card' : ''}`;
                div.style.cursor = isMine ? 'not-allowed' : 'pointer';
                div.style.opacity = isMine ? '0.5' : '1';
                div.innerHTML = `
                    <img src="${entry.cardUrl}" alt="Vote Option" style="width:100%; height:180px; object-fit:cover; border-radius:10px; border:2px solid black;" />
                    ${isMine ? '<div style="text-align:center; color:red; font-weight:bold; margin-top:5px;">(Ta carte)</div>' : ''}
                `;
                
                if (!isMine) {
                    div.addEventListener('click', () => {
                        if (confirm(`Confirmer votre vote pour cette image ?`)) {
                            LousticMultiplayer.send('player_voted', {
                                playerId: myId,
                                submissionId: entry.id
                            });
                        }
                    });
                }
                container.appendChild(div);
            });
        }
    }

    // Phase 3 : Résultats
    renderResults() {
        const overlay = document.getElementById('voteDetailsOverlay');
        overlay.classList.remove('hidden');

        const grid = document.getElementById('voteDetailsGrid');
        grid.innerHTML = this.gameState.revealList.map(entry => {
            const voters = this.gameState.votes.filter(v => v.submissionId === entry.id).map(v => {
                const p = this.gameState.players.find(pl => pl.id === v.playerId);
                return p ? p.name : "Inconnu";
            });
            
            const isWinner = this.gameState.roundWinners.some(w => w.id === entry.id);
            const cardStyle = isWinner ? 'border: 4px solid #4cd137;' : 'border: 2px solid black;';

            return `
                <div style="text-align:center; background:#f1f2f6; padding:10px; border-radius:10px; ${cardStyle} width:150px; box-sizing:border-box;">
                    <img src="${entry.cardUrl}" style="width:100%; height:120px; object-fit:cover; border-radius:5px; border:1px solid black;" />
                    <div style="font-weight:bold; margin-top:5px; font-size:0.9rem; color:var(--c-blue);">
                        ${entry.playerName} ${isWinner ? '👑' : ''}
                    </div>
                    <div style="font-size:0.8rem; color:#57606f; margin-top:3px;">
                        +${entry.votes} pts<br>
                        ${voters.length > 0 ? '(' + voters.join(', ') + ')' : ''}
                    </div>
                </div>
            `;
        }).join('');

        const nextBtn = document.getElementById('btnNextRound');
        const nextPrompt = overlay.querySelector('p[style*="italic"]');
        if (nextPrompt) nextPrompt.remove();

        if (LousticMultiplayer.isHost) {
            nextBtn.classList.remove('hidden');
            nextBtn.onclick = () => {
                overlay.classList.add('hidden');
                LousticMultiplayer.send('next_round_requested');
            };
        } else {
            nextBtn.classList.add('hidden');
            const waitMsg = document.createElement('p');
            waitMsg.style.fontStyle = 'italic';
            waitMsg.style.color = '#57606f';
            waitMsg.style.marginTop = '15px';
            waitMsg.style.textAlign = 'center';
            waitMsg.textContent = "Attente de l'hôte pour continuer...";
            nextBtn.parentNode.appendChild(waitMsg);
        }

        document.getElementById('closeVoteDetails').onclick = () => {
            overlay.classList.add('hidden');
        };
    }

    // Phase 4 : Fin de partie
    renderGameOver() {
        document.getElementById('voteDetailsOverlay').classList.add('hidden');
        const overlay = document.getElementById('screenOverlay');
        overlay.classList.remove('hidden');

        const sorted = [...this.gameState.players].sort((a,b) => b.score - a.score);
        const grandWinner = sorted[0];

        const rows = sorted
            .map(p => `<div style="font-size:1.2rem; font-weight:bold; margin:5px 0;">${p.name} : ${p.score} pts</div>`)
            .join('');

        overlay.innerHTML = `
            <div class="interstitial" style="background:white; border:3px solid black; padding:30px; border-radius:20px; box-shadow:5px 5px 0 black; text-align:center; max-width:400px; width:90%;">
                <h1>🏆 Fin de Partie ! 🏆</h1>
                <h2 style="color:var(--c-red); margin:20px 0;">Vainqueur :<br><span style="font-size:2rem;">${grandWinner.name}</span></h2>
                <div style="margin:20px 0;">
                    ${rows}
                </div>
                <button onclick="location.href='../index.html'" style="background:#9c88ff; color:white; border:3px solid black; padding:12px; font-weight:bold; border-radius:10px; cursor:pointer; width:100%; box-shadow:3px 3px 0 black;">Retour au menu 🏠</button>
            </div>
        `;
    }

    // Grid Renderer
    renderCardsGrid(cards, selectable, onSelect) {
        const container = document.getElementById('cartesContainer');
        container.innerHTML = "";
        
        cards.forEach((src, idx) => {
            const div = document.createElement('div');
            div.className = 'carte-slot';
            div.style.cursor = selectable ? 'pointer' : 'default';
            div.innerHTML = `<img src="${src}" alt="Carte" style="width:100%; height:180px; object-fit:cover; border-radius:10px; border:2px solid black;" />`;
            
            if (selectable) {
                div.addEventListener('click', () => {
                    container.querySelectorAll('.carte-slot').forEach(c => c.style.border = 'none');
                    div.style.border = '4px solid #e84393';
                    div.style.borderRadius = '14px';
                    if (onSelect) onSelect(idx);
                });
            }
            container.appendChild(div);
        });
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
    const game = new GalerieMultiplayerGame();
    game.init();
});
