import React from 'react'

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'
}

// Stable colour based on name hash so each person always gets the same colour
const PALETTES = [
  ['#D1FAE5', '#065F46'], // green
  ['#DBEAFE', '#1E40AF'], // blue
  ['#EDE9FE', '#5B21B6'], // purple
  ['#FEF3C7', '#92400E'], // amber
  ['#FCE7F3', '#9D174D'], // pink
  ['#CFFAFE', '#155E75'], // cyan
]

function palette(name = '') {
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length]
}

export default function Avatar({ name = '', size = 32 }) {
  const [bg, fg] = palette(name)
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0 select-none"
      style={{
        width:      size,
        height:     size,
        fontSize:   Math.round(size * 0.38),
        backgroundColor: bg,
        color:      fg,
        border:     `1.5px solid ${fg}22`,
      }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
