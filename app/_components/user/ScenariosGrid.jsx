// app/components/ScenariosGrid.js
'use client';
import { scenarios } from '@/app/_data/data';

export default function ScenariosGrid({ onPick }) {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">📜 Сценарии Выживания</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map(s => (
          <article
            key={s.id}
            className="group relative rounded-2xl border-2 border-emerald-800/60 bg-gray-900/90 p-5 shadow-lg hover:shadow-emerald-800/30 transition-all duration-300 hover:border-emerald-600 hover:scale-[1.02]"
          >
            {/* Индикатор сложности */}
            <div className="absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full bg-red-500/90 text-white font-bold">
              {s.provisions && s.provisions.food && s.provisions.food.quantity && s.provisions.food.quantity.includes('1.5') ? '🔥 СЛОЖНО' :
                s.provisions && s.provisions.food && s.provisions.food.quantity && s.provisions.food.quantity.includes('3') ? '⚠️ СРЕДНЕ' : '🎯 ВЫЖИВАНИЕ'}
            </div>

            <header className="mb-3">
              <h3 className="text-lg font-bold text-green-300 group-hover:text-green-200 transition-colors">
                {s.title}
              </h3>
              <p className="text-sm text-green-200/80 mt-2 leading-relaxed">{s.short}</p>
            </header>

            {/* Система провизии */}
            <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-emerald-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-green-400">🎒 ПРОВИЗИЯ</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  s.provisions && s.provisions.food && s.provisions.food.quantity && s.provisions.food.quantity.includes('1.5') ? 'bg-red-500/20 text-red-300' :
                    s.provisions && s.provisions.food && s.provisions.food.quantity && s.provisions.food.quantity.includes('3') ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                }`}>
                  {s.provisions && s.provisions.food && s.provisions.food.quantity ? s.provisions.food.quantity : 'Не указано'}
                </span>
              </div>
              <div className="text-xs space-y-1 text-green-200/70">
                <div className="flex justify-between">
                  <span>Еда:</span>
                  <span className="font-medium">
                    {s.provisions && s.provisions.food && s.provisions.food.type ? s.provisions.food.type : 'Не указано'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Медицина:</span>
                  <span className="font-medium">
                    {s.provisions && s.provisions.medical && s.provisions.medical.supplies ? s.provisions.medical.supplies.length : 0} видов
                  </span>
                </div>
                <div className="text-[10px] opacity-60 mt-1">
                  Риск: {s.provisions && s.provisions.food && s.provisions.food.risks && s.provisions.food.risks[0] ? s.provisions.food.risks[0] : 'нехватка ресурсов'}
                </div>
              </div>
            </div>

            {/* Основная информация */}
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-red-400 font-semibold">☠️ Опасность:</span>
                <p className="text-green-200/90 text-xs mt-1">{s.hazard}</p>
              </div>

              <div>
                <span className="text-orange-400 font-semibold">🦠 Заражение:</span>
                <p className="text-green-200/90 text-xs mt-1">{s.infection}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-green-400 font-semibold">🎯 Цель:</span>
                  <p className="text-green-200/90 mt-1 line-clamp-2">
                    {s.primary_goal || s.win}
                  </p>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">⚙️ Механика:</span>
                  <p className="text-green-200/90 mt-1 line-clamp-2">
                    {s.mechanics && s.mechanics[0] ? s.mechanics[0] : s.dailyRoll || 'Ежедневная борьба за выживание'}
                  </p>
                </div>
              </div>
            </div>

            {/* Советы выживания */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-green-400 mb-2 flex items-center">
                💡 Советы выживания
              </p>
              <div className="max-h-24 overflow-y-auto pr-2 scrollbar-thin">
                <ul className="text-xs space-y-1.5">
                  {s.tips && s.tips.map ? s.tips.map((t, i) => (
                    <li key={i} className="pl-3 border-l-2 border-emerald-600/50 py-0.5">
                      {t}
                    </li>
                  )) : null}
                  {(!s.tips || !s.tips.length) && (
                    <li className="text-green-200/50 italic text-center py-2">
                      Доверяй инстинктам...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Атмосфера и выбор */}
            <footer className="mt-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] text-green-300/70 leading-tight">
                  {s.vibe && s.vibe.length > 60 ? s.vibe.substring(0, 60) + '...' : s.vibe || 'Атмосфера выживания...'}
                </p>
              </div>
              <button
                onClick={() => onPick(s)}
                className="ml-3 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg hover:shadow-emerald-600/30"
              >
                Выбрать
              </button>
            </footer>

            {/* Дополнительные цели (при наведении) */}
            <div
              className="absolute inset-0 bg-gray-900/95 rounded-2xl p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <h4 className="font-bold text-green-300 mb-3">🎯 Вторичные цели</h4>
              <ul className="text-xs space-y-2">
                {s.secondary_goals && s.secondary_goals.map ? s.secondary_goals.map((goal, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span className="text-green-200/90 leading-tight">{goal}</span>
                  </li>
                )) : null}
                {(!s.secondary_goals || !s.secondary_goals.length) && (
                  <li className="text-green-200/70 text-center py-4">
                    Выжить... просто выжить...
                  </li>
                )}
              </ul>

              <div className="mt-4 pt-3 border-t border-emerald-800/30">
                <span className="text-xs font-semibold text-red-400">⚠️ Риски:</span>
                <p className="text-xs text-green-200/80 mt-1">
                  {s.provisions && s.provisions.food && s.provisions.food.risks ? s.provisions.food.risks.join(', ') : 'Критическая нехватка ресурсов'}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Легенда сложности */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-emerald-800/30">
        <h4 className="text-sm font-semibold text-green-400 mb-2">📊 Уровни сложности:</h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-green-300">Запасы на 4+ лет</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-yellow-300">Запасы на 3 года</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-red-300">Запасы на 1.5 года</span>
          </div>
        </div>
      </div>
    </section>
  );
}