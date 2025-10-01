import { NextResponse } from 'next/server';
import { generateUser } from '../../utils/generateUser';
import { dbApi } from '@/app/_data/lib/db';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { playerId, name } = body || {};

  if (playerId) {
    const me = dbApi.getPlayer(playerId);
    if (me) return NextResponse.json({ playerId, me });
  }

  const data = generateUser(name || 'Игрок');
  const created = dbApi.createPlayer(data);
  const me = dbApi.getPlayer(created.id);
  return NextResponse.json({ playerId: created.id, me });
}
