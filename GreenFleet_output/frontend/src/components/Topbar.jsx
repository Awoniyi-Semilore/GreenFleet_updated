import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User as UserIcon, Menu, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../data/api.js'

const PORTAL_HOME = {
  staff:     '/staff/dashboard',
  transport: '/transport/dashboard',
  system:    '/admin/dashboard',
}

export default function Topbar({ title, breadcrumb, onMenuToggle }) {
  const { user, portal, switchPortal, logout, allowedPortals } = useAuth()
  const navigate = useNavigate()
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [notifOpen,      setNotifOpen]      = useState(false)
  const [notifications,  setNotifications]  = useState([])
  const [unreadCount,    setUnreadCount]    = useState(0)
  
  // Track if component is mounted + abort controller for fetch cancellation
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef(null)
  const pollTimeoutRef = useRef(null)

  const fetchNotifs = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      const data = await getNotifications()
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return
      
      const list = Array.isArray(data) ? data : []
      setNotifications(list.slice(0, 8))
      setUnreadCount(list.filter((n) => !n.is_read).length)
    } catch (err) {
      // Silently fail on abort or other errors
      if (!isMountedRef.current) return
    }
  }, [])

  useEffect(() => {
    // Initial fetch on mount
    fetchNotifs()
    
    // Refresh the in-app notification centre frequently enough to feel live
    // without requiring a WebSocket service.
    const setupPoll = () => {
      pollTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          fetchNotifs()
          setupPoll() // Reschedule
        }
      }, 10_000) // 10 seconds between polls
    }
    
    setupPoll()
    
    return () => {
      // Cleanup on unmount
      isMountedRef.current = false
      
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchNotifs])

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id)
      
      // Only update if still mounted
      if (!isMountedRef.current) return
      
      setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      
      // Only update if still mounted
      if (!isMountedRef.current) return
      
      setNotifications((p) => p.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  async function handleLogout() {
    try { await logout() } catch {}
    window.location.href = '/login'
  }

  function goPortal(next) {
    switchPortal(next)
    setMenuOpen(false)
    window.location.href = PORTAL_HOME[next] || '/staff/dashboard'
  }

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : '—'
  const userRole = user?.role?.name || user?.role || ''
  const notifRoute =
    portal === 'transport' ? '/transport/notifications' :
    portal === 'system'    ? '/admin/notifications'    :
    '/staff/notifications'

  return (
    <header className="h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-4 md:px-5 sticky top-0 z-30">
      {/* Left — hamburger + breadcrumb/title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-surface-muted text-ink-600 shrink-0 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          {breadcrumb && (
            <p className="text-2xs text-ink-300 uppercase tracking-wider leading-none mb-0.5 truncate">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-base font-semibold text-ink-900 leading-tight truncate">{title}</h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setMenuOpen(false) }}
            className="relative p-2 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-surface-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-80 bg-surface border border-border-subtle rounded-card shadow-card-md z-20 overflow-hidden animate-fade-up">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <span className="text-sm font-semibold text-ink-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-brand-green hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-ink-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-muted ${!n.is_read ? 'bg-brand-green-50' : ''}`}
                      >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.is_read ? 'bg-brand-green' : 'bg-ink-200'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-900 leading-snug">{n.title}</p>
                          <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-2xs text-ink-300 mt-1">
                            {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-border-subtle text-center">
                  <button
                    onClick={() => { setNotifOpen(false); navigate(notifRoute) }}
                    className="text-xs text-brand-green hover:underline font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative ml-2">
          <button
            onClick={() => { setMenuOpen((o) => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2 py-1.5 text-ink-700 rounded-lg hover:bg-surface-muted transition-colors"
            aria-label="User menu"
          >
            <Avatar
              src={user?.avatar_url}
              name={displayName}
              size={24}
            />
            <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-56 bg-surface border border-border-subtle rounded-card shadow-card-md z-20 overflow-hidden animate-fade-up">
                <div className="px-4 py-3 border-b border-border-subtle">
                  <p className="text-xs text-ink-300 uppercase font-semibold tracking-wider mb-1">
                    Logged in as
                  </p>
                  <p className="text-sm font-semibold text-ink-900">
                    {displayName}
                  </p>
                  {userRole && (
                    <p className="text-xs text-ink-500 mt-0.5">
                      {userRole}
                    </p>
                  )}
                </div>

                {allowedPortals && allowedPortals.length > 1 && (
                  <>
                    <div className="border-t border-border-subtle px-2 py-2 space-y-1">
                      {allowedPortals.map((p) => (
                        <button
                          key={p}
                          onClick={() => goPortal(p)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            portal === p
                              ? 'bg-brand-green text-white'
                              : 'text-ink-700 hover:bg-surface-muted'
                          }`}
                        >
                          {p === 'staff' ? 'Staff Portal' : p === 'transport' ? 'Transport Portal' : 'System Admin'}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="border-t border-border-subtle px-2 py-2 space-y-1">
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/${portal}/profile`) }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors flex items-center gap-2"
                  >
                    <UserIcon size={14} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/${portal}/settings`) }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors flex items-center gap-2"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                </div>

                <div className="border-t border-border-subtle px-2 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
