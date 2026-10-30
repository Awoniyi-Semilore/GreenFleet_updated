import React, { useEffect, useState } from 'react'
import { usePageMeta } from '../../components/Layout.jsx'
import { Input } from '../../components/FormField.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import Button from '../../components/Button.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import { getVehicles } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function VehicleAssignment() {
  usePageMeta({ title: 'Vehicle Assignment', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [availOnly, setAvailOnly] = useState('available')

  useEffect(() => {
    loadVehicles()
  }, [])

  async function loadVehicles() {
    setLoading(true)
    try {
      const data = await getVehicles()
      setVehicles(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const filtered = vehicles.filter((v) => {
    if (availOnly === 'available' && v.status !== 'AVAILABLE') return false
    const q = query.toLowerCase()
    const plate = v.plate_number || v.plate || ''
    const model = v.vehicle_name || v.model || ''
    return !q || plate.toLowerCase().includes(q) || model.toLowerCase().includes(q)
  })

  function assign(v) {
    showToast(`${v.plate_number || v.plate} assigned.`)
    // TODO: This page is typically used in a modal/context where the parent
    // receives the selected vehicle. For now we just show a toast.
  }

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

      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search by plate or model" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[280px]" />
        <PillTabs
          options={[{ value: 'available', label: 'Available only' }, { value: 'all', label: 'All' }]}
          value={availOnly}
          onChange={setAvailOnly}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div key={v.id} className="bg-surface border border-border-subtle rounded-card shadow-card p-4">
            <div className="font-mono text-lg font-semibold text-ink-900 mb-1">{v.plate_number || v.plate}</div>
            <div className="text-sm text-ink-600 mb-3">{v.vehicle_name || v.model}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs text-ink-600">{v.branch?.branch_name || v.branch}</span>
              <StatusPill status={v.status} />
            </div>
            <Button size="sm" fullWidth onClick={() => assign(v)}>Assign</Button>
          </div>
        ))}
      </div>
    </div>
  )
}