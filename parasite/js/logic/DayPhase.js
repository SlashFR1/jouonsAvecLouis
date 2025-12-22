import { UI, AudioManager } from '../global.js'; // Vos dépendances globales

/**
 * Gère le déroulement complet d'une journée.
 * @param {Game} game - L'instance du jeu
 * @param {Array} deadPlayersFromNight - Les joueurs morts cette nuit
 */
export async function runDayCycle(game, deadPlayersFromNight) {
    
    // 1. Annonce des morts de la nuit
    await handleMorningNews(game, deadPlayersFromNight);
    
    if (game.checkWinCondition()) return;

    // 2. Élection du Président (Jour 1 seulement)
    if (game.day === 1 && game.getAlivePlayers().length > 0) {
        await handlePresidentElection(game);
    }

    if (game.checkWinCondition()) return;

    // 3. Débats et Vote d'élimination
    await handleDailyVote(game);

    // Note: La condition de victoire est vérifiée par la boucle principale dans Game.js après cette fonction
}

/**
 * Affiche les résultats de la nuit
 */
async function handleMorningNews(game, deadPlayers) {
    UI.showMessage(`☀️ Jour ${game.day} ☀️`, "Le soleil se lève sur la colonie...");
    if (game.audioEnabled) await AudioManager.play('jour');

    await game.waitForPlayerAction({
        player: { name: "Meneur de Jeu" },
        title: "📢 Annonce du Matin",
        instruction: "La nuit a apporté des nouvelles...",
        showPlayers: false,
        confirmText: "Continuer"
    });

    if (deadPlayers && deadPlayers.length > 0) {
        const deadNames = deadPlayers.map(p => p.name).join(', ');
        UI.showMessage(
            "💀 Découverte Macabre",
            `Morts cette nuit : <strong>${deadNames}</strong>`
        );
    } else {
        UI.showMessage("✨ Miracle", "Personne n'est mort cette nuit !");
    }

    // Mise à jour visuelle de l'état
    const aliveCount = game.getAlivePlayers().length;
    await game.waitForPlayerAction({
        player: { name: "Meneur de Jeu" },
        title: "État de la Colonie",
        instruction: `Il reste ${aliveCount} survivants.`,
        showPlayers: true, // Affiche la grille pour voir qui est mort
        confirmText: "Continuer"
    });
}

/**
 * Gère l'élection du Président (Maire/Capitaine)
 */
async function handlePresidentElection(game) {
    UI.showMessage("👑 Élection", "Choisissez votre leader.");

    await game.waitForPlayerAction({
        player: { name: "Meneur de Jeu" },
        title: "🗳️ Vote Président",
        instruction: "Son vote comptera double.",
        showPlayers: false
    });

    // On utilise la fonction générique de vote
    const votedId = await runVoteProcess(game, "Qui doit être Président ?");

    if (votedId !== null) {
        game.presidentId = votedId;
        const president = game.getPlayerById(votedId);
        president.isPresident = true; // Attention à la casse (camelCase)

        UI.showMessage(
            "👑 Nouveau Président",
            `<strong>${president.name}</strong> a été élu !`
        );

        await game.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Résultat",
            instruction: `${president.name} est le nouveau leader.`,
            showPlayers: false
        });
    }
}

/**
 * Gère le vote d'élimination du village
 */
async function handleDailyVote(game) {
    UI.showMessage("🗣️ Débats", "Qui est l'infiltré ?");

    await game.waitForPlayerAction({
        player: { name: "Meneur de Jeu" },
        title: "Débat",
        instruction: "Discutez avant de voter.",
        showPlayers: true,
        confirmText: "Passer au Vote"
    });

    const votedOutId = await runVoteProcess(game, "Qui éliminer ?");

    if (votedOutId !== null) {
        const eliminated = game.getPlayerById(votedOutId);
        
        // Exécution du joueur via la méthode centrale du jeu
        await game.killPlayer(votedOutId, 'vote');
        
        UI.showMessage(
            "⚔️ Sentence",
            `<strong>${eliminated.name}</strong> a été éliminé.`
        );

        await game.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Révélation",
            instruction: `${eliminated.name} était : <strong style="color: #ffce00;">${eliminated.role.name}</strong>`,
            showPlayers: false,
            confirmText: "La nuit tombe..."
        });
    } else {
        UI.showMessage("🤝 Égalité", "Personne n'est éliminé ce soir.");
        await game.waitForPlayerAction({
            player: { name: "Meneur de Jeu" },
            title: "Impasse",
            instruction: "La colonie n'a pas pu se décider.",
            showPlayers: false
        });
    }
}

/**
 * Logique interne pour collecter les votes de tous les joueurs vivants.
 * Gère le poids du vote du président et les égalités.
 */
async function runVoteProcess(game, question) {
    let votes = {}; // Map { playerId: numberOfVotes }
    const alivePlayers = game.getAlivePlayers();

    // Initialiser les compteurs
    alivePlayers.forEach(p => votes[p.id] = 0);

    // Faire voter chaque joueur
    for (const voter of alivePlayers) {
        const targetId = await game.waitForPlayerAction({
            player: voter,
            title: "À votre tour",
            instruction: `${voter.name}, ${question}`,
            excludeSelf: true // On ne vote généralement pas contre soi-même (optionnel)
        });

        if (targetId !== null) {
            // Le président compte double (sauf s'il vote pour l'élection du président lui-même, logique à adapter si besoin)
            // Ici je simplifie : si c'est déjà un président élu, il a le bonus.
            const weight = (voter.isPresident) ? 2 : 1;
            votes[targetId] += weight;
        }
    }

    // Calcul du résultat
    let maxVotes = -1;
    let candidates = [];

    for (const [pid, count] of Object.entries(votes)) {
        if (count > maxVotes) {
            maxVotes = count;
            candidates = [parseInt(pid)];
        } else if (count === maxVotes) {
            candidates.push(parseInt(pid));
        }
    }

    // Résolution
    if (candidates.length === 1) {
        return candidates[0];
    } 
    
    // Gestion de l'égalité par le Président
    if (candidates.length > 1) {
        const president = game.getPlayerById(game.presidentId);
        
        // Si le président est vivant et ne fait pas partie de l'égalité (règles variables selon les jeux, 
        // ici on suppose qu'il tranche toujours)
        if (president && president.isAlive) {
            return await game.waitForPlayerAction({
                player: president,
                title: "⚖️ Égalité !",
                instruction: "Président, tranchez l'égalité.",
                selectablePlayers: candidates.map(id => game.getPlayerById(id))
            });
        }
    }

    return null; // Personne n'est élu/tué en cas d'égalité insoluble
}