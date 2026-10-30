import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MapPin, Car, Users, Navigation } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input } from '../../components/FormField.jsx'
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Branches() {
  usePageMeta({ title: 'Branches', breadcrumb: 'Transport Admin' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', address: '' })

  useEffect(() => {
    loadBranches()
  }, [])

  async function loadBranches() {
    setLoading(true)
    try {
      const data = await getBranches()
      setBranches(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingBranch(null)
    setForm({ name: '', location: '', address: '' })
    setModalOpen(true)
  }

  function openEditModal(branch) {
    setEditingBranch(branch)
    setForm({
      name: branch.branch_name || branch.name || '',
      location: branch.location || '',
      address: branch.address || '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Branch name is required.', 'error')
      return
    }
    setSubmitting(true)
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, form)
        showToast('Branch updated.')
      } else {
        await createBranch(form)
        showToast('Branch added.')
      }
      setModalOpen(false)
      setForm({ name: '', location: '', address: '' })
      setEditingBranch(null)
      await loadBranches()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save branch', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteBranch(deleteTarget.id)
      showToast('Branch deleted.')
      setDeleteTarget(null)
      await loadBranches()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete branch', 'error')
    }
  }

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
        <Button icon={Plus} onClick={openAddModal}>Add Branch</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className="text-left bg-surface border border-border-subtle rounded-card shadow-card p-5 hover:border-brand-green transition-colors duration-150 relative group"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); openEditModal(b) }}
                className="p-1.5 rounded-md hover:bg-surface-muted text-ink-600 hover:text-brand-green"
                aria-label="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(b) }}
                className="p-1.5 rounded-md hover:bg-red-50 text-ink-600 hover:text-status-rejected"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h3 className="text-base font-semibold text-ink-900 mb-1 pr-16">{b.branch_name || b.name}</h3>
            <p className="text-xs text-ink-600 flex items-start gap-1.5 mb-4">
              <MapPin size={13} className="mt-0.5 shrink-0" /> {b.location || b.address || '—'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-ink-900"><Car size={14} className="text-ink-600" /> {b.vehicle_count || b.vehicles || 0}</span>
              <span className="flex items-center gap-1.5 text-ink-900"><Users size={14} className="text-ink-600" /> {b.driver_count || b.drivers || 0}</span>
              <span className={`flex items-center gap-1.5 font-medium ${(b.current_trips || b.currentTrips || 0) > 0 ? 'text-brand-lime-100' : 'text-ink-900'}`}>
                <Navigation size={14} className={(b.current_trips || b.currentTrips || 0) > 0 ? 'text-brand-green' : 'text-ink-600'} />
                <span className={(b.current_trips || b.currentTrips || 0) > 0 ? 'text-brand-green' : 'text-ink-900'}>{b.current_trips || b.currentTrips || 0}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBranch(null) }}
        title={editingBranch ? 'Edit Branch' : 'Add Branch'}
        footer={
          <>
            <Button variant="tertiary" onClick={() => { setModalOpen(false); setEditingBranch(null) }}>Cancel</Button>
            <Button onClick={handleSave} loading={submitting}>{editingBranch ? 'Save Changes' : 'Add Branch'}</Button>
          </>
        }
      >
        <Field label="Branch Name" required>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Victoria Island HQ" />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Lagos" />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Full address" />
        </Field>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete branch?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructiveSolid" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Are you sure you want to delete <strong>{deleteTarget?.branch_name || deleteTarget?.name}</strong>?<br />
          Branches with vehicles or drivers cannot be deleted.
        </p>
      </Modal>
    </div>
  )
}
