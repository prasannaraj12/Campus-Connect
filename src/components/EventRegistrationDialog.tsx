import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Ticket } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'
import RegistrationForm from './RegistrationForm'

interface Props {
  event: any
  userId: Id<'users'>
  onClose: () => void
}

export default function EventRegistrationDialog({ event, userId, onClose }: Props) {
  const [isFormDirty, setIsFormDirty]         = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty)
  }, [])

  const handleCloseAttempt = () => {
    if (isFormDirty) setShowConfirmation(true)
    else onClose()
  }

  return (
    <AnimatePresence>
      <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl
                     border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                     w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        >
          {/* Unsaved changes overlay */}
          {showConfirmation && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border-2 border-black/80 shadow-[4px_4px_0_rgba(0,0,0,0.8)] p-5 max-w-xs w-full"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black">Unsaved changes</h3>
                    <p className="text-xs text-black/50 font-medium mt-1">
                      Your form data will be lost. Exit anyway?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-bold bg-black/5 text-black
                               border border-black/15 hover:bg-black/10 transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => { setShowConfirmation(false); onClose() }}
                    className="flex-1 py-2 rounded-lg text-sm font-bold bg-red-500 text-white
                               border border-red-400 hover:bg-red-600 transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/10
                          px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-nb-purple flex items-center justify-center
                              shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-display text-base font-black text-black tracking-tight">
                  Register for Event
                </h2>
                <p className="text-xs text-black/40 font-medium truncate max-w-[220px]">
                  {event.title}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseAttempt}
              className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10
                         flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-black/60" />
            </button>
          </div>

          <div className="p-5">
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
