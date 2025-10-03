// app/api/polls/state/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export async function GET(req) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get('playerId') || null;
  const state = await dbApi.currentPollState({ voterId: playerId });
  return NextResponse.json(state);
}
