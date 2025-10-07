'use client';
import { useEffect, useMemo, useState } from 'react';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = ct.includes('application/json') ? await res.json() : null;
  } catch {
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data ?? {};
}

/// Компонент мини-игры для игроков
function FuelGameClient({ playerName, playerId }) {
  const [gameActive, setGameActive] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [usedAttempts, setUsedAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);

  const checkGameStatus = async () => {
    // Предотвращаем слишком частые запросы
    const now = Date.now();
    if (now - lastCheck < 2000) return; // Не чаще чем раз в 2 секунды

    try {
      setLoading(true);
      setLastCheck(now);

      const response = await fetch('/api/game/guess');

      if (response.ok) {
        const data = await response.json();
        setGameActive(true);
        setGameInfo(data.game);
        setGuesses(data.guesses || []);

        // Подсчитываем попытки текущего игрока
        const playerGuesses = data.guesses.filter(g => g.playerId === playerId);
        setUsedAttempts(playerGuesses.length);
        setRemainingAttempts(data.game.attempts - playerGuesses.length);
        setMessage('');

      } else {
        // Если игра не активна (400 ошибка), это нормальная ситуация
        const errorData = await response.json();
        if (errorData.code === 'GAME_NOT_ACTIVE') {
          setGameActive(false);
          setGameInfo(null);
          setGuesses([]);
          setUsedAttempts(0);
          setRemainingAttempts(0);
          setMessage('');
        } else {
          setMessage(`Ошибка: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error checking game status:', error);
      setGameActive(false);
      // Не показываем ошибку соединения, это нормально
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async (e) => {
    e.preventDefault();

    if (!userGuess || remainingAttempts <= 0 || !gameActive) return;

    try {
      setLoading(true);
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
        setUserGuess('');
        setMessage(
          data.guess.isCorrect ?
            '🎉 Поздравляем! Вы угадали число!' :
            `Попытка ${data.guess.attemptNumber}: ${userGuess}. ${data.guess.hint === 'greater' ? 'Загаданное число БОЛЬШЕ' : 'Загаданное число МЕНЬШЕ'}`
        );

        setRemainingAttempts(data.remainingAttempts);
        setUsedAttempts(data.usedAttempts);

        // Обновляем список догадок через секунду
        setTimeout(() => {
          checkGameStatus();
        }, 1000);

      } else {
        setMessage(data.error || 'Ошибка при отправке догадки');
        // Если ошибка, перепроверяем статус игры
        checkGameStatus();
      }
    } catch (error) {
      setMessage('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Первоначальная проверка статуса
    checkGameStatus();

    // Интервал проверки только если игра активна
    let interval;
    if (gameActive) {
      interval = setInterval(checkGameStatus, 5000); // Каждые 5 секунд если игра активна
    } else {
      interval = setInterval(checkGameStatus, 10000); // Каждые 10 секунд если игра не активна
    }

    return () => clearInterval(interval);
  }, [gameActive, playerId]);

  // Если загружается, показываем индикатор
  if (loading && !gameActive) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <div className="text-4xl mb-4">⛽</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Рулетка топлива</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
        <p className="text-gray-400 mt-2">Проверяем статус игры...</p>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <div className="text-4xl mb-4">⛽</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Рулетка топлива</h3>
        <p className="text-gray-400 mb-4">Ожидаем запуска игры ведущим...</p>
        <div className="text-xs text-gray-500 mt-2">
          Игра будет запущена ведущим в ближайшее время
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-emerald-700">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⛽</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Рулетка топлива</h3>
        <p className="text-gray-300">Угадайте число от {gameInfo.range.min} до {gameInfo.range.max}</p>
        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{usedAttempts}</div>
            <div className="text-xs text-gray-400">Использовано</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{remainingAttempts}</div>
            <div className="text-xs text-gray-400">Осталось</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{gameInfo.attempts}</div>
            <div className="text-xs text-gray-400">Всего</div>
          </div>
        </div>
      </div>

      {remainingAttempts > 0 ? (
        <form onSubmit={submitGuess} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Ваша догадка (попытка {usedAttempts + 1}):
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
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!userGuess || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Отправка...
              </>
            ) : (
              `🎯 Сделать догадку (${remainingAttempts} осталось)`
            )}
          </button>
        </form>
      ) : (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <div className="text-lg font-semibold text-amber-400 mb-2">
            Вы использовали все {gameInfo.attempts} попыток!
          </div>
          <p className="text-sm text-gray-400">Ожидаем завершения игры</p>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          message.includes('Поздравляем') ? 'bg-emerald-900/30 border border-emerald-500' :
            message.includes('Ошибка') ? 'bg-red-900/30 border border-red-500' :
              'bg-blue-900/30 border border-blue-500'
        }`}>
          <div className="font-semibold text-green-300">{message}</div>
        </div>
      )}

      {/* Список догадок */}
      {guesses.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-green-300">Все догадки:</h4>
            <button
              onClick={checkGameStatus}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-gray-300 disabled:opacity-50"
            >
              {loading ? '🔄' : '🔄 Обновить'}
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
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
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      guess.playerId === playerId ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {guess.playerName} {guess.playerId === playerId && '(Вы)'}
                    </span>
                    <span className="text-xs text-gray-400">#{guess.attemptNumber}</span>
                  </div>
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

// Компонент мини-игры для админ-панели
function FuelGuessGame({ isActive, onClose, adminKey, players }) {
  const [targetNumber, setTargetNumber] = useState(50);
  const [gameRange, setGameRange] = useState({ min: 1, max: 100 });
  const [gameAttempts, setGameAttempts] = useState(5);
  const [playerGuesses, setPlayerGuesses] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const startGame = async () => {
    if (!adminKey) {
      alert('❌ Введите ключ администратора');
      return;
    }

    try {
      const gameResponse = await fetch('/api/game/guess', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetNumber,
          range: gameRange,
          attempts: gameAttempts
        })
      });

      if (!gameResponse.ok) {
        throw new Error('Ошибка запуска игры');
      }

      await fetchJSON('/api/events/global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          message: `🎮 РУЛЕТКА ТОПЛИВА! Угадайте число от ${gameRange.min} до ${gameRange.max}. Попыток: ${gameAttempts}`,
          type: 'game_start',
          duration: 20,
          severity: 'high'
        })
      });

      setGameStarted(true);
      setGameEnded(false);
      setPlayerGuesses([]);

      alert('🎮 Игра запущена! Игроки получили уведомление.');
    } catch (error) {
      alert('❌ Ошибка запуска игры');
    }
  };

  const endGame = async (winner = null) => {
    setGameEnded(true);

    try {
      if (winner) {
        const fuelAmount = Math.floor((gameRange.max - gameRange.min) / 10) + 10;
        await fetchJSON('/api/events/global', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': adminKey
          },
          body: JSON.stringify({
            message: `🎉 ${winner.playerName} угадал число ${targetNumber} и получает ${fuelAmount}л топлива!`,
            type: 'game_win',
            duration: 15,
            severity: 'high'
          })
        });
        alert(`🎉 ${winner.playerName} выиграл ${fuelAmount}л топлива!`);
      } else {
        await fetchJSON('/api/events/global', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': adminKey
          },
          body: JSON.stringify({
            message: `💥 Рулетка топлива завершена! Загаданное число было: ${targetNumber}`,
            type: 'game_lose',
            duration: 10,
            severity: 'medium'
          })
        });
        alert('💥 Никто не угадал число');
      }

      await fetch('/api/game/guess', { method: 'DELETE' });
    } catch (error) {
      console.error('End game error:', error);
    }
  };

  const resetGame = () => {
    setTargetNumber(50);
    setGameRange({ min: 1, max: 100 });
    setGameAttempts(5);
    setPlayerGuesses([]);
    setGameStarted(false);
    setGameEnded(false);
  };

  const loadPlayerGuesses = async () => {
    if (!isActive || !gameStarted || gameEnded) return;

    try {
      const response = await fetch('/api/game/guess');
      if (response.ok) {
        const data = await response.json();
        setPlayerGuesses(data.guesses || []);

        const winner = data.guesses.find(g => g.isCorrect);
        if (winner) {
          endGame(winner);
        } else if (data.guesses.length >= gameAttempts) {
          endGame();
        }
      }
    } catch (error) {
      console.error('Error loading guesses:', error);
    }
  };

  useEffect(() => {
    if (!isActive || !gameStarted || gameEnded) return;

    const interval = setInterval(loadPlayerGuesses, 2000);
    return () => clearInterval(interval);
  }, [isActive, gameStarted, gameEnded]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-emerald-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-emerald-700/50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-3">
              ⛽ Рулетка топлива
            </h2>
            <button
              onClick={() => {
                resetGame();
                onClose();
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
            >
              ✕
            </button>
          </div>
          <p className="text-green-200/60 mt-2">Игроки пытаются угадать ваше загаданное число</p>
        </div>

        <div className="p-6 space-y-6">
          {!gameStarted ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">Загаданное число</label>
                  <input
                    type="number"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(parseInt(e.target.value))}
                    min={gameRange.min}
                    max={gameRange.max}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">Попытки игроков</label>
                  <select
                    value={gameAttempts}
                    onChange={(e) => setGameAttempts(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={3}>3 (Сложно)</option>
                    <option value={5}>5 (Нормально)</option>
                    <option value={8}>8 (Легко)</option>
                    <option value={10}>10 (Очень легко)</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">Минимальное число</label>
                  <input
                    type="number"
                    value={gameRange.min}
                    onChange={(e) => setGameRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">Максимальное число</label>
                  <input
                    type="number"
                    value={gameRange.max}
                    onChange={(e) => setGameRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-amber-300">
                  <span>👁️</span>
                  <div className="text-sm">
                    <strong>Только вы видите загаданное число:</strong>
                    <div className="text-2xl font-bold text-center my-2">{targetNumber}</div>
                    <div>Игроки увидят только диапазон: {gameRange.min}-{gameRange.max}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 font-bold rounded-lg hover:from-emerald-400 hover:to-green-400 transition-all"
              >
                🚀 Запустить игру для игроков
              </button>
            </div>
          ) : !gameEnded ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
                  <div className="text-2xl font-bold text-emerald-400">{targetNumber}</div>
                  <div className="text-sm text-green-200/60">Загаданное число</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                  <div className="text-2xl font-bold text-blue-400">{playerGuesses.length}/{gameAttempts}</div>
                  <div className="text-sm text-green-200/60">Использовано попыток</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <div className="text-2xl font-bold text-purple-400">{gameRange.min}-{gameRange.max}</div>
                  <div className="text-sm text-green-200/60">Диапазон</div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-green-300 mb-3">Догадки игроков:</h3>
                {playerGuesses.length === 0 ? (
                  <div className="text-center py-4 text-green-200/40">⌛ Ожидаем догадок игроков...</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {playerGuesses.map((guess) => (
                      <div
                        key={guess.id}
                        className={`p-3 rounded-lg border ${
                          guess.isCorrect
                            ? 'border-emerald-500 bg-emerald-900/20'
                            : 'border-gray-600 bg-gray-900/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-300">{guess.playerName}</span>
                          <span className={`text-lg font-bold ${
                            guess.isCorrect ? 'text-emerald-400' : 'text-gray-400'
                          }`}>
                            {guess.guess}
                          </span>
                        </div>
                        <div className="text-sm text-green-200/60 mt-1">
                          {guess.hint === 'greater' ? '📈 Больше' : guess.hint === 'less' ? '📉 Меньше' : '🎯 УГАДАЛ!'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => endGame()}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-500 hover:to-orange-500 transition-all"
              >
                ⏹️ Завершить игру досрочно
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className={`text-4xl ${playerGuesses.some(g => g.isCorrect) ? 'text-emerald-400' : 'text-red-400'}`}>
                {playerGuesses.some(g => g.isCorrect) ? '🎉 ПОБЕДА!' : '💥 ПРОИГРЫШ'}
              </div>

              <div className="text-lg text-green-300">
                {playerGuesses.some(g => g.isCorrect)
                  ? `Игрок ${playerGuesses.find(g => g.isCorrect)?.playerName} угадал число!`
                  : 'Никто не угадал загаданное число'
                }
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="font-semibold text-green-300 mb-2">Загаданное число:</div>
                <div className="text-3xl font-bold text-emerald-400">{targetNumber}</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 font-bold rounded-lg hover:from-emerald-400 hover:to-green-400 transition-all"
                >
                  🔄 Новая игра
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-700 text-green-300 font-bold rounded-lg hover:bg-gray-600 transition-all"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('players');
  const [activeEvents, setActiveEvents] = useState([]);
  const [fuelGameActive, setFuelGameActive] = useState(false);
  const [targetNumber, setTargetNumber] = useState(50);
  const [gameRange, setGameRange] = useState({ min: 1, max: 100 });
  const [gameAttempts, setGameAttempts] = useState(5);
  const [playerGuesses, setPlayerGuesses] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [poll, setPoll] = useState(null);
  const [counts, setCounts] = useState({});
  const [last, setLast] = useState(null);

  const [question, setQuestion] = useState('Кого исключаем из бункера?');
  const [mode, setMode] = useState('players');
  const [customOptions, setCustomOptions] = useState('');

  const [eventMessage, setEventMessage] = useState('');
  const [resourceModifier, setResourceModifier] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [gamePhase, setGamePhase] = useState('preparation');
  const [selectedCrisis, setSelectedCrisis] = useState('radiation');
  const [crisisIntensity, setCrisisIntensity] = useState('medium');

  // ===== загрузка данных =====
  async function loadPlayers() {
    if (!adminKey) return;
    setError('');
    try {
      const data = await fetchJSON('/api/state', { headers: { 'x-admin-key': adminKey } });
      setPlayers(data.players || []);
    } catch (e) {
      if (e.status === 401) setError('❌ Неверный ключ ведущего');
      else setError('⚠ Ошибка загрузки игроков');
      setPlayers([]);
    }
  }

  async function loadPoll() {
    try {
      const data = await fetchJSON('/api/polls/state');
      setPoll(data.poll || null);
      setCounts(data.counts || {});
      setLast(data.last || null);
    } catch {
      setPoll(null);
      setCounts({});
      setLast(null);
    }
  }

  async function loadEvents() {
    try {
      const data = await fetchJSON('/api/events');
      setActiveEvents(data.events || []);
    } catch {
      setActiveEvents([]);
    }
  }

  useEffect(() => {
    if (!adminKey) return;
    const tick = async () => {
      await Promise.allSettled([loadPlayers(), loadPoll(), loadEvents()]);
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [adminKey]);

  // ===== основные действия =====
  async function toggleReveal(id) {
    await fetch('/api/admin/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function toggleExclude(id) {
    await fetch('/api/admin/exclude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function deletePlayer(id) {
    if (!confirm('Удалить игрока безвозвратно?')) return;
    await fetch('/api/admin/delete-player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ targetId: id })
    });
    loadPlayers();
  }

  async function wipeAll() {
    if (!confirm('⚠ Стереть ВСЕХ игроков и начать заново?')) return;
    await fetch('/api/admin/wipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
    });
    await Promise.allSettled([loadPlayers(), loadPoll(), loadEvents()]);
  }

  // ===== РЕАЛЬНАЯ РЕАЛИЗАЦИЯ СОБЫТИЙ =====
  async function sendGlobalEvent() {
    if (!eventMessage.trim()) return;

    try {
      await fetchJSON('/api/events/global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          message: eventMessage,
          type: 'info',
          duration: 10
        })
      });

      alert(`📢 Событие отправлено: "${eventMessage}"`);
      setEventMessage('');
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка отправки события');
    }
  }

  async function triggerCrisis(crisisType = selectedCrisis, intensity = crisisIntensity) {
    try {
      await fetchJSON('/api/events/crisis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          crisisType,
          intensity,
          duration: 15
        })
      });

      alert(`🔥 Кризис активирован: ${getCrisisName(crisisType)}`);
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка активации кризиса');
    }
  }

  async function modifyResources() {
    if (resourceModifier === 0) {
      alert('❌ Установите значение модификатора');
      return;
    }

    try {
      await fetchJSON('/api/events/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          modifier: resourceModifier,
          resourceType: 'all',
          reason: resourceModifier > 0 ? 'Пополнение запасов' : 'Потери ресурсов'
        })
      });

      alert(`📦 Ресурсы изменены: ${resourceModifier > 0 ? '+' : ''}${resourceModifier}%`);
      setResourceModifier(0);
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка изменения ресурсов');
    }
  }

  async function triggerQuickEvent(eventType) {
    try {
      await fetchJSON('/api/events/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ eventType })
      });

      alert(`⚡ Быстрое событие активировано: ${getQuickEventName(eventType)}`);
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка активации события');
    }
  }

  async function deleteEvent(eventId) {
    try {
      await fetchJSON(`/api/events?id=${eventId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });

      alert('✅ Событие удалено');
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка удаления события');
    }
  }

  async function changeGamePhase(phase) {
    setGamePhase(phase);
    try {
      await fetchJSON('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          type: 'phase_change',
          title: '🔄 СМЕНА ФАЗЫ ИГРЫ',
          description: `Фаза игры изменена на: ${getPhaseName(phase)}`,
          duration: 5,
          target: 'all',
          severity: 'info'
        })
      });

      alert(`🔄 Фаза игры изменена на: ${getPhaseName(phase)}`);
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка смены фазы');
    }
  }

  async function assignScenario() {
    if (!selectedScenario) return;

    try {
      await fetchJSON('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          type: 'scenario_change',
          title: '🎭 СМЕНА СЦЕНАРИЯ',
          description: `Активный сценарий: ${getScenarioName(selectedScenario)}`,
          duration: 10,
          target: 'all',
          severity: 'info'
        })
      });

      alert(`🎭 Сценарий установлен: ${getScenarioName(selectedScenario)}`);
      loadEvents();
    } catch (error) {
      alert('❌ Ошибка установки сценария');
    }
  }

  // ===== ГОЛОСОВАНИЕ =====
  async function startPoll() {
    if (!adminKey) return alert('Введите ADMIN_KEY');

    let candidates = [];
    if (mode === 'players') {
      candidates = players.filter(p => !p.excluded).map(p => p.id);
    } else {
      alert('Режим "Свои варианты" пока не поддержан');
      return;
    }

    if (candidates.length === 0) {
      alert('Нет доступных кандидатов для голосования');
      return;
    }

    try {
      await fetchJSON('/api/polls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ candidates, question })
      });
      await loadPoll();
      alert('🗳 Голосование запущено!');
    } catch (error) {
      alert('❌ Ошибка запуска голосования');
    }
  }

  async function closePoll() {
    if (!adminKey) return alert('Введите ADMIN_KEY');
    try {
      await fetchJSON('/api/polls/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ policy: 'most' })
      });
      await loadPoll();
      alert('⏹ Голосование завершено!');
    } catch (error) {
      alert('❌ Ошибка завершения голосования');
    }
  }

  // Вспомогательные функции
  const getPhaseName = (phase) => {
    const phases = {
      preparation: '🔧 Подготовка',
      active: '🎮 Активная игра',
      crisis: '🔥 Кризис',
      resolution: '🏁 Завершение'
    };
    return phases[phase] || phase;
  };

  const getCrisisName = (crisis) => {
    const crises = {
      radiation: '☢️ Радиационная угроза',
      system_failure: '🛠️ Критическая поломка',
      mutant_attack: '👹 Атака мутантов',
      mental_breakdown: '🧠 Психический кризис',
      resource_crisis: '📉 Кризис ресурсов'
    };
    return crises[crisis] || crisis;
  };

  const getQuickEventName = (eventType) => {
    const events = {
      food_found: '🎁 Находка продовольствия',
      medicine_discovery: '💊 Медицинские припасы',
      equipment_found: '🔧 Полезное оборудование',
      external_contact: '🤝 Внешний контакт'
    };
    return events[eventType] || eventType;
  };

  const getScenarioName = (scenario) => {
    const scenarios = {
      bunker: 'Пубертат AVANTE🚺',
      nomad: '🚌 Бронеавтобус "Номад"',
      station: '🛰👧🏻 ЖЕНЩИНА-БОГОМОЛ',
      submarine: '🥂 ОБЛОЖЕНИЕ РЕЗНОВА'
    };
    return scenarios[scenario] || scenario;
  };

  const getEventSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400',
      info: 'text-blue-400'
    };
    return colors[severity] || 'text-green-400';
  };

  const totalVotes = useMemo(
    () => Object.values(counts).reduce((s, n) => s + n, 0),
    [counts]
  );

  const nameById = (id) => players.find(p => p.id === id)?.name || id;

  // Стилизованные компоненты
  const StatCard = ({ title, value, icon, color = 'emerald' }) => (
    <div className={`p-4 rounded-xl border border-${color}-800/40 bg-gray-900/50 backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-sm text-green-200/60">{title}</div>
          <div className="text-xl font-bold text-green-400">{value}</div>
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ onClick, children, variant = 'primary', icon, disabled = false, size = 'medium' }) => {
    const variants = {
      primary: 'bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 hover:from-emerald-400 hover:to-green-400',
      secondary: 'bg-gray-800 text-green-300 border border-emerald-700 hover:bg-gray-700 hover:border-emerald-600',
      danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500',
      warning: 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500'
    };

    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
          variants[variant]
        } ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-green-300 p-4 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок и статистика */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              🎮 Командный центр бункера
            </h1>
            <p className="text-green-200/60 mt-1">Панель управления игровой сессией</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Игроков" value={players.length} icon="👥" />
            <StatCard title="Активных" value={players.filter(p => !p.excluded).length} icon="🎯" />
            <StatCard title="Событий" value={activeEvents.length} icon="📢" color="blue" />
            <StatCard title="Фаза" value={getPhaseName(gamePhase)} icon="🔄" color="purple" />
          </div>
        </div>

        {/* Панель аутентификации */}
        <div className="rounded-2xl border border-emerald-800/40 bg-gray-900/80 backdrop-blur-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <input
              type="password"
              placeholder="🔑 Введите ключ администратора..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-emerald-700 text-green-300 placeholder-green-700 focus:outline-none focus:border-emerald-500 transition-colors"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
            <div className="flex gap-3">
              <ActionButton onClick={loadPlayers} icon="🔄">Обновить данные</ActionButton>
              <ActionButton onClick={wipeAll} variant="danger" icon="🧨">Перезапуск</ActionButton>
            </div>
          </div>
          {error && <div className="mt-3 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300">{error}</div>}
        </div>

        {/* Навигация */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-800/40 pb-2">
          {[
            { id: 'players', name: '👥 Игроки', icon: '👥' },
            { id: 'voting', name: '🗳 Голосование', icon: '🗳' },
            { id: 'events', name: '📢 События', icon: '📢' },
            { id: 'scenarios', name: '🎭 Сценарии', icon: '🎭' },
            { id: 'resources', name: '📦 Ресурсы', icon: '📦' },
            { id: 'minigames', name: '🎮 Мини-игры', icon: '🎮' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-gray-900 font-bold'
                  : 'bg-gray-800 text-green-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Контент вкладок */}
        <div className="rounded-2xl border border-emerald-800/40 bg-gray-900/80 backdrop-blur-sm p-6">
          {/* Вкладка игроков */}
          {activeTab === 'players' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-400 mb-4">👥 Управление игроками</h2>
              <div className="grid gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
                      player.excluded
                        ? 'border-red-500/50 bg-red-900/20'
                        : 'border-emerald-700/50 bg-gray-800/30 hover:border-emerald-500/70'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-green-300">{player.name}</h3>
                          {player.excluded && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                              🚫 ИСКЛЮЧЁН
                            </span>
                          )}
                          {player.id === players[0]?.id && (
                            <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs rounded-full font-bold">
                              👑 ЛИДЕР
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div><span className="text-green-200/60">Возраст:</span> {player.age || '—'}</div>
                          <div><span className="text-green-200/60">Пол:</span> {player.gender || '—'}</div>
                          <div><span className="text-green-200/60">Раса:</span> {player.race || '—'}</div>
                          <div><span className="text-green-200/60">Профессия:</span> {player.profession || '—'}</div>
                          <div><span className="text-green-200/60">Здоровье:</span> {player.health || '—'}</div>
                          <div><span className="text-green-200/60">Психика:</span> {player.psychology || '—'}</div>
                          <div><span className="text-green-200/60">Хобби:</span> {player.hobby || '—'}</div>
                          <div><span className="text-green-200/60">Страх:</span> {player.fear || '—'}</div>
                          <div><span className="text-green-200/60">Черта:</span> {player.trait || '—'}</div>
                          <div><span className="text-green-200/60">Способность:</span> {player.ability || '—'}</div>
                          <div><span className="text-green-200/60">Секрет:</span> {player.secret || '—'}</div>
                          <div><span className="text-green-200/60">Предмет:</span> {player.item || '—'}</div>
                          <div><span className="text-green-200/60">Отношение:</span> {player.relationship || '—'}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton onClick={() => toggleReveal(player.id)} variant="secondary" icon="🔓" size="small">
                          Раскрыть
                        </ActionButton>
                        <ActionButton onClick={() => toggleExclude(player.id)}
                                      variant={player.excluded ? 'warning' : 'danger'}
                                      icon={player.excluded ? '↩️' : '🚫'} size="small">
                          {player.excluded ? 'Вернуть' : 'Исключить'}
                        </ActionButton>
                        <ActionButton onClick={() => deletePlayer(player.id)} variant="danger" icon="🗑️" size="small">
                          Удалить
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {players.length === 0 && !error && (
                <div className="text-center py-12 text-green-200/40">
                  <div className="text-6xl mb-4">👥</div>
                  <div>Нет данных об игроках</div>
                  <div className="text-sm mt-2">Введите ключ администратора и обновите данные</div>
                </div>
              )}
            </div>
          )}

          {/* Вкладка голосования */}
          {activeTab === 'voting' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400">🗳 Система голосования</h2>
              {poll && (
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-green-300 mb-1">Активное голосование</h3>
                      <p className="text-green-200/60">Вопрос: {poll.question}</p>
                    </div>
                    <ActionButton onClick={closePoll} variant="danger" icon="⏹️">Завершить голосование</ActionButton>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-300">Кандидаты</h4>
                      {poll.candidates?.map((id) => {
                        const votes = counts[id] || 0;
                        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                        const player = players.find(p => p.id === id);

                        return (
                          <div key={id} className="p-3 rounded-lg border border-emerald-800/30 bg-gray-900/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-green-300">
                                {player?.name || id}
                                {player?.excluded && <span className="text-red-400 text-xs ml-2">[ИСКЛЮЧЁН]</span>}
                              </span>
                              <span className="text-emerald-400 font-bold">{votes} гол.</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-400 to-green-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-xs text-green-200/60 mt-1 text-right">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/30 text-center">
                        <div className="text-3xl font-bold text-emerald-400">{totalVotes}</div>
                        <div className="text-green-200/60">всего голосов</div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-green-300 mb-3">Детализация</h5>
                        <div className="space-y-2">
                          {Object.entries(counts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([id, count]) => (
                              <div key={id} className="flex justify-between items-center text-sm">
                                <span className="text-green-200/80">{nameById(id)}</span>
                                <span className="font-semibold text-green-400">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!poll && (
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Создать новое голосование</h3>
                  <div className="grid gap-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Вопрос голосования</label>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Кого исключаем из бункера?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Тип голосования</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={mode === 'players'} onChange={() => setMode('players')}
                                 className="text-emerald-500" />
                          <span>По игрокам</span>
                        </label>
                        <label className="flex items-center gap-2 opacity-60">
                          <input type="radio" checked={mode === 'custom'} onChange={() => setMode('custom')} disabled />
                          <span>Свои варианты (скоро)</span>
                        </label>
                      </div>
                    </div>

                    <ActionButton onClick={startPoll} icon="🚀">Начать голосование</ActionButton>
                  </div>
                </div>
              )}

              {last && (
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-3">Последние результаты</h3>
                  <p className="text-green-200">{last.summary || '—'}</p>
                </div>
              )}
            </div>
          )}

          {/* Вкладка событий */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400">📢 Управление событиями</h2>

              {activeEvents.length > 0 && (
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Активные события</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border border-emerald-800/30 bg-gray-900/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className={`font-bold ${getEventSeverityColor(event.severity)}`}>{event.title}</h4>
                            <p className="text-green-200/80 text-sm mt-1">{event.description}</p>
                          </div>
                          <ActionButton onClick={() => deleteEvent(event.id)} variant="danger" icon="🗑️"
                                        size="small">Удалить</ActionButton>
                        </div>
                        <div className="flex justify-between text-xs text-green-200/60">
                          <span>Тип: {event.type}</span>
                          <span>Создано: {new Date(event.createdAt).toLocaleTimeString()}</span>
                          <span>Истекает: {new Date(event.expiresAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Глобальное уведомление</h3>
                  <div className="space-y-3">
                    <textarea
                      value={eventMessage}
                      onChange={(e) => setEventMessage(e.target.value)}
                      placeholder="Введите сообщение для всех игроков..."
                      className="w-full h-24 px-4 py-3 rounded-lg bg-gray-900 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <ActionButton onClick={sendGlobalEvent} icon="📢" disabled={!eventMessage.trim()}>Отправить
                      уведомление</ActionButton>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Кризисные события</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Тип кризиса</label>
                      <select
                        value={selectedCrisis}
                        onChange={(e) => setSelectedCrisis(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="radiation">☢️ Радиационная угроза</option>
                        <option value="system_failure">🛠️ Критическая поломка</option>
                        <option value="mutant_attack">👹 Атака мутантов</option>
                        <option value="mental_breakdown">🧠 Психический кризис</option>
                        <option value="resource_crisis">📉 Кризис ресурсов</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Интенсивность</label>
                      <select
                        value={crisisIntensity}
                        onChange={(e) => setCrisisIntensity(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="low">Низкая</option>
                        <option value="medium">Средняя</option>
                        <option value="high">Высокая</option>
                      </select>
                    </div>
                    <ActionButton onClick={() => triggerCrisis()} variant="warning" icon="🔥">Активировать
                      кризис</ActionButton>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                <h3 className="text-lg font-bold text-green-300 mb-4">Быстрые события</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: 'food_found', name: '🎁 Находка продовольствия', icon: '🎁' },
                    { type: 'medicine_discovery', name: '💊 Медицинские припасы', icon: '💊' },
                    { type: 'equipment_found', name: '🔧 Полезное оборудование', icon: '🔧' },
                    { type: 'external_contact', name: '🤝 Внешний контакт', icon: '🤝' }
                  ].map((event) => (
                    <button
                      key={event.type}
                      onClick={() => triggerQuickEvent(event.type)}
                      className="p-3 rounded-lg border border-emerald-700/30 bg-gray-900/50 hover:bg-emerald-900/20 hover:border-emerald-500 transition-all text-sm text-green-200 flex flex-col items-center gap-2"
                    >
                      <span className="text-lg">{event.icon}</span>
                      <span>{event.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                <h3 className="text-lg font-bold text-green-300 mb-4">Фазы игры</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'preparation', name: '🔧 Подготовка', color: 'blue' },
                    { id: 'active', name: '🎮 Активная игра', color: 'emerald' },
                    { id: 'crisis', name: '🔥 Кризис', color: 'red' },
                    { id: 'resolution', name: '🏁 Завершение', color: 'purple' }
                  ].map(phase => (
                    <button
                      key={phase.id}
                      onClick={() => changeGamePhase(phase.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        gamePhase === phase.id
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-gray-600 bg-gray-900/50 text-green-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-sm font-semibold">{phase.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Вкладка сценариев */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400">🎭 Управление сценариями</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Выбор сценария</h3>
                  <div className="space-y-3">
                    <select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Выберите сценарий...</option>
                      <option value="bunker">🏠 Стационарный бункер</option>
                      <option value="nomad">🚌 Бронеавтобус "Номад"</option>
                      <option value="station">🛰️ Орбитальная станция</option>
                      <option value="submarine">🚤 Подводная лодка</option>
                    </select>
                    <ActionButton onClick={assignScenario} icon="🎯" disabled={!selectedScenario}>Применить
                      сценарий</ActionButton>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Параметры игры</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Сложность</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300">
                        <option>🎯 Нормальная</option>
                        <option>⚠️ Сложная</option>
                        <option>🔥 Выживание</option>
                        <option>☢️ Адская</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Продолжительность</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300">
                        <option>⏱️ Короткая (2-3 ч)</option>
                        <option>🕒 Средняя (4-5 ч)</option>
                        <option>⏳ Длинная (6+ ч)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка ресурсов */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400">📦 Управление ресурсами</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Модификатор ресурсов</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-green-300 mb-2">Изменение
                        запасов: {resourceModifier}%</label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={resourceModifier}
                        onChange={(e) => setResourceModifier(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-green-200/60">
                        <span>-50%</span>
                        <span>0%</span>
                        <span>+50%</span>
                      </div>
                    </div>
                    <ActionButton onClick={modifyResources} icon="📊" disabled={resourceModifier === 0}>Применить
                      изменения</ActionButton>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                  <h3 className="text-lg font-bold text-green-300 mb-4">Быстрые действия</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: '➕ Добавить еду', value: '+25%', action: () => setResourceModifier(25) },
                      { name: '➖ Уменьшить воду', value: '-25%', action: () => setResourceModifier(-25) },
                      { name: '💊 Медицина', value: '+50%', action: () => setResourceModifier(50) },
                      { name: '⚡ Энергия', value: '+30%', action: () => setResourceModifier(30) }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="p-3 rounded-lg border border-emerald-700/30 bg-gray-900/50 hover:bg-emerald-900/20 transition-all text-center"
                      >
                        <div className="font-semibold text-green-300">{action.name}</div>
                        <div className="text-xs text-emerald-400">{action.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка мини-игр */}
          {activeTab === 'minigames' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400">🎮 Мини-игры</h2>

              <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
                <h3 className="text-lg font-bold text-green-300 mb-4">Рулетка топлива</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 text-amber-300">
                        <span>🎯</span>
                        <div className="text-sm">
                          <strong>Как работает:</strong>
                          <div className="mt-1">Вы загадываете число, игроки пытаются угадать. Победитель получает
                            топливо!
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-green-300 mb-2">Загаданное число</label>
                        <input
                          type="number"
                          value={targetNumber}
                          onChange={(e) => setTargetNumber(parseInt(e.target.value) || 50)}
                          min={1}
                          max={100}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                        />
                        <div className="text-xs text-green-200/60 mt-1">От 1 до 100</div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-green-300 mb-2">Количество попыток</label>
                        <select
                          value={gameAttempts}
                          onChange={(e) => setGameAttempts(parseInt(e.target.value))}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                        >
                          <option value={3}>3 (Сложно)</option>
                          <option value={5}>5 (Нормально)</option>
                          <option value={8}>8 (Легко)</option>
                          <option value={10}>10 (Очень легко)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-green-300 mb-2">Минимальное число</label>
                        <input
                          type="number"
                          value={gameRange.min}
                          onChange={(e) => setGameRange(prev => ({ ...prev, min: parseInt(e.target.value) || 1 }))}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-green-300 mb-2">Максимальное число</label>
                        <input
                          type="number"
                          value={gameRange.max}
                          onChange={(e) => setGameRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-emerald-700 text-green-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-sm text-green-200/60">Игроки увидят диапазон:</div>
                        <div className="text-xl font-bold text-emerald-400">{gameRange.min} - {gameRange.max}</div>
                        <div className="text-sm text-green-200/60 mt-1">Попыток: {gameAttempts}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setFuelGameActive(true)}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 font-bold rounded-lg hover:from-emerald-400 hover:to-green-400 transition-all text-lg flex items-center justify-center gap-3"
                    >
                      <span>⛽</span>
                      <span>Запустить рулетку топлива</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-300 mb-3">Преимущества игры:</h4>
                      <div className="space-y-2 text-sm text-green-200/80">
                        <div className="flex items-center gap-2">✅ <span>Только ведущий видит число</span></div>
                        <div className="flex items-center gap-2">✅ <span>Автоматические уведомления</span></div>
                        <div className="flex items-center gap-2">✅ <span>Реальные имена игроков</span></div>
                        <div className="flex items-center gap-2">✅ <span>Гибкие настройки сложности</span></div>
                        <div className="flex items-center gap-2">✅ <span>Контроль над игрой</span></div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 text-blue-300">
                        <span>🏆</span>
                        <div className="text-sm">
                          <strong>Награда:</strong>
                          <div>Победитель получает {Math.floor((gameRange.max - gameRange.min) / 10) + 10}л топлива
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 text-purple-300">
                        <span>👁️</span>
                        <div className="text-sm">
                          <strong>Только для ведущего:</strong>
                          <div>Загаданное число: <span className="font-bold text-xl">{targetNumber}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5 opacity-60">
                  <h3 className="text-lg font-bold text-green-300 mb-4">🎲 Кости удачи</h3>
                  <p className="text-green-200/60">Скоро будет доступно...</p>
                </div>

                <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5 opacity-60">
                  <h3 className="text-lg font-bold text-green-300 mb-4">🎯 Тир</h3>
                  <p className="text-green-200/60">Скоро будет доступно...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Компонент мини-игры */}
      <FuelGuessGame
        isActive={fuelGameActive}
        onClose={() => setFuelGameActive(false)}
        adminKey={adminKey}
        players={players}
      />
    </div>
  );
}

// Экспорт компонента для игроков
export { FuelGameClient };