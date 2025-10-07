// app/components/ScenariosGrid.js
'use client';
import { useState } from 'react';
import { scenarios } from '@/app/_data/data';

// Добавляем новый сценарий с бункером на колесах
const mobileBunkerScenario = {
  id: 'mobile-bunker',
  title: '🚌 БРОНЕАВТОБУС "НОМАД"',
  short: 'Мобильный бункер на колёсах в мире радиоактивных пустошей',
  hazard: 'РАДИОАКТИВНЫЕ БУРИ, МУТАНТЫ-СКАВЕНГЕРЫ, КОРРОЗИЯ ТЕХНИКИ. Ежедневные рейды за деталями под прицелом враждующих кланов.',
  infection: 'РАДИАЦИОННОЕ ЗАРАЖЕНИЕ, МУТАЦИИ. Уровень радиации определяет шанс мутации. Фильтры требуют регулярной замены.',
  primary_goal: 'ПОДДЕРЖИВАТЬ БРОНЕАВТОБУС В РАБОЧЕМ СОСТОЯНИИ И ПУТЕШЕСТВОВАТЬ К "ЧИСТОЙ ЗОНЕ"',
  mechanics: [
    'ЕЖЕДНЕВНЫЙ ПРОГРЕСС: 1 единица топлива = 50 км пути',
    'РЕЙДЫ ЗА РЕСУРСАМИ: Каждый игрок может отправиться на поиски',
    'СИСТЕМА ПОЛОМОК: Шанс поломки увеличивается с пробегом'
  ],
  dailyRoll: 'Бросок на удачу рейда (1d6): 1-2 - неудача, 3-4 - базовые ресурсы, 5-6 - редкие компоненты',
  vibe: 'РЁВ ДВИГАТЕЛЯ СКВОЗЬ РАДИОПОМЕХИ, СКРИП КОРПУСА НА УХАБАХ, ЗАПАХ СМАЗОЧНЫХ МАТЕРИАЛОВ И СТРАХ ОСТАНОВКИ В СРЕДИ ПУСТОШИ.',
  provisions: {
    food: {
      type: 'КОНСЕРВЫ, СУБПРОДУКТЫ',
      quantity: '2 ГОДА (при экономном расходе)',
      risks: ['ПОРЧА ПРИ ПЕРЕГРЕВЕ', 'КРАЖИ ВО ВРЕМЯ ОСТАНОВОК']
    },
    medical: {
      supplies: ['АНТИРАДИАЦИОННЫЕ ПРЕПАРАТЫ', 'ПЕРЕВЯЗОЧНЫЕ СРЕДСТВА', 'СТИМУЛЯТОРЫ']
    },
    vehicle: {
      fuel: '600 Л (15 полных баков)',
      condition: '85% (требует регулярного ТО)',
      upgrades: ['БРОНИРОВАННЫЙ КУЗОВ', 'СИСТЕМА ФИЛЬТРАЦИИ ВОЗДУХА', 'СОЛНЕЧНЫЕ ПАНЕЛИ']
    }
  },
  tips: [
    'НИКОГДА НЕ ОСТАНАВЛИВАЙТЕСЬ НА НОЧЬ В ОТКРЫТОМ ПОЛЕ',
    'РАСПРЕДЕЛЯЙТЕ РОЛИ: ВОДИТЕЛЬ, МЕХАНИК, СКАВЕНГЕР, ОХРАНА',
    'ПРИ ВСТРЕЧЕ С КЛАНОМ ПРЕДЛОЖИТЕ ОБМЕН, А НЕ КОНФЛИКТ',
    'СЛЕДИТЕ ЗА УРОВНЕМ РАДИАЦИИ В РАЙОНЕ ОСТАНОВКИ',
    'СОХРАНЯЙТЕ АВАРИЙНЫЙ ЗАПАС ТОПЛИВА НА ЧЕРНЫЙ ДЕНЬ'
  ],
  secondary_goals: [
    'НАЙТИ ЧЕРТЕЖИ УЛУЧШЕНИЙ ДЛЯ БРОНЕАВТОБУСА',
    'СОБРАТЬ КОМПОНЕНТЫ ДЛЯ РАДИОСТАНЦИИ',
    'СОЗДАТЬ КАРТУ БЕЗОПАСНЫХ МАРШРУТОВ',
    'НАЙТИ СОЮЗНИКОВ СРЕДИ ВЫЖИВШИХ',
    'ОБЕСПЕЧИТЬ САМОДОСТАТОЧНОСТЬ ЭНЕРГИЕЙ'
  ],
  win: 'ДОСТИЧЬ ЛЕГЕНДАРНОЙ "ЧИСТОЙ ЗОНЫ" И ОСНОВАТЬ НОВОЕ ПОСЕЛЕНИЕ',
  difficulty: 'extreme'
};

