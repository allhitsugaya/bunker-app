function Footer() {
  return (
    <footer
      className="w-full text-center py-6 bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-gray-700 shadow-[0_-4px_20px_rgba(34,197,94,0.2)]">
      <h1
        className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-lime-300 to-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] uppercase tracking-wider">
        Бункер у Леонида и Серёги
      </h1>
      <h2
        className="mt-2 text-base md:text-lg font-mono text-gray-300 italic drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]">
        Навык <span className="text-green-400">"ПИЗДЁШЬ"</span>: уровень повышен!
      </h2>

      <div className="mt-3 flex justify-center">
        <div
          className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full animate-pulse"></div>
      </div>
    </footer>
  );
}

export default Footer;
