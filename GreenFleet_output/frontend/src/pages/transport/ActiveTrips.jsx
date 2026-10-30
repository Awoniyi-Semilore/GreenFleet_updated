import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
  ChevronDown,
  ChevronRight,
  Car,
  Eye,
  Users,
  AlertCircle,
  MapPin,
  RefreshCw,
  Clock,
} from 'lucide-react'

import { usePageMeta } from '../../components/Layout.jsx'

import {
  useQuery,
  useQueryCache,
} from '../../context/QueryCache.jsx'

import {
  getActiveTrips,
} from '../../data/api.js'

import LiveTripLocation from '../../components/LiveTripLocation.jsx'


/* ─────────────────────────────────────────────
   STATUS STYLES
───────────────────────────────────────────── */

const STATUS_STYLES = {
  PENDING:
    'bg-amber-50 text-amber-700 border-amber-200',

  APPROVED:
    'bg-brand-green-50 text-emerald-700 border-emerald-200',

  ASSIGNED:
    'bg-blue-50 text-blue-700 border-blue-200',

  DRIVER_SPOTTED:
    'bg-indigo-50 text-indigo-700 border-indigo-200',

  BOARDED_WAITING:
    'bg-purple-50 text-purple-700 border-purple-200',

  COMPLETED:
    'bg-green-50 text-green-700 border-green-200',

  REJECTED:
    'bg-red-50 text-red-700 border-red-200',

  CANCELLED:
    'bg-surface-muted text-ink-700 border-border-subtle',
}


