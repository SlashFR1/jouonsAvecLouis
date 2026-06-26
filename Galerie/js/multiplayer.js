// Multiplayer Galerie game implementation

class GalerieMultiplayerGame {
    constructor() {
        this.gameState = null;
        this.selectedCardIdx = null;

        // Bind events
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Galerie 📲");

        // Injecter le theme select pour l'hôte sur l'écran d'attente
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

        // Ecouter les évènements
        LousticMultiplayer.onEvent((event, payload) => {
            if (event === 'state_updated') {
                this.handleStateUpdate(payload);
            }
            if (LousticMultiplayer.isHost) {
                this.handleHostEvents(event, payload);
            }
        });

        // Démarrage par l'hôte
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
        // Charger le deck d'images
        const deck = await buildDeckForTheme(theme);
        this.hostDeck = this.shuffle([...deck]);

        // Distribuer 4 cartes initiales par joueur
        const hands = {};
        players.forEach(p => {
            hands[p.name] = [];
            for (let k = 0; k < 4; k++) {
                if (this.hostDeck.length > 0) {
                    hands[p.name].push(this.hostDeck.pop());
                }
            }
        });

        this.gameState = {
            theme: theme,
            phase: "master_pick",
            players: players,
            scores: players.reduce((acc, p) => ({ ...acc, [p.name]: 0 }), {}),
            mancheActuelle: 1,
            totalManches: 3,
            masterIndex: 0,
            selections: {},
            votes: {},
            revealList: [],
            hands: hands,
            currentPhrase: ""
        };

        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        const masterName = this.gameState.players[this.gameState.masterIndex].name;
        
        if (event === 'master_card_selected') {
            this.gameState.currentPhrase = payload.phrase;
            this.gameState.selections[masterName] = {
                carte: payload.card,
                isMaster: true,
                phrase: payload.phrase
            };
            
            // Retirer de sa main
            this.gameState.hands[masterName] = this.gameState.hands[masterName].filter(c => c !== payload.card);
            
            this.gameState.phase = "players_pick";
            this.broadcastState();
        }
        else if (event === 'player_card_selected') {
            const player = payload._sender;
            this.gameState.selections[player] = {
                carte: payload.card,
                isMaster: false
            };
            
            // Retirer de sa main
            this.gameState.hands[player] = this.gameState.hands[player].filter(c => c !== payload.card);

            // Est-ce que tous les non-maîtres ont choisi ?
            const nonMasters = this.gameState.players.filter(p => p.name !== masterName);
            const allSelected = nonMasters.every(p => this.gameState.selections[p.name]);

            if (allSelected) {
                // Créer la revealList mélangée
                const list = Object.entries(this.gameState.selections).map(([playerName, data]) => ({
                    owner: playerName,
                    src: data.carte
                }));
                this.gameState.revealList = this.shuffle([...list]);
                this.gameState.phase = "voting";
            }
            this.broadcastState();
        }
        else if (event === 'player_voted') {
            const player = payload._sender;
            this.gameState.votes[player] = payload.votedFor;

            // Est-ce que tous les non-maîtres ont voté ?
            const nonMasters = this.gameState.players.filter(p => p.name !== masterName);
            const allVoted = nonMasters.every(p => this.gameState.votes[p.name]);

            if (allVoted) {
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
                this.gameState.masterIndex = (this.gameState.masterIndex + 1) % this.gameState.players.length;
                this.gameState.selections = {};
                this.gameState.votes = {};
                this.gameState.revealList = [];
                this.gameState.currentPhrase = "";
                
                // Redonner une carte à chaque joueur
                this.gameState.players.forEach(p => {
                    if (this.hostDeck.length > 0) {
                        this.gameState.hands[p.name].push(this.hostDeck.pop());
                    }
                });

                this.gameState.phase = "master_pick";
            }
            this.broadcastState();
        }
    }

