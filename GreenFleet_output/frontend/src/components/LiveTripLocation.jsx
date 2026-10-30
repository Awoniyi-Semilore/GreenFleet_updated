import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react'

import {
  MapPin,
  Navigation,
  LocateFixed,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

import {
  updateTripLocation,
  getTripLocation,
  stopTripLocation,
} from '../data/api.js'


/*
 * ============================================================
 * LEAFLET VEHICLE ICON
 * ============================================================
 */

const vehicleIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
})


/*
 * ============================================================
 * MAP DEBUG / RESIZE HANDLER
 * ============================================================
 *
 * Leaflet can calculate the wrong dimensions when a map
 * appears after conditional rendering or when its parent
 * changes size.
 *
 * invalidateSize() tells Leaflet:
 *
 * "Recalculate the actual size of your container."
 *
 * This is particularly important for:
 *
 * - responsive layouts
 * - cards
 * - conditional rendering
 * - loading -> map transitions
 * - browser resizing
 * - sidebar/layout changes
 */

function MapReadyHandler() {
  const map = useMap()

  useEffect(() => {
    console.log(
      '[LiveTripLocation][MAP] Map instance mounted.'
    )

    const logMapSize = (source) => {
      const container =
        map.getContainer()

      const rect =
        container?.getBoundingClientRect()

      console.log(
        `[LiveTripLocation][MAP] invalidateSize triggered by: ${source}`,
        {
          containerWidth:
            rect?.width,

          containerHeight:
            rect?.height,

          mapSize:
            map.getSize(),

          zoom:
            map.getZoom(),

          center:
            map.getCenter(),
        }
      )

      map.invalidateSize({
        animate: false,
      })
    }


    /*
     * Initial correction.
     *
     * requestAnimationFrame allows the browser to
     * finish painting the container before Leaflet
     * measures it.
     */
    const frame =
      requestAnimationFrame(() => {
        logMapSize(
          'initial render'
        )
      })


    /*
     * Run again shortly after mounting.
     *
     * This catches cases where the parent/card has
     * finished resizing after the first frame.
     */
    const timeout =
      setTimeout(() => {
        logMapSize(
          'delayed render'
        )
      }, 300)


    /*
     * Watch the map container for size changes.
     *
     * This is safer than trying to guess every possible
     * UI event that could change the map dimensions.
     */
    let resizeObserver = null

    if (
      typeof ResizeObserver !==
      'undefined'
    ) {
      resizeObserver =
        new ResizeObserver(() => {
          console.log(
            '[LiveTripLocation][MAP] Container size changed.'
          )

          logMapSize(
            'ResizeObserver'
          )
        })

      resizeObserver.observe(
        map.getContainer()
      )
    }


    /*
     * Browser window resize fallback.
     */
    const handleWindowResize = () => {
      console.log(
        '[LiveTripLocation][MAP] Window resized.'
      )

      logMapSize(
        'window resize'
      )
    }

    window.addEventListener(
      'resize',
      handleWindowResize
    )


    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)

      window.removeEventListener(
        'resize',
        handleWindowResize
      )

      resizeObserver?.disconnect()
    }
  }, [map])

  return null
}


/*
 * ============================================================
 * MAP FOLLOWER — SMOOTH PANNING
 * ============================================================
 *
 * This component watches for location changes and uses
 * setView() with animation instead of re-rendering the
 * entire MapContainer. This prevents Leaflet from
 * re-initializing and causing shaking/flickering.
 *
 * FIX for Issue #3: Map shaking
 */

