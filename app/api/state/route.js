// app/api/state/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const ADMIN_DEFAULT_KEY = '1234serega';
const getAdminKey = (req) => req.headers.get('x-admin-key') || '';
const isAdminKeyValid = (k) => !!k && k === (process.env.ADMIN_KEY || ADMIN_DEFAULT_KEY);

const json = (data, status = 200) =>
  new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

const toPublic = (row) => {
  if (!row?.public) return { id: row.id, name: row.name };
  try {
    return { id: row.id, name: row.name, ...JSON.parse(row.public) };
  } catch {
    return { id: row.id, name: row.name };
  }
};

export async function GET(req) {
  try {
    const key = getAdminKey(req);
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId') || '';

    if (key) {
      if (!isAdminKeyValid(key)) return json({ error: 'unauthorized' }, 401);
      const players = dbApi.listAll();
      return json({ admin: true, players, me: null });
    }

    if (!playerId) return json({ error: 'playerId required' }, 400);

    const meFull = dbApi.getPlayer(playerId);
    if (!meFull) return json({ error: 'player not found' }, 404);
    if (meFull.excluded) return json({ admin: false, players: [], me: meFull });

    const myPublic = toPublic(meFull);
    const others = dbApi.listPublic().filter(p => p.id !== playerId);
    return json({ admin: false, players: [myPublic, ...others], me: meFull });
  } catch (e) {
    console.error('[state.GET] 500:', e);
    return json({ error: 'internal_error', message: String(e?.message || e) }, 500);
  }
}
