// ─────────────────────────────────────────────────────────────────────────
// mockData.js
// Single source of fake data for the whole app. Swap this file's contents
// for real API calls when the backend is ready — components consume the
// shapes below, not this file directly, via src/data/api.js.
// TODO(backend): replace every export here with a fetch/axios call.
// ─────────────────────────────────────────────────────────────────────────

export const BRANCHES = [
  { id: 'BR-01', name: 'Victoria Island HQ', address: '12 Ozumba Mbadiwe Ave, Victoria Island, Lagos', vehicles: 14, drivers: 12, currentTrips: 3 },
  { id: 'BR-02', name: 'Ikeja Branch', address: '48 Allen Avenue, Ikeja, Lagos', vehicles: 8, drivers: 7, currentTrips: 1 },
  { id: 'BR-03', name: 'Lekki Branch', address: '5 Admiralty Way, Lekki Phase 1, Lagos', vehicles: 6, drivers: 5, currentTrips: 0 },
  { id: 'BR-04', name: 'Abuja Central', address: '9 Ademola Adetokunbo Cres, Wuse II, Abuja', vehicles: 10, drivers: 9, currentTrips: 2 },
  { id: 'BR-05', name: 'Port Harcourt Branch', address: '22 Aba Road, Port Harcourt', vehicles: 5, drivers: 4, currentTrips: 0 },
]

export const DEPARTMENTS = [
  'Retail Banking', 'Operations', 'IT', 'Compliance', 'Treasury', 'Human Resources', 'Marketing', 'Internal Audit',
]

export const VEHICLE_TYPES = ['Sedan', 'SUV', 'Bus', 'Van']

export const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High Urgent' },
]

export const ROLES = ['Staff', 'Transport Admin', 'System Administrator']

export const PERMISSIONS = [
  'Approve Requests', 'Assign Vehicles', 'Manage Users', 'View Reports', 'Export Data', 'Manage Settings',
]

export const PERMISSION_MATRIX = {
  'Approve Requests':      { Staff: false, 'Transport Officer': true,  'Transport Manager': true,  'IT Admin': false, 'Super Admin': true },
  'Assign Vehicles':       { Staff: false, 'Transport Officer': true,  'Transport Manager': true,  'IT Admin': false, 'Super Admin': true },
  'Manage Users':          { Staff: false, 'Transport Officer': false, 'Transport Manager': false, 'IT Admin': true,  'Super Admin': true },
  'View Reports':          { Staff: false, 'Transport Officer': true,  'Transport Manager': true,  'IT Admin': true,  'Super Admin': true },
  'Export Data':           { Staff: false, 'Transport Officer': false, 'Transport Manager': true,  'IT Admin': true,  'Super Admin': true },
  'Manage Settings':       { Staff: false, 'Transport Officer': false, 'Transport Manager': false, 'IT Admin': true,  'Super Admin': true },
}

export const ROLE_USER_COUNTS = {
  Staff: 214, 'Transport Officer': 9, 'Transport Manager': 3, 'IT Admin': 4, 'Super Admin': 2,
}

export const CURRENT_USER = {
  id: 'U-1001',
  name: 'Adaeze Nwosu',
  username: 'adaeze.nwosu',
  department: 'Operations',
  branch: 'Victoria Island HQ',
  role: 'Staff',
}

