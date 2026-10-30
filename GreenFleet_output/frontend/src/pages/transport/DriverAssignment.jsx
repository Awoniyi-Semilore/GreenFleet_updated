import React, { useEffect, useState } from 'react'
import { usePageMeta } from '../../components/Layout.jsx'
import { Input } from '../../components/FormField.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Button from '../../components/Button.jsx'
import { getDrivers } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function DriverAssignment() {
  usePageMeta({ title: 'Driver Assignment', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setLoading(true)
    try {
      const data = await getDrivers()
      setDrivers(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const filtered = drivers.filter((d) => {
    const q = query.toLowerCase()
    const name = `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.name || ''
    const phone = d.phone || d.phone_number || ''
    return !q || name.toLowerCase().includes(q) || phone.includes(q)
  })

  function assign(d) {
    showToast(`${d.first_name || d.name} assigned.`)
    // TODO: This page is typically used in a modal/context where the parent
    // receives the selected driver. For now we just show a toast.
  }

  const columns = [
    { key: 'name', label: 'Driver Name', render: (d) => `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.name || '—' },
    { key: 'phone', label: 'Phone Number', mono: true, render: (d) => <a href={`tel:${d.phone || d.phone_number}`} className="text-brand-green">{d.phone || d.phone_number || '—'}</a> },
    { key: 'branch', label: 'Current Branch', render: (d) => d.branch?.branch_name || d.branch?.name || d.branch || '—' },
    { key: 'status', label: 'Current Status', render: (d) => <StatusPill status={d.status} /> },
    { key: 'actions', label: '', render: (d) => <Button size="sm" onClick={() => assign(d)}>Assign</Button> },
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

      <Input placeholder="Search by name or phone" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[280px] mb-4" />
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={filtered} />
      </div>
    </div>
  )
}