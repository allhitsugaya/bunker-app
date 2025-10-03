// app/_components/user/RulesForGame.jsx
'use client';
import React from 'react';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-gray-900 p-4">
      <h3 className="text-lg font-bold text-green-400 mb-2">{title}</h3>
      <div className="text-sm leading-relaxed text-green-200/90 space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function RulesForGame() {
  const goBack = () => window.history.back();

  return (
    <div className="font-mono text-green-300">
      {/* Кнопка назад */}
      <div className="mb-5">
        <button
          onClick={goBack}
          className="mb-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-green-300 border border-emerald-700 rounded-lg transition-colors"
        >
          ← Вернуться назад
        </button>
      </div>

      {/* Заголовок */}
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-green-400 tracking-tight">
          Правила игры · Bunker App
        </h2>
        <p className="text-sm text-green-200/80">
          Постапокалиптическая социальная игра. Цель — выжить в бункере, убедив остальных, что
          именно ты полезен(на) группе. Данные генерируются случайно; что показывать — решаешь ты.
        </p>
      </div>

      <div className="grid gap-4">
        {/* 1. Сетап */}
        <Section title="1) Сетап партии">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Нажми <span className="text-green-400">«Войти / Создать персонажа»</span> — тебе сгенерируют
              возраст, профессию, здоровье, психику, предмет, хобби, страх, секрет, отношения, черту характера и
              способность (+ пол).
            </li>
            <li>
              Ведущий входит с ключом (<span className="text-emerald-400">ADMIN_KEY</span>). По умолчанию —{' '}
              <span className="px-1 rounded bg-emerald-700/30 border border-emerald-700/60">1234serega</span>
              (можно изменить в переменных окружения).
            </li>
            <li>
              На панели <span className="text-green-400">«Что показать другим»</span> отметь галочками характеристики,
              которые готов(а) раскрыть, и нажми <span className="text-green-400">«Открыть выбранное»</span>.
              Кнопка <span className="text-green-400">«Скрыть всё»</span> мгновенно убирает твою публичную инфу.
            </li>
          </ul>
        </Section>

        {/* 2. Роли */}
        <Section title="2) Роли и права">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-green-400">Игрок</span>: видит свои полные статы (секция «Твои характеристики») и
              публичные статы других.
            </li>
            <li>
              <span className="text-green-400">Ведущий</span>: видит всех и всё; может исключать/возвращать игроков.
            </li>
            <li>
              Исключённый игрок остаётся в списке, но помечается как{' '}
              <span className="text-red-400">[ИСКЛЮЧЁН]</span> и не участвует в обсуждениях/голосованиях текущего
              раунда.
            </li>
          </ul>
        </Section>

        {/* 3. Ход игры */}
        <Section title="3) Ход игры (базовая структура раунда)">
          <ol className="list-decimal pl-5 space-y-1">
            <li><span className="text-green-400">Вступление сценария</span>: ведущий объявляет обстановку и условия (см.
              карточки сценариев внизу страницы).
            </li>
            <li><span className="text-green-400">Первичное раскрытие</span>: каждый игрок открывает 1–2 характеристики
              по желанию.
            </li>
            <li><span className="text-green-400">Обсуждение</span>: 3–5 минут аргументов, сделок, блефа, рофлов — всё по
              канону «бункера».
            </li>
            <li><span className="text-green-400">Доп. эвенты</span>: ведущий может зачитать событие сценария (броски,
              заражения и т.д.).
            </li>
            <li><span className="text-green-400">Голосование</span>: группа выбирает одного на исключение. Ведущий
              фиксит кнопкой «Исключить».
            </li>
            <li><span className="text-green-400">Новый раунд</span>: при необходимости разрешено ещё одно частичное
              раскрытие.
            </li>
          </ol>
        </Section>

        {/* 4. Раскрытие */}
        <Section title="4) Раскрытие характеристик">
          <ul className="list-disc pl-5 space-y-1">
            <li>Раскрытие — добровольное. Отметил(а) чекбоксы → «Открыть выбранное».</li>
            <li>Можно раскрывать частями: сначала профессию, потом предмет и т.д.</li>
            <li>Если передумал(а) — «Скрыть всё». История не хранится, действует текущее состояние.</li>
            <li>В таблице сверху видно, какие колонки вообще уже появились у кого-то.</li>
          </ul>
        </Section>

        {/* 5. Исключения и победа */}
        <Section title="5) Исключения и условия победы">
          <ul className="list-disc pl-5 space-y-1">
            <li>Исключение делает ведущий по итогам общего голосования.</li>
            <li>
              Победа и поражение описаны в каждом сценарии (например, «продержаться 1 год, не заразившись» или
              «сохранить запасы»). Ведущий отслеживает выполнение условий.
            </li>
            <li>Разрешены кастомные правила группы (сообщайте заранее).</li>
          </ul>
        </Section>

        {/* 6. Техподсказки */}
        <Section title="6) Технические подсказки">
          <ul className="list-disc pl-5 space-y-1">
            <li>Кнопка <span className="text-green-400">«Пересоздать персонажа»</span> полностью заменяет твои скрытые
              статы и сбрасывает публичные.
            </li>
            <li>Если потерялся <code className="px-1 bg-gray-800/80 rounded">playerId</code> (новый деплой и т.п.) —
              просто заново «Войти / Создать персонажа».
            </li>
            <li>Ведущий: ввод ключа в правом верхнем углу, затем появляется панель управления на карточках игроков.</li>
          </ul>
        </Section>

        {/* 7. Этичность */}
        <Section title="7) Контент и этика за столом">
          <ul className="list-disc pl-5 space-y-1">
            <li>Держим чёрный юмор в рамках: без прямых оскорблений игроков, харассмента и личных выпадов.</li>
            <li>Все спорные темы согласовывайте с группой заранее (X-card правило — можно сказать «скип», и группа
              переключается).
            </li>
            <li>Главная цель — веселье и ролеплей, а не триггеры. Игрок &gt; персонаж.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
