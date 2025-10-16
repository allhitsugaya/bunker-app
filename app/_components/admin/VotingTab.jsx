// app/admin/_components/VotingTab.jsx
'use client';
import { useState } from 'react';

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

export default function VotingTab({ adminKey, players, poll, counts, last, onDataUpdate }) {
  const [question, setQuestion] = useState('Кого исключаем из бункера?');
  const [mode, setMode] = useState('players');

  const totalVotes = Object.values(counts).reduce((s, n) => s + n, 0);

  const startPoll = async () => {
    if (!adminKey) return alert('Введите ADMIN_KEY');

    let candidates = [];
    if (mode === 'players') {
      candidates = players.filter(p => !p.excluded).map(p => p.id);
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
      await onDataUpdate();
      alert('🗳 Голосование запущено!');
    } catch (error) {
      alert('❌ Ошибка запуска голосования');
    }
  };

  const closePoll = async () => {
    if (!adminKey) return alert('Введите ADMIN_KEY');
    try {
      await fetchJSON('/api/polls/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ policy: 'most' })
      });
      await onDataUpdate();
      alert('⏹ Голосование завершено!');
    } catch (error) {
      alert('❌ Ошибка завершения голосования');
    }
  };

  const nameById = (id) => players.find(p => p.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400">🗳 Система голосования</h2>

      {poll && (
        <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-green-300 mb-1">Активное голосование</h3>
              <p className="text-green-200/60">Вопрос: {poll.question}</p>
            </div>
            <button
              onClick={closePoll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              ⏹️ Завершить голосование
            </button>
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

            <button
              onClick={startPoll}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-bold rounded-lg transition-colors"
            >
              🚀 Начать голосование
            </button>
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
  );
}