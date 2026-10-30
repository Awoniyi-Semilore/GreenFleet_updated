import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getFuelLogs, createFuelLog, deleteFuelLog, getVehicles, getFuelTypes } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function FuelLogs() {
  usePageMeta({ title: 'Fuel Logs', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ vehicle_id: '', fuel_type_id: '', quantity: '', cost: '', odometer: '', fuel_date: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [logsData, vehiclesData, fuelTypesData] = await Promise.all([
        getFuelLogs(),
        getVehicles().catch(() => []),
        getFuelTypes().catch(() => []),
      ])
      setLogs(logsData)
      setVehicles(vehiclesData)
      setFuelTypes(fuelTypesData)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fuel logs')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!form.vehicle_id || !form.quantity || !form.fuel_date) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createFuelLog({
        vehicle_id: parseInt(form.vehicle_id),
        fuel_type_id: parseInt(form.fuel_type_id) || null,
        quantity: parseFloat(form.quantity),
        cost: parseFloat(form.cost) || 0,
        odometer: parseInt(form.odometer) || 0,
        fuel_date: form.fuel_date,
      })
      showToast('Fuel log added.')
      setAddOpen(false)
      setForm({ vehicle_id: '', fuel_type_id: '', quantity: '', cost: '', odometer: '', fuel_date: '' })
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add fuel log', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteFuelLog(deleteTarget.id)
      showToast('Fuel log deleted.')
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete fuel log', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'vehicle', label: 'Vehicle', render: (l) => l.vehicle?.plate_number || l.vehicle?.plate || '—' },
    { key: 'fuel_type', label: 'Fuel Type', render: (l) => l.fuelType?.name || l.fuel_type?.name || '—' },
    { key: 'quantity', label: 'Quantity (L)', render: (l) => l.quantity },
    { key: 'cost', label: 'Cost (₦)', render: (l) => l.cost?.toLocaleString() || '—' },
    { key: 'odometer', label: 'Odometer', render: (l) => l.odometer || l.odometer_reading || '—' },
    { key: 'date', label: 'Date', render: (l) => l.fuel_date || '—' },
    {
      key: 'actions', label: '',
      render: (l) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(l) }} className="text-ink-600 hover:text-status-rejected" aria-label="Delete">
          <Trash2 size={15} />
        </button>
      ),
    },
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

      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Fuel Log</Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={logs} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Fuel Log"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={submitting}>Add</Button>
          </>
        }
      >
        <Field label="Vehicle" required>
          <Select value={form.vehicle_id} onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.plate_number || v.plate} — {v.vehicle_name || v.make || 'Vehicle'}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fuel Type">
          <Select value={form.fuel_type_id} onChange={(e) => setForm((f) => ({ ...f, fuel_type_id: e.target.value }))}>
            <option value="">Select fuel type</option>
            {fuelTypes.map((ft) => (
              <option key={ft.id} value={ft.id}>{ft.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Quantity (Liters)" required>
          <Input type="number" step="0.1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
        </Field>
        <Field label="Cost (₦)">
          <Input type="number" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
        </Field>
        <Field label="Odometer Reading">
          <Input type="number" value={form.odometer} onChange={(e) => setForm((f) => ({ ...f, odometer: e.target.value }))} />
        </Field>
        <Field label="Fuel Date" required>
          <Input type="date" value={form.fuel_date} onChange={(e) => setForm((f) => ({ ...f, fuel_date: e.target.value }))} />
        </Field>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete fuel log?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructiveSolid" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">This action cannot be undone.</p>
      </Modal>
    </div>
  )
}