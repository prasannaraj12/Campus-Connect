import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'
import RegistrationForm from './RegistrationForm'

interface Props {
  event: any
  userId: Id<'users'>
  onClose: () => void
}

export default function EventRegistrationDialog({ event, userId, onClose }: Props) {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty)
  }, [])

  const handleCloseAttempt = () => {
    if (isFormDirty) {
      setShowConfirmation(true)
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        >
          {/* Unsaved changes confirmation */}
          {showConfirmation && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Unsaved Changes</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      You have unsaved changes. Are you sure you want to exit?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => { setShowConfirmation(false); onClose() }}
                    className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="font-display text-xl font-extrabold text-slate-900">Register for Event</h2>
            <button
              onClick={handleCloseAttempt}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6">
            <RegistrationForm
              event={event}
              userId={userId}
              onSuccess={onClose}
              onCancel={handleCloseAttempt}
              onDirtyChange={handleDirtyChange}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
