'use client';
import { useEffect, useMemo, useState } from 'react';
import ScenariosGrid from '@/app/_components/user/ScenariosGrid';
import { FuelGameClient } from '@/app/_components/admin/AdminPanel';


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

// Компонент для отображения событий
function EventsDisplay({ events }) {
  if (!events || events.length === 0) return null;

  const getEventColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'border-red-500/50 bg-red-900/20';
      case 'medium':
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low':
        return 'border-blue-500/50 bg-blue-900/20';
      default:
        return 'border-emerald-500/50 bg-emerald-900/20';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'crisis':
        return '🔥';
      case 'notification':
        return '📢';
      case 'resource_change':
        return '📦';
      case 'phase_change':
        return '🔄';
      case 'scenario_change':
        return '🎭';
      default:
        return '⚡';
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-800/40 bg-gray-900 p-6">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        📢 Активные события
        <span className="text-sm text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full">
          {events.length}
        </span>
      </h3>

      <div className="grid gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-4 rounded-xl border-2 ${getEventColor(event.severity)} backdrop-blur-sm transition-all duration-300`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-green-300 mb-1">
                  {event.title}
                </h4>
                <p className="text-green-200/90 text-sm mb-2">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-green-200/60">
                  <span>Тип: {event.type}</span>
                  <span>Создано: {new Date(event.createdAt).toLocaleTimeString()}</span>
                  {event.expiresAt && (
                    <span>Истекает: {new Date(event.expiresAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Эффекты события */}
            {event.effects && event.effects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-800/30">
                <div className="flex flex-wrap gap-2">
                  {event.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs bg-gray-800/50 border border-emerald-700/30 text-green-300"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BunkerClient() {
  // ===== базовое состояние =====
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null);

  // admin
  const [adminMode, setAdminMode] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');

  // раскрытие
  const FIELD_LABELS = {
    gender: 'Пол',
    race: 'Раса',
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
  const [poll, setPoll] = useState(null);
  const [pollCounts, setPollCounts] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [pollLast, setPollLast] = useState(null);

  // ===== события =====
  const [events, setEvents] = useState([]);

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

  // ===== загрузка событий =====
  const loadEvents = async () => {
    if (!playerId) return;
    try {
      const data = await fetchJSON(`/api/events?playerId=${playerId}`);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      setEvents([]);
    }
  };

  // ===== поллинг обоих состояний =====
  useEffect(() => {
    const ready = playerId || (adminMode && adminKey);
    if (!ready) return;
    const tick = async () => {
      await Promise.allSettled([load(), loadPoll(), loadEvents()]);
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [playerId, adminMode, adminKey]);

  // ===== экшены =====
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

    if (fields.length === 0) {
      alert('Выберите хотя бы одну характеристику для раскрытия!');
      return;
    }

    try {
      await fetchJSON('/api/reveal-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, fields })
      });
      await load();
      alert(`Успешно раскрыто ${fields.length} характеристик!`);
    } catch (error) {
      console.error('Ошибка раскрытия:', error);
      alert('Ошибка при раскрытии характеристик');
    }
  };

  const hideSelf = async () => {
    if (!playerId) return;
    try {
      await fetchJSON('/api/hide-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      await load();
      alert('Все характеристики скрыты!');
    } catch (error) {
      console.error('Ошибка скрытия:', error);
      alert('Ошибка при скрытии характеристик');
    }
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
      body: JSON.stringify({ policy: 'most' })
    });
    await loadPoll();
    await load();
  }

  // ===== улучшенные компоненты =====
  const CustomCheckbox = ({ checked, onChange, label, description }) => (
    <label
      className="flex items-start gap-3 p-3 rounded-lg border border-emerald-800/30 bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div className="flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
          }} // Пустой обработчик, т.к. управляем через label
          className="hidden"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? 'bg-emerald-500 border-emerald-500'
            : 'bg-gray-700 border-emerald-700 group-hover:border-emerald-600'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-green-300">{label}</div>
        {description && (
          <div className="text-xs text-green-200/60 mt-1">{description}</div>
        )}
      </div>
    </label>
  );

  const Button = ({
                    children,
                    onClick,
                    variant = 'primary',
                    size = 'medium',
                    disabled = false,
                    className = '',
                    ...props
                  }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-950';

    const variants = {
      primary: 'bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 hover:from-emerald-400 hover:to-green-400 active:scale-95',
      secondary: 'bg-gray-800 text-green-300 border border-emerald-700 hover:bg-gray-700 hover:border-emerald-600',
      danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500',
      ghost: 'text-green-300 hover:text-green-200 hover:bg-gray-800'
    };

    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base'
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Группировка характеристик по категориям
  const FIELD_CATEGORIES = {
    basic: ['gender', 'race', 'age', 'profession'],
    traits: ['psychology', 'trait', 'ability'],
    personal: ['hobby', 'fear', 'secret', 'relationship'],
    other: ['health', 'item']
  };

  const CATEGORY_LABELS = {
    basic: 'Основные',
    traits: 'Черты и способности',
    personal: 'Личное',
    other: 'Прочее'
  };

  const displayedPlayers = players;
  const visibleCols = getVisibleCols(displayedPlayers);

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

  // Подсчет выбранных характеристик
  const selectedCount = Object.values(mask).filter(Boolean).length;

  // Функция для переключения чекбокса
  const toggleCheckbox = (key) => {
    setMask(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Функция для выбора всех характеристик
  const selectAll = () => {
    setMask(prev => {
      const allSelected = Object.values(prev).every(Boolean);
      return Object.fromEntries(ALL_KEYS.map(k => [k, !allSelected]));
    });
  };


  return (
    <div className="min-h-screen bg-gray-950 text-green-300 p-4 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Панель управления */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-emerald-800/40">
          <Button onClick={join} variant="primary">
            🎮 Войти / Создать персонажа
          </Button>

          <Button onClick={regenerate} variant="secondary">
            🔄 Пересоздать персонажа
          </Button>

          <Button onClick={goBack} variant="ghost" className="ml-auto">
            ← Назад
          </Button>
        </div>

        {/* Админ панель */}
        <div className="rounded-2xl border border-emerald-800/40 p-4 bg-gray-900">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              placeholder="Ключ ведущего"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 placeholder-green-700 focus:outline-none focus:border-emerald-500"
            />
            <Button onClick={applyAdminKey} variant="secondary" size="small">
              {adminMode ? '🔓 Ведущий' : '🔒 Стать ведущим'}
            </Button>
            {adminError && (
              <span className="text-red-400 text-sm px-3 py-1 bg-red-900/30 rounded-lg">
                {adminError}
              </span>
            )}
          </div>
        </div>

        {/* Отображение событий */}
        <EventsDisplay events={events} />

        {/* Панель раскрытия характеристик */}
        {playerId && (
          <div className="rounded-2xl border border-emerald-800/40 p-6 bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div>
                <h4 className="font-bold text-lg text-green-400 mb-1">Управление раскрытием</h4>
                <div className="text-sm text-green-200/60">
                  playerId: <span className="text-green-400 font-mono">{playerId}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">
                  Выбрано: {selectedCount} / {ALL_KEYS.length}
                </div>
                <Button onClick={selectAll} variant="ghost" size="small">
                  {selectedCount === ALL_KEYS.length ? '❌ Снять все' : '✅ Выбрать все'}
                </Button>
              </div>
            </div>

            {/* Категории характеристик */}
            <div className="space-y-4">
              {Object.entries(FIELD_CATEGORIES).map(([category, fields]) => (
                <div key={category}>
                  <h5 className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">
                    {CATEGORY_LABELS[category]}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {fields.map((k) => (
                      <CustomCheckbox
                        key={k}
                        checked={mask[k]}
                        onChange={() => toggleCheckbox(k)}
                        label={FIELD_LABELS[k]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-emerald-800/30">
              <Button
                onClick={revealSelf}
                variant="primary"
                disabled={selectedCount === 0}
                className="flex-1"
              >
                👁 Открыть выбранное ({selectedCount})
              </Button>
              <Button
                onClick={hideSelf}
                variant="secondary"
                className="flex-1"
              >
                🕶 Скрыть все
              </Button>
            </div>

            {/* Мои полные характеристики */}
            {me && (
              <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-emerald-800/30">
                <div className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <span>🌟 Твои полные характеристики</span>
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                    Видишь только ты
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_KEYS.map((k) => (
                    <div key={`me-${k}`} className="text-sm">
                      <div className="text-green-200/60 text-xs uppercase tracking-wide">
                        {FIELD_LABELS[k]}
                      </div>
                      <div className="text-green-200 font-medium mt-1">
                        {me[k] ?? <span className="text-gray-500">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Таблица игроков */}
        <div className="rounded-2xl border border-emerald-800/40 p-6 bg-gray-900">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
            📋 Игроки
            <span className="text-sm text-green-200/60 font-normal">
              {displayedPlayers.length} участников
            </span>
          </h3>

          {displayedPlayers.length === 0 || visibleCols.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              Пока никто ничего не открыл.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-emerald-800/30">
              <table className="min-w-full text-sm bg-gray-800/20">
                <thead className="bg-gray-800/60">
                <tr className="text-left">
                  <th className="px-4 py-3 border-b border-emerald-800/40 font-semibold text-green-300">
                    Игрок
                  </th>
                  {visibleCols.map((k) => (
                    <th key={k} className="px-4 py-3 border-b border-emerald-800/40 font-semibold text-green-300">
                      {FIELD_LABELS[k]}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {displayedPlayers.map((p) => (
                  <tr key={p.id} className="border-b border-emerald-900/20 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-green-300">{p.name}</span>
                        {p.id === playerId && (
                          <span className="text-xs bg-emerald-500 text-gray-900 px-2 py-1 rounded-full">
                            вы
                          </span>
                        )}
                        {p.excluded && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            исключён
                          </span>
                        )}
                      </div>
                    </td>
                    {visibleCols.map((k) => (
                      <td key={k} className="px-4 py-3 text-green-200">
                        {p[k] ?? <span className="text-gray-500">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Блок голосования */}
        <div className="rounded-2xl border border-emerald-800/40 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
              🗳 Голосование
              {poll && (
                <span className="text-sm text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full animate-pulse">
                  Активно
                </span>
              )}
            </h3>

            <div className="flex items-center gap-3">
              {!poll ? (
                <>
                  <span className="text-sm text-green-200/60">Голосование не запущено</span>
                  {adminKey && (
                    <Button onClick={startPoll} variant="primary" size="small">
                      🚀 Запустить
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm text-green-200/60">
                    Начато: {new Date(poll.createdAt).toLocaleTimeString()}
                  </span>
                  {adminKey && (
                    <Button onClick={closePoll} variant="danger" size="small">
                      ⏹ Завершить
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {poll && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Кандидаты */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-300 text-lg">Кандидаты</h4>
                {pollCandidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Нет доступных кандидатов.
                  </div>
                ) : (
                  pollCandidates.map((p) => {
                    const votes = pollCounts?.[p.id] ?? 0;
                    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                    const isMine = myVote === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isMine
                            ? 'border-emerald-500 bg-emerald-900/20 shadow-lg shadow-emerald-500/20'
                            : 'border-emerald-800/30 bg-gray-800/30 hover:border-emerald-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-green-300 text-lg">
                              {p.name}
                            </div>
                            {p.id === playerId && (
                              <span className="text-xs bg-emerald-500 text-gray-900 px-2 py-1 rounded-full">
                                вы
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => castVote(p.id)}
                            variant={isMine ? 'primary' : 'secondary'}
                            size="small"
                          >
                            {isMine ? '✅ Ваш выбор' : '🗳 Голосовать'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-green-200/80">
                            <span>Голоса: {votes}</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-green-400 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Статистика */}
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 text-lg">Статистика</h4>

                <div className="p-4 rounded-xl bg-gray-800/30 border border-emerald-800/30">
                  <div className="text-2xl font-bold text-green-400 text-center mb-2">
                    {totalVotes}
                  </div>
                  <div className="text-center text-green-200/60 text-sm">
                    всего голосов
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-green-300">Распределение голосов:</h5>
                  {Object.entries(pollCounts || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([id, cnt]) => {
                      const pct = totalVotes > 0 ? Math.round((cnt / totalVotes) * 100) : 0;
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-green-200/80 truncate flex-1">
                            {nameById(id)}
                          </span>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-green-300 font-semibold w-8 text-right">
                              {cnt}
                            </span>
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-green-200/60 w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {myVote && (
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                    <div className="text-sm text-green-300">
                      <span className="opacity-80">Ваш голос: </span>
                      <span className="font-semibold">{nameById(myVote)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!poll && pollLast && (
            <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-emerald-800/30">
              <h4 className="font-semibold text-green-300 mb-2">Последние результаты</h4>
              <div className="text-green-200/80">{pollLast.summary || '—'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Карточки сценариев */}
      <FuelGameClient />
      <ScenariosGrid />
    </div>
  );
}