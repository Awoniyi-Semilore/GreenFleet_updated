import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, width = 480, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="relative bg-surface w-full sm:rounded-card shadow-card-lg max-h-[95dvh] sm:max-h-[90vh] overflow-y-auto animate-modal-in"
        style={{ maxWidth: width }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="pr-6">
            <h2 className="text-base font-semibold text-ink-900 leading-snug">{title}</h2>
            {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-ink-300 hover:text-ink-700 hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 pt-3 flex items-center justify-end gap-2.5 border-t border-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
