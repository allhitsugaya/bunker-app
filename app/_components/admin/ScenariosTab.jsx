// app/admin/_components/ScenariosTab.jsx
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

export default function ScenariosTab({ adminKey, onDataUpdate }) {
  const [selectedScenario, setSelectedScenario] = useState('');

  const assignScenario = async () => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка установки сценария');
    }
  };

  const getScenarioName = (scenario) => {
    const scenarios = {
      bunker: '🏠 Стационарный бункер',
      nomad: '🚌 Бронеавтобус "Номад"',
      station: '🛰️ Орбитальная станция',
      submarine: '🚤 Подводная лодка'
    };
    return scenarios[scenario] || scenario;
  };

  return (
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
            <button
              onClick={assignScenario}
              disabled={!selectedScenario}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🎯 Применить сценарий
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
          <h3 className="text-lg font-bold text-green-300 mb-4">Параметры игры</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-green-300 mb-2">Сложность</label>
              <select className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300">
                <option>🎯 Нормальная</option>
                <option>⚠️ Сложная</option>
                <option>🔥 Выживание</option>
                <option>☢️ Адская</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-300 mb-2">Продолжительность</label>
              <select className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-emerald-700 text-green-300">
                <option>⏱️ Короткая (2-3 ч)</option>
                <option>🕒 Средняя (4-5 ч)</option>
                <option>⏳ Длинная (6+ ч)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
        <h3 className="text-lg font-bold text-green-300 mb-4">Описания сценариев</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-900/50 border border-emerald-800/30">
            <h4 className="font-bold text-emerald-400 mb-2">🏠 Стационарный бункер</h4>
            <p className="text-green-200/80 text-sm">Классический сценарий выживания в подземном убежище с ограниченными
              ресурсами.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-emerald-800/30">
            <h4 className="font-bold text-emerald-400 mb-2">🚌 Бронеавтобус "Номад"</h4>
            <p className="text-green-200/80 text-sm">Путешествие по постапокалиптическим землям на мобильной базе.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-emerald-800/30">
            <h4 className="font-bold text-emerald-400 mb-2">🛰️ Орбитальная станция</h4>
            <p className="text-green-200/80 text-sm">Выживание на космической станции с ограниченным воздухом и
              энергией.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-emerald-800/30">
            <h4 className="font-bold text-emerald-400 mb-2">🚤 Подводная лодка</h4>
            <p className="text-green-200/80 text-sm">Клаустрофобный сценарий в подводной лодке на глубине океана.</p>
          </div>
        </div>
      </div>
    </div>
  );
}