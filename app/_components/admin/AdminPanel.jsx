// app/admin/page.jsx
'use client';
import { useEffect, useState } from 'react';


import AuthPanel from '@/app/_components/admin/AuthPanel';
import StatsPanel from '@/app/_components/admin/StatsPanel';
import PlayersTab from '@/app/_components/admin/PlayersTab';
import VotingTab from '@/app/_components/admin/VotingTab';
import EventsTab from '@/app/_components/admin/EventsTab';
import ScenariosTab from '@/app/_components/admin/ScenariosTab';
import ResourcesTab from '@/app/_components/admin/ResourcesTab';

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
  const [activeTab, setActiveTab] = useState('players');
  const [activeEvents, setActiveEvents] = useState([]);
  const [poll, setPoll] = useState(null);
  const [counts, setCounts] = useState({});
  const [last, setLast] = useState(null);
  const [gamePhase, setGamePhase] = useState('preparation');

  // Загрузка данных
  const loadPlayers = async () => {
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
  };

  const loadPoll = async () => {
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
  };

  const loadEvents = async () => {
    try {
      const data = await fetchJSON('/api/events');
      setActiveEvents(data.events || []);
    } catch {
      setActiveEvents([]);
    }
  };

  const loadAllData = async () => {
    await Promise.allSettled([loadPlayers(), loadPoll(), loadEvents()]);
  };

  useEffect(() => {
    if (!adminKey) return;
    loadAllData();
    const interval = setInterval(loadAllData, 3000);
    return () => clearInterval(interval);
  }, [adminKey]);

  const wipeAll = async () => {
    if (!confirm('⚠ Стереть ВСЕХ игроков и начать заново?')) return;
    await fetch('/api/admin/wipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
    });
    await loadAllData();
  };

  // Пропсы для компонентов
  const commonProps = {
    adminKey,
    players,
    activeEvents,
    poll,
    counts,
    last,
    gamePhase,
    onDataUpdate: loadAllData,
    onError: setError
  };

  const tabs = [
    { id: 'players', name: '👥 Игроки', icon: '👥' },
    { id: 'voting', name: '🗳 Голосование', icon: '🗳' },
    { id: 'events', name: '📢 События', icon: '📢' },
    { id: 'scenarios', name: '🎭 Сценарии', icon: '🎭' },
    { id: 'resources', name: '📦 Ресурсы', icon: '📦' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return <PlayersTab {...commonProps} />;
      case 'voting':
        return <VotingTab {...commonProps} />;
      case 'events':
        return <EventsTab {...commonProps} />;
      case 'scenarios':
        return <ScenariosTab {...commonProps} />;
      case 'resources':
        return <ResourcesTab {...commonProps} />;
      default:
        return <PlayersTab {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-green-300 p-4 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Заголовок и статистика */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              🎮 Командный центр бункера
            </h1>
            <p className="text-green-200/60 mt-1">Панель управления игровой сессией</p>
          </div>
          <StatsPanel players={players} activeEvents={activeEvents} gamePhase={gamePhase} />
        </div>

        {/* Аутентификация */}
        <AuthPanel
          adminKey={adminKey}
          onAdminKeyChange={setAdminKey}
          onReload={loadAllData}
          onWipe={wipeAll}
          error={error}
        />

        {/* Навигация */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-800/40 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-gray-900 font-bold'
                  : 'bg-gray-800 text-green-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="rounded-2xl border border-emerald-800/40 bg-gray-900/80 backdrop-blur-sm p-6">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
}