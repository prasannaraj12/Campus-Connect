import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Megaphone, AlertCircle } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'

interface Props {
  organizerId: Id<'users'>
  onClose: () => void
}

export default function CreateAnnouncementDialog({ organizerId, onClose }: Props) {
  const createAnnouncement = useMutation(api.announcements.createAnnouncement)
  const myEvents = useQuery(api.events.getEventsByOrganizer, { organizerId })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    eventId: '' as string,
    priority: 'normal' as 'normal' | 'important',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createAnnouncement({
        title: formData.title,
        message: formData.message,
        eventId: formData.eventId ? (formData.eventId as Id<'events'>) : undefined,
        priority: formData.priority,
        organizerId,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:outline-none font-medium transition-colors bg-white text-slate-900 placeholder-slate-400'
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">Create Announcement</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                  placeholder="Important Update"
                />
              </div>

              <div>
                <label className={labelClass}>Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Enter your announcement message..."
                />
              </div>

              <div>
                <label className={labelClass}>Priority *</label>
                <select
                  required
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Link to Event (Optional)</label>
                <select
                  value={formData.eventId}
                  onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">General Announcement</option>
                  {myEvents?.map(event => (
                    <option key={event._id} value={event._id}>{event.title}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {formData.eventId
                    ? 'Will appear on the event detail page'
                    : 'Will appear on the landing page for all visitors'}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Announcement'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
