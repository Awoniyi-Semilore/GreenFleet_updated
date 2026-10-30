import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MapPin, CreditCard, AlertCircle, ChevronLeft, Pencil } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Avatar from '../../components/Avatar.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { 
  getDriverById, 
  getRequests, 
  getComplaints, 
  updateDriver, 
  getBranches 
} from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active / Available' },
  { value: 'INACTIVE', label: 'Inactive / Off Duty' },
]

export default function DriverDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [driver, setDriver] = useState(null)
  const [history, setHistory] = useState([])
  const [complaints, setComplaints] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal and Form States
  const [editOpen, setEditOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    branch_id: '',
    status: 'ACTIVE',
  })

  usePageMeta({
    title: driver
      ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || driver.name || 'Driver'
      : 'Driver',
    breadcrumb: 'Transport / Drivers',
  })

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const [d, requests, allComplaints, branchesData] = await Promise.all([
        getDriverById(id),
        getRequests(),
        getComplaints(),
        getBranches().catch(() => []),
      ])
      
      const driverData = d?.data || d
      setDriver(driverData)
      setBranches(branchesData?.data || branchesData || [])

      setHistory(
        (requests?.data || requests || []).filter(
          (r) => r.driver?.id === parseInt(id) || r.driver_id === parseInt(id)
        )
      )

      setComplaints(
        (allComplaints?.data || allComplaints || []).filter(
          (c) => c.driver_id === parseInt(id) || c.driverId === parseInt(id)
        )
      )
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load driver details')
    } finally {
      setLoading(false)
    }
  }

  function openEditModal() {
    if (!driver) return
    setForm({
      first_name: driver.first_name || (driver.name ? driver.name.split(' ')[0] : ''),
      last_name: driver.last_name || (driver.name ? driver.name.split(' ').slice(1).join(' ') : ''),
      phone: driver.phone || driver.phone_number || '',
      license_number: driver.license_number || '',
      license_expiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : '',
      branch_id: driver.branch_id || driver.branch?.id || '',
      status: driver.status || 'ACTIVE',
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
    const payload = {
      first_name: form.first_name?.trim(),
      last_name: form.last_name?.trim(),
      phone: form.phone?.trim(),
      license_number: form.license_number?.trim() || null,
      license_expiry: form.license_expiry || null,
      branch_id: form.branch_id ? parseInt(form.branch_id, 10) : null,
      status: form.status,
    }

    try {
      const updatedRes = await updateDriver(id, payload)
      const updatedData = updatedRes?.data || updatedRes
      
      if (updatedData) {
        setDriver(updatedData)
      }
      
      showToast('Driver updated successfully.')
      setEditOpen(false)
      await load()
    } catch (err) {
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        setFormErrors(validationErrors)
      } else {
        showToast(err.response?.data?.message || 'Failed to update driver', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
    </div>
  )

  if (!driver) return <div className="text-sm text-ink-600">Driver not found.</div>

  const name    = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || driver.name || 'Unknown'
  const phone   = driver.phone || driver.phone_number || '—'
  const license = driver.license_number || '—'
  const branch  = driver.branch?.name || driver.branch?.branch_name || '—'
  const expiry  = driver.license_expiry
    ? new Date(driver.license_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'

  const tripCols = [
    { key: 'id',          label: '#',           mono: true, render: (r) => `#${r.id}` },
    { key: 'date',        label: 'Date',         render: (r) => r.departure_date || new Date(r.created_at).toLocaleDateString() },
    { key: 'destination', label: 'Destination',  render: (r) => r.destination || '—' },
    { key: 'status',      label: 'Status',       render: (r) => <StatusPill status={r.status} /> },
  ]

  const complaintCols = [
    { key: 'id',         label: '#',          mono: true, render: (c) => `#${c.id}` },
    { key: 'type',       label: 'Category',   render: (c) => c.type || c.category || '—' },
    { key: 'comment',    label: 'Description',render: (c) => c.comment || c.description || '—' },
    { key: 'status',     label: 'Status',     render: (c) => <StatusPill status={c.status || 'Open'} /> },
    { key: 'created_at', label: 'Date',       render: (c) => new Date(c.created_at).toLocaleDateString() },
  ]

  return (
    <div className="max-w-5xl space-y-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/transport/drivers')}
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition-colors bg-transparent border-0 cursor-pointer p-0 font-medium"
      >
        <ChevronLeft size={18} /> Back to Drivers
      </button>

      {error && (
        <div className="rounded-btn bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-5 flex items-center gap-4 flex-wrap">
        <Avatar name={name} size={56} />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-ink-900">{name}</h2>
          {phone !== '—' && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-green mt-0.5">
              <Phone size={13} /> {phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={driver.status_display || driver.status} />
          <Button icon={Pencil} variant="tertiary" onClick={openEditModal}>
            Edit Driver
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Personal Information">
          <Row icon={Phone}      label="Phone"          value={<span className="font-mono">{phone}</span>} />
          <Row icon={CreditCard} label="Licence No."    value={<span className="font-mono">{license}</span>} />
          <Row icon={CreditCard} label="Licence Expiry" value={expiry} />
          <Row icon={MapPin}     label="Branch"         value={branch} />
        </Card>

        <Card title="Availability">
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map((d, i) => (
              <div
                key={i}
                className={[
                  'w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium',
                  (driver.availability || [])[i]
                    ? 'bg-brand-green text-white'
                    : 'bg-surface-muted text-ink-300 border border-border-subtle',
                ].join(' ')}
              >
                {d}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Trip Summary">
          <Row label="Total Trips"     value={history.length} />
          <Row label="Completed"       value={history.filter((r) => r.status === 'COMPLETED').length} />
          <Row label="Open Complaints" value={complaints.filter((c) => !c.status || c.status === 'Open').length} />
        </Card>
      </div>

      {/* Trip History */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-ink-900">Trip History</h3>
        </div>
        <Table
          columns={tripCols}
          rows={history}
          emptyState={<div className="py-10 text-center text-sm text-ink-500">No trips recorded yet.</div>}
        />
      </div>

      {/* Complaints */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Complaints</h3>
          {complaints.length > 0 && (
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
              {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Table
          columns={complaintCols}
          rows={complaints}
          emptyState={<div className="py-10 text-center text-sm text-ink-500">No complaints filed against this driver.</div>}
        />
      </div>

      {/* Edit Driver Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Driver Details"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
            <Button variant="tertiary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} loading={submitting}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First Name" required error={formErrors.first_name}>
              <Input
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                placeholder="John"
              />
            </Field>
            <Field label="Last Name" required error={formErrors.last_name}>
              <Input
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                placeholder="Doe"
              />
            </Field>
          </div>

          <Field label="Phone" required error={formErrors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="+234..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="License Number" error={formErrors.license_number}>
              <Input
                value={form.license_number}
                onChange={(e) => setField('license_number', e.target.value)}
                placeholder="ABC123456"
              />
            </Field>
            <Field label="License Expiry" error={formErrors.license_expiry}>
              <Input
                type="date"
                value={form.license_expiry}
                onChange={(e) => setField('license_expiry', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Branch" error={formErrors.branch_id}>
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

          <Field label="Status" error={formErrors.status}>
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
      <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm gap-2">
      <span className="text-ink-500 flex items-center gap-1.5 shrink-0">
        {Icon && <Icon size={12} className="text-ink-400" />}
        {label}
      </span>
      <span className="text-ink-900 font-medium text-right truncate">{value ?? '—'}</span>
    </div>
  )
}