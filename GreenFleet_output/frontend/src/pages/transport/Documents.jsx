import React, { useEffect, useState } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Table from '../../components/Table.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, Input, Select } from '../../components/FormField.jsx'
import { getVehicleDocuments, createVehicleDocument, deleteVehicleDocument } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Documents() {
  usePageMeta({ title: 'Vehicle Documents', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ vehicle_id: '', document_name: '', file_path: '', expiry_date: '', status: 'VALID' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    setLoading(true)
    try {
      const data = await getVehicleDocuments()
      setDocuments(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!form.vehicle_id || !form.document_name) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createVehicleDocument({
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
      })
      showToast('Document added.')
      setAddOpen(false)
      setForm({ vehicle_id: '', document_name: '', file_path: '', expiry_date: '', status: 'VALID' })
      await loadDocuments()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add document', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteVehicleDocument(deleteTarget.id)
      showToast('Document deleted.')
      setDeleteTarget(null)
      await loadDocuments()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'vehicle', label: 'Vehicle', render: (d) => d.vehicle?.plate_number || d.vehicle_id || '—' },
    { key: 'document_name', label: 'Document' },
    { key: 'file', label: 'File', render: (d) => d.file_path ? <a href={d.file_path} target="_blank" rel="noopener" className="text-brand-green text-sm flex items-center gap-1"><FileText size={14} /> View</a> : '—' },
    { key: 'expiry', label: 'Expiry', render: (d) => d.expiry_date || '—' },
    { key: 'status', label: 'Status', render: (d) => <span className={`text-xs font-medium ${d.status === 'VALID' ? 'text-brand-green' : d.status === 'EXPIRED' ? 'text-status-rejected' : 'text-status-pending'}`}>{d.status}</span> },
    {
      key: 'actions', label: '',
      render: (d) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(d) }} className="text-ink-600 hover:text-status-rejected" aria-label="Delete">
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
        <Button icon={Plus} onClick={() => setAddOpen(true)}>Add Document</Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={documents} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Vehicle Document"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={submitting}>Add</Button>
          </>
        }
      >
        <Field label="Vehicle ID" required>
          <Input type="number" value={form.vehicle_id} onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))} />
        </Field>
        <Field label="Document Name" required>
          <Input value={form.document_name} onChange={(e) => setForm((f) => ({ ...f, document_name: e.target.value }))} placeholder="e.g. Insurance" />
        </Field>
        <Field label="File Path">
          <Input value={form.file_path} onChange={(e) => setForm((f) => ({ ...f, file_path: e.target.value }))} placeholder="documents/insurance.pdf" />
        </Field>
        <Field label="Expiry Date">
          <Input type="date" value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="VALID">Valid</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING_RENEWAL">Pending Renewal</option>
          </Select>
        </Field>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete document?"
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