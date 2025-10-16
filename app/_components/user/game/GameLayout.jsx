'use client';
import { createContext, useContext } from 'react';
import { useGameState } from '@/app/_components/user/hooks/useGameState';

const GameContext = createContext();

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameLayout');
  }
  return context;
}

export default function GameLayout({ children }) {
  const gameState = useGameState();

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}