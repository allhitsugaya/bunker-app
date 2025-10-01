import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export async function POST(req) {
  const { playerId } = await req.json().catch(() => ({}));
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  await dbApi.clearPublic(playerId);
  return NextResponse.json({ ok: true });
}
