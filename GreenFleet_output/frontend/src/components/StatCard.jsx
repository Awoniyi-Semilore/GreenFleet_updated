import React from 'react'

const TONES = {
  green: { icon: 'bg-brand-green-100 text-brand-green', val: 'text-brand-green' },
  lime:  { icon: 'bg-brand-lime-100  text-[#4d7a10]',   val: 'text-[#4d7a10]'  },
  blue:  { icon: 'bg-blue-50 text-blue-600',             val: 'text-blue-700'   },
  amber: { icon: 'bg-amber-50 text-amber-600',           val: 'text-amber-700'  },
  red:   { icon: 'bg-red-50 text-red-600',               val: 'text-red-700'    },
}

export default function StatCard({ icon: Icon, label, value, tone = 'green', onClick, trend }) {
  const t = TONES[tone] || TONES.green
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={[
        'group bg-surface border border-border-subtle rounded-card shadow-card text-left w-full p-4 transition-all duration-150',
        onClick ? 'hover:border-brand-green hover:shadow-card-md cursor-pointer active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-medium text-ink-400 uppercase tracking-wider leading-none mb-2">{label}</p>
          <p className="text-2xl font-bold text-ink-900 leading-none">{value ?? '—'}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend > 0 ? 'text-brand-green' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${t.icon} transition-transform duration-150 group-hover:scale-110`}>
            <Icon size={17} />
          </div>
        )}
      </div>
    </Tag>
  )
}