function StatusPill({ status }) {
  const key =
    (status || 'PENDING').toUpperCase()

  const style =
    STATUS_STYLES[key] ||
    STATUS_STYLES.PENDING

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-0.5
        rounded-full
        text-xs
        font-semibold
        border
        ${style}
      `}
    >
      {status?.replace(/\_/g, ' ')}
    </span>
  )
}


/* ─────────────────────────────────────────────
   TIMELINE
───────────────────────────────────────────── */

const TIMELINE_STEPS = [
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
    label: 'Completed',
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


function getDriverDisplayName(driver) {
  const source = driver?.user || driver
  const name = [
    source?.first_name,
    source?.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return name || source?.name || driver?.name || 'Driver details unavailable'
}


function TripTimeline({ currentStep }) {
  const current =
    STEP_ORDER[currentStep] ?? 0

  return (
    <div className="flex items-center overflow-x-auto pb-1 pt-1 no-scrollbar">

      {TIMELINE_STEPS.map((step, i) => {

        const done =
          current > i

        const active =
          current === i

        return (
          <React.Fragment key={step.key}>

            <div className="flex flex-col items-center gap-1 shrink-0 min-w-[56px]">

              <div
                className={`
                  w-6
                  h-6
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-semibold
                  border
                  transition-all

                  ${
                    done
                      ? 'bg-brand-green border-brand-green text-white'
                      : active
                        ? 'bg-surface border-brand-green text-brand-green shadow-sm ring-2 ring-emerald-100'
                        : 'bg-surface border-border-subtle text-gray-300'
                  }
                `}
              >

                {done ? (

                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                ) : (

                  <span>
                    {i + 1}
                  </span>

                )}

              </div>

              <span
                className={`
                  text-[9px]
                  font-medium
                  text-center
                  leading-tight
                  max-w-[60px]

                  ${
                    done
                      ? 'text-brand-green'
                      : active
                        ? 'text-emerald-700 font-semibold'
                        : 'text-ink-300'
                  }
                `}
              >
                {step.label}
              </span>

            </div>


            {i < TIMELINE_STEPS.length - 1 && (

              <div
                className={`
                  h-0.5
                  min-w-[12px]
                  flex-1
                  mx-0.5
                  mb-3
                  rounded-full

                  ${
                    current > i
                      ? 'bg-emerald-400'
                      : 'bg-gray-200'
                  }
                `}
              />

            )}

          </React.Fragment>
        )
      })}

    </div>
  )
}


/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */

function EmptyState({
  icon: Icon,
  message,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-surface border border-border-subtle rounded-xl max-w-md mx-auto my-8">

      <div className="p-3 bg-surface-muted rounded-full text-ink-300 mb-3">
        <Icon size={28} />
      </div>

      <p className="text-sm font-medium text-ink-400">
        {message}
      </p>

    </div>
  )
}


/* ─────────────────────────────────────────────
   LIVE MAP SECTION
───────────────────────────────────────────── */

/**
 * ActiveTrips uses the same real live-location
 * component used by RequestDetails.
 *
 * A dispatch can contain multiple requests when
 * passengers are pooled. Since the location belongs
 * to the shared assignment, we use the first request
 * as the request ID for retrieving that location.
 */
function ActiveTripLiveMap({
  dispatch,
}) {
  if (!dispatch) {
    return (
      <div className="h-full min-h-[340px] flex items-center justify-center bg-surface-muted rounded-xl">

        <div className="text-center px-6">

          <MapPin
            size={30}
            className="mx-auto text-ink-200 mb-3"
          />

          <p className="text-sm font-semibold text-ink-700">
            Select an active dispatch
          </p>

          <p className="text-xs text-ink-400 mt-1">
            Choose a vehicle from the list to view
            its live location.
          </p>

        </div>

      </div>
    )
  }


  const request =
    dispatch.requests?.find(
      (item) => item?.id
    )


  if (!request?.id) {
    return (
      <div className="h-full min-h-[340px] flex items-center justify-center bg-surface-muted rounded-xl">

        <div className="text-center px-6">

          <MapPin
            size={30}
            className="mx-auto text-ink-200 mb-3"
          />

          <p className="text-sm font-semibold text-ink-700">
            Live location unavailable
          </p>

          <p className="text-xs text-ink-400 mt-1">
            This dispatch does not have a valid
            transport request ID.
          </p>

        </div>

      </div>
    )
  }


  return (
    <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden shadow-card h-full min-h-[420px]">
      <LiveTripLocation
        requestId={request.id}
        status={request.status}
        isPassenger={false}
      />
    </div>
  )
}


/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */

export default function ActiveTrips() {

  usePageMeta({
    title: 'Active Trips',
    breadcrumb: 'Transport Operations',
  })


  const navigate =
    useNavigate()


  const { invalidate } =
    useQueryCache()


  const [expanded, setExpanded] =
    useState(null)


  const [selectedMap, setSelectedMap] =
    useState(null)


  /* ─────────────────────────────────────────
     FETCH ACTIVE TRIPS
  ───────────────────────────────────────── */

  const {
    data: trips = [],
    loading,
    error,
    refetch,
  } = useQuery(
    'active-trips',
    getActiveTrips,
    {
      ttl: 25_000,
    },
  )


  /* ─────────────────────────────────────────
     AUTO REFRESH ACTIVE TRIPS
  ───────────────────────────────────────── */

  useEffect(() => {

    const id =
      setInterval(
        () =>
          invalidate(
            'active-trips'
          ),
        30_000
      )


    return () =>
      clearInterval(id)

  }, [invalidate])


  /* ─────────────────────────────────────────
     GROUP REQUESTS INTO DISPATCHES
  ───────────────────────────────────────── */

  const groupedDispatches =
    useMemo(() => {

      const map = {}


      trips.forEach((trip) => {

        const key =
          trip.assignment_id
            ? `assignment-${trip.assignment_id}`
            : `single-${trip.id}`


        if (!map[key]) {

          map[key] = {

            id: key,

            isPooled:
              !!trip.assignment_id,

            driver:
              trip.driver ||
              trip.assignment?.driver ||
              {
                name: '—',
              },

            vehicle:
              trip.vehicle ||
              trip.assignment?.vehicle ||
              {
                plate_number: '—',
              },

            requests: [],

            start_time:
              trip.start_time ||
              trip.created_at ||
              new Date().toISOString(),

          }

        }


        map[key].requests.push(trip)

      })


      return Object.values(map)

    }, [trips])


  /* ─────────────────────────────────────────
     KEEP A VALID MAP SELECTION
  ───────────────────────────────────────── */

  useEffect(() => {

    if (
      groupedDispatches.length === 0
    ) {

      setSelectedMap(null)

      return

    }


    const stillExists =
      groupedDispatches.some(
        (dispatch) =>
          dispatch.id === selectedMap
      )


    if (!selectedMap || !stillExists) {

      setSelectedMap(
        groupedDispatches[0].id
      )

    }

  }, [
    groupedDispatches,
    selectedMap,
  ])


  /* ─────────────────────────────────────────
     SELECT DISPATCH
  ───────────────────────────────────────── */

  const handleSelectMap =
    useCallback((id) => {

      setSelectedMap(id)

    }, [])


  const selectedDispatch =
    groupedDispatches.find(
      (dispatch) =>
        dispatch.id === selectedMap
    ) || groupedDispatches[0] || null


  /* ─────────────────────────────────────────
     LOADING
  ───────────────────────────────────────── */

  if (
    loading &&
    trips.length === 0
  ) {

    return (
      <div className="flex h-64 items-center justify-center">

        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />

      </div>
    )
  }


  /* ─────────────────────────────────────────
     PAGE
  ───────────────────────────────────────── */

  return (

    <div className="p-4 max-w-7xl mx-auto pb-12 space-y-6">


      {/* ─────────────────────────────────────
          ERROR
      ───────────────────────────────────── */}

      {error && (

        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">

          <AlertCircle size={16} />

          <span>
            {error?.message ||
              'Failed to load active trips'}
          </span>

          <button
            onClick={refetch}
            className="ml-auto text-xs underline"
          >
            Retry
          </button>

        </div>

      )}


      {/* ─────────────────────────────────────
          LIVE FLEET MAP
      ───────────────────────────────────── */}

      <div className="bg-surface border border-border-subtle rounded-card shadow-sm overflow-hidden">


        {/* Header */}

        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-1.5">

              <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />

              <span className="text-sm font-semibold text-ink-900">
                Live Fleet Map
              </span>

            </div>


            <span className="text-xs text-ink-300 bg-gray-100 px-2 py-0.5 rounded-full font-mono">

              {groupedDispatches.length}

              {' '}

              vehicle
              {groupedDispatches.length !== 1
                ? 's'
                : ''}

              {' '}
              active

            </span>

          </div>


          <div className="flex items-center gap-2">

            <span className="text-xs text-ink-300">
              Location updates every 10s
            </span>


            <button
              onClick={refetch}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-ink-400 hover:text-ink-900 transition-colors"
              title="Refresh active trips"
            >
              <RefreshCw size={14} />
            </button>

          </div>

        </div>


        {/* Map + sidebar */}

        {groupedDispatches.length === 0 ? (

          <div className="h-64 flex items-center justify-center text-sm text-ink-400">

            No active vehicles to display on map.

          </div>

        ) : (

          <div
            className="flex flex-col lg:flex-row"
            style={{
              minHeight: 420,
            }}
          >


            {/* ─────────────────────────────
                REAL LIVE MAP
            ───────────────────────────── */}

            <div className="flex-1 min-h-[420px] p-3">

              <ActiveTripLiveMap
                dispatch={selectedDispatch}
              />

            </div>


            {/* ─────────────────────────────
                SIDEBAR
            ───────────────────────────── */}

            <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-border-subtle overflow-y-auto max-h-[420px]">

              <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-ink-300 border-b border-border-subtle">
                Active Dispatches
              </div>


              {groupedDispatches.map(
                (disp) => {

                  const isSelected =
                    selectedMap === disp.id


                  const firstRequest =
                    disp.requests?.[0]


                  return (

                    <button
                      key={disp.id}
                      onClick={() =>
                        handleSelectMap(
                          disp.id
                        )
                      }
                      className={`
                        w-full
                        text-left
                        px-3
                        py-3
                        border-b
                        border-gray-50
                        transition-colors

                        ${
                          isSelected
                            ? 'bg-brand-green-50'
                            : 'hover:bg-surface-muted'
                        }
                      `}
                    >

                      <div className="flex items-center gap-2">

                        <div
                          className={`
                            w-2
                            h-2
                            rounded-full

                            ${
                              isSelected
                                ? 'bg-brand-green'
                                : 'bg-blue-400'
                            }
                          `}
                        />


                        <span className="font-mono text-xs font-bold text-ink-900">

                          {disp.vehicle?.plate_number ||
                            '—'}

                        </span>


                        {disp.isPooled && (

                          <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                            Pool
                          </span>

                        )}

                      </div>


                      <p className="text-[11px] text-ink-400 mt-1 pl-4">

                        {getDriverDisplayName(disp.driver) ||
                          disp.driver?.first_name ||
                          '—'}

                        {' · '}

                        {disp.requests.length}
                        {' pax'}

                      </p>


                      <p className="text-[11px] text-ink-300 truncate pl-4 mt-0.5">

                        {disp.requests
                          .map(
                            (r) =>
                              r.destination
                          )
                          .filter(Boolean)
                          .join(' ▸ ')}

                      </p>


                      {/* Live-location indicator */}

                      {firstRequest && (

                        <div className="flex items-center gap-1 pl-4 mt-1.5">

                          <span
                            className={`
                              w-1.5
                              h-1.5
                              rounded-full

                              ${
                                [
                                  'ASSIGNED',
                                  'DRIVER_SPOTTED',
                                  'BOARDED_WAITING',
                                  'IN_USE',
                                ].includes(
                                  firstRequest.status
                                )
                                  ? 'bg-brand-green animate-pulse'
                                  : 'bg-gray-300'
                              }
                            `}
                          />

                          <span className="text-[10px] text-ink-300">
                            Live tracking
                          </span>

                        </div>

                      )}

                    </button>

                  )

                }
              )}

            </div>

          </div>

        )}

      </div>


      {/* ─────────────────────────────────────
          DISPATCH TABLE
      ───────────────────────────────────── */}

      {groupedDispatches.length === 0 ? (

        <EmptyState
          icon={Car}
          message="No trips currently in progress."
        />

      ) : (

        <div className="bg-surface border border-border-subtle rounded-card shadow-sm overflow-hidden">


          <div className="px-4 py-3 border-b border-border-subtle">

            <h3 className="text-sm font-semibold text-ink-900">
              Dispatch Details
            </h3>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-[800px]">


              <thead>

                <tr className="bg-surface-muted border-b border-border-subtle">

                  {[
                    '',
                    'Type',
                    'Passengers',
                    'Driver',
                    'Vehicle',
                    'Destination(s)',
                    'Status',
                    'Duration',
                    'Actions',
                  ].map((h) => (

                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400"
                    >
                      {h}
                    </th>

                  ))}

                </tr>

              </thead>


              <tbody>

                {groupedDispatches.map(
                  (disp) => {

                    const elapsed =
                      Math.floor(
                        (
                          Date.now() -
                          new Date(
                            disp.start_time
                          ).getTime()
                        ) / 60000
                      )


                    const isExpanded =
                      expanded === disp.id


                    const destinations =
                      disp.requests
                        .map(
                          (r) =>
                            r.destination
                        )
                        .filter(Boolean)
                        .join(' ➔ ')


                    const isSelected =
                      selectedMap === disp.id


                    return (
                      <React.Fragment
                        key={disp.id}
                      >


                        {/* Main row */}

                        <tr
                          className={`
                            border-b
                            border-border-subtle
                            transition-colors
                            cursor-pointer

                            ${
                              isSelected
                                ? 'bg-brand-green-50'
                                : 'hover:bg-surface-muted/75'
                            }
                          `}
                          onClick={() =>
                            handleSelectMap(
                              disp.id
                            )
                          }
                        >


                          {/* Expand */}

                          <td className="px-4 py-3">

                            <button
                              onClick={(e) => {

                                e.stopPropagation()

                                setExpanded(
                                  isExpanded
                                    ? null
                                    : disp.id
                                )

                              }}
                              className="text-ink-400 hover:text-ink-900 p-1"
                            >

                              {isExpanded
                                ? <ChevronDown size={16} />
                                : <ChevronRight size={16} />
                              }

                            </button>

                          </td>


                          {/* Type */}

                          <td className="px-4 py-3 font-semibold">

                            {disp.isPooled ? (

                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 border border-purple-200 text-purple-700">

                                <Users size={12} />

                                Pooled

                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">

                                Single

                              </span>

                            )}

                          </td>


                          {/* Passengers */}

                          <td className="px-4 py-3">

                            <div className="flex flex-col gap-0.5">

                              {disp.requests.map(
                                (r) => (

                                  <span
                                    key={r.id}
                                    className="text-xs text-ink-900 font-medium"
                                  >

                                    {r.requester?.first_name}

                                    {' '}

                                    {r.requester?.last_name}

                                  </span>

                                )
                              )}

                            </div>

                          </td>


                          {/* Driver */}

                          <td className="px-4 py-3 font-medium text-ink-700">

                            {getDriverDisplayName(disp.driver) ||
                              disp.driver?.first_name ||
                              '—'}

                          </td>


                          {/* Vehicle */}

                          <td className="px-4 py-3 font-mono text-[13px] text-ink-600">

                            {disp.vehicle?.plate_number ||
                              '—'}

                          </td>


                          {/* Destination */}

                          <td
                            className="px-4 py-3 max-w-[180px] truncate font-medium text-ink-700"
                            title={destinations}
                          >
                            {destinations || '—'}
                          </td>


                          {/* Status */}

                          <td className="px-4 py-3">

                            <div className="flex flex-col gap-1">

                              {disp.requests.map(
                                (r) => (

                                  <div
                                    key={r.id}
                                    className="flex items-center gap-1 text-[11px]"
                                  >

                                    <span className="font-semibold text-ink-600">
                                      #{r.id}:
                                    </span>

                                    <StatusPill
                                      status={
                                        r.status
                                      }
                                    />

                                  </div>

                                )
                              )}

                            </div>

                          </td>


                          {/* Duration */}

                          <td className="px-4 py-3 font-mono text-[13px] text-ink-400">

                            <span className="flex items-center gap-1">

                              <Clock size={12} />

                              {elapsed}m

                            </span>

                          </td>


                          {/* Actions */}

                          <td className="px-4 py-3">

                            <div className="flex gap-1.5">

                              {disp.requests.map(
                                (r) => (

                                  <button
                                    key={r.id}
                                    onClick={(e) => {

                                      e.stopPropagation()

                                      navigate(
                                        `/transport/requests/${r.id}`
                                      )

                                    }}
                                    className="text-ink-600 hover:text-brand-green p-1 border border-border-subtle rounded hover:bg-surface-muted flex items-center gap-1 text-xs"
                                    title={`View Request #${r.id}`}
                                  >

                                    <Eye size={12} />

                                    {r.id}

                                  </button>

                                )
                              )}

                            </div>

                          </td>

                        </tr>


                        {/* Expanded passenger progress */}

                        {isExpanded && (

                          <tr className="bg-surface-muted/40 border-b border-border-subtle">

                            <td
                              colSpan={9}
                              className="px-8 py-5 space-y-4"
                            >

                              <h5 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">
                                Passenger Progress
                              </h5>


                              {disp.requests.map(
                                (r) => (

                                  <div
                                    key={r.id}
                                    className="border-l-2 border-brand-green/30 pl-4 py-2 bg-surface rounded-r-xl border border-border-subtle/50 p-3 shadow-sm mb-3"
                                  >

                                    <p className="text-xs font-bold text-ink-900 mb-2">

                                      Request #{r.id}

                                      {' — '}

                                      {r.requester?.first_name}

                                      {' '}

                                      {r.requester?.last_name}


                                      {r.destination && (

                                        <span className="ml-2 font-normal text-ink-400 flex items-center gap-1 inline-flex">

                                          <MapPin size={10} />

                                          {r.destination}

                                        </span>

                                      )}

                                    </p>


                                    <TripTimeline
                                      currentStep={
                                        r.status
                                      }
                                    />

                                  </div>

                                )
                              )}

                            </td>

                          </tr>

                        )}

                      </React.Fragment>
                    )

                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  )
}
