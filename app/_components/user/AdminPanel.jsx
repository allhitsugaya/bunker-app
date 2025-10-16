// app/game/_components/AdminPanel.jsx
'use client';
import { useGame } from './game/GameLayout';
import Button from '@/app/_components/ui/Button';


export default function AdminPanel() {
  const {
    adminKeyInput,
    setAdminKeyInput,
    applyAdminKey,
    adminMode,
    adminError
  } = useGame();

  return (
    <div className="rounded-2xl border border-emerald-800/40 p-4 bg-gray-900">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="password"
          placeholder="Ключ ведущего"
          value={adminKeyInput}
          onChange={(e) => setAdminKeyInput(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 placeholder-green-700 focus:outline-none focus:border-emerald-500"
        />
        <Button
          onClick={applyAdminKey}
          variant="secondary"
          size="small"
        >
          {adminMode ? '🔓 Ведущий' : '🔒 Стать ведущим'}
        </Button>
        {adminError && (
          <span className="text-red-400 text-sm px-3 py-1 bg-red-900/30 rounded-lg">
            {adminError}
          </span>
        )}
      </div>
    </div>
  );
}