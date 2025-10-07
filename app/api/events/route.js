// app/api/events/route.js
import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

// GET - получение активных событий
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');

    let events;
    if (playerId) {
      events = await dbApi.getEventsByPlayer(playerId);
    } else {
      events = await dbApi.getActiveEvents();
    }

    return json({ events });
  } catch (e) {
    console.error('[events.GET] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}

// POST - создание нового события
export async function POST(req) {
  const debug = req.headers.get('x-debug') === '1';
  const adminKey = req.headers.get('x-admin-key');

  try {
    // Проверка прав администратора
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      duration = 5,
      effects = [],
      target = 'all',
      targetId = null,
      severity = 'medium',
      data = {}
    } = body;

    const event = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      description,
      duration, // в минутах
      effects,
      target,
      targetId,
      severity,
      data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 60000).toISOString(),
      isActive: true
    };

    await dbApi.createEvent(event);

    return json({ success: true, event });
  } catch (e) {
    console.error('[events.POST] 500:', e);
    return json(
      debug ? { error: 'internal', message: e.message } : { error: 'internal' },
      { status: 500 }
    );
  }
}

// DELETE - удаление события
export async function DELETE(req) {
  const adminKey = req.headers.get('x-admin-key');

  try {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return json({ error: 'missing_id' }, { status: 400 });
    }

    await dbApi.deleteEvent(eventId);

    return json({ success: true });
  } catch (e) {
    console.error('[events.DELETE] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}