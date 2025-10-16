// app/game/_components/GameHeader.jsx
'use client';


import { useGame } from '@/app/_components/user/game/GameLayout';

export default function GameHeader() {
  const { players, events, poll } = useGame();

  return (
    <div
      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-emerald-500/20 p-6 rounded-2xl mb-6 backdrop-blur-lg">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent animate-gradient">
            🎮 Бункер
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Социальная игра о выживании</p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 animate-pulse">{players.length}</div>
            <div className="text-gray-400 text-sm">игроков</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{events.length}</div>
            <div className="text-gray-400 text-sm">событий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{poll ? '🗳' : '—'}</div>
            <div className="text-gray-400 text-sm">голосование</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min((players.filter(p => !p.excluded).length / 12) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}