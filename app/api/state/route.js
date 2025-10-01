import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const getAdminKey = (req) => req.headers.get('x-admin-key') || '';
const isAdmin = (key) =>
  key === '1234serega' || (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY);

const json = (obj, init) => NextResponse.json(obj, init);

/** Возвращает публичную “проекцию” игрока */
function toPublic(row) {
  if (!row) return null;
  if (!row.public) return { id: row.id, name: row.name };
  return { id: row.id, name: row.name, ...row.public };
}

export async function GET(req) {
  try {
    const key = getAdminKey(req);
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId');

    // --- ВЕДУЩИЙ ---
    if (key) {
      if (!isAdmin(key)) return json({ error: 'unauthorized' }, { status: 401 });

      const all = await dbApi.listAll();      // <— обязательно await
      return json({ admin: true, players: all });
    }

    // --- ИГРОК ---
    if (!playerId) return json({ error: 'playerId required' }, { status: 400 });

    const meFull = await dbApi.getPlayer(playerId);
    if (!meFull || meFull.excluded) return json({ admin: false, players: [] });

    const myPublic = toPublic(meFull);
    const publicOthers = await dbApi.listPublic(); // <— обязательно await
    const others = publicOthers.filter((p) => p.id !== playerId);

    return json({ admin: false, players: [myPublic, ...others], me: meFull });
  } catch (e) {
    console.error('[state.GET] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}
