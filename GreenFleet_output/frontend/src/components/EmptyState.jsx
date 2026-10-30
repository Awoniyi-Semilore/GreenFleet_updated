import React from 'react'

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-11 h-11 rounded-2xl bg-surface-muted border border-border-subtle flex items-center justify-center mb-3">
          <Icon size={20} className="text-ink-300" />
        </div>
      )}
      {title && <p className="text-sm font-semibold text-ink-700 mb-1">{title}</p>}
      <p className="text-sm text-ink-400 max-w-xs leading-relaxed">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
