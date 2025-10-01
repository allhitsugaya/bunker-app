// app/api/state/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const adminHeader = (req) => req.headers.get('x-admin-key') || '';
const isAdmin = (key) =>
  key === '1234serega' || (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY);

const json = (data, init) => NextResponse.json(data, init);

// Своё публичное представление (что видят другие)
const toPublic = (row) => {
  if (!row) return null;
  return row.public ? { id: row.id, name: row.name, ...row.public } : { id: row.id, name: row.name };
};

export async function GET(req) {
  try {
    const key = adminHeader(req);
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId');

    // --- Ведущий ---
    if (key) {
      if (!isAdmin(key)) return json({ error: 'unauthorized' }, { status: 401 });
      const all = await dbApi.listAll();                 // <— await
      return json({ admin: true, players: all });
    }

    // --- Игрок ---
    if (!playerId) return json({ error: 'playerId required' }, { status: 400 });

    const meFull = await dbApi.getPlayer(playerId);      // <— await
    if (!meFull || meFull.excluded) {
      return json({ admin: false, players: [] }, { status: 404 });
    }

    const myPublic = toPublic(meFull);
    const others = (await dbApi.listPublic())            // <— await
      .filter((p) => p.id !== playerId);

    return json({ admin: false, players: [myPublic, ...others], me: meFull });
  } catch (e) {
    console.error('[state.GET] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}
