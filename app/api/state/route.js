import { NextResponse } from 'next/server';
import { dbApi } from '@/app/_data/lib/db';

export const runtime = 'nodejs';

const adminHeader = (req) => req.headers.get('x-admin-key') || '';
const isAdmin = (key) => key === '1234serega'; // дефолтный ключ ведущего

export async function GET(req) {
  const key = adminHeader(req);
  const url = new URL(req.url);
  const playerId = url.searchParams.get('playerId');

  // --- 1. Ведущий ---
  if (key) {
    if (!isAdmin(key)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const all = dbApi.listAll(); // ведущий видит всех
    return NextResponse.json({ admin: true, players: all });
  }

  // --- 2. Игрок ---
  if (!playerId) {
    return NextResponse.json({ error: 'playerId required' }, { status: 400 });
  }

  const meFull = dbApi.getPlayer(playerId);
  if (!meFull || meFull.excluded) {
    // если исключён — не видит никого
    return NextResponse.json({ admin: false, players: [] });
  }

  // Получаем “публичное” представление себя
  const myPublic = (() => {
    const row = meFull;
    if (!row.public) return { id: row.id, name: row.name };
    try {
      const pub = JSON.parse(row.public);
      return { id: row.id, name: row.name, ...pub };
    } catch {
      return { id: row.id, name: row.name };
    }
  })();

  // Остальные — только public
  const publicOthers = dbApi.listPublic().filter((p) => p.id !== playerId);

  // В “players” возвращаем себя (в публичном виде) и остальных
  const players = [myPublic, ...publicOthers];

  // А в “me” возвращаем полный объект — для локального управления
  return NextResponse.json({
    admin: false,
    players,
    me: meFull
  });
}
