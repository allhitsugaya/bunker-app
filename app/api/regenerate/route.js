import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';
import { generateUser } from '@/app/utils/generateUser';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { playerId, name } = await req.json().catch(() => ({}));
    if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

    const fresh = generateUser(name || undefined);
    await dbApi.updatePlayer(playerId, fresh);
    // После регена публичную витрину обнулим
    await dbApi.clearPublic(playerId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[regenerate.POST] 500:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
