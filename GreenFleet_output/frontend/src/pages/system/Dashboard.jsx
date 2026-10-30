import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ShieldCheck, Mail, ScrollText, BarChart3, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { getUsers, getAuditLogs, getEmailTemplates } from '../../data/api.js'
import { useQuery } from '../../context/QueryCache.jsx'

export default function SystemDashboard() {
  usePageMeta({ title: 'Dashboard', breadcrumb: 'System Admin' })
  const navigate = useNavigate()

  const { data: users } = useQuery('admin-users',     getUsers,          { ttl: 60_000 })
  const { data: logs } = useQuery('audit-logs',      getAuditLogs,      { ttl: 60_000 })
  const { data: templates } = useQuery('email-templates', getEmailTemplates, { ttl: 120_000 })

  const safeUsers = Array.isArray(users) ? users : []
  const safeLogs = Array.isArray(logs) ? logs : []
  const safeTemplates = Array.isArray(templates) ? templates : []

  const activeUsers = safeUsers.filter((u) => u.status === 'ACTIVE').length

  const quickLinks = [
    { label: 'Manage Users',       path: '/admin/users',           desc: 'Add, edit, or deactivate staff and admin accounts' },
    { label: 'Roles & Permissions', path: '/admin/roles',          desc: 'Configure access control for each portal' },
    { label: 'Departments',         path: '/admin/departments',    desc: 'Set up departments and line manager emails' },
    { label: 'Email Templates',     path: '/admin/email-templates',desc: 'Customise approval and notification emails' },
    { label: 'Audit Logs',          path: '/admin/audit-logs',     desc: 'Trace every system action for compliance' },
    { label: 'Analytics',           path: '/admin/analytics',      desc: 'Fleet utilisation, approval times, and trends' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}       label="Active Users"     value={activeUsers}    tone="green" onClick={() => navigate('/admin/users')} />
        <StatCard icon={ShieldCheck} label="Roles"            value={5}              tone="lime"  onClick={() => navigate('/admin/roles')} />
        <StatCard icon={Mail}        label="Email Templates"  value={safeTemplates.length} tone="blue" onClick={() => navigate('/admin/email-templates')} />
        <StatCard icon={ScrollText}  label="Audit Entries"    value={safeLogs.length}    tone="amber" onClick={() => navigate('/admin/audit-logs')} />
      </div>

      {/* Analytics CTA */}
      <button
        onClick={() => navigate('/admin/analytics')}
        className="w-full flex items-center justify-between bg-brand-green-900 text-white rounded-card p-5 hover:bg-brand-green-700 transition-colors group"
      >
        <div className="text-left">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Insights</p>
          <h3 className="text-base font-semibold mb-0.5">Fleet Analytics</h3>
          <p className="text-sm text-white/60">Approval times, trip volume, branch usage, and more.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <BarChart3 size={28} className="text-brand-lime opacity-70" />
          <ArrowRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </div>
      </button>

      {/* Quick links grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className="bg-surface border border-border-subtle rounded-card shadow-card p-4 text-left hover:border-brand-green hover:shadow-card-md transition-all group"
            >
              <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-green transition-colors mb-0.5">
                {l.label}
              </p>
              <p className="text-xs text-ink-400 leading-relaxed">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
