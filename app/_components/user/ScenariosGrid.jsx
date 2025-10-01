// app/components/ScenariosGrid.jsx
'use client';
import { scenarios } from '@/app/_data/data';

export default function ScenariosGrid({ onPick }) {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">📜 Сценарии</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map(s => (
          <article
            key={s.id}
            className="group rounded-2xl border border-emerald-800/40 bg-gray-900 p-4 shadow-lg hover:shadow-emerald-800/20 transition-shadow"
          >
            <header className="mb-2">
              <h3 className="text-lg font-semibold text-green-300">{s.title}</h3>
              <p className="text-sm text-green-200/80 mt-1">{s.short}</p>
            </header>

            <ul className="text-sm space-y-1 text-green-200/90">
              <li><span className="opacity-70">Опасность:</span> {s.hazard}</li>
              <li><span className="opacity-70">Заражение/Триггер:</span> {s.infection}</li>
              <li><span className="opacity-70">Победа:</span> {s.win}</li>
              <li><span className="opacity-70">Провал:</span> {s.lose}</li>
              <li><span className="opacity-70">Механика дня:</span> {s.dailyRoll}</li>
            </ul>

            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Советы</p>
              <div className="max-h-28 overflow-y-auto pr-1 scrollbar">
                <ul className="text-xs space-y-1">
                  {s.tips.map((t, i) => (
                    <li key={i} className="pl-2 border-l border-emerald-700/50">{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="mt-3 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/20 border border-emerald-700/50">
                {s.vibe}
              </span>
              <button
                onClick={() => onPick?.(s)}
                className="px-3 py-1 text-sm rounded-lg bg-emerald-600 text-black hover:bg-emerald-500"
              >
                Выбрать
              </button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
