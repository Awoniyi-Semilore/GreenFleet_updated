import React, { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Button from '../../components/Button.jsx'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useQuery, useQueryCache } from '../../context/QueryCache.jsx'

export default function Notifications() {
  usePageMeta({ title: 'Notifications', breadcrumb: 'Staff Portal' })
  const { showToast } = useToast()
  const { invalidate } = useQueryCache()

  const { data: notifications = [], loading, error, refetch } = useQuery(
    'notifications', getNotifications, { ttl: 20_000 }
  )

  const [localRead, setLocalRead] = useState(new Set())
  const unread = notifications.filter((n) => !n.is_read && !localRead.has(n.id)).length

  async function markRead(id) {
    try {
      await markNotificationRead(id)
      setLocalRead((s) => new Set([...s, id]))
    } catch { showToast('Failed to mark as read', 'error') }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead()
      setLocalRead(new Set(notifications.map((n) => n.id)))
      showToast('All marked as read.')
      invalidate('notifications')
    } catch { showToast('Failed to mark all as read', 'error') }
  }

  if (loading && notifications.length === 0) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-green border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3 text-sm text-red-700">
          {error?.message || 'Failed to load notifications'}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink-900">Notifications</h2>
          {unread > 0 && (
            <span className="text-2xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{unread} unread</span>
          )}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} message="You're all caught up — no notifications." />
        ) : (
          <div className="divide-y divide-border-subtle">
            {notifications.map((n) => {
              const read = n.is_read || localRead.has(n.id)
              return (
                <div
                  key={n.id}
                  onClick={() => !read && markRead(n.id)}
                  className={[
                    'flex items-start gap-3 px-4 py-4 transition-colors',
                    !read ? 'bg-brand-green-50 cursor-pointer hover:bg-brand-green-100' : 'cursor-default',
                  ].join(' ')}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!read ? 'bg-brand-green' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!read ? 'font-semibold text-ink-900' : 'font-medium text-ink-700'}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-xs text-ink-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-2xs text-ink-300 mt-1.5">
                      {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                      className="shrink-0 p-1.5 rounded-lg text-ink-300 hover:text-brand-green hover:bg-brand-green-50 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
