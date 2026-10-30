import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Inbox, Plus, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Button from '../../components/Button.jsx'
import { getRequests } from '../../data/api.js'
import { useQuery } from '../../context/QueryCache.jsx'

const TIME_FILTERS = [
  { value: 'all',   label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

function withinFilter(dateStr, filter) {
  if (filter === 'all') return true
  const d = new Date(dateStr)
  const now = new Date()
  if (filter === 'today') return d.toDateString() === now.toDateString()
  const days = (now - d) / 86_400_000
  if (filter === 'week')  return days <= 7
  if (filter === 'month') return days <= 31
  return true
}

const STATUS_MAP = {
  PENDING:              'Pending',
  PENDING_LINE_MANAGER: 'Pending',
  PENDING_ADMIN:        'Pending',
  APPROVED:             'Approved',
  ASSIGNED:             'Approved',
  REJECTED:             'Rejected',
  COMPLETED:            'Completed',
  CANCELLED:            'Cancelled',
  IN_USE:               'In Progress',
  DRIVER_SPOTTED:       'In Progress',
  BOARDED_WAITING:      'In Progress',
}

export default function MyRequests() {
  usePageMeta({ title: 'My Requests', breadcrumb: 'Staff Portal' })
  const navigate = useNavigate()
  const [params]  = useSearchParams()
  const [filter,  setFilter] = useState('all')

  const { data: requests = [], loading, error } = useQuery('staff-requests', getRequests, { ttl: 30_000 })

  const statusFilter = params.get('status')

  const filtered = useMemo(() => {
    let list = requests.filter((r) => withinFilter(r.created_at || r.createdAt, filter))
    if (statusFilter) {
      const map = {
        Pending:     ['PENDING','PENDING_LINE_MANAGER','PENDING_ADMIN'],
        Approved:    ['APPROVED','ASSIGNED'],
        'In Progress':['IN_USE','DRIVER_SPOTTED','BOARDED_WAITING'],
        Completed:   ['COMPLETED'],
        Rejected:    ['REJECTED'],
        Cancelled:   ['CANCELLED'],
      }
      const allowed = map[statusFilter] || [statusFilter]
      list = list.filter((r) => allowed.includes(r.status))
    }
    return list
  }, [requests, filter, statusFilter])

  const columns = [
    { key: 'id',          label: '#',          mono: true,  width: '70px' },
    { key: 'date',        label: 'Date',        render: (r) => r.departure_date || new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) },
    { key: 'destination', label: 'Destination', render: (r) => r.destination || r.pickup_location },
    { key: 'driver',      label: 'Driver',      dim: true,   render: (r) => r.driver?.name || r.driver_name || '—' },
    { key: 'vehicle',     label: 'Vehicle',     mono: true,  dim: true, render: (r) => r.vehicle?.plate_number || r.vehicle?.plate || '—' },
    { key: 'status',      label: 'Status',      render: (r) => <StatusPill status={STATUS_MAP[r.status] || r.status} /> },
  ]

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error?.message || 'Failed to load requests'}
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-surface border border-border-subtle rounded-card shadow-card px-4 py-3">
        <PillTabs options={TIME_FILTERS} value={filter} onChange={setFilter} />
        <Button icon={Plus} size="sm" onClick={() => navigate('/staff/new-request')}>
          New Request
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            message="No requests found."
            action={<Button size="sm" icon={Plus} onClick={() => navigate('/staff/new-request')}>New Request</Button>}
          />
        ) : filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(`/staff/requests/${r.id}`)}
            className="bg-surface border border-border-subtle rounded-card shadow-card p-4 cursor-pointer active:bg-surface-muted transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xs font-mono text-ink-300 bg-surface-muted px-2 py-0.5 rounded">#{r.id}</span>
              <StatusPill status={STATUS_MAP[r.status] || r.status} />
            </div>
            <p className="text-sm font-semibold text-ink-900 flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-brand-green shrink-0" />
              <span className="truncate">{r.destination || r.pickup_location || '—'}</span>
            </p>
            <div className="flex items-center justify-between text-xs text-ink-400 mt-2">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {r.departure_date || new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-0.5 text-brand-green font-medium">
                Details <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <Table
          columns={columns}
          rows={filtered}
          onRowClick={(r) => navigate(`/staff/requests/${r.id}`)}
          emptyState={
            <EmptyState
              icon={Inbox}
              message="No requests found for this period."
              action={<Button size="sm" icon={Plus} onClick={() => navigate('/staff/new-request')}>New Request</Button>}
            />
          }
        />
      </div>
    </div>
  )
}
