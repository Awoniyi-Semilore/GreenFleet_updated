import React, { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import { Select } from './FormField.jsx'
import TripTimeline from './TripTimeline.jsx'
import { getBranches } from '../data/api.js'

const OPTIONS = [
  'Driver is waiting for me',
  'Driver returned to office',
  'Driver proceeded to another branch',
]

export default function RideCompletionModal({ open, onClose, onSubmit }) {
  const [choice, setChoice] = useState('')
  const [branch, setBranch] = useState('')
  // FIX: was using a hardcoded static list — now fetches live from /api/branches
  const [branches, setBranches] = useState([])

  useEffect(() => {
    if (open) {
      getBranches()
        .then(setBranches)
        .catch(() => setBranches([]))
    }
  }, [open])

  const needsBranch = choice === 'Driver proceeded to another branch'
  const canSubmit = choice && (!needsBranch || branch)

  function handleSubmit() {
    onSubmit({ choice, branchId: needsBranch ? branch : null })
    setChoice('')
    setBranch('')
  }

  function handleClose() {
    setChoice('')
    setBranch('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="What happened after your trip?" width={480}>
      <div className="mb-5">
        <TripTimeline currentStep="Ride Completed" compact />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {OPTIONS.map((opt) => (
          <div key={opt}>
            <button
              type="button"
              onClick={() => setChoice(opt)}
              className={[
                'w-full text-left px-4 py-3 rounded-btn border text-sm transition-colors duration-150',
                choice === opt
                  ? 'border-brand-green bg-brand-green-100 font-medium text-ink-900'
                  : 'border-border-subtle hover:border-brand-green/50',
              ].join(' ')}
            >
              {opt}
            </button>
            {opt === 'Driver proceeded to another branch' && choice === opt && (
              <div className="ml-4 mt-2">
                <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branch_name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={handleClose} className="text-sm text-ink-600 hover:underline">
          Cancel
        </button>
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Modal>
  )
}
