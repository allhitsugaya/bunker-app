// app/game/_components/PlayersTable.jsx
'use client';
import { useGame } from './game/GameLayout';

export default function PlayersTable() {
  const {
    players,
    playerId,
    visibleCols,
    FIELD_LABELS
  } = useGame();

  const displayedPlayers = players;

  if (displayedPlayers.length === 0 || visibleCols.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-800/40 p-6 bg-gray-900">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
          📋 Игроки
          <span className="text-sm text-green-200/60 font-normal">
            {displayedPlayers.length} участников
          </span>
        </h3>
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          Пока никто ничего не открыл.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-800/40 p-6 bg-gray-900">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
        📋 Игроки
        <span className="text-sm text-green-200/60 font-normal">
          {displayedPlayers.length} участников
        </span>
      </h3>

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
    </div>
  );
}