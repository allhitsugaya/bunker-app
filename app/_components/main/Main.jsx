import Link from 'next/link';

export default function Main() {
  return (
    <main className="min-h-screen bg-gray-900 text-white relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 pb-20">

        <div className="text-center mb-12">
          <h1
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            БУНКЕР
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Социальная игра о выживании, где каждый решает,
            <span className="text-emerald-300"> кто достоин спастись</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-800/30">
            <div className="text-2xl font-bold text-emerald-400">6-12</div>
            <div className="text-sm text-gray-400">игроков</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-800/30">
            <div className="text-2xl font-bold text-emerald-400">15-30</div>
            <div className="text-sm text-gray-400">минут</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-800/30">
            <div className="text-2xl font-bold text-emerald-400">50+</div>
            <div className="text-sm text-gray-400">персонажей</div>
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-6">
          <Link
            href="/game"
            className="group block w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500
                       text-white text-xl font-bold py-5 px-8 rounded-2xl text-center transition-all duration-300
                       transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25
                       border border-emerald-400/30 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center">
              🚀 НАЧАТЬ НОВУЮ ИГРУ
            </span>
          </Link>

          <Link
            href="/join"
            className="group block w-full bg-gray-800/80 hover:bg-gray-700/80
                       text-green-300 text-lg font-bold py-4 px-8 rounded-xl text-center transition-all duration-300
                       transform hover:scale-102 hover:shadow-lg hover:shadow-green-500/10
                       border border-green-700/40 backdrop-blur-sm"
          >
            <span className="flex items-center justify-center">
              🔗 ПРИСОЕДИНИТЬСЯ К ИГРЕ
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
          <Link
            href="/rules"
            className="group bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 text-center transition-all duration-300
                       border border-gray-600/30 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="text-2xl mb-2">📖</div>
            <div className="font-semibold text-green-300">Правила</div>
            <div className="text-xs text-gray-400 mt-1">Как играть</div>
          </Link>

          <Link
            href="/characters"
            className="group bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 text-center transition-all duration-300
                       border border-gray-600/30 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold text-green-300">Персонажи</div>
            <div className="text-xs text-gray-400 mt-1">Архетипы и роли</div>
          </Link>

          <Link
            href="/scenarios"
            className="group bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 text-center transition-all duration-300
                       border border-gray-600/30 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="text-2xl mb-2">🎭</div>
            <div className="font-semibold text-green-300">Сценарии</div>
            <div className="text-xs text-gray-400 mt-1">Разные концовки</div>
          </Link>
        </div>


        <div className="mt-12 w-full max-w-2xl bg-gray-800/30 rounded-2xl p-6 border border-emerald-800/20">
          <h3 className="text-lg font-bold text-emerald-300 mb-3 text-center">
            🎮 Быстрый старт для ведущего
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-green-200">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Создайте комнату игры
              </div>
              <div className="flex items-center text-green-200">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Пригласите игроков по коду
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-green-200">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Настройте параметры бункера
              </div>
              <div className="flex items-center text-green-200">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Запустите обсуждение
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}