import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg: string) => toast(msg, 'error'),   [toast])
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast])
  const info    = useCallback((msg: string) => toast(msg, 'info'),    [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              <ToastItem toast={t} onDismiss={dismiss} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const styles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle className="w-5 h-5 text-white flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-500',
      icon: <Info className="w-5 h-5 text-white flex-shrink-0" />,
    },
  }

  const { bg, icon } = styles[toast.type]

  return (
    <div className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm`}>
      {icon}
      <p className="text-sm font-semibold flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/70 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
