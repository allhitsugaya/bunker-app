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

    const next = await dbApi.toggleReveal(targetId, value);
    return NextResponse.json({ targetId, revealed: next });
  } catch (e) {
    console.error('[admin/reveal.POST] 500:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
