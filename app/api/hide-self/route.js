import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { playerId } = await req.json().catch(() => ({}));
    if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

    await dbApi.clearPublic(playerId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[hide-self.POST] 500:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
