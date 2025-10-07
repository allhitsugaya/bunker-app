import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

// POST - отправка глобального уведомления
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');

  try {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, type = 'info', duration = 5 } = body;

    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'notification',
      title: '📢 Системное уведомление',
      description: message,
      duration,
      target: 'all',
      severity: type,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 60000).toISOString(),
      isActive: true
    };

    await dbApi.createEvent(notification);

    return json({ success: true, notification });
  } catch (e) {
    console.error('[events/global.POST] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}