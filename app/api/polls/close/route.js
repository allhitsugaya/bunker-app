// app/api/polls/close/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdmin = (req) => {
  const key = req.headers.get('x-admin-key') || '';
  return key === (process.env.ADMIN_KEY || '1234serega');
};

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const closed = await dbApi.closeActivePoll();
  if (!closed) return NextResponse.json({ error: 'no_active_poll' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
