// app/admin/_components/StatsPanel.jsx
'use client';

const StatCard = ({ title, value, icon, color = 'emerald' }) => (
  <div className={`p-4 rounded-xl border border-${color}-800/40 bg-gray-900/50 backdrop-blur-sm`}>
    <div className="flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-sm text-green-200/60">{title}</div>
        <div className="text-xl font-bold text-green-400">{value}</div>
      </div>
    </div>
  </div>
);

const getPhaseName = (phase) => {
  const phases = {
    preparation: '🔧 Подготовка',
    active: '🎮 Активная игра',
    crisis: '🔥 Кризис',
    resolution: '🏁 Завершение'
  };
  return phases[phase] || phase;
};

export default function StatsPanel({ players, activeEvents, gamePhase }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard title="Игроков" value={players.length} icon="👥" />
      <StatCard title="Активных" value={players.filter(p => !p.excluded).length} icon="🎯" />
      <StatCard title="Событий" value={activeEvents.length} icon="📢" color="blue" />
      <StatCard title="Фаза" value={getPhaseName(gamePhase)} icon="🔄" color="purple" />
    </div>
  );
}