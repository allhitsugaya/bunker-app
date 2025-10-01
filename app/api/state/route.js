// app/api/state/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const ADMIN_DEFAULT_KEY = '1234serega';

const getAdminKey = (req) => req.headers.get('x-admin-key') || '';
const isAdminKeyValid = (key) => !!key && key === (process.env.ADMIN_KEY || ADMIN_DEFAULT_KEY);

const json = (data, init = {}) =>
  new NextResponse(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(init.headers || {})
    }
  });

const toPublicSelf = (row) => {
  if (!row?.public) return { id: row.id, name: row.name };
  try {
    const pub = JSON.parse(row.public);
    // только безопасные поля из public-объекта (если хочешь — можно белый список)
    return { id: row.id, name: row.name, ...pub };
  } catch {
    return { id: row.id, name: row.name };
  }
};

export async function GET(req) {
  try {
    const key = getAdminKey(req);
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId') || req.headers.get('x-player-id') || '';

    // --- 1) Ведущий
    if (key) {
      if (!isAdminKeyValid(key)) return json({ error: 'unauthorized' }, { status: 401 });
      const players = dbApi.listAll();
      return json({ admin: true, players, me: null });
    }

    // --- 2) Игрок
    if (!playerId) return json({ error: 'playerId required' }, { status: 400 });

    const meFull = dbApi.getPlayer(playerId);
    if (!meFull) return json({ error: 'player not found' }, { status: 404 });
    if (meFull.excluded) return json({ admin: false, players: [], me: meFull });

    const myPublic = toPublicSelf(meFull);
    const publicOthers = dbApi.listPublic().filter((p) => p.id !== playerId);
    const players = [myPublic, ...publicOthers];

    return json({ admin: false, players, me: meFull });
  } catch (err) {
    console.error('[state.GET] fatal:', err);
    return json({ error: 'internal_error' }, { status: 500 });
  }
}
