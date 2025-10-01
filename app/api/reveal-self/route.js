import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export async function POST(req) {
  const { playerId, fields } = await req.json().catch(() => ({}));
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  // Собираем публичный объект из полей, храним как объект (в Mongo нет нужды сериализовать)
  const me = await dbApi.getPlayer(playerId);
  if (!me) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const allowed = Array.isArray(fields) ? fields : [];
  const pub = {};
  allowed.forEach(k => {
    if (k in me && me[k] !== undefined && me[k] !== null) pub[k] = me[k];
  });

  await dbApi.setPublic(playerId, pub);
  return NextResponse.json({ ok: true, public: pub });
}
