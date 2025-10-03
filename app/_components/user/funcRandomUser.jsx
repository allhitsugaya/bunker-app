'use client';
import { useEffect, useMemo, useState } from 'react';
import ScenariosGrid from '@/app/_components/user/ScenariosGrid';

// --- безопасный fetch JSON ---
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

export default function BunkerClient() {
  // ===== базовое состояние =====
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);   // публичные, как видят все
  const [me, setMe] = useState(null);           // полные статы (только для себя)

  // admin
  const [adminMode, setAdminMode] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');

  // раскрытие
  const FIELD_LABELS = {
    gender: 'Пол',
    age: 'Возраст',
    profession: 'Профессия',
    health: 'Здоровье',
    psychology: 'Психика',
    item: 'Предмет',
    hobby: 'Хобби',
    fear: 'Страх',
    secret: 'Секрет',
    relationship: 'Отношение',
    trait: 'Черта',
    ability: 'Способность'
  };
  const ALL_KEYS = Object.keys(FIELD_LABELS);

  const [mask, setMask] = useState(() =>
    Object.fromEntries(ALL_KEYS.map((k) => [k, false]))
  );

  const getVisibleCols = (list) => {
    const keys = new Set();
    list.forEach((p) => {
      ALL_KEYS.forEach((k) => {
        if (p[k] !== undefined && p[k] !== null) keys.add(k);
      });
    });
    return Array.from(keys);
  };
  const getOpenedKeys = (p) => ALL_KEYS.filter((k) => p[k] !== undefined && p[k] !== null);

  // ===== голосование =====
  const [poll, setPoll] = useState(null);           // { id, createdAt, candidates?: string[] } | null
  const [pollCounts, setPollCounts] = useState(null); // { [playerId]: number }
  const [myVote, setMyVote] = useState(null);         // my current vote (targetId) | null
  const [pollLast, setPollLast] = useState(null);     // last closed poll info (optional)

  const totalVotes = useMemo(
    () => (pollCounts ? Object.values(pollCounts).reduce((s, n) => s + n, 0) : 0),
    [pollCounts]
  );

  const goBack = () => window.history.back();

  // ===== init playerId =====
  useEffect(() => {
    const pid = localStorage.getItem('playerId');
    if (pid) setPlayerId(pid);
  }, []);

  // ===== загрузка состояния игры =====
  const load = async () => {
    setAdminError('');
    const isAdminReq = adminMode && !!adminKey;

    if (!playerId && !isAdminReq) {
      setPlayers([]);
      setMe(null);
      return;
    }

    const headers = {};
    let url = '/api/state';
    if (playerId) url += `?playerId=${playerId}`;
    if (isAdminReq) headers['x-admin-key'] = adminKey;

    try {
      const data = await fetchJSON(url, { headers });
      setPlayers(data.players || []);
      setMe(data.me || null);
    } catch (e) {
      if (e.status === 401) {
        setAdminError('Неверный ключ ведущего');
      } else if (e.status === 404) {
        localStorage.removeItem('playerId');
        setPlayerId(null);
        alert('Твой прежний игрок не найден. Создай нового персонажа.');
      } else if (e.status !== 400) {
        setAdminError('Ошибка загрузки состояния');
      }
      setPlayers([]);
      setMe(null);
    }
  };

  // ===== загрузка состояния голосования =====
  const loadPoll = async () => {
    try {
      const url = playerId ? `/api/polls/state?playerId=${playerId}` : '/api/polls/state';
      const data = await fetchJSON(url);
      setPoll(data.poll || null);
      setPollCounts(data.counts || null);
      setMyVote(data.my ?? null);
      setPollLast(data.last || null);
    } catch {
      setPoll(null);
      setPollCounts(null);
      setMyVote(null);
      setPollLast(null);
    }
  };

  // ===== поллинг обоих состояний =====
  useEffect(() => {
    const ready = playerId || (adminMode && adminKey);
    if (!ready) return;
    const tick = async () => {
      await Promise.allSettled([load(), loadPoll()]);
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [playerId, adminMode, adminKey]);

  // ===== экшены: join / regenerate / reveal / hide / admin exclude =====
  const join = async () => {
    const name = prompt('Имя игрока?') || 'Игрок';
    const res = await fetchJSON('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, playerId })
    });
    if (res.playerId) {
      localStorage.setItem('playerId', res.playerId);
      setPlayerId(res.playerId);
    }
    await load();
  };

  const applyAdminKey = async () => {
    if (!adminKeyInput) return;
    setAdminMode(true);
    setAdminKey(adminKeyInput);
    await load();
    await loadPoll();
  };

  const revealSelf = async () => {
    if (!playerId) return alert('Сначала войдите / создайте персонажа');
    const fields = Object.entries(mask).filter(([, v]) => v).map(([k]) => k);
    await fetchJSON('/api/reveal-self', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, fields })
    }).catch(() => {
    });
    await load();
  };

  const hideSelf = async () => {
    if (!playerId) return;
    await fetchJSON('/api/hide-self', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    }).catch(() => {
    });
    await load();
  };

  const regenerate = async () => {
    if (!playerId) return;
    const name = prompt('Новое имя? (enter — оставить прежнее)') || undefined;
    await fetchJSON('/api/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name })
    }).catch(() => {
    });
    await load();
  };

  const toggleExclude = async (targetId) => {
    if (!adminKey) return alert('Введи ключ ведущего');
    await fetchJSON('/api/admin/exclude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId })
    }).catch(() => {
    });
    await load();
  };

  // ===== экшены голосования =====
  async function startPoll() {
    if (!adminKey) return alert('Нужен ключ ведущего');
    // ВАЖНО: отправляем валидный список кандидатов (не исключённых)
    const candidates = players.filter(p => !p.excluded).map(p => p.id);

    if (candidates.length === 0) {
      alert('Нет доступных кандидатов для голосования');
      return;
    }

    await fetchJSON('/api/polls/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ candidates })
    });
    await loadPoll();
  }

  async function castVote(targetId) {
    if (!playerId) return alert('Сначала войдите / создайте персонажа');
    await fetchJSON('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, targetId })
    });
    await loadPoll();
  }

  async function closePoll() {
    if (!adminKey) return alert('Нужен ключ ведущего');
    await fetchJSON('/api/polls/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ policy: 'most' }) // если нужно — поддержи другие политики на бэке
    });
    await loadPoll();
    await load(); // на случай, если после закрытия ведущий кого-то исключит
  }

  // ===== отрисовка =====
  const Field = ({ k, label }) => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={mask[k]}
        onChange={() => setMask((m) => ({ ...m, [k]: !m[k] }))}
      />
      <span>{label}</span>
    </label>
  );

  const displayedPlayers = players; // публичные (включая “я” как меня видят другие)
  const visibleCols = getVisibleCols(displayedPlayers);

  // кандидаты голосования — строго из poll.candidates (если сервер их прислал), иначе — все не исключённые
  const pollCandidates = useMemo(() => {
    const byId = new Map(displayedPlayers.map((p) => [p.id, p]));
    if (poll?.candidates?.length) {
      return poll.candidates
        .map((id) => byId.get(id))
        .filter(Boolean)
        .filter((p) => !p.excluded);
    }
    return displayedPlayers.filter((p) => !p.excluded);
  }, [poll, displayedPlayers]);

  const nameById = (id) => displayedPlayers.find(x => x.id === id)?.name || id;

  return (
    <div className="min-h-screen bg-gray-950 text-green-300 p-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Панель */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={join} className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400">
            Войти / Создать персонажа
          </button>

          <button onClick={regenerate} className="px-3 py-2 bg-emerald-700 text-black rounded hover:bg-emerald-600">
            Пересоздать персонажа
          </button>

        </div>

        {/* Назад */}
        <div>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-green-300 border border-emerald-700 rounded-lg transition-colors"
          >
            ← Вернуться назад
          </button>
        </div>

        {/* Панель раскрытия + Мои полные */}
        {playerId && (
          <div className="rounded-xl border border-emerald-800/40 p-4 bg-gray-900">
            <div className="text-sm opacity-70 mb-3">
              playerId: <span className="text-green-400">{playerId}</span>
            </div>
            <h4 className="font-bold mb-2">Что показать другим:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {ALL_KEYS.map((k) => (
                <Field key={k} k={k} label={FIELD_LABELS[k]} />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={revealSelf} className="px-3 py-2 bg-green-500 text-black rounded hover:bg-green-400">
                Открыть выбранное
              </button>
            </div>

            {me && (
              <div className="mt-4 p-3 rounded-lg bg-gray-900 border border-emerald-800/40">
                <div className="text-sm font-semibold text-green-300 mb-2">Твои характеристики (полные, видишь только
                  ты)
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {ALL_KEYS.map((k) => (
                    <div key={`me-${k}`}>
                      {FIELD_LABELS[k]}: <span className="text-green-200">{me[k] ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {adminError && <div className="text-red-400 text-sm">{adminError}</div>}

        {/* Таблица игроков (публичные) */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-green-400 mb-3">📋 Данные игроков</h3>
          {displayedPlayers.length === 0 || visibleCols.length === 0 ? (
            <div className="text-gray-400">Пока никто ничего не открыл.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
              <table className="min-w-full text-sm bg-gray-900">
                <thead className="bg-gray-800/60">
                <tr className="text-left">
                  <th className="px-4 py-3 border-b border-emerald-800/40">Имя</th>
                  {visibleCols.map((k) => (
                    <th key={k} className="px-4 py-3 border-b border-emerald-800/40">
                      {FIELD_LABELS[k]}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {displayedPlayers.map((p) => (
                  <tr key={p.id} className="odd:bg-gray-900 even:bg-gray-900/60">
                    <td className="px-4 py-3 border-b border-emerald-900/30 font-semibold text-green-300">
                      {p.name}
                      {p.id === playerId && <span className="ml-2 text-xs text-emerald-400">(ты)</span>}
                      {p.excluded && <span className="ml-2 text-xs text-red-400">[ИСКЛЮЧЁН]</span>}
                    </td>
                    {visibleCols.map((k) => (
                      <td key={k} className="px-4 py-3 border-b border-emerald-900/30">
                        {p[k] ?? <span className="opacity-40">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Открытые характеристики (скролл) */}
        <div className="mt-6">
          <h4 className="text-lg font-bold text-green-400 mb-2">Открытые характеристики</h4>
          <div className="grid gap-3">
            {displayedPlayers.map((p) => {
              const opened = getOpenedKeys(p);
              return (
                <div key={p.id} className="p-3 rounded-lg bg-gray-900 border border-emerald-800/40">
                  <div className="text-sm mb-2 font-semibold text-green-300">
                    {p.name}
                    {p.id === playerId && <span className="ml-2 text-xs text-emerald-400">(ты)</span>}
                    {p.excluded && <span className="ml-2 text-xs text-red-400">[ИСКЛЮЧЁН]</span>}
                  </div>
                  {opened.length === 0 ? (
                    <div className="text-gray-400 text-sm">Ничего не открыто.</div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto pr-1">
                      <div className="flex flex-wrap gap-2">
                        {opened.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-1 rounded-full text-xs bg-emerald-700/30 border border-emerald-700/60"
                          >
                            {FIELD_LABELS[k]}: <span className="text-green-200">{String(p[k])}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Голосование ===== */}
        <div className="mt-8 rounded-2xl border border-emerald-800/40 bg-gray-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold text-green-400">🗳 Голосование</h3>
            <div className="flex items-center gap-2">
              {!poll ? (
                <>
                  <span className="text-sm text-green-200/70">Нет активного голосования</span>
                  {adminKey && (
                    <button
                      onClick={startPoll}
                      className="px-3 py-2 bg-emerald-600 text-black rounded hover:bg-emerald-500"
                    >
                      Запустить
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-xs text-green-200/70">
                    Активно с: {new Date(poll.createdAt).toLocaleTimeString()}
                  </span>
                  {adminKey && (
                    <button
                      onClick={closePoll}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Закрыть
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Активное голосование */}
          {poll && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Кандидаты / голос */}
              <div className="rounded-xl border border-emerald-800/30 bg-gray-900/70 p-3">
                <div className="text-sm font-semibold text-green-300 mb-2">Кандидаты</div>
                {pollCandidates.length === 0 ? (
                  <div className="text-gray-400 text-sm">Нет доступных кандидатов.</div>
                ) : (
                  <div className="grid gap-2">
                    {pollCandidates.map((p) => {
                      const votes = pollCounts?.[p.id] ?? 0;
                      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const isMine = myVote === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`rounded-lg border px-3 py-2 ${
                            isMine ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-800/30 bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-green-300">
                              {p.name} {p.id === playerId && <span className="text-emerald-400 text-xs">(ты)</span>}
                              {p.excluded && <span className="ml-2 text-red-400 text-xs">[ИСКЛЮЧЁН]</span>}
                            </div>
                            <button
                              onClick={() => castVote(p.id)}
                              className="px-2 py-1 text-xs bg-emerald-600 text-black rounded hover:bg-emerald-500"
                            >
                              Голосовать
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-green-200/80">
                            Голоса: {votes} {totalVotes > 0 && `(${pct}%)`}
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-gray-800 rounded">
                            <div className="h-1.5 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {myVote && (
                  <div className="mt-3 text-xs text-emerald-300">
                    Твой голос: <span className="font-semibold">{nameById(myVote)}</span>
                  </div>
                )}
              </div>

              {/* Сводка */}
              <div className="rounded-xl border border-emerald-800/30 bg-gray-900/70 p-3">
                <div className="text-sm font-semibold text-green-300 mb-2">Сводка</div>
                <div className="text-sm text-green-200/80">Всего голосов: {totalVotes}</div>
                <div className="mt-2 grid gap-1 text-xs">
                  {Object.entries(pollCounts || {}).map(([id, cnt]) => (
                    <div key={id} className="flex justify-between">
                      <span className="opacity-80">{nameById(id)}</span>
                      <span className="font-semibold">{cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Последний результат (если нужен) */}
          {!poll && pollLast && (
            <div className="mt-3 text-sm text-green-200/80">
              Последний результат: {pollLast.summary || '—'}
            </div>
          )}
        </div>
      </div>

      {/* карточки сценариев на главной */}
      <ScenariosGrid />
    </div>
  );
}
