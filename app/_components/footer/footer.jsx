function Footer() {
  return (
    <footer
      className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-emerald-500/30 shadow-[0_-4px_25px_rgba(34,197,94,0.3)] relative overflow-hidden">
      {/* Декоративные элементы */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent"></div>

      {/* Анимированные линии */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

          {/* Логотип и основная надпись */}
          <div className="flex items-center gap-4">
            {/* Лого BSL */}
            <div className="relative">
              <div
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/50">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">BSL</span>
              </div>
              <div
                className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-3xl opacity-20 blur-sm animate-pulse"></div>
            </div>

            <div className="text-left">
              <h1
                className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-lime-300 to-emerald-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] uppercase tracking-tight">
                Бункер у Серёги и Леонида
              </h1>
              <h2
                className="mt-1 text-sm md:text-base font-mono text-gray-300 italic drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]">
                Навык <span className="text-green-400 font-bold animate-pulse">"ПИЗДЁШЬ"</span>: уровень <span
                className="text-lime-300">ПОВЫШЕН!</span>
              </h2>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="flex flex-col items-center lg:items-end gap-2">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                Онлайн
              </span>
              <span className="text-emerald-400 font-mono">v2.0</span>
            </div>

            {/* Декоративный разделитель */}
            <div
              className="hidden lg:block w-20 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></div>

            <div className="text-xs text-gray-500 font-mono">
              © 2025 Bunker Survival League
            </div>
          </div>
        </div>

        {/* Нижняя декоративная полоса */}
        <div className="mt-6 pt-4 border-t border-emerald-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                🎮 Игровой режим: <span className="text-green-400">АКТИВЕН</span>
              </span>
              <span className="hidden sm:block">|</span>
              <span className="flex items-center gap-1">
                ⚡ Статус: <span className="text-lime-300">ОПЕРАТИВНЫЙ</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span>BSL Gaming Network</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
    </footer>
  );
}

export default Footer;