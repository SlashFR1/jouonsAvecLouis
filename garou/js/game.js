// Petite fonction utilitaire pour créer des pauses
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Game {
    constructor(playerNames, roleConfig, options = {}) {
        this.players = [];
        this.rolesToDistribute = [];
        this.unusedRoles = []; // Pour le Voleur
        this.day = 0;
        this.captainId = null;
        this.lastProtectedId = null;
        this.lovers = [];
        this.witchHasSavePotion = true;
        this.witchHasKillPotion = true;
        this.audioEnabled = options.audioEnabled || false;

        this.initializePlayers(playerNames);
        this.prepareRoles(roleConfig);
        this.distributeRoles();
    }

    // --- Fonctions d'Initialisation ---
    initializePlayers(playerNames) {
        playerNames.forEach((name, index) => {
            this.players.push({
                id: index, name, role: null, isAlive: true, isLover: false,
                isCaptain: false, isProtected: false, votesAgainst: 0
            });
        });
    }

    prepareRoles(roleConfig) {
        let roles = [];
        for (const roleKey in roleConfig) {
            for (let i = 0; i < roleConfig[roleKey]; i++) {
                roles.push({ ...ROLES[roleKey], key: roleKey });
            }
        }
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        this.rolesToDistribute = roles;
    }

    distributeRoles() {
        const playersWithRole = this.players.slice();
        while (this.rolesToDistribute.length > playersWithRole.length) {
            this.unusedRoles.push(this.rolesToDistribute.pop());
        }
        playersWithRole.forEach(player => {
            player.role = this.rolesToDistribute.pop();
        });
    }

    // --- Fonctions Utilitaires ---
    getPlayerById(id) { return this.players.find(p => p.id === id); }
    getPlayersByRoleKey(roleKey) { return this.players.filter(p => p.role.key === roleKey && p.isAlive); }
    getAlivePlayers(filter = {}) {
        return this.players.filter(p => {
            if (!p.isAlive) return false;
            if (filter.excludeId && p.id === filter.excludeId) return false;
            return true;
        });
    }

    // --- Logique de Mort ---
    async killPlayer(playerId, cause) {
        const player = this.getPlayerById(playerId);
        let allDeadThisTurn = [];
        if (!player || !player.isAlive) return allDeadThisTurn;

        if (cause === 'loups' && player.isProtected) {
            return allDeadThisTurn;
        }

        player.isAlive = false;
        allDeadThisTurn.push(player);

        if (player.role.key === 'chasseur') {
            const hunterTargetId = await this.waitForPlayerAction({
                player, title: "Pouvoir du Chasseur",
                instruction: `${player.name}, vous êtes mort. Emportez quelqu'un avec vous.`,
                selectablePlayers: this.getAlivePlayers()
            });
            if (hunterTargetId !== null) {
                const deadFromHunter = await this.killPlayer(hunterTargetId, 'chasseur_revenge');
                allDeadThisTurn.push(...deadFromHunter);
            }
        }

        if (player.isLover) {
            const otherLoverId = this.lovers.find(id => id !== player.id);
            const otherLover = this.getPlayerById(otherLoverId);
            if (otherLover && otherLover.isAlive) {
                const deadFromGrief = await this.killPlayer(otherLoverId, 'chagrin');
                allDeadThisTurn.push(...deadFromGrief);
            }
        }
        return [...new Set(allDeadThisTurn)];
    }

    // --- Moteur Principal du Jeu ---
    async start() {
        await this.showRoles();
        await this.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Tout le monde a son rôle !",
            instruction: "La partie va commencer...",
            showPlayers: false, confirmText: "Commencer la partie"
        });

        await this.runFirstNight();

        while (true) {
            if (this.checkWinCondition()) break;
            this.day++;
            const deadPlayersFromNight = await this.runNightPhase();
            const deadFromVote = await this.runDayPhase(deadPlayersFromNight);
            if (this.checkWinCondition()) break;
        }

        const winner = this.checkWinCondition();
        UI.showScreen(UI.endScreen);
        UI.winTitle.textContent = winner.camp;
        UI.winMessage.textContent = winner.message;
    }

    // --- Séquences de Jeu ---
    async showRoles() {
        for (const player of this.players) {
            await this.waitForPlayerAction({
                player, title: `Passez le téléphone à ${player.name}`,
                instruction: "Regardez votre rôle et gardez-le secret.", showPlayers: false
            });
            await this.waitForPlayerAction({
                player, title: `${player.name}, vous êtes...`,
                instruction: `**${player.role.name}**\n\n*${player.role.description}*`, showPlayers: false
            });
        }
    }

    async runRecapPhase(title) {
        UI.showMessage("Rappel des Rôles", title);
        await sleep(100);

        for (const player of this.getAlivePlayers()) {
            await this.waitForPlayerAction({
                player, title: `Passez le téléphone à ${player.name}`,
                instruction: "Consultez à nouveau votre rôle.", showPlayers: false
            });

            let recapInstruction = `Vous êtes **${player.role.name}**.`;
            if (player.swappedRole) {
                recapInstruction = `Vous avez échangé votre carte.\n\nVotre nouveau rôle est **${player.role.name}**.`;
                player.swappedRole = false;
            }
            if (player.isLover) {
                const otherLover = this.getPlayerById(this.lovers.find(id => id !== player.id));
                if (otherLover && otherLover.isAlive) {
                    recapInstruction += `\n\nVous êtes amoureux de **${otherLover.name}**.`;
                }
            }
            await this.waitForPlayerAction({
                player, title: "Rappel de votre Rôle",
                instruction: recapInstruction, showPlayers: false
            });
        }
    }

    async runFirstNight() {
        this.day = 1;
        UI.showMessage(`Nuit ${this.day}`, "Le village de Thiercelieux s'endort...");
        if (this.audioEnabled) await AudioManager.play('nuit');

        const voleur = this.getPlayersByRoleKey('voleur')[0];
        if (voleur && this.unusedRoles.length >= 2) {
            if (this.audioEnabled) await AudioManager.play('voleur');
            await this.handleThiefAction(voleur);
        }

        const cupidon = this.getPlayersByRoleKey('cupidon')[0];
        if (cupidon) {
            if (this.audioEnabled) await AudioManager.play('cupidon');
            const loverIds = await this.waitForPlayerAction({
                player: cupidon, title: "Tour de Cupidon",
                instruction: "Choisissez deux joueurs à lier par l'amour.", maxSelection: 2
            });
            this.lovers = loverIds;
            loverIds.forEach(id => this.getPlayerById(id).isLover = true);
        }

        let nightReport = await this.runNightActions();

        if (this.lovers.length > 0) {
            for (const loverId of this.lovers) {
                const lover = this.getPlayerById(loverId);
                const otherLover = this.getPlayerById(this.lovers.find(id => id !== loverId));
                await this.waitForPlayerAction({
                    player: lover, title: "Vous êtes Amoureux !",
                    instruction: `Votre cœur bat pour **${otherLover.name}**.`, showPlayers: false
                });
            }
        }
        await this.runRecapPhase("Chacun se remémore qui il est et ce qu'il a appris...");

        const deadPlayers = await this.resolveNight(nightReport);
        await this.runDayPhase(deadPlayers);
    }

    async runNightPhase() {
        UI.showMessage(`Nuit ${this.day}`, "Tout le monde s'endort...");
        if (this.audioEnabled) await AudioManager.play('nuit');

        let nightReport = await this.runNightActions();
        const deadPlayers = await this.resolveNight(nightReport);
        return deadPlayers;
    }

    async runNightActions() {
        let report = { wolvesTarget: null, witchSave: false, witchKill: null, protectedId: null, loupBlancTarget: null };
        this.getAlivePlayers().forEach(p => p.isProtected = false);

        const protecteur = this.getPlayersByRoleKey('protecteur')[0];
        if (protecteur) {
            if (this.audioEnabled) await AudioManager.play('protecteur');
            report.protectedId = await this.waitForPlayerAction({
                player: protecteur, title: "Tour du Protecteur",
                instruction: "Choisissez un joueur à protéger.",
                disabledIds: this.day > 1 ? [this.lastProtectedId] : []
            });
            if (report.protectedId !== null) {
                this.getPlayerById(report.protectedId).isProtected = true;
                this.lastProtectedId = report.protectedId;
            }
        }

        const voyante = this.getPlayersByRoleKey('voyante')[0];
        if (voyante) {
            if (this.audioEnabled) await AudioManager.play('voyante');
            const seerTargetId = await this.waitForPlayerAction({
                player: voyante, title: "Tour de la Voyante",
                instruction: "Choisissez un joueur pour découvrir son rôle.", excludeSelf: true
            });
            if (seerTargetId !== null) {
                const target = this.getPlayerById(seerTargetId);
                await this.waitForPlayerAction({
                    player: voyante, title: "Révélation",
                    instruction: `Le rôle de ${target.name} est : **${target.role.name}**`,
                    showPlayers: false
                });
            }
        }

        const loups = this.getAlivePlayers().filter(p => p.role.camp === 'loups');
        if (loups.length > 0) {
            if (this.audioEnabled) await AudioManager.play('loups');
            report.wolvesTarget = await this.waitForPlayerAction({
                player: loups[0], title: "Tour des Loups-Garous",
                instruction: "Choisissez une victime.",
                selectablePlayers: this.getAlivePlayers().filter(p => p.role.camp !== 'loups')
            });
        }

        const loupBlanc = this.getPlayersByRoleKey('loup_blanc')[0];
        if (loupBlanc && this.day > 1 && this.day % 2 === 0) {
            if (this.audioEnabled) await AudioManager.play('loup_blanc');
            report.loupBlancTarget = await this.waitForPlayerAction({
                player: loupBlanc, title: "Tour du Loup Blanc",
                instruction: "Vous pouvez dévorer un joueur de votre choix.",
            });
        }

        const sorciere = this.getPlayersByRoleKey('sorciere')[0];
        if (sorciere && (this.witchHasSavePotion || this.witchHasKillPotion)) {
            if (this.audioEnabled) await AudioManager.play('sorciere');
            await this.handleWitchAction(sorciere, report);
        }
        
        return report;
    }

    async resolveNight(report) {
        let deadPlayers = [];
        const processKill = async (targetId, cause) => {
            if (targetId !== null) {
                const dead = await this.killPlayer(targetId, cause);
                deadPlayers.push(...dead);
            }
        };

        if (report.wolvesTarget !== null && !report.witchSave) {
            await processKill(report.wolvesTarget, 'loups');
        }
        await processKill(report.loupBlancTarget, 'loup-blanc');
        await processKill(report.witchKill, 'sorciere');

        return [...new Set(deadPlayers)];
    }

    async runDayPhase(deadPlayersFromNight) {
        UI.showMessage(`Jour ${this.day}`, "Le soleil se lève...");
        if (this.audioEnabled) await AudioManager.play('jour');

        await this.runSecretAnnouncementPhase(deadPlayersFromNight);

        if (this.checkWinCondition()) return null;

        if (this.day === 1 && this.getAlivePlayers().length > 0) {
            UI.showMessage("Élection du Capitaine", "Les villageois doivent choisir un leader.");
            const votedId = await this.runVote("Qui doit être le Capitaine ?");
            if (votedId !== null) {
                this.captainId = votedId;
                const captain = this.getPlayerById(votedId);
                captain.isCaptain = true;
                UI.showMessage("Nouveau Capitaine", `${captain.name} a été élu ! Son vote compte double.`);
                await this.waitForPlayerAction({ player: { name: "Meneur de Jeu" }, title: "Nouveau Capitaine", instruction: "Cliquez pour continuer.", showPlayers: false });
            }
        }

        if (this.getAlivePlayers().length > 0) {
            UI.showMessage("Débats", "Il est temps de débattre pour trouver les coupables.");
            await this.waitForPlayerAction({ player: { name: "Meneur de Jeu" }, title: "Débat", instruction: "Discutez ! Cliquez pour passer au vote.", showPlayers: false });

            const votedOutId = await this.runVote("Qui souhaitez-vous éliminer ?");
            if (votedOutId !== null) {
                const deadPlayers = await this.killPlayer(votedOutId, 'vote');
                const eliminatedPlayer = this.getPlayerById(votedOutId);
                UI.showMessage("Sentence du village", `${eliminatedPlayer.name} a été éliminé. Son rôle était ${eliminatedPlayer.role.name}.`);
                await this.waitForPlayerAction({ player: { name: "Meneur de Jeu" }, title: "Sentence du village", instruction: "Cliquez pour continuer.", showPlayers: false });
                return deadPlayers;
            } else {
                UI.showMessage("Indécision", "Personne n'est éliminé aujourd'hui.");
                await this.waitForPlayerAction({ player: { name: "Meneur de Jeu" }, title: "Indécision", instruction: "Cliquez pour continuer.", showPlayers: false });
                return null;
            }
        }
        return null;
    }
    
    async runSecretAnnouncementPhase(deadPlayers) {
        let announcement;
        if (deadPlayers.length === 0) {
            announcement = "Personne n'est mort cette nuit !";
        } else {
            const deadNames = deadPlayers.map(p => `${p.name} (${p.role.name})`).join(', ');
            announcement = `Ce matin, le village découvre la mort de : ${deadNames}`;
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

    // --- Logiques Spécifiques aux Rôles ---
    async handleThiefAction(voleur) {
        return new Promise(async resolve => {
            const card1 = this.unusedRoles[0];
            const card2 = this.unusedRoles[1];

            UI.promptAction(`Tour du Voleur`, `(${voleur.name}) Choisissez votre nouveau rôle.`, { showButton: false });
            UI.addCustomButton(`Garder ${voleur.role.name}`, () => resolve());
            UI.addCustomButton(`Prendre ${card1.name}`, () => {
                const oldRole = voleur.role;
                voleur.role = card1;
                voleur.swappedRole = true;
                this.unusedRoles[0] = oldRole;
                resolve();
            });
            UI.addCustomButton(`Prendre ${card2.name}`, () => {
                const oldRole = voleur.role;
                voleur.role = card2;
                voleur.swappedRole = true;
                this.unusedRoles[1] = oldRole;
                resolve();
            });
        });
    }

    async handleWitchAction(sorciere, report) {
        return new Promise(async resolve => {
            const victim = this.getPlayerById(report.wolvesTarget);
            let instruction = "Que souhaitez-vous faire cette nuit ?";
            if (victim) {
                instruction = `Les loups ont attaqué ${victim.name}. ${instruction}`;
            }

            UI.promptAction(`Tour de la Sorcière`, `(${sorciere.name}) ${instruction}`, { showButton: false });

            if (this.witchHasSavePotion && victim) {
                UI.addCustomButton(`Utiliser la potion de vie`, () => {
                    report.witchSave = true;
                    this.witchHasSavePotion = false;
                    resolve();
                });
            }

            if (this.witchHasKillPotion) {
                UI.addCustomButton(`Utiliser la potion de mort`, async () => {
                    const targetId = await this.waitForPlayerAction({
                        player: sorciere, title: "Potion de Mort",
                        instruction: "Choisissez qui empoisonner.",
                        selectablePlayers: this.getAlivePlayers().filter(p => p.id !== victim?.id)
                    });
                    report.witchKill = targetId;
                    this.witchHasKillPotion = false;
                    resolve();
                });
            }
            
            UI.addCustomButton("Ne rien faire", () => resolve());
        });
    }

    // --- Fonctions de Support ---
    async runVote(instruction) {
        let votes = {};
        this.getAlivePlayers().forEach(p => votes[p.id] = 0);

        for (const voter of this.getAlivePlayers()) {
            const targetId = await this.waitForPlayerAction({
                player: voter, title: "Vote",
                instruction: `${voter.name}, ${instruction}`,
                excludeSelf: !instruction.includes("Capitaine")
            });
            if (targetId !== null) {
                const voteWeight = (voter.isCaptain && !instruction.includes("Capitaine")) ? 2 : 1;
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

        if (playersWithMaxVotes.length === 1) {
            return playersWithMaxVotes[0];
        } else if (playersWithMaxVotes.length > 1) {
            const captain = this.getPlayerById(this.captainId);
            if (captain && captain.isAlive && !instruction.includes("Capitaine")) {
                return await this.waitForPlayerAction({
                    player: captain, title: "Égalité !",
                    instruction: "Capitaine, vous devez trancher.",
                    selectablePlayers: playersWithMaxVotes.map(id => this.getPlayerById(id))
                });
            }
        }
        return null;
    }

    async waitForPlayerAction({ player, title, instruction, showPlayers = true, selectablePlayers = this.getAlivePlayers(), disabledIds = [], excludeSelf = false, maxSelection = 1, confirmText = "Confirmer" }) {
        UI.clearActionContainer();
        let selectedIds = [];
        UI.confirmActionBtn.textContent = confirmText;

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

    // --- Conditions de Victoire ---
    checkWinCondition() {
        const alivePlayers = this.getAlivePlayers();
        if (alivePlayers.length === 0) return { camp: "Égalité", message: "Tout le monde est mort..." };

        const aliveWolves = alivePlayers.filter(p => p.role.camp === 'loups');
        const aliveVillagers = alivePlayers.filter(p => p.role.camp !== 'loups');
        const aliveLovers = alivePlayers.filter(p => p.isLover);
        const loupBlanc = this.getPlayersByRoleKey('loup_blanc')[0];

        if (loupBlanc && loupBlanc.isAlive && alivePlayers.length === 1) {
            return { camp: "Victoire du Loup Blanc", message: "Il est le seul survivant !" };
        }

        if (aliveLovers.length === alivePlayers.length && alivePlayers.length > 0) {
            return { camp: "Victoire des Amoureux", message: "Leur amour a triomphé de tout." };
        }

        if (aliveWolves.length >= aliveVillagers.length) {
            return { camp: "Victoire des Loups-Garous", message: "Le village a été dévoré." };
        }

        if (aliveWolves.length === 0 && alivePlayers.length > 0) {
            return { camp: "Victoire des Villageois", message: "Le village a trouvé la paix." };
        }
        
        return null;
    }
}