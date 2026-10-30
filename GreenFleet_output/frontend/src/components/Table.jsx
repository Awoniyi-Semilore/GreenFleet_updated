import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function Table({
  columns,
  rows,
  onRowClick,
  rowKey       = 'id',
  emptyState   = null,
  zebra        = false,
  selectable   = false,
  selectedKeys = [],
  onToggleSelect,
  onToggleSelectAll,
  loading      = false,
}) {
  const [sort, setSort] = useState(null)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const { key, dir } = sort
    return [...rows].sort((a, b) => {
      const av = a[key], bv = b[key]
      if (av == null) return 1
      if (bv == null) return -1
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ?  1 : -1
      return 0
    })
  }, [rows, sort])

  function handleSort(col) {
    if (!col.sortable) return
    setSort((prev) =>
      !prev || prev.key !== col.key ? { key: col.key, dir: 'asc' } :
      prev.dir === 'asc'            ? { key: col.key, dir: 'desc' } :
      null
    )
  }

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return emptyState || <div className="py-14 text-center text-sm text-ink-400">Nothing to show.</div>
  }

  const allSelected = selectable && rows.length > 0 && selectedKeys.length === rows.length

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-border-subtle">
            {selectable && (
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                  className="accent-brand-green rounded"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                style={col.width ? { width: col.width } : undefined}
                className={[
                  'px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-ink-400 whitespace-nowrap select-none',
                  col.sortable ? 'cursor-pointer hover:text-ink-700' : '',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sort?.key === col.key && (
                    sort.dir === 'asc'
                      ? <ChevronUp   size={11} className="text-brand-green" />
                      : <ChevronDown size={11} className="text-brand-green" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, ri) => {
            const key     = row[rowKey] ?? ri
            const checked = selectedKeys.includes(key)
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={[
                  'border-b border-border-subtle last:border-b-0 transition-colors duration-100',
                  onRowClick ? 'cursor-pointer hover:bg-brand-green-50' : '',
                  zebra && ri % 2 === 1 ? 'bg-surface-muted' : '',
                ].join(' ')}
              >
                {selectable && (
                  <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect?.(key)}
                      className="accent-brand-green rounded"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'px-4 py-3 align-middle text-ink-700',
                      col.mono ? 'font-mono text-xs text-ink-600' : '',
                      col.dim  ? 'text-ink-400' : '',
                    ].join(' ')}
                  >
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
