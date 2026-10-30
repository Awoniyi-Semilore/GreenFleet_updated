import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getVehicleInspections, createVehicleInspection, deleteVehicleInspection, getVehicles } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Inspections() {
  usePageMeta({ title: 'Vehicle Inspections', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [inspections, setInspections] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ vehicle_id: '', inspection_date: '', result: 'PASS', remarks: '', next_inspection_date: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [inspectionsData, vehiclesData] = await Promise.all([
        getVehicleInspections(),
        getVehicles().catch(() => []),
      ])
      setInspections(inspectionsData)
      setVehicles(vehiclesData)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!form.vehicle_id || !form.inspection_date) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createVehicleInspection({
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
      })
      showToast('Inspection record added.')
      setAddOpen(false)
      setForm({ vehicle_id: '', inspection_date: '', result: 'PASS', remarks: '', next_inspection_date: '' })
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add inspection', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteVehicleInspection(deleteTarget.id)
      showToast('Inspection deleted.')
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'vehicle', label: 'Vehicle', render: (i) => i.vehicle?.plate_number || i.vehicle?.plate || i.vehicle_id || '—' },
    { key: 'date', label: 'Inspection Date', render: (i) => i.inspection_date },
    { key: 'result', label: 'Result', render: (i) => <span className={`font-medium ${i.result === 'PASS' ? 'text-brand-green' : i.result === 'FAIL' ? 'text-status-rejected' : 'text-status-pending'}`}>{i.result}</span> },
    { key: 'next', label: 'Next Inspection', render: (i) => i.next_inspection_date || '—' },
    {
      key: 'actions', label: '',
      render: (i) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(i) }} className="text-ink-600 hover:text-status-rejected" aria-label="Delete">
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
        <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Inspection</Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={inspections} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Inspection"
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
        <Field label="Inspection Date" required>
          <Input type="date" value={form.inspection_date} onChange={(e) => setForm((f) => ({ ...f, inspection_date: e.target.value }))} />
        </Field>
        <Field label="Result" required>
          <Select value={form.result} onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
            <option value="CONDITIONAL">Conditional</option>
          </Select>
        </Field>
        <Field label="Remarks">
          <Input value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
        </Field>
        <Field label="Next Inspection Date">
          <Input type="date" value={form.next_inspection_date} onChange={(e) => setForm((f) => ({ ...f, next_inspection_date: e.target.value }))} />
        </Field>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete inspection?"
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