    computeScoresAndAdvance() {
        const masterName = this.gameState.players[this.gameState.masterIndex].name;
        const votesRecus = {};
        this.gameState.players.forEach(p => votesRecus[p.name] = 0);

        let votesMaitre = 0;
        for (const [voter, owner] of Object.entries(this.gameState.votes)) {
            if (owner) votesRecus[owner]++;
            if (owner === masterName) votesMaitre++;
        }

        const nbVotants = this.gameState.players.length - 1;

        if (votesMaitre === 0 || votesMaitre === nbVotants) {
            // Tout le monde a trouvé ou personne n'a trouvé
            this.gameState.players.forEach(p => {
                if (p.name !== masterName) this.gameState.scores[p.name] += 2;
            });
        } else {
            // Cas standard : 3 points au maître et à ceux qui ont trouvé
            this.gameState.scores[masterName] += 3;
            for (const [voter, owner] of Object.entries(this.gameState.votes)) {
                if (owner === masterName) {
                    this.gameState.scores[voter] += 3;
                }
            }
            // 1pt bonus par vote reçu sur sa carte pour les autres joueurs
            this.gameState.players.forEach(p => {
                if (p.name !== masterName) {
                    this.gameState.scores[p.name] += votesRecus[p.name];
                }
            });
        }

        this.gameState.votesRecusThisRound = votesRecus; // Sauvegarder pour l'affichage des détails
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
        const masterName = this.gameState.players[this.gameState.masterIndex].name;
        const isMaster = (masterName === myName);

        // Masquer le lobby, afficher l'aire de jeu
        document.getElementById('app').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');

        // Mettre à jour l'en-tête
        const infoJoueur = document.getElementById('infoJoueur');
        infoJoueur.innerHTML = `Joueur : <strong>${myName}</strong>${isMaster ? ' <span style="color:#e84393;">(CONTEUR)</span>' : ''} | Score : <strong>${this.gameState.scores[myName] || 0} pts</strong>`;
        
        const phraseMaitre = document.getElementById('phraseMaître');
        phraseMaitre.textContent = this.gameState.currentPhrase ? `Indice : "${this.gameState.currentPhrase}"` : "";

        const mancheInfo = document.getElementById('mancheInfo');
        mancheInfo.textContent = `Manche ${this.gameState.mancheActuelle} / ${this.gameState.totalManches}`;

        this.renderScoresTable();

        switch (state.phase) {
            case "master_pick":
                this.renderMasterPick(isMaster, masterName);
                break;
            case "players_pick":
                this.renderPlayersPick(isMaster, masterName);
                break;
            case "voting":
                this.renderVoting(isMaster, masterName);
                break;
            case "results":
                this.renderResults(isMaster, masterName);
                break;
            case "game_over":
                this.renderGameOver();
                break;
        }
    }

    renderScoresTable() {
        const board = document.getElementById('scoresBoard');
        board.innerHTML = this.gameState.players.map(p => `
            <div style="background:white; border:2px solid black; border-radius:10px; padding:5px 10px; font-weight:bold; font-size:0.9rem; box-shadow:2px 2px 0 black;">
                ${p.name}: ${this.gameState.scores[p.name]} pts
            </div>
        `).join('');
    }

    // Phase 1 : Choix du Conteur
    renderMasterPick(isMaster, masterName) {
        const myName = LousticMultiplayer.username;
        const cards = this.gameState.hands[myName] || [];

        const validerBtn = document.getElementById('valider');
        const inputPhrase = document.getElementById('inputPhrase');
        const btnReveal = document.getElementById('btnReveal');

        btnReveal.classList.add('hidden');

        if (isMaster) {
            inputPhrase.classList.remove('hidden');
            validerBtn.classList.remove('hidden');
            
            this.renderCardsGrid(cards, true, (idx) => {
                this.selectedCardIdx = idx;
                validerBtn.dataset.selectedIndex = idx;
            });

            // Action valider
            validerBtn.onclick = () => {
                const phrase = inputPhrase.value.trim();
                if (this.selectedCardIdx === null) return alert("Sélectionnez une image d'abord !");
                if (!phrase) return alert("Écrivez une phrase ou un mot indice !");
                
                const selectedCardUrl = cards[this.selectedCardIdx];
                this.selectedCardIdx = null;
                inputPhrase.value = "";
                
                inputPhrase.classList.add('hidden');
                validerBtn.classList.add('hidden');

                LousticMultiplayer.send('master_card_selected', {
                    card: selectedCardUrl,
                    phrase: phrase
                });
            };
        } else {
            inputPhrase.classList.add('hidden');
            validerBtn.classList.add('hidden');
            
            const cardsContainer = document.getElementById('cartesContainer');
            cardsContainer.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h3>Le Conteur (${masterName}) choisit sa carte...</h3>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
            document.getElementById('zoneVote').innerHTML = "";
        }
    }

