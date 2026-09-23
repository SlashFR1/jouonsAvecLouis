import { NextRequest, NextResponse } from 'next/server';
import { createInitialGameState, addPlayerToGame } from '@/lib/belote/engine';
import { getGame, saveGame } from '@/lib/db/gameStore';
import { triggerGameEvent } from '@/lib/realtime/realtime';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, playerName, targetScore, withQuinch, code } = body;

    if (!playerName || !playerName.trim()) {
      return NextResponse.json({ error: 'Le pseudo est obligatoire.' }, { status: 400 });
    }

    const cleanName = playerName.trim();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    // 1. Créer une nouvelle partie
    if (action === 'CREATE') {
      const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newGame = createInitialGameState(
        generatedCode,
        targetScore === 1001 ? 1001 : 501,
        withQuinch !== false,
        cleanName,
        playerId
      );

      await saveGame(newGame);

      return NextResponse.json({
        success: true,
        code: generatedCode,
        playerId,
        seat: 0,
        game: newGame
      });
    }

    // 2. Rejoindre une partie existante
    if (action === 'JOIN') {
      if (!code) {
        return NextResponse.json({ error: 'Le code de salon est requis.' }, { status: 400 });
      }

      const upperCode = code.toUpperCase().trim();
      const game = await getGame(upperCode);

      if (!game) {
        return NextResponse.json({ error: 'Salon introuvable.' }, { status: 404 });
      }

      if (game.players.length >= 4) {
        return NextResponse.json({ error: 'La partie est déjà complète (4/4 joueurs).' }, { status: 400 });
      }

      const assignedSeat = game.players.length;
      const success = addPlayerToGame(game, cleanName, playerId);

      if (!success) {
        return NextResponse.json({ error: 'Impossible de rejoindre le salon.' }, { status: 400 });
      }

      await saveGame(game);
      await triggerGameEvent(upperCode, 'state_updated', { type: 'player_joined' });

      return NextResponse.json({
        success: true,
        code: upperCode,
        playerId,
        seat: assignedSeat,
        game
      });
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
