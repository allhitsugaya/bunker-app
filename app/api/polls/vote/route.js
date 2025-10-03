// app/api/polls/vote/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export async function POST(req) {
  const { playerId, targetId } = await req.json().catch(() => ({}));
  if (!playerId || !targetId) return NextResponse.json({ error: 'playerId/targetId required' }, { status: 400 });

  const active = await dbApi.getActivePoll();
  if (!active) return NextResponse.json({ error: 'no_active_poll' }, { status: 400 });

  try {
    await dbApi.vote({ pollId: active.id, voterId: playerId, targetId });
  } catch (e) {
    if (e.message === 'poll_closed') return NextResponse.json({ error: 'poll_closed' }, { status: 400 });
    if (e.message === 'bad_target') return NextResponse.json({ error: 'bad_target' }, { status: 400 });
    return NextResponse.json({ error: 'vote_failed' }, { status: 500 });
  }

  const state = await dbApi.currentPollState({ voterId: playerId });
  return NextResponse.json(state);
}
