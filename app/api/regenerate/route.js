import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';
import { generateUser } from '../../utils/generateUser';

export async function POST(req) {
  const { playerId, name } = await req.json().catch(() => ({}));
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  const newData = generateUser(name);
  await dbApi.updatePlayer(playerId, newData);
  const me = await dbApi.getPlayer(playerId);
  return NextResponse.json({ ok: true, me });
}
