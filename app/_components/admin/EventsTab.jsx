// app/admin/_components/EventsTab.jsx
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

export default function EventsTab({ adminKey, activeEvents, onDataUpdate }) {
  const [eventMessage, setEventMessage] = useState('');
  const [selectedCrisis, setSelectedCrisis] = useState('radiation');
  const [crisisIntensity, setCrisisIntensity] = useState('medium');
  const [gamePhase, setGamePhase] = useState('preparation');

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

  const sendGlobalEvent = async () => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка отправки события');
    }
  };

  const triggerCrisis = async (crisisType = selectedCrisis, intensity = crisisIntensity) => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка активации кризиса');
    }
  };

  const triggerQuickEvent = async (eventType) => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка активации события');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await fetchJSON(`/api/events?id=${eventId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });

      alert('✅ Событие удалено');
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка удаления события');
    }
  };

  const changeGamePhase = async (phase) => {
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
      onDataUpdate();
    } catch (error) {
      alert('❌ Ошибка смены фазы');
    }
  };

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

  return (
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
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
                  >
                    🗑️ Удалить
                  </button>
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
            <button
              onClick={sendGlobalEvent}
              disabled={!eventMessage.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📢 Отправить уведомление
            </button>
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
            <button
              onClick={() => triggerCrisis()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🔥 Активировать кризис
            </button>
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
  );
}