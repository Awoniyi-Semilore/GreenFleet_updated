import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ allow, children }) {
  const { user, isAuthenticated, loading, allowedPortals } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-muted">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent mx-auto"></div>
          <p className="text-sm text-ink-600">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has access to ANY of the allowed portals
  const hasAccess = allow.some((portal) => allowedPortals.includes(portal))

  if (!hasAccess) {
    // Redirect to their primary portal dashboard
    const primaryPortal = allowedPortals[0] || 'staff'
    return <Navigate to={`/${primaryPortal}/dashboard`} replace />
  }

  return children
}