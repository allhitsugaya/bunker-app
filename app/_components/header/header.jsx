function Header() {
  return (
    <header
      className="w-full text-center py-6 bg-gradient-to-b from-gray-900 via-gray-800 to-black shadow-2xl border-b border-emerald-800/50 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 w-28 h-28 bg-lime-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10">
        {/* Логотип SLB */}
        <div className="flex justify-center items-center mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl rotate-45 shadow-lg shadow-emerald-500/30 flex items-center justify-center mx-auto">
              <span className="text-gray-900 font-black text-2xl -rotate-45 tracking-tighter">BSL</span>
            </div>
            <div
              className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur-sm opacity-50 animate-pulse"></div>
          </div>
        </div>

        {/* Название игры */}
        <h1
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-lime-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] tracking-wide uppercase mb-2">
          Бункер BSL
        </h1>

        {/* Подзаголовок */}
        <h2
          className="text-lg md:text-xl font-mono text-gray-300 italic drop-shadow-[0_0_6px_rgba(0,255,100,0.4)] mb-3">
          Смогёшь спиздеть — смогёшь и выжить
        </h2>

        {/* Декоративная линия */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-emerald-400 rounded-full"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-green-400 rounded-full"></div>
        </div>

        {/* Расшифровка аббревиатуры */}
        <div className="mt-3 flex justify-center space-x-6 text-xs text-gray-400 font-mono">
          <span className="bg-gray-800/50 px-2 py-1 rounded border border-emerald-800/30">Bunker</span>
          <span className="bg-gray-800/50 px-2 py-1 rounded border border-green-800/30">Серёги</span>
          <span className="bg-gray-800/50 px-2 py-1 rounded border border-lime-800/30"> И</span>
          <span className="bg-gray-800/50 px-2 py-1 rounded border border-lime-800/30"> Леонида</span>
        </div>
      </div>

      {/* Анимированные частицы */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </header>
  );
}

export default Header;