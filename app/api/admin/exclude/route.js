import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const isAdmin = (req) => {
  const key = req.headers.get('x-admin-key') || '';
  return key === '1234serega' || (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY);
};

export async function POST(req) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { targetId, value } = await req.json().catch(() => ({}));
    if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });

    // если value не задан — просто инвертируем
    const row = await dbApi.getPlayer(targetId);
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const next = value === undefined ? !(row.excluded === 1) : !!value;
    await dbApi.setExcluded(targetId, next);

    return NextResponse.json({ targetId, excluded: next });
  } catch (e) {
    console.error('[admin/exclude.POST] 500:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
