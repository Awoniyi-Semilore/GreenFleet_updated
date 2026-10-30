import React from 'react'
import { Check } from 'lucide-react'

const TIMELINE_STEPS = ['Created', 'Approved', 'Driver Assigned', 'Ride Completed', 'Closed']

/**
 * Trip timeline component. Reused vertically/horizontally anywhere
 * trip progress is shown: Request Details, Active Trips row expansion,
 * Ride Completion modal header.
 */
export default function TripTimeline({ currentStep, orientation = 'horizontal', steps = TIMELINE_STEPS, compact = false }) {
  // Map backend status values to timeline steps
  const stepMap = {
    'PENDING': 'Created',
    'APPROVED': 'Approved',
    'ASSIGNED': 'Driver Assigned',
    'IN_USE': 'Driver Assigned',
    'COMPLETED': 'Ride Completed',
    'CLOSED': 'Closed',
    'REJECTED': 'Closed',
    'CANCELLED': 'Closed',
  }

  const resolvedStep = stepMap[currentStep] || currentStep
  const currentIndex = steps.indexOf(resolvedStep)

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future'
          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepCircle state={state} compact={compact} />
                {i < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${i < currentIndex ? 'bg-brand-green' : 'bg-border-subtle'}`} />
                )}
              </div>
              <div className={`pb-6 text-sm ${state === 'future' ? 'text-ink-300' : 'text-ink-900'} ${state === 'current' ? 'font-semibold' : ''}`}>
                {step}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future'
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2 min-w-[64px]">
              <StepCircle state={state} compact={compact} />
              <span className={`text-xs text-center whitespace-nowrap ${state === 'future' ? 'text-ink-300' : 'text-ink-900'} ${state === 'current' ? 'font-semibold' : ''}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-5 ${i < currentIndex ? 'bg-brand-green' : 'bg-border-subtle'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function StepCircle({ state, compact }) {
  const size = compact ? 'w-6 h-6' : 'w-8 h-8'
  if (state === 'done') {
    return (
      <div className={`${size} rounded-full bg-brand-green flex items-center justify-center text-white shrink-0`}>
        <Check size={compact ? 12 : 14} strokeWidth={3} />
      </div>
    )
  }
  if (state === 'current') {
    return (
      <div className={`${size} rounded-full bg-brand-lime shrink-0 motion-safe:animate-pulse-ring`} />
    )
  }
  return <div className={`${size} rounded-full border-2 border-border-subtle bg-white shrink-0`} />
}