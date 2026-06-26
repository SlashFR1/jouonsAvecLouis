// Multiplayer Alias (Codenames) game logic

class AliasMultiplayerGame {
    constructor() {
        this.gameState = null;
        this.myTeam = 'rose'; // rose ou jaune
        this.myRole = 'guesser'; // spymaster ou guesser
        this.app = document.getElementById('app');

        this.handleStateUpdate = this.handleStateUpdate.bind(this);
    }

    init() {
        LousticMultiplayer.init("Alias 📲");

        // Gérer le sélecteur de rôle/équipe dans le lobby
        LousticMultiplayer.onPlayersChange((players) => {
            if (!document.getElementById('role-selection-wrapper')) {
                const lobbyPanel = document.querySelector('.lobby-panel');
                if (lobbyPanel) {
                    const wrapper = document.createElement('div');
                    wrapper.id = 'role-selection-wrapper';
                    wrapper.className = 'role-selection-container';
                    wrapper.innerHTML = `
                        <hr style="border:1px dashed #ccc; margin: 15px 0;">
                        <h3 style="margin-top:0;">Choisissez votre équipe et votre rôle :</h3>
                        <div style="font-weight:bold; margin-bottom:5px;">Équipe :</div>
                        <div class="role-btn-group" style="display:flex; gap:10px; margin-bottom:12px;">
                            <button type="button" id="btn-select-rose" class="role-select-btn active-rose" style="flex:1; padding:10px; border:3px solid black; border-radius:10px; font-weight:bold; cursor:pointer;">Rose 🌸</button>
                            <button type="button" id="btn-select-jaune" class="role-select-btn" style="flex:1; padding:10px; border:3px solid black; border-radius:10px; font-weight:bold; cursor:pointer;">Jaune 🍋</button>
                        </div>
                        <div style="font-weight:bold; margin-bottom:5px;">Rôle :</div>
                        <div class="role-btn-group" style="display:flex; gap:10px;">
                            <button type="button" id="btn-select-guesser" class="role-select-btn active-rose" style="flex:1; padding:10px; border:3px solid black; border-radius:10px; font-weight:bold; cursor:pointer;">Devineur (Guesser)</button>
                            <button type="button" id="btn-select-spymaster" class="role-select-btn" style="flex:1; padding:10px; border:3px solid black; border-radius:10px; font-weight:bold; cursor:pointer;">Maître (Spymaster)</button>
                        </div>
                    `;

                    const hostCtrls = document.getElementById('host-controls');
                    const playerStatus = document.getElementById('player-status');
                    const insertBeforeEl = hostCtrls || playerStatus;
                    if (insertBeforeEl) {
                        insertBeforeEl.parentNode.insertBefore(wrapper, insertBeforeEl);
                    }

                    this.myTeam = 'rose';
                    this.myRole = 'guesser';

                    const updateBtnStyles = () => {
                        const activeClass = this.myTeam === 'rose' ? 'active-rose' : 'active-jaune';

                        document.getElementById('btn-select-rose').className = `role-select-btn ${this.myTeam === 'rose' ? 'active-rose' : ''}`;
                        document.getElementById('btn-select-jaune').className = `role-select-btn ${this.myTeam === 'jaune' ? 'active-jaune' : ''}`;

                        document.getElementById('btn-select-guesser').className = `role-select-btn ${this.myRole === 'guesser' ? activeClass : ''}`;
                        document.getElementById('btn-select-spymaster').className = `role-select-btn ${this.myRole === 'spymaster' ? activeClass : ''}`;
                    };

                    document.getElementById('btn-select-rose').onclick = () => { this.myTeam = 'rose'; updateBtnStyles(); this.syncRole(); };
                    document.getElementById('btn-select-jaune').onclick = () => { this.myTeam = 'jaune'; updateBtnStyles(); this.syncRole(); };
                    document.getElementById('btn-select-guesser').onclick = () => { this.myRole = 'guesser'; updateBtnStyles(); this.syncRole(); };
                    document.getElementById('btn-select-spymaster').onclick = () => { this.myRole = 'spymaster'; updateBtnStyles(); this.syncRole(); };

                    this.syncRole();
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
                this.setupHostGame(payload.players);
            }
        });
    }

    syncRole() {
        if (LousticMultiplayer.channel) {
            LousticMultiplayer.channel.track({
                isHost: LousticMultiplayer.isHost,
                id: LousticMultiplayer.getPlayerId(),
                team: this.myTeam,
                role: this.myRole
            });
        }
    }

    // ==========================================
    // LOGIQUE DE L'HÔTE
    // ==========================================

    setupHostGame(players) {
        const seed = Math.floor(Math.random() * 100000);
        const seededRandom = this.mulberry32(seed);

        // Récupérer les mots
        const mots = (typeof LISTE_MOTS !== 'undefined') ? LISTE_MOTS : ["TEST"];
        const shuffledWords = this.shuffleWithRng([...mots], seededRandom).slice(0, 25);

        // Types de cartes
        let types = ['assassin'];
        for (let i = 0; i < 8; i++) types.push('rose');
        for (let i = 0; i < 7; i++) types.push('jaune');
        for (let i = 0; i < 9; i++) types.push('neutre');
        types = this.shuffleWithRng(types, seededRandom);

        const cards = shuffledWords.map((word, index) => ({
            id: index,
            word: word,
            type: types[index],
            revealed: false
        }));

        this.gameState = {
            phase: "clue_submission",
            currentTeam: "rose",
            scores: { rose: 8, jaune: 7 },
            gameOver: false,
            winner: "",
            guessesAllowed: 0,
            seed: seed,
            cards: cards,
            clueWord: "",
            clueNumber: 0,
            history: []
        };

        this.broadcastState();
    }

    handleHostEvents(event, payload) {
        if (event === 'clue_submitted') {
            this.gameState.clueWord = payload.word;
            this.gameState.clueNumber = payload.number;
            this.gameState.guessesAllowed = payload.number + 1;
            this.gameState.phase = "guessing";
            
            this.gameState.history.push(`Maitre ${this.gameState.currentTeam.toUpperCase()} : "${payload.word}" (${payload.number})`);
            this.broadcastState();
        }
        else if (event === 'card_guessed') {
            const card = this.gameState.cards.find(c => c.id === payload.cardId);
            if (!card || card.revealed || this.gameState.gameOver) return;

            card.revealed = true;
            this.gameState.guessesAllowed--;

            this.gameState.history.push(`Devineur : ${card.word} (${card.type.toUpperCase()})`);

            if (card.type === 'assassin') {
                // Défaite immédiate
                this.gameState.gameOver = true;
                this.gameState.winner = (this.gameState.currentTeam === 'rose') ? 'jaune' : 'rose';
                this.gameState.phase = "game_over";
            }
            else if (card.type === this.gameState.currentTeam) {
                // Bonne réponse
                this.gameState.scores[this.gameState.currentTeam]--;
                
                // Vérifier victoire
                if (this.gameState.scores[this.gameState.currentTeam] <= 0) {
                    this.gameState.gameOver = true;
                    this.gameState.winner = this.gameState.currentTeam;
                    this.gameState.phase = "game_over";
                } 
                else if (this.gameState.guessesAllowed <= 0) {
                    // Fin du tour
                    this.gameState.currentTeam = (this.gameState.currentTeam === 'rose') ? 'jaune' : 'rose';
                    this.gameState.phase = "clue_submission";
                }
            }
            else {
                // Mauvaise réponse (Neutre ou Ennemi)
                if (card.type === 'rose' || card.type === 'jaune') {
                    this.gameState.scores[card.type]--;
                    // Vérifier victoire de l'autre équipe
                    if (this.gameState.scores[card.type] <= 0) {
                        this.gameState.gameOver = true;
                        this.gameState.winner = card.type;
                        this.gameState.phase = "game_over";
                    }
                }
                
                if (!this.gameState.gameOver) {
                    this.gameState.currentTeam = (this.gameState.currentTeam === 'rose') ? 'jaune' : 'rose';
                    this.gameState.phase = "clue_submission";
                }
            }

            this.broadcastState();
        }
        else if (event === 'pass_turn') {
            this.gameState.currentTeam = (this.gameState.currentTeam === 'rose') ? 'jaune' : 'rose';
            this.gameState.phase = "clue_submission";
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

        // Récupérer mon rôle et mon équipe depuis la présence (ou variables locales si non sync)
        const myName = LousticMultiplayer.username;
        const myPresence = LousticMultiplayer.players.find(p => p.name === myName);
        if (myPresence) {
            this.myTeam = myPresence.team || 'rose';
            this.myRole = myPresence.role || 'guesser';
        }

        // Masquer le lobby, afficher l'aire de jeu
        document.getElementById('lobby-root').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');
        document.getElementById('game-info').classList.remove('hidden');

        // Mettre à jour l'en-tête (Scores et tour)
        document.getElementById('score-rose').innerText = `Rose : ${this.gameState.scores.rose}`;
        document.getElementById('score-jaune').innerText = `Jaune : ${this.gameState.scores.jaune}`;
        
        const turnDisp = document.getElementById('current-turn-display');
        turnDisp.innerText = `Tour : ${this.gameState.currentTeam.toUpperCase()}`;
        turnDisp.style.color = (this.gameState.currentTeam === 'rose') ? '#e84393' : '#fbc531';

        // Render plateau de jeu
        this.renderBoard();
        this.renderHistory();

        const isMyTurn = (this.gameState.currentTeam === this.myTeam);

        if (this.gameState.phase === "clue_submission") {
            const isSpymaster = (this.myRole === 'spymaster');
            
            document.getElementById('guesser-controls').classList.add('hidden');
            
            if (isMyTurn && isSpymaster) {
                // Je suis le spymaster dont c'est le tour -> saisir l'indice
                document.getElementById('spymaster-controls').classList.remove('hidden');
                document.getElementById('game-status-message').innerText = "Rédigez un indice pour votre équipe !";
                
                document.getElementById('validate-clue-btn').onclick = () => {
                    const word = document.getElementById('clue-word').value.trim();
                    const num = parseInt(document.getElementById('clue-number').value);
                    if (!word) return alert("Veuillez entrer un mot indice !");
                    if (word.includes(" ")) return alert("L'indice doit être un seul mot !");
                    
                    document.getElementById('clue-word').value = "";
                    document.getElementById('clue-number').value = "1";
                    
                    LousticMultiplayer.send('clue_submitted', {
                        word: word,
                        number: num
                    });
                };
            } else {
                document.getElementById('spymaster-controls').classList.add('hidden');
                document.getElementById('game-status-message').innerText = `Le Spymaster ${this.gameState.currentTeam.toUpperCase()} rédige son indice...`;
            }
        }
        else if (this.gameState.phase === "guessing") {
            const isGuesser = (this.myRole === 'guesser');
            
            document.getElementById('spymaster-controls').classList.add('hidden');
            
            document.getElementById('game-status-message').innerText = `Indice : "${this.gameState.clueWord}" (${this.gameState.clueNumber}) | Essais restants : ${this.gameState.guessesAllowed}`;

            if (isMyTurn && isGuesser) {
                // Je suis un devineur dont c'est le tour -> fin de tour et click actif
                document.getElementById('guesser-controls').classList.remove('hidden');
                document.getElementById('pass-turn-btn').onclick = () => {
                    LousticMultiplayer.send('pass_turn');
                };
            } else {
                document.getElementById('guesser-controls').classList.add('hidden');
            }
        }
        else if (this.gameState.phase === "game_over") {
            document.getElementById('spymaster-controls').classList.add('hidden');
            document.getElementById('guesser-controls').classList.add('hidden');
            
            document.getElementById('game-status-message').innerHTML = `<span style="font-size:1.5rem; color:red;">VICTOIRE DES ${this.gameState.winner.toUpperCase()} ! 🎉</span>`;
            
            // Ouvrir modal de fin
            this.showEndModal();
        }
    }

    renderBoard() {
        const container = document.getElementById('board-container');
        container.innerHTML = "";

        const isSpymaster = (this.myRole === 'spymaster');
        const isMyTurn = (this.gameState.currentTeam === this.myTeam);
        const isGuesser = (this.myRole === 'guesser');
        const activeGuessing = (this.gameState.phase === 'guessing' && isMyTurn && isGuesser);

        this.gameState.cards.forEach(card => {
            const btn = document.createElement('button');
            btn.className = 'game-card';
            btn.innerText = card.word;

            // Déterminer la couleur de fond
            // Spymaster voit toutes les couleurs. Guesser ne voit que les révélées.
            const showColor = isSpymaster || card.revealed || this.gameState.gameOver;

            if (showColor) {
                btn.classList.add(`team-${card.type}`);
                btn.disabled = true;

                // Cadrage pointillés si Spymaster et non révélée
                if (isSpymaster && !card.revealed && !this.gameState.gameOver) {
                    btn.classList.add('master-hint');
                }
            } else {
                btn.style.backgroundColor = '#bdc3c7';
                
                if (activeGuessing) {
                    btn.onclick = () => {
                        if (confirm(`Voulez-vous valider le mot : "${card.word}" ?`)) {
                            LousticMultiplayer.send('card_guessed', { cardId: card.id });
                        }
                    };
                } else {
                    btn.disabled = true;
                }
            }

            container.appendChild(btn);
        });
    }

    renderHistory() {
        const ul = document.getElementById('history-list');
        ul.innerHTML = "";
        
        // Afficher les indices et choix par ordre inverse (plus récent en haut)
        [...this.gameState.history].reverse().forEach(msg => {
            const li = document.createElement('li');
            li.style.margin = '4px 0';
            li.innerText = msg;
            
            if (msg.includes('MAITRE')) {
                li.style.color = msg.includes('ROSE') ? '#e84393' : '#d2a600';
            } else {
                li.style.color = '#2f3640';
                li.style.fontWeight = 'normal';
            }
            ul.appendChild(li);
        });
    }

    showEndModal() {
        const modal = document.getElementById('custom-modal');
        if (!modal) return;
        
        document.getElementById('modal-title').innerText = "FIN DE LA MISSION";
        document.getElementById('modal-message').innerText = `L'équipe ${this.gameState.winner.toUpperCase()} remporte la victoire !`;
        
        modal.classList.remove('hidden');
        modal.classList.add('visible');

        document.getElementById('modal-close-btn').onclick = () => {
            modal.classList.add('hidden');
            modal.classList.remove('visible');
            location.reload(); // Recharger pour retourner au lobby
        };
    }

    // RNG Helpers
    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    }

    shuffleWithRng(array, rng) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(rng() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', () => {
    const game = new AliasMultiplayerGame();
    game.init();
});
