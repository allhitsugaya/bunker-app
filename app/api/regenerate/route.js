import { NextResponse } from 'next/server';

import { generateUser } from '../../utils/generateUser';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

// body: { playerId: string, name?: string }
export async function POST(req) {
  const { playerId, name } = await req.json().catch(() => ({}));
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });
  const me = dbApi.getPlayer(playerId);
  if (!me) return NextResponse.json({ error: 'player not found' }, { status: 404 });

  const data = generateUser(name || me.name || 'Игрок');
  dbApi.updatePlayer(playerId, data);
  const updated = dbApi.getPlayer(playerId);
  return NextResponse.json({ ok: true, me: updated });
}
