import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Truck, X, Menu, LogOut } from 'lucide-react'
import { NAV, PORTAL_LABEL } from '../lib/nav.js'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { portal, allowedPortals, switchPortal, user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const items = NAV[portal] || []
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '—'

  async function handleLogout() {
    try { await logout() } catch {}
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Hamburger — mobile only, when sidebar is closed */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-3.5 left-3.5 z-40 p-2 rounded-lg bg-brand-green-900 text-white shadow-card-md"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'bg-brand-green-900 text-white flex flex-col h-screen fixed md:sticky top-0 left-0 z-50',
          'w-[220px] transition-transform duration-200 ease-out shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-lime flex items-center justify-center shrink-0">
            <Truck size={15} className="text-brand-green-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white leading-tight">GreenFleet</div>
            <div className="text-2xs text-white/50 leading-tight mt-0.5 truncate">{PORTAL_LABEL[portal]}</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/50 hover:text-white p-1 transition-colors"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>

        {/* Portal switcher — only for multi-portal users */}
        {allowedPortals.length > 1 && (
          <div className="px-3 py-2.5 border-b border-white/10 shrink-0">
            <p className="text-2xs text-white/35 uppercase tracking-widest mb-1.5 px-1">Portal</p>
            <div className="flex flex-wrap gap-1">
              {allowedPortals.map((p) => (
                <button
                  key={p}
                  onClick={() => switchPortal(p)}
                  className={[
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    p === portal
                      ? 'bg-brand-lime text-brand-green-900'
                      : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white',
                  ].join(' ')}
                >
                  {PORTAL_LABEL[p] || p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2.5 mx-2 mb-0.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:bg-white/8 hover:text-white',
                ].join(' ')
              }
            >
              <item.icon size={16} className="shrink-0" />
              <span className="truncate text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User strip */}
        <div className="border-t border-white/10 px-3 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar name={displayName} size={30} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">{displayName}</p>
              <p className="text-2xs text-white/40 truncate mt-0.5">{user?.role || PORTAL_LABEL[portal]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
