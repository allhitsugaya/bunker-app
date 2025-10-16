// app/game/_components/RevelationPanel.jsx
'use client';
import { useGame } from './GameLayout';
import CustomCheckbox from '@/app/_components/ui/CustomCheckbox';
import Button from '@/app/_components/ui/Button';


export default function RevelationPanel() {
  const {
    playerId,
    mask,
    me,
    selectedCount,
    FIELD_LABELS,
    FIELD_CATEGORIES,
    CATEGORY_LABELS,
    revealSelf,
    hideSelf,
    toggleCheckbox,
    selectAll
  } = useGame();

  if (!playerId) return null;

  return (
    <div className="rounded-2xl border border-emerald-800/40 p-6 bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h4 className="font-bold text-lg text-green-400 mb-1">Управление раскрытием</h4>
          <div className="text-sm text-green-200/60">
            playerId: <span className="text-green-400 font-mono">{playerId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">
            Выбрано: {selectedCount} / {Object.keys(FIELD_LABELS).length}
          </div>
          <Button onClick={selectAll} variant="ghost" size="small">
            {selectedCount === Object.keys(FIELD_LABELS).length ? '❌ Снять все' : '✅ Выбрать все'}
          </Button>
        </div>
      </div>

      {/* Категории характеристик */}
      <div className="space-y-4">
        {Object.entries(FIELD_CATEGORIES).map(([category, fields]) => (
          <div key={category}>
            <h5 className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">
              {CATEGORY_LABELS[category]}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {fields.map((k) => (
                <CustomCheckbox
                  key={k}
                  checked={mask[k]}
                  onChange={() => toggleCheckbox(k)}
                  label={FIELD_LABELS[k]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-emerald-800/30">
        <Button
          onClick={revealSelf}
          variant="primary"
          disabled={selectedCount === 0}
          className="flex-1"
        >
          👁 Открыть выбранное ({selectedCount})
        </Button>
        <Button
          onClick={hideSelf}
          variant="secondary"
          className="flex-1"
        >
          🕶 Скрыть все
        </Button>
      </div>

      {/* Мои полные характеристики */}
      {me && (
        <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-emerald-800/30">
          <div className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
            <span>🌟 Твои полные характеристики</span>
            <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
              Видишь только ты
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(FIELD_LABELS).map((k) => (
              <div key={`me-${k}`} className="text-sm">
                <div className="text-green-200/60 text-xs uppercase tracking-wide">
                  {FIELD_LABELS[k]}
                </div>
                <div className="text-green-200 font-medium mt-1">
                  {me[k] ?? <span className="text-gray-500">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}