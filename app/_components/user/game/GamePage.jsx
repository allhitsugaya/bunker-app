// app/game/page.jsx - ОБНОВЛЕННАЯ
'use client';

import ScenariosGrid from '@/app/_components/user/ScenariosGrid';
import GameLayout from '@/app/_components/user/game/GameLayout';
import EnhancedControlPanel from '@/app/_components/user/game/EnhancedControlPanel';
import AdminPanel from '@/app/_components/user/AdminPanel';
import EventsDisplay from '@/app/_components/user/game/EventsDisplay';
import RevelationPanel from '@/app/_components/user/game/RevelationPanel';
import PlayersGrid from '@/app/_components/user/game/PlayersGrid';
import EnhancedVotingPanel from '@/app/_components/user/game/EnhancedVotingPanel';
import GameHeader from '@/app/_components/user/game/GameHeader';

export default function GamePage() {
  return (
    <GameLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <GameHeader />
          <EnhancedControlPanel />
          <AdminPanel />
          <EventsDisplay />
          <RevelationPanel />
          <PlayersGrid />
          <EnhancedVotingPanel />
        </div>
        <ScenariosGrid />
      </div>
    </GameLayout>
  );
}