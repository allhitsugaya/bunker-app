import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdmin = (req) => {
  const key = req.headers.get('x-admin-key') || '';
  return key === (process.env.ADMIN_KEY || '1234serega');
};

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { candidates, question } = await req.json().catch(() => ({}));
  await dbApi.startPoll({ candidates, question });

  const state = await dbApi.currentPollState({});
  return NextResponse.json(state);
}
