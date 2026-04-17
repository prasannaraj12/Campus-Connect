import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X, Camera } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function QRScanner({ onClose }: Props) {
  const [manualInput, setManualInput] = useState('')

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    const input = manualInput.trim().toUpperCase()
    if (input.includes('REG-') || input.length <= 10) {
      window.location.href = `/ticket/${input}`
    } else if (input.includes('/ticket/')) {
      const regId = input.split('/ticket/')[1]
      window.location.href = `/ticket/${regId}`
    } else {
      window.location.href = `/ticket/${input}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-display text-lg font-extrabold text-slate-900">Scan QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Camera placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 mb-1">Camera Scanner</p>
            <p className="text-sm text-slate-400">
              Camera QR scanning coming soon. Use manual entry below.
            </p>
          </div>

          {/* Manual entry */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Manual Entry
            </label>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Paste registration code or ticket URL"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:outline-none font-mono text-sm transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Mark Attendance
              </motion.button>
            </form>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Ask participants to share their registration code or ticket URL
          </p>
        </div>
      </motion.div>
    </div>
  )
}
