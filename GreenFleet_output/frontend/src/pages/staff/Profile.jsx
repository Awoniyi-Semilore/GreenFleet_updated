import React, { useState } from 'react'
import { usePageMeta } from '../../components/Layout.jsx'
import Avatar from '../../components/Avatar.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import { Field, Input } from '../../components/FormField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Profile() {
  usePageMeta({ title: 'Profile', breadcrumb: 'Staff Portal' })
  const { user } = useAuth()
  const { showToast } = useToast()
  const [changeOpen, setChangeOpen] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || user.username : 'Guest'
  const department = user?.department || user?.department_name || '—'
  const branch = user?.branch || user?.branch_name || '—'

  async function handleSave() {
    if (!form.current || !form.next) {
      setError('Please fill in all fields.')
      return
    }
    if (form.next !== form.confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      // TODO: POST /api/change-password when backend adds it
      setChangeOpen(false)
      setForm({ current: '', next: '', confirm: '' })
      showToast('Password changed.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[480px]">
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={displayName} size={48} />
          <div>
            <div className="text-base font-semibold text-ink-900">{displayName}</div>
            <div className="text-sm text-ink-600">{user?.role || '—'}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ProfileRow label="Name" value={displayName} />
          <ProfileRow label="Department" value={department} />
          <ProfileRow label="Branch" value={branch} />
          <ProfileRow label="Username" value={<span className="font-mono">{user?.username || '—'}</span>} />
          <ProfileRow
            label="Password"
            value={
              <div className="flex items-center gap-3">
                <span className="font-mono">••••••••</span>
                {/* <button onClick={() => setChangeOpen(true)} className="text-brand-green text-sm hover:underline">Change Password</button> */}
              </div>
            }
          />
        </div>

        <p className="text-xs text-ink-600 mt-6 border-t border-border-subtle pt-4">
          To update your department or branch, contact your Transport Officer or IT Admin.
        </p>
      </div>

      <Modal
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        title="Change Password"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setChangeOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={submitting}>Save</Button>
          </>
        }
      >
        <Field label="Current Password" error={error && !form.current ? error : ''}>
          <Input type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
        </Field>
        <Field label="New Password">
          <Input type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />
        </Field>
        <Field label="Confirm New Password" error={error && form.next && form.next !== form.confirm ? error : ''}>
          <Input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        </Field>
      </Modal>
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-ink-600">{label}</span>
      <span className="text-sm text-ink-900 font-medium">{value}</span>
    </div>
  )
}