function MapFollower({ position }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !position) return

    const newCenter = [
      position.latitude,
      position.longitude,
    ]

    /*
     * Use setView() with smooth animation instead of
     * changing the center prop, which would cause
     * MapContainer to re-render and Leaflet to reset.
     */
    map.setView(newCenter, 15, {
      animate: true,
      duration: 0.5,
    })

    console.log(
      '[LiveTripLocation][MAP] Smoothly panned to position.',
      {
        latitude: position.latitude,
        longitude: position.longitude,
      }
    )
  }, [
    map,
    position?.latitude,
    position?.longitude,
  ])

  return null
}


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getLocationStatusMessage(
  status,
  customMessage = ''
) {
  if (customMessage) {
    return customMessage
  }

  switch (status) {
    case 'LIVE':
      return 'Live location being shared by a passenger.'
    case 'NO_PASSENGER_SHARING':
      return 'No passenger is currently sharing live location.'
    case 'SHARING_STOPPED':
      return 'Live location sharing has been stopped.'
    case 'LOCATION_STALE':
      return 'The shared location has not been updated recently.'
    default:
      return 'Live vehicle location is currently unavailable.'
  }
}

function formatLastUpdated(dateString) {
  if (!dateString) {
    return 'Not yet'
  }

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      return 'Unknown'
    }

    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)

    if (diffSecs < 60) {
      return `${diffSecs}s ago`
    }

    const diffMins = Math.floor(diffSecs / 60)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    }

    const diffHours = Math.floor(diffMins / 60)

    if (diffHours < 24) {
      return `${diffHours}h ago`
    }

    return date.toLocaleTimeString(
      [],
      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    )
  } catch (e) {
    return 'Unknown'
  }
}


/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 *
 * FIX for Issue #2: Driver names showing as "—"
 * Now using defensive fallback chain:
 * 1. driver.first_name + driver.last_name (primary)
 * 2. driver.user.first_name + driver.user.last_name (alternate)
 * 3. request.driver.name (legacy)
 */

export default function LiveTripLocation({
  requestId,
  status,
  isPassenger = true,
}) {
  const [location, setLocation] =
    useState(null)

  const [locationStatus, setLocationStatus] =
    useState('NOT_SHARED')

  const [locationMessage, setLocationMessage] =
    useState('')

  const [sharingSummary, setSharingSummary] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [sharing, setSharing] =
    useState(false)

  const [permissionError, setPermissionError] =
    useState('')

  const [serverError, setServerError] =
    useState('')

  const [sharingError, setSharingError] =
    useState('')

  const [lastSuccessfulSend, setLastSuccessfulSend] =
    useState(null)

  const [wakeLockActive, setWakeLockActive] =
    useState(false)

  const wakeLockRef =
    useRef(null)

  const lastSentRef =
    useRef(0)

  const sendingLocationRef =
    useRef(false)

  const lastPositionRef =
    useRef(null)

  const watchIdRef =
    useRef(null)

  const mountedRef =
    useRef(true)


  /*
   * ==========================================================
   * DEBUG: COMPONENT MOUNT
   * ==========================================================
   */

  useEffect(() => {
    console.log(
      '[LiveTripLocation] Component mounted.',
      {
        requestId,
        status,
        isPassenger,
      }
    )

    return () => {
      console.log(
        '[LiveTripLocation] Component unmounted.',
        {
          requestId,
        }
      )
      
      mountedRef.current = false
      stopWatching()
      releaseWakeLock()
    }
  }, [])


  /*
   * ==========================================================
   * TRACKING PERMISSION
   * ==========================================================
   */

  const trackingAllowed = [
    'ASSIGNED',
    'DRIVER_SPOTTED',
    'BOARDED_WAITING',
    'IN_USE',
  ].includes(status)


  /*
   * ==========================================================
   * STOP BROWSER GPS WATCHER
   * ==========================================================
   */

  function stopWatching() {
    if (
      watchIdRef.current !== null &&
      navigator.geolocation
    ) {
      console.log(
        '[LiveTripLocation][GPS] Clearing GPS watcher.',
        {
          watchId:
            watchIdRef.current,
        }
      )

      navigator.geolocation.clearWatch(
        watchIdRef.current
      )

      watchIdRef.current = null
    }
  }


  async function releaseWakeLock() {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch (error) {
        console.warn('[LiveTripLocation][WAKE_LOCK] Failed to release screen wake lock.', error)
      }

      wakeLockRef.current = null
    }

    if (mountedRef.current) {
      setWakeLockActive(false)
    }
  }


  async function requestWakeLock() {
    if (!navigator.wakeLock?.request) {
      return false
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      wakeLockRef.current.addEventListener('release', () => {
        if (mountedRef.current) {
          setWakeLockActive(false)
        }
      })
      setWakeLockActive(true)
      return true
    } catch (error) {
      console.warn('[LiveTripLocation][WAKE_LOCK] Screen wake lock unavailable.', error)
      setWakeLockActive(false)
      return false
    }
  }


  async function sendLocationUpdate(position) {
    if (!position || sendingLocationRef.current) {
      return
    }

    const now = Date.now()

    if (now - lastSentRef.current < 5_000) {
      return
    }

    const {
      latitude,
      longitude,
      accuracy,
    } = position.coords

    lastSentRef.current = now
    sendingLocationRef.current = true

    try {
      await updateTripLocation(
        requestId,
        {
          latitude,
          longitude,
          accuracy,
        }
      )
      if (mountedRef.current) {
        setLastSuccessfulSend(new Date().toISOString())
        setSharingError('')
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'The location update could not be sent.'

      if (mountedRef.current) {
        setSharingError(message)
      }

      console.error(
        '[LiveTripLocation][GPS] Failed to send position.',
        {
          requestId,
          error,
        }
      )
    } finally {
      sendingLocationRef.current = false
    }
  }


  /*
   * ==========================================================
   * STOP SERVER LOCATION SHARING
   * ==========================================================
   */

  async function stopSharing() {
    console.log(
      '[LiveTripLocation][GPS] Stopping location sharing.',
      {
        requestId,
      }
    )

    stopWatching()
    await releaseWakeLock()

    setSharing(false)

    try {
      const response =
        await stopTripLocation(
          requestId
        )

      console.log(
        '[LiveTripLocation][GPS] Location sharing stopped on server.',
        {
          requestId,
          response,
        }
      )
    } catch (error) {
      console.error(
        '[LiveTripLocation][GPS] Failed to stop location sharing.',
        {
          requestId,
          error,
        }
      )
    }
  }


  /*
   * ==========================================================
   * START PASSENGER GPS SHARING
   * ==========================================================
   */

  async function startSharing() {
    if (!navigator.geolocation) {
      setPermissionError(
        'Your device does not support GPS location sharing.'
      )

      return
    }

    setPermissionError('')
    setSharingError('')
    setLastSuccessfulSend(null)
    setSharing(true)
    await requestWakeLock()

    try {
      console.log(
        '[LiveTripLocation][GPS] Requesting permission and starting GPS watch.'
      )

      watchIdRef.current =
        navigator.geolocation.watchPosition(
          async (position) => {
            lastPositionRef.current = position

            console.log(
              '[LiveTripLocation][GPS] Position received.',
              {
                requestId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            )

            await sendLocationUpdate(position)
          },
          (error) => {
            console.error(
              '[LiveTripLocation][GPS] Geolocation error.',
              {
                code: error.code,
                message: error.message,
              }
            )

            if (
              !mountedRef.current
            ) {
              return
            }

            setSharing(false)
            stopWatching()
            releaseWakeLock()

            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              setPermissionError(
                'Permission denied. Please enable location access in your device settings.'
              )
            } else if (
              error.code ===
              error.POSITION_UNAVAILABLE
            ) {
              setPermissionError(
                'Position unavailable.'
              )
            } else {
              setPermissionError(
                error.message ||
                'Failed to access GPS.'
              )
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10_000,
            maximumAge: 0,
          }
        )
    } catch (error) {
      console.error(
        '[LiveTripLocation][GPS] Failed to start sharing.',
        {
          requestId,
          error,
        }
      )

      setSharing(false)
      releaseWakeLock()
      setPermissionError(
        'Failed to start location sharing.'
      )
    }
  }


  // watchPosition is movement-driven in some browsers. A periodic heartbeat
  // keeps the server record fresh even when the laptop remains stationary.
  useEffect(() => {
    if (!sharing || !isPassenger || !navigator.geolocation) {
      return undefined
    }

    const requestCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => sendLocationUpdate(position),
        (error) => {
          console.warn(
            '[LiveTripLocation][GPS] Heartbeat position unavailable.',
            error.message
          )

          // Some laptop location providers cannot produce a fresh fix while
          // stationary. Re-send the last valid fix to keep the server record
          // alive, while the movement watcher remains the source of truth.
          if (lastPositionRef.current) {
            sendLocationUpdate(lastPositionRef.current)
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30_000,
          maximumAge: 60_000,
        }
      )
    }

    requestCurrentPosition()
    const interval = setInterval(requestCurrentPosition, 10_000)

    return () => clearInterval(interval)
  }, [sharing, isPassenger, requestId])


  /*
   * ==========================================================
   * FETCH TRIP LOCATION
   * ==========================================================
   */

  async function fetchTripLocation() {
    try {
      console.log(
        '[LiveTripLocation][API] Fetching trip location.',
        {
          requestId,
        }
      )

      const response =
        await getTripLocation(
          requestId
        )

      if (
        !mountedRef.current
      ) {
        return
      }

      const nextLocation =
        response?.data ?? null

      const nextStatus =
        response?.location_status ||
        'NOT_SHARED'


      console.log(
        '[LiveTripLocation][STATE] Updating location state.',
        {
          requestId,

          hasLocation:
            Boolean(
              nextLocation
            ),

          locationStatus:
            nextStatus,

          location:
            nextLocation,

          sharingSummary:
            response?.sharing_summary,
        }
      )


      setLocation(
        nextLocation
      )


      setLocationStatus(
        nextStatus
      )


      setLocationMessage(
        getLocationStatusMessage(
          nextStatus,
          response?.message
        )
      )


      setSharingSummary(
        response?.sharing_summary ?? null
      )


      setServerError('')
    } catch (error) {
      console.error(
        '[LiveTripLocation][API] Failed to load trip location.',
        {
          requestId,

          error,

          status:
            error?.response?.status,

          response:
            error?.response?.data,
        }
      )


      if (
        !mountedRef.current
      ) {
        return
      }


      setServerError(
        error?.response?.data?.message ||
        'Unable to load live vehicle location.'
      )
    } finally {
      if (
        mountedRef.current
      ) {
        setLoading(false)
      }
    }
  }


  /*
   * ==========================================================
   * INITIAL LOAD + POLLING
   * ==========================================================
   */

  useEffect(() => {
    mountedRef.current = true

    setLoading(true)
    setLocation(null)
    setLocationStatus('NOT_SHARED')
    setLocationMessage('')
    setSharingSummary(null)
    setServerError('')

    if (
      status === 'PENDING' ||
      status === 'PENDING_LINE_MANAGER' ||
      status === 'PENDING_ADMIN' ||
      status === 'APPROVED'
    ) {
      return
    }

    console.log(
      '[LiveTripLocation][FETCH] Setting up polling.',
      {
        requestId,
        status,
      }
    )

    fetchTripLocation()

    const interval =
      setInterval(
        fetchTripLocation,
        5_000
      )

    return () => {
      clearInterval(
        interval
      )
    }
  }, [requestId, status])


  // A different request must never inherit the previous request's GPS watch.
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [requestId])


  // Browsers release a screen wake lock when a document is hidden. Reacquire
  // it when the tracking page becomes visible again.
  useEffect(() => {
    if (!sharing || !isPassenger) {
      return undefined
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sharing, isPassenger])


  /*
   * ==========================================================
   * TERMINAL TRIP STATUS
   * ==========================================================
   */

  useEffect(() => {
    console.log(
      '[LiveTripLocation][STATUS] Trip status changed.',
      {
        requestId,
        status,
        trackingAllowed,
      }
    )


    if (
      isPassenger &&
      (
        status === 'COMPLETED' ||
        status === 'REJECTED' ||
        status === 'CANCELLED'
      )
    ) {
      console.log(
        '[LiveTripLocation][STATUS] Terminal status detected. Stopping sharing.',
        {
          requestId,
          status,
        }
      )

      stopSharing()
    }
  }, [status, isPassenger])


  /*
   * ==========================================================
   * DO NOT DISPLAY BEFORE ASSIGNMENT
   * ==========================================================
   */

  if (
    status === 'PENDING' ||
    status === 'PENDING_LINE_MANAGER' ||
    status === 'PENDING_ADMIN' ||
    status === 'APPROVED'
  ) {
    console.log(
      '[LiveTripLocation][UI] Tracking hidden because trip is not assigned.',
      {
        requestId,
        status,
      }
    )

    return null
  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="px-4 py-3 border-b border-border-subtle bg-surface-muted">

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-xl bg-brand-green-50 text-brand-green flex items-center justify-center">

              <Navigation
                size={15}
              />

            </div>


            <div>

              <h3 className="text-sm font-semibold text-ink-900">
                Live Vehicle Location
              </h3>

              <p className="text-2xs text-ink-400">
                Passenger-assisted location sharing
              </p>

            </div>

          </div>


          {locationStatus === 'LIVE' &&
            location && (

            <div className="flex items-center gap-1.5 text-2xs font-medium text-brand-green">

              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />

              Live

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading &&
        !location && (

        <div className="p-8 text-center">

          <RefreshCw
            size={25}
            className="mx-auto text-ink-300 animate-spin mb-3"
          />

          <p className="text-sm font-semibold text-ink-700">
            Checking vehicle location
          </p>

          <p className="text-xs text-ink-400 mt-1">
            Looking for an active location shared by a passenger.
          </p>

        </div>

      )}


      {/* =====================================================
          LIVE MAP — FIX FOR ISSUE #3: Container sizing
          ===================================================== */}

      {!loading &&
        location &&
        locationStatus === 'LIVE' && (

        <div className="relative h-[300px] sm:h-[380px] bg-surface-muted overflow-hidden">

          <MapContainer
            center={[
              location.latitude,
              location.longitude,
            ]}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* Critical map resize handler */}
            <MapReadyHandler />


            {/* Smooth panning (FIX for shaking) */}
            <MapFollower
              position={location}
            />


            <Marker
              position={[
                location.latitude,
                location.longitude,
              ]}
              icon={vehicleIcon}
            >

              <Popup>

                <strong>
                  GreenFleet Vehicle
                </strong>

                <br />

                Last updated:{' '}

                {formatLastUpdated(
                  location.last_updated_at
                )}

              </Popup>

            </Marker>


            {location.accuracy && (

              <Circle
                center={[
                  location.latitude,
                  location.longitude,
                ]}
                radius={
                  location.accuracy
                }
                pathOptions={{
                  fillOpacity: 0.08,
                }}
              />

            )}

          </MapContainer>


          {/* Map status */}

          <div className="absolute left-3 bottom-3 z-[1000] bg-white/95 backdrop-blur border border-border-subtle rounded-xl shadow-sm px-3 py-2">

            <div className="flex items-center gap-2">

              <LocateFixed
                size={14}
                className="text-brand-green"
              />


              <div>

                <p className="text-2xs font-semibold text-ink-800">
                  Vehicle location
                </p>

                <p className="text-[10px] text-ink-400">

                  Updated{' '}

                  {formatLastUpdated(
                    location.last_updated_at
                  )}

                </p>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          NO LIVE LOCATION
          ===================================================== */}

      {!loading &&
        !location && (

        <div className="p-8 text-center">

          <div className="w-12 h-12 mx-auto rounded-2xl bg-ink-50 text-ink-300 flex items-center justify-center mb-3">

            <MapPin
              size={25}
            />

          </div>


          <p className="text-sm font-semibold text-ink-700">
            Location unavailable
          </p>


          <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
            {locationMessage}
          </p>


          {sharingSummary && (

            <div className="mt-4 inline-flex items-center gap-2 text-2xs text-ink-400 bg-surface-muted border border-border-subtle rounded-xl px-3 py-2">

              <LocateFixed
                size={12}
              />

              <span>

                {sharingSummary.active_count > 0
                  ? `${sharingSummary.active_count} passenger${sharingSummary.active_count === 1 ? '' : 's'} currently sharing`
                  : `${sharingSummary.total_passengers} passenger${sharingSummary.total_passengers === 1 ? '' : 's'} on this assignment`
                }

              </span>

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          STALE LOCATION
          ===================================================== */}

      {!loading &&
        !location &&
        locationStatus ===
          'LOCATION_STALE' && (

        <div className="px-4 pb-4">

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">

            <RefreshCw
              size={14}
              className="shrink-0 mt-0.5"
            />

            <span>
              The vehicle's last shared location is no longer recent enough to display as live.
            </span>

          </div>

        </div>

      )}


      {/* =====================================================
          LOCATION SOURCE
          ===================================================== */}

      {location?.source_staff?.name && (

        <div className="px-4 py-3 border-t border-border-subtle">

          <div className="flex items-center justify-between gap-3">

            <div>

              <p className="text-2xs uppercase tracking-wider font-semibold text-ink-300">
                Location source
              </p>

              <p className="text-xs font-medium text-ink-700 mt-0.5">
                {location.source_staff.name}'s device
              </p>

            </div>


            {location.accuracy && (

              <p className="text-2xs text-ink-400">
                ±{Math.round(location.accuracy)}m
              </p>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          PASSENGER GPS CONTROLS
          ===================================================== */}

      {isPassenger &&
        trackingAllowed && (

        <div className="px-4 py-4 border-t border-border-subtle">

          {!sharing ? (

            <div>

              <div className="flex items-start gap-3 mb-3">

                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                  <LocateFixed
                    size={15}
                  />

                </div>


                <div>

                  <p className="text-sm font-semibold text-ink-800">
                    Support live trip visibility
                  </p>

                  <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">
                    If you are travelling in the assigned vehicle,
                    you may share this device's location so
                    authorised passengers and Transport Operations
                    can view the trip in real time.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  startSharing
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-green text-white rounded-btn px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >

                <Navigation
                  size={14}
                />

                Start location sharing

              </button>

            </div>

          ) : (

            <div>

              <div className="flex items-start gap-3 mb-3">

                <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 animate-pulse">

                  <LocateFixed
                    size={15}
                  />

                </div>


                <div>

                  <p className="text-sm font-semibold text-ink-800">
                    Location sharing is active
                  </p>

                  <p className="text-xs text-ink-400 mt-0.5">
                    GreenFleet is receiving location updates from this device.
                  </p>

                  <p className="text-[10px] text-ink-300 mt-1">
                    Last successful update:{' '}
                    {lastSuccessfulSend
                      ? formatLastUpdated(lastSuccessfulSend)
                      : 'Waiting for the first update'}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  stopSharing
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-100 text-red-700 rounded-btn px-4 py-2.5 text-sm font-semibold hover:bg-red-200 transition-colors"
              >

                Stop location sharing

              </button>

            </div>

          )}

          {!sharing && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-semibold">Operational requirement</p>
              <p className="mt-1 leading-relaxed">
                Keep this window open and keep the device powered on. Closing
                the browser or allowing the device to sleep will stop live
                location updates automatically.
              </p>
            </div>
          )}

          {sharing && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-semibold">
                {wakeLockActive
                  ? 'Screen will remain awake while sharing'
                  : 'Keep the screen awake while sharing'}
              </p>
              <p className="mt-1 leading-relaxed">
                Do not close this window, shut down the device, or allow it to
                enter sleep mode. Location updates stop when the device is
                asleep or powered off.
              </p>
            </div>
          )}

          {sharingError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <p className="font-semibold">Location update issue</p>
              <p className="mt-1 leading-relaxed">{sharingError}</p>
            </div>
          )}

          {permissionError && (

            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">

              <AlertCircle
                size={13}
                className="shrink-0 mt-0.5"
              />

              <span>
                {permissionError}
              </span>

            </div>

          )}

        </div>

      )}

      {serverError && (

        <div className="px-4 py-3 bg-red-50 border-t border-red-200">

          <div className="flex items-start gap-2 text-xs text-red-700">

            <AlertCircle
              size={13}
              className="shrink-0 mt-0.5"
            />

            <span>
              {serverError}
            </span>

          </div>

        </div>

      )}

    </div>
  )
}
