// Loustic Multiplayer Common Library (WebSockets Realtime Engine)
// Handles connection, room management, lobby UI, and event broadcasting without any server/Vercel dependency.

const LousticMultiplayer = {
    gameName: "",
    mqttClient: null,
    roomCode: "",
    username: "",
    isHost: false,
    players: [],
    onEventCallback: null,
    onPlayersChangeCallback: null,
    onStartCallback: null,
    heartbeatTimer: null,

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
            .connection-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: bold;
                margin-bottom: 15px;
            }
            .connection-badge.connected {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .connection-badge.connecting {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
            }
        `;
        document.head.appendChild(styles);
    },

    // Chargeur dynamique MQTT.js pour garantir la connexion en toute circonstance
    ensureMqtt() {
        return new Promise((resolve) => {
            if (typeof mqtt !== 'undefined') return resolve();

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js';
            script.onload = () => resolve();
            script.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
                s2.onload = () => resolve();
                s2.onerror = () => {
                    console.error("Échec du chargement de la librairie WebSocket.");
                    resolve();
                };
                document.head.appendChild(s2);
            };
            document.head.appendChild(script);
        });
    },

    // Initialisation
    async init(gameName, appContainerId = "app") {
        this.gameName = gameName;
        this.injectStyles();
        await this.ensureMqtt();

        // Récupérer le code de salle dans l'URL si présent
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoom = urlParams.get('room');
        
        this.renderLobbyAuth(appContainerId, urlRoom || "");
    },

    // Rendu de l'écran d'accueil
    renderLobbyAuth(containerId, initialRoomCode = "") {
        const container = document.getElementById(containerId);
        if (!container) return;

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
        } catch (e) {}
        if (storedName) {
            const input = document.getElementById('lobby-username');
            if (input) input.value = storedName;
        }

        // Événements
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

    generateCode() {
        const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    getPlayerId() {
        let id = "";
        try { id = localStorage.getItem('loustic_player_id'); } catch(e) {}
        if (!id) {
            id = 'u_' + Math.random().toString(36).substring(2, 9);
            try { localStorage.setItem('loustic_player_id', id); } catch(e) {}
        }
        return id;
    },

    // Créer une room (Hôte)
    createRoom(username, containerId) {
        this.roomCode = this.generateCode();
        this.username = username;
        this.isHost = true;

        // Présence optimiste locale immédiate pour que l'hôte s'affiche instantanément !
        this.players = [{
            name: this.username,
            isHost: true,
            id: this.getPlayerId()
        }];

        try {
            const newUrl = window.location.pathname + '?room=' + this.roomCode;
            window.history.replaceState(null, '', newUrl);
        } catch(e) {}

        this.renderLobbyWaiting(containerId);
        this.connectWebSocket(containerId);
    },

    // Rejoindre une room (Invité)
    joinRoom(code, username, containerId) {
        this.roomCode = code.toUpperCase();
        this.username = username;
        this.isHost = false;

        // Présence optimiste locale immédiate pour que le joueur s'affiche instantanément !
        this.players = [{
            name: this.username,
            isHost: false,
            id: this.getPlayerId()
        }];

        try {
            const newUrl = window.location.pathname + '?room=' + this.roomCode;
            window.history.replaceState(null, '', newUrl);
        } catch(e) {}

        this.renderLobbyWaiting(containerId);
        this.connectWebSocket(containerId);
    },

    // Écran d'attente du salon
    renderLobbyWaiting(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const joinUrl = window.location.href;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;

        container.innerHTML = `
            <div class="lobby-screen">
                <h1 class="lobby-title">${this.gameName}</h1>
                <div class="lobby-panel" style="text-align: center;">
                    <div id="connection-status-badge" class="connection-badge connecting">
                        📡 Connexion au réseau en cours...
                    </div>

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
                        <!-- Rempli immédiatement en local puis synchronisé en temps réel -->
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

        // Mise à jour immédiate de l'UI avec le joueur local
        this.updatePlayersListUI();

        if (this.isHost) {
            const startBtn = document.getElementById('btn-start-game');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    if (this.players.length < 2) {
                        return alert("Il faut au moins 2 joueurs pour lancer la partie !");
                    }
                    startBtn.innerText = "Lancement...";
                    startBtn.disabled = true;

                    this.send('game_started', {
                        players: this.players,
                        hostName: this.username
                    });
                });
            }
        }

        if (this.onPlayersChangeCallback) {
            this.onPlayersChangeCallback(this.players);
        }
    },

    // Mise à jour graphique de la liste des joueurs
    updatePlayersListUI() {
        const listDiv = document.getElementById('lobby-players-list');
        if (!listDiv) return;

        // Trier pour mettre l'hôte en tête
        const sorted = [...this.players].sort((a, b) => {
            if (a.isHost && !b.isHost) return -1;
            if (!a.isHost && b.isHost) return 1;
            return a.name.localeCompare(b.name);
        });

        listDiv.innerHTML = sorted.map(p => `
            <div class="lobby-player-tag ${p.isHost ? 'host-tag' : ''}">
                ${p.isHost ? '👑' : '👤'} ${p.name} ${p.id === this.getPlayerId() ? '(Moi)' : ''}
            </div>
        `).join('');
    },

    // Connexion WebSocket universelle (sans compte, gratuit, haute disponibilité)
    async connectWebSocket(containerId) {
        await this.ensureMqtt();
        if (typeof mqtt === 'undefined') {
            console.warn("MQTT non disponible, fonctionnement en mode local.");
            return;
        }

        const topic = `loustic/v4/room/${this.roomCode}`;
        const myId = this.getPlayerId();

        // Tentative de connexion via broker HiveMQ public sécurisé (TLS port 8884)
        const brokers = [
            'wss://broker.hivemq.com:8884/mqtt',
            'wss://broker.emqx.io:8084/mqtt'
        ];

        let brokerIdx = 0;
        const connectBroker = () => {
            if (this.mqttClient) {
                try { this.mqttClient.end(); } catch(e) {}
            }

            const url = brokers[brokerIdx];
            const client = mqtt.connect(url, {
                keepalive: 30,
                clientId: 'loustic_' + myId + '_' + Math.random().toString(16).substring(2, 8),
                clean: true
            });

            this.mqttClient = client;

            client.on('connect', () => {
                const badge = document.getElementById('connection-status-badge');
                if (badge) {
                    badge.className = 'connection-badge connected';
                    badge.innerHTML = '🟢 En ligne (Prêt)';
                }

                client.subscribe(topic, { qos: 0 }, (err) => {
                    if (err) {
                        console.error("Erreur subscription MQTT:", err);
                        return;
                    }

                    // Si hôte : annonce son salon
                    if (this.isHost) {
                        this.publishMqtt({
                            type: 'presence_sync',
                            players: this.players
                        });
                    } else {
                        // Si invité : annonce son arrivée
                        this.publishMqtt({
                            type: 'presence_join',
                            player: {
                                name: this.username,
                                isHost: false,
                                id: myId
                            }
                        });
                    }
                });
            });

            client.on('message', (receivedTopic, payloadBuffer) => {
                try {
                    const data = JSON.parse(payloadBuffer.toString());
                    this.handleNetworkMessage(data);
                } catch(e) {
                    console.warn("Erreur parsing message réseau:", e);
                }
            });

            client.on('error', (err) => {
                console.warn(`Erreur broker ${url}:`, err.message);
                if (brokerIdx < brokers.length - 1) {
                    brokerIdx++;
                    connectBroker();
                }
            });
        };

        connectBroker();

        // Heartbeat périodique de l'hôte pour resynchroniser les joueurs
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (this.isHost && this.mqttClient && this.mqttClient.connected) {
                this.publishMqtt({
                    type: 'presence_sync',
                    players: this.players
                });
            }
        }, 3500);

        // Annonce de départ propre à la fermeture de la fenêtre
        window.addEventListener('beforeunload', () => {
            if (this.mqttClient && this.mqttClient.connected) {
                this.publishMqtt({
                    type: 'presence_leave',
                    playerId: myId
                });
            }
        });
    },

    // Traitement des paquets réseau
    handleNetworkMessage(msg) {
        const myId = this.getPlayerId();

        // 1. Un nouveau joueur rejoint la salle
        if (msg.type === 'presence_join' && msg.player) {
            const incoming = msg.player;
            const existingIdx = this.players.findIndex(p => p.id === incoming.id || p.name.toLowerCase() === incoming.name.toLowerCase());
            if (existingIdx === -1) {
                this.players.push(incoming);
            } else {
                this.players[existingIdx] = incoming;
            }

            this.updatePlayersListUI();
            if (this.onPlayersChangeCallback) this.onPlayersChangeCallback(this.players);

            // Si je suis l'hôte, je renvoie la liste complète mise à jour à tout le monde
            if (this.isHost) {
                this.publishMqtt({
                    type: 'presence_sync',
                    players: this.players
                });
            }
        }
        // 2. Synchronisation de la liste des joueurs
        else if (msg.type === 'presence_sync' && Array.isArray(msg.players)) {
            // S'assurer que le joueur local est bien présent dans la liste
            const myEntry = this.players.find(p => p.id === myId) || {
                name: this.username,
                isHost: this.isHost,
                id: myId
            };

            const merged = [...msg.players];
            if (!merged.some(p => p.id === myId)) {
                merged.push(myEntry);
            }

            this.players = merged;
            this.updatePlayersListUI();
            if (this.onPlayersChangeCallback) this.onPlayersChangeCallback(this.players);
        }
        // 3. Un joueur quitte
        else if (msg.type === 'presence_leave' && msg.playerId) {
            this.players = this.players.filter(p => p.id !== msg.playerId);
            this.updatePlayersListUI();
            if (this.onPlayersChangeCallback) this.onPlayersChangeCallback(this.players);
        }
        // 4. Événement de jeu (broadcast)
        else if (msg.type === 'game_event') {
            const event = msg.event;
            const payload = msg.payload || {};
            payload._sender = msg._sender;

            if (event === 'game_started') {
                const statusEl = document.getElementById('player-status');
                if (statusEl) {
                    statusEl.innerHTML = "🚀 Lancement de la partie...";
                    statusEl.style.color = "#4cd137";
                    statusEl.style.display = "block";
                }

                if (this.onStartCallback) {
                    try {
                        this.onStartCallback(payload);
                    } catch(e) {
                        console.error("Erreur onStartCallback:", e);
                    }
                }
            } else if (this.onEventCallback) {
                this.onEventCallback(event, payload);
            }
        }
    },

    // Envoi d'un message réseau via MQTT
    publishMqtt(data) {
        if (!this.mqttClient || !this.mqttClient.connected) return;
        const topic = `loustic/v4/room/${this.roomCode}`;
        this.mqttClient.publish(topic, JSON.stringify(data));
    },

    // Diffuser un événement de jeu à tout le monde dans la room
    send(event, payload = {}) {
        payload._sender = this.username;

        const data = {
            type: 'game_event',
            event: event,
            payload: payload,
            _sender: this.username
        };

        this.publishMqtt(data);

        // Si boucle locale ou self-handling requis
        if (event === 'game_started' && this.isHost) {
            if (this.onStartCallback) {
                setTimeout(() => {
                    this.onStartCallback(payload);
                }, 300);
            }
        }
    },

    // Callbacks d'événements
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

window.LousticMultiplayer = LousticMultiplayer;
