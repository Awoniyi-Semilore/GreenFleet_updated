import {
  LayoutDashboard, PlusCircle, ListChecks, User, ClipboardList, Car, Users,
  Building2, MessageSquareWarning, FileBarChart, ShieldCheck, Settings,
  ScrollText, Mail, BarChart3, Bell, Fuel, Wrench, ClipboardCheck,
} from 'lucide-react'

export const NAV = {
  staff: [
    { to: '/staff/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
    { to: '/staff/new-request',  label: 'New Request',    icon: PlusCircle },
    { to: '/staff/my-requests',  label: 'My Requests',    icon: ListChecks },
    { to: '/staff/notifications',label: 'Notifications',  icon: Bell },
    { to: '/staff/profile',      label: 'Profile',        icon: User },
  ],
  transport: [
    { to: '/transport/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/transport/requests',     label: 'Requests',     icon: ClipboardList },
    { to: '/transport/active-trips', label: 'Active Trips', icon: Car },
    { to: '/transport/vehicles',     label: 'Vehicles',     icon: Car },
    { to: '/transport/drivers',      label: 'Drivers',      icon: Users },
    { to: '/transport/branches',     label: 'Branches',     icon: Building2 },
    { to: '/transport/complaints',   label: 'Complaints',   icon: MessageSquareWarning },
    { to: '/transport/reports',      label: 'Reports',      icon: FileBarChart },
    // { to: '/transport/fuel-logs',    label: 'Fuel Logs',    icon: Fuel },
    { to: '/transport/maintenance',  label: 'Maintenance',  icon: Wrench },
    { to: '/transport/inspections',  label: 'Inspections',  icon: ClipboardCheck },
    // REMOVED: Vehicle Documents removed from sidebar as requested
  ],
  system: [
    { to: '/admin/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/admin/users',           label: 'Users',            icon: Users },
    { to: '/admin/departments',     label: 'Departments',      icon: Building2 },
    { to: '/admin/roles',           label: 'Roles & Permissions', icon: ShieldCheck },
    { to: '/admin/settings',        label: 'Settings',         icon: Settings },
    { to: '/admin/audit-logs',      label: 'Audit Logs',       icon: ScrollText },
    { to: '/admin/email-templates', label: 'Email Templates',  icon: Mail },
    { to: '/admin/analytics',       label: 'Analytics',        icon: BarChart3 },
  ],
}

export const PORTAL_LABEL = {
  staff:     'Staff Portal',
  transport: 'Transport Portal',
  system:    'Admin Portal',
}