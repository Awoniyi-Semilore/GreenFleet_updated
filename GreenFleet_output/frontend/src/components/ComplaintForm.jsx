import React, { useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import { Select, Textarea } from './FormField.jsx'

const TYPES = ['Late Arrival', 'Driver Conduct', 'Vehicle Condition', 'Unsafe Driving', 'Other']

export default function ComplaintForm({ open, onClose, onSubmit, onSkip }) {
  const [type, setType] = useState('')
  const [comment, setComment] = useState('')

  const canSubmit = !type || comment.trim().length > 0

  function handleSubmit() {
    if (!type) return
    onSubmit({ type, comment })
    setType('')
    setComment('')
  }

  function handleSkip() {
    setType('')
    setComment('')
    onSkip()
  }

  return (
    <Modal open={open} onClose={handleSkip} title="Would you like to report an issue?" width={480}>
      <p className="text-sm text-ink-600 mb-4">This is optional and only takes a minute.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-900 mb-1.5">Complaint Type</label>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select a type</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-ink-900 mb-1.5">
          Comments {type && <span className="text-status-rejected">*</span>}
        </label>
        <Textarea placeholder="Tell us what happened" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <Button variant="tertiary" onClick={handleSkip}>Skip</Button>
        <Button onClick={handleSubmit} disabled={!type || !canSubmit}>Submit</Button>
      </div>
    </Modal>
  )
}
