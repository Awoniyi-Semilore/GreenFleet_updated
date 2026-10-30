import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Search, Calendar, MapPin, ArrowRight, RefreshCw } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getTransportRequests } from '../../data/api.js'
import { useQuery } from '../../context/QueryCache.jsx'

const STATUS_FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

const DISPLAY = {
  PENDING:              'Pending',
  PENDING_LINE_MANAGER: 'Pending (Manager)',
  PENDING_ADMIN:        'Pending (Admin)',
  APPROVED:             'Approved',
  ASSIGNED:             'Driver Assigned',
  DRIVER_SPOTTED:       'Driver Spotted',
  BOARDED_WAITING:      'Boarded',
  COMPLETED:            'Completed',
  REJECTED:             'Rejected',
  CANCELLED:            'Cancelled',
}

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })
}

export default function TransportRequests() {
  usePageMeta({ title: 'Requests', breadcrumb: 'Transport' })
  const navigate = useNavigate()
  const [tab,    setTab]    = useState('all')
  const [search, setSearch] = useState('')

  const { data: requests = [], loading, error, refetch } = useQuery(
    'transport-requests', getTransportRequests, { ttl: 30_000 }
  )

  const filtered = useMemo(() => requests.filter((r) => {
    const matchTab =
      tab === 'all'       ? true :
      tab === 'pending'   ? r.status?.includes('PENDING') :
      tab === 'active'    ? ['APPROVED','ASSIGNED','DRIVER_SPOTTED','BOARDED_WAITING'].includes(r.status) :
      tab === 'completed' ? r.status === 'COMPLETED' : true

    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(r.id).includes(q) ||
      r.destination?.toLowerCase().includes(q) ||
      r.pickup_location?.toLowerCase().includes(q) ||
      r.requester?.first_name?.toLowerCase().includes(q) ||
      r.requester?.last_name?.toLowerCase().includes(q)

    return matchTab && matchSearch
  }), [requests, tab, search])

  const columns = [
    { key: 'id',          label: '#',          mono: true, width: '64px', sortable: true },
    { key: 'requester',   label: 'Requester',  render: (r) => r.requester
        ? `${r.requester.first_name || ''} ${r.requester.last_name || ''}`.trim()
        : r.staff_name || '—' },
    { key: 'destination', label: 'Destination', render: (r) => r.destination || r.pickup_location || '—' },
    { key: 'date',        label: 'Date',        render: (r) => fmt(r.departure_date || r.created_at), sortable: true },
    { key: 'priority',    label: 'Priority',    render: (r) => <StatusPill status={(r.priority || 'normal').toLowerCase()} /> },
    { key: 'status',      label: 'Status',      render: (r) => <StatusPill status={DISPLAY[r.status] || r.status} /> },
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
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span className="flex-1">{error?.message || 'Failed to load requests'}</span>
          <button onClick={refetch} className="flex items-center gap-1 text-xs font-medium underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5">
          <PillTabs options={STATUS_FILTERS} value={tab} onChange={setTab} />
          <div className="relative flex-1 sm:max-w-xs ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Search name, destination…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 border border-border-subtle rounded-btn bg-surface-muted focus:bg-white outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all placeholder:text-ink-300"
            />
          </div>
          {loading && <RefreshCw size={14} className="text-ink-300 animate-spin shrink-0" />}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {filtered.length === 0
          ? <EmptyState icon={Inbox} message="No requests match your filters." />
          : filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/transport/requests/${r.id}`)}
              className="bg-surface border border-border-subtle rounded-card shadow-card p-4 cursor-pointer active:bg-surface-muted transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xs font-mono text-ink-300 bg-surface-muted px-2 py-0.5 rounded">#{r.id}</span>
                <StatusPill status={DISPLAY[r.status] || r.status} />
              </div>
              <p className="text-sm font-semibold text-ink-900 mb-0.5">
                {r.requester ? `${r.requester.first_name || ''} ${r.requester.last_name || ''}`.trim() : r.staff_name || '—'}
              </p>
              <p className="text-xs text-ink-500 flex items-center gap-1 mb-2">
                <MapPin size={11} className="text-ink-300" />
                {r.destination || r.pickup_location || '—'}
              </p>
              <div className="flex items-center justify-between text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {fmt(r.departure_date || r.created_at)}
                </span>
                <span className="flex items-center gap-0.5 text-brand-green font-medium">
                  Review <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))
        }
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <Table
          columns={columns}
          rows={filtered}
          onRowClick={(r) => navigate(`/transport/requests/${r.id}`)}
          emptyState={<EmptyState icon={Inbox} message="No requests match your filters." />}
        />
      </div>
    </div>
  )
}
