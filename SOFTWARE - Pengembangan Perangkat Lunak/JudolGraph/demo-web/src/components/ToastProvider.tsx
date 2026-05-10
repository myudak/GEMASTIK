import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { ToastContext, type ToastHandler } from './toast-context'

interface Toast {
  id: number
  title: string
  description?: string
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback<ToastHandler>((title, description) => {
    const id = Date.now()
    setToasts((current) => [...current, { id, title, description }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3600)
  }, [])

  const value = useMemo(() => showToast, [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className="rounded-lg border border-emerald-100 bg-white p-4 shadow-lg shadow-slate-200"
            key={toast.id}
          >
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {toast.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
