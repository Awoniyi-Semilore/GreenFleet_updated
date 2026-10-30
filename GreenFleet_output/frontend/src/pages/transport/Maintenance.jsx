import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getMaintenanceRecords, createMaintenanceRecord, deleteMaintenanceRecord, getVehicles } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Maintenance() {
  usePageMeta({ title: 'Maintenance Records', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ vehicle_id: '', service_type: '', service_date: '', next_service_date: '', cost: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [recordsData, vehiclesData] = await Promise.all([
        getMaintenanceRecords(),
        getVehicles().catch(() => []),
      ])
      setRecords(recordsData)
      setVehicles(vehiclesData)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!form.vehicle_id || !form.service_type || !form.service_date) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createMaintenanceRecord({
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        cost: parseFloat(form.cost) || 0,
      })
      showToast('Maintenance record added.')
      setAddOpen(false)
      setForm({ vehicle_id: '', service_type: '', service_date: '', next_service_date: '', cost: '', remarks: '' })
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add record', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteMaintenanceRecord(deleteTarget.id)
      showToast('Record deleted.')
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle?.plate_number || r.vehicle?.plate || '—' },
    { key: 'service_type', label: 'Service Type' },
    { key: 'service_date', label: 'Service Date' },
    { key: 'next_service', label: 'Next Service', render: (r) => r.next_service_date || '—' },
    { key: 'cost', label: 'Cost (₦)', render: (r) => r.cost?.toLocaleString() || '—' },
    {
      key: 'actions', label: '',
      render: (r) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="text-ink-600 hover:text-status-rejected" aria-label="Delete">
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
        <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Record</Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={records} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Maintenance Record"
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
        <Field label="Service Type" required>
          <Input value={form.service_type} onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))} placeholder="e.g. Oil Change" />
        </Field>
        <Field label="Service Date" required>
          <Input type="date" value={form.service_date} onChange={(e) => setForm((f) => ({ ...f, service_date: e.target.value }))} />
        </Field>
        <Field label="Next Service Date">
          <Input type="date" value={form.next_service_date} onChange={(e) => setForm((f) => ({ ...f, next_service_date: e.target.value }))} />
        </Field>
        <Field label="Cost (₦)">
          <Input type="number" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
        </Field>
        <Field label="Remarks">
          <Input value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
        </Field>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete record?"
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
