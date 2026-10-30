import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users, AlertCircle, CheckCircle2, XCircle,
  Car, User, ChevronLeft, ShieldCheck,
  Check, ArrowRight,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext.jsx'
import { usePageMeta } from '../../components/Layout.jsx'
import { useQuery, useMutation, useQueryCache } from '../../context/QueryCache.jsx'
import {
  getTransportRequestById,
  getTransportRequests,
  getVehicles,
  getDrivers,
  approveRequest,
  rejectRequest,
  triggerLineManagerAction,
} from '../../data/api.js'

/* ─── helpers ─── */
function formatDepartureDateTime(request) {
  const date = request.departure_date || request.departureDate
  const time = request.departure_time || request.departureTime
  if (!date) return '—'
  const str = time && time.includes(':') ? `${date}T${time}` : date
  const d = new Date(str)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

/* ─── sub-components ─── */
const STATUS_STYLES = {
  PENDING:              'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_LINE_MANAGER: 'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_ADMIN:        'bg-amber-50 text-amber-800 border-amber-200',
  APPROVED:             'bg-brand-green-50 text-emerald-800 border-emerald-200',
  ASSIGNED:             'bg-blue-50 text-blue-800 border-blue-200',
  DRIVER_SPOTTED:       'bg-indigo-50 text-indigo-800 border-indigo-200',
  BOARDED_WAITING:      'bg-purple-50 text-purple-800 border-purple-200',
  COMPLETED:            'bg-green-50 text-green-800 border-green-200',
  REJECTED:             'bg-red-50 text-red-800 border-red-200',
  CANCELLED:            'bg-surface-muted text-ink-700 border-border-subtle',
}

function StatusPill({ status }) {
  const key = (status || 'PENDING').toUpperCase()
  const style = STATUS_STYLES[key] || STATUS_STYLES.PENDING
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

function Btn({ children, variant = 'primary', loading, className = '', ...props }) {
  const base = 'flex items-center justify-center font-semibold rounded-xl px-4 py-2.5 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm'
  const variants = {
    primary:         'bg-brand-green hover:bg-brand-green-700 text-white shadow-sm shadow-emerald-200',
    destructive:     'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
    destructiveSolid:'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200',
    tertiary:        'bg-surface-muted hover:bg-gray-200 text-ink-700 border border-border-subtle',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />}
      {children}
    </button>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-1 text-sm">
      <span className="text-ink-400 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className="text-ink-900 font-semibold text-right sm:text-left">{value}</span>
    </div>
  )
}

/* ─── main component ─── */
export default function RequestReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { invalidate } = useQueryCache()
  usePageMeta({ title: `Review Request #${id}` })

  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedDriver,  setSelectedDriver]  = useState(null)
  const [selectedPooled,  setSelectedPooled]  = useState([])
  const [rejecting,       setRejecting]       = useState(false)
  const [reason,          setReason]          = useState('')
  const [managerBusy,     setManagerBusy]     = useState(false)

  /* ── cached fetches ── */
  const { data: request, loading: loadingReq, error: errReq, refetch: refetchReq } =
    useQuery(`transport-request-${id}`, () => getTransportRequestById(id), { ttl: 20_000 })

  const { data: allRequests = [] } =
    useQuery('transport-requests', getTransportRequests, { ttl: 30_000 })

  const { data: vehicles = [] } =
    useQuery('vehicles', getVehicles, { ttl: 60_000 })

  const { data: drivers = [] } =
    useQuery('drivers', getDrivers, { ttl: 60_000 })

  const availableVehicles = useMemo(() => vehicles.filter((v) => v.status === 'AVAILABLE'), [vehicles])
  const availableDrivers  = useMemo(() => drivers.filter((d) => d.status === 'ACTIVE' || d.status === 'AVAILABLE'), [drivers])

  /* ── pooling suggestions ── */
  const poolingSuggestions = useMemo(() => {
    if (!request) return []
    return allRequests.filter((r) => {
      if (r.id === request.id) return false
      if (r.status !== 'PENDING_ADMIN') return false
      const sameDate = r.departure_date === request.departure_date
      const destA = r.destination?.toLowerCase().trim() || ''
      const destB = request.destination?.toLowerCase().trim() || ''
      const similar = destA === destB || destA.includes(destB) || destB.includes(destA)
      return sameDate && similar
    }).slice(0, 2)
  }, [request, allRequests])

  /* ── approve mutation ── */
  const { mutate: doApprove, loading: approving } = useMutation(
    async () => {
      await approveRequest(id, { driverId: selectedDriver, vehicleId: selectedVehicle })
      if (selectedPooled.length > 0 && selectedDriver && selectedVehicle) {
        for (const pid of selectedPooled) {
          await approveRequest(pid, { driverId: selectedDriver, vehicleId: selectedVehicle })
        }
      }
    },
    ['transport-requests', `transport-request-${id}`, 'active-trips'],
  )

  /* ── reject mutation ── */
  const { mutate: doReject, loading: rejecting2 } = useMutation(
    () => rejectRequest(id, reason),
    ['transport-requests', `transport-request-${id}`],
  )

  async function handleApprove() {
    try {
      await doApprove()
      showToast(
        selectedPooled.length > 0
          ? `Pooled dispatch created for ${selectedPooled.length + 1} passengers.`
          : `Request #${id} approved successfully.`,
      )
      navigate('/transport/requests')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not approve. Try again.', 'error')
    }
  }

  async function handleReject() {
    if (!reason.trim()) return
    try {
      await doReject()
      showToast(`Request #${id} rejected.`, 'error')
      navigate('/transport/requests')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not reject. Try again.', 'error')
    }
  }

  async function handleManagerAction(action) {
    setManagerBusy(true)
    try {
      const res = await triggerLineManagerAction(id, action)
      showToast(res.message || `Manager action executed.`)
      invalidate(`transport-request-${id}`, 'transport-requests')
      refetchReq()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to trigger Line Manager action.', 'error')
    } finally {
      setManagerBusy(false)
    }
  }

  const togglePooled = (rid) =>
    setSelectedPooled((prev) => prev.includes(rid) ? prev.filter((x) => x !== rid) : [...prev, rid])

  /* ── states ── */
  if (loadingReq && !request) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      </div>
    )
  }

  if (errReq || !request) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <AlertCircle size={36} className="mx-auto text-ink-300 mb-3" />
        <p className="text-base font-semibold text-ink-900">Request not found</p>
        <button onClick={() => navigate('/transport/requests')} className="mt-4 text-sm font-medium text-brand-green hover:underline">
          Return to All Requests
        </button>
      </div>
    )
  }

  const isPendingLineManager = ['PENDING_LINE_MANAGER', 'PENDING'].includes(request.status)
  const isPendingAdmin       = request.status === 'PENDING_ADMIN'
  const isPooled             = selectedPooled.length > 0
  const canApprove           = isPendingAdmin && selectedVehicle !== null && selectedDriver !== null
  const submitting           = approving || rejecting2

  let approveLabel = 'Select Vehicle & Driver to Approve'
  if (!isPendingAdmin && !isPendingLineManager) {
    approveLabel = `Request is ${request.status}`
  } else if (selectedVehicle && selectedDriver) {
    approveLabel = isPooled ? `Approve & Pool (${selectedPooled.length + 1} Requests)` : 'Approve & Assign'
  }

  return (
    <div className="pb-28 p-4 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/transport/requests')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-ink-900 mb-5 transition-colors border-0 bg-transparent cursor-pointer"
      >
        <ChevronLeft size={16} /> All Requests
      </button>

      {/* Line Manager Banner */}
      {isPendingLineManager && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-card p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Awaiting Line Manager Approval</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Manager contact: <span className="font-mono font-medium">{request.line_manager_email || 'Not set'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              disabled={managerBusy}
              onClick={() => handleManagerAction('approve')}
              className="text-xs bg-brand-green text-white font-semibold px-3.5 py-2 rounded-xl hover:bg-brand-green-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              Simulate Approval
            </button>
            <button
              disabled={managerBusy}
              onClick={() => handleManagerAction('reject')}
              className="text-xs bg-red-600 text-white font-semibold px-3.5 py-2 rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              Simulate Rejection
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-border-subtle/80 rounded-card shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-ink-300 uppercase tracking-wider">Transport Request</span>
                <h2 className="text-xl font-bold text-ink-900">#{request.id}</h2>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={request.priority} />
                <StatusPill status={request.status} />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <Row label="Employee Name" value={
                request.requester
                  ? `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim()
                  : request.staff_name || '—'
              } />
              <Row label="Department" value={
                request.requester?.department?.name || request.requester?.department || request.department || '—'
              } />
              <Row label="Branch" value={
                request.requester?.branch?.name || request.requester?.branch || request.branch || '—'
              } />
              <Row label="Current Location" value={request.pickup_location || '—'} />
              <Row label="Destination"      value={request.destination || '—'} />
              <Row label="Purpose"          value={request.purpose || '—'} />
              <Row label="Departure Time"   value={formatDepartureDateTime(request)} />
              <Row label="Passengers"       value={request.passenger_count || '1'} />
              {request.rejection_reason && (
                <Row label="Rejection Reason" value={<span className="text-red-600 font-medium">{request.rejection_reason}</span>} />
              )}
              <Row label="Notes / Remarks"  value={request.remarks || '—'} />
            </div>
          </div>

          {/* Pooling suggestions */}
          {isPendingAdmin && poolingSuggestions.length > 0 && (
            <div className="bg-purple-50/60 border border-purple-200/80 rounded-card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Users size={18} />
                </div>
                <h4 className="text-sm font-bold text-purple-900">Proximity Pooling Opportunities</h4>
              </div>
              <p className="text-xs text-purple-700 mb-4 leading-relaxed">
                Coworkers travelling to the same destination on this date — select to pool into a single dispatch.
              </p>
              <div className="space-y-2.5">
                {poolingSuggestions.map((sug) => {
                  const isSel = selectedPooled.includes(sug.id)
                  return (
                    <div
                      key={sug.id}
                      onClick={() => togglePooled(sug.id)}
                      className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                        isSel ? 'bg-purple-100/80 border-purple-300 shadow-sm ring-1 ring-purple-300' : 'bg-white border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-ink-900">
                          #{sug.id} — {sug.requester?.first_name} {sug.requester?.last_name}
                        </p>
                        <p className="text-[11px] text-ink-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{sug.pickup_location}</span>
                          <ArrowRight size={10} className="text-ink-300" />
                          <span>{sug.destination}</span>
                          <span className="text-gray-300">•</span>
                          <span>{sug.departure_time}</span>
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSel ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSel && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Fleet selection */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vehicles */}
          <div className="bg-white border border-border-subtle/80 rounded-card shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <Car size={16} className="text-brand-green" /> Available Vehicles
              </h3>
              <span className="text-xs font-semibold bg-brand-green-50 text-brand-green px-2.5 py-0.5 rounded-full">
                {availableVehicles.length} Available
              </span>
            </div>
            {availableVehicles.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-400 border border-dashed rounded-xl">
                No vehicles currently available.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {availableVehicles.map((v) => {
                  const isSel = selectedVehicle === v.id
                  return (
                    <div key={v.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      isSel ? 'border-brand-green bg-brand-green-50 ring-1 ring-brand-green' : 'border-border-subtle hover:border-border-subtle bg-surface-muted'
                    }`}>
                      <div>
                        <div className="font-mono text-xs font-bold text-ink-900 bg-white border border-border-subtle px-2 py-0.5 rounded-md inline-block mb-1 shadow-2xs">
                          {v.plate_number || v.plate}
                        </div>
                        <div className="text-xs font-medium text-ink-600">
                          {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                        </div>
                      </div>
                      {isPendingAdmin && (
                        <button
                          onClick={() => setSelectedVehicle(v.id)}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                            isSel ? 'bg-brand-green text-white shadow-xs' : 'border border-emerald-600 text-brand-green hover:bg-brand-green-50'
                          }`}
                        >
                          {isSel ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Drivers */}
          <div className="bg-white border border-border-subtle/80 rounded-card shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <User size={16} className="text-brand-green" /> Available Drivers
              </h3>
              <span className="text-xs font-semibold bg-brand-green-50 text-brand-green px-2.5 py-0.5 rounded-full">
                {availableDrivers.length} Ready
              </span>
            </div>
            {availableDrivers.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-400 border border-dashed rounded-xl">
                No drivers currently available.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {availableDrivers.map((d) => {
                  const isSel = selectedDriver === d.id
                  const name = `${d.first_name || d.user?.first_name || ''} ${d.last_name || d.user?.last_name || ''}`.trim() || d.name || '—'
                  return (
                    <div key={d.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      isSel ? 'border-brand-green bg-brand-green-50 ring-1 ring-brand-green' : 'border-border-subtle hover:border-border-subtle bg-surface-muted'
                    }`}>
                      <div>
                        <div className="text-xs font-bold text-ink-900">{name}</div>
                        <div className="text-[11px] text-ink-400 font-mono mt-0.5">
                          {d.phone || d.phone_number || 'No contact info'}
                        </div>
                      </div>
                      {isPendingAdmin && (
                        <button
                          onClick={() => setSelectedDriver(d.id)}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                            isSel ? 'bg-brand-green text-white shadow-xs' : 'border border-emerald-600 text-brand-green hover:bg-brand-green-50'
                          }`}
                        >
                          {isSel ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Drawer */}
      {rejecting && (
        <div className="fixed inset-x-0 bottom-16 sm:bottom-20 bg-white border-t border-border-subtle p-4 sm:p-5 z-20 shadow-2xl">
          <div className="max-w-xl mx-auto">
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Reason for Request Rejection
            </label>
            <textarea
              rows={3}
              placeholder="State clear reasons for rejecting this transport request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Sticky Action Bar */}
      {isPendingAdmin && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-border-subtle p-4 z-30 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
            {!rejecting ? (
              <>
                <Btn variant="destructive" onClick={() => setRejecting(true)} disabled={submitting}>
                  Reject
                </Btn>
                <Btn disabled={!canApprove || submitting} loading={approving} onClick={handleApprove}>
                  {approveLabel}
                </Btn>
              </>
            ) : (
              <>
                <Btn variant="tertiary" onClick={() => setRejecting(false)} disabled={submitting}>
                  Cancel
                </Btn>
                <Btn variant="destructiveSolid" disabled={!reason.trim() || submitting} loading={rejecting2} onClick={handleReject}>
                  Confirm Rejection
                </Btn>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
