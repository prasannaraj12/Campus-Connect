import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ArrowLeft, Save, Trash2, AlertCircle, User, Mail, Phone, Building } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { PageLoader } from '../components/Skeleton'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!eventId || !user?.userId) return

        setLoading(true)
        setError('')

        try {
            await updateEvent({
                eventId: eventId as Id<"events">,
                userId: user.userId, // 🔒 SECURITY: Pass userId for ownership verification
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <PageLoader message="Loading event..." />
            </div>
        )
    }

    if (event === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
        <div className="min-h-screen bg-nb-cream pb-12 grid-bg">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-black text-white border-b-4 border-white/20 z-20">
                <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/event/${eventId}`)}
                        className="nb bg-white text-black p-2 border-2 border-black hover:rotate-6 transition-all shadow-[3px_3px_0_#7400E8]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-black uppercase italic tracking-tighter">Edit Event</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-3xl pt-10">
                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="nb bg-nb-pink text-white border-4 border-black p-5 mb-8 flex items-center gap-4 shadow-[6px_6px_0_#000000]"
                    >
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <p className="text-sm font-black uppercase italic tracking-widest">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="nb bg-white border-4 border-black p-8 shadow-[12px_12px_0_#000000]"
                    >
                        <h2 className="font-display text-2xl font-black text-black uppercase italic tracking-tighter mb-8 underline decoration-nb-purple decoration-4 underline-offset-8">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={60}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black"
                                    placeholder="e.g., Tech Symposium 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black resize-none"
                                    placeholder="What is this event about?"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Schedule */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="nb bg-white border-4 border-black p-8 shadow-[12px_12px_0_#00FF75]"
                    >
                        <h2 className="font-display text-2xl font-black text-black uppercase italic tracking-tighter mb-8 underline decoration-nb-green decoration-4 underline-offset-8">Schedule</h2>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Time *</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 3: Location & Capacity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="nb bg-white border-4 border-black p-8 shadow-[12px_12px_0_#7400E8]"
                    >
                        <h2 className="font-display text-2xl font-black text-black uppercase italic tracking-tighter mb-8 underline decoration-nb-purple decoration-4 underline-offset-8">Location & Capacity</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Venue / Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black"
                                    placeholder="e.g., Seminar Hall A, Block 3"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black uppercase"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Max Participants *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black"
                                    />
                                </div>
                            </div>

                            {/* Team Event Toggle */}
                            <div className="bg-nb-yellow/10 border-4 border-black p-6">
                                <label className="flex items-start gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isTeamEvent}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            isTeamEvent: e.target.checked,
                                            teamSize: e.target.checked ? formData.teamSize : undefined
                                        })}
                                        className="mt-1 w-6 h-6 accent-nb-purple"
                                    />
                                    <div>
                                        <span className="font-black text-black uppercase italic tracking-tighter">Team Event</span>
                                        <p className="text-[10px] font-black text-black/50 mt-1 uppercase">Enable if participants must register as a team</p>
                                    </div>
                                </label>
                            </div>

                            {formData.isTeamEvent && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Team Size *</label>
                                    <input
                                        type="number"
                                        required={formData.isTeamEvent}
                                        min="2"
                                        value={formData.teamSize || ''}
                                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black"
                                        placeholder="e.g., 4"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Section 4: Organizer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="nb bg-white border-4 border-black p-8 shadow-[12px_12px_0_#FF2D92]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-display text-2xl font-black text-black uppercase italic tracking-tighter underline decoration-nb-pink decoration-4 underline-offset-8">ORGANIZER INFO</h2>
                            <span className="text-[10px] font-black bg-black text-white px-3 py-1 uppercase tracking-widest italic">VISIBLE TO ALL</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Your Name</label>
                                    <input
                                        type="text"
                                        value={formData.organizerName}
                                        onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black"
                                        placeholder="e.g., Dr. Ramesh Kumar"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">YOUR ROLE</label>
                                    <input
                                        type="text"
                                        value={formData.organizerRole}
                                        onChange={(e) => setFormData({ ...formData, organizerRole: e.target.value })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black"
                                        placeholder="EVENT_COORD"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Email</label>
                                    <input
                                        type="email"
                                        value={formData.organizerEmail}
                                        onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all uppercase font-black"
                                        placeholder="contact@college.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.organizerPhone}
                                        onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                                        className="nb-input w-full px-5 py-4 border-4 border-black shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all font-black"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="nb bg-black border-4 border-black p-10 shadow-[20px_20px_0_#FFF500]"
                    >
                        <div className="flex flex-wrap gap-6">
                            <motion.button
                                whileHover={{ scale: 1.02, rotate: -1 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-nb-green text-black py-5 px-10 border-4 border-black font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 italic"
                            >
                                <Save className="w-6 h-6 stroke-[3px]" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="bg-white text-black py-5 px-10 border-4 border-black font-black uppercase tracking-[0.4em] hover:bg-nb-yellow transition-all italic"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-nb-pink text-white py-5 px-10 border-4 border-black font-black uppercase tracking-[0.4em] hover:shadow-[8px_8px_0_#000000] transition-all flex items-center gap-4 italic"
                            >
                                <Trash2 className="w-5 h-5 stroke-[3px]" />
                                Delete Event
                            </button>
                        </div>

                        {lastUpdated && (
                            <p className="text-[10px] font-black text-white/40 text-center mt-8 uppercase tracking-[0.5em] italic">
                                Created: {lastUpdated}
                            </p>
                        )}
                    </motion.div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        className="bg-white nb border-4 border-black p-12 max-w-md w-full shadow-[25px_25px_0_#000000]"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-nb-pink border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0_#000000]">
                                <Trash2 className="w-10 h-10 text-white stroke-[4px]" />
                            </div>
                            <h3 className="font-display text-4xl font-black text-black mb-4 uppercase italic tracking-tighter">DELETE THIS EVENT?</h3>
                            <p className="text-sm font-black text-black/60 mb-10 uppercase italic leading-tight">
                                THIS WILL PERMANENTLY DELETE <span className="text-nb-pink underline underline-offset-4 decoration-4">"{event.title}"</span> AND ALL REGISTRATIONS. <br/>THIS CANNOT BE UNDONE.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-white text-black py-5 border-4 border-black font-black uppercase tracking-[0.2em] hover:bg-nb-yellow transition-all italic"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-nb-pink text-white py-5 border-4 border-black font-black uppercase tracking-[0.2em] shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
                                >
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
