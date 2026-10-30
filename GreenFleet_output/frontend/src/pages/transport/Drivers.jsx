import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, User } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getDrivers, createDriver, getBranches } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useQuery, useQueryCache } from '../../context/QueryCache.jsx'

const EMPTY_FORM = { first_name: '', last_name: '', phone: '', license_number: '', branch_id: '', status: 'AVAILABLE' }

export default function Drivers() {
  usePageMeta({ title: 'Drivers', breadcrumb: 'Transport' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { invalidate } = useQueryCache()

  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: drivers  = [], loading } = useQuery('drivers',  getDrivers,  { ttl: 60_000 })
  const { data: branches = [] }          = useQuery('branches', getBranches, { ttl: 120_000 })

  const stats = useMemo(() => ({
    available:  drivers.filter((d) => d.status === 'AVAILABLE' || d.status === 'ACTIVE').length,
    onTrip:     drivers.filter((d) => d.status === 'ON_TRIP').length,
    inactive:   drivers.filter((d) => d.status === 'INACTIVE' || d.status === 'DEACTIVATED').length,
  }), [drivers])

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleCreate() {
    if (!form.first_name || !form.last_name || !form.phone) {
      showToast('First name, last name, and phone are required.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createDriver({
        first_name:     form.first_name,
        last_name:      form.last_name,
        phone:          form.phone,
        license_number: form.license_number || undefined,
        branch_id:      form.branch_id      || undefined,
        status:         form.status,
      })
      showToast(`${form.first_name} ${form.last_name} added.`)
      invalidate('drivers')
      setCreateOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add driver', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Driver',
      render: (d) => {
        const name = `${d.first_name || d.user?.first_name || ''} ${d.last_name || d.user?.last_name || ''}`.trim() || d.name || '—'
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={name} size={28} />
            <span className="text-sm font-medium text-ink-900">{name}</span>
          </div>
        )
      },
    },
    { key: 'phone',          label: 'Phone',     mono: true, dim: true, render: (d) => d.phone || d.phone_number || '—' },
    { key: 'license_number', label: 'License',   mono: true, dim: true, render: (d) => d.license_number || '—' },
    { key: 'branch',         label: 'Branch',    dim: true,  render: (d) => d.branch?.branch_name || d.branch?.name || '—' },
    { key: 'status',         label: 'Status',                render: (d) => <StatusPill status={d.status?.toLowerCase()} /> },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Available"  value={stats.available} tone="green" />
        <StatCard label="On Trip"    value={stats.onTrip}    tone="blue"  />
        <StatCard label="Inactive"   value={stats.inactive}  tone="red"   />
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-ink-900">Drivers ({drivers.length})</h3>
          <Button icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>Add Driver</Button>
        </div>
        <Table
          columns={columns}
          rows={drivers}
          loading={loading}
          onRowClick={(d) => navigate(`/transport/drivers/${d.id}`)}
          emptyState={<EmptyState icon={User} message="No drivers registered." action={<Button icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>Add Driver</Button>} />}
        />
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setForm(EMPTY_FORM) }}
        title="Add Driver"
        footer={<>
          <Button variant="ghost" onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM) }}>Cancel</Button>
          <Button loading={submitting} icon={Plus} onClick={handleCreate}>Add Driver</Button>
        </>}
      >
        <div className="space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required>
              <Input value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} placeholder="John" />
            </Field>
            <Field label="Last Name" required>
              <Input value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} placeholder="Doe" />
            </Field>
          </div>
          <Field label="Phone Number" required>
            <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+234 800 000 0000" />
          </Field>
          <Field label="License Number">
            <Input value={form.license_number} onChange={(e) => setField('license_number', e.target.value)} placeholder="NIG-ABC-12345" />
          </Field>
          <Field label="Branch">
            <Select value={form.branch_id} onChange={(e) => setField('branch_id', e.target.value)}>
              <option value="">No branch assigned</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="AVAILABLE">Available</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
