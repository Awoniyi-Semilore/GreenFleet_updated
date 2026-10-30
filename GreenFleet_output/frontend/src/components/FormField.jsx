import React from 'react'

const base = [
  'w-full rounded-btn border bg-white px-3 py-2 text-sm text-ink-900 outline-none',
  'transition-colors duration-150 placeholder:text-ink-300',
  'focus:border-brand-green focus:ring-2 focus:ring-brand-green/10',
].join(' ')

const errorBorder   = 'border-status-rejected focus:border-status-rejected focus:ring-red-100'
const defaultBorder = 'border-border-subtle hover:border-border'

export function Field({ label, htmlFor, error, helper, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
          {required && <span className="text-status-rejected ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-status-rejected mt-1.5 flex items-center gap-1">{error}</p>
      ) : helper ? (
        <p className="text-xs text-ink-400 mt-1.5">{helper}</p>
      ) : null}
    </div>
  )
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={[base, error ? errorBorder : defaultBorder, className].join(' ')}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[base, 'resize-none', error ? errorBorder : defaultBorder, className].join(' ')}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={[base, error ? errorBorder : defaultBorder, 'cursor-pointer', className].join(' ')}
      {...props}
    >
      {children}
    </select>
  )
}

export function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-400 mb-1.5">{label}</p>
      <div className="rounded-btn bg-surface-muted border border-border-subtle px-3 py-2 text-sm text-ink-700 min-h-[36px]">
        {value || <span className="text-ink-300">—</span>}
      </div>
    </div>
  )
}