    // Phase 2 : Choix des joueurs
    renderPlayersPick(isMaster, masterName) {
        const myName = LousticMultiplayer.username;
        const cards = this.gameState.hands[myName] || [];

        const validerBtn = document.getElementById('valider');
        const inputPhrase = document.getElementById('inputPhrase');
        
        inputPhrase.classList.add('hidden');

        const hasSelected = !!this.gameState.selections[myName];

        if (isMaster) {
            validerBtn.classList.add('hidden');
            const cardsContainer = document.getElementById('cartesContainer');
            cardsContainer.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h3>Les autres joueurs choisissent leurs cartes...</h3>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
        } else {
            if (hasSelected) {
                validerBtn.classList.add('hidden');
                const cardsContainer = document.getElementById('cartesContainer');
                cardsContainer.innerHTML = `
                    <div style="text-align:center; padding:40px;">
                        <h3>Votre carte est envoyée !</h3>
                        <p>En attente des autres joueurs...</p>
                        <div class="loader-dots" style="margin:20px auto;"></div>
                    </div>
                `;
            } else {
                validerBtn.classList.remove('hidden');
                this.renderCardsGrid(cards, true, (idx) => {
                    this.selectedCardIdx = idx;
                    validerBtn.dataset.selectedIndex = idx;
                });

                validerBtn.onclick = () => {
                    if (this.selectedCardIdx === null) return alert("Sélectionnez une image d'abord !");
                    
                    const selectedCardUrl = cards[this.selectedCardIdx];
                    this.selectedCardIdx = null;
                    validerBtn.classList.add('hidden');

                    LousticMultiplayer.send('player_card_selected', {
                        card: selectedCardUrl
                    });
                };
            }
        }
    }

