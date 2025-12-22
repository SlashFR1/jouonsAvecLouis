// logic/RoleActions.js
import { UI, AudioManager } from '../global'; // Supposons que UI/Audio sont accessibles

export const RoleActions = {
    async handleThief(androidPlayer, unusedRoles) {
        return new Promise((resolve) => {
            const [card1, card2] = unusedRoles;
            
            UI.promptAction(
                `🤖 Tour de l'Android`, 
                `(${androidPlayer.name}) Choisissez une identité parmi les rôles non distribués.`, 
                { showButton: false }
            );

            UI.addCustomButton(`Garder: ${androidPlayer.role.name}`, resolve);
            
            const swap = (newRole, index) => {
                const oldRole = androidPlayer.role;
                androidPlayer.role = newRole;
                unusedRoles[index] = oldRole; // Remet l'ancien rôle dans la pioche
                resolve();
            };

            UI.addCustomButton(`Prendre: ${card1.name}`, () => swap(card1, 0));
            UI.addCustomButton(`Prendre: ${card2.name}`, () => swap(card2, 1));
        });
    },

    async handleWitch(medecinPlayer, report, gameInstance) {
        // Logique de la sorcière extraite ici
        // On a besoin de gameInstance pour accéder à getAlivePlayers() et waitForPlayerAction
        const victim = gameInstance.getPlayerById(report.wolvesTarget);
        
        return new Promise((resolve) => {
            let instruction = victim 
                ? `⚠️ Les aliens ont attaqué <strong>${victim.name}</strong>. Intervenir ?` 
                : "Que souhaitez-vous faire ?";

            UI.promptAction(`💊 Tour du Médecin`, `(${medecinPlayer.name}) ${instruction}`, { showButton: false });

            if (gameInstance.witchHasSavePotion && victim) {
                UI.addCustomButton(`💉 Sauver`, () => {
                    report.witchSave = true;
                    gameInstance.witchHasSavePotion = false;
                    resolve();
                });
            }

            if (gameInstance.witchHasKillPotion) {
                UI.addCustomButton(`☠️ Tuer`, async () => {
                    // Note: On appelle une méthode du jeu pour l'input
                    const targetId = await gameInstance.waitForPlayerAction({
                        player: medecinPlayer,
                        title: "💀 Poison",
                        instruction: "Qui voulez-vous éliminer ?",
                        selectablePlayers: gameInstance.getAlivePlayers().filter(p => p.id !== victim?.id)
                    });
                    report.witchKill = targetId;
                    gameInstance.witchHasKillPotion = false;
                    resolve();
                });
            }

            UI.addCustomButton("🛑 Rien", resolve);
        });
    }
    
    // Ajoutez ici handleSeer, handleHunter, etc.
};