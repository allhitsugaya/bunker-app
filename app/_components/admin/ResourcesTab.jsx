// app/admin/_components/ResourcesTab.jsx
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

export default function ResourcesTab({ adminKey, onDataUpdate }) {
  const [resourceModifier, setResourceModifier] = useState(0);

  const modifyResources = async () => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка изменения ресурсов');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400">📦 Управление ресурсами</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
          <h3 className="text-lg font-bold text-green-300 mb-4">Модификатор ресурсов</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-green-300 mb-2">
                Изменение запасов: {resourceModifier}%
              </label>
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
            <button
              onClick={modifyResources}
              disabled={resourceModifier === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📊 Применить изменения
            </button>
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

      <div className="rounded-xl border border-emerald-700/50 bg-gray-800/30 p-5">
        <h3 className="text-lg font-bold text-green-300 mb-4">Текущие ресурсы</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: '🍖 Еда', value: '75%', color: 'emerald' },
            { name: '💧 Вода', value: '60%', color: 'blue' },
            { name: '💊 Медицина', value: '45%', color: 'red' },
            { name: '⚡ Энергия', value: '80%', color: 'yellow' }
          ].map((resource, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-gray-900/50 border border-emerald-800/30">
              <div className="text-2xl mb-2">{resource.name.split(' ')[0]}</div>
              <div className="text-lg font-bold text-green-400">{resource.value}</div>
              <div className="text-sm text-green-200/60">{resource.name.split(' ')[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}