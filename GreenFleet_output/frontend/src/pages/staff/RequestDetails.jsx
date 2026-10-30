import React, {
  useEffect,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  Phone,
  Navigation,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Car,
  User,
  ChevronLeft,
  Eye,
  Check,
} from 'lucide-react'

import { useToast } from '../../context/ToastContext.jsx'
import { usePageMeta } from '../../components/Layout.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Avatar from '../../components/Avatar.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'

import { useQueryCache } from '../../context/QueryCache.jsx'

import {
  getRequestById,
  spotDriver,
  boardVehicle,
  confirmArrival,
  createComplaint,
  getBranches,
} from '../../data/api.js'

import LiveTripLocation from '../../components/LiveTripLocation.jsx'


/* ─────────────────────────────────────────────
 * Debug logging
 * ───────────────────────────────────────────── */

const DEBUG = true

function log(...args) {
  if (DEBUG) {
    console.log(
      '[RequestDetails]',
      ...args
    )
  }
}

function warn(...args) {
  if (DEBUG) {
    console.warn(
      '[RequestDetails]',
      ...args
    )
  }
}

function errorLog(...args) {
  if (DEBUG) {
    console.error(
      '[RequestDetails]',
      ...args
    )
  }
}


/* ─────────────────────────────────────────────
 * Trip Timeline
 * ───────────────────────────────────────────── */

const STEPS = [
  {
    key: 'PENDING',
    label: 'Submitted',
  },
  {
    key: 'APPROVED',
    label: 'Approved',
  },
  {
    key: 'ASSIGNED',
    label: 'Assigned',
  },
  {
    key: 'DRIVER_SPOTTED',
    label: 'Spotted',
  },
  {
    key: 'BOARDED_WAITING',
    label: 'Boarded',
  },
  {
    key: 'COMPLETED',
    label: 'Arrived',
  },
]


const STEP_ORDER = {
  PENDING: 0,
  PENDING_LINE_MANAGER: 0,
  PENDING_ADMIN: 0,

  APPROVED: 1,

  ASSIGNED: 2,

  DRIVER_SPOTTED: 3,

  BOARDED_WAITING: 4,

  COMPLETED: 5,
}


function ProgressTimeline({ status }) {
  const current =
    STEP_ORDER[status] ?? 0

  const isTerminal =
    status === 'REJECTED' ||
    status === 'CANCELLED'


  return (
    <div>

      <div className="flex items-center overflow-x-auto pb-1 no-scrollbar">

        {STEPS.map((step, i) => {

          const done =
            !isTerminal &&
            current > i

          const active =
            !isTerminal &&
            current === i


          return (
            <React.Fragment key={step.key}>

              <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-[64px]">

                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',

                    done
                      ? 'bg-brand-green border-brand-green text-white'
                      : '',

                    active
                      ? 'bg-white border-brand-green text-brand-green shadow-xs ring-4 ring-brand-green-100'
                      : '',

                    !done && !active
                      ? 'bg-white border-border text-ink-300'
                      : '',
                  ].join(' ')}
                >

                  {done ? (
                    <Check
                      size={13}
                      strokeWidth={3}
                    />
                  ) : (
                    <span>
                      {i + 1}
                    </span>
                  )}

                </div>


                <span
                  className={[
                    'text-[10px] font-medium text-center leading-tight',

                    done
                      ? 'text-brand-green'
                      : '',

                    active
                      ? 'text-brand-green font-semibold'
                      : '',

                    !done && !active
                      ? 'text-ink-300'
                      : '',
                  ].join(' ')}
                >
                  {step.label}
                </span>

              </div>


              {i < STEPS.length - 1 && (

                <div
                  className={`
                    h-0.5
                    flex-1
                    min-w-[10px]
                    mx-0.5
                    mb-4
                    rounded-full

                    ${
                      current > i &&
                      !isTerminal
                        ? 'bg-brand-green'
                        : 'bg-border-subtle'
                    }
                  `}
                />

              )}

            </React.Fragment>
          )
        })}

      </div>


      {isTerminal && (

        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-700">

          <XCircle
            size={14}
            className="shrink-0"
          />

          Request {
            status === 'REJECTED'
              ? 'rejected'
              : 'cancelled'
          }

        </div>

      )}

    </div>
  )
}


