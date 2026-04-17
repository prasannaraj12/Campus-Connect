import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Sparkles, AlertCircle } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'
import { useNavigate } from 'react-router-dom'

interface Props {
  organizerId: Id<'users'>
  onClose: () => void
}

const categories = ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social', 'Hackathon']

export default function CreateEventDialog({ organizerId, onClose }: Props) {
  const navigate = useNavigate()
  const createEvent = useMutation(api.events.createEvent)
  const generateDescription = useAction(api.ai.generateDescription)

  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop' as any,
    maxParticipants: 50,
    isTeamEvent: false,
    teamSize: undefined as number | undefined,
    requirements: '',
  })

  const today = new Date().toISOString().split('T')[0]

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      setError('Enter a title first to generate a description.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const description = await generateDescription({ title: formData.title, category: formData.category })
      setFormData(prev => ({ ...prev, description }))
    } catch {
      setError('Failed to generate description. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const eventDate = new Date(formData.date)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    if (eventDate < todayDate) {
      setError('Event date cannot be in the past')
      setLoading(false)
      return
    }
    if (formData.isTeamEvent && (!formData.teamSize || formData.teamSize < 2)) {
      setError('Team events must have a team size of at least 2')
      setLoading(false)
      return
    }

    try {
      const eventId = await createEvent({
        ...formData,
        organizerId,
        isTeamEvent: formData.isTeamEvent,
        teamSize: formData.isTeamEvent ? formData.teamSize : undefined,
        requirements: formData.requirements || undefined,
      })
      onClose()
      navigate(`/event/${eventId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="font-display text-xl font-extrabold text-slate-900">Create New Event</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Error */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className={labelClass}>Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., AI Workshop 2026"
                  maxLength={60}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generating || !formData.title}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generating ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe your event..."
                />
              </div>

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Main Auditorium"
                />
              </div>

              {/* Category & Capacity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className={inputClass}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max Participants *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxParticipants}
                    onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Team Event Toggle */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTeamEvent}
                    onChange={e => setFormData({
                      ...formData,
                      isTeamEvent: e.target.checked,
                      teamSize: e.target.checked ? formData.teamSize : undefined,
                    })}
                    className="mt-0.5 w-5 h-5 accent-brand-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Team Event</span>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Enable if participants must register as teams
                    </p>
                  </div>
                </label>
              </div>

              {/* Team Size */}
              {formData.isTeamEvent && (
                <div>
                  <label className={labelClass}>Team Size *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={formData.teamSize || ''}
                    onChange={e => setFormData({ ...formData, teamSize: e.target.value ? parseInt(e.target.value) : undefined })}
                    className={inputClass}
                    placeholder="e.g., 4"
                  />
                  <p className="text-xs text-slate-400 mt-1">Members per team including the leader</p>
                </div>
              )}

              {/* Requirements */}
              <div>
                <label className={labelClass}>Requirements (Optional)</label>
                <textarea
                  value={formData.requirements}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Any prerequisites or requirements..."
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
