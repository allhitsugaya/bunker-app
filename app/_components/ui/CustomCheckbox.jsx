// app/game/_components/ui/CustomCheckbox.jsx
'use client';

export default function CustomCheckbox({ checked, onChange, label, description }) {
  return (
    <label
      className="flex items-start gap-3 p-3 rounded-lg border border-emerald-800/30 bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div className="flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
          }} // Пустой обработчик, т.к. управляем через label
          className="hidden"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? 'bg-emerald-500 border-emerald-500'
            : 'bg-gray-700 border-emerald-700 group-hover:border-emerald-600'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-green-300">{label}</div>
        {description && (
          <div className="text-xs text-green-200/60 mt-1">{description}</div>
        )}
      </div>
    </label>
  );
}