/* ─────────────────────────────────────────────
 * Info row
 * ───────────────────────────────────────────── */

function Row({
  label,
  value,
  mono,
}) {
  if (!value) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-border-subtle last:border-0 gap-0.5">

      <span className="text-2xs font-semibold uppercase tracking-wider text-ink-300">
        {label}
      </span>

      <span
        className={`
          text-sm
          font-medium
          text-ink-900
          sm:text-right

          ${mono ? 'font-mono' : ''}
        `}
      >
        {value}
      </span>

    </div>
  )
}


/* ─────────────────────────────────────────────
 * Section card
 * ───────────────────────────────────────────── */

function Card({
  title,
  icon: Icon,
  children,
  className = '',
}) {
  return (
    <div
      className={`
        bg-surface
        border
        border-border-subtle
        rounded-card
        shadow-card
        overflow-hidden
        ${className}
      `}
    >

      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-muted">

        {Icon && (
          <Icon
            size={14}
            className="text-ink-400 shrink-0"
          />
        )}

        <h3 className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
          {title}
        </h3>

      </div>


      <div className="p-4">
        {children}
      </div>

    </div>
  )
}


/* ─────────────────────────────────────────────
 * Complaint modal
 * ───────────────────────────────────────────── */

function ComplaintModal({
  open,
  onClose,
  onSubmit,
  onSkip,
}) {
  const [type, setType] =
    useState('Vehicle Issue')

  const [comment, setComment] =
    useState('')

  const [busy, setBusy] =
    useState(false)


  async function submit(e) {
    e.preventDefault()

    log(
      '[ComplaintModal] Submit requested.',
      {
        type,
        hasComment: Boolean(comment.trim()),
      }
    )

    setBusy(true)

    try {

      await onSubmit({
        type,
        comment,
      })

    } catch (error) {

      errorLog(
        '[ComplaintModal] Submit failed.',
        error
      )

      throw error

    } finally {

      setBusy(false)

    }
  }


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report an Issue"
      subtitle="Optional — help us improve the service"

      footer={(
        <>
          <button
            onClick={onSkip}
            className="text-xs text-ink-400 hover:text-ink-700 mr-auto"
          >
            No issues, skip
          </button>

          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="destructiveSolid"
            loading={busy}
            onClick={submit}
          >
            Submit Report
          </Button>
        </>
      )}
    >

      <div className="space-y-3 mt-1">

        <div>

          <label className="block text-xs font-medium text-ink-700 mb-1.5">
            Category
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="w-full border border-border-subtle rounded-btn px-3 py-2 text-sm text-ink-900 bg-white outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
          >

            <option>
              Driver Conduct
            </option>

            <option>
              Vehicle Issue
            </option>

            <option>
              Late Arrival
            </option>

            <option>
              Route Discrepancy
            </option>

            <option>
              Other
            </option>

          </select>

        </div>


        <div>

          <label className="block text-xs font-medium text-ink-700 mb-1.5">
            Details
          </label>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Describe the issue…"
            className="w-full border border-border-subtle rounded-btn px-3 py-2 text-sm text-ink-900 bg-white outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 resize-none"
          />

        </div>

      </div>

    </Modal>
  )
}


/* ─────────────────────────────────────────────
 * Arrival modal
 * ───────────────────────────────────────────── */

