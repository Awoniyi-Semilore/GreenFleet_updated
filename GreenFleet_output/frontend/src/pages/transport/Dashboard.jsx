import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Car, Users, Navigation, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getTransportRequests, getVehicles, getDrivers } from '../../data/api.js'
import { useQuery } from '../../context/QueryCache.jsx'

const DISPLAY = {
  PENDING:              'Pending',
  PENDING_LINE_MANAGER: 'Pending Manager',
  PENDING_ADMIN:        'Pending Admin',
  APPROVED:             'Approved',
  ASSIGNED:             'Assigned',
  DRIVER_SPOTTED:       'Driver Spotted',
  BOARDED_WAITING:      'Boarded',
  COMPLETED:            'Completed',
  REJECTED:             'Rejected',
  CANCELLED:            'Cancelled',
}

export default function TransportDashboard() {
  usePageMeta({ title: 'Dashboard', breadcrumb: 'Transport' })
  const navigate = useNavigate()

  const { data: requests = [], loading: loadR } = useQuery('transport-requests', getTransportRequests, { ttl: 30_000 })
  const { data: vehicles = [], loading: loadV } = useQuery('vehicles',           getVehicles,           { ttl: 60_000 })
  const { data: drivers  = [], loading: loadD } = useQuery('drivers',            getDrivers,            { ttl: 60_000 })

  const loading = loadR || loadV || loadD

  const stats = useMemo(() => ({
    pending:    requests.filter((r) => r.status?.includes('PENDING')).length,
    active:     requests.filter((r) => ['ASSIGNED','DRIVER_SPOTTED','BOARDED_WAITING'].includes(r.status)).length,
    vehicles:   vehicles.filter((v) => v.status === 'AVAILABLE').length,
    drivers:    drivers.filter((d)  => d.status === 'AVAILABLE' || d.status === 'ACTIVE').length,
    completed:  requests.filter((r) => r.status === 'COMPLETED').length,
  }), [requests, vehicles, drivers])

  const recentPending = requests
    .filter((r) => r.status?.includes('PENDING'))
    .slice(0, 5)

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Clock}        label="Pending"          value={stats.pending}   tone="amber" onClick={() => navigate('/transport/requests')} />
        <StatCard icon={Navigation}   label="Active Trips"     value={stats.active}    tone="blue"  onClick={() => navigate('/transport/active-trips')} />
        <StatCard icon={Car}          label="Avail. Vehicles"  value={stats.vehicles}  tone="green" onClick={() => navigate('/transport/vehicles')} />
        <StatCard icon={Users}        label="Avail. Drivers"   value={stats.drivers}   tone="lime"  onClick={() => navigate('/transport/drivers')} />
        <StatCard icon={CheckCircle2} label="Completed Today"  value={stats.completed} tone="green" onClick={() => navigate('/transport/requests')} />
      </div>

      {/* Pending requests table */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">Pending Requests</h3>
            {stats.pending > 0 && (
              <span className="text-2xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </div>
          <button onClick={() => navigate('/transport/requests')}
            className="text-xs font-medium text-brand-green hover:underline flex items-center gap-1">
            All requests <ArrowRight size={12} />
          </button>
        </div>

        {recentPending.length === 0 ? (
          <EmptyState icon={ClipboardList} message="No pending requests right now." />
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentPending.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/transport/requests/${r.id}`)}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface-muted transition-colors group"
              >
                <span className="text-2xs font-mono text-ink-300 shrink-0">#{r.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {r.requester
                      ? `${r.requester.first_name || ''} ${r.requester.last_name || ''}`.trim()
                      : r.staff_name || '—'}
                  </p>
                  <p className="text-xs text-ink-400 truncate">{r.destination || r.pickup_location}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={DISPLAY[r.status]?.toLowerCase() || r.status?.toLowerCase()} />
                  <ArrowRight size={14} className="text-ink-200 group-hover:text-ink-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
