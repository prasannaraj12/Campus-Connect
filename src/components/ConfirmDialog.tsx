import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9998]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-colors ${
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
