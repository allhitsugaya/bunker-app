// app/admin/_components/PlayersTab.jsx
'use client';

const ActionButton = ({ onClick, children, variant = 'primary', icon, size = 'medium' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 hover:from-emerald-400 hover:to-green-400',
    secondary: 'bg-gray-800 text-green-300 border border-emerald-700 hover:bg-gray-700 hover:border-emerald-600',
    danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
        variants[variant]
      } ${sizes[size]}`}
    >
      {icon && <span>{icon}</span>}
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

export default function PlayersTab({ adminKey, players, onDataUpdate, onError }) {

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-green-400 mb-4">👥 Управление игроками</h2>
      <div className="grid gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
              player.excluded
                ? 'border-red-500/50 bg-red-900/20'
                : 'border-emerald-700/50 bg-gray-800/30 hover:border-emerald-500/70'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-green-300">{player.name}</h3>
                  {player.excluded && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                      🚫 ИСКЛЮЧЁН
                    </span>
                  )}
                  {player.id === players[0]?.id && (
                    <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs rounded-full font-bold">
                      👑 ЛИДЕР
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-green-200/60">Возраст:</span> {player.age || '—'}</div>
                  <div><span className="text-green-200/60">Пол:</span> {player.gender || '—'}</div>
                  <div><span className="text-green-200/60">Раса:</span> {player.race || '—'}</div>
                  <div><span className="text-green-200/60">Профессия:</span> {player.profession || '—'}</div>
                  <div><span className="text-green-200/60">Здоровье:</span> {player.health || '—'}</div>
                  <div><span className="text-green-200/60">Психика:</span> {player.psychology || '—'}</div>
                  <div><span className="text-green-200/60">Хобби:</span> {player.hobby || '—'}</div>
                  <div><span className="text-green-200/60">Страх:</span> {player.fear || '—'}</div>
                  <div><span className="text-green-200/60">Черта:</span> {player.trait || '—'}</div>
                  <div><span className="text-green-200/60">Способность:</span> {player.ability || '—'}</div>
                  <div><span className="text-green-200/60">Секрет:</span> {player.secret || '—'}</div>
                  <div><span className="text-green-200/60">Предмет:</span> {player.item || '—'}</div>
                  <div><span className="text-green-200/60">Отношение:</span> {player.relationship || '—'}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={() => toggleReveal(player.id)} variant="secondary" icon="🔓" size="small">
                  Раскрыть
                </ActionButton>
                <ActionButton onClick={() => toggleExclude(player.id)}
                              variant={player.excluded ? 'warning' : 'danger'}
                              icon={player.excluded ? '↩️' : '🚫'} size="small">
                  {player.excluded ? 'Вернуть' : 'Исключить'}
                </ActionButton>
                <ActionButton onClick={() => deletePlayer(player.id)} variant="danger" icon="🗑️" size="small">
                  Удалить
                </ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12 text-green-200/40">
          <div className="text-6xl mb-4">👥</div>
          <div>Нет данных об игроках</div>
          <div className="text-sm mt-2">Введите ключ администратора и обновите данные</div>
        </div>
      )}
    </div>
  );
}