export const VEHICLES = [
  { id: 'VEH-01', plate: 'LND-224-KJ', model: 'Toyota Camry', type: 'Sedan', branch: 'Victoria Island HQ', status: 'Available', driver: 'Emeka Obi', maintenance: 'Up to date', registrationExpiry: '2027-03-14', insuranceProvider: 'AIICO Insurance', insurancePolicy: 'POL-88213', insuranceExpiry: '2026-08-02' },
  { id: 'VEH-02', plate: 'LND-311-AB', model: 'Toyota Hiace', type: 'Van', branch: 'Victoria Island HQ', status: 'In Use', driver: 'Ifeoma Chukwu', maintenance: 'Up to date', registrationExpiry: '2026-11-01', insuranceProvider: 'Leadway Assurance', insurancePolicy: 'POL-70021', insuranceExpiry: '2026-07-19' },
  { id: 'VEH-03', plate: 'LND-118-XY', model: 'Lexus RX350', type: 'SUV', branch: 'Ikeja Branch', status: 'Available', driver: '—', maintenance: 'Due soon', registrationExpiry: '2026-09-25', insuranceProvider: 'AIICO Insurance', insurancePolicy: 'POL-88214', insuranceExpiry: '2026-12-11' },
  { id: 'VEH-04', plate: 'LND-402-QP', model: 'Coaster Bus', type: 'Bus', branch: 'Lekki Branch', status: 'Maintenance', driver: '—', maintenance: 'Overdue', registrationExpiry: '2026-08-30', insuranceProvider: 'AXA Mansard', insurancePolicy: 'POL-55302', insuranceExpiry: '2026-07-05' },
  { id: 'VEH-05', plate: 'LND-091-ZT', model: 'Toyota Corolla', type: 'Sedan', branch: 'Abuja Central', status: 'Available', driver: 'Musa Bello', maintenance: 'Up to date', registrationExpiry: '2027-01-17', insuranceProvider: 'Leadway Assurance', insurancePolicy: 'POL-70022', insuranceExpiry: '2027-02-08' },
  { id: 'VEH-06', plate: 'LND-233-LL', model: 'Honda CR-V', type: 'SUV', branch: 'Port Harcourt Branch', status: 'In Use', driver: 'Grace Etim', maintenance: 'Up to date', registrationExpiry: '2026-10-10', insuranceProvider: 'AIICO Insurance', insurancePolicy: 'POL-88215', insuranceExpiry: '2026-09-30' },
]

export const DRIVERS = [
  { id: 'DRV-01', name: 'Emeka Obi', phone: '+234 803 214 7781', branch: 'Victoria Island HQ', vehicle: 'LND-224-KJ', status: 'Available', license: 'DL-2291-LG', availability: [1,1,1,1,1,0,0] },
  { id: 'DRV-02', name: 'Ifeoma Chukwu', phone: '+234 705 552 0093', branch: 'Victoria Island HQ', vehicle: 'LND-311-AB', status: 'Waiting', license: 'DL-3312-LG', availability: [1,1,1,1,1,1,0] },
  { id: 'DRV-03', name: 'Musa Bello', phone: '+234 812 340 6621', branch: 'Abuja Central', vehicle: 'LND-091-ZT', status: 'Available', license: 'DL-7714-AB', availability: [0,1,1,1,1,1,0] },
  { id: 'DRV-04', name: 'Grace Etim', phone: '+234 902 118 3345', branch: 'Port Harcourt Branch', vehicle: 'LND-233-LL', status: 'Returning', license: 'DL-9903-PH', availability: [1,1,1,1,1,0,0] },
  { id: 'DRV-05', name: 'Tunde Balogun', phone: '+234 701 887 2210', branch: 'Ikeja Branch', vehicle: '—', status: 'Available', license: 'DL-4482-LG', availability: [1,1,1,1,1,1,1] },
  { id: 'DRV-06', name: 'Halima Yusuf', phone: '+234 816 990 4471', branch: 'Lekki Branch', vehicle: '—', status: 'Off Duty', license: 'DL-5561-LG', availability: [0,0,1,1,1,1,0] },
]

// Trip timeline steps in canonical order
export const TIMELINE_STEPS = ['Created', 'Approved', 'Driver Assigned', 'Ride Completed', 'Closed']

