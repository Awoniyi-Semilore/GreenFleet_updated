import React, { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import { Input } from '../../components/FormField.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Button from '../../components/Button.jsx'
import { getAuditLogs } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { exportReport } from '../../data/api.js'

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'request', label: 'Requests' },
  { value: 'system', label: 'System' },
  { value: 'auth', label: 'Auth' },
]

export default function AuditLogs() {
  usePageMeta({ title: 'Audit Logs', breadcrumb: 'System Admin' })
  const { showToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    try {
      const data = await getAuditLogs()
      setLogs(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (type !== 'all' && l.module !== type && l.type !== type) return false
      const q = query.toLowerCase()
      const userName = l.user?.username || l.user?.name || l.user || ''
      return !q || userName.toLowerCase().includes(q) || (l.action || l.description || '').toLowerCase().includes(q)
    })
  }, [logs, type, query])

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await exportReport({
        period: 'all',
        format: 'excel',
        // You could add a log_type filter here if backend supports it
      })
      const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit_logs_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      showToast('Audit logs exported')
    } catch (err) {
      showToast('Export failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'timestamp', label: 'Timestamp', mono: true, sortable: true, render: (l) => new Date(l.created_at || l.timestamp).toLocaleString() },
    { key: 'user', label: 'User', mono: true, render: (l) => l.user?.username || l.user?.name || l.user || '—' },
    { key: 'action', label: 'Action', render: (l) => l.action || l.description || '—' },
    { key: 'module', label: 'Module', render: (l) => l.module || l.type || '—' },
    { key: 'ip', label: 'IP Address', mono: true, render: (l) => l.ip_address || l.ip || '—' },
    { key: 'status', label: 'Status', render: (l) => <StatusPill status={l.status || 'Success'} /> },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-btn bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <PillTabs options={TYPES} value={type} onChange={setType} />
        <div className="flex gap-2">
          <Input placeholder="Search user or action" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[220px]" />
          <Button variant="secondary" icon={Download} onClick={handleExport}>Export</Button>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={filtered} zebra />
      </div>
    </div>
  )
}