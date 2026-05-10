import { createContext, useContext } from 'react'

export type ToastHandler = (title: string, description?: string) => void

export const ToastContext = createContext<ToastHandler | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}
