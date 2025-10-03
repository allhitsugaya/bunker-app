// app/api/polls/close/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdmin = (req) => (req.headers.get('x-admin-key') || '') === '1234serega';

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { policy } = await req.json().catch(() => ({})); // 'most' по умолчанию
  const closed = await dbApi.closePoll({ policy: policy || 'most' });
  if (!closed) return NextResponse.json({ error: 'no_active_poll' }, { status: 400 });
  return NextResponse.json({ closed });
}
