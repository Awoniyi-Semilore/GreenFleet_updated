import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev.slice(-3), { id, message, type }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, 4500)
  }, [])

  function dismiss(id) {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-5 right-4 sm:right-5 z-[9999] flex flex-col gap-2 w-[calc(100vw-32px)] sm:w-auto sm:max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const isError = t.type === 'error'
          return (
            <div
              key={t.id}
              className={[
                'flex items-start gap-3 px-4 py-3.5 rounded-card border shadow-card-md text-sm font-medium pointer-events-auto animate-fade-up',
                isError
                  ? 'bg-red-50  border-red-200  text-red-800'
                  : 'bg-white   border-border-subtle text-ink-900',
              ].join(' ')}
            >
              {isError
                ? <AlertCircle  size={16} className="text-red-500 shrink-0 mt-0.5" />
                : <CheckCircle2 size={16} className="text-brand-green shrink-0 mt-0.5" />
              }
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-ink-300 hover:text-ink-700 transition-colors ml-1 -mr-1"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) return { showToast: (msg) => console.log('[Toast]', msg) }
  return ctx
}