function ArrivalModal({
  open,
  onClose,
  onSubmit,
}) {
  const [choice, setChoice] =
    useState('BRANCH')

  const [branches, setBranches] =
    useState([])

  const [branch, setBranch] =
    useState('')

  const [busy, setBusy] =
    useState(false)


  useEffect(() => {

    if (!open) {
      return
    }

    log(
      '[ArrivalModal] Loading branches.'
    )

    getBranches()
      .then((data) => {

        log(
          '[ArrivalModal] Branches loaded.',
          {
            count: data?.length ?? 0,
          }
        )

        setBranches(data)

        if (data[0]) {
          setBranch(data[0].id)
        }

      })
      .catch((error) => {

        errorLog(
          '[ArrivalModal] Failed to load branches.',
          error
        )

      })

  }, [open])


  async function submit(e) {
    e.preventDefault()

    log(
      '[ArrivalModal] Arrival confirmation requested.',
      {
        choice,
        branchId:
          choice === 'BRANCH'
            ? branch
            : null,
      }
    )

    setBusy(true)

    try {

      await onSubmit({
        choice,
        branchId:
          choice === 'BRANCH'
            ? branch
            : null,
      })

    } catch (error) {

      errorLog(
        '[ArrivalModal] Arrival submission failed.',
        error
      )

      throw error

    } finally {

      setBusy(false)

    }
  }


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Arrival"
      subtitle="Release the vehicle and driver back to the pool"

      footer={(
        <>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={busy}
            onClick={submit}
            icon={CheckCircle2}
          >
            Confirm
          </Button>
        </>
      )}
    >

      <div className="space-y-3 mt-1">

        <div className="grid grid-cols-2 gap-2">

          {[
            'BRANCH',
            'CUSTOM',
          ].map((opt) => (

            <label
              key={opt}
              className={`
                flex
                items-center
                gap-2
                border
                rounded-xl
                p-3
                cursor-pointer
                transition-colors
                text-sm

                ${
                  choice === opt
                    ? 'border-brand-green bg-brand-green-50 text-brand-green font-medium'
                    : 'border-border-subtle hover:bg-surface-muted text-ink-700'
                }
              `}
            >

              <input
                type="radio"
                name="choice"
                value={opt}
                checked={choice === opt}
                onChange={() =>
                  setChoice(opt)
                }
                className="accent-brand-green"
              />

              {opt === 'BRANCH'
                ? 'Bank Branch'
                : 'Other Address'}

            </label>

          ))}

        </div>


        {choice === 'BRANCH' && (

          <select
            value={branch}
            onChange={(e) =>
              setBranch(e.target.value)
            }
            className="w-full border border-border-subtle rounded-btn px-3 py-2 text-sm text-ink-900 bg-white outline-none focus:border-brand-green"
          >

            {branches.map((b) => (

              <option
                key={b.id}
                value={b.id}
              >
                {b.branch_name || b.name}
              </option>

            ))}

          </select>

        )}

      </div>

    </Modal>
  )
}


/* ─────────────────────────────────────────────
 * Main page
 * ───────────────────────────────────────────── */

