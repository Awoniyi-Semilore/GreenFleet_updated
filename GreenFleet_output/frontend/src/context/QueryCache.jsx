/**
 * QueryCache — lightweight fetch-and-cache context.
 *
 * Replaces scattered per-page useEffect fetches with a single shared cache.
 * Keys are strings; data is stored in a Map with a staleness TTL.
 * Components call `useQuery(key, fetcher)` and get { data, loading, error, refetch }.
 * On navigation the data is ALREADY there — no re-fetch unless stale or explicitly invalidated.
 */
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react'

const DEFAULT_TTL = 60_000   // 1 minute fresh window
const BACKGROUND_REVALIDATE = true   // silently refresh stale data in the background

const CacheCtx = createContext(null)

export function QueryCacheProvider({ children }) {
  // cache: Map<key, { data, fetchedAt, promise? }>
  const cache = useRef(new Map())
  // subscribers: Map<key, Set<() => void>> — notified when a key is updated
  const subs = useRef(new Map())

  const notify = useCallback((key) => {
    subs.current.get(key)?.forEach((fn) => fn())
  }, [])

  const subscribe = useCallback((key, fn) => {
    if (!subs.current.has(key)) subs.current.set(key, new Set())
    subs.current.get(key).add(fn)
    return () => subs.current.get(key)?.delete(fn)
  }, [])

  /** Fetch or return cached data for `key`. */
  const fetch = useCallback(async (key, fetcher, { ttl = DEFAULT_TTL, force = false } = {}) => {
    const entry = cache.current.get(key)
    const now = Date.now()

    // Fresh cache hit
    if (!force && entry && now - entry.fetchedAt < ttl) {
      return entry.data
    }

    // Deduplicate in-flight requests for the same key
    if (entry?.promise) {
      return entry.promise
    }

    const promise = fetcher().then((data) => {
      cache.current.set(key, { data, fetchedAt: Date.now(), promise: null })
      notify(key)
      return data
    }).catch((err) => {
      // Remove promise reference so next call retries
      const existing = cache.current.get(key)
      if (existing) cache.current.set(key, { ...existing, promise: null })
      throw err
    })

    // Stash in-flight promise (keep old data for background revalidation)
    cache.current.set(key, { ...(entry || {}), promise })
    return promise
  }, [notify])

  /** Invalidate one or more keys (next read will re-fetch). */
  const invalidate = useCallback((...keys) => {
    keys.forEach((k) => {
      const entry = cache.current.get(k)
      if (entry) cache.current.set(k, { ...entry, fetchedAt: 0 })
      notify(k)
    })
  }, [notify])

  /** Invalidate all keys that start with a prefix. */
  const invalidatePrefix = useCallback((prefix) => {
    cache.current.forEach((_, key) => {
      if (key.startsWith(prefix)) invalidate(key)
    })
  }, [invalidate])

  /** Write a value directly into the cache (optimistic update). */
  const setData = useCallback((key, data) => {
    cache.current.set(key, { data, fetchedAt: Date.now(), promise: null })
    notify(key)
  }, [notify])

  /** Read current cached value synchronously (or undefined). */
  const peek = useCallback((key) => cache.current.get(key)?.data, [])

  return (
    <CacheCtx.Provider value={{ fetch, invalidate, invalidatePrefix, setData, peek, subscribe }}>
      {children}
    </CacheCtx.Provider>
  )
}

export function useQueryCache() {
  const ctx = useContext(CacheCtx)
  if (!ctx) throw new Error('useQueryCache must be inside QueryCacheProvider')
  return ctx
}

/**
 * Hook: useQuery(key, fetcher, options?)
 *
 * options:
 *   ttl        — ms before data is considered stale (default 60 000)
 *   enabled    — set false to skip fetching (default true)
 *   onSuccess  — callback(data)
 *   onError    — callback(err)
 */
export function useQuery(key, fetcher, { ttl = DEFAULT_TTL, enabled = true, onSuccess, onError } = {}) {
  const { fetch, peek, subscribe, invalidate } = useQueryCache()

  // seed state from cache synchronously (avoids flicker when navigating back)
  const [state, setState] = useState(() => {
    const cached = peek(key)
    return {
      data: cached ?? undefined,
      loading: cached === undefined,
      error: null,
    }
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const run = useCallback(async (force = false) => {
    if (!enabled) return
    // If we already have fresh data and no forced refetch, stay silent
    const cached = peek(key)
    if (!force && cached !== undefined) {
      if (stateRef.current.data !== cached) {
        setState({ data: cached, loading: false, error: null })
      }
    } else {
      setState((s) => ({ ...s, loading: true, error: null }))
    }

    try {
      const data = await fetch(key, fetcher, { ttl, force })
      setState({ data, loading: false, error: null })
      onSuccess?.(data)
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err }))
      onError?.(err)
    }
  }, [key, fetcher, fetch, peek, ttl, enabled, onSuccess, onError])

  // Run on mount and when key / enabled changes
  useEffect(() => {
    run()
    // Subscribe to external invalidations
    const unsub = subscribe(key, () => run())
    return unsub
  }, [key, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => run(true), [run])

  return { ...state, refetch }
}

/**
 * Hook: useMutation(mutationFn, invalidateKeys?)
 *
 * Returns { mutate, loading, error }
 * After success it invalidates the supplied cache keys.
 */
export function useMutation(mutationFn, invalidateKeys = []) {
  const { invalidate } = useQueryCache()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(...args)
      invalidate(...invalidateKeys)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutationFn, invalidate, ...invalidateKeys]) // eslint-disable-line react-hooks/exhaustive-deps

  return { mutate, loading, error }
}
