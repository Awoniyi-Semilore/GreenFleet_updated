import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Clock, CheckCircle2, ListChecks, Plus, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getRequests } from '../../data/api.js'
import { useQuery } from '../../context/QueryCache.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const STATUS_MAP = {
  PENDING:              'Pending',
  PENDING_LINE_MANAGER: 'Pending',
  PENDING_ADMIN:        'Pending',
  APPROVED:             'Approved',
  REJECTED:             'Rejected',
  COMPLETED:            'Completed',
  CANCELLED:            'Cancelled',
  IN_USE:               'In Progress',
  ASSIGNED:             'Approved',
  DRIVER_SPOTTED:       'In Progress',
  BOARDED_WAITING:      'In Progress',
}

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function StaffDashboard() {
  usePageMeta({ title: 'Dashboard', breadcrumb: 'Staff Portal' })
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: requestsData, loading } = useQuery(
    'staff-requests',
    getRequests,
    { ttl: 30_000 }
  )

  const requests = Array.isArray(requestsData) ? requestsData : []

  const stats = useMemo(() => ({
    active:    requests.filter((r) => ['IN_USE','ASSIGNED','DRIVER_SPOTTED','BOARDED_WAITING'].includes(r.status)).length,
    pending:   requests.filter((r) => r.status?.includes('PENDING')).length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
    total:     requests.length,
  }), [requests])

  const recent = requests.slice(0, 6)
  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there'

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Good day, {firstName} 👋</h2>
          <p className="text-sm text-ink-400 mt-0.5">Here's a summary of your transport requests.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/staff/new-request')}>
          New Request
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Car}          label="Active"    value={stats.active}    tone="blue"  onClick={() => navigate('/staff/my-requests')} />
        <StatCard icon={Clock}        label="Pending"   value={stats.pending}   tone="amber" onClick={() => navigate('/staff/my-requests')} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="green" onClick={() => navigate('/staff/my-requests')} />
        <StatCard icon={ListChecks}   label="Total"     value={stats.total}     tone="lime"  onClick={() => navigate('/staff/my-requests')} />
      </div>

      {/* Recent requests */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-ink-900">Recent Requests</h3>
          <button
            onClick={() => navigate('/staff/my-requests')}
            className="text-xs font-medium text-brand-green hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={Car}
            message="No transport requests yet."
            action={<Button icon={Plus} size="sm" onClick={() => navigate('/staff/new-request')}>Make your first request</Button>}
          />
        ) : (
          <div className="divide-y divide-border-subtle">
            {recent.map((r) => {
              const mappedStatus = STATUS_MAP[r.status] || r.status
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/staff/requests/${r.id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface-muted transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-2xs font-mono text-ink-300">#{r.id}</span>
                      <p className="text-sm font-medium text-ink-900 truncate">{r.destination || r.pickup_location || '—'}</p>
                    </div>
                    <p className="text-xs text-ink-400 truncate">
                      {r.pickup_location} · {fmt(r.departure_date || r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={mappedStatus} />
                    <ArrowRight size={14} className="text-ink-200 group-hover:text-ink-500 transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
