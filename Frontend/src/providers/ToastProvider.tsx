import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { ToastContext, type ToastVariant } from './toast'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId.current
      nextId.current += 1
      setToasts((current) => [...current, { id, message, variant }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-60 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className={
              toast.variant === 'success'
                ? 'glass-panel dialog-in rounded-2xl px-4 py-3 text-left text-sm text-ink'
                : 'glass-panel dialog-in rounded-2xl border-danger/20 px-4 py-3 text-left text-sm text-danger'
            }
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext>
  )
}
