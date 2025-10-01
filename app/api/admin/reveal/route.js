import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

export async function POST(req) {

  const key = req.headers.get('x-admin-key') || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { targetId, value } = await req.json().catch(() => ({}));
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });

  const revealed = dbApi.toggleReveal(targetId, value);
  return NextResponse.json({ targetId, revealed });
}
