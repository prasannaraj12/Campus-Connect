import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ArrowLeft, Save, Trash2, AlertCircle, User, Mail, Phone, Building } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'

const categories = ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social', 'Hackathon']

export default function EditEvent() {
    const { eventId } = useParams<{ eventId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const event = useQuery(api.events.getEventById, eventId ? { eventId: eventId as Id<"events"> } : 'skip')
    const updateEvent = useMutation(api.events.updateEvent)
    const deleteEvent = useMutation(api.events.deleteEvent)

    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
        // Organizer contact info
        organizerName: '',
        organizerEmail: '',
        organizerPhone: '',
        organizerRole: '',
        showContactInfo: true,
    })

    // Load event data into form when event is fetched
    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                category: event.category,
                maxParticipants: event.maxParticipants,
                isTeamEvent: event.isTeamEvent,
                teamSize: event.teamSize,
                requirements: event.requirements || '',
                organizerName: event.organizerName || '',
                organizerEmail: event.organizerEmail || '',
                organizerPhone: event.organizerPhone || '',
                organizerRole: event.organizerRole || '',
                showContactInfo: event.showContactInfo ?? true,
            })
        }
    }, [event])

    // Redirect if not organizer
    useEffect(() => {
        if (user && user.role !== 'organizer') {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!eventId) return

        setLoading(true)
        setError('')

        try {
            await updateEvent({
                eventId: eventId as Id<"events">,
                ...formData,
                teamSize: formData.isTeamEvent ? formData.teamSize : undefined,
                requirements: formData.requirements || undefined,
                organizerName: formData.organizerName || undefined,
                organizerEmail: formData.organizerEmail || undefined,
                organizerPhone: formData.organizerPhone || undefined,
                organizerRole: formData.organizerRole || undefined,
            })

            navigate(`/event/${eventId}`)
        } catch (err: any) {
            setError(err.message || 'Failed to update event')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!eventId || !user?.userId) return

        setDeleting(true)
        try {
            await deleteEvent({
                eventId: eventId as Id<"events">,
                userId: user.userId
            })
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Failed to delete event')
            setShowDeleteConfirm(false)
        } finally {
            setDeleting(false)
        }
    }

    if (event === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-12">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading event...</p>
                </div>
            </div>
        )
    }

    if (event === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-gray-500 mb-6">
                        The event you're looking for doesn't exist or has been deleted.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    const lastUpdated = event._creationTime ? new Date(event._creationTime).toLocaleString() : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-8">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
                <div className="container mx-auto px-4 py-3 max-w-3xl flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/event/${eventId}`)}
                        className="text-gray-600 hover:text-gray-900 font-semibold inline-flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Event
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Edit Event</h1>
                    <div className="w-24"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-3xl pt-6">
                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
                    >
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md p-6"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={60}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                    placeholder="e.g., AI Workshop 2026"
                                />
                                <p className="text-xs text-gray-400 mt-1">Keep it short and clear (max 60 characters)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium resize-none transition-colors"
                                    placeholder="Describe what the event is about..."
                                />
                                <p className="text-xs text-gray-400 mt-1">This will be shown to participants</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Schedule */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-md p-6"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule</h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 3: Location & Capacity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-md p-6"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Location & Capacity</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                    placeholder="e.g., Seminar Hall 1, Block A"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Participants *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Maximum registrations allowed</p>
                                </div>
                            </div>

                            {/* Team Event Toggle */}
                            <div className="bg-blue-50 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isTeamEvent}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            isTeamEvent: e.target.checked,
                                            teamSize: e.target.checked ? formData.teamSize : undefined
                                        })}
                                        className="mt-1 w-5 h-5 accent-indigo-500 rounded"
                                    />
                                    <div>
                                        <span className="font-bold text-gray-900">This is a Team Event</span>
                                        <p className="text-sm text-gray-600 mt-1">Enable if participants must register as teams</p>
                                    </div>
                                </label>
                            </div>

                            {formData.isTeamEvent && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Team Size *</label>
                                    <input
                                        type="number"
                                        required={formData.isTeamEvent}
                                        min="2"
                                        value={formData.teamSize || ''}
                                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                        placeholder="e.g., 4"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Requirements (Optional)</label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium resize-none transition-colors"
                                    placeholder="Any prerequisites or requirements..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 4: Organizer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-md p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Organizer Details</h2>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Visible to participants</span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Organizer Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.organizerName}
                                        onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                        placeholder="e.g., Tech Club – AIML Dept"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <Building className="w-4 h-4 inline mr-1" />
                                        Role / Club (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.organizerRole}
                                        onChange={(e) => setFormData({ ...formData, organizerRole: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                        placeholder="e.g., Event Coordinator"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.organizerEmail}
                                        onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                        placeholder="techclub@college.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Contact Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.organizerPhone}
                                        onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                        placeholder="+91 9XXXXXXXXX"
                                    />
                                </div>
                            </div>

                            {/* Show contact toggle */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showContactInfo}
                                        onChange={(e) => setFormData({ ...formData, showContactInfo: e.target.checked })}
                                        className="w-5 h-5 accent-indigo-500 rounded"
                                    />
                                    <span className="font-semibold text-gray-700">Show organizer contact to participants</span>
                                </label>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-md p-6"
                    >
                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-bold inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-50 text-red-600 py-3 px-6 rounded-xl font-semibold hover:bg-red-100 transition-colors inline-flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>

                        {lastUpdated && (
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Created: {lastUpdated}
                            </p>
                        )}
                    </motion.div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event?</h3>
                            <p className="text-gray-600 mb-6">
                                This will permanently delete "<strong>{event.title}</strong>" and all registrations. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Event'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
