// app/admin/_components/AuthPanel.jsx
'use client';

export default function AuthPanel({ adminKey, onAdminKeyChange, onReload, onWipe, error }) {
  return (
    <div className="rounded-2xl border border-emerald-800/40 bg-gray-900/80 backdrop-blur-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <input
          type="password"
          placeholder="🔑 Введите ключ администратора..."
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-emerald-700 text-green-300 placeholder-green-700 focus:outline-none focus:border-emerald-500 transition-colors"
          value={adminKey}
          onChange={(e) => onAdminKeyChange(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={onReload}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-semibold transition-colors"
          >
            🔄 Обновить
          </button>
          <button
            onClick={onWipe}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
          >
            🧨 Перезапуск
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}