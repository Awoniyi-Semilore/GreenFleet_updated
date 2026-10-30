import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:         'bg-brand-green text-white border border-brand-green hover:bg-brand-green-700 shadow-xs active:scale-[0.98]',
  secondary:       'bg-white text-brand-green border border-brand-green hover:bg-brand-green-50 active:scale-[0.98]',
  destructive:     'bg-white text-status-rejected border border-status-rejected hover:bg-red-50 active:scale-[0.98]',
  destructiveSolid:'bg-status-rejected text-white border border-status-rejected hover:bg-red-800 shadow-xs active:scale-[0.98]',
  tertiary:        'bg-transparent text-ink-600 border border-transparent hover:bg-surface-muted',
  ghost:           'bg-surface-muted text-ink-700 border border-border-subtle hover:border-border hover:bg-surface-hover active:scale-[0.98]',
  lime:            'bg-brand-lime text-brand-green-900 border border-brand-lime hover:opacity-90 shadow-xs active:scale-[0.98]',
}

const SIZES = {
  xs: 'text-xs px-2.5 py-1.5 gap-1.5',
  sm: 'text-xs px-3 py-2 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Button({
  variant  = 'primary',
  size     = 'md',
  className = '',
  loading  = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconRight,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size]       || SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading
        ? <Loader2 size={14} className="animate-spin shrink-0" />
        : Icon
        ? <Icon size={14} className="shrink-0" />
        : null
      }
      {children}
      {iconRight && !loading && <iconRight size={14} className="shrink-0" />}
    </button>
  )
}
