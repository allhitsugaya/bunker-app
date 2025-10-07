import { NextResponse } from 'next/server';

// In-memory storage (in production use database)
let activeGame = null;
let playerGuesses = [];

export async function POST(request) {
  try {
    const { playerName, guess, playerId } = await request.json();

    console.log('POST request received:', { playerName, guess, playerId });

    if (!activeGame) {
      console.log('No active game');
      return NextResponse.json({
        error: 'Игра не активна',
        code: 'GAME_NOT_ACTIVE'
      }, { status: 400 });
    }

    // Проверяем, не закончились ли попытки
    const guessesByThisPlayer = playerGuesses.filter(g => g.playerId === playerId);
    if (guessesByThisPlayer.length >= activeGame.attempts) {
      return NextResponse.json({
        error: 'Вы использовали все свои попытки',
        code: 'NO_MORE_ATTEMPTS'
      }, { status: 400 });
    }

    const guessNum = parseInt(guess);
    if (isNaN(guessNum)) {
      return NextResponse.json({
        error: 'Некорректное число',
        code: 'INVALID_NUMBER'
      }, { status: 400 });
    }

    if (guessNum < activeGame.range.min || guessNum > activeGame.range.max) {
      return NextResponse.json({
        error: `Число должно быть от ${activeGame.range.min} до ${activeGame.range.max}`,
        code: 'OUT_OF_RANGE'
      }, { status: 400 });
    }

    const guessResult = {
      id: Date.now(),
      playerName,
      playerId,
      guess: guessNum,
      timestamp: new Date().toISOString(),
      isCorrect: guessNum === activeGame.targetNumber,
      hint: guessNum < activeGame.targetNumber ? 'greater' : guessNum > activeGame.targetNumber ? 'less' : 'correct',
      attemptNumber: guessesByThisPlayer.length + 1
    };

    playerGuesses.push(guessResult);

    return NextResponse.json({
      success: true,
      guess: guessResult,
      remainingAttempts: activeGame.attempts - (guessesByThisPlayer.length + 1),
      totalAttempts: activeGame.attempts,
      usedAttempts: guessesByThisPlayer.length + 1
    });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Ошибка сервера',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!activeGame) {
      return NextResponse.json({
        error: 'Игра не активна',
        code: 'GAME_NOT_ACTIVE'
      }, { status: 400 });
    }

    // Группируем догадки по игрокам для подсчета использованных попыток
    const guessesByPlayer = playerGuesses.reduce((acc, guess) => {
      if (!acc[guess.playerId]) {
        acc[guess.playerId] = [];
      }
      acc[guess.playerId].push(guess);
      return acc;
    }, {});

    return NextResponse.json({
      game: {
        range: activeGame.range,
        attempts: activeGame.attempts,
        targetNumber: activeGame.targetNumber, // Только для отладки
        startedAt: activeGame.startedAt
      },
      guesses: playerGuesses,
      statistics: {
        totalGuesses: playerGuesses.length,
        uniquePlayers: Object.keys(guessesByPlayer).length,
        guessesByPlayer: guessesByPlayer
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Ошибка сервера',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { targetNumber, range, attempts } = await request.json();

    console.log('Starting new game:', { targetNumber, range, attempts });

    activeGame = {
      targetNumber: parseInt(targetNumber),
      range: {
        min: parseInt(range.min),
        max: parseInt(range.max)
      },
      attempts: parseInt(attempts),
      startedAt: new Date().toISOString()
    };

    playerGuesses = [];

    console.log('New game started:', activeGame);

    return NextResponse.json({
      success: true,
      game: activeGame
    });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Ошибка запуска игры',
      code: 'START_GAME_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('Ending game');
    activeGame = null;
    playerGuesses = [];

    return NextResponse.json({
      success: true,
      message: 'Игра завершена'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Ошибка завершения игры',
      code: 'END_GAME_ERROR'
    }, { status: 500 });
  }
}