// app/api/polls/start/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdmin = (req) => (req.headers.get('x-admin-key') || '') === '1234serega'; // или process.env.ADMIN_KEY

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { candidates } = await req.json().catch(() => ({}));

  // если кандидатов не передали — берём всех не исключённых
  let list = candidates;
  if (!Array.isArray(list) || !list.length) {
    const all = await dbApi.listAll();
    list = all.filter(p => !p.excluded).map(p => p.id);
  }
  if (!list.length) return NextResponse.json({ error: 'no_candidates' }, { status: 400 });

  const { id } = await dbApi.startPoll({ candidates: list, meta: {} });
  const state = await dbApi.currentPollState({});
  return NextResponse.json({ pollId: id, ...state });
}
