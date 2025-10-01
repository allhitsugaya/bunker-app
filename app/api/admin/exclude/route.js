import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

// headers: x-admin-key
// body: { targetId: string, value?: boolean }  // без value = toggle
export async function POST(req) {
  const key = req.headers.get('x-admin-key') || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { targetId, value } = await req.json().catch(() => ({}));
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });

  const row = dbApi.getPlayer(targetId);
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const next = value === undefined ? !row.excluded : !!value;
  dbApi.setExcluded(targetId, next);
  return NextResponse.json({ targetId, excluded: next });
}