export default function ScenariosGrid({ onPick }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showMobileTips, setShowMobileTips] = useState(false);

  // Объединяем сценарии
  const allScenarios = [...scenarios, mobileBunkerScenario];

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    onPick?.(scenario);
  };

  const getDifficultyInfo = (scenario) => {
    if (scenario.difficulty === 'extreme') {
      return { label: '☢️ ЭКСТРИМ', color: 'bg-red-500/90', text: 'text-red-300' };
    }

    const foodQty = scenario.provisions?.food?.quantity;
    if (foodQty?.includes('1.5')) {
      return { label: '🔥 СЛОЖНО', color: 'bg-red-500/90', text: 'text-red-300' };
    } else if (foodQty?.includes('3')) {
      return { label: '⚠️ СРЕДНЕ', color: 'bg-yellow-500/90', text: 'text-yellow-300' };
    }
    return { label: '🎯 ВЫЖИВАНИЕ', color: 'bg-green-500/90', text: 'text-green-300' };
  };

  return (
    <section className="mt-6">
      {/* Мобильные подсказки */}
      {showMobileTips && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-emerald-600 rounded-2xl p-6 max-w-md">
            <h3 className="text-green-400 font-bold text-lg mb-3">📱 Управление на мобильных</h3>
            <ul className="text-green-200 text-sm space-y-2">
              <li>• <span className="text-emerald-400">Касание</span> - просмотр карточки</li>
              <li>• <span className="text-emerald-400">Свайп вниз</span> - прокрутка списка</li>
              <li>• <span className="text-emerald-400">Долгое нажатие</span> - быстрый просмотр</li>
            </ul>
            <button
              onClick={() => setShowMobileTips(false)}
              className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-green-400">📜 СЦЕНАРИИ В ПОСТ-АПОКАЛИПСИСЕ</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMobileTips(true)}
            className="sm:hidden px-3 py-1 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 text-sm"
          >
            📱 Подсказки
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {allScenarios.map(scenario => {
          const difficulty = getDifficultyInfo(scenario);
          const isMobileBunker = scenario.id === 'mobile-bunker';

          return (
            <article
              key={scenario.id}
              className="group relative rounded-2xl border-2 border-emerald-800/60 bg-gray-900/90 p-4 md:p-5 shadow-lg hover:shadow-emerald-800/30 transition-all duration-300 hover:border-emerald-600 hover:scale-[1.02] active:scale-95 touch-manipulation"
              onClick={() => handleScenarioSelect(scenario)}
            >
              {/* Индикатор сложности */}
              <div
                className={`absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full ${difficulty.color} text-white font-bold z-10`}>
                {difficulty.label}
              </div>

              {/* Особый бейдж для мобильного бункера */}
              {isMobileBunker && (
                <div
                  className="absolute -top-2 -left-2 px-2 py-1 text-xs rounded-full bg-purple-500/90 text-white font-bold z-10">
                  🚌 МОБИЛЬНЫЙ
                </div>
              )}

              <header className="mb-3">
                <h3
                  className="text-lg font-bold text-green-300 group-hover:text-green-200 transition-colors leading-tight">
                  {scenario.title}
                </h3>
                <p className="text-sm text-green-200/80 mt-2 leading-relaxed">
                  {scenario.short}
                </p>
              </header>

              {/* Система провизии - адаптивная */}
              <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-emerald-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-green-400">
                    {isMobileBunker ? '🚌 ТЕХНИКА И РЕСУРСЫ' : '🎒 ПРОВИЗИЯ'}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${difficulty.text} ${difficulty.color.replace('/90', '/20')}`}>
                    {scenario.provisions?.food?.quantity || 'НЕИЗВЕСТНО'}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  {isMobileBunker ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Топливо:</span>
                        <span className="font-medium text-orange-300">
                          {scenario.provisions?.vehicle?.fuel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Состояние:</span>
                        <span className="font-medium text-blue-300">
                          {scenario.provisions?.vehicle?.condition}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Апгрейды:</span>
                        <span className="font-medium text-green-300">
                          {scenario.provisions?.vehicle?.upgrades?.length || 0} шт
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Еда:</span>
                        <span className="font-medium">
                          {scenario.provisions?.food?.type || 'Не указано'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Медицина:</span>
                        <span className="font-medium">
                          {scenario.provisions?.medical?.supplies?.length || 0} видов
                        </span>
                      </div>
                    </>
                  )}

                  <div className="text-[10px] opacity-60 mt-1 border-t border-emerald-800/30 pt-1">
                    Риск: {scenario.provisions?.food?.risks?.[0] || 'нехватка ресурсов'}
                  </div>
                </div>
              </div>

              {/* Основная информация - адаптивная */}
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-red-400 font-semibold text-xs">☠️ ОПАСНОСТЬ:</span>
                  <p className="text-green-200/90 text-xs mt-1 leading-relaxed line-clamp-2">
                    {scenario.hazard}
                  </p>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <span className="text-green-400 font-semibold text-xs">🎯 ЦЕЛЬ:</span>
                    <p className="text-green-200/90 text-xs mt-1 line-clamp-3">
                      {scenario.primary_goal || scenario.win}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-400 font-semibold text-xs">⚙️ МЕХАНИКА:</span>
                    <p className="text-green-200/90 text-xs mt-1 line-clamp-3">
                      {scenario.mechanics?.[0] || scenario.dailyRoll || 'Ежедневная борьба'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Советы выживания */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-green-400 mb-2 flex items-center">
                  💡 СОВЕТЫ ВЫЖИВАНИЯ
                </p>
                <div className="max-h-20 overflow-y-auto pr-2 scrollbar-thin">
                  <ul className="text-xs space-y-1.5">
                    {scenario.tips?.map((t, i) => (
                      <li key={i} className="pl-3 border-l-2 border-emerald-600/50 py-0.5">
                        {t}
                      </li>
                    )) || (
                      <li className="text-green-200/50 italic text-center py-2">
                        Доверяй инстинктам...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Футер с атмосферой */}
              <footer className="mt-4 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-green-300/70 leading-tight line-clamp-2">
                    {scenario.vibe?.substring(0, 80) || 'Атмосфера постапокалиптического выживания...'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScenarioSelect(scenario);
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95 whitespace-nowrap"
                >
                  ВЫБРАТЬ
                </button>
              </footer>

              {/* Детали при наведении/тапе */}
              <div
                className="absolute inset-0 bg-gray-900/95 rounded-2xl p-4 md:p-5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none z-20 overflow-y-auto">
                <h4 className="font-bold text-green-300 mb-3 text-sm">🎯 ВТОРИЧНЫЕ ЦЕЛИ</h4>
                <ul className="text-xs space-y-2 mb-4">
                  {scenario.secondary_goals?.map((goal, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-400 mr-2 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-green-200/90 leading-tight">{goal}</span>
                    </li>
                  )) || (
                    <li className="text-green-200/70 text-center py-4">
                      Выжить... просто выжить...
                    </li>
                  )}
                </ul>

                {isMobileBunker && (
                  <div className="mb-3 p-2 rounded bg-purple-900/20 border border-purple-700/30">
                    <span className="text-xs font-semibold text-purple-400">🚌 ОСОБЫЕ УСЛОВИЯ:</span>
                    <p className="text-xs text-green-200/80 mt-1">
                      Мобильность = безопасность. Остановка более 6 часов увеличивает риск нападения на 40%.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-emerald-800/30">
                  <span className="text-xs font-semibold text-red-400">⚠️ КРИТИЧЕСКИЕ РИСКИ:</span>
                  <p className="text-xs text-green-200/80 mt-1">
                    {scenario.provisions?.food?.risks?.join(', ') || 'Критическая нехватка ресурсов'}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Легенда сложности - адаптивная */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-emerald-800/30">
        <h4 className="text-sm font-semibold text-green-400 mb-3">📊 УРОВНИ СЛОЖНОСТИ В ПОСТ-АПОКАЛИПСИСЕ:</h4>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center p-2 rounded bg-green-500/10 border border-green-500/20">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
            <span className="text-green-300">Запасы на 4+ лет</span>
          </div>
          <div className="flex items-center p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 flex-shrink-0"></div>
            <span className="text-yellow-300">Запасы на 3 года</span>
          </div>
          <div className="flex items-center p-2 rounded bg-red-500/10 border border-red-500/20">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
            <span className="text-red-300">Запасы на 1.5 года</span>
          </div>
          <div className="flex items-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2 flex-shrink-0"></div>
            <span className="text-purple-300">Мобильный бункер</span>
          </div>
        </div>

        {/* Мобильная статистика */}
        <div className="mt-4 pt-3 border-t border-emerald-800/30">
          <div className="flex justify-between items-center text-xs text-green-200/60">
            <span>Всего сценариев: {allScenarios.length}</span>
            <span>Активный: {selectedScenario?.title || 'не выбран'}</span>
          </div>
        </div>
      </div>

      {/* Мобильный баннер */}
      <div
        className="lg:hidden mt-4 p-3 rounded-lg bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-700/40">
        <p className="text-xs text-green-300 text-center">
          📱 <span className="font-semibold">Касайтесь карточек</span> для просмотра деталей сценария
        </p>
      </div>
    </section>
  );
}