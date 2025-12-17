// Petite fonction utilitaire pour créer des pauses
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Game {
    constructor(playerNames, roleConfig, options = {}) {
        this.players = [];
        this.rolesToDistribute = [];
        this.unusedRoles = []; // Pour le Android
        this.day = 0;
        this.presidentId = null;
        this.lastProtectedId = null;
        this.lastEliminatedPlayer = null; // Pour annoncer l'éliminé avant la prochaine nuit
        this.lovers = [];
        this.witchHasSavePotion = true;
        this.witchHasKillPotion = true;
        this.audioEnabled = options.audioEnabled || false;

        this.initializePlayers(playerNames);
        this.prepareRoles(roleConfig);
        this.distributeRoles();
    }
    /**
     * Saves the entire current game state to localStorage.
     * Note: This saves the entire 'Game' object. More complex scenarios
     * might require selecting only the necessary data to save.
     */
    saveGame() {
        // We use JSON.stringify to convert the game object into a string.
        localStorage.setItem('savedAlienGame', JSON.stringify(this));
        console.log("Partie sauvegardée !");
    }

    /**
     * A static method to load a game state from localStorage.
     * It creates a new Game instance from the saved data.
     * @returns {Game|null} A new Game instance or null if no save exists.
     */
    static loadGame() {
        const savedData = localStorage.getItem('savedAlienGame');
        if (savedData) {
            const savedGameObject = JSON.parse(savedData);

            // The data is just a plain object, so we need to "re-hydrate" it
            // into a proper Game instance. Object.assign is a simple way to do this.
            // It copies all properties from the saved object to a new Game instance.
            // Note: This simple re-hydration won't restore methods, but it's often
            // sufficient for state data.

            // We create a dummy instance first, then overwrite its properties.
            const game = new Game([], {}); // Create with empty params
            Object.assign(game, savedGameObject);

            console.log("Partie chargée !");
            return game;
        }
        return null; // No saved game found
    }

    // --- Initialization & Setup ---

    /**
     * Creates player objects from a list of names.
     * @param {string[]} playerNames - Array of player names.
     */
    initializePlayers(playerNames) {
        playerNames.forEach((name, index) => {
            this.players.push({
                id: index, name, role: null, isAlive: true, isLover: false,
                ispresident: false, isProtected: false, votesAgainst: 0
            });
        });
    }

    /**
     * Creates and shuffles the role deck based on the provided configuration.
     * @param {object} roleConfig - An object defining the count for each role.
     */
    prepareRoles(roleConfig) {
        let roles = [];
        for (const roleKey in roleConfig) {
            for (let i = 0; i < roleConfig[roleKey]; i++) {
                roles.push({ ...ROLES[roleKey], key: roleKey });
            }
        }
        // Fisher-Yates shuffle algorithm.
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        this.rolesToDistribute = roles;
    }

    /**
     * Assigns a role to each player and sets aside extra roles for the Thief.
     */
    distributeRoles() {
        const playersWithRole = this.players.slice();
        while (this.rolesToDistribute.length > playersWithRole.length) {
            this.unusedRoles.push(this.rolesToDistribute.pop());
        }
        playersWithRole.forEach(player => {
            player.role = this.rolesToDistribute.pop();
        });
    }

    // --- Utility Functions ---

    /**
     * Retrieves a player object by their ID.
     * @param {number} id - The ID of the player to find.
     * @returns {object|undefined} The player object or undefined if not found.
     */
    getPlayerById(id) { return this.players.find(p => p.id === id); }

    /**
     * Retrieves all living players with a specific role.
     * @param {string} roleKey - The key of the role to search for (e.g., 'Scientifique').
     * @returns {object[]} An array of matching player objects.
     */
    getPlayersByRoleKey(roleKey) { return this.players.filter(p => p.role.key === roleKey && p.isAlive); }

    /**
     * Retrieves all living players, with optional filtering.
     * @param {object} [filter={}] - Optional filter criteria.
     * @returns {object[]} An array of living players.
     */
    getAlivePlayers(filter = {}) {
        return this.players.filter(p => {
            if (!p.isAlive) return false;
            if (filter.excludeId && p.id === filter.excludeId) return false;
            return true;
        });
    }

    // --- Core Game Logic ---

    /**
     * Handles the entire process of a player's death, including consequential effects
     * like the Hunter's last shot or a Lover's suicide.
     * @param {number} playerId - The ID of the player to kill.
     * @param {string} cause - The cause of death (e.g., 'aliens', 'vote').
     * @returns {Promise<object[]>} A promise that resolves to an array of all players who died in the chain reaction.
     */
    async killPlayer(playerId, cause) {
        const player = this.getPlayerById(playerId);
        let allDeadThisTurn = [];
        if (!player || !player.isAlive) return allDeadThisTurn;

        // Abort if the player was protected from a werewolf attack.
        if (cause === 'aliens' && player.isProtected) {
            return allDeadThisTurn;
        }

        player.isAlive = false;
        allDeadThisTurn.push(player);

        // Trigger Hunter's power.
        if (player.role.key === 'Ingenieur') {
            const hunterTargetId = await this.waitForPlayerAction({
                player, title: "💣 Pouvoir du Dernier Ingénieur 💣",
                instruction: `${player.name}, vous êtes mortellement blessé... Avant de succomber, vous pouvez emporter quelqu'un avec vous dans la mort !`,
                selectablePlayers: this.getAlivePlayers()
            });
            if (hunterTargetId !== null) {
                const target = this.getPlayerById(hunterTargetId);
                UI.showMessage(
                    "💥 Explosion Finale 💥",
                    `${player.name} entraîne <strong>${target.name}</strong> avec lui dans la mort !`
                );
                await this.waitForPlayerAction({
                    player: { name: "Meneur de Jeu" },
                    title: "Chaîne de Morts",
                    instruction: "L'explosion a causé une seconde victime !",
                    showPlayers: false
                });
                const deadFromHunter = await this.killPlayer(hunterTargetId, 'Ingenieur_revenge');
                allDeadThisTurn.push(...deadFromHunter);
            }
        }

        // Trigger Lover's suicide.
        if (player.isLover) {
            const otherLoverId = this.lovers.find(id => id !== player.id);
            const otherLover = this.getPlayerById(otherLoverId);
            if (otherLover && otherLover.isAlive) {
                UI.showMessage(
                    "💔 Mort d'Amour 💔",
                    `Sans ${player.name}, <strong>${otherLover.name}</strong> ne peut continuer... L'amour et la mort les réunissent.`
                );
                await this.waitForPlayerAction({
                    player: { name: "Meneur de Jeu" },
                    title: "Le Chagrin est Mortel",
                    instruction: "L'autre amoureux succombe à la douleur...",
                    showPlayers: false
                });
                const deadFromGrief = await this.killPlayer(otherLoverId, 'chagrin');
                allDeadThisTurn.push(...deadFromGrief);
            }
        }
        return [...new Set(allDeadThisTurn)]; // Return unique list of dead players.
    }

    /**
     * The main entry point to begin and run the entire game loop.
     */
    async start() {
        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "🌙 Le jour se meurt 🌙",
            instruction: "la colonie s'endort et observe les étoiles...",
            showPlayers: false,
            confirmText: "Continuer"
        });
        await this.showRoles();
        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "✨ Tout le monde a son rôle ! ✨",
            instruction: "Chacun connaît son secret. La partie va commencer dans les ténèbres...",
            showPlayers: false, confirmText: "Commencer la partie"
        });

        await this.runFirstNight();

        while (true) {
            if (this.checkWinCondition()) break;
            this.day++;
            const deadPlayersFromNight = await this.runNightPhase();
            if (this.checkWinCondition()) break;
            await this.runDayPhase(deadPlayersFromNight);
            if (this.checkWinCondition()) break;
        }

        const winner = this.checkWinCondition();
        UI.showScreen(UI.endScreen);
        UI.winTitle.textContent = winner.camp;
        UI.winMessage.textContent = winner.message;
    }

    // --- Game Phases ---

    /**
     * Iterates through players for the initial role reveal phase.
     */
    async showRoles() {
        const playerListContainer = document.getElementById('player-list-container');
        if (playerListContainer) {
            playerListContainer.style.display = 'none';
        }

        for (const player of this.players) {
            // First step: screen to pass the device to the correct player.
            await this.waitForPlayerAction({
                player,
                title: `📱 Passez le téléphone 📱`,
                instruction: `${player.name}, à vous de connaître votre secret ! Regardez votre rôle et gardez-le absolument secret.`,
                showPlayers: false
            });

            // Second step: screen that reveals the role.
            const roleDisplayHTML = `
            <div class="role-display">
                <h3 class="role-name" style="font-size: 2em; color: #ffce00; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${player.role.name}</h3>
                <p class="role-description" style="font-size: 1.1em; line-height: 1.6; color: #e0e0e0;">${player.role.description}</p>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 206, 0, 0.1); border-left: 3px solid #ffce00; border-radius: 5px;">
                    <p><strong>Camp :</strong> ${player.role.camp === 'aliens' ? '👽 Envahisseurs' : '🏠 Colons'}</p>
                </div>
            </div>
            `;
            await this.waitForPlayerAction({
                player,
                title: `✨ ${player.name}, vous êtes... ✨`,
                instruction: roleDisplayHTML,
                showPlayers: false
            });
        }

        if (playerListContainer) {
            playerListContainer.style.display = 'block';
        }
    }

    /**
     * Manages the sequence of events for the first night, including Thief and Cupid actions.
     */
    async runFirstNight() {
        this.day = 1;
        UI.showMessage(`🌙 Nuit ${this.day} 🌙`, "la colonie s'endort dans l'obscurité...");
        if (this.audioEnabled) await AudioManager.play('nuit');

        const Android = this.getPlayersByRoleKey('Android')[0];
        if (Android && this.unusedRoles.length >= 2) {
            if (this.audioEnabled) await AudioManager.play('Android');
            await this.handleThiefAction(Android);
        }

        const Officier= this.getPlayersByRoleKey('Officier')[0];
        if (Officier) {
            if (this.audioEnabled) await AudioManager.play('Officier');
            const loverIds = await this.waitForPlayerAction({
                player: Officier, title: "💕 Tour de l'officier 💕",
                instruction: "Choisissez deux joueurs à lier par les liens de l'amour.", maxSelection: 2
            });
            this.lovers = loverIds;
            loverIds.forEach(id => this.getPlayerById(id).isLover = true);
        }

        let nightReport = await this.runNightActions();
        const deadPlayers = await this.resolveNight(nightReport);
        
        // First day after first night
        await this.runDayPhase(deadPlayers);
    }

    /**
     * Manages the sequence of events for a standard night phase.
     */
    async runNightPhase() {
        UI.showMessage(`🌙 Nuit ${this.day} 🌙`, "Tout le monde s'endort dans l'obscurité...");
        if (this.audioEnabled) await AudioManager.play('nuit');

        let nightReport = await this.runNightActions();
        const deadPlayers = await this.resolveNight(nightReport);
        return deadPlayers;
    }

    /**
     * Executes the actions of all night roles in a specific, predefined order.
     * @returns {Promise<object>} A report object summarizing the night's actions.
     */
    async runNightActions() {
        let report = { wolvesTarget: null, witchSave: false, witchKill: null, protectedId: null, loupBlancTarget: null };
        this.getAlivePlayers().forEach(p => p.isProtected = false);

        // Protector's turn.
        const Garde= this.getPlayersByRoleKey('Garde')[0];
        if (Garde) {
            if (this.audioEnabled) await AudioManager.play('Garde');
            report.protectedId = await this.waitForPlayerAction({
                player: Garde, title: "🛡️ Tour du Garde 🛡️",
                instruction: "La nuit est sombre et dangereuse. Choisissez un joueur à protéger des menaces qui rôdent.",
                disabledIds: this.day > 1 ? [this.lastProtectedId] : []
            });
            if (report.protectedId !== null) {
                this.getPlayerById(report.protectedId).isProtected = true;
                this.lastProtectedId = report.protectedId;
            }
        }

        // Seer's turn.
        const Scientifique = this.getPlayersByRoleKey('Scientifique')[0];
        if (Scientifique) {
            if (this.audioEnabled) await AudioManager.play('Scientifique');
            const seerTargetId = await this.waitForPlayerAction({
                player: Scientifique, title: "🔬 Tour du Scientifique 🔬",
                instruction: "Utilisez vos instruments pour analyser secrètement un habitant et découvrir son rôle véritable.", excludeSelf: true
            });
            if (seerTargetId !== null) {
                const target = this.getPlayerById(seerTargetId);
                await this.waitForPlayerAction({
                    player: Scientifique, title: "📊 Résultats de l'Analyse 📊",
                    instruction: `Vos instruments révèlent que <strong>${target.name}</strong> est un(e) <strong style="color: #ffce00;">${target.role.name}</strong>`,
                    showPlayers: false
                });
            }
        }

        // Werewolves' turn.
        const aliens = this.getAlivePlayers().filter(p => p.role.camp === 'aliens');
        if (aliens.length > 0) {
            if (this.audioEnabled) await AudioManager.play('aliens');
            report.wolvesTarget = await this.waitForPlayerAction({
                player: aliens[0], title: "👽 Tour des Aliens 👽",
                instruction: "Sous le couvert de la nuit, vous planifiez votre prochaine action. Qui sera votre proie ?",
                selectablePlayers: this.getAlivePlayers().filter(p => p.role.camp !== 'aliens')
            });
        }

        // White Werewolf's turn (every two nights).
        const loupBlanc = this.getPlayersByRoleKey('alpha')[0];
        if (loupBlanc && this.day > 1 && this.day % 2 === 0) {
            if (this.audioEnabled) await AudioManager.play('alpha');
            report.loupBlancTarget = await this.waitForPlayerAction({
                player: loupBlanc, title: "🔥 Tour de l'Alpha 🔥",
                instruction: "Une soif de destruction vous envahit. Vous pouvez dévorer n'importe quel habitant de votre choix pour satisfaire votre faim.",
            });
        }

        // Witch's turn.
        const Medecin = this.getPlayersByRoleKey('Medecin')[0];
        if (Medecin && (this.witchHasSavePotion || this.witchHasKillPotion)) {
            if (this.audioEnabled) await AudioManager.play('Medecin');
            await this.handleWitchAction(Medecin, report);
        }

        return report;
    }

    /**
     * Calculates the final death toll of the night based on the actions taken.
     * @param {object} report - The summary of actions from the night.
     * @returns {Promise<object[]>} A promise that resolves to an array of players who died.
     */
    async resolveNight(report) {
        let deadPlayers = [];
        const processKill = async (targetId, cause) => {
            if (targetId !== null) {
                const dead = await this.killPlayer(targetId, cause);
                deadPlayers.push(...dead);
            }
        };

        if (report.wolvesTarget !== null && !report.witchSave) {
            await processKill(report.wolvesTarget, 'aliens');
        }
        await processKill(report.loupBlancTarget, 'alpha');
        await processKill(report.witchKill, 'Medecin');

        return [...new Set(deadPlayers)];
    }

    /**
     * Manages the sequence of events for the day phase, including announcements, debates, and voting.
     * @param {object[]} deadPlayersFromNight - Players who died during the preceding night.
     */
    async runDayPhase(deadPlayersFromNight) {
        // ============================================
        // 1️⃣ ANNOUNCEMENT OF THE NIGHT'S DEATHS
        // ============================================
        await this.announceMornings(deadPlayersFromNight);

        if (this.checkWinCondition()) return null;

        // ============================================
        // 2️⃣ PRESIDENT ELECTION (Day 1 only)
        // ============================================
        if (this.day === 1 && this.getAlivePlayers().length > 0) {
            await this.electPresident();
        }

        if (this.checkWinCondition()) return null;

        // ============================================
        // 3️⃣ DAY DEBATE AND ELIMINATION VOTE
        // ============================================
        await this.runDayVote();

        if (this.checkWinCondition()) return null;

        // ============================================
        // 4️⃣ ANNOUNCEMENT OF THE ELIMINATED PLAYER
        // ============================================
        await this.announceEliminated();

        return null;
    }

    /**
     * Announces the deaths that occurred during the night to all players.
     * @param {object[]} deadPlayers - Array of players who died.
     */
    async announceMornings(deadPlayers) {
        UI.showMessage(`☀️ Jour ${this.day} ☀️`, "Le soleil se lève sur la colonie...");
        if (this.audioEnabled) await AudioManager.play('jour');

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "📢 Annonce du Matin 📢",
            instruction: "La nuit a apporté des nouvelles...",
            showPlayers: false,
            confirmText: "Continuer"
        });

        // Show deaths to all players
        if (deadPlayers && deadPlayers.length > 0) {
            const deadNames = deadPlayers.map(p => p.name).join(', ');
            UI.showMessage(
                "💀 Découverte Macabre 💀",
                `Ce matin, la colonie découvre la mort tragique de : <strong>${deadNames}</strong>`
            );
        } else {
            UI.showMessage(
                "✨ Un Miracle ✨",
                "Ce matin, tous les habitants de la colonie se lèvent en bonne santé. Personne n'est mort cette nuit !"
            );
        }

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "État de la Colonie",
            instruction: deadPlayers && deadPlayers.length > 0 
                ? `Les colons sont en deuil. La colonie compte maintenant ${this.getAlivePlayers().length} survivants.`
                : `La chance sourit à la colonie. Tous les ${this.getAlivePlayers().length} habitants sont vivants.`,
            showPlayers: true,
            confirmText: "Continuer"
        });
    }

    /**
     * Handles the election of the president on Day 1.
     */
    async electPresident() {
        UI.showMessage(
            "👑 Élection du Président 👑",
            "Les colons doivent choisir un leader pour guider la colonie dans ces temps sombres..."
        );

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "🗳️ Vote pour le Président 🗳️",
            instruction: "Qui sera le leader de la colonie ? Son vote comptera double à partir de maintenant.",
            showPlayers: false,
            confirmText: "Lancer le vote"
        });

        const votedId = await this.runVote("Qui doit être le président de la colonie ?");
        if (votedId !== null) {
            this.presidentId = votedId;
            const president = this.getPlayerById(votedId);
            president.ispresident = true;

            UI.showMessage(
                "👑 Nouveau Président 👑",
                `<strong>${president.name}</strong> a été élu président de la colonie !<br><br>
                ⚡ Son pouvoir : Son vote compte désormais pour <strong>2 voix</strong> lors des éliminations.`
            );

            await this.waitForPlayerAction({
                player: { name: "Meneur de Jeu" },
                title: "Présentation du Nouveau Leader",
                instruction: `${president.name} est maintenant le président. Cliquez pour continuer.`,
                showPlayers: false,
                confirmText: "Continuer"
            });
        }
    }

    /**
     * Runs the day debate and elimination vote.
     */
    async runDayVote() {
        UI.showMessage(
            "🗣️ Débats et Accusations 🗣️",
            "C'est le moment du débat ! Qui pensez-vous être l'infiltré ? Discutez, accusez, défendez-vous..."
        );

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Débat Citoyen",
            instruction: "Vous avez du temps pour débattre et argumenter. Qui est vraiment l'alien caché parmi nous ?",
            showPlayers: true,
            confirmText: "Débat Terminé - Passer au Vote"
        });

        UI.showMessage(
            "⚖️ Justice Coloniale ⚖️",
            "Il est temps de voter pour éliminer celui que vous soupçonnez d'être l'infiltré..."
        );

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Vote d'Élimination",
            instruction: "Qui souhaitez-vous éliminer de la colonie ?",
            showPlayers: false,
            confirmText: "Lancer le vote"
        });

        const votedOutId = await this.runVote("Qui souhaitez-vous éliminer ?");
        if (votedOutId !== null) {
            const eliminatedPlayer = this.getPlayerById(votedOutId);
            await this.killPlayer(votedOutId, 'vote');
            
            // Store the eliminated player info for later announcement
            this.lastEliminatedPlayer = eliminatedPlayer;
        } else {
            UI.showMessage(
                "🤝 Indécision 🤝",
                "La colonie ne peut se mettre d'accord. Personne n'est éliminé aujourd'hui..."
            );

            await this.waitForPlayerAction({
                player: { name: "Meneur de Jeu" },
                title: "Impasse",
                instruction: "Cliquez pour continuer vers la prochaine nuit.",
                showPlayers: false,
                confirmText: "Continuer"
            });
        }
    }

    /**
     * Announces the player eliminated by vote during the day.
     */
    async announceEliminated() {
        if (!this.lastEliminatedPlayer) return;

        const eliminated = this.lastEliminatedPlayer;
        
        UI.showMessage(
            "⚔️ Sentence Prononcée ⚔️",
            `<strong>${eliminated.name}</strong> a été expulsé de la colonie !`
        );

        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Révélation de la Vraie Nature",
            instruction: `<strong>${eliminated.name}</strong> était un(e) <strong style="color: #ffce00;">${eliminated.role.name}</strong><br><br>
            <em>${eliminated.role.description}</em>`,
            showPlayers: false,
            confirmText: "La nuit se rapproche..."
        });

        this.lastEliminatedPlayer = null; // Reset for next cycle
    }

    /**
     * Conducts a "pass-around" phase to secretly announce the night's deaths to each living player.
     * @param {object[]} deadPlayers - An array of players who died.
     */
    async runSecretAnnouncementPhase(deadPlayers) {
        let announcement;
        if (deadPlayers.length === 0) {
            announcement = "Personne n'est mort cette nuit !";
        } else {
            const deadNames = deadPlayers.map(p => `${p.name} (${p.role.name})`).join(', ');
            announcement = `Ce matin, la colonie découvre la mort de : ${deadNames}`;
        }

        for (const player of this.getAlivePlayers()) {
            await this.waitForPlayerAction({
                player, title: `Passez le téléphone à ${player.name}`,
                instruction: "Découvrez ce qu'il s'est passé cette nuit.", showPlayers: false
            });
            await this.waitForPlayerAction({
                player, title: "Bilan de la Nuit",
                instruction: announcement, showPlayers: false
            });
        }
    }

    // --- Role-Specific Logic ---

    /**
     * Manages the specific UI interactions and logic for the Thief's turn.
     * @param {object} Android - The player object for the Thief.
     */
    async handleThiefAction(Android) {
        return new Promise(async resolve => {
            const card1 = this.unusedRoles[0];
            const card2 = this.unusedRoles[1];

            UI.promptAction(`🤖 Tour de l'Android 🤖`, `(${Android.name}) Dans l'obscurité, vous découvrez deux rôles cachés dans les décombres. Lequel allez-vous adopter pour mieux vous dissimuler ?`, { showButton: false });
            UI.addCustomButton(`Garder votre identité : ${Android.role.name}`, () => {
                resolve();
            });
            UI.addCustomButton(`Changer pour : ${card1.name}`, () => {
                const oldRole = Android.role;
                Android.role = card1;
                Android.swappedRole = true;
                this.unusedRoles[0] = oldRole;
                resolve();
            });
            UI.addCustomButton(`Changer pour : ${card2.name}`, () => {
                const oldRole = Android.role;
                Android.role = card2;
                Android.swappedRole = true;
                this.unusedRoles[1] = oldRole;
                resolve();
            });
        });
    }

    /**
     * Manages the specific UI interactions and logic for the Witch's turn.
     * @param {object} Medecin - The player object for the Witch.
     * @param {object} report - The night report containing the werewolves' target.
     */
    async handleWitchAction(Medecin, report) {
        return new Promise(async resolve => {
            const victim = this.getPlayerById(report.wolvesTarget);
            let instruction = "Que souhaitez-vous faire cette nuit sombre ?";
            if (victim) {
                instruction = `⚠️ ALERTE ! Les aliens ont attaqué <strong>${victim.name}</strong>.<br><br>Avez-vous les ressources pour intervenir ?`;
            }

            UI.promptAction(`💊 Tour du Médecin 💊`, `(${Medecin.name}) ${instruction}`, { showButton: false });

            if (this.witchHasSavePotion && victim) {
                UI.addCustomButton(`💉 Utiliser le Sérum de Vie`, () => {
                    report.witchSave = true;
                    this.witchHasSavePotion = false;
                    resolve();
                });
            }

            if (this.witchHasKillPotion) {
                UI.addCustomButton(`☠️ Utiliser le Poison Létal`, async () => {
                    const targetId = await this.waitForPlayerAction({
                        player: Medecin, title: "💀 Élixir Mortel 💀",
                        instruction: "Qui sera votre victime ? Choisissez sagement, car c'est votre dernier poison...",
                        selectablePlayers: this.getAlivePlayers().filter(p => p.id !== victim?.id)
                    });
                    report.witchKill = targetId;
                    this.witchHasKillPotion = false;
                    resolve();
                });
            }

            UI.addCustomButton("🛑 Ne rien faire", () => {
                resolve();
            });
        });
    }

    // --- Support Functions ---

    /**
     * Conducts a vote among living players, handling president's powers and ties.
     * @param {string} instruction - The question to ask the voters.
     * @returns {Promise<number|null>} The ID of the player voted out, or null in case of an unbreakable tie.
     */
    async runVote(instruction) {
        let votes = {};
        this.getAlivePlayers().forEach(p => votes[p.id] = 0);

        for (const voter of this.getAlivePlayers()) {
            const targetId = await this.waitForPlayerAction({
                player: voter, title: "Vote",
                instruction: `${voter.name}, ${instruction}`,
                excludeSelf: !instruction.includes("president")
            });
            if (targetId !== null) {
                const voteWeight = (voter.ispresident && !instruction.includes("president")) ? 2 : 1;
                votes[targetId] += voteWeight;
            }
        }

        let maxVotes = -1;
        let playersWithMaxVotes = [];
        for (const playerId in votes) {
            if (votes[playerId] > maxVotes) {
                maxVotes = votes[playerId];
                playersWithMaxVotes = [parseInt(playerId)];
            } else if (votes[playerId] === maxVotes) {
                playersWithMaxVotes.push(parseInt(playerId));
            }
        }

        // A single player is chosen.
        if (playersWithMaxVotes.length === 1) {
            return playersWithMaxVotes[0];
        }
        // In case of a tie, the president decides.
        else if (playersWithMaxVotes.length > 1) {
            const president = this.getPlayerById(this.presidentId);
            if (president && president.isAlive && !instruction.includes("president")) {
                return await this.waitForPlayerAction({
                    player: president, title: "Égalité !",
                    instruction: "president, vous devez trancher.",
                    selectablePlayers: playersWithMaxVotes.map(id => this.getPlayerById(id))
                });
            }
        }
        return null; // Unbreakable tie (no president or president is in the tie).
    }

    /**
     * A generic, promise-based function to pause the game and await a specific player's input via the UI.
     * @param {object} options - Configuration for the player action prompt.
     * @returns {Promise<number|number[]|null>} A promise that resolves with the ID(s) of the selected player(s).
     */
    async waitForPlayerAction({ player, title, instruction, showPlayers = true, selectablePlayers = this.getAlivePlayers(), disabledIds = [], excludeSelf = false, maxSelection = 1, confirmText = "Confirmer" }) {
        UI.clearActionContainer();
        let selectedIds = [];
        UI.confirmActionBtn.innerHTML = confirmText;

        const updateUI = () => {
            UI.updatePlayerList(this.players, {
                onClick: (id) => {
                    const index = selectedIds.indexOf(id);
                    if (index > -1) {
                        selectedIds.splice(index, 1);
                    } else {
                        if (selectedIds.length < maxSelection) {
                            selectedIds.push(id);
                        } else if (maxSelection === 1) {
                            selectedIds = [id];
                        }
                    }
                    updateUI();
                },
                selectable: true, maxSelection,
                disabledIds: excludeSelf ? [player.id, ...disabledIds] : disabledIds,
                selectedIds
            });
            UI.updateDeadPlayerList(this.players);
        };

        UI.promptAction(title, `(${player.name}) ${instruction}`, { showButton: showPlayers });

        if (this.audioEnabled) {
            setTimeout(() => UI.speak(), 100);
        }

        if (showPlayers) {
            updateUI();
        } else {
            UI.playerList.innerHTML = '';
        }

        return new Promise(resolve => {
            const completeAction = () => {
                if (showPlayers && selectedIds.length !== maxSelection && maxSelection > 0) {
                    alert(`Veuillez sélectionner exactement ${maxSelection} joueur(s).`);
                    return;
                }
                UI.confirmActionBtn.textContent = "Confirmer";
                UI.confirmActionBtn.onclick = null;
                UI.showMessage("...", " ");
                setTimeout(() => {
                    const result = maxSelection === 1 ? (selectedIds[0] ?? null) : selectedIds;
                    resolve(result);
                }, 50);
            };

            if (showPlayers) {
                UI.confirmActionBtn.onclick = completeAction;
            } else {
                UI.addCustomButton(confirmText, completeAction);
            }
        });
    }

    // --- Win Conditions ---

    /**
     * Evaluates the current game state to determine if a win condition has been met.
     * @returns {object|null} A win condition object or null if the game should continue.
     */
    checkWinCondition() {
        const alivePlayers = this.getAlivePlayers();
        if (alivePlayers.length === 0) return { camp: "Égalité", message: "Tout le monde est mort..." };

        const aliveWolves = alivePlayers.filter(p => p.role.camp === 'aliens');
        const aliveVillagers = alivePlayers.filter(p => p.role.camp !== 'aliens');
        const aliveLovers = alivePlayers.filter(p => p.isLover);
        const loupBlanc = this.getPlayersByRoleKey('alpha')[0];

        // White Werewolf wins if he is the last one alive.
        if (loupBlanc && loupBlanc.isAlive && alivePlayers.length === 1) {
            return { camp: "Victoire de l'alpha", message: "Il est le seul survivant !" };
        }

        // Lovers win if they are the only ones left.
        if (aliveLovers.length === alivePlayers.length && alivePlayers.length > 0) {
            return { camp: "Victoire des Amoureux", message: "Leur amour a triomphé de tout." };
        }

        // Werewolves win if they equal or outnumber the villagers.
        if (aliveWolves.length >= aliveVillagers.length) {
            return { camp: "Victoire des aliens", message: "la colonie a été décimé." };
        }

        // Villagers win if all werewolves are eliminated.
        if (aliveWolves.length === 0 && alivePlayers.length > 0) {
            return { camp: "Victoire des Colon", message: "la colonie a trouvé la paix." };
        }

        return null; // No win condition met.
    }
}