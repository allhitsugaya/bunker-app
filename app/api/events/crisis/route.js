import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const json = (data, init) => NextResponse.json(data, init);

// POST - создание кризисного события
export async function POST(req) {
  const adminKey = req.headers.get('x-admin-key');

  try {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { crisisType, intensity = 'medium', duration = 10 } = body;

    const crises = {
      radiation: {
        title: '☢️ РАДИАЦИОННАЯ УГРОЗА',
        description: 'Уровень радиации критически повышен! Требуется укрытие. Все игроки получают -20% к здоровью.',
        effects: ['health_decrease', 'movement_restricted'],
        icon: '☢️'
      },
      system_failure: {
        title: '🛠️ КРИТИЧЕСКАЯ ПОЛОМКА',
        description: 'Основные системы бункера повреждены. Требуется срочный ремонт! Ресурсы тратятся в 2 раза быстрее.',
        effects: ['resource_decay', 'ability_disabled'],
        icon: '🛠️'
      },
      mutant_attack: {
        title: '👹 АТАКА МУТАНТОВ',
        description: 'Мутанты атакуют периметр! Подготовьтесь к обороне. Шанс потери предметов увеличен.',
        effects: ['combat_required', 'resource_loss'],
        icon: '👹'
      },
      mental_breakdown: {
        title: '🧠 ПСИХИЧЕСКИЙ КРИЗИС',
        description: 'Коллективная паника! Стабильность команды под угрозой. Голосование временно отключено.',
        effects: ['psychology_decrease', 'vote_disabled'],
        icon: '🧠'
      },
      resource_crisis: {
        title: '📉 КРИЗИС РЕСУРСОВ',
        description: 'Запасы стремительно иссякают! Необходимы срочные меры по поиску новых источников.',
        effects: ['resource_emergency', 'scavenging_boost'],
        icon: '📉'
      }
    };

    const crisis = crises[crisisType];
    if (!crisis) {
      return json({ error: 'invalid_crisis_type' }, { status: 400 });
    }

    const event = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'crisis',
      title: crisis.title,
      description: crisis.description,
      duration,
      effects: crisis.effects,
      target: 'all',
      severity: intensity,
      crisisType,
      data: {
        icon: crisis.icon,
        intensity
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 60000).toISOString(),
      isActive: true
    };

    await dbApi.createEvent(event);

    return json({ success: true, event });
  } catch (e) {
    console.error('[events/crisis.POST] 500:', e);
    return json({ error: 'internal' }, { status: 500 });
  }
}