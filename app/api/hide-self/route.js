import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';


export const runtime = 'nodejs';

// body: { playerId: string }
export async function POST(req) {
  const { playerId } = await req.json().catch(() => ({}));
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });
  const me = dbApi.getPlayer(playerId);
  if (!me) return NextResponse.json({ error: 'player not found' }, { status: 404 });
  dbApi.clearPublic(playerId);
  return NextResponse.json({ ok: true });
}
