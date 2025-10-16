// app/game/_components/EventsDisplay.jsx
'use client';
import { useGame } from './GameLayout';

export default function EventsDisplay() {
  const { events } = useGame();

  if (!events || events.length === 0) return null;

  const getEventColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'border-red-500/50 bg-red-900/20';
      case 'medium':
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low':
        return 'border-blue-500/50 bg-blue-900/20';
      default:
        return 'border-emerald-500/50 bg-emerald-900/20';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'crisis':
        return '🔥';
      case 'notification':
        return '📢';
      case 'resource_change':
        return '📦';
      case 'phase_change':
        return '🔄';
      case 'scenario_change':
        return '🎭';
      default:
        return '⚡';
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-800/40 bg-gray-900 p-6">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        📢 Активные события
        <span className="text-sm text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full">
          {events.length}
        </span>
      </h3>

      <div className="grid gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-4 rounded-xl border-2 ${getEventColor(event.severity)} backdrop-blur-sm transition-all duration-300`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-green-300 mb-1">
                  {event.title}
                </h4>
                <p className="text-green-200/90 text-sm mb-2">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-green-200/60">
                  <span>Тип: {event.type}</span>
                  <span>Создано: {new Date(event.createdAt).toLocaleTimeString()}</span>
                  {event.expiresAt && (
                    <span>Истекает: {new Date(event.expiresAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>

            {event.effects && event.effects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-800/30">
                <div className="flex flex-wrap gap-2">
                  {event.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs bg-gray-800/50 border border-emerald-700/30 text-green-300"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}