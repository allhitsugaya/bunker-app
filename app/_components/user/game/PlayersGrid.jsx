// app/game/_components/PlayersGrid.jsx
'use client';
import { useGame } from '@/app/_components/user/game/GameLayout';

;

function PlayerCard({ player, isMe }) {
  const visibleFields = Object.entries(player).filter(([key, value]) =>
    value && !['id', 'name', 'excluded'].includes(key)
  ).slice(0, 3); // Показываем только 3 характеристики

  return (
    <div
      className={`group relative p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
        isMe
          ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 shadow-2xl shadow-cyan-500/20'
          : player.excluded
            ? 'border-red-500/50 bg-red-500/5 grayscale'
            : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-emerald-500/30 hover:shadow-emerald-500/10'
      }`}>

      {/* Индикаторы */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {isMe && (
          <span
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ВЫ
          </span>
        )}
        {player.excluded && (
          <span
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            🚫
          </span>
        )}
      </div>

      {/* Аватар и имя */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
            isMe
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-cyan-500/25'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-gray-500/25'
          }`}>
          {player.profession?.includes('Врач') ? '👨‍⚕️' :
            player.profession?.includes('Инженер') ? '👨‍🔧' :
              player.profession?.includes('Учен') ? '👨‍🔬' : '👤'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
            {player.name}
          </h3>
          <p className="text-gray-400 text-sm">{player.profession || 'Участник'}</p>
        </div>
      </div>

      {/* Характеристики */}
      <div className="space-y-3">
        {visibleFields.map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="text-gray-400 capitalize">{key}:</span>
            <span className={`font-semibold ${
              key === 'health' && value.includes('Здоров') ? 'text-emerald-400' :
                key === 'psychology' && value.includes('Стабиль') ? 'text-cyan-400' :
                  'text-white'
            }`}>
              {value}
            </span>
          </div>
        ))}

        {visibleFields.length === 0 && (
          <div className="text-center py-2">
            <span className="text-gray-500 text-sm">Характеристики скрыты</span>
          </div>
        )}
      </div>

      {/* Футер с дополнительной информацией */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Возраст: {player.age || '—'}</span>
          <span>{visibleFields.length} раскрыто</span>
        </div>
      </div>
    </div>
  );
}

export default function PlayersGrid() {
  const { players, playerId } = useGame();

  if (players.length === 0) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-gray-600 p-12 text-center bg-gradient-to-br from-gray-800/30 to-gray-900/30">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">Нет игроков</h3>
        <p className="text-gray-500">Будьте первым, кто присоединится к игре!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
          👥 Участники бункера
        </h3>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          {players.length} игроков
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isMe={player.id === playerId}
          />
        ))}
      </div>
    </div>
  );
}