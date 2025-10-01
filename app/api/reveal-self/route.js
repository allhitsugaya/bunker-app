import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';


export const runtime = 'nodejs';

// body: { playerId: string, fields: string[] }
export async function POST(req) {
  const { playerId, fields } = await req.json().catch(() => ({}));
  if (!playerId || !Array.isArray(fields)) {
    return NextResponse.json({ error: 'playerId and fields[] required' }, { status: 400 });
  }
  const me = dbApi.getPlayer(playerId);
  if (!me) return NextResponse.json({ error: 'player not found' }, { status: 404 });

  const allow = new Set([
    'age', 'profession', 'health', 'psychology', 'item',
    'hobby', 'fear', 'secret', 'relationship', 'trait', 'ability'
  ]);
  const pub = {};
  fields.forEach(k => {
    if (allow.has(k) && me[k] != null) pub[k] = me[k];
  });

  dbApi.setPublic(playerId, pub);
  return NextResponse.json({ ok: true, public: pub });
}
