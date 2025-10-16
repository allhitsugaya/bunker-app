// app/game/hooks/useGameState.js
import { useCallback, useEffect, useState } from 'react';
import { usePolling } from './usePolling';

// Безопасный fetch
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

// Константы
const FIELD_LABELS = {
  gender: 'Пол', race: 'Раса', age: 'Возраст', profession: 'Профессия',
  health: 'Здоровье', psychology: 'Психика', item: 'Предмет', hobby: 'Хобби',
  fear: 'Страх', secret: 'Секрет', relationship: 'Отношение', trait: 'Черта', ability: 'Способность'
};

const ALL_KEYS = Object.keys(FIELD_LABELS);

const FIELD_CATEGORIES = {
  basic: ['gender', 'race', 'age', 'profession'],
  traits: ['psychology', 'trait', 'ability'],
  personal: ['hobby', 'fear', 'secret', 'relationship'],
  other: ['health', 'item']
};

const CATEGORY_LABELS = {
  basic: 'Основные', traits: 'Черты и способности',
  personal: 'Личное', other: 'Прочее'
};

export function useGameState() {
  // Базовое состояние
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null);

  // Админ
  const [adminMode, setAdminMode] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');

  // Раскрытие
  const [mask, setMask] = useState(() =>
    Object.fromEntries(ALL_KEYS.map((k) => [k, false]))
  );

  // Голосование
  const [poll, setPoll] = useState(null);
  const [pollCounts, setPollCounts] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [pollLast, setPollLast] = useState(null);

  // События
  const [events, setEvents] = useState([]);

  // Инициализация playerId
  useEffect(() => {
    const pid = localStorage.getItem('playerId');
    if (pid) setPlayerId(pid);
  }, []);

  // Загрузка состояния игры
  const loadGameState = useCallback(async () => {
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
      } else if (e.status !== 400) {
        setAdminError('Ошибка загрузки состояния');
      }
      setPlayers([]);
      setMe(null);
    }
  }, [playerId, adminMode, adminKey]);

  // Загрузка голосования
  const loadPoll = useCallback(async () => {
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
  }, [playerId]);

  // Загрузка событий
  const loadEvents = useCallback(async () => {
    if (!playerId) return;
    try {
      const data = await fetchJSON(`/api/events?playerId=${playerId}`);
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    }
  }, [playerId]);

  // Поллинг данных
  usePolling({
    dependencies: [playerId, adminMode, adminKey],
    callbacks: [loadGameState, loadPoll, loadEvents],
    interval: 2500
  });

  // Действия игрока
  const joinGame = async () => {
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
    await loadGameState();
  };

  const regeneratePlayer = async () => {
    if (!playerId) return;
    const name = prompt('Новое имя? (enter — оставить прежнее)') || undefined;
    await fetchJSON('/api/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name })
    }).catch(() => {
    });
    await loadGameState();
  };

  const applyAdminKey = async () => {
    if (!adminKeyInput) return;
    setAdminMode(true);
    setAdminKey(adminKeyInput);
    await loadGameState();
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
      await loadGameState();
      alert(`Успешно раскрыто ${fields.length} характеристик!`);
    } catch (error) {
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
      await loadGameState();
      alert('Все характеристики скрыты!');
    } catch (error) {
      alert('Ошибка при скрытии характеристик');
    }
  };

  const toggleCheckbox = (key) => {
    setMask(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    setMask(prev => {
      const allSelected = Object.values(prev).every(Boolean);
      return Object.fromEntries(ALL_KEYS.map(k => [k, !allSelected]));
    });
  };

  // Действия голосования
  const startPoll = async () => {
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
  };

  const castVote = async (targetId) => {
    if (!playerId) return alert('Сначала войдите / создайте персонажа');
    await fetchJSON('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, targetId })
    });
    await loadPoll();
  };

  const closePoll = async () => {
    if (!adminKey) return alert('Нужен ключ ведущего');
    await fetchJSON('/api/polls/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ policy: 'most' })
    });
    await loadPoll();
    await loadGameState();
  };

  // Вспомогательные функции
  const getVisibleCols = (list) => {
    const keys = new Set();
    list.forEach((p) => {
      ALL_KEYS.forEach((k) => {
        if (p[k] !== undefined && p[k] !== null) keys.add(k);
      });
    });
    return Array.from(keys);
  };

  const selectedCount = Object.values(mask).filter(Boolean).length;
  const visibleCols = getVisibleCols(players);

  const pollCandidates = (poll?.candidates?.length
      ? poll.candidates.map(id => players.find(p => p.id === id)).filter(Boolean).filter(p => !p.excluded)
      : players.filter(p => !p.excluded)
  );

  const nameById = (id) => players.find(x => x.id === id)?.name || id;

  return {
    // Состояние
    playerId, players, me, adminMode, adminKeyInput, adminKey, adminError,
    mask, poll, pollCounts, myVote, pollLast, events,
    selectedCount, visibleCols, pollCandidates,

    // Константы
    FIELD_LABELS, ALL_KEYS, FIELD_CATEGORIES, CATEGORY_LABELS,

    // Сеттеры
    setAdminKeyInput,

    // Действия
    joinGame, regeneratePlayer, applyAdminKey, revealSelf, hideSelf,
    toggleCheckbox, selectAll, startPoll, castVote, closePoll,

    // Вспомогательные
    nameById
  };
}