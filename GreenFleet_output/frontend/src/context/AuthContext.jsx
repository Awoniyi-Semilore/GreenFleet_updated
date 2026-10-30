import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../data/api.js'

const AuthContext = createContext(null)

// Map each role to its primary portal (for redirects)
const PORTAL_BY_ROLE = {
  Staff: 'staff',
  'Transport Admin': 'transport',
  'System Administrator': 'system',
}

// Map each role to ALL portals it can access (for permissions)
const ALLOWED_PORTALS_BY_ROLE = {
  Staff: ['staff'],
  'Transport Admin': ['transport', 
    // 'staff'
  ],
  'System Administrator': ['staff', 'transport', 'system'],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [portal, setPortal] = useState('staff')
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('greenfleet_token')
    const savedUser = localStorage.getItem('greenfleet_user')

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setPortal(PORTAL_BY_ROLE[parsed.role] || 'staff')
      } catch {
        localStorage.removeItem('greenfleet_token')
        localStorage.removeItem('greenfleet_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    const { token, user: loggedInUser } = await apiLogin(username, password)
    setUser(loggedInUser)
    setPortal(PORTAL_BY_ROLE[loggedInUser.role] || 'staff')
    return { token, user: loggedInUser }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      setUser(null)
      setPortal('staff')
      localStorage.removeItem('greenfleet_token')
      localStorage.removeItem('greenfleet_user')
    }
  }, [])

  const switchPortal = useCallback((next) => {
    // Only allow switching if the user's role permits this portal
    const allowed = ALLOWED_PORTALS_BY_ROLE[user?.role] || ['staff']
    if (allowed.includes(next)) {
      setPortal(next)
    }
  }, [user])

  const refreshUser = useCallback(async () => {
    const fresh = await getCurrentUser()
    setUser(fresh)
    localStorage.setItem('greenfleet_user', JSON.stringify(fresh))
    return fresh
  }, [])

  const allowedPortals = useMemo(() => {
    return ALLOWED_PORTALS_BY_ROLE[user?.role] || ['staff']
  }, [user])

  const isSuperAdmin = user?.role === 'System Administrator'
  const isAdmin = user?.role === 'Transport Admin' || user?.role === 'System Administrator'

  const value = useMemo(
    () => ({
      user,
      portal,
      allowedPortals,
      login,
      logout,
      switchPortal,
      refreshUser,
      isSuperAdmin,
      isAdmin,
      loading,
      isAuthenticated: !!user,
    }),
    [user, portal, allowedPortals, login, logout, switchPortal, refreshUser, isSuperAdmin, isAdmin, loading]
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}