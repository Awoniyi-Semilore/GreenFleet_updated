import React, { useEffect, useState } from 'react'
import { Eye, Check } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import { Select, Input, Textarea } from '../../components/FormField.jsx'
import Table from '../../components/Table.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import { getComplaints, resolveComplaint } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const TYPES = ['Late Arrival', 'Driver Conduct', 'Vehicle Condition', 'Unsafe Driving', 'Other']

export default function Complaints() {
  usePageMeta({ title: 'Complaints', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('')
  const [viewTarget, setViewTarget] = useState(null)
  const [resolveTarget, setResolveTarget] = useState(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComplaints()
  }, [])

  async function loadComplaints() {
    setLoading(true)
    try {
      const data = await getComplaints()
      setComplaints(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const filtered = complaints.filter((c) => {
    if (status !== 'all' && c.status?.toLowerCase() !== status) return false
    if (type && c.type !== type) return false
    return true
  })

  async function handleResolve() {
    if (!resolveTarget) return
    setSubmitting(true)
    try {
      await resolveComplaint(resolveTarget.id, note)
      showToast(`${resolveTarget.id} resolved.`)
      setResolveTarget(null)
      setNote('')
      await loadComplaints()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve complaint', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'submittedBy', label: 'Submitted By', render: (c) => c.submitted_by || c.submittedBy || '—' },
    { key: 'driver', label: 'Driver', render: (c) => c.driver?.name || c.driver_name || '—' },
    { key: 'vehicle', label: 'Vehicle', mono: true, render: (c) => c.vehicle?.plate_number || c.vehicle?.plate || c.vehicle || '—' },
    {
      key: 'type', label: 'Complaint', render: (c) => (
        <div>
          <StatusPill status="pending" label={c.type || c.category} />
          <p className="text-xs text-ink-600 mt-1 max-w-[220px] truncate">{c.comment || c.description}</p>
        </div>
      )
    },
    { key: 'status', label: 'Status', render: (c) => <StatusPill status={c.status} /> },
    { key: 'date', label: 'Date', render: (c) => c.date || c.created_at || '—' },
    {
      key: 'actions', label: 'Actions',
      render: (c) => (
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); setViewTarget(c) }} className="text-ink-600 hover:text-brand-green" aria-label="View">
            <Eye size={16} />
          </button>
          {c.status === 'Open' && (
            <button onClick={(e) => { e.stopPropagation(); setResolveTarget(c) }} className="text-ink-600 hover:text-brand-green" aria-label="Resolve">
              <Check size={16} />
            </button>
          )}
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

      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <PillTabs
          options={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }]}
          value={status}
          onChange={setStatus}
        />
        <div className="flex gap-3">
          <Select value={type} onChange={(e) => setType(e.target.value)} className="max-w-[180px]">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input type="date" className="max-w-[160px]" />
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-2">
        <Table columns={columns} rows={filtered} />
      </div>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.id} width={520}>
        {viewTarget && (
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Submitted By" value={viewTarget.submitted_by || viewTarget.submittedBy || '—'} />
            <Row label="Driver" value={viewTarget.driver?.name || viewTarget.driver_name || '—'} />
            <Row label="Vehicle" value={<span className="font-mono">{viewTarget.vehicle?.plate_number || viewTarget.vehicle?.plate || viewTarget.vehicle || '—'}</span>} />
            <Row label="Type" value={viewTarget.type || viewTarget.category || '—'} />
            <Row label="Status" value={<StatusPill status={viewTarget.status} />} />
            <div>
              <div className="text-ink-600 mb-1">Comment</div>
              <p className="text-ink-900">{viewTarget.comment || viewTarget.description || '—'}</p>
            </div>
            {viewTarget.resolution_note && (
              <div>
                <div className="text-ink-600 mb-1">Resolution Note</div>
                <p className="text-ink-900">{viewTarget.resolution_note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title="Resolve complaint"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button onClick={handleResolve} loading={submitting}>Mark Resolved</Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-ink-900 mb-1.5">Resolution note (optional)</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done to resolve this?" />
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-900">{value}</span>
    </div>
  )
}