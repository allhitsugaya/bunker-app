function Header() {
  return (
    <header
      className="w-full text-center py-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black shadow-xl border-b border-gray-700">
      <h1
        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] tracking-widest uppercase">
        Бункер у Леонида и Серёги
      </h1>
      <h2 className="mt-4 text-lg md:text-xl font-mono text-gray-300 italic drop-shadow-[0_0_4px_rgba(0,255,100,0.5)]">
        Смогёшь спиздеть — смогёшь и выжить
      </h2>
      <div className="mt-4 flex justify-center">
        <div
          className="w-24 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full animate-pulse"></div>
      </div>
    </header>
  );
}

export default Header;