export const REQUESTS = [
  {
    id: 'REQ-1042', staffName: 'Adaeze Nwosu', department: 'Operations', branch: 'Victoria Island HQ',
    currentLocation: 'Victoria Island HQ', destination: 'Lekki Free Trade Zone', purpose: 'Site inspection for new ATM installation',
    departureTime: '2026-07-02T09:30:00', passengers: 2, priority: 'high', notes: 'Please send an SUV, we have equipment to carry.',
    status: 'In Progress', createdAt: '2026-06-29T14:02:00',
    approvedBy: 'J. Okafor', approvedAt: '2026-06-29T15:10:00',
    driver: DRIVERS[1], vehicle: VEHICLES[1],
    timelineStatus: 'Driver Assigned', tripStatus: 'En Route', elapsedMinutes: 42, expectedMinutes: 60,
    complaintFiled: false,
  },
  {
    id: 'REQ-1041', staffName: 'Adaeze Nwosu', department: 'Operations', branch: 'Victoria Island HQ',
    currentLocation: 'Victoria Island HQ', destination: 'Ikeja GRA', purpose: 'Client meeting',
    departureTime: '2026-06-27T08:00:00', passengers: 1, priority: 'normal', notes: '',
    status: 'Completed', createdAt: '2026-06-26T10:15:00',
    approvedBy: 'J. Okafor', approvedAt: '2026-06-26T11:00:00',
    driver: DRIVERS[0], vehicle: VEHICLES[0],
    timelineStatus: 'Closed', tripStatus: 'Completed', elapsedMinutes: 55, expectedMinutes: 50,
    complaintFiled: false,
  },
  {
    id: 'REQ-1039', staffName: 'Adaeze Nwosu', department: 'Operations', branch: 'Victoria Island HQ',
    currentLocation: 'Victoria Island HQ', destination: 'Abuja Central Branch', purpose: 'Interbranch audit handover',
    departureTime: '2026-06-20T07:00:00', passengers: 3, priority: 'normal', notes: 'Documents in sealed boxes.',
    status: 'Rejected', createdAt: '2026-06-18T09:00:00',
    approvedBy: null, approvedAt: null, rejectionReason: 'Duplicate request already approved for the same route (REQ-1038).',
    driver: null, vehicle: null, timelineStatus: 'Created', tripStatus: null, complaintFiled: false,
  },
  {
    id: 'REQ-1036', staffName: 'Chidi Anya', department: 'Compliance', branch: 'Ikeja Branch',
    currentLocation: 'Ikeja Branch', destination: 'CBN Regional Office', purpose: 'Regulatory filing submission',
    departureTime: '2026-06-15T09:00:00', passengers: 1, priority: 'high', notes: '',
    status: 'Pending', createdAt: '2026-06-15T08:10:00',
    approvedBy: null, approvedAt: null, driver: null, vehicle: null,
    timelineStatus: 'Created', tripStatus: null, complaintFiled: false,
  },
  {
    id: 'REQ-1035', staffName: 'Bisi Adewale', department: 'Marketing', branch: 'Lekki Branch',
    currentLocation: 'Lekki Branch', destination: 'Landmark Event Centre', purpose: 'Brand activation setup',
    departureTime: '2026-06-14T10:00:00', passengers: 4, priority: 'low', notes: 'Banners and pop-up materials.',
    status: 'Approved', createdAt: '2026-06-13T16:40:00',
    approvedBy: 'J. Okafor', approvedAt: '2026-06-13T17:00:00',
    driver: DRIVERS[4], vehicle: VEHICLES[2],
    timelineStatus: 'Approved', tripStatus: null, complaintFiled: false,
  },
]

export const ACTIVE_TRIPS = REQUESTS.filter(r => r.status === 'In Progress')

export const COMPLAINTS = [
  { id: 'CMP-201', requestId: 'REQ-1041', submittedBy: 'Adaeze Nwosu', driver: 'Emeka Obi', vehicle: 'LND-224-KJ', type: 'Late Arrival', comment: 'Driver arrived about 20 minutes after the scheduled pickup time without any notice.', status: 'Open', date: '2026-06-27' },
  { id: 'CMP-200', requestId: 'REQ-1030', submittedBy: 'Tunde Fashola', driver: 'Ifeoma Chukwu', vehicle: 'LND-311-AB', type: 'Vehicle Condition', comment: 'Air conditioning was not working for the whole trip.', status: 'Resolved', date: '2026-06-10', resolutionNote: 'Vehicle sent for AC servicing, confirmed fixed on 2026-06-12.' },
]

