'use client';
import { useEffect, useState } from 'react';

export default function FuelGameClient({ playerName, playerId }) {
  const [gameActive, setGameActive] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);

  // Проверяем активна ли игра
  const checkGameStatus = async () => {
    try {
      const response = await fetch('/api/game/guess');
      if (response.ok) {
        const data = await response.json();
        setGameActive(true);
        setGameInfo(data.game);
        setGuesses(data.guesses);

        // Проверяем, делал ли этот игрок уже догадку
        const userGuess = data.guesses.find(g => g.playerId === playerId);
        if (userGuess) {
          setHasGuessed(true);
          setMessage(`Вы уже сделали догадку: ${userGuess.guess}`);
        }
      } else {
        setGameActive(false);
        setGameInfo(null);
      }
    } catch (error) {
      setGameActive(false);
    }
  };

  // Отправляем догадку
  const submitGuess = async (e) => {
    e.preventDefault();

    if (!userGuess || hasGuessed) return;

    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerName,
          playerId,
          guess: parseInt(userGuess)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setHasGuessed(true);
        setMessage(data.guess.isCorrect ?
          '🎉 Поздравляем! Вы угадали число!' :
          `Ваша догадка: ${userGuess}. ${data.guess.hint === 'greater' ? 'Загаданное число БОЛЬШЕ' : 'Загаданное число МЕНЬШЕ'}`
        );
        checkGameStatus(); // Обновляем список догадок
      } else {
        setMessage(data.error || 'Ошибка при отправке догадки');
      }
    } catch (error) {
      setMessage('Ошибка соединения');
    }
  };

  // Проверяем статус игры каждые 3 секунды
  useEffect(() => {
    checkGameStatus();
    const interval = setInterval(checkGameStatus, 3000);
    return () => clearInterval(interval);
  }, [playerId]);

  if (!gameActive) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <div className="text-4xl mb-4">⛽</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Рулетка топлива</h3>
        <p className="text-gray-400">Ожидаем запуска игры ведущим...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-emerald-700">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⛽</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Рулетка топлива</h3>
        <p className="text-gray-300">Угадайте число от {gameInfo.range.min} до {gameInfo.range.max}</p>
        <p className="text-sm text-gray-400 mt-1">
          Попыток: {gameInfo.remainingAttempts}/{gameInfo.attempts}
        </p>
      </div>

      {!hasGuessed ? (
        <form onSubmit={submitGuess} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Ваша догадка:
            </label>
            <input
              type="number"
              min={gameInfo.range.min}
              max={gameInfo.range.max}
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder={`Введите число от ${gameInfo.range.min} до ${gameInfo.range.max}`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
          >
            🎯 Сделать догадку
          </button>
        </form>
      ) : (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <div className="text-lg font-semibold text-green-400 mb-2">
            {message.includes('Поздравляем') ? '🎉' : '📝'} {message}
          </div>
          <p className="text-sm text-gray-400">Ожидаем завершения игры</p>
        </div>
      )}

      {/* Список догадок других игроков */}
      {guesses.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-green-300 mb-3">Догадки игроков:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {guesses.map((guess) => (
              <div
                key={guess.id}
                className={`p-3 rounded-lg border ${
                  guess.isCorrect
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-600 bg-gray-700/30'
                } ${guess.playerId === playerId ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${
                    guess.playerId === playerId ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    {guess.playerName} {guess.playerId === playerId && '(Вы)'}
                  </span>
                  <span className={`text-lg font-bold ${
                    guess.isCorrect ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {guess.guess}
                  </span>
                </div>
                {!guess.isCorrect && (
                  <div className="text-xs text-gray-400 mt-1">
                    {guess.hint === 'greater' ? 'Загаданное число БОЛЬШЕ' : 'Загаданное число МЕНЬШЕ'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}