import { BeloteGameState } from '../belote/types';

// Stockage mémoire haute performance partagé entre les fonctions serverless de l'instance
const memoryGames = new Map<string, BeloteGameState>();

export async function saveGame(game: BeloteGameState): Promise<void> {
  const code = game.code.toUpperCase();
  memoryGames.set(code, game);

  // Si DATABASE_URL est configurée (Neon PostgreSQL), persister également dans Neon
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);

      await sql`
        CREATE TABLE IF NOT EXISTS belote_games (
          code VARCHAR(10) PRIMARY KEY,
          state JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        INSERT INTO belote_games (code, state, updated_at)
        VALUES (${code}, ${JSON.stringify(game)}, NOW())
        ON CONFLICT (code) DO UPDATE
        SET state = EXCLUDED.state, updated_at = NOW();
      `;
    } catch (err) {
      console.warn('[Neon DB Warning]: Sauvegarde mémoire utilisée:', err);
    }
  }
}

export async function getGame(code: string): Promise<BeloteGameState | null> {
  const upperCode = code.toUpperCase();
  const mem = memoryGames.get(upperCode);
  if (mem) return mem;

  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);

      const rows = await sql`SELECT state FROM belote_games WHERE code = ${upperCode}`;
      if (rows.length > 0) {
        const state = rows[0].state as BeloteGameState;
        memoryGames.set(upperCode, state);
        return state;
      }
    } catch (err) {
      console.warn('[Neon DB Error]:', err);
    }
  }

  return null;
}
