import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'

import StaffDashboard from './pages/staff/Dashboard.jsx'
import NewRequest from './pages/staff/NewRequest.jsx'
import MyRequests from './pages/staff/MyRequests.jsx'
import RequestDetails from './pages/staff/RequestDetails.jsx'
import Profile from './pages/staff/Profile.jsx'
import Notifications from './pages/staff/Notifications.jsx'

import TransportDashboard from './pages/transport/Dashboard.jsx'
import TransportRequests from './pages/transport/Requests.jsx'
import RequestReview from './pages/transport/RequestReview.jsx'
import VehicleAssignment from './pages/transport/VehicleAssignment.jsx'
import DriverAssignment from './pages/transport/DriverAssignment.jsx'
import ActiveTrips from './pages/transport/ActiveTrips.jsx'
import Vehicles from './pages/transport/Vehicles.jsx'
import VehicleDetails from './pages/transport/VehicleDetails.jsx'
import Drivers from './pages/transport/Drivers.jsx'
import DriverDetails from './pages/transport/DriverDetails.jsx'
import Branches from './pages/transport/Branches.jsx'
import Complaints from './pages/transport/Complaints.jsx'
import Reports from './pages/transport/Reports.jsx'
import FuelLogs from './pages/transport/FuelLogs.jsx'
import Maintenance from './pages/transport/Maintenance.jsx'
import Inspections from './pages/transport/Inspections.jsx'
import Documents from './pages/transport/Documents.jsx'

import SystemDashboard from './pages/system/Dashboard.jsx'
import Users from './pages/system/Users.jsx'
import RolesPermissions from './pages/system/RolesPermissions.jsx'
import Settings from './pages/system/Settings.jsx'
import AuditLogs from './pages/system/AuditLogs.jsx'
import EmailTemplates from './pages/system/EmailTemplates.jsx'
import Analytics from './pages/system/Analytics.jsx'
import Departments from './pages/system/Departments.jsx'

export default function App() {
  const { user, isAuthenticated, allowedPortals } = useAuth()

  // Primary portal for redirects (first in allowed list)
  const defaultPortal = allowedPortals[0] || 'staff'

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${defaultPortal}/dashboard`} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? `/${defaultPortal}/dashboard` : '/login'} replace />} />

      {/* Staff Portal — accessible by Staff and Super Admin */}
      <Route element={<ProtectedRoute allow={['staff']}><Layout /></ProtectedRoute>}>
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/new-request" element={<NewRequest />} />
        <Route path="/staff/my-requests" element={<MyRequests />} />
        <Route path="/staff/requests/:id" element={<RequestDetails />} />
        <Route path="/staff/notifications" element={<Notifications />} />
        <Route path="/staff/profile" element={<Profile />} />
      </Route>

      {/* Transport Portal — accessible by Transport Admin and Super Admin */}
      <Route element={<ProtectedRoute allow={['transport']}><Layout /></ProtectedRoute>}>
        <Route path="/transport/dashboard" element={<TransportDashboard />} />
        <Route path="/transport/requests" element={<TransportRequests />} />
        <Route path="/transport/requests/:id" element={<RequestReview />} />
        <Route path="/transport/vehicles/assign" element={<VehicleAssignment />} />
        <Route path="/transport/drivers/assign" element={<DriverAssignment />} />
        <Route path="/transport/active-trips" element={<ActiveTrips />} />
        <Route path="/transport/vehicles" element={<Vehicles />} />
        <Route path="/transport/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/transport/drivers" element={<Drivers />} />
        <Route path="/transport/drivers/:id" element={<DriverDetails />} />
        <Route path="/transport/branches" element={<Branches />} />
        <Route path="/transport/complaints" element={<Complaints />} />
        <Route path="/transport/reports" element={<Reports />} />
        <Route path="/transport/fuel-logs" element={<FuelLogs />} />
        <Route path="/transport/maintenance" element={<Maintenance />} />
        <Route path="/transport/inspections" element={<Inspections />} />
        <Route path="/transport/documents" element={<Documents />} />
      </Route>

      {/* System Admin Portal — accessible by Transport Admin and Super Admin */}
      <Route element={<ProtectedRoute allow={['system']}><Layout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<SystemDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/roles" element={<RolesPermissions />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/email-templates" element={<EmailTemplates />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? `/${defaultPortal}/dashboard` : '/login'} replace />} />
    </Routes>
  )
}