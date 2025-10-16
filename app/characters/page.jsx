// app/characters/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function CharactersPage() {
  const goBack = () => window.history.back();
  const [character, setCharacter] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Базы данных для генерации
  const professions = [
    '👨‍⚕️ Врач', '👨‍🔧 Инженер', '👨‍🔬 Ученый', '👮 Охранник', '👨‍🌾 Фермер',
    '👨‍🏫 Учитель', '👨‍💼 Бизнесмен', '👨‍🎨 Художник', '👨‍✈️ Пилот', '🔧 Техник'
  ];

  const healthStatuses = [
    '💪 Здоров', '😐 Ослаблен', '🤒 Болен', '🩺 Хроническое заболевание', '🧬 Устойчивый иммунитет'
  ];

  const psychologies = [
    '😊 Стабильный', '😰 Тревожный', '😠 Агрессивный', '🤔 Рациональный', '🎭 Харизматичный'
  ];

  const hobbies = [
    '📚 Чтение', '🎵 Музыка', '🎨 Рисование', '⚽ Спорт', '🧩 Головоломки',
    '🌿 Садоводство', '🎮 Игры', '🍳 Кулинария', '📸 Фотография', '🚴 Велоспорт'
  ];

  const fears = [
    '😨 Высота', '👻 Темнота', '🕷️ Пауки', '💀 Смерть', '🏚️ Одиночество',
    '🔥 Пожар', '💧 Вода', '☢️ Радиация', '🤢 Болезни', '🎭 Социофобия'
  ];

  const traits = [
    '💡 Изобретательный', '🛡️ Надежный', '🎯 Целеустремленный', '🤝 Командный игрок',
    '🔍 Внимательный', '⚡ Энергичный', '🧠 Мудрый', '🎲 Авантюрный'
  ];

  const abilities = [
    '🩺 Медицина', '🔧 Инженерия', '🧪 Химия', '🌱 Ботаника', '🔌 Электроника',
    '🗣️ Переговоры', '🎯 Стрельба', '🏃 Выносливость', '🧠 Аналитика'
  ];

  const generateCharacter = () => {
    setIsGenerating(true);

    // Имитация загрузки
    setTimeout(() => {
      const newCharacter = {
        name: generateName(),
        age: Math.floor(Math.random() * 40) + 20,
        profession: professions[Math.floor(Math.random() * professions.length)],
        health: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
        psychology: psychologies[Math.floor(Math.random() * psychologies.length)],
        hobby: hobbies[Math.floor(Math.random() * hobbies.length)],
        fear: fears[Math.floor(Math.random() * fears.length)],
        trait: traits[Math.floor(Math.random() * traits.length)],
        ability: abilities[Math.floor(Math.random() * abilities.length)],
        secret: generateSecret(),
        item: generateItem(),
        relationship: generateRelationship()
      };

      setCharacter(newCharacter);
      setIsGenerating(false);
    }, 1500);
  };

  const generateName = () => {
    const names = ['Алексей', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Анна', 'Иван', 'Ольга', 'Михаил', 'Наталья'];
    const surnames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Попов', 'Васильев', 'Смирнов', 'Фёдоров', 'Морозов', 'Волков'];
    return `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
  };

  const generateSecret = () => {
    const secrets = [
      'Бывший военный', 'Ученый-биолог', 'Бывший заключенный', 'Экс-политик',
      'Обладает редким знанием', 'Имеет доступ к закрытой информации', 'Родственник важной персоны'
    ];
    return secrets[Math.floor(Math.random() * secrets.length)];
  };

  const generateItem = () => {
    const items = [
      '💊 Аптечка', '🔦 Фонарь', '🗺️ Карта', '📻 Рация', '🔪 Нож', '📚 Книга',
      '🧪 Реактивы', '🔧 Инструменты', '🍞 Еда', '💧 Вода', '🔋 Батареи'
    ];
    return items[Math.floor(Math.random() * items.length)];
  };

  const generateRelationship = () => {
    const relationships = [
      '👨‍👩‍👧‍👦 Семьянин', '💑 В отношениях', '🙅 Одиночка', '🤝 Командный игрок',
      '👑 Лидер', '🎯 Индивидуалист', '🤗 Дружелюбный'
    ];
    return relationships[Math.floor(Math.random() * relationships.length)];
  };

  useEffect(() => {
    generateCharacter();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-green-300 font-mono">
      {/* Декоративные элементы */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <button
          onClick={goBack}
          className="group flex items-center gap-2 px-4 py-3 mb-8 bg-gray-800/80 hover:bg-gray-700/80 text-green-300 border border-emerald-700/50 hover:border-emerald-500 rounded-xl transition-all duration-300 backdrop-blur-lg"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
          <span>Вернуться назад</span>
        </button>

        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-3xl blur-xl"></div>
          <div
            className="relative text-center p-8 rounded-3xl border border-emerald-500/20 bg-gray-900/80 backdrop-blur-lg">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span
                className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                👥 Персонажи
              </span>
            </h1>
            <p className="text-xl text-green-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Генератор случайных персонажей для игры в Бункер.
              Каждый персонаж уникален и обладает своими сильными и слабыми сторонами.
            </p>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Карточка персонажа */}
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-lg"></div>
            <div
              className="relative p-8 rounded-3xl border border-emerald-500/30 bg-gray-900/80 backdrop-blur-lg h-full">
              <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
                🎭 Текущий персонаж
              </h2>

              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-green-200/60">Генерируем уникального персонажа...</p>
                </div>
              ) : character ? (
                <div className="space-y-6">
                  {/* Основная информация */}
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">👤</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{character.name}</h3>
                    <p className="text-green-200/60">Возраст: {character.age} лет</p>
                  </div>

                  {/* Характеристики */}
                  <div className="grid gap-4">
                    <CharacterStat
                      icon="💼"
                      label="Профессия"
                      value={character.profession}
                      color="emerald"
                    />
                    <CharacterStat
                      icon="❤️"
                      label="Здоровье"
                      value={character.health}
                      color="red"
                    />
                    <CharacterStat
                      icon="🧠"
                      label="Психика"
                      value={character.psychology}
                      color="purple"
                    />
                    <CharacterStat
                      icon="🎯"
                      label="Черта характера"
                      value={character.trait}
                      color="cyan"
                    />
                    <CharacterStat
                      icon="🌟"
                      label="Способность"
                      value={character.ability}
                      color="yellow"
                    />
                    <CharacterStat
                      icon="🎨"
                      label="Хобби"
                      value={character.hobby}
                      color="blue"
                    />
                    <CharacterStat
                      icon="😨"
                      label="Страх"
                      value={character.fear}
                      color="orange"
                    />
                    <CharacterStat
                      icon="🤫"
                      label="Секрет"
                      value={character.secret}
                      color="gray"
                    />
                    <CharacterStat
                      icon="🎒"
                      label="Личный предмет"
                      value={character.item}
                      color="green"
                    />
                    <CharacterStat
                      icon="👥"
                      label="Отношения"
                      value={character.relationship}
                      color="pink"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Управление и информация */}
          <div className="space-y-6">
            {/* Кнопка генерации */}
            <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gray-900/80 backdrop-blur-lg">
              <button
                onClick={generateCharacter}
                disabled={isGenerating}
                className="w-full group bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 font-bold px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 disabled:scale-100 disabled:shadow-none"
              >
                <span className="flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      <span>Генерация...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg transition-transform group-hover:rotate-180">🎲</span>
                      <span>Сгенерировать нового персонажа</span>
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Статистика генерации */}
            <div className="p-6 rounded-3xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-lg">
              <h3 className="text-xl font-bold text-green-400 mb-4">📊 О генераторе</h3>
              <div className="space-y-3 text-sm text-green-200/80">
                <div className="flex justify-between">
                  <span>Профессий:</span>
                  <span className="text-emerald-400">{professions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Состояний здоровья:</span>
                  <span className="text-red-400">{healthStatuses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Типов психики:</span>
                  <span className="text-purple-400">{psychologies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Уникальных черт:</span>
                  <span className="text-cyan-400">{traits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Способностей:</span>
                  <span className="text-yellow-400">{abilities.length}</span>
                </div>
              </div>
            </div>

            {/* Советы */}
            <div className="p-6 rounded-3xl border border-orange-500/30 bg-gray-900/80 backdrop-blur-lg">
              <h3 className="text-xl font-bold text-green-400 mb-4">💡 Советы</h3>
              <ul className="space-y-2 text-sm text-green-200/80">
                <li>• Сочетание характеристик создает уникальную личность</li>
                <li>• Учитывайте сильные и слабые стороны персонажа</li>
                <li>• Секрет может стать ключевым элементом ролевой игры</li>
                <li>• Личный предмет может помочь в критической ситуации</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="text-center">
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-lg"></div>
            <div className="relative p-8 rounded-3xl border border-emerald-500/30 bg-gray-900/80 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                Готовы к игре?
              </h3>
              <p className="text-green-200/80 mb-6 text-lg">
                Используйте сгенерированного персонажа для своей следующей игровой сессии
              </p>
              <button
                className="group bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                <span className="flex items-center gap-2">
                  <span className="text-lg transition-transform group-hover:scale-110">🎮</span>
                  <span>Начать игру с этим персонажем</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения характеристики
function CharacterStat({ icon, label, value, color = 'emerald' }) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    gray: 'text-gray-400',
    green: 'text-green-400',
    pink: 'text-pink-400'
  };

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm text-green-200/60">{label}</div>
        <div className={`font-semibold ${colorClasses[color]}`}>{value}</div>
      </div>
    </div>
  );
}