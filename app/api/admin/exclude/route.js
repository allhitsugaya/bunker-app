import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdminKey = (k) => k === '1234serega' || (process.env.ADMIN_KEY && k === process.env.ADMIN_KEY);

export async function POST(req) {
  const key = req.headers.get('x-admin-key') || '';
  if (!isAdminKey(key)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { targetId, value } = await req.json().catch(() => ({}));
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });

  await dbApi.setExcluded(targetId, value === undefined ? 1 : (value ? 1 : 0));
  const row = await dbApi.getPlayer(targetId);
  return NextResponse.json({ targetId, excluded: !!row?.excluded });
}
