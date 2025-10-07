import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

// POST - быстрые события
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');

  try {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventType, targetId = null } = body;

    const quickEvents = {
      food_found: {
        title: '🎁 НАХОДКА ПРОДОВОЛЬСТВИЯ',
        description: 'Обнаружен склад с консервами! Запасы еды увеличены.',
        type: 'resource',
        severity: 'low',
        duration: 3
      },
      medicine_discovery: {
        title: '💊 МЕДИЦИНСКИЕ ПРИПАСЫ',
        description: 'Найдена аптечка с лекарствами. Здоровье команды улучшено.',
        type: 'resource',
        severity: 'medium',
        duration: 3
      },
      equipment_found: {
        title: '🔧 ПОЛЕЗНОЕ ОБОРУДОВАНИЕ',
        description: 'Обнаружены инструменты и оборудование для бункера.',
        type: 'resource',
        severity: 'medium',
        duration: 3
      },
      external_contact: {
        title: '🤝 ВНЕШНИЙ КОНТАКТ',
        description: 'Обнаружены другие выжившие. Возможность установить связь.',
        type: 'social',
        severity: 'medium',
        duration: 5
      }
    };

    const quickEvent = quickEvents[eventType];
    if (!quickEvent) {
      return json({ error: 'invalid_event_type' }, { status: 400 });
    }

    const event = {
      id: Math.random().toString(36).substr(2, 9),
      type: quickEvent.type,
      title: quickEvent.title,
      description: quickEvent.description,
      duration: quickEvent.duration,
      effects: [],
      target: targetId ? 'player' : 'all',
      targetId: targetId || null,
      severity: quickEvent.severity,
      data: {
        eventType,
        isQuickEvent: true
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + quickEvent.duration * 60000).toISOString(),
      isActive: true
    };

    await dbApi.createEvent(event);

    return json({ success: true, event });
  } catch (e) {
    console.error('[events/quick.POST] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}