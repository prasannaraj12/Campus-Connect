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

  const inputClass = 'nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black text-sm italic placeholder:text-black/20'
  const labelClass = 'block text-[10px] font-black uppercase tracking-[0.4em] text-black mb-3 italic'

  return (
    <AnimatePresence>
    <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="brutal-dialog flex flex-col max-w-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black bg-nb-green">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000000]">
              <Megaphone className="w-5 h-5 text-black" />
            </div>
            <h2 className="font-display text-2xl font-black text-black">Send Announcement</h2>
          </div>
          <button
            onClick={onClose}
            className="nb bg-nb-pink text-white p-2 border-4 border-black hover:bg-black transition-colors shadow-[4px_4px_0_#000000]"
          >
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        <div className="p-8 space-y-6 bg-white overflow-y-auto">

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
                whileHover={{ scale: 1.02, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-nb-yellow text-black py-4 border-4 border-black font-black text-lg uppercase italic shadow-[10px_10px_0_#000000] hover:bg-nb-purple hover:text-white transition-all disabled:opacity-50 mt-6"
              >
                {loading ? 'Sending...' : 'Send to All'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