export default function RequestDetails() {

  const { id } =
    useParams()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const { showToast } =
    useToast()

  const { invalidate } =
    useQueryCache()


  usePageMeta({
    title: `Request #${id}`,
    breadcrumb: 'My Requests',
  })


  const [request, setRequest] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [err, setErr] =
    useState('')

  const [busy, setBusy] =
    useState(false)

  const [arrivalOpen, setArrivalOpen] =
    useState(false)

  const [complaintOpen, setComplaintOpen] =
    useState(false)


  /* ─────────────────────────────────────────
   * Component lifecycle logging
   * ───────────────────────────────────────── */

  useEffect(() => {

    log(
      '[LIFECYCLE] RequestDetails mounted.',
      {
        requestId: id,
      }
    )

    return () => {

      log(
        '[LIFECYCLE] RequestDetails unmounted.',
        {
          requestId: id,
        }
      )

    }

  }, [id])


  /* ─────────────────────────────────────────
   * Request loading
   * ───────────────────────────────────────── */

  useEffect(() => {

    log(
      '[REQUEST] Request ID changed. Loading request.',
      {
        requestId: id,
      }
    )

    load()

  }, [id])


  async function load() {

    log(
      '[REQUEST] Loading request details.',
      {
        requestId: id,
      }
    )

    setLoading(true)

    try {

      const data =
        await getRequestById(id)

      log(
        '[REQUEST] Request details received.',
        {
          requestId: id,
          status: data?.status,
          hasAssignment: Boolean(
            data?.assignment
          ),
          assignmentId:
            data?.assignment?.id ??
            data?.assignment_id ??
            null,
          hasVehicle: Boolean(
            data?.assignment?.vehicle ||
            data?.vehicle
          ),
          hasDriver: Boolean(
            data?.assignment?.driver ||
            data?.driver
          ),
        }
      )

      setRequest(data)

      setErr('')

    } catch (e) {

      errorLog(
        '[REQUEST] Failed to load request.',
        {
          requestId: id,
          status: e.response?.status,
          message:
            e.response?.data?.message ||
            e.message,
          error: e,
        }
      )

      setErr(
        e.response?.data?.message ||
        'Failed to load request'
      )

    } finally {

      setLoading(false)

      log(
        '[REQUEST] Request loading finished.',
        {
          requestId: id,
        }
      )

    }
  }


  /* ─────────────────────────────────────────
   * Navigation state
   * ───────────────────────────────────────── */

  useEffect(() => {

    if (location.state?.justSubmitted) {

      log(
        '[NAVIGATION] Request was just submitted.',
        {
          requestId: id,
        }
      )

      showToast(
        "Request submitted — we'll notify you once it's reviewed."
      )

      navigate(
        location.pathname,
        {
          replace: true,
          state: {},
        }
      )

    }

  }, [])


  /* ─────────────────────────────────────────
   * Request actions
   * ───────────────────────────────────────── */

  async function act(
    fn,
    success
  ) {

    log(
      '[ACTION] Starting request action.',
      {
        requestId: id,
      }
    )

    setBusy(true)

    try {

      const updated =
        await fn()

      log(
        '[ACTION] Request action succeeded.',
        {
          requestId: id,
          newStatus: updated?.status,
        }
      )

      setRequest(updated)

      invalidate(
        'staff-requests'
      )

      showToast(success)

    } catch (e) {

      errorLog(
        '[ACTION] Request action failed.',
        {
          requestId: id,
          status: e.response?.status,
          message:
            e.response?.data?.message ||
            e.message,
          error: e,
        }
      )

      showToast(
        e.response?.data?.message ||
        'Action failed',
        'error'
      )

    } finally {

      setBusy(false)

    }
  }


  async function handleArrival({
    choice,
    branchId,
  }) {

    log(
      '[ARRIVAL] Confirming arrival.',
      {
        requestId: id,
        choice,
        branchId,
      }
    )

    setArrivalOpen(false)

    await act(
      () =>
        confirmArrival(
          id,
          {
            choice,
            branchId,
          }
        ),
      'Trip completed!'
    )

    setComplaintOpen(true)
  }


  async function handleComplaint({
    type,
    comment,
  }) {

    log(
      '[COMPLAINT] Creating complaint.',
      {
        requestId: id,
        type,
      }
    )

    setComplaintOpen(false)

    await act(
      () =>
        createComplaint({
          transport_request_id: id,
          type,
          comment,
        }),
      'Report submitted.'
    )
  }


  /* ─────────────────────────────────────────
   * Loading state
   * ───────────────────────────────────────── */

  if (loading) {

    return (
      <div className="flex h-64 items-center justify-center">

        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />

      </div>
    )
  }


  /* ─────────────────────────────────────────
   * Error state
   * ───────────────────────────────────────── */

  if (err || !request) {

    return (
      <div className="max-w-md mx-auto py-12 text-center">

        <AlertCircle
          size={32}
          className="text-ink-200 mx-auto mb-3"
        />

        <p className="text-sm font-medium text-ink-600">
          {err || 'Request not found'}
        </p>

        <button
          onClick={() =>
            navigate('/staff/my-requests')
          }
          className="mt-3 text-sm text-brand-green hover:underline"
        >
          Back to My Requests
        </button>

      </div>
    )
  }


  /* ─────────────────────────────────────────
   * Derived request data
   * ───────────────────────────────────────── */

  const s =
    request.status


  const driver =
    request.assignment?.driver


  const driverName =
    driver?.first_name && driver?.last_name
      ? `${driver.first_name} ${driver.last_name}`.trim()
      : driver?.user?.first_name && driver?.user?.last_name
        ? `${driver.user.first_name} ${driver.user.last_name}`.trim()
        : request.driver?.name ||
          request.driver?.first_name ||
          null


  const driverPhone =
    driver?.phone ||
    driver?.phone_number ||
    request.driver?.phone ||
    request.driver?.phone_number ||
    null


  const vehicle =
    request.assignment?.vehicle ||
    request.vehicle


  const vehiclePlate =
    vehicle?.plate_number ||
    vehicle?.plate ||
    null


  const vehicleModel =
    vehicle
      ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim()
      : null


  const vehicleColor =
    vehicle?.color ||
    null


  const pooled =
    request.assignment
      ?.transport_requests
      ?.filter(
        (r) => r.id !== request.id
      ) || []


  const showSpot =
    s === 'ASSIGNED'


  const showBoard =
    s === 'DRIVER_SPOTTED'


  const showArrive =
    s === 'BOARDED_WAITING' ||
    s === 'IN_USE'


  const showReport =
    s === 'COMPLETED' &&
    !request.complaint_filed


  /* ─────────────────────────────────────────
   * Important map diagnostics
   * ───────────────────────────────────────── */

  log(
    '[RENDER] RequestDetails render.',
    {
      requestId: id,
      status: s,
      pooledPassengers: pooled.length + 1,
      assignmentId:
        request.assignment?.id ??
        request.assignment_id ??
        null,
      vehiclePlate,
      driverName,
      liveLocationEnabled:
        s === 'ASSIGNED' ||
        s === 'DRIVER_SPOTTED' ||
        s === 'BOARDED_WAITING',
    }
  )


  return (

    <div className="max-w-3xl mx-auto pb-28 sm:pb-8 space-y-4">

      {/* Back */}

      <button
        onClick={() =>
          navigate('/staff/my-requests')
        }
        className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900 transition-colors"
      >
        <ChevronLeft size={15} />

        My Requests

      </button>


      {/* Header card */}

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-5">

        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">

          <div>

            <p className="text-2xs text-ink-300 font-mono uppercase tracking-wider mb-0.5">
              Transport Request
            </p>

            <h1 className="text-2xl font-bold text-ink-900">
              #{id}
            </h1>

            <p className="text-xs text-ink-400 mt-0.5">

              {new Date(
                request.created_at
              ).toLocaleDateString(
                [],
                {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}

            </p>

          </div>


          <div className="flex items-center gap-2 flex-wrap">

            <StatusPill
              status={
                (
                  request.priority ||
                  'normal'
                ).toLowerCase()
              }
            />

            <StatusPill
              status={
                s
                  ?.replace(/_/g, ' ')
                  .toLowerCase()
              }
            />

          </div>

        </div>


        <ProgressTimeline
          status={s}
        />

      </div>


      {/* Action banner */}

      {(showSpot || showBoard) && (

        <div className="bg-blue-50 border border-blue-200 rounded-card p-4 flex items-start gap-3">

          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0 mt-0.5">

            {showSpot
              ? <Eye size={16} />
              : <Users size={16} />
            }

          </div>


          <div className="flex-1 min-w-0">

            <p className="text-sm font-semibold text-blue-900 mb-0.5">
              Action Required
            </p>

            <p className="text-xs text-blue-700 mb-3 leading-relaxed">

              {showSpot
                ? 'Your vehicle has been dispatched. Tap the button when you see your driver.'
                : 'You spotted your driver! Tap below once you have taken your seat.'
              }

            </p>


            <Button
              loading={busy}
              icon={
                showSpot
                  ? Eye
                  : Users
              }
              variant="primary"
              className="bg-blue-600 border-blue-600 hover:bg-blue-700 w-full sm:w-auto"

              onClick={() =>
                act(
                  showSpot
                    ? () => spotDriver(id)
                    : () => boardVehicle(id),

                  showSpot
                    ? 'Driver spotted — marked!'
                    : 'You are boarded!'
                )
              }
            >

              {showSpot
                ? 'I See the Driver'
                : 'Board Vehicle'
              }

            </Button>

          </div>

        </div>

      )}


      {/* Rejection reason */}

      {(s === 'REJECTED' ||
        s === 'CANCELLED') &&
        request.rejection_reason && (

          <div className="bg-red-50 border border-red-200 rounded-card p-4">

            <p className="text-xs font-semibold text-red-800 mb-1">
              Reason
            </p>

            <p className="text-sm text-red-700">
              {request.rejection_reason}
            </p>

          </div>

        )}


      {/* Pooled dispatch */}

      {pooled.length > 0 && (

        <Card
          title={`Shared Dispatch — ${pooled.length + 1} Passengers`}
          icon={Users}
        >

          <div className="divide-y divide-border-subtle">

            {[request, ...pooled].map(
              (r, i) => (

                <div
                  key={r.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >

                  <div className="flex items-center gap-2.5">

                    <Avatar
                      name={
                        r.requester?.first_name ||
                        'P'
                      }
                      size={28}
                    />

                    <div>

                      <p className="text-sm font-medium text-ink-900">

                        {r.requester?.first_name}
                        {' '}
                        {r.requester?.last_name}

                        {i === 0 && (

                          <span className="ml-1.5 text-2xs text-brand-green font-semibold">
                            (You)
                          </span>

                        )}

                      </p>

                      <p className="text-xs text-ink-400 truncate max-w-[180px]">
                        {r.pickup_location}
                        {' → '}
                        {r.destination}
                      </p>

                    </div>

                  </div>


                  <StatusPill
                    status={
                      r.status
                        ?.replace(/_/g, ' ')
                        .toLowerCase()
                    }
                  />

                </div>

              )
            )}

          </div>

        </Card>

      )}


      {/* Trip details + Approval */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Card
          title="Trip Details"
          icon={Navigation}
        >

          <Row
            label="From"
            value={
              request.pickup_location
            }
          />

          <Row
            label="To"
            value={
              request.destination
            }
          />

          <Row
            label="Purpose"
            value={
              request.purpose
            }
          />

          <Row
            label="Date"
            value={
              request.departure_date
            }
          />

          <Row
            label="Time"
            value={
              request.departure_time
            }
          />

          <Row
            label="Passengers"
            value={
              request.passenger_count ||
              '1'
            }
          />

          <Row
            label="Notes"
            value={
              request.remarks
            }
          />

        </Card>


        <Card
          title="Approval"
          icon={CheckCircle2}
        >

          {s === 'PENDING_LINE_MANAGER' ? (

            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">

              <Clock
                size={28}
                className="text-amber-400"
              />

              <p className="text-sm font-semibold text-ink-800">
                Awaiting Line Manager
              </p>

              <p className="text-xs text-ink-400">
                Your manager will receive an email to approve or reject.
              </p>

            </div>

          ) : (
            s === 'PENDING_ADMIN' ||
            s === 'PENDING'
          ) ? (

            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">

              <Clock
                size={28}
                className="text-amber-400"
              />

              <p className="text-sm font-semibold text-ink-800">
                Awaiting Transport Admin
              </p>

              <p className="text-xs text-ink-400">
                The transport team will assign a vehicle and driver.
              </p>

            </div>

          ) : (
            s === 'REJECTED' ||
            s === 'CANCELLED'
          ) ? (

            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">

              <XCircle
                size={28}
                className="text-red-400"
              />

              <p className="text-sm font-semibold text-ink-800">

                Request {
                  s === 'REJECTED'
                    ? 'Rejected'
                    : 'Cancelled'
                }

              </p>

            </div>

          ) : (

            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">

              <CheckCircle2
                size={28}
                className="text-brand-green"
              />

              <p className="text-sm font-semibold text-ink-800">
                Approved by Transport
              </p>

              {request.approved_at && (

                <p className="text-xs text-ink-400">

                  {new Date(
                    request.approved_at
                  ).toLocaleDateString()}

                </p>

              )}

            </div>

          )}

        </Card>

      </div>


      {/* Driver & Vehicle */}

      {(driverName || vehiclePlate) && (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {driverName && (

            <Card
              title="Driver"
              icon={User}
            >

              <div className="flex items-center gap-3 mb-4">

                <Avatar
                  name={driverName}
                  size={40}
                />

                <div>

                  <p className="text-sm font-semibold text-ink-900">
                    {driverName}
                  </p>

                  <p className="text-xs text-ink-400">
                    Fleet Driver
                  </p>

                </div>

              </div>


              {driverPhone && (

                <a
                  href={`tel:${driverPhone}`}
                  className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-100 transition-colors w-full"
                >

                  <Phone size={14} />

                  {driverPhone}

                </a>

              )}

            </Card>

          )}


          {vehiclePlate && (

            <Card
              title="Vehicle"
              icon={Car}
            >

              <div className="bg-ink-900 text-center rounded-xl py-3 px-4 mb-3">

                <p className="text-2xs text-ink-400 tracking-widest uppercase mb-0.5">
                  Plate
                </p>

                <p className="text-2xl font-black font-mono tracking-widest text-brand-lime">
                  {vehiclePlate}
                </p>

              </div>


              <Row
                label="Model"
                value={vehicleModel}
              />

              <Row
                label="Colour"
                value={vehicleColor}
              />

            </Card>

          )}

        </div>

      )}


      {/* ─────────────────────────────────────────
          LIVE VEHICLE LOCATION

          Keep this component mounted directly in
          the page. Do not conditionally mount it
          based on location data, because doing so
          can cause Leaflet to initialise repeatedly.
      ───────────────────────────────────────── */}

      <LiveTripLocation
        requestId={id}
        status={s}
        isPassenger={true}
      />


      {/* Report link */}

      {showReport && (

        <button
          onClick={() => {

            log(
              '[COMPLAINT] Opening complaint modal.',
              {
                requestId: id,
              }
            )

            setComplaintOpen(true)

          }}
          className="flex items-center gap-2 text-xs font-medium text-ink-400 hover:text-red-600 transition-colors"
        >

          <AlertCircle size={13} />

          Report an issue with this trip

        </button>

      )}


      {/* Arrival sticky bar */}

      {showArrive && (

        <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-border-subtle p-4 z-30 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-2">

          <Button
            fullWidth
            loading={busy}
            icon={CheckCircle2}
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {

              log(
                '[ARRIVAL] Opening arrival modal.',
                {
                  requestId: id,
                  status: s,
                }
              )

              setArrivalOpen(true)

            }}
          >

            I Have Arrived

          </Button>

        </div>

      )}


      <ArrivalModal
        open={arrivalOpen}
        onClose={() => {

          log(
            '[ARRIVAL] Closing arrival modal.',
            {
              requestId: id,
            }
          )

          setArrivalOpen(false)

        }}
        onSubmit={handleArrival}
      />


      <ComplaintModal
        open={complaintOpen}
        onClose={() => {

          log(
            '[COMPLAINT] Closing complaint modal.',
            {
              requestId: id,
            }
          )

          setComplaintOpen(false)

        }}
        onSubmit={handleComplaint}
        onSkip={() => {

          log(
            '[COMPLAINT] Complaint skipped.',
            {
              requestId: id,
            }
          )

          setComplaintOpen(false)

        }}
      />

    </div>
  )
}