export const RECENT_ACTIVITY = [
  { id: 1, text: 'Request #REQ-1042 approved by J. Okafor', time: '2m ago' },
  { id: 2, text: 'Vehicle LND-311-AB assigned to REQ-1042', time: '3m ago' },
  { id: 3, text: 'Driver Musa Bello marked Available', time: '18m ago' },
  { id: 4, text: 'Request #REQ-1039 rejected by J. Okafor', time: '1h ago' },
  { id: 5, text: 'Complaint CMP-201 submitted', time: '2h ago' },
]

export const AUDIT_LOG = [
  { id: 'LOG-9001', timestamp: '2026-07-01T08:12:00', user: 'j.okafor', action: 'Approved request REQ-1042', ip: '10.20.4.11', status: 'Success', type: 'request' },
  { id: 'LOG-9000', timestamp: '2026-07-01T07:58:00', user: 'j.okafor', action: 'Rejected request REQ-1039', ip: '10.20.4.11', status: 'Success', type: 'request' },
  { id: 'LOG-8999', timestamp: '2026-06-30T18:40:00', user: 'it.admin', action: 'SMTP settings updated', ip: '10.20.1.4', status: 'Success', type: 'system' },
  { id: 'LOG-8998', timestamp: '2026-06-30T18:12:00', user: 'it.admin', action: 'Role permissions changed for Transport Officer', ip: '10.20.1.4', status: 'Success', type: 'system' },
  { id: 'LOG-8997', timestamp: '2026-06-30T12:03:00', user: 'adaeze.nwosu', action: 'Submitted request REQ-1042', ip: '102.89.23.6', status: 'Success', type: 'request' },
  { id: 'LOG-8996', timestamp: '2026-06-30T09:22:00', user: 'unknown', action: 'Failed login attempt', ip: '41.58.12.90', status: 'Failed', type: 'auth' },
]

export const EMAIL_TEMPLATES = [
  { id: 'TPL-01', name: 'Account Creation', subject: 'Your GreenFleet account is ready', lastEdited: '2026-05-02', body: 'Hi {{staff_name}},\n\nYour account has been created. Your temporary password is {{temp_password}}.\n\nRegards,\nGreenFleet Team' },
  { id: 'TPL-02', name: 'Approval', subject: 'Your trip request {{request_id}} was approved', lastEdited: '2026-04-18', body: 'Hi {{staff_name}},\n\nYour request to {{destination}} has been approved. A driver and vehicle will be assigned shortly.\n\nRegards,\nGreenFleet Team' },
  { id: 'TPL-03', name: 'Rejection', subject: 'Your trip request {{request_id}} was not approved', lastEdited: '2026-04-18', body: 'Hi {{staff_name}},\n\nYour request to {{destination}} was not approved.\nReason: {{rejection_reason}}\n\nRegards,\nGreenFleet Team' },
  { id: 'TPL-04', name: 'Assignment', subject: 'Driver and vehicle assigned for {{request_id}}', lastEdited: '2026-03-30', body: 'Hi {{staff_name}},\n\nYour driver {{driver_name}} ({{driver_phone}}) will meet you in vehicle {{vehicle_plate}}.\n\nRegards,\nGreenFleet Team' },
]

export const MERGE_TAGS = ['{{staff_name}}', '{{request_id}}', '{{destination}}', '{{driver_name}}', '{{driver_phone}}', '{{vehicle_plate}}', '{{temp_password}}', '{{rejection_reason}}']

export const USERS = [
  { id: 'U-1001', name: 'Adaeze Nwosu', username: 'adaeze.nwosu', department: 'Operations', branch: 'Victoria Island HQ', role: 'Staff', status: 'Active' },
  { id: 'U-1002', name: 'Chidi Anya', username: 'chidi.anya', department: 'Compliance', branch: 'Ikeja Branch', role: 'Staff', status: 'Active' },
  { id: 'U-1003', name: 'Joy Okafor', username: 'j.okafor', department: 'Operations', branch: 'Victoria Island HQ', role: 'Transport Manager', status: 'Active' },
  { id: 'U-1004', name: 'Segun Adeyemi', username: 'segun.adeyemi', department: 'Operations', branch: 'Ikeja Branch', role: 'Transport Officer', status: 'Active' },
  { id: 'U-1005', name: 'Ngozi Eze', username: 'ngozi.eze', department: 'IT', branch: 'Victoria Island HQ', role: 'IT Admin', status: 'Active' },
  { id: 'U-1006', name: 'Bisi Adewale', username: 'bisi.adewale', department: 'Marketing', branch: 'Lekki Branch', role: 'Staff', status: 'Deactivated' },
]

export const SETTINGS = {
  company: { name: 'Greenwich Merchant Bank', logoUrl: '' },
  smtp: { host: 'smtp.greenwichmerchantbank.com', port: 587, username: 'noreply@greenwichmerchantbank.com', password: '••••••••', fromAddress: 'GreenFleet <noreply@greenwichmerchantbank.com>' },
  branches: BRANCHES.map(b => ({ id: b.id, name: b.name, location: b.address })),
  departments: DEPARTMENTS,
  vehicleTypes: VEHICLE_TYPES,
  priorities: PRIORITIES.map(p => p.label),
}

export const ANALYTICS = {
  mostRequestedBranches: [
    { branch: 'Victoria Island HQ', count: 128 },
    { branch: 'Ikeja Branch', count: 74 },
    { branch: 'Abuja Central', count: 61 },
    { branch: 'Lekki Branch', count: 39 },
    { branch: 'Port Harcourt Branch', count: 22 },
  ],
  mostUsedVehicles: [
    { plate: 'LND-224-KJ', trips: 61 },
    { plate: 'LND-311-AB', trips: 54 },
    { plate: 'LND-091-ZT', trips: 47 },
    { plate: 'LND-233-LL', trips: 33 },
  ],
  avgApprovalTime: '18 min',
  avgApprovalTrend: [22, 20, 19, 21, 18, 17, 18],
  avgTripTime: '52 min',
  avgTripTrend: [58, 55, 54, 53, 50, 52, 52],
  avgRequestsPerDay: 14,
  dailyVolume: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, count: Math.floor(Math.random() * 22) + 2 })),
}

export const TRIPS_BY_BRANCH = [
  { branch: 'VI HQ', trips: 128 },
  { branch: 'Ikeja', trips: 74 },
  { branch: 'Abuja', trips: 61 },
  { branch: 'Lekki', trips: 39 },
  { branch: 'PH', trips: 22 },
]

export const TRIPS_BY_DEPARTMENT = [
  { name: 'Operations', value: 92, color: '#006527' },
  { name: 'Compliance', value: 58, color: '#85CA23' },
  { name: 'IT', value: 41, color: '#4B8F63' },
  { name: 'Marketing', value: 27, color: '#B7D9A8' },
  { name: 'Other', value: 19, color: '#94A198' },
]

export const DASHBOARD_STATS_TRANSPORT = [
  { label: 'Pending Requests', value: 6, category: 'requests' },
  { label: 'Approved Today', value: 9, category: 'requests' },
  { label: 'Available Vehicles', value: 12, category: 'fleet' },
  { label: 'Available Drivers', value: 10, category: 'fleet' },
  { label: 'Trips In Progress', value: 4, category: 'trips' },
  { label: 'Drivers Waiting', value: 2, category: 'trips' },
  { label: 'Vehicles Returning', value: 1, category: 'trips' },
  { label: "Today's Completed Trips", value: 11, category: 'requests' },
]
