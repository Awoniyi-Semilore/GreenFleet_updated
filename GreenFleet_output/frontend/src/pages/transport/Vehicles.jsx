import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Ban, Car, CheckCircle2 } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getVehicles, createVehicle, updateVehicleStatus, getBranches, getVehicleTypes, getFuelTypes } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useQuery, useMutation, useQueryCache } from '../../context/QueryCache.jsx'

const STATUS_OPTS = [
  { value: 'AVAILABLE',      label: 'Available'       },
  { value: 'IN_USE',         label: 'In Use'          },
  { value: 'MAINTENANCE',    label: 'Maintenance'     },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service'  },
]

const EMPTY_FORM = {
  plate_number: '', vehicle_name: '', make: '', model: '', year: '',
  color: '', vehicle_type_id: '', fuel_type_id: '', branch_id: '', capacity: '', status: 'AVAILABLE',
}

export default function Vehicles() {
  usePageMeta({ title: 'Vehicles', breadcrumb: 'Transport' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { invalidate } = useQueryCache()

  const [addOpen,          setAddOpen]          = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [form,             setForm]             = useState(EMPTY_FORM)
  const [formErr,          setFormErr]          = useState({})
  const [submitting,       setSubmitting]       = useState(false)

  const { data: vehicles = [],     loading: loadV } = useQuery('vehicles',      getVehicles,      { ttl: 60_000 })
  const { data: branches = [],     loading: loadB } = useQuery('branches',      getBranches,      { ttl: 120_000 })
  const { data: vehicleTypes = [], loading: loadVT } = useQuery('vehicle-types', getVehicleTypes, { ttl: 120_000 })
  const { data: fuelTypes = [],    loading: loadFT } = useQuery('fuel-types',    getFuelTypes,    { ttl: 120_000 })

  const loading = loadV

  const stats = useMemo(() => ({
    available:    vehicles.filter((v) => v.status === 'AVAILABLE').length,
    inUse:        vehicles.filter((v) => v.status === 'IN_USE').length,
    maintenance:  vehicles.filter((v) => v.status === 'MAINTENANCE').length,
    outOfService: vehicles.filter((v) => v.status === 'OUT_OF_SERVICE').length,
  }), [vehicles])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    setFormErr((e) => { const n = { ...e }; delete n[k]; return n })
  }

  function validate() {
    const e = {}
    if (!form.plate_number?.trim())  e.plate_number  = 'Required'
    if (!form.vehicle_name?.trim())  e.vehicle_name  = 'Required'
    if (!form.vehicle_type_id)       e.vehicle_type_id = 'Required'
    if (!form.fuel_type_id)          e.fuel_type_id  = 'Required'
    if (!form.branch_id)             e.branch_id     = 'Required'
    setFormErr(e)
    return !Object.keys(e).length
  }

  async function handleAdd() {
    if (!validate()) return
    setSubmitting(true)
    try {
      await createVehicle({
        ...form,
        vehicle_type_id: parseInt(form.vehicle_type_id),
        fuel_type_id:    parseInt(form.fuel_type_id),
        branch_id:       parseInt(form.branch_id),
        year:            form.year     ? parseInt(form.year)     : null,
        capacity:        form.capacity ? parseInt(form.capacity) : null,
      })
      showToast('Vehicle added successfully.')
      invalidate('vehicles')
      setAddOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) { setFormErr(errs); showToast(Object.values(errs).flat()[0], 'error') }
      else showToast(err.response?.data?.message || 'Failed to add vehicle', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate() {
    try {
      await updateVehicleStatus(deactivateTarget.id, 'OUT_OF_SERVICE')
      showToast(`${deactivateTarget.plate_number || deactivateTarget.plate} deactivated.`)
      invalidate('vehicles')
      setDeactivateTarget(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to deactivate', 'error')
    }
  }

  const columns = [
    { key: 'plate_number', label: 'Plate',    mono: true, render: (v) => v.plate_number || v.plate || '—' },
    { key: 'vehicle_name', label: 'Name',                 render: (v) => v.vehicle_name || v.model || '—' },
    { key: 'branch',       label: 'Branch',   dim: true,  render: (v) => v.branch?.branch_name || v.branch?.name || '—' },
    { key: 'status',       label: 'Status',               render: (v) => <StatusPill status={v.status?.toLowerCase()} /> },
    {
      key: 'actions', label: '',
      render: (v) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/transport/vehicles/${v.id}`)}
            className="p-1.5 rounded-lg text-ink-400 hover:text-brand-green hover:bg-brand-green-50 transition-colors" title="Edit">
            <Pencil size={14} />
          </button>
          {v.status !== 'OUT_OF_SERVICE' && (
            <button onClick={() => setDeactivateTarget(v)}
              className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Deactivate">
              <Ban size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Available"    value={stats.available}    tone="green" />
        <StatCard label="In Use"       value={stats.inUse}        tone="blue"  />
        <StatCard label="Maintenance"  value={stats.maintenance}  tone="amber" />
        <StatCard label="Out of Service" value={stats.outOfService} tone="red" />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-ink-900">Fleet ({vehicles.length})</h3>
          <Button icon={Plus} size="sm" onClick={() => setAddOpen(true)}>Add Vehicle</Button>
        </div>
        <Table
          columns={columns}
          rows={vehicles}
          loading={loading}
          onRowClick={(v) => navigate(`/transport/vehicles/${v.id}`)}
          emptyState={<EmptyState icon={Car} message="No vehicles registered yet." action={<Button icon={Plus} size="sm" onClick={() => setAddOpen(true)}>Add Vehicle</Button>} />}
        />
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(EMPTY_FORM); setFormErr({}) }}
        title="Add Vehicle"
        footer={<>
          <Button variant="ghost" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM) }}>Cancel</Button>
          <Button loading={submitting} icon={Plus} onClick={handleAdd}>Add Vehicle</Button>
        </>}
      >
        <div className="space-y-3 mt-1 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plate Number" required error={formErr.plate_number}>
              <Input value={form.plate_number} onChange={(e) => setField('plate_number', e.target.value)} placeholder="ABC-123" />
            </Field>
            <Field label="Vehicle Name" required error={formErr.vehicle_name}>
              <Input value={form.vehicle_name} onChange={(e) => setField('vehicle_name', e.target.value)} placeholder="Toyota Camry" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Make">
              <Input value={form.make} onChange={(e) => setField('make', e.target.value)} placeholder="Toyota" />
            </Field>
            <Field label="Model">
              <Input value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="Camry" />
            </Field>
            <Field label="Year">
              <Input type="number" value={form.year} onChange={(e) => setField('year', e.target.value)} placeholder="2024" min="2000" max="2030" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Colour">
              <Input value={form.color} onChange={(e) => setField('color', e.target.value)} placeholder="White" />
            </Field>
            <Field label="Capacity (seats)">
              <Input type="number" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} placeholder="5" min="1" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vehicle Type" required error={formErr.vehicle_type_id}>
              <Select value={form.vehicle_type_id} onChange={(e) => setField('vehicle_type_id', e.target.value)}>
                <option value="">Select type…</option>
                {vehicleTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Fuel Type" required error={formErr.fuel_type_id}>
              <Select value={form.fuel_type_id} onChange={(e) => setField('fuel_type_id', e.target.value)}>
                <option value="">Select fuel…</option>
                {fuelTypes.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Branch" required error={formErr.branch_id}>
            <Select value={form.branch_id} onChange={(e) => setField('branch_id', e.target.value)}>
              <option value="">Select branch…</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>)}
            </Select>
          </Field>
          <Field label="Initial Status">
            <Select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>

      {/* Deactivate confirm */}
      <Modal open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)}
        title="Deactivate vehicle?"
        subtitle={`${deactivateTarget?.plate_number || deactivateTarget?.plate} will be removed from the dispatch pool`}
        footer={<>
          <Button variant="ghost" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
          <Button variant="destructiveSolid" onClick={handleDeactivate}>Deactivate</Button>
        </>}
      >
        <p className="text-sm text-ink-500 mt-1">This vehicle will be marked Out of Service and won't appear in assignment options.</p>
      </Modal>
    </div>
  )
}
