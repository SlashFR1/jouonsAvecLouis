import { NextRequest, NextResponse } from 'next/server';
import { getGame, saveGame } from '@/lib/db/gameStore';
import { startRound, processTour1Bid, processTour2Bid, playCard } from '@/lib/belote/engine';
import { triggerGameEvent } from '@/lib/realtime/realtime';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase();
    const game = await getGame(code);

    if (!game) {
      return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const { action, seat } = body;

    if (seat === undefined || seat < 0 || seat > 3) {
      return NextResponse.json({ error: 'Siège invalide' }, { status: 400 });
    }

    // 1. Démarrer la première manche (Hôte seulement, nécessite 4 joueurs)
    if (action === 'START_GAME') {
      if (game.players.length < 4) {
        return NextResponse.json({ error: 'Il faut 4 joueurs pour démarrer la Belote.' }, { status: 400 });
      }
      startRound(game);
    }
    // 2. Enchère Tour 1
    else if (action === 'BID_TOUR_1') {
      processTour1Bid(game, seat, body.decision);
    }
    // 3. Enchère Tour 2
    else if (action === 'BID_TOUR_2') {
      processTour2Bid(game, seat, body.decision, body.suit, body.trumpType);
    }
    // 4. Jouer une carte
    else if (action === 'PLAY_CARD') {
      const result = playCard(game, seat, body.cardId);
      // Notifier belote-rebelote si annoncée
      if (result.beloteAnnounced) {
        await triggerGameEvent(code, 'belote_announced', {
          text: result.beloteAnnounced,
          seat
        });
      }
    }
    // 5. Manche suivante
    else if (action === 'NEXT_ROUND') {
      if (game.phase === 'ROUND_SCORED') {
        game.dealerSeat = (game.dealerSeat + 1) % 4;
        startRound(game);
      }
    } else {
      return NextResponse.json({ error: 'Action non supportée.' }, { status: 400 });
    }

    // Sauvegarder l'état
    await saveGame(game);

    // Diffuser en temps réel via Pusher / WebSockets
    await triggerGameEvent(code, 'state_updated', { action, seat });

    return NextResponse.json({
      success: true,
      game
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
