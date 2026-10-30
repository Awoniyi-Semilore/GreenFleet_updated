import React from 'react'

export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-surface-muted border border-border-subtle rounded-btn p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.id ?? opt.value}
          type="button"
          onClick={() => onChange(opt.id ?? opt.value)}
          className={[
            'px-3.5 py-1.5 text-sm rounded-[6px] transition-all duration-150 font-medium',
            (opt.id ?? opt.value) === value
              ? 'bg-surface shadow-xs text-ink-900'
              : 'text-ink-500 hover:text-ink-900',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function PillTabs({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
            value === opt.value
              ? 'bg-brand-green text-white border-brand-green shadow-xs'
              : 'bg-white text-ink-600 border-border-subtle hover:border-ink-200 hover:text-ink-900',
          ].join(' ')}
        >
          {opt.label}
          {opt.count != null && (
            <span className={`ml-1.5 px-1.5 rounded-full text-2xs ${value === opt.value ? 'bg-white/25' : 'bg-surface-muted'}`}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
