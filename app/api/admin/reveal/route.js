import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

const isAdminKey = (k) => k === '1234serega' || (process.env.ADMIN_KEY && k === process.env.ADMIN_KEY);

export async function POST(req) {
  const key = req.headers.get('x-admin-key') || '';
  if (!isAdminKey(key)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await dbApi.wipe();
  return NextResponse.json({ ok: true, message: 'Game wiped' });
}
