// logic/NightPhase.js
import { AudioManager } from '../global';
import { RoleActions } from './RoleActions';

export async function runNightCycle(game) {
    const { day, audioEnabled } = game;
    
    // Reset des protections
    game.getAlivePlayers().forEach(p => p.isProtected = false);
    
    let report = { 
        wolvesTarget: null, 
        witchSave: false, 
        witchKill: null, 
        protectedId: null, 
        loupBlancTarget: null 
    };

    // --- 1. Garde ---
    const garde = game.getPlayersByRoleKey('Garde')[0];
    if (garde) {
        if (audioEnabled) await AudioManager.play('Garde');
        report.protectedId = await game.waitForPlayerAction({
            player: garde,
            title: "🛡️ Garde",
            instruction: "Qui protéger ce soir ?",
            disabledIds: day > 1 ? [game.lastProtectedId] : []
        });
        if (report.protectedId !== null) {
            game.getPlayerById(report.protectedId).isProtected = true;
            game.lastProtectedId = report.protectedId;
        }
    }

    // --- 2. Aliens (Loups) ---
    const aliens = game.getAlivePlayersByCamp('aliens');
    if (aliens.length > 0) {
        if (audioEnabled) await AudioManager.play('aliens');
        report.wolvesTarget = await game.waitForPlayerAction({
            player: aliens[0], // Simplification: le premier alien décide
            title: "👽 Aliens",
            instruction: "Qui dévorer ?",
            selectablePlayers: game.getAlivePlayersByCamp('colons')
        });
    }

    // --- 3. Médecin (Sorcière) ---
    const medecin = game.getPlayersByRoleKey('Medecin')[0];
    if (medecin && (game.witchHasSavePotion || game.witchHasKillPotion)) {
        if (audioEnabled) await AudioManager.play('Medecin');
        await RoleActions.handleWitch(medecin, report, game);
    }

    return report;
}