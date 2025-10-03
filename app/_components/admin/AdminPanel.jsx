'use client';
import { useEffect, useMemo, useState } from 'react';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = ct.includes('application/json') ? await res.json() : null;
  } catch {
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data ?? {};
}

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  // ------- состояние голосования -------
  const [poll, setPoll] = useState(null);         // { id, createdAt, candidates[], question }
  const [counts, setCounts] = useState({});       // { playerId: votes }
  const [last, setLast] = useState(null);         // { summary } | null

  // форма старта
  const [question, setQuestion] = useState('Кого исключаем из бункера?');
  const [mode, setMode] = useState('players');    // 'players' | 'custom'
  const [customOptions, setCustomOptions] = useState(''); // через перенос строки

  // ===== загрузка игроков (админ) =====
  async function loadPlayers() {
    if (!adminKey) return;
    setError('');
    try {
      const data = await fetchJSON('/api/state', { headers: { 'x-admin-key': adminKey } });
      setPlayers(data.players || []);
    } catch (e) {
      if (e.status === 401) setError('❌ Неверный ключ ведущего');
      else setError('⚠ Ошибка загрузки игроков');
      setPlayers([]);
    }
  }

  // ===== загрузка состояния голосования =====
  async function loadPoll() {
    try {
      const data = await fetchJSON('/api/polls/state');
      setPoll(data.poll || null);
      setCounts(data.counts || {});
      setLast(data.last || null);
    } catch {
      setPoll(null);
      setCounts({});
      setLast(null);
    }
  }

  useEffect(() => {
    if (!adminKey) return;
    const tick = async () => {
      await Promise.allSettled([loadPlayers(), loadPoll()]);
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [adminKey]);

  // ===== действия =====
  async function toggleReveal(id) {
    await fetch('/api/admin/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function toggleExclude(id) {
    await fetch('/api/admin/exclude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function deletePlayer(id) {
    if (!confirm('Удалить игрока безвозвратно?')) return;
    await fetch('/api/admin/delete-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function wipeAll() {
    if (!confirm('⚠ Стереть ВСЕХ игроков и начать заново?')) return;
    await fetch('/api/admin/wipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
    });
    await Promise.allSettled([loadPlayers(), loadPoll()]);
  }

  // --- голосование ---
  async function startPoll() {
    if (!adminKey) return alert('Введите ADMIN_KEY');

    let candidates = [];
    if (mode === 'players') {
      candidates = players.filter(p => !p.excluded).map(p => p.id);
    } else {
      // кастомные варианты (свободный ввод) — создадим псевдо-игроков
      // Чтобы не менять сервер, простейший вариант — не поддерживать кастом сейчас.
      // Но если надо — можно завести спец-документы. Пока просто не отправляем.
      alert('Режим “Свои варианты” пока не поддержан на сервере. Выберите "По игрокам".');
      return;
    }

    await fetchJSON('/api/polls/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ candidates, question })
    });
    await loadPoll();
  }

  async function closePoll() {
    if (!adminKey) return alert('Введите ADMIN_KEY');
    await fetchJSON('/api/polls/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ policy: 'most' })
    });
    await loadPoll();
  }

  const totalVotes = useMemo(
    () => Object.values(counts).reduce((s, n) => s + n, 0),
    [counts]
  );

  // наименование по id
  const nameById = (id) => players.find(p => p.id === id)?.name || id;

  return (
    <div className="min-h-screen bg-gray-950 text-green-300 p-6 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-green-400">🧠 Панель ведущего</h1>

        {/* Ключ + действия */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="password"
            placeholder="ADMIN_KEY"
            className="px-4 py-2 rounded bg-gray-800 border border-green-700 flex-1"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <button onClick={loadPlayers}
                  className="px-4 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400">
            🔑 Загрузить игроков
          </button>
          <button onClick={wipeAll} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500">
            🧨 Пересоздать игру (wipe)
          </button>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        {/* ===== Блок голосования (админ) ===== */}
        <div className="rounded-xl border border-emerald-800/40 bg-gray-900 p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-green-400">🗳 Голосование</h2>
            <button
              onClick={loadPoll}
              className="px-3 py-1.5 rounded border border-emerald-700 text-emerald-300 hover:bg-gray-800"
            >
              Обновить
            </button>
          </div>

          {/* Состояние */}
          <div className="text-sm mb-4">
            <div>
              Статус:{' '}
              {poll ? <span className="text-emerald-400">Активно</span> :
                <span className="text-gray-400">Закрыто</span>}
              {' '}• Вопрос:{' '}
              <span className="text-green-200">{poll?.question || '—'}</span>
            </div>
            {!poll && <div className="text-gray-400 mt-1">Голосование закрыто.</div>}
          </div>

          {/* Текущее голосование */}
          {poll && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-emerald-800/30 bg-gray-900/70 p-3">
                <div className="text-sm font-semibold text-green-300 mb-2">Кандидаты</div>
                {poll.candidates?.length ? (
                  <div className="grid gap-2">
                    {poll.candidates.map((id) => {
                      const votes = counts?.[id] ?? 0;
                      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const p = players.find(x => x.id === id);
                      return (
                        <div key={id} className="rounded-lg border border-emerald-800/30 bg-gray-900 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-green-300">
                              {nameById(id)} {p?.excluded &&
                              <span className="text-red-400 text-xs ml-1">[ИСКЛЮЧЁН]</span>}
                            </div>
                            <div
                              className="text-xs text-green-200/80">Голоса: {votes} {totalVotes > 0 && `(${pct}%)`}</div>
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-gray-800 rounded">
                            <div className="h-1.5 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Нет опций.</div>
                )}
              </div>

              <div className="rounded-lg border border-emerald-800/30 bg-gray-900/70 p-3">
                <div className="text-sm font-semibold text-green-300 mb-2">Сводка</div>
                <div className="text-sm text-green-200/80">Всего голосов: {totalVotes}</div>
                <div className="mt-2 grid gap-1 text-xs">
                  {Object.entries(counts || {}).map(([id, cnt]) => (
                    <div key={id} className="flex justify-between">
                      <span className="opacity-80">{nameById(id)}</span>
                      <span className="font-semibold">{cnt}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={closePoll}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Закрыть голосование
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Старт нового голосования */}
          {!poll && (
            <>
              <hr className="border-emerald-800/40 my-3" />
              <div className="text-green-300 font-semibold mb-2">Начать новое голосование</div>

              <div className="grid gap-3 max-w-2xl">
                <label className="text-sm">
                  Вопрос
                  <input
                    className="mt-1 w-full px-3 py-2 bg-gray-900 border border-emerald-800/40 rounded outline-none"
                    placeholder="Кого исключаем из бункера?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </label>

                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="players"
                      checked={mode === 'players'}
                      onChange={() => setMode('players')}
                    />
                    По игрокам (кнопки с именами)
                  </label>

                  <label className="inline-flex items-center gap-2 opacity-60">
                    <input
                      type="radio"
                      name="mode"
                      value="custom"
                      checked={mode === 'custom'}
                      onChange={() => setMode('custom')}
                      disabled
                    />
                    Свои варианты (скоро)
                  </label>
                </div>

                {/* Отключено: поддержка кастомных ещё не реализована на сервере */}
                {mode === 'custom' && (
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 bg-gray-900 border border-emerald-800/40 rounded outline-none"
                    placeholder="Каждый вариант с новой строки"
                    value={customOptions}
                    onChange={(e) => setCustomOptions(e.target.value)}
                    disabled
                  />
                )}

                <div>
                  <button
                    onClick={startPoll}
                    className="px-4 py-2 bg-emerald-600 text-black font-bold rounded hover:bg-emerald-500"
                  >
                    ▶ Начать голосование
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== Игроки ===== */}
        <div className="grid gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border ${
                p.excluded ? 'border-red-600 bg-gray-900/70' : 'border-green-700 bg-gray-900'
              } shadow-lg`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-green-400">
                  {p.name} • {p.age ?? '—'} {p.excluded ? '🛑 ИСКЛЮЧЁН' : ''}
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
                      p.excluded ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                    }`}
                  >
                    {p.excluded ? 'Вернуть' : 'Исключить'}
                  </button>
                  <button
                    onClick={() => deletePlayer(p.id)}
                    className="px-3 py-1 rounded font-bold bg-red-700 text-white hover:bg-red-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="mt-2 grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div>Профессия: {p.profession ?? '—'}</div>
                <div>Здоровье: {p.health ?? '—'}</div>
                <div>Психика: {p.psychology ?? '—'}</div>
                <div>Предмет: {p.item ?? '—'}</div>
                <div>Хобби: {p.hobby ?? '—'}</div>
                <div>Страх: {p.fear ?? '—'}</div>
                <div>Секрет: {p.secret ?? '—'}</div>
                <div>Отношение: {p.relationship ?? '—'}</div>
                <div>Черта: {p.trait ?? '—'}</div>
                <div>Способность: {p.ability ?? '—'}</div>
              </div>
            </div>
          ))}

          {players.length === 0 && !error && (
            <div className="text-gray-500">Нет данных. Введите ключ и нажмите “Загрузить игроков”.</div>
          )}
        </div>
      </div>
    </div>
  );
}
