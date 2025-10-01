// app/api/state/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';
const json = (d, i) => NextResponse.json(d, i);
const adminHeader = (req) => req.headers.get('x-admin-key') || '';
const isAdmin = (k) => k === (process.env.ADMIN_KEY || '1234serega');

const toPublic = (row) => {
  if (!row) return null;
  if (!row.public) return { id: row.id, name: row.name };
  return { id: row.id, name: row.name, ...row.public };
};

export async function GET(req) {
  try {
    const key = adminHeader(req);
    const url = new URL(req.url);
    const playerId = url.searchParams.get('playerId');

    // ведущий
    if (key) {
      if (!isAdmin(key)) return json({ error: 'unauthorized' }, { status: 401 });
      const all = await dbApi.listAll();
      return json({ admin: true, players: all });
    }

    // игрок
    if (!playerId) return json({ error: 'playerId required' }, { status: 400 });

    const meFull = await dbApi.getPlayer(playerId);
    if (!meFull || meFull.excluded) return json({ admin: false, players: [] });

    const myPublic = toPublic(meFull);
    const othersPublic = await dbApi.listPublic();
    const others = othersPublic.filter((p) => p.id !== playerId);

    return json({ admin: false, players: [myPublic, ...others], me: meFull });
  } catch (e) {
    console.error('[state.GET] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const key = adminHeader(req);
    if (!isAdmin(key)) return json({ error: 'unauthorized' }, { status: 401 });

    const { targetId, state } = await req.json().catch(() => ({}));
    if (!targetId) return json({ error: 'targetId required' }, { status: 400 });
    if (!state || typeof state !== 'object') return json({ error: 'state required' }, { status: 400 });

    const row = await dbApi.getPlayer(targetId);
    if (!row) return json({ error: 'not found' }, { status: 404 });

    const nextState = { ...row.state, ...state };
    await dbApi.setState(targetId, nextState);

    return json({ ok: true, targetId, state: nextState });
  } catch (e) {
    console.error('[state.POST] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}