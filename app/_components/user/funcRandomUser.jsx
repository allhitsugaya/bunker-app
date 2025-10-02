'use client';
import { useEffect, useState } from 'react';
import ScenariosGrid from '@/app/_components/user/ScenariosGrid';

// --- безопасный fetch JSON ---
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${text.slice(0, 160)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export default function BunkerClient() {
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null);

  const [adminMode, setAdminMode] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('1234serega');
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');

  const [mask, setMask] = useState({
    age: false, profession: false, health: false, psychology: false, item: false,
    hobby: false, fear: false, secret: false, relationship: false, trait: false, ability: false
  });

  const FIELD_LABELS = {
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

  const getVisibleCols = (list) => {
    const keys = new Set();
    list.forEach(p => {
      ALL_KEYS.forEach(k => {
        if (p[k] !== undefined && p[k] !== null) keys.add(k);
      });
    });
    return Array.from(keys);
  };

  const getOpenedKeys = (p) => ALL_KEYS.filter(k => p[k] !== undefined && p[k] !== null);

  // init: подхватываем playerId из localStorage
  useEffect(() => {
    const pid = localStorage.getItem('playerId');
    if (pid) setPlayerId(pid);
  }, []);

  // join/create
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

  // ---- load state (не шлём запрос, пока не готовы) ----
  const load = async () => {
    setAdminError('');

    const isAdminReq = adminMode && !!adminKey;
    if (!playerId && !isAdminReq) {
      // ничего не делаем, пока нет playerId и не вошли как ведущий
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
        setPlayers([]);
        setMe(null);
        return;
      }
      if (e.status === 404) {
        // playerId устарел/не найден (новый инстанс на Vercel)
        localStorage.removeItem('playerId');
        setPlayerId(null);
        setPlayers([]);
        setMe(null);
        alert('Твой прежний игрок не найден. Создай нового персонажа.');
        return;
      }
      if (e.status === 400) {
        // сервер сказал "playerId required" — просто ждём join
        setPlayers([]);
        setMe(null);
        return;
      }
      console.error('load() failed:', e);
      setAdminError('Ошибка загрузки состояния');
      setPlayers([]);
      setMe(null);
    }
  };

  // admin key
  const applyAdminKey = async () => {
    if (!adminKeyInput) return;
    setAdminMode(true);
    setAdminKey(adminKeyInput);
    await load();
  };

  // self reveal
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

  // regenerate
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

  // admin: exclude/return
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

  // polling — только если есть playerId или включён режим ведущего
  useEffect(() => {
    const ready = playerId || (adminMode && adminKey);
    if (!ready) return;
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [playerId, adminMode, adminKey]);

  const Field = ({ k, label }) => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={mask[k]}
        onChange={() => setMask(m => ({ ...m, [k]: !m[k] }))}
      />
      <span>{label}</span>
    </label>
  );

  const displayedPlayers = players; // публичные (включая “я” как меня видят другие)

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

          <div className="ml-auto flex items-center gap-2">
            <input
              type="password"
              placeholder="ADMIN_KEY"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="px-3 py-2 bg-gray-800 rounded border border-gray-700"
            />
            <button
              onClick={applyAdminKey}
              className="px-3 py-2 bg-emerald-600 text-black rounded hover:bg-emerald-500"
            >
              Войти как ведущий
            </button>
          </div>
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
              <button onClick={hideSelf} className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600">
                Скрыть всё
              </button>
            </div>

            {me && (
              <div className="mt-4 p-3 rounded-lg bg-gray-900 border border-emerald-800/40">
                <div className="text-sm font-semibold text-green-300 mb-2">
                  Твои характеристики (полные, видишь только ты)
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
          {(() => {
            const cols = getVisibleCols(displayedPlayers);
            if (displayedPlayers.length === 0 || cols.length === 0) {
              return <div className="text-gray-400">Пока никто ничего не открыл.</div>;
            }
            return (
              <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
                <table className="min-w-full text-sm bg-gray-900">
                  <thead className="bg-gray-800/60">
                  <tr className="text-left">
                    <th className="px-4 py-3 border-b border-emerald-800/40">Имя</th>
                    {cols.map(k => (
                      <th key={k} className="px-4 py-3 border-b border-emerald-800/40">
                        {FIELD_LABELS[k]}
                      </th>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                  {displayedPlayers.map(p => (
                    <tr key={p.id} className="odd:bg-gray-900 even:bg-gray-900/60">
                      <td className="px-4 py-3 border-b border-emerald-900/30 font-semibold text-green-300">
                        {p.name}
                        {p.id === playerId && <span className="ml-2 text-xs text-emerald-400">(ты)</span>}
                        {p.excluded && <span className="ml-2 text-xs text-red-400">[ИСКЛЮЧЁН]</span>}
                      </td>
                      {cols.map(k => (
                        <td key={k} className="px-4 py-3 border-b border-emerald-900/30">
                          {p[k] ?? <span className="opacity-40">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        {/* Открытые характеристики (скролл) */}
        <div className="mt-6">
          <h4 className="text-lg font-bold text-green-400 mb-2">Открытые характеристики</h4>
          <div className="grid gap-3">
            {displayedPlayers.map(p => {
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
                        {opened.map(k => (
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
      </div>

      {/* карточки сценариев на главной */}
      <ScenariosGrid />
    </div>
  );
}