    // Phase 3 : Vote
    renderVoting(isMaster, masterName) {
        const myName = LousticMultiplayer.username;
        const hasVoted = !!this.gameState.votes[myName];

        const validerBtn = document.getElementById('valider');
        validerBtn.classList.add('hidden');

        if (isMaster) {
            const cardsContainer = document.getElementById('cartesContainer');
            cardsContainer.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <h3>Les joueurs votent pour retrouver votre carte !</h3>
                    <div class="loader-dots" style="margin:20px auto;"></div>
                </div>
            `;
            document.getElementById('zoneVote').innerHTML = "";
        } else {
            if (hasVoted) {
                const cardsContainer = document.getElementById('cartesContainer');
                cardsContainer.innerHTML = `
                    <div style="text-align:center; padding:40px;">
                        <h3>Vote enregistré !</h3>
                        <p>En attente des autres votes...</p>
                        <div class="loader-dots" style="margin:20px auto;"></div>
                    </div>
                `;
                document.getElementById('zoneVote').innerHTML = "";
            } else {
                // Afficher le plateau de vote
                this.renderVotingGrid(this.gameState.revealList, (idx) => {
                    const entry = this.gameState.revealList[idx];
                    
                    if (entry.owner === myName) {
                        alert("Vous ne pouvez pas voter pour votre propre carte !");
                        return;
                    }
                    
                    if (confirm(`Confirmer votre vote pour cette image ?`)) {
                        LousticMultiplayer.send('player_voted', {
                            votedFor: entry.owner
                        });
                    }
                });
            }
        }
    }

    // Phase 4 : Résultats
    renderResults(isMaster, masterName) {
        const overlay = document.getElementById('voteDetailsOverlay');
        overlay.classList.remove('hidden');

        const grid = document.getElementById('voteDetailsGrid');
        grid.innerHTML = this.gameState.revealList.map(entry => {
            const owner = entry.owner;
            const votesForThisCard = [];
            for (const [voter, votedOwner] of Object.entries(this.gameState.votes)) {
                if (votedOwner === owner) votesForThisCard.push(voter);
            }
            
            const isMasterCard = (owner === masterName);
            const cardStyle = isMasterCard ? 'border: 4px solid #4cd137;' : 'border: 2px solid black;';

            return `
                <div style="text-align:center; background:#f1f2f6; padding:10px; border-radius:10px; ${cardStyle} width:150px; box-sizing:border-box;">
                    <img src="${entry.src}" style="width:100%; height:120px; object-fit:cover; border-radius:5px; border:1px solid black;" />
                    <div style="font-weight:bold; margin-top:5px; font-size:0.9rem;">
                        ${owner} ${isMasterCard ? '👑' : ''}
                    </div>
                    <div style="font-size:0.8rem; color:#57606f; margin-top:3px;">
                        Votes (${votesForThisCard.length}) :<br>
                        ${votesForThisCard.length > 0 ? votesForThisCard.join(', ') : 'Aucun'}
                    </div>
                </div>
            `;
        }).join('');

        const nextBtn = document.getElementById('btnNextRound');
        const nextPrompt = overlay.querySelector('p[style*="italic"]');
        if (nextPrompt) nextPrompt.remove();

        if (isMaster) {
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
            waitMsg.textContent = "Attente du conteur pour continuer...";
            nextBtn.parentNode.appendChild(waitMsg);
        }

        // Fermer modal manuellement
        document.getElementById('closeVoteDetails').onclick = () => {
            overlay.classList.add('hidden');
        };
    }

    // Phase 5 : Fin de partie
    renderGameOver() {
        document.getElementById('voteDetailsOverlay').classList.add('hidden');
        const overlay = document.getElementById('screenOverlay');
        overlay.classList.remove('hidden');

        // Trouver le gagnant
        let maxScore = -Infinity;
        let winners = [];
        for (const [p, s] of Object.entries(this.gameState.scores)) {
            if (s > maxScore) {
                maxScore = s;
                winners = [p];
            } else if (s === maxScore) {
                winners.push(p);
            }
        }

        const rows = Object.entries(this.gameState.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([p, s]) => `<div style="font-size:1.2rem; font-weight:bold; margin:5px 0;">${p} : ${s} pts</div>`)
            .join('');

        overlay.innerHTML = `
            <div class="interstitial" style="background:white; border:3px solid black; padding:30px; border-radius:20px; box-shadow:5px 5px 0 black; text-align:center; max-width:400px; width:90%;">
                <h1>🏆 Fin de Partie ! 🏆</h1>
                <h2 style="color:var(--c-red); margin:20px 0;">Vainqueur(s) :<br><span style="font-size:2rem;">${winners.join(' et ')}</span></h2>
                <div style="margin:20px 0;">
                    ${rows}
                </div>
                <button onclick="location.reload()" style="background:#9c88ff; color:white; border:3px solid black; padding:12px; font-weight:bold; border-radius:10px; cursor:pointer; width:100%; box-shadow:3px 3px 0 black;">Rejouer 🎮</button>
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

    renderVotingGrid(revealList, onVote) {
        const container = document.getElementById('cartesContainer');
        container.innerHTML = "";
        
        revealList.forEach((entry, idx) => {
            const div = document.createElement('div');
            div.className = 'carte-slot';
            div.style.cursor = 'pointer';
            div.innerHTML = `<img src="${entry.src}" alt="Vote Option" style="width:100%; height:180px; object-fit:cover; border-radius:10px; border:2px solid black;" />`;
            
            div.addEventListener('click', () => {
                if (onVote) onVote(idx);
            });
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
