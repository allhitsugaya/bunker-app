import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';
import { generateUser } from '@/app/utils/generateUser';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { playerId, name } = body || {};

    if (playerId) {
      const me = await dbApi.getPlayer(playerId);
      if (me) return NextResponse.json({ playerId, me });
    }

    const data = generateUser(name || 'Игрок');
    const created = await dbApi.createPlayer(data);
    const me = await dbApi.getPlayer(created.id);
    return NextResponse.json({ playerId: created.id, me });
  } catch (e) {
    console.error('[join.POST] 500:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
