// Loustic Multiplayer Common Library (Supabase Realtime)
// Handles connection, room management, lobby UI, and event broadcasting.

const LousticMultiplayer = {
    gameName: "",
    supabase: null,
    channel: null,
    roomCode: "",
    username: "",
    isHost: false,
    players: [],
    onEventCallback: null,
    onPlayersChangeCallback: null,
    onStartCallback: null,

    // Inserer le CSS du lobby de manière dynamique
    injectStyles() {
        if (document.getElementById('loustic-multiplayer-styles')) return;
        const styles = document.createElement('style');
        styles.id = 'loustic-multiplayer-styles';
        styles.innerHTML = `
            .lobby-screen {
                max-width: 500px;
                margin: 40px auto;
                padding: 20px;
                font-family: 'Fredoka', sans-serif;
            }
            .lobby-panel {
                background: white;
                border: 3px solid #000;
                border-radius: 20px;
                padding: 25px;
                box-shadow: 6px 6px 0px rgba(0,0,0,0.8);
                margin-top: 20px;
                color: #2d3436;
            }
            .lobby-title {
                font-family: 'Carter One', cursive;
                text-align: center;
                color: #2d3436;
                text-shadow: 2px 2px 0px #fff;
                margin-bottom: 20px;
            }
            .lobby-input-group {
                margin-bottom: 20px;
                text-align: left;
            }
            .lobby-input-group label {
                display: block;
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 1.1rem;
            }
            .lobby-input {
                width: 100%;
                padding: 12px;
                font-size: 1.1rem;
                font-family: 'Fredoka', sans-serif;
                border: 3px solid #000;
                border-radius: 10px;
                box-sizing: border-box;
                background-color: #fff;
                box-shadow: inset 2px 2px 0px rgba(0,0,0,0.1);
            }
            .lobby-btn {
                font-family: 'Fredoka', sans-serif;
                font-size: 1.1rem;
                font-weight: bold;
                padding: 12px 20px;
                border: 3px solid #000;
                border-radius: 12px;
                box-shadow: 4px 4px 0px #000;
                cursor: pointer;
                transition: transform 0.1s ease, box-shadow 0.1s ease;
                display: inline-block;
                text-align: center;
                box-sizing: border-box;
            }
            .lobby-btn:hover {
                transform: translateY(-2px);
                box-shadow: 6px 6px 0px #000;
            }
            .lobby-btn:active {
                transform: translateY(2px);
                box-shadow: 2px 2px 0px #000;
            }
            .lobby-btn-primary { background-color: #9c88ff; color: white; }
            .lobby-btn-success { background-color: #4cd137; color: white; }
            .lobby-btn-danger { background-color: #e84118; color: white; }
            
            .room-code-container {
                text-align: center;
                margin-bottom: 20px;
                padding: 15px;
                background: #f1f2f6;
                border: 2px dashed #000;
                border-radius: 12px;
            }
            .room-code-value {
                font-size: 2.2rem;
                font-weight: bold;
                letter-spacing: 4px;
                color: #e84393;
                margin-top: 5px;
            }
            .lobby-players-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 15px 0;
                min-height: 50px;
                justify-content: center;
            }
            .lobby-player-tag {
                background: #fbc531;
                border: 2px solid #000;
                border-radius: 20px;
                padding: 6px 15px;
                font-weight: bold;
                box-shadow: 2px 2px 0px #000;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .lobby-player-tag.host-tag {
                background: #4cd137;
                color: white;
            }
            .lobby-qr-img {
                border: 3px solid #000;
                border-radius: 10px;
                margin: 15px auto;
                display: block;
                box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(styles);
    },

    // Initialisation
    init(gameName, appContainerId = "app") {
        this.gameName = gameName;
        this.injectStyles();
        
        // Initialiser Supabase
        if (typeof supabase === 'undefined') {
            document.getElementById(appContainerId).innerHTML = `
                <div class="lobby-screen">
                    <div class="lobby-panel" style="background:#ff6b6b; color:white; border:3px solid black;">
                        <h2>Erreur de Chargement</h2>
                        <p>Impossible de charger la librairie Supabase client. Veuillez verifier votre connexion internet.</p>
                    </div>
                </div>`;
            return;
        }

        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
            document.getElementById(appContainerId).innerHTML = `
                <div class="lobby-screen">
                    <div class="lobby-panel" style="border: 3px solid #000;">
                        <h2 style="color:#e84118;">Configuration requise 🛠️</h2>
                        <p>Pour jouer en mode plusieurs téléphones, veuillez copier vos clés de projet dans le fichier :</p>
                        <code style="display:block; background:#f1f2f6; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:0.9rem; word-break:break-all;">jouonsAvecLouis/supabase-config.js</code>
                        <p style="margin-top:15px;">Vous pouvez créer un projet gratuitement en 2 minutes sur <a href="https://supabase.com" target="_blank">supabase.com</a>.</p>
                    </div>
                </div>`;
            return;
        }

        this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

        // Check if room code is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoom = urlParams.get('room');
        
        this.renderLobbyAuth(appContainerId, urlRoom || "");
    },

    // Rendu de l'écran de saisie pseudo / code
    renderLobbyAuth(containerId, initialRoomCode = "") {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="lobby-screen">
                <h1 class="lobby-title">${this.gameName}</h1>
                <div class="lobby-panel">
                    <div class="lobby-input-group">
                        <label for="lobby-username">Votre pseudo</label>
                        <input type="text" id="lobby-username" class="lobby-input" placeholder="Entrez votre nom..." maxlength="15">
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button id="btn-create-lobby" class="lobby-btn lobby-btn-primary" style="flex: 1;">Créer une partie 👑</button>
                    </div>

                    <div style="text-align: center; margin: 20px 0; font-weight: bold; position: relative;">
                        <span style="background: white; padding: 0 10px; position: relative; z-index: 2;">OU</span>
                        <div style="position: absolute; top: 50%; left: 0; right: 0; border-top: 2px dashed #ccc; z-index: 1;"></div>
                    </div>

                    <div class="lobby-input-group">
                        <label for="lobby-code">Code du salon à rejoindre</label>
                        <input type="text" id="lobby-code" class="lobby-input" placeholder="Ex: K9Z4" style="text-transform: uppercase;" value="${initialRoomCode}" maxlength="4">
                    </div>
                    
                    <button id="btn-join-lobby" class="lobby-btn lobby-btn-success" style="width: 100%; margin-top: 10px;">Rejoindre la partie 🎮</button>
                </div>
            </div>
        `;

        // Restaurer le pseudo du localStorage
        let storedName = "";
        try {
            storedName = localStorage.getItem('loustic_username') || "";
        } catch (e) {
            console.warn("localStorage bloqué");
        }
        if (storedName) {
            document.getElementById('lobby-username').value = storedName;
        }

        // Event listeners
        document.getElementById('btn-create-lobby').addEventListener('click', () => {
            const username = document.getElementById('lobby-username').value.trim();
            if (!username) return alert("Veuillez entrer un pseudo !");
            try { localStorage.setItem('loustic_username', username); } catch(e) {}
            this.createRoom(username, containerId);
        });

        document.getElementById('btn-join-lobby').addEventListener('click', () => {
            const username = document.getElementById('lobby-username').value.trim();
            const code = document.getElementById('lobby-code').value.trim().toUpperCase();
            if (!username) return alert("Veuillez entrer un pseudo !");
            if (!code || code.length !== 4) return alert("Veuillez entrer un code de salon valide à 4 lettres !");
            try { localStorage.setItem('loustic_username', username); } catch(e) {}
            this.joinRoom(code, username, containerId);
        });
    },

    // Générer un code salon unique de 4 lettres majuscules
    generateCode() {
        const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // Pas de O pour éviter confusion avec 0
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Créer une room
    createRoom(username, containerId) {
        this.roomCode = this.generateCode();
        this.username = username;
        this.isHost = true;
        
        // Mettre à jour l'URL sans recharger la page (peut bloquer sur file:// avec Firefox)
        try {
            const newUrl = window.location.pathname + '?room=' + this.roomCode;
            window.history.replaceState(null, '', newUrl);
        } catch(e) {
            console.warn("Impossible de modifier l'URL (comportement normal si ouvert en local sous Firefox)");
        }

        this.subscribeToChannel(containerId);
    },

    // Rejoindre une room
    joinRoom(code, username, containerId) {
        this.roomCode = code.toUpperCase();
        this.username = username;
        this.isHost = false;

        // Mettre à jour l'URL (peut bloquer sur file:// avec Firefox)
        try {
            const newUrl = window.location.pathname + '?room=' + this.roomCode;
            window.history.replaceState(null, '', newUrl);
        } catch(e) {
            console.warn("Impossible de modifier l'URL (comportement normal si ouvert en local sous Firefox)");
        }

        this.subscribeToChannel(containerId);
    },

    // Souscription Supabase Realtime (Presence & Broadcast)
    subscribeToChannel(containerId) {
        const roomChannelName = `loustic-room-${this.roomCode}`;
        
        this.channel = this.supabase.channel(roomChannelName, {
            config: {
                presence: {
                    key: this.username
                },
                broadcast: {
                    self: true
                }
            }
        });

        // Afficher l'écran d'attente
        this.renderLobbyWaiting(containerId);

        // Gérer les connexions et déconnexions (Presence)
        this.channel.on('presence', { event: 'sync' }, () => {
            const state = this.channel.presenceState();
            const rawPlayers = [];
            for (const key in state) {
                // state[key] est un tableau
                const pInfo = state[key][0];
                rawPlayers.push({
                    name: key,
                    isHost: pInfo.isHost || false,
                    id: pInfo.id
                });
            }

            // Trier pour mettre l'hôte en premier, puis par nom
            this.players = rawPlayers.sort((a, b) => {
                if (a.isHost && !b.isHost) return -1;
                if (!a.isHost && b.isHost) return 1;
                return a.name.localeCompare(b.name);
            });

            this.updatePlayersListUI();

            // S'il n'y a plus d'hôte dans la room après une déco, le premier joueur devient l'hôte si c'est nous
            const hostExists = this.players.some(p => p.isHost);
            if (!hostExists && this.players.length > 0) {
                if (this.players[0].name === this.username) {
                    this.isHost = true;
                    this.channel.track({ isHost: true, id: this.getPlayerId() });
                    document.getElementById('host-controls').style.display = 'block';
                    document.getElementById('player-status').style.display = 'none';
                }
            }

            if (this.onPlayersChangeCallback) {
                this.onPlayersChangeCallback(this.players);
            }
        });

        // Gérer les messages de jeu (Broadcast) avec wildcard robuste
        this.channel.on('broadcast', { event: '*' }, (response) => {
            console.log(`[Broadcast Recu] Event: ${response.event}`, response.payload);
            
            // Si le signal de démarrage est reçu
            if (response.event === 'game_started') {
                const statusEl = document.getElementById('player-status');
                if (statusEl) {
                    statusEl.innerHTML = "🚀 Lancement en cours... (signal reçu)";
                    statusEl.style.color = "#4cd137";
                    statusEl.style.fontWeight = "bold";
                    statusEl.style.display = "block";
                }
                
                if (this.onStartCallback) {
                    if (this.isHost) {
                        if (statusEl) statusEl.innerHTML += "<br>Hôte : Attente 800ms...";
                        setTimeout(() => {
                            if (statusEl) statusEl.innerHTML += "<br>Hôte : Exécution de onStartCallback...";
                            try {
                                this.onStartCallback(response.payload);
                                if (statusEl) statusEl.innerHTML += "<br>Hôte : callback exécuté avec succès !";
                            } catch (e) {
                                if (statusEl) statusEl.innerHTML += `<br><span style="color:red">Erreur : ${e.message}</span>`;
                                console.error("Erreur onStartCallback:", e);
                            }
                        }, 800);
                    } else {
                        try {
                            this.onStartCallback(response.payload);
                        } catch(e) {
                            console.error(e);
                        }
                    }
                }
            } else if (this.onEventCallback) {
                this.onEventCallback(response.event, response.payload);
            }
        });

        // S'abonner et s'enregistrer
        this.channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // S'enregistrer en tant que présent dans la room
                const playerInfo = {
                    isHost: this.isHost,
                    id: this.getPlayerId()
                };
                await this.channel.track(playerInfo);
            }
        });
    },

    getPlayerId() {
        let id = "";
        try { id = localStorage.getItem('loustic_player_id'); } catch(e) {}
        if (!id) {
            id = Math.random().toString(36).substring(2, 9);
            try { localStorage.setItem('loustic_player_id', id); } catch(e) {}
        }
        return id;
    },

    // Rendu de l'écran d'attente
    renderLobbyWaiting(containerId) {
        const container = document.getElementById(containerId);
        const joinUrl = window.location.href;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;

        container.innerHTML = `
            <div class="lobby-screen">
                <h1 class="lobby-title">${this.gameName}</h1>
                <div class="lobby-panel" style="text-align: center;">
                    <div class="room-code-container">
                        <div>CODE DU SALON</div>
                        <div class="room-code-value" id="display-room-code">${this.roomCode}</div>
                    </div>

                    <img src="${qrApiUrl}" class="lobby-qr-img" alt="QR Code Rejoindre" />
                    <p style="font-size: 0.9rem; color: #57606f; margin-bottom: 20px;">
                        Scannez ce QR Code avec un autre téléphone pour rejoindre instantanément !
                    </p>

                    <hr style="border:1px dashed #ccc; margin: 20px 0;">

                    <h3>Joueurs connectés :</h3>
                    <div id="lobby-players-list" class="lobby-players-list">
                        <!-- Rempli en JS par Presence -->
                    </div>

                    <div id="host-controls" style="${this.isHost ? 'display:block;' : 'display:none;'} margin-top: 30px;">
                        <button id="btn-start-game" class="lobby-btn lobby-btn-danger" style="width:100%; font-size: 1.2rem;">Lancer la partie 🚀</button>
                    </div>

                    <div id="player-status" style="${!this.isHost ? 'display:block;' : 'display:none;'} margin-top: 30px; font-style: italic; color: #57606f;">
                        🎮 En attente de l'hôte pour lancer la partie...
                    </div>
                </div>
            </div>
        `;

        if (this.isHost) {
            document.getElementById('btn-start-game').addEventListener('click', () => {
                if (this.players.length < 2) {
                    return alert("Il faut au moins 2 joueurs pour lancer la partie !");
                }
                
                // Mettre à jour l'interface de l'hôte immédiatement
                document.getElementById('btn-start-game').innerText = "Lancement...";
                document.getElementById('btn-start-game').disabled = true;

                // Diffuser le signal de démarrage (les clients verront 'Lancement en cours...')
                this.send('game_started', {
                    players: this.players,
                    hostName: this.username
                });
            });
        }
    },

    // Mise à jour de la liste des joueurs
    updatePlayersListUI() {
        const listDiv = document.getElementById('lobby-players-list');
        if (!listDiv) return;
        
        listDiv.innerHTML = this.players.map(p => `
            <div class="lobby-player-tag ${p.isHost ? 'host-tag' : ''}">
                ${p.isHost ? '👑' : '👤'} ${p.name} ${p.name === this.username ? '(Moi)' : ''}
            </div>
        `).join('');
    },

    // Diffuser un événement de jeu à tout le monde dans la room
    send(event, payload = {}) {
        if (!this.channel) return;
        
        // Inclure le pseudo de l'émetteur par sécurité
        payload._sender = this.username;

        this.channel.send({
            type: 'broadcast',
            event: event,
            payload: payload
        }).then(resp => {
            if (resp !== 'ok') {
                console.error("Supabase Broadcast non-ok:", resp);
                const statusEl = document.getElementById('player-status');
                if (statusEl) {
                    statusEl.innerHTML += `<br><span style="color:red">Erreur Broadcast (${event}): ${resp}</span>`;
                    statusEl.style.display = "block";
                }
            }
        }).catch(err => {
            console.error("Erreur d'envoi de broadcast:", err);
            const statusEl = document.getElementById('player-status');
            if (statusEl) {
                statusEl.innerHTML += `<br><span style="color:red">Exception Broadcast (${event}): ${err.message}</span>`;
                statusEl.style.display = "block";
            }
        });
    },

    // Callbacks d'événements à brancher par le jeu spécifique
    onEvent(callback) {
        this.onEventCallback = callback;
    },

    onPlayersChange(callback) {
        this.onPlayersChangeCallback = callback;
    },

    onStart(callback) {
        this.onStartCallback = callback;
    }
};
