import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus as PlusIcon, Calendar, Clock, Lock, Info, Send, AlertTriangle, ChevronLeft } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import { Field, Input, Textarea, ReadOnlyField } from '../../components/FormField.jsx'
import { Segmented } from '../../components/Segmented.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { createRequest, getDepartments } from '../../data/api.js'
import { useQueryCache } from '../../context/QueryCache.jsx'

const REQUIRED = ['pickup_location', 'destination', 'purpose', 'departure_date', 'departure_time', 'department_id']

const PRIORITIES = [
  { id: 'LOW',    label: 'Low' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'HIGH',   label: 'Urgent' },
]

export default function NewRequest() {
  usePageMeta({ title: 'New Request', breadcrumb: 'Staff Portal' })
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { showToast } = useToast()
  const { invalidate } = useQueryCache()

  const [departments,   setDepartments]   = useState([])
  const [loadingDepts,  setLoadingDepts]  = useState(true)
  const [selectedDept,  setSelectedDept]  = useState(null)
  const [touched,       setTouched]       = useState({})
  const [confirmDiscard,setConfirmDiscard]= useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')

  const [form, setForm] = useState({
    requester_id:     user?.id || '',
    branch_id:        user?.branch_id || '',
    pickup_location:  user?.branch_name || user?.branch || '',
    destination:      '',
    purpose:          '',
    departure_date:   '',
    departure_time:   '',
    passenger_count:  1,
    priority:         'NORMAL',
    remarks:          '',
    department_id:    '',
  })

  useEffect(() => {
    let alive = true
    getDepartments()
      .then((data) => {
        if (!alive) return
        const list = Array.isArray(data) ? data : data?.data || []
        setDepartments(list)
        const matched = list.find(
          (d) => d.id === user?.department_id || d.name?.toLowerCase() === (user?.department || '').toLowerCase()
        ) || list[0]
        if (matched) {
          setSelectedDept(matched)
          setForm((f) => ({ ...f, department_id: matched.id }))
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingDepts(false) })
    return () => { alive = false }
  }, [user])

  const isDirty = !!(form.destination || form.purpose || form.departure_date)

  function setField(key, val) { setForm((f) => ({ ...f, [key]: val })) }
  function handleBlur(key)    { setTouched((t) => ({ ...t, [key]: true })) }
  function errFor(key) {
    return touched[key] && REQUIRED.includes(key) && !form[key] ? 'Required' : ''
  }

  function handleDeptChange(e) {
    const id    = Number(e.target.value) || e.target.value
    const found = departments.find((d) => d.id === id)
    setSelectedDept(found || null)
    setField('department_id', id)
  }

  const isValid = REQUIRED.every((k) => !!form[k])

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(Object.fromEntries(REQUIRED.map((k) => [k, true])))
    if (!isValid) return
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        department_id:      Number(form.department_id),
        requester_id:       form.requester_id || user?.id,
        line_manager_email: selectedDept?.line_manager_email || null,
      }
      const created = await createRequest(payload)
      invalidate('staff-requests')
      showToast('Request submitted successfully!')
      navigate(`/staff/requests/${created.id}`, { state: { justSubmitted: true } })
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs).flat()[0] : err.response?.data?.message || 'Failed to submit. Try again.')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto pb-32 sm:pb-8">
      {/* Back link */}
      <button
        onClick={() => isDirty ? setConfirmDiscard(true) : navigate('/staff/dashboard')}
        className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900 mb-5 transition-colors"
      >
        <ChevronLeft size={15} /> Dashboard
      </button>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Requester & Approval ── */}
        <Card title="Requester & Approval">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <ReadOnlyField label="Full Name" value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || '—'} />
            <ReadOnlyField label="Branch"    value={user?.branch || user?.branch_name || '—'} />
          </div>

          <Field label="Department" required error={errFor('department_id')}>
            {loadingDepts ? (
              <div className="h-9 bg-surface-muted animate-pulse rounded-btn border border-border-subtle" />
            ) : (
              <select
                value={form.department_id}
                onChange={handleDeptChange}
                onBlur={() => handleBlur('department_id')}
                className="w-full border border-border-subtle hover:border-border rounded-btn px-3 py-2 text-sm text-ink-900 bg-white outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-colors cursor-pointer"
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </Field>

          {/* Line manager info box */}
          <div className="mt-3 bg-surface-muted border border-border-subtle rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-600 flex items-center gap-1.5">
                <Lock size={12} className="text-ink-400" /> Line Manager (auto-assigned)
              </span>
              <span className="text-2xs bg-border-subtle text-ink-500 px-2 py-0.5 rounded-full font-medium">Read-only</span>
            </div>
            {selectedDept?.line_manager_email ? (
              <p className="text-sm font-mono text-ink-700">
                {selectedDept.line_manager_name || 'Line Manager'}
                {' '}—{' '}
                <span className="text-brand-green">{selectedDept.line_manager_email}</span>
              </p>
            ) : (
              <p className="text-xs text-amber-700">No line manager configured for this department.</p>
            )}
            <p className="text-2xs text-ink-400 mt-2 flex items-start gap-1.5">
              <Info size={11} className="shrink-0 mt-0.5 text-ink-300" />
              Contact HR or IT to update department manager details.
            </p>
          </div>

          {!selectedDept?.line_manager_email && (
            <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Without a line manager email, your request skips straight to Transport Admin review.
              </p>
            </div>
          )}
        </Card>

        {/* ── Trip Details ── */}
        <Card title="Trip Details">
          <div className="space-y-4">
            <Field label="Pickup Location" required error={errFor('pickup_location')}>
              <Input
                placeholder="Your branch or pickup point"
                value={form.pickup_location}
                onChange={(e) => setField('pickup_location', e.target.value)}
                onBlur={() => handleBlur('pickup_location')}
                error={errFor('pickup_location')}
              />
            </Field>

            <Field label="Destination" required error={errFor('destination')}>
              <Input
                placeholder="Where are you headed?"
                value={form.destination}
                onChange={(e) => setField('destination', e.target.value)}
                onBlur={() => handleBlur('destination')}
                error={errFor('destination')}
              />
            </Field>

            <Field label="Purpose" required error={errFor('purpose')}>
              <Input
                placeholder="e.g. Client meeting, Site inspection"
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                onBlur={() => handleBlur('purpose')}
                error={errFor('purpose')}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Departure Date" required error={errFor('departure_date')}>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
                  <Input
                    type="date"
                    min={today}
                    value={form.departure_date}
                    onChange={(e) => setField('departure_date', e.target.value)}
                    onBlur={() => handleBlur('departure_date')}
                    error={errFor('departure_date')}
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Departure Time" required error={errFor('departure_time')}>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
                  <Input
                    type="time"
                    value={form.departure_time}
                    onChange={(e) => setField('departure_time', e.target.value)}
                    onBlur={() => handleBlur('departure_time')}
                    error={errFor('departure_time')}
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>

            {/* Passenger counter */}
            <Field label="Passengers">
              <div className="flex items-center gap-0 border border-border-subtle rounded-btn overflow-hidden w-fit bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setField('passenger_count', Math.max(1, form.passenger_count - 1))}
                  className="w-10 h-10 flex items-center justify-center text-ink-600 hover:bg-surface-muted transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-ink-900 select-none">
                  {form.passenger_count}
                </span>
                <button
                  type="button"
                  onClick={() => setField('passenger_count', Math.min(12, form.passenger_count + 1))}
                  className="w-10 h-10 flex items-center justify-center text-ink-600 hover:bg-surface-muted transition-colors"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
            </Field>

            <Field label="Priority">
              <Segmented
                options={PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
                value={form.priority}
                onChange={(v) => setField('priority', v)}
              />
            </Field>

            <Field label="Notes" helper={`${form.remarks.length}/240 characters`}>
              <Textarea
                maxLength={240}
                placeholder="Anything the transport officer should know…"
                value={form.remarks}
                onChange={(e) => setField('remarks', e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </Card>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Button type="submit" loading={submitting} icon={Send}>Submit Request</Button>
          <Button type="button" variant="ghost" onClick={() => isDirty ? setConfirmDiscard(true) : navigate('/staff/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Mobile sticky bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-border-subtle p-4 flex flex-col gap-2 z-30 shadow-card-lg">
        <Button type="button" fullWidth loading={submitting} icon={Send} onClick={handleSubmit}>
          Submit Request
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={() => isDirty ? setConfirmDiscard(true) : navigate('/staff/dashboard')}>
          Cancel
        </Button>
      </div>

      {/* Discard confirmation */}
      <Modal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Discard request?"
        subtitle="Unsaved changes will be lost."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
            <Button variant="destructive" onClick={() => navigate('/staff/dashboard')}>Discard</Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">Your form data will be cleared and you'll be returned to the dashboard.</p>
      </Modal>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-400 pb-3 mb-4 border-b border-border-subtle">
        {title}
      </h2>
      {children}
    </div>
  )
}
