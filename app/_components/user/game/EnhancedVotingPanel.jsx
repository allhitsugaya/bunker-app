// app/game/_components/EnhancedVotingPanel.jsx
'use client';
import { useMemo } from 'react';
import { useGame } from '@/app/_components/user/game/GameLayout';

function CandidateCard({ candidate, votes, totalVotes, isSelected, onVote, rank }) {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-400';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-600 to-red-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div
      className={`group relative p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-500 hover:scale-105 ${
        isSelected
          ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 shadow-2xl shadow-cyan-500/25'
          : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-emerald-400/50'
      }`}>

      {/* Рейтинг */}
      {rank <= 3 && totalVotes > 0 && (
        <div
          className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {rank}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-lg ${
            isSelected
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            {candidate.profession?.includes('Врач') ? '👨‍⚕️' : '👤'}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg">{candidate.name}</h4>
            <p className="text-gray-400 text-sm">{candidate.profession || 'Участник'}</p>
          </div>
        </div>

        <button
          onClick={() => onVote(candidate.id)}
          className={`px-5 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 ${
            isSelected
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-gray-700 text-gray-300 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-cyan-500 hover:text-white'
          }`}
        >
          {isSelected ? '✅ Ваш выбор' : '🗳 Голосовать'}
        </button>
      </div>

      {/* Статистика голосов */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Голосов:</span>
          <span className="font-bold text-white">{votes} / {totalVotes}</span>
        </div>

        {/* Анимированный прогресс-бар */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Прогресс</span>
          <span className={`font-bold ${
            percentage > 50 ? 'text-emerald-400' : 'text-cyan-400'
          }`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedVotingPanel() {
  const {
    poll,
    pollCounts,
    myVote,
    pollLast,
    adminKey,
    playerId,
    pollCandidates,
    nameById,
    startPoll,
    castVote,
    closePoll
  } = useGame();

  const totalVotes = useMemo(
    () => (pollCounts ? Object.values(pollCounts).reduce((s, n) => s + n, 0) : 0),
    [pollCounts]
  );

  // Сортируем кандидатов по количеству голосов
  const sortedCandidates = useMemo(() => {
    return [...pollCandidates].sort((a, b) => {
      const votesA = pollCounts?.[a.id] || 0;
      const votesB = pollCounts?.[b.id] || 0;
      return votesB - votesA;
    });
  }, [pollCandidates, pollCounts]);

  if (!poll) {
    return (
      <div
        className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-lg border border-white/10">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">Голосование не запущено</h3>
          <p className="text-gray-500 mb-4">Ожидайте начала голосования от ведущего</p>
          {adminKey && (
            <button
              onClick={startPoll}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Запустить голосование
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-lg border border-white/10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3
            className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            🗳 Активное голосование
          </h3>
          <p className="text-gray-400 mt-1">Решите, кто останется в бункере</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{totalVotes}</div>
            <div className="text-gray-400 text-sm">всего голосов</div>
          </div>

          {adminKey && (
            <button
              onClick={closePoll}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold px-4 py-2 rounded-xl transition-all duration-300"
            >
              ⏹ Завершить
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Кандидаты */}
        <div className="space-y-4">
          <h4 className="font-bold text-white text-lg flex items-center gap-2">
            <span>🎯 Кандидаты</span>
            <span className="text-sm text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
              {sortedCandidates.length} участников
            </span>
          </h4>

          {sortedCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              votes={pollCounts?.[candidate.id] || 0}
              totalVotes={totalVotes}
              isSelected={myVote === candidate.id}
              onVote={castVote}
              rank={index + 1}
            />
          ))}
        </div>

        {/* Статистика */}
        <div className="space-y-6">
          <h4 className="font-bold text-white text-lg">📊 Статистика</h4>

          <div
            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{totalVotes}</div>
              <div className="text-gray-400">всего голосов</div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-white">Распределение голосов:</h5>
            {Object.entries(pollCounts || {})
              .sort(([, a], [, b]) => b - a)
              .map(([id, count], index) => {
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                return (
                  <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-gray-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-orange-500 text-white' :
                              'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{nameById(id)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-bold">{count}</span>
                      <span className="text-gray-400 text-sm w-12 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {myVote && (
            <div
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <div className="text-center">
                <div className="text-emerald-400 font-bold mb-1">✅ Ваш выбор</div>
                <div className="text-white text-lg">{nameById(myVote)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}