// app/game/_components/EnhancedControlPanel.jsx
'use client';


import { useGame } from '@/app/_components/user/game/GameLayout';

export default function EnhancedControlPanel() {
  const { joinGame, regeneratePlayer, playerId } = useGame();

  const goBack = () => window.history.back();

  return (
    <div
      className="flex flex-wrap items-center gap-3 p-6 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-white/10">
      <button
        onClick={joinGame}
        className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25"
      >
        <span className="text-xl transition-transform group-hover:scale-110">🎮</span>
        <span>{playerId ? '🔄 Перезайти' : '🚀 Войти в игру'}</span>
      </button>

      {playerId && (
        <button
          onClick={regeneratePlayer}
          className="group flex items-center gap-3 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600 hover:border-cyan-400 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
        >
          <span className="text-lg transition-transform group-hover:rotate-180">🔄</span>
          <span>Новый персонаж</span>
        </button>
      )}

      <button
        onClick={goBack}
        className="group flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-cyan-300 hover:bg-gray-800 font-semibold rounded-xl transition-all duration-300 ml-auto"
      >
        <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
        <span>Назад</span>
      </button>
    </div>
  );
}