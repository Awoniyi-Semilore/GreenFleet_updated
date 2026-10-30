import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import { Field, Input } from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  getSettings,
  updateSetting,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../data/api.js'

const TABS = [
  { value: 'company', label: 'Company' },
  { value: 'branches', label: 'Branches' },
  { value: 'departments', label: 'Departments' },
  { value: 'vehicleTypes', label: 'Vehicle Types' },
  { value: 'priorities', label: 'Priorities' },
]

export default function Settings() {
  usePageMeta({ title: 'Settings', breadcrumb: 'System Admin' })
  const { showToast } = useToast()
  const [tab, setTab] = useState('company')
  const [settings, setSettings] = useState({
    company: { name: '', transport_email: '' },
    branches: [],
    departments: [],
    vehicleTypes: [],
    priorities: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState('')

  // Branch/Department modal state
  const [entityModalOpen, setEntityModalOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [entityForm, setEntityForm] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    line_manager_name: '',
    line_manager_email: '',
    line_manager_title: '',
  })
  const [entitySubmitting, setEntitySubmitting] = useState(false)
  const [deleteEntityTarget, setDeleteEntityTarget] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const [settingsData, branchesData, departmentsData] = await Promise.all([
        getSettings().catch((err) => {
          console.warn('getSettings failed (500 fallback):', err)
          return null
        }),
        getBranches().catch(() => []),
        getDepartments().catch(() => []),
      ])

      setSettings({
        company: {
          name: settingsData?.company?.name || 'Greenwich Merchant Bank',
          transport_email: settingsData?.group_transport_email || settingsData?.company?.transport_email || 'transport@greenwichmerchantbank.com',
        },
        branches: branchesData || [],
        departments: departmentsData || [],
        vehicleTypes: settingsData?.vehicleTypes || ['Sedan', 'SUV', 'Bus', 'Van'],
        priorities: settingsData?.priorities || ['Low', 'Normal', 'High Urgent'],
      })
    } catch (err) {
      console.error('Failed to load settings:', err)
      showToast('Failed to load settings.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateSetting(tab, settings[tab])
      showToast('Settings saved.')
    } catch (err) {
      showToast('Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function addListItem(key) {
    if (!newItem.trim()) return
    setSettings((s) => ({ ...s, [key]: [...s[key], newItem.trim()] }))
    setNewItem('')
  }

  function removeListItem(key, index) {
    setSettings((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) }))
  }

  // ── Branch/Department CRUD ──
  function openEntityModal(entity = null) {
    setEditingEntity(entity)
    if (tab === 'branches') {
      setEntityForm({
        name: entity?.branch_name || entity?.name || '',
        location: entity?.location || '',
        address: entity?.address || '',
        description: '',
        line_manager_name: '',
        line_manager_email: '',
        line_manager_title: '',
      })
    } else {
      setEntityForm({
        name: entity?.department_name || entity?.name || '',
        line_manager_name: entity?.line_manager_name || entity?.line_manager?.name || '',
        line_manager_email: entity?.line_manager_email || entity?.line_manager?.email || '',
        line_manager_title: entity?.line_manager_title || entity?.line_manager?.title || '',
        description: entity?.description || '',
        location: '',
        address: '',
      })
    }
    setEntityModalOpen(true)
  }

  async function handleEntitySave() {
    if (!entityForm.name.trim()) {
      showToast('Name is required.', 'error')
      return
    }
    setEntitySubmitting(true)
    try {
      if (tab === 'branches') {
        if (editingEntity) {
          await updateBranch(editingEntity.id, entityForm)
        } else {
          await createBranch(entityForm)
        }
      } else if (tab === 'departments') {
        const payload = {
          department_name: entityForm.name,
          line_manager_name: entityForm.line_manager_name || null,
          line_manager_email: entityForm.line_manager_email || null,
          line_manager_title: entityForm.line_manager_title || null,
          description: entityForm.description || null,
        }
        if (editingEntity) {
          await updateDepartment(editingEntity.id, payload)
        } else {
          await createDepartment(payload)
        }
      }
      showToast(`${editingEntity ? 'Updated' : 'Added'} successfully.`)
      setEntityModalOpen(false)
      setEditingEntity(null)
      setEntityForm({
        name: '',
        location: '',
        address: '',
        description: '',
        line_manager_name: '',
        line_manager_email: '',
        line_manager_title: '',
      })
      await loadSettings()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error')
    } finally {
      setEntitySubmitting(false)
    }
  }

  async function handleEntityDelete() {
    try {
      if (tab === 'branches') {
        await deleteBranch(deleteEntityTarget.id)
      } else if (tab === 'departments') {
        await deleteDepartment(deleteEntityTarget.id)
      }
      showToast('Deleted successfully.')
      setDeleteEntityTarget(null)
      await loadSettings()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="max-w-[640px]">
        <div className="mb-5 h-10 bg-surface border border-border-subtle rounded-btn animate-pulse" />
        <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6 space-y-4">
          <div className="h-10 bg-gray-100 rounded-btn animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-btn animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-btn animate-pulse w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[640px]">
      <div className="mb-5">
        <PillTabs options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
        {tab === 'company' && (
          <div className="space-y-4">
            <Field label="Company Name">
              <Input
                value={settings.company.name}
                onChange={(e) => setSettings((s) => ({ ...s, company: { ...s.company, name: e.target.value } }))}
              />
            </Field>
            <Field label="Group Transport Email">
              <Input
                value={settings.company.transport_email}
                onChange={(e) => setSettings((s) => ({ ...s, company: { ...s.company, transport_email: e.target.value } }))}
              />
            </Field>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        )}

        {tab === 'branches' && (
          <EntityManager
            title="Branches"
            items={settings.branches}
            onAdd={() => openEntityModal()}
            onEdit={(b) => openEntityModal(b)}
            onDelete={(b) => setDeleteEntityTarget(b)}
            renderName={(b) => b.branch_name || b.name}
            renderSub={(b) => b.location || b.address || '—'}
          />
        )}

        {tab === 'departments' && (
          <EntityManager
            title="Departments"
            items={settings.departments}
            onAdd={() => openEntityModal()}
            onEdit={(d) => openEntityModal(d)}
            onDelete={(d) => setDeleteEntityTarget(d)}
            renderName={(d) => d.department_name || d.name}
            renderSub={(d) => {
              const name = d.line_manager_name || d.line_manager?.name
              const email = d.line_manager_email || d.line_manager?.email
              return name ? `Manager: ${name} ${email ? `(${email})` : ''}` : (d.description || '—')
            }}
          />
        )}

        {['vehicleTypes', 'priorities'].includes(tab) && (
          <ListEditor
            title={TABS.find((t) => t.value === tab).label}
            items={settings[tab]}
            newItem={newItem}
            setNewItem={setNewItem}
            onAdd={() => addListItem(tab)}
            onRemove={(i) => removeListItem(tab, i)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>

      {/* Entity Add/Edit Modal */}
      <Modal
        open={entityModalOpen}
        onClose={() => { setEntityModalOpen(false); setEditingEntity(null) }}
        title={editingEntity ? `Edit ${tab === 'branches' ? 'Branch' : 'Department'}` : `Add ${tab === 'branches' ? 'Branch' : 'Department'}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => { setEntityModalOpen(false); setEditingEntity(null) }}>Cancel</Button>
            <Button onClick={handleEntitySave} loading={entitySubmitting}>{editingEntity ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <Field label="Name" required>
          <Input value={entityForm.name} onChange={(e) => setEntityForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        {tab === 'branches' && (
          <>
            <Field label="Location">
              <Input value={entityForm.location} onChange={(e) => setEntityForm((f) => ({ ...f, location: e.target.value }))} />
            </Field>
            <Field label="Address">
              <Input value={entityForm.address} onChange={(e) => setEntityForm((f) => ({ ...f, address: e.target.value }))} />
            </Field>
          </>
        )}
        {tab === 'departments' && (
          <>
            <Field label="Line Manager Name">
              <Input
                value={entityForm.line_manager_name}
                onChange={(e) => setEntityForm((f) => ({ ...f, line_manager_name: e.target.value }))}
                placeholder="e.g. John Doe"
              />
            </Field>
            <Field label="Line Manager Email">
              <Input
                type="email"
                value={entityForm.line_manager_email}
                onChange={(e) => setEntityForm((f) => ({ ...f, line_manager_email: e.target.value }))}
                placeholder="e.g. j.doe@company.com"
              />
            </Field>
            <Field label="Line Manager Title (Optional)">
              <Input
                value={entityForm.line_manager_title}
                onChange={(e) => setEntityForm((f) => ({ ...f, line_manager_title: e.target.value }))}
                placeholder="e.g. Head of Finance"
              />
            </Field>
            <Field label="Description">
              <Input value={entityForm.description} onChange={(e) => setEntityForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
          </>
        )}
      </Modal>

      {/* Entity Delete Modal */}
      <Modal
        open={!!deleteEntityTarget}
        onClose={() => setDeleteEntityTarget(null)}
        title={`Delete ${tab === 'branches' ? 'branch' : 'department'}?`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDeleteEntityTarget(null)}>Cancel</Button>
            <Button variant="destructiveSolid" onClick={handleEntityDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Are you sure you want to delete <strong>{deleteEntityTarget?.branch_name || deleteEntityTarget?.department_name || deleteEntityTarget?.name}</strong>?<br />
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

function ListEditor({ title, items, newItem, setNewItem, onAdd, onRemove, onSave, saving }) {
  return (
    <>
      <h3 className="text-sm font-semibold text-ink-900 mb-3">{title}</h3>
      <div className="flex flex-col gap-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border border-border-subtle rounded-btn px-3 py-2">
            <span className="text-sm text-ink-900">{item}</span>
            <button onClick={() => onRemove(i)} className="text-ink-300 hover:text-status-rejected" aria-label="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <Input placeholder={`Add ${title.toLowerCase().replace(/s$/, '')}`} value={newItem} onChange={(e) => setNewItem(e.target.value)} />
        <Button variant="secondary" icon={Plus} onClick={onAdd}>Add</Button>
      </div>
      <Button onClick={onSave} loading={saving}>Save</Button>
    </>
  )
}

function EntityManager({ title, items, onAdd, onEdit, onDelete, renderName, renderSub }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        <Button variant="secondary" size="sm" icon={Plus} onClick={onAdd}>Add</Button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border border-border-subtle rounded-btn px-3 py-2.5 group">
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink-900 truncate">{renderName(item)}</div>
              <div className="text-xs text-ink-600 truncate">{renderSub(item)}</div>
            </div>
            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(item)} className="p-1 rounded hover:bg-surface-muted text-brand-green font-medium" aria-label="Edit">
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(item)} className="p-1 rounded hover:bg-red-50 text-status-rejected font-medium" aria-label="Delete">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-ink-500 text-center py-6 border border-dashed border-border-subtle rounded-btn">
            No {title.toLowerCase()} yet. Click Add to create one.
          </div>
        )}
      </div>
    </>
  )
}