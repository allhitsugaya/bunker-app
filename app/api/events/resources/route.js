import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

// POST - модификация ресурсов
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');

  try {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { modifier, resourceType = 'all', reason = '', duration = 5 } = body;

    const title = modifier > 0 ? '📦 ПОПОЛНЕНИЕ ЗАПАСОВ' : '⚠️ ПОТЕРИ РЕСУРСОВ';
    const description = reason || (modifier > 0 ?
      `Обнаружены дополнительные ресурсы (+${modifier}%)` :
      `Произошла потеря ресурсов (${modifier}%)`);

    const event = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'resource_change',
      title,
      description,
      duration,
      effects: [`resources_${modifier > 0 ? 'increase' : 'decrease'}`],
      target: 'all',
      severity: Math.abs(modifier) > 30 ? 'high' : 'medium',
      data: {
        modifier,
        resourceType,
        reason
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 60000).toISOString(),
      isActive: true
    };

    await dbApi.createEvent(event);

    return json({ success: true, event });
  } catch (e) {
    console.error('[events/resources.POST] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}