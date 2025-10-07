// app/_components/games/FuelGuessGame.jsx
'use client';
import { useEffect, useState } from 'react';

export default function FuelGuessGame({ isActive = false, onFuelEarned, onClose }) {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'result'
  const [difficulty, setDifficulty] = useState('medium');
  const [targetNumber, setTargetNumber] = useState('');
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);
  const [playerGuess, setPlayerGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [hint, setHint] = useState('');
  const [gameLog, setGameLog] = useState([]);

  const difficulties = {
    easy: {
      name: '🎯 ЛЕГКО',
      attempts: 8,
      fuelReward: 10,
      description: 'Больше попыток, меньше топлива'
    },
    medium: {
      name: '⚠️ СРЕДНЕ',
      attempts: 5,
      fuelReward: 25,
      description: 'Сбалансированная сложность'
    },
    hard: {
      name: '🔥 СЛОЖНО',
      attempts: 3,
      fuelReward: 50,
      description: 'Мало попыток, много топлива'
    }
  };

  useEffect(() => {
    if (!isActive) {
      resetGame();
    }
  }, [isActive]);

  const startGame = () => {
    const target = parseInt(targetNumber);
    const min = parseInt(minRange);
    const max = parseInt(maxRange);

    if (isNaN(target) || isNaN(min) || isNaN(max)) {
      setHint('❌ Введите корректные числа');
      return;
    }

    if (target < min || target > max) {
      setHint(`❌ Число должно быть в диапазоне ${min}-${max}`);
      return;
    }

    if (min >= max) {
      setHint('❌ Минимальное значение должно быть меньше максимального');
      return;
    }

    const diff = difficulties[difficulty];
    setMaxAttempts(diff.attempts);
    setAttempts(0);
    setPlayerGuess('');
    setHint('');
    setGameLog([]);
    setGameState('playing');

    addToLog(`🎮 Ведущий загадал число от ${min} до ${max}`);
    addToLog(`⚡ Сложность: ${diff.name} (${diff.attempts} попыток)`);
    addToLog(`⛽ Награда: ${diff.fuelReward}л топлива`);
  };

  const makeGuess = () => {
    const guess = parseInt(playerGuess);
    const min = parseInt(minRange);
    const max = parseInt(maxRange);

    if (isNaN(guess) || guess < min || guess > max) {
      setHint(`❌ Введите число от ${min} до ${max}`);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === parseInt(targetNumber)) {
      // Победа! (очень маловероятно)
      const fuelEarned = difficulties[difficulty].fuelReward;
      addToLog(`🎉 НЕВЕРОЯТНО! УГАДАЛ ЧИСЛО ${targetNumber}!`);
      addToLog(`⛽ ВЫИГРЫШ: +${fuelEarned}л топлива`);
      setGameState('result');
      onFuelEarned?.(fuelEarned, true);
    } else if (newAttempts >= maxAttempts) {
      // Проигрыш (очень вероятно)
      addToLog(`💥 Попытки закончились! Число было: ${targetNumber}`);
      addToLog(`😔 Топливо не получено`);
      setGameState('result');
      onFuelEarned?.(0, false);
    } else {
      // Подсказка
      const direction = guess < parseInt(targetNumber) ? 'БОЛЬШЕ' : 'МЕНЬШЕ';
      const remaining = maxAttempts - newAttempts;
      setHint(`📊 ${direction} | Осталось попыток: ${remaining}`);
      addToLog(`🎯 ${guess} → ${direction} (${remaining} попыток)`);
    }

    setPlayerGuess('');
  };

  const addToLog = (message) => {
    setGameLog(prev => [...prev, message]);
  };

  const resetGame = () => {
    setGameState('setup');
    setTargetNumber('');
    setPlayerGuess('');
    setAttempts(0);
    setMaxAttempts(5);
    setHint('');
    setGameLog([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (gameState === 'setup') {
        startGame();
      } else if (gameState === 'playing') {
        makeGuess();
      }
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-500/20 max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 p-4 border-b border-emerald-500/30">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-300 flex items-center gap-2">
              ⛽ РУЛЕТКА ТОПЛИВА
            </h2>
            <button
              onClick={onClose}
              className="text-green-300 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-center text-green-200/70 text-sm mt-2">
            Панель управления мини-игрой для ведущего
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Настройка игры */}
          {gameState === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400 text-center">
                Настройка мини-игры
              </h3>

              {/* Загаданное число */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-300">
                  Загаданное число:
                </label>
                <input
                  type="number"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-emerald-700 rounded-lg text-green-300 text-center text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Твое число..."
                  autoFocus
                />
              </div>

              {/* Диапазон */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-300">
                    От:
                  </label>
                  <input
                    type="number"
                    value={minRange}
                    onChange={(e) => setMinRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-300">
                    До:
                  </label>
                  <input
                    type="number"
                    value={maxRange}
                    onChange={(e) => setMaxRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Сложность */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-300">
                  Уровень сложности:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-emerald-700 rounded-lg text-green-300 focus:outline-none focus:border-emerald-500"
                >
                  {Object.entries(difficulties).map(([key, diff]) => (
                    <option key={key} value={key}>
                      {diff.name} - {diff.attempts} попыток, {diff.fuelReward}л
                    </option>
                  ))}
                </select>
              </div>

              {/* Информация о выбранной сложности */}
              <div className="bg-gray-800/30 rounded-lg p-3 border border-emerald-700/30">
                <div className="text-sm text-green-200">
                  <div className="font-semibold">{difficulties[difficulty].name}</div>
                  <div className="text-green-200/70 text-xs mt-1">
                    {difficulties[difficulty].description}
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Попыток: {difficulties[difficulty].attempts}</span>
                    <span className="text-emerald-400">Награда: {difficulties[difficulty].fuelReward}л</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-3 bg-gray-700 text-green-300 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ❌ ОТМЕНА
                </button>
                <button
                  onClick={startGame}
                  disabled={!targetNumber}
                  className="py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 font-bold rounded-lg hover:from-emerald-400 hover:to-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 ЗАПУСТИТЬ
                </button>
              </div>
            </div>
          )}

          {/* Игровой процесс */}
          {gameState === 'playing' && (
            <div className="space-y-4">
              {/* Статус игры */}
              <div className="bg-gray-800/30 rounded-lg p-3 border border-emerald-700/30">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-300 font-semibold">
                    {difficulties[difficulty].name}
                  </span>
                  <span className="text-emerald-400">
                    Попыток: {attempts}/{maxAttempts}
                  </span>
                </div>
                <div className="text-xs text-green-200/60 mt-1">
                  Диапазон: {minRange} - {maxRange}
                </div>
                <div className="text-xs text-amber-400 mt-1 font-semibold">
                  🔒 Загаданное число: {targetNumber}
                </div>
              </div>

              {/* Симуляция игрового процесса */}
              <div className="text-center space-y-3">
                <div className="text-4xl">🎮</div>
                <p className="text-green-300 font-semibold">
                  Игра запущена для игроков!
                </p>
                <p className="text-green-200/70 text-sm">
                  Игроки видят диапазон {minRange}-{maxRange} и пытаются угадать число
                </p>
              </div>

              {/* Лог игры */}
              {gameLog.length > 0 && (
                <div className="bg-gray-800/20 rounded-lg p-3 border border-emerald-700/20 max-h-32 overflow-y-auto">
                  <div className="text-xs text-green-200/60 font-semibold mb-2">
                    Ход игры:
                  </div>
                  <div className="space-y-1 text-xs">
                    {gameLog.map((log, index) => (
                      <div key={index} className="text-green-200/80">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки управления для ведущего */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToLog(`💥 Ведущий завершил игру досрочно`);
                    setGameState('result');
                    onFuelEarned?.(0, false);
                  }}
                  className="py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors"
                >
                  ⏹️ ЗАВЕРШИТЬ
                </button>
                <button
                  onClick={resetGame}
                  className="py-3 bg-gray-700 text-green-300 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🔄 ЗАНОВО
                </button>
              </div>
            </div>
          )}

          {/* Результат */}
          {gameState === 'result' && (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">
                {gameLog.some(log => log.includes('УГАДАЛ')) ? '🎉' : '💥'}
              </div>

              <h3 className="text-xl font-bold text-green-300">
                {gameLog.some(log => log.includes('УГАДАЛ'))
                  ? 'ИГРОК ВЫИГРАЛ!'
                  : 'ИГРА ОКОНЧЕНА'}
              </h3>

              <div className="bg-gray-800/30 rounded-lg p-4 border border-emerald-700/30">
                <div className="space-y-2 text-sm">
                  {gameLog.slice(-4).map((log, index) => (
                    <div key={index} className="text-green-200">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetGame}
                  className="py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 font-bold rounded-lg hover:from-emerald-400 hover:to-green-400 transition-all"
                >
                  🎮 НОВАЯ ИГРА
                </button>
                <button
                  onClick={onClose}
                  className="py-3 bg-gray-700 text-green-300 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ✅ ЗАКРЫТЬ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="bg-gray-800/50 p-3 border-t border-emerald-500/20">
          <p className="text-center text-xs text-green-200/50">
            🔒 Только ведущий видит загаданное число. Шанс угадать очень мал!
          </p>
        </div>
      </div>
    </div>
  );
}