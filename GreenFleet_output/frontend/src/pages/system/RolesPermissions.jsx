import React, { useEffect, useState } from 'react'
import { Check, Users, Shield, Loader2 } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { getRolePermissions, updateRolePermissions, getRoleUserCounts } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const ROLES = ['Staff', 'Transport Admin', 'System Administrator']
const PERMISSIONS = [
  'Create Requests', 'Approve Requests', 'Assign Vehicles', 'Manage Drivers', 'Manage Vehicles',
  'Manage Users', 'View Reports', 'Export Data', 'Manage Settings', 'View Audit Logs', 'Manage Email Templates',
]

export default function RolesPermissions() {
  usePageMeta({ title: 'Roles & Permissions', breadcrumb: 'System Admin' })
  const { showToast } = useToast()
  const [matrix, setMatrix] = useState({})
  const [userCounts, setUserCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [perms, counts] = await Promise.all([
        getRolePermissions().catch(() => null),
        getRoleUserCounts().catch(() => null),
      ])
      if (perms) setMatrix(perms)
      if (counts) setUserCounts(counts)
    } catch (err) {
      console.error('Failed to load permissions:', err)
      showToast('Failed to load permissions.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function toggle(permission, role) {
    setMatrix((m) => ({
      ...m,
      [permission]: { ...m[permission], [role]: !m[permission]?.[role] },
    }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateRolePermissions(matrix)
      setDirty(false)
      showToast('Permissions saved successfully.')
    } catch (err) {
      showToast('Failed to save permissions.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-green" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div key={role} className="bg-surface border border-border-subtle rounded-card shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-green-100 flex items-center justify-center">
                <Users size={18} className="text-brand-green" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{role}</h3>
                <p className="text-xs text-ink-500">{userCounts[role] ?? 0} active users</p>
              </div>
            </div>
            <div className="text-xs text-ink-600">
              {Object.entries(matrix).filter(([, v]) => v?.[role]).length} of {PERMISSIONS.length} permissions granted
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-brand-green" />
            <h3 className="text-base font-semibold text-ink-900">Permission Matrix</h3>
          </div>
          <Button disabled={!dirty} onClick={() => setConfirmOpen(true)} loading={saving}>
            Save Changes
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-500 w-[280px]">
                  Permission
                </th>
                {ROLES.map((r) => (
                  <th key={r} className="px-4 py-3 text-center text-xs font-medium text-ink-500 w-[140px]">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p} className="border-b border-border-subtle last:border-0 hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink-900 font-medium">{p}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(p, r)}
                        className={[
                          'w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all duration-150',
                          matrix[p]?.[r]
                            ? 'bg-brand-green text-white shadow-sm'
                            : 'bg-surface-muted border border-border-subtle text-transparent hover:border-brand-green/50',
                        ].join(' ')}
                        aria-label={`${p} for ${r}`}
                      >
                        {matrix[p]?.[r] && <Check size={14} strokeWidth={3} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Save permission changes?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          This will update permissions for all roles immediately. Users will be affected on their next action.
        </p>
      </Modal>
    </div>
  )
}