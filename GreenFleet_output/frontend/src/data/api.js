import axios from 'axios'

const getApiUrl = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
      return process.env.VITE_API_URL;
    }
    const globalEnv = (new Function('try { return import.meta.env; } catch(e) { return null; }'))();
    if (globalEnv && globalEnv.VITE_API_URL) {
      return globalEnv.VITE_API_URL;
    }
  } catch (err) {
    // Silent catch
  }
  return 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenfleet_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('greenfleet_token')
      localStorage.removeItem('greenfleet_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

function unwrap(response) {
  const payload = response.data
  const isSuccessful = payload.success === true || payload.status === 'success' || response.status === 200 || response.status === 201
  
  if (!isSuccessful) {
    const err = new Error(payload.message || 'Request failed')
    err.response = { data: payload }
    throw err
  }
  return payload.data ?? payload
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function login(username, password) {
  const res = await api.post('/login', { username, password })
  const data = unwrap(res)
  const { token, user } = data
  localStorage.setItem('greenfleet_token', token)
  localStorage.setItem('greenfleet_user', JSON.stringify(user))
  return { token, user }
}

export async function logout() {
  try {
    const res = await api.post('/logout')
    return unwrap(res)
  } finally {
    localStorage.removeItem('greenfleet_token')
    localStorage.removeItem('greenfleet_user')
  }
}

export async function getCurrentUser() {
  const res = await api.get('/user')
  return unwrap(res)
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getUsers() {
  const res = await api.get('/users')
  return unwrap(res)
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`)
  return unwrap(res)
}

export async function createUser(payload) {
  const res = await api.post('/users', payload)
  return unwrap(res)
}

export async function updateUser(id, payload) {
  const res = await api.put(`/users/${id}`, payload)
  return unwrap(res)
}

export async function updateUserStatus(id) {
  const res = await api.patch(`/users/${id}/status`)
  return unwrap(res)
}

export async function resetUserPassword(id) {
  const res = await api.patch(`/users/${id}/reset-password`)
  return unwrap(res)
}

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────

export async function getDepartments() {
  const res = await api.get('/departments')
  return unwrap(res)
}

export async function createDepartment(payload) {
  const res = await api.post('/departments', payload)
  return unwrap(res)
}

export async function updateDepartment(id, payload) {
  const res = await api.put(`/departments/${id}`, payload)
  return unwrap(res)
}

export async function deleteDepartment(id) {
  const res = await api.delete(`/departments/${id}`)
  return unwrap(res)
}

// ─── VEHICLE TYPES ───────────────────────────────────────────────────────────

export async function getVehicleTypes() {
  const res = await api.get('/vehicle-types')
  return unwrap(res)
}

export async function getVehicleTypeById(id) {
  const res = await api.get(`/vehicle-types/${id}`)
  return unwrap(res)
}

export async function createVehicleType(payload) {
  const res = await api.post('/vehicle-types', payload)
  return unwrap(res)
}

export async function updateVehicleType(id, payload) {
  const res = await api.put(`/vehicle-types/${id}`, payload)
  return unwrap(res)
}

export async function deleteVehicleType(id) {
  const res = await api.delete(`/vehicle-types/${id}`)
  return unwrap(res)
}

// ─── VEHICLE DOCUMENTS ───────────────────────────────────────────────────────

export async function getVehicleDocuments() {
  const res = await api.get('/vehicle-documents')
  return unwrap(res)
}

export async function getVehicleDocumentById(id) {
  const res = await api.get(`/vehicle-documents/${id}`)
  return unwrap(res)
}

export async function createVehicleDocument(payload) {
  const res = await api.post('/vehicle-documents', payload)
  return unwrap(res)
}

export async function updateVehicleDocument(id, payload) {
  const res = await api.put(`/vehicle-documents/${id}`, payload)
  return unwrap(res)
}

export async function deleteVehicleDocument(id) {
  const res = await api.delete(`/vehicle-documents/${id}`)
  return unwrap(res)
}

// ─── FUEL TYPES ──────────────────────────────────────────────────────────────

export async function getFuelTypes() {
  const res = await api.get('/fuel-types')
  return unwrap(res)
}

export async function getFuelTypeById(id) {
  const res = await api.get(`/fuel-types/${id}`)
  return unwrap(res)
}

export async function createFuelType(payload) {
  const res = await api.post('/fuel-types', payload)
  return unwrap(res)
}

export async function updateFuelType(id, payload) {
  const res = await api.put(`/fuel-types/${id}`, payload)
  return unwrap(res)
}

export async function deleteFuelType(id) {
  const res = await api.delete(`/fuel-types/${id}`)
  return unwrap(res)
}

// ─── VEHICLES ────────────────────────────────────────────────────────────────

export async function getVehicles() {
  const res = await api.get('/vehicles')
  return unwrap(res)
}

export async function getVehicleById(id) {
  const res = await api.get(`/vehicles/${id}`)
  return unwrap(res)
}

export async function createVehicle(payload) {
  const res = await api.post('/vehicles', payload)
  return unwrap(res)
}

export async function updateVehicle(id, payload) {
  const res = await api.put(`/vehicles/${id}`, payload)
  return unwrap(res)
}

export async function updateVehicleStatus(id, status) {
  const res = await api.patch(`/vehicles/${id}/status`, { status })
  return unwrap(res)
}

// ─── DRIVERS ─────────────────────────────────────────────────────────────────

export async function getDrivers() {
  const res = await api.get('/drivers')
  return unwrap(res)
}

export async function getDriverById(id) {
  const res = await api.get(`/drivers/${id}`)
  return unwrap(res)
}

export async function createDriver(payload) {
  const res = await api.post('/drivers', payload)
  return unwrap(res)
}

export async function updateDriver(id, payload) {
  const res = await api.put(`/drivers/${id}`, payload)
  return unwrap(res)
}

export async function updateDriverStatus(id) {
  const res = await api.patch(`/drivers/${id}/status`)
  return unwrap(res)
}

// ─── TRANSPORT REQUESTS ──────────────────────────────────────────────────────

export async function getTransportRequests() {
  const res = await api.get('/transport-requests')
  return unwrap(res)
}

export async function getTransportRequestById(id) {
  const res = await api.get(`/transport-requests/${id}`)
  return unwrap(res)
}

export async function createTransportRequest(payload) {
  const res = await api.post('/transport-requests', payload)
  return unwrap(res)
}

export async function updateTransportRequest(id, payload) {
  const res = await api.put(`/transport-requests/${id}`, payload)
  return unwrap(res)
}

export async function updateTransportRequestStatus(id, status) {
  const res = await api.patch(`/transport-requests/${id}/status`, { status })
  return unwrap(res)
}

// ─── PASSENGER-ASSISTED LIVE LOCATION ─────────────────────────────────────
/*
 * ============================================================
 * LIVE TRIP LOCATION
 * ============================================================
 */


/**
 * Send the authenticated passenger's
 * current GPS location to Laravel.
 */
export async function updateTripLocation(
  id,
  {
    latitude,
    longitude,
    accuracy,
  }
) {
  const response = await api.post(
    `/transport-requests/${id}/location`,
    {
      latitude,
      longitude,
      accuracy,
    }
  )

  return response.data
}


/**
 * Get the current live vehicle location
 * and its sharing state.
 *
 * IMPORTANT:
 *
 * Do NOT return only response.data.data.
 *
 * Laravel now returns:
 *
 * {
 *   success,
 *   data,
 *   location_status,
 *   message,
 *   sharing_summary
 * }
 *
 * The frontend needs all of it.
 */
export async function getTripLocation(
  id
) {
  const response = await api.get(
    `/transport-requests/${id}/location`
  )

  return response.data
}


/**
 * Stop the authenticated passenger's
 * live location sharing.
 */
export async function stopTripLocation(
  id
) {
  const response = await api.delete(
    `/transport-requests/${id}/location`
  )

  return response.data
}

// ─── APPROVAL FLOW ───────────────────────────────────────────────────────────

export async function approveRequest(id, { driverId, vehicleId, remarks } = {}) {
  const res = await api.post(`/transport-requests/${id}/approve`, {
    driver_id:  driverId  || null,
    vehicle_id: vehicleId || null,
    remarks:    remarks   || null,
  })
  return unwrap(res)
}

export async function rejectRequest(id, reason) {
  const res = await api.patch(`/transport-requests/${id}/status`, {
    status: 'REJECTED',
    reason,
  })
  return unwrap(res)
}

// ─── ACTIVE TRIPS ────────────────────────────────────────────────────────────

export async function getActiveTrips() {
  const res = await api.get('/active-trips')
  return unwrap(res)
}

// ─── APPROVALS ───────────────────────────────────────────────────────────────

export async function getApprovals() {
  const res = await api.get('/approvals')
  return unwrap(res)
}

export async function getApprovalById(id) {
  const res = await api.get(`/approvals/${id}`)
  return unwrap(res)
}

export async function createApproval(payload) {
  const res = await api.post('/approvals', payload)
  return unwrap(res)
}

export async function updateApproval(id, payload) {
  const res = await api.put(`/approvals/${id}`, payload)
  return unwrap(res)
}

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

export async function getAssignments() {
  const res = await api.get('/assignments')
  return unwrap(res)
}

export async function getAssignmentById(id) {
  const res = await api.get(`/assignments/${id}`)
  return unwrap(res)
}

export async function createAssignment(payload) {
  const res = await api.post('/assignments', payload)
  return unwrap(res)
}

export async function updateAssignment(id, payload) {
  const res = await api.put(`/assignments/${id}`, payload)
  return unwrap(res)
}

export async function deleteAssignment(id) {
  const res = await api.delete(`/assignments/${id}`)
  return unwrap(res)
}

// ─── TRIP LOGS ───────────────────────────────────────────────────────────────

// export async function getTripLogs() {
//   const res = await api.get('/trip-logs')
//   return unwrap(res)
// }

// export async function getTripLogById(id) {
//   const res = await api.get(`/trip-logs/${id}`)
//   return unwrap(res)
// }

// export async function createTripLog(payload) {
//   const res = await api.post('/trip-logs', payload)
//   return unwrap(res)
// }

// export async function updateTripLog(id, payload) {
//   const res = await api.put(`/trip-logs/${id}`, payload)
//   return unwrap(res)
// }

// export async function deleteTripLog(id) {
//   const res = await api.delete(`/trip-logs/${id}`)
//   return unwrap(res)
// }

// ─── FUEL LOGS ───────────────────────────────────────────────────────────────

export async function getFuelLogs() {
  const res = await api.get('/fuel-logs')
  return unwrap(res)
}

export async function getFuelLogById(id) {
  const res = await api.get(`/fuel-logs/${id}`)
  return unwrap(res)
}

export async function createFuelLog(payload) {
  const res = await api.post('/fuel-logs', payload)
  return unwrap(res)
}

export async function updateFuelLog(id, payload) {
  const res = await api.put(`/fuel-logs/${id}`, payload)
  return unwrap(res)
}

export async function deleteFuelLog(id) {
  const res = await api.delete(`/fuel-logs/${id}`)
  return unwrap(res)
}

// ─── MAINTENANCE RECORDS ─────────────────────────────────────────────────────

export async function getMaintenanceRecords() {
  const res = await api.get('/maintenance-records')
  return unwrap(res)
}

export async function getMaintenanceRecordById(id) {
  const res = await api.get(`/maintenance-records/${id}`)
  return unwrap(res)
}

export async function createMaintenanceRecord(payload) {
  const res = await api.post('/maintenance-records', payload)
  return unwrap(res)
}

export async function updateMaintenanceRecord(id, payload) {
  const res = await api.put(`/maintenance-records/${id}`, payload)
  return unwrap(res)
}

export async function deleteMaintenanceRecord(id) {
  const res = await api.delete(`/maintenance-records/${id}`)
  return unwrap(res)
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export async function getNotifications() {
  const res = await api.get('/notifications')
  return unwrap(res)
}

export async function getNotificationById(id) {
  const res = await api.get(`/notification/${id}`)
  return unwrap(res)
}

export async function createNotification(payload) {
  const res = await api.post('/notifications', payload)
  return unwrap(res)
}

export async function updateNotification(id, payload) {
  const res = await api.put(`/notifications/${id}`, payload)
  return unwrap(res)
}

export async function deleteNotification(id) {
  const res = await api.delete(`/notifications/${id}`)
  return unwrap(res)
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export async function getAuditLogs() {
  const res = await api.get('/audit-logs')
  return unwrap(res)
}

export async function getAuditLogById(id) {
  const res = await api.get(`/audit-logs/${id}`)
  return unwrap(res)
}

export async function createAuditLog(payload) {
  const res = await api.post('/audit-logs', payload)
  return unwrap(res)
}

export async function updateAuditLog(id, payload) {
  const res = await api.put(`/audit-logs/${id}`, payload)
  return unwrap(res)
}

export async function deleteAuditLog(id) {
  const res = await api.delete(`/audit-logs/${id}`)
  return unwrap(res)
}

// ─── VEHICLE INSPECTIONS ─────────────────────────────────────────────────────

export async function getVehicleInspections() {
  const res = await api.get('/vehicle-inspections')
  return unwrap(res)
}

export async function getVehicleInspectionById(id) {
  const res = await api.get(`/vehicle-inspections/${id}`)
  return unwrap(res)
}

export async function createVehicleInspection(payload) {
  const res = await api.post('/vehicle-inspections', payload)
  return unwrap(res)
}

export async function updateVehicleInspection(id, payload) {
  const res = await api.put(`/vehicle-inspections/${id}`, payload)
  return unwrap(res)
}

export async function deleteVehicleInspection(id) {
  const res = await api.delete(`/vehicle-inspections/${id}`)
  return unwrap(res)
}

// ─── BRANCHES ────────────────────────────────────────────────────────────────

export async function getBranches() {
  const res = await api.get('/branches')
  return unwrap(res)
}

export async function getBranchById(id) {
  const res = await api.get(`/branches/${id}`)
  return unwrap(res)
}

export async function createBranch(payload) {
  const res = await api.post('/branches', payload)
  return unwrap(res)
}

export async function updateBranch(id, payload) {
  const res = await api.put(`/branches/${id}`, payload)
  return unwrap(res)
}

export async function deleteBranch(id) {
  const res = await api.delete(`/branches/${id}`)
  return unwrap(res)
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const res = await api.get('/analytics')
  return unwrap(res)
}

export async function getDashboardStats() {
  const res = await api.get('/analytics/dashboard')
  return unwrap(res)
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

export async function getEmailTemplates() {
  const res = await api.get('/email-templates')
  return unwrap(res)
}

export async function getEmailTemplateById(id) {
  const res = await api.get(`/email-templates/${id}`)
  return unwrap(res)
}

export async function createEmailTemplate(payload) {
  const res = await api.post('/email-templates', payload)
  return unwrap(res)
}

export async function updateEmailTemplate(id, payload) {
  const res = await api.put(`/email-templates/${id}`, payload)
  return unwrap(res)
}

export async function deleteEmailTemplate(id) {
  const res = await api.delete(`/email-templates/${id}`)
  return unwrap(res)
}

// ─── COMPLAINTS ──────────────────────────────────────────────────────────────

export async function getComplaints() {
  const res = await api.get('/complaints')
  return unwrap(res)
}

export async function getComplaintById(id) {
  const res = await api.get(`/complaints/${id}`)
  return unwrap(res)
}

export async function createComplaint({ requestId, transport_request_id, type, comment, description, driver_id, vehicle_id }) {
  const user = JSON.parse(localStorage.getItem('greenfleet_user') || '{}')
  const res = await api.post('/complaints', {
    transport_request_id: transport_request_id ?? requestId ?? null,
    submitted_by: user.id ?? null,
    driver_id: driver_id ?? null,
    vehicle_id: vehicle_id ?? null,
    type:    type    ?? null,
    comment: comment ?? description ?? null,
  })
  return unwrap(res)
}

export async function updateComplaint(id, payload) {
  const res = await api.put(`/complaints/${id}`, payload)
  return unwrap(res)
}

export async function deleteComplaint(id) {
  const res = await api.delete(`/complaints/${id}`)
  return unwrap(res)
}

export async function resolveComplaint(id, note) {
  const res = await api.put(`/complaints/${id}`, {
    status: 'Resolved',
    resolution_note: note,
  })
  return unwrap(res)
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function getSettings() {
  const res = await api.get('/settings')
  return unwrap(res)
}

export async function updateSetting(section, value) {
  const res = await api.put(`/settings/${section}`, value)
  return unwrap(res)
}

// ─── ROLE PERMISSIONS ────────────────────────────────────────────────────────

export async function getRolePermissions() {
  const res = await api.get('/roles/permissions')
  return unwrap(res)
}

export async function updateRolePermissions(matrix) {
  const res = await api.put('/roles/permissions', { matrix })
  return unwrap(res)
}

export async function getRoleUserCounts() {
  const res = await api.get('/roles/users-count')
  return unwrap(res)
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export async function exportReport({ period, branch, driver, vehicle, format }) {
  const params = new URLSearchParams()
  if (period)  params.append('period', period)
  if (branch)  params.append('branch', branch)
  if (driver)  params.append('driver', driver)
  if (vehicle) params.append('vehicle', vehicle)
  params.append('format', format)

  const res = await api.get(`/reports/export?${params}`, { responseType: 'blob' })
  return res.data
}

export async function getReportPreview(params) {
  const search = new URLSearchParams()
  if (params.period)  search.append('period', params.period)
  if (params.branch)  search.append('branch', params.branch)
  if (params.driver)  search.append('driver', params.driver)
  if (params.vehicle) search.append('vehicle', params.vehicle)

  const res = await api.get(`/reports/preview?${search}`)
  return unwrap(res)
}

// ─── CONVENIENCE / LEGACY ALIASES ────────────────────────────────────────────

export async function getRequests() {
  return getTransportRequests()
}

export async function getRequestById(id) {
  return getTransportRequestById(id)
}

export async function createRequest(form) {
  const user = JSON.parse(localStorage.getItem('greenfleet_user') || '{}')

  const lineManagerEmail = form.line_manager_email || form.lineManagerEmail || null

  const payload = {
    requester_id:       form.requester_id       || user.id,
    branch_id:          form.branch_id          || user.branch_id || null,
    department_id:      form.department_id      || null,
    line_manager_email: lineManagerEmail,
    pickup_location:    form.pickup_location    || form.currentLocation || form.pickupLocation || '',
    destination:        form.destination,
    purpose:            form.purpose,
    departure_date:     form.departure_date,
    departure_time:     form.departure_time,
    passenger_count:    parseInt(form.passenger_count || form.passengers) || 1,
    priority:           (form.priority || 'NORMAL').toUpperCase(),
    status:             lineManagerEmail ? 'PENDING_LINE_MANAGER' : 'PENDING_ADMIN',
    remarks:            form.remarks || form.notes || '',
  }

  return createTransportRequest(payload)
}

export async function confirmArrival(id, { choice, branchId } = {}) {
  const res = await api.post(`/transport-requests/${id}/confirm-arrival`, {
    choice:    choice    || null,
    branch_id: branchId  || null,
  })
  return unwrap(res)
}

// ─── DASHBOARD STATS HELPERS ─────────────────────────────────────────────────

export async function getStaffDashboardStats() {
  const requests = await getTransportRequests()
  return {
    active:    requests.filter((r) => r.status === 'ASSIGNED').length,
    pending:   requests.filter((r) => r.status.includes('PENDING')).length,
    approved:  requests.filter((r) => r.status === 'APPROVED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  }
}

export async function getTransportDashboardStats() {
  const [requests, vehicles, drivers] = await Promise.all([
    getTransportRequests(),
    getVehicles(),
    getDrivers(),
  ])
  return {
    pendingRequests:  requests.filter((r) => r.status.includes('PENDING')).length,
    activeTrips:       requests.filter((r) => r.status === 'ASSIGNED').length,
    availableDrivers: drivers.filter((d) => d.status === 'ACTIVE').length,
    availableVehicles: vehicles.filter((v) => v.status === 'AVAILABLE').length,
    completedTrips:   requests.filter((r) => r.status === 'COMPLETED').length,
  }
}

// ─── NOTIFICATION HELPERS ─────────────────────────────────────────────────────

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`)
  return unwrap(res)
}

export async function markAllNotificationsRead() {
  const res = await api.patch('/notifications/mark-all-read')
  return unwrap(res)
}

export async function getUnreadNotificationCount() {
  const res = await api.get('/notifications/unread-count')
  const data = unwrap(res)
  return data?.count ?? 0
}

// ─── MULTI-REQUEST POOLING / RIDE SHARING ────────────────────────────────────

export async function spotDriver(id) {
  const res = await api.patch(`/transport-requests/${id}/spot-driver`)
  return unwrap(res)
}

export async function boardVehicle(id) {
  const res = await api.patch(`/transport-requests/${id}/board-vehicle`)
  return unwrap(res)
}

export default api
// ─── LINE MANAGER SIMULATION ──────────────────────────────────────────────────

export async function triggerLineManagerAction(id, action) {
  const res = await api.post(`/transport-requests/${id}/simulate-manager`, { action })
  return res.data
}

// ─── DRIVER TELEMETRY (location update) ──────────────────────────────────────

// export async function updateDriverLocation(driverId, { lat, lng, heading, speed } = {}) {
//   const res = await api.post(`/drivers/${driverId}/telemetry`, { lat, lng, heading, speed })
//   return unwrap(res)
// }

// export async function updateTripLocation(
//   id,
//   { latitude, longitude, accuracy }
// ) {
//   const response = await api.post(
//     `/transport-requests/${id}/location`,
//     {
//       latitude,
//       longitude,
//       accuracy,
//     }
//   )

//   return response.data?.data ?? response.data
// }


// export async function getTripLocation(id) {
//   const response = await api.get(
//     `/transport-requests/${id}/location`
//   )

//   return response.data?.data ?? null
// }


// export async function stopTripLocation(id) {
//   const response = await api.delete(
//     `/transport-requests/${id}/location`
//   )

//   return response.data
// }