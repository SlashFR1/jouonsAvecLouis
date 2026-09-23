import { NextRequest, NextResponse } from 'next/server';
import { getGame } from '@/lib/db/gameStore';
import { filterStateForClient } from '@/lib/belote/engine';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase();
    const game = await getGame(code);

    if (!game) {
      return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const seatStr = searchParams.get('seat');
    const seat = seatStr !== null ? parseInt(seatStr, 10) : 0;

    // Masquage sécurisé des cartes adverses
    const filtered = filterStateForClient(game, isNaN(seat) ? 0 : seat);

    return NextResponse.json({
      success: true,
      state: filtered
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
