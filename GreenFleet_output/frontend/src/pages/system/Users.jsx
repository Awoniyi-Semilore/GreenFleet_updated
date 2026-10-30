import React, { useEffect, useState } from 'react'
import { Plus, KeyRound, Ban, Play } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getUsers, getBranches, getDepartments, createUser, updateUser, updateUserStatus, resetUserPassword } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const ROLES = ['Staff', 'Transport Admin', 'System Administrator']

export default function Users() {
  usePageMeta({ title: 'User Management', breadcrumb: 'System Admin' })
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', username: '', department_id: '', branch_id: '', role_id: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [u, b, d] = await Promise.all([
        getUsers(),
        getBranches(),
        getDepartments(),
      ])
      setUsers(u)
      setBranches(b)
      setDepartments(d)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function suggestedUsername(firstName, lastName) {
    if (!firstName || !lastName) return ''
    return `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`
  }

  async function handleCreate() {
    if (!form.first_name || !form.last_name || !form.email) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        username: form.username || suggestedUsername(form.first_name, form.last_name),
        password: Math.random().toString(36).slice(2, 10) + 'A1!',
        status: 'ACTIVE',
      }
      if (!payload.department_id) delete payload.department_id
      if (!payload.branch_id) delete payload.branch_id
      if (!payload.role_id) delete payload.role_id

      const result = await createUser(payload)
      const emailStatus = result.email_sent ? 'credentials emailed' : 'email failed — check logs'
      showToast(`${form.first_name} ${form.last_name} created — ${emailStatus}.`)
      setCreateOpen(false)
      setForm({ first_name: '', last_name: '', email: '', username: '', department_id: '', branch_id: '', role_id: '' })
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleInlineUpdate(id, key, value) {
    const cleanValue = value === '' || value === 0 || value === undefined ? null : value
    try {
      const payload = { [key]: cleanValue }
      await updateUser(id, payload)
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, [key]: cleanValue } : x)))
      showToast('User updated.')
    } catch (err) {
      console.error('Update error:', err.response?.data)
      showToast(err.response?.data?.message || 'Failed to update user', 'error')
    }
  }

  async function handleConfirmAction() {
    const { user, action } = confirmTarget
    if (action === 'reset') {
      try {
        const result = await resetUserPassword(user.id)
        const emailStatus = result.email_sent ? 'email sent' : 'email failed'
        showToast(`Password reset for ${user.first_name || user.name} — ${emailStatus}.`)
      } catch (err) {
        showToast('Failed to reset password', 'error')
      }
    } else if (action === 'toggle') {
      try {
        const updated = await updateUserStatus(user.id)
        const newStatus = updated?.status || (user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
        setUsers((u) => u.map((x) => (x.id === user.id ? { ...x, status: newStatus } : x)))
        showToast(`${user.first_name || user.name} ${newStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'}.`)
      } catch (err) {
        showToast('Failed to update user status', 'error')
      }
    }
    setConfirmTarget(null)
  }

  const columns = [
    {
      key: 'name', label: 'Name', render: (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || '—'
    },
    { key: 'username', label: 'Username', mono: true, render: (u) => u.username || '—' },
    { key: 'email', label: 'Email', render: (u) => u.email || '—' },
    {
      key: 'department', label: 'Department', render: (u) => (
        <Select 
          value={u.department_id ?? ''} 
          onChange={(e) => handleInlineUpdate(u.id, 'department_id', e.target.value ? parseInt(e.target.value) : null)} 
          className="!py-1 text-xs"
        >
          <option value="">—</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name || d.name}</option>)}
        </Select>
      )
    },
    {
      key: 'branch', label: 'Branch', render: (u) => (
        <Select 
          value={u.branch_id ?? ''} 
          onChange={(e) => handleInlineUpdate(u.id, 'branch_id', e.target.value ? parseInt(e.target.value) : null)} 
          className="!py-1 text-xs"
        >
          <option value="">—</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>)}
        </Select>
      )
    },
    {
      key: 'role', label: 'Role', render: (u) => (
        <Select 
          value={u.role_id ?? ''} 
          onChange={(e) => handleInlineUpdate(u.id, 'role_id', e.target.value ? parseInt(e.target.value) : null)} 
          className="!py-1 text-xs"
        >
          <option value="">—</option>
          {ROLES.map((r, i) => <option key={i} value={i + 1}>{r}</option>)}
        </Select>
      )
    },
    { key: 'status', label: 'Status', render: (u) => <StatusPill status={u.status === 'ACTIVE' ? 'active' : 'deactivated'} label={u.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-3">
          <button onClick={() => setConfirmTarget({ user: u, action: 'reset' })} className="text-ink-600 hover:text-brand-green" aria-label="Reset password">
            <KeyRound size={15} />
          </button>
          <button onClick={() => setConfirmTarget({ user: u, action: 'toggle' })} className="text-ink-600 hover:text-status-rejected" aria-label="Deactivate/Reactivate">
            {u.status === 'ACTIVE' ? <Ban size={15} /> : <Play size={15} />}
          </button>
        </div>
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
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={users} stickyFirstColumn />
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create User"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.first_name || !form.last_name || !form.email} loading={submitting}>Create User</Button>
          </>
        }
      >
        <Field label="First Name" required>
          <Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
        </Field>
        <Field label="Last Name" required>
          <Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Username" helper="Auto-suggested from name">
          <Input value={form.username || suggestedUsername(form.first_name, form.last_name)} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
        </Field>
        <Field label="Department">
          <Select value={form.department_id} onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value ? parseInt(e.target.value) : '' }))}>
            <option value="">Select department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name || d.name}</option>)}
          </Select>
        </Field>
        <Field label="Branch">
          <Select value={form.branch_id} onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value ? parseInt(e.target.value) : '' }))}>
            <option value="">Select branch</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>)}
          </Select>
        </Field>
        <Field label="Role">
          <Select value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value ? parseInt(e.target.value) : '' }))}>
            <option value="">Select role</option>
            {ROLES.map((r, i) => <option key={i} value={i + 1}>{r}</option>)}
          </Select>
        </Field>
      </Modal>

      <Modal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title={confirmTarget?.action === 'reset' ? 'Reset password?' : confirmTarget?.user?.status === 'ACTIVE' ? 'Deactivate user?' : 'Reactivate user?'}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button variant={confirmTarget?.action === 'toggle' && confirmTarget?.user?.status === 'ACTIVE' ? 'destructiveSolid' : 'primary'} onClick={handleConfirmAction}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          {confirmTarget?.action === 'reset'
            ? `This will send a password reset email to ${confirmTarget?.user?.first_name || confirmTarget?.user?.name}.`
            : confirmTarget?.user?.status === 'ACTIVE'
              ? `${confirmTarget?.user?.first_name || confirmTarget?.user?.name} will lose access immediately.`
              : `${confirmTarget?.user?.first_name || confirmTarget?.user?.name} will regain access immediately.`}
        </p>
      </Modal>
    </div>
  )
}