'use client';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    if (!adminKey) return;
    setError('');
    const res = await fetch('/api/state', {
      headers: { 'x-admin-key': adminKey }
    });
    if (res.status === 401) {
      setError('❌ Неверный ключ ведущего');
      setPlayers([]);
      return;
    }
    const data = await res.json();
    setPlayers(data.players || []);
  }

  useEffect(() => {
    if (adminKey) load();
  }, [adminKey]);

  async function toggleReveal(id) {
    await fetch('/api/admin/reveal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ targetId: id })
    });
    load();
  }

  async function toggleExclude(id) {
    await fetch('/api/admin/exclude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ targetId: id })
    });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-green-300 p-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-green-400">🧠 Панель ведущего</h1>

        {/* Ввод ключа */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="password"
            placeholder="ADMIN_KEY"
            className="px-4 py-2 rounded bg-gray-800 border border-green-700 flex-1"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <button
            onClick={load}
            className="px-4 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400"
          >
            🔑 Загрузить игроков
          </button>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        {/* Список игроков */}
        <div className="grid gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border ${
                p.excluded
                  ? 'border-red-600 bg-gray-900/70'
                  : 'border-green-700 bg-gray-900'
              } shadow-lg`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-green-400">
                  {p.name} • {p.age ?? '?'} {p.excluded ? '🛑 ИСКЛЮЧЁН' : ''}
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleReveal(p.id)}
                    className="px-3 py-1 bg-emerald-600 text-black rounded hover:bg-emerald-500"
                  >
                    🔓 Toggle Reveal
                  </button>
                  <button
                    onClick={() => toggleExclude(p.id)}
                    className={`px-3 py-1 rounded font-bold ${
                      p.excluded
                        ? 'bg-yellow-400 text-black'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {p.excluded ? 'Вернуть' : 'Исключить'}
                  </button>
                </div>
              </div>

              {/* Детали игрока */}
              <div className="mt-2 grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div>Профессия: {p.profession}</div>
                <div>Здоровье: {p.health}</div>
                <div>Психика: {p.psychology}</div>
                <div>Предмет: {p.item}</div>
                <div>Хобби: {p.hobby}</div>
                <div>Страх: {p.fear}</div>
                <div>Секрет: {p.secret}</div>
                <div>Отношение: {p.relationship}</div>
                <div>Черта: {p.trait}</div>
                <div>Способность: {p.ability}</div>
              </div>
            </div>
          ))}

          {players.length === 0 && !error && (
            <div className="text-gray-500">
              Нет данных. Введите ключ и нажмите “Загрузить игроков”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
