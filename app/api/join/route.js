// app/api/join/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';
import { generateUser } from '@/app/utils/generateUser';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

export async function POST(req) {
  const debug = req.headers.get('x-debug') === '1';
  try {
    const body = await req.json().catch(() => ({}));
    const { playerId, name } = body || {};

    if (playerId) {
      const me = await dbApi.getPlayer(playerId);
      if (me) return json({ playerId, me });
    }

    const data = generateUser(name || 'Игрок');
    const created = await dbApi.createPlayer(data);
    const me = await dbApi.getPlayer(created.id);
    return json({ playerId: created.id, me });
  } catch (e) {
    console.error('[join.POST] 500:', e);
    return json(
      debug
        ? { error: 'internal', message: String(e?.message || e), stack: String(e?.stack || '') }
        : { error: 'internal' },
      { status: 500 }
    );
  }
}
