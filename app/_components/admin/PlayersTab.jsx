// app/admin/_components/PlayersTab.jsx
'use client';
import { useState } from 'react';

// Улучшенный ActionButton
const ActionButton = ({ onClick, children, variant = 'primary', icon, size = 'medium', disabled = false }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-green-300 border border-emerald-700 hover:border-emerald-500',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg shadow-red-500/25',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        variants[variant]
      } ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="text-base transition-transform group-hover:scale-110">{icon}</span>}
      {children}
    </button>
  );
};

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

// Компонент карточки игрока
function PlayerCard({ player, onToggleReveal, onToggleExclude, onDelete, isFirst }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = [
    { label: 'Возраст', value: player.age, icon: '🎂' },
    { label: 'Пол', value: player.gender, icon: '⚧️' },
    { label: 'Раса', value: player.race, icon: '🌍' },
    { label: 'Профессия', value: player.profession, icon: '💼' },
    { label: 'Здоровье', value: player.health, icon: '❤️' },
    { label: 'Психика', value: player.psychology, icon: '🧠' },
    { label: 'Хобби', value: player.hobby, icon: '🎨' },
    { label: 'Страх', value: player.fear, icon: '😨' },
    { label: 'Черта', value: player.trait, icon: '🌟' },
    { label: 'Способность', value: player.ability, icon: '⚡' },
    { label: 'Секрет', value: player.secret, icon: '🤫' },
    { label: 'Предмет', value: player.item, icon: '🎒' },
    { label: 'Отношение', value: player.relationship, icon: '👥' }
  ].filter(stat => stat.value);

  const visibleStats = isExpanded ? stats : stats.slice(0, 6);

  return (
    <div
      className={`group relative p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-500 hover:scale-105 ${
        player.excluded
          ? 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/5'
          : isFirst
            ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 shadow-2xl shadow-yellow-500/20'
            : 'border-emerald-500/30 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-cyan-500/50'
      }`}>

      {/* Бейдж лидера */}
      {isFirst && (
        <div
          className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
          👑 ЛИДЕР
        </div>
      )}

      {/* Бейдж исключения */}
      {player.excluded && (
        <div
          className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
          🚫 ИСКЛЮЧЁН
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Основная информация */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
              player.excluded
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : isFirst
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            }`}>
              {player.profession?.includes('Врач') ? '👨‍⚕️' :
                player.profession?.includes('Инженер') ? '👨‍🔧' :
                  player.profession?.includes('Учен') ? '👨‍🔬' : '👤'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {player.name}
              </h3>
              <p className="text-green-200/60">{player.profession || 'Участник'}</p>
            </div>
          </div>

          {/* Характеристики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {visibleStats.map((stat, index) => (
              <div key={index}
                   className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <div className="text-xs text-green-200/60 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-green-200 font-medium">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Кнопка показать больше */}
          {stats.length > 6 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-green-300 hover:text-cyan-300 transition-colors text-sm"
            >
              <span>{isExpanded ? '▲ Свернуть' : '▼ Показать все характеристики'}</span>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                {stats.length}
              </span>
            </button>
          )}
        </div>

        {/* Панель действий */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <ActionButton
            onClick={() => onToggleReveal(player.id)}
            variant="secondary"
            icon="🔓"
            size="medium"
          >
            Раскрыть всё
          </ActionButton>
          <ActionButton
            onClick={() => onToggleExclude(player.id)}
            variant={player.excluded ? 'warning' : 'danger'}
            icon={player.excluded ? '↩️' : '🚫'}
            size="medium"
          >
            {player.excluded ? 'Вернуть' : 'Исключить'}
          </ActionButton>
          <ActionButton
            onClick={() => onDelete(player.id)}
            variant="danger"
            icon="🗑️"
            size="medium"
          >
            Удалить
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function PlayersTab({ adminKey, players, onDataUpdate, onError }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExcluded, setFilterExcluded] = useState(false);

  const toggleReveal = async (id) => {
    await fetch('/api/admin/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    onDataUpdate();
  };

  const toggleExclude = async (id) => {
    await fetch('/api/admin/exclude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    onDataUpdate();
  };

  const deletePlayer = async (id) => {
    if (!confirm('Удалить игрока безвозвратно?')) return;
    await fetch('/api/admin/delete-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    onDataUpdate();
  };

  // Фильтрация игроков
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterExcluded ? player.excluded : true;
    return matchesSearch && matchesFilter;
  });

  const activePlayers = filteredPlayers.filter(p => !p.excluded).length;
  const excludedPlayers = filteredPlayers.filter(p => p.excluded).length;

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            👥 Управление игроками
          </h2>
          <p className="text-green-200/60 mt-1">Полный контроль над участниками игры</p>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{activePlayers}</div>
            <div className="text-green-200/60">активных</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-xl font-bold text-red-400">{excludedPlayers}</div>
            <div className="text-green-200/60">исключённых</div>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="p-4 rounded-2xl bg-gray-800/30 border border-emerald-500/20 backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Поиск по имени или профессии..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-emerald-700 text-green-300 placeholder-green-700 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterExcluded(!filterExcluded)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                filterExcluded
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-gray-700 border-gray-600 text-green-300 hover:border-emerald-500'
              }`}
            >
              {filterExcluded ? '🚫 Только исключённые' : '👥 Все игроки'}
            </button>
          </div>
        </div>
      </div>

      {/* Список игроков */}
      <div className="space-y-4">
        {filteredPlayers.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            isFirst={index === 0}
            onToggleReveal={toggleReveal}
            onToggleExclude={toggleExclude}
            onDelete={deletePlayer}
          />
        ))}
      </div>

      {/* Состояние пустого списка */}
      {filteredPlayers.length === 0 && (
        <div
          className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-600 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            {players.length === 0 ? 'Нет игроков' : 'Игроки не найдены'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {players.length === 0
              ? 'Введите ключ администратора и обновите данные для отображения игроков'
              : 'Попробуйте изменить параметры поиска или фильтрации'
            }
          </p>
        </div>
      )}
    </div>
  );
}