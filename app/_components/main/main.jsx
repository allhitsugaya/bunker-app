// app/_components/Main.jsx
import Link from 'next/link';

export default function Main() {
  return (
    <main className="min-h-screen bg-gray-950 text-green-300 font-mono">
      {/* Фоновые акценты */}
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-600 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-green-500 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 md:pt-28">

        {/* Карточка с кнопками */}
        <div
          className="mt-10 w-full rounded-2xl border border-emerald-800/40 bg-gray-900/80 p-6 shadow-[0_0_40px_-20px_rgba(16,185,129,0.5)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Кнопка: Начать игру */}
            <Link
              href="/game"
              className="group inline-flex items-center justify-center rounded-xl border border-emerald-700/60 bg-emerald-700/20 px-6 py-4 text-lg font-bold text-green-300 transition
                         hover:bg-emerald-600/25 hover:text-green-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]
                         focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <span className="mr-2 transition-transform group-hover:-translate-y-0.5">▶</span>
              Начать игру
            </Link>

            {/* Кнопка: Правила */}
            <Link
              href="/rules"
              className="group inline-flex items-center justify-center rounded-xl border border-emerald-700/60 bg-gray-800/60 px-6 py-4 text-lg font-bold text-green-300 transition
                         hover:bg-gray-700/60 hover:text-green-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]
                         focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <span className="mr-2 transition-transform group-hover:-translate-y-0.5">❖</span>
              Правила игры
            </Link>
          </div>

          {/* Нижний текст / подсказки */}
          <div className="mt-6 grid gap-3 text-xs text-green-200/70 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-800/30 bg-gray-900/60 p-3">
              <div className="font-semibold text-green-300 mb-1">Как начать?</div>
              Нажми «Начать игру», создай персонажа и выбери, что раскрывать группе.
            </div>
            <div className="rounded-lg border border-emerald-800/30 bg-gray-900/60 p-3">
              <div className="font-semibold text-green-300 mb-1">Ведущий</div>
              Вводит ключ на странице игры, чтобы видеть всех и управлять исключениями.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
