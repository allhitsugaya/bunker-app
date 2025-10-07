import { NextResponse } from 'next/server';

let activeGame = null;
let playerGuesses = [];

export async function POST(request) {
  try {
    const { playerName, guess, playerId } = await request.json();

    if (!activeGame) {
      return NextResponse.json({ error: 'Игра не активна' }, { status: 400 });
    }

    if (playerGuesses.some(g => g.playerId === playerId)) {
      return NextResponse.json({ error: 'Вы уже сделали догадку' }, { status: 400 });
    }

    if (guess < activeGame.range.min || guess > activeGame.range.max) {
      return NextResponse.json({ error: `Число должно быть от ${activeGame.range.min} до ${activeGame.range.max}` }, { status: 400 });
    }

    const guessResult = {
      id: Date.now(),
      playerName,
      playerId,
      guess: parseInt(guess),
      timestamp: new Date().toISOString(),
      isCorrect: parseInt(guess) === activeGame.targetNumber,
      hint: parseInt(guess) < activeGame.targetNumber ? 'greater' : parseInt(guess) > activeGame.targetNumber ? 'less' : 'correct'
    };

    playerGuesses.push(guessResult);

    return NextResponse.json({
      success: true,
      guess: guessResult,
      remainingAttempts: activeGame.attempts - playerGuesses.length
    });

  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function GET() {
  if (!activeGame) {
    return NextResponse.json({ error: 'Игра не активна' }, { status: 400 });
  }

  return NextResponse.json({
    game: {
      range: activeGame.range,
      attempts: activeGame.attempts,
      remainingAttempts: activeGame.attempts - playerGuesses.length
    },
    guesses: playerGuesses
  });
}

export async function PUT(request) {
  try {
    const { targetNumber, range, attempts } = await request.json();

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

    return NextResponse.json({ success: true, game: activeGame });

  } catch (error) {
    return NextResponse.json({ error: 'Ошибка запуска игры' }, { status: 500 });
  }
}

export async function DELETE() {
  activeGame = null;
  playerGuesses = [];
  return NextResponse.json({ success: true });
}