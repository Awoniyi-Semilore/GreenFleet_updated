import React from 'react'

const STATUS_MAP = {
  /* Transport request states */
  pending:              { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  'pending review':     { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  'pending line manager':{ bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  'pending admin':      { bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
  approved:             { bg: '#D1FAE5', fg: '#065F46', dot: '#059669' },
  'driver assigned':    { bg: '#EDE9FE', fg: '#5B21B6', dot: '#7C3AED' },
  assigned:             { bg: '#EDE9FE', fg: '#5B21B6', dot: '#7C3AED' },
  'driver spotted':     { bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
  boarded:              { bg: '#F3E8FF', fg: '#6B21A8', dot: '#9333EA' },
  'in progress':        { bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
  completed:            { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  rejected:             { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
  cancelled:            { bg: '#F3F4F6', fg: '#374151', dot: '#9CA3AF' },
  /* Vehicle / driver states */
  available:            { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  active:               { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  'in use':             { bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
  maintenance:          { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  waiting:              { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  returning:            { bg: '#EDE9FE', fg: '#5B21B6', dot: '#7C3AED' },
  'off duty':           { bg: '#F3F4F6', fg: '#374151', dot: '#9CA3AF' },
  deactivated:          { bg: '#F3F4F6', fg: '#374151', dot: '#9CA3AF' },
  inactive:             { bg: '#F3F4F6', fg: '#374151', dot: '#9CA3AF' },
  /* Priority */
  low:                  { bg: '#F0FDF4', fg: '#166534', dot: '#22C55E' },
  normal:               { bg: '#F0F9FF', fg: '#0369A1', dot: '#0EA5E9' },
  high:                 { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  'high urgent':        { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
  /* Misc */
  open:                 { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  resolved:             { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  overdue:              { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
  'due soon':           { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  'up to date':         { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  success:              { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  failed:               { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
}

export default function StatusPill({ status, label }) {
  const key = (status || '').toLowerCase().trim()
  const cfg = STATUS_MAP[key] || { bg: '#F3F4F6', fg: '#374151', dot: '#9CA3AF' }
  const text = label || status || '—'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {text}
    </span>
  )
}
