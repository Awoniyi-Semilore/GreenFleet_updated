import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { 
  getVehicleById, 
  getRequests, 
  updateVehicle, 
  getBranches, 
  getVehicleTypes, 
  getFuelTypes 
} from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'IN_USE', label: 'In Use' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
]

export default function VehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [vehicle, setVehicle] = useState(null)
  const [history, setHistory] = useState([])
  const [branches, setBranches] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal and Form States
  const [editOpen, setEditOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    plate_number: '',
    vehicle_name: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vehicle_type_id: '',
    fuel_type_id: '',
    branch_id: '',
    capacity: '',
    status: 'AVAILABLE',
  })

  usePageMeta({ title: vehicle?.plate_number || vehicle?.plate || 'Vehicle', breadcrumb: 'Transport Admin / Vehicles' })

  useEffect(() => {
    loadVehicle()
  }, [id])

  async function loadVehicle() {
    setLoading(true)
    try {
      const [v, requests, b, vt, ft] = await Promise.all([
        getVehicleById(id),
        getRequests(),
        getBranches(),
        getVehicleTypes(),
        getFuelTypes(),
      ])
      setVehicle(v)
      setBranches(b)
      setVehicleTypes(vt)
      setFuelTypes(ft)
      
      // Filter requests where this vehicle was used
      setHistory(requests.filter((r) => r.vehicle_id === parseInt(id) || r.vehicle?.id === parseInt(id)))
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  function openEditModal() {
    if (!vehicle) return
    setForm({
      plate_number: vehicle.plate_number || vehicle.plate || '',
      vehicle_name: vehicle.vehicle_name || vehicle.model || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      color: vehicle.color || '',
      vehicle_type_id: vehicle.vehicle_type_id || vehicle.vehicle_type?.id || '',
      fuel_type_id: vehicle.fuel_type_id || vehicle.fuel_type?.id || '',
      branch_id: vehicle.branch_id || vehicle.branch?.id || '',
      capacity: vehicle.capacity || '',
      status: vehicle.status || 'AVAILABLE',
    })
    setFormErrors({})
    setEditOpen(true)
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    if (formErrors[key]) {
      setFormErrors((e) => {
        const next = { ...e }
        delete next[key]
        return next
      })
    }
  }

  async function handleUpdate() {
  setSubmitting(true)

  // Format payload: convert empty string IDs to null, and send integer values
  const payload = {
    plate_number: form.plate_number?.trim(),
    vehicle_name: form.vehicle_name?.trim(),
    make: form.make?.trim() || null,
    model: form.model?.trim() || null,
    year: form.year ? parseInt(form.year, 10) : null,
    color: form.color?.trim() || null,
    capacity: form.capacity ? parseInt(form.capacity, 10) : null,
    status: form.status,
    
    // Convert empty drop-down selections to null instead of ""
    vehicle_type_id: form.vehicle_type_id ? parseInt(form.vehicle_type_id, 10) : null,
    fuel_type_id: form.fuel_type_id ? parseInt(form.fuel_type_id, 10) : null,
    branch_id: form.branch_id ? parseInt(form.branch_id, 10) : null,
  }

  try {
    await updateVehicle(id, payload)
    showToast('Vehicle updated successfully.')
    setEditOpen(false)
    await loadVehicle()
  } catch (err) {
    // Capture validation error messages returned by Laravel
    const validationErrors = err.response?.data?.errors
    if (validationErrors) {
      setFormErrors(validationErrors)
    } else {
      showToast(err.response?.data?.message || 'Failed to update vehicle', 'error')
    }
  } finally {
    setSubmitting(false)
  }
}

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent"></div>
      </div>
    )
  }

  if (!vehicle) {
    return <div className="text-sm text-ink-600">Vehicle not found.</div>
  }

  const plate = vehicle.plate_number || vehicle.plate || '—'
  const model = vehicle.vehicle_name || vehicle.model || vehicle.brand || '—'

  const tripColumns = [
    { key: 'id', label: 'Request ID', mono: true },
    { key: 'date', label: 'Date', render: (r) => new Date(r.departure_time || r.departureTime).toLocaleDateString() },
    { key: 'driver', label: 'Driver', render: (r) => r.driver?.name || r.driver_name || '—' },
    { key: 'destination', label: 'Destination', render: (r) => r.destination || r.pickup_location || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/transport/vehicles')}
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4 transition-colors bg-transparent border-0 cursor-pointer p-0 font-medium"
      >
        <ChevronLeft size={18} /> Back to Vehicles
      </button>

      {error && (
        <div className="mb-4 rounded-btn bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-mono text-2xl font-bold text-ink-900">{plate}</div>
          <div className="text-sm text-ink-600">{model}</div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={vehicle.status} />
          <Button icon={Pencil} variant="tertiary" onClick={openEditModal}>
            Edit Vehicle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Registration">
          <Row label="Number" value={<span className="font-mono">{plate}</span>} />
          <Row label="Year" value={vehicle.year || '—'} />
        </Card>
        <Card title="Details">
          <Row label="VIN" value={<span className="font-mono">{vehicle.vin || '—'}</span>} />
          <Row label="Engine" value={<span className="font-mono">{vehicle.engine_number || '—'}</span>} />
          <Row label="Color" value={vehicle.color || '—'} />
        </Card>
        <Card title="Assigned Driver">
          <p className="text-sm text-ink-900">{vehicle.driver?.name || vehicle.driver_name || 'Unassigned'}</p>
        </Card>
        <Card title="Current Branch">
          <p className="text-sm text-ink-900">{vehicle.branch?.branch_name || vehicle.branch?.name || vehicle.branch || '—'}</p>
        </Card>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2 mb-4">
        <h3 className="text-sm font-semibold text-ink-900 px-4 pt-4 pb-2">Trip History</h3>
        <Table columns={tripColumns} rows={history} emptyState={<div className="py-8 text-center text-sm text-ink-600">No trips recorded yet.</div>} />
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <h3 className="text-sm font-semibold text-ink-900 px-4 pt-4 pb-2">Maintenance History</h3>
        <div className="py-8 text-center text-sm text-ink-600">Maintenance records require backend endpoint.</div>
      </div>

      {/* Edit Vehicle Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Vehicle Details"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="tertiary" fullWidth sm={{ fullWidth: false }} onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button fullWidth sm={{ fullWidth: false }} onClick={handleUpdate} loading={submitting}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Plate Number" required error={formErrors.plate_number}>
              <Input
                value={form.plate_number}
                onChange={(e) => setField('plate_number', e.target.value)}
                placeholder="ABC-123AA"
                maxLength={20}
              />
            </Field>
            <Field label="Vehicle Name" required error={formErrors.vehicle_name}>
              <Input
                value={form.vehicle_name}
                onChange={(e) => setField('vehicle_name', e.target.value)}
                placeholder="Toyota Camry"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Make">
              <Input
                value={form.make}
                onChange={(e) => setField('make', e.target.value)}
                placeholder="Toyota"
              />
            </Field>
            <Field label="Model">
              <Input
                value={form.model}
                onChange={(e) => setField('model', e.target.value)}
                placeholder="Camry"
              />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setField('year', e.target.value)}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Color">
              <Input
                value={form.color}
                onChange={(e) => setField('color', e.target.value)}
                placeholder="White"
              />
            </Field>
            <Field label="Capacity (seats)">
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setField('capacity', e.target.value)}
                placeholder="5"
                min="1"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Vehicle Type">
              <Select
                value={form.vehicle_type_id}
                onChange={(e) => setField('vehicle_type_id', e.target.value)}
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((vt) => (
                  <option key={vt.id} value={vt.id}>{vt.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fuel Type">
              <Select
                value={form.fuel_type_id}
                onChange={(e) => setField('fuel_type_id', e.target.value)}
              >
                <option value="">Select fuel type</option>
                {fuelTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>{ft.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Branch">
            <Select
              value={form.branch_id}
              onChange={(e) => setField('branch_id', e.target.value)}
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card p-4">
      <h3 className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-900">{value}</span>
    </div>
  )
}