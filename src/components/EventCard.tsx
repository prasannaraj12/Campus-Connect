import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Trash2 } from 'lucide-react'
import { getDaysUntilEvent } from '../lib/utils'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

interface Event {
  _id: Id<'events'>
  _creationTime?: number
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  maxParticipants: number
  organizerId: Id<'users'>
}

interface Props {
  event: Event
  onDeleted?: (id: Id<'events'>) => void
}

// Category → flat color block
const CAT_BG: Record<string, string> = {
  Workshop:  'bg-nb-purple text-white',
  Seminar:   'bg-nb-blue text-white',
  Sports:    'bg-nb-green text-black',
  Cultural:  'bg-nb-pink text-white',
  Technical: 'bg-nb-orange text-white',
  Social:    'bg-nb-yellow text-black',
  Hackathon: 'bg-cyan-400 text-black',
}

export default function EventCard({ event, onDeleted }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const deleteEvent = useMutation(api.events.deleteEvent)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const toast = useToast()

  const registrationCount = useQuery(api.registrations.getRegistrationCount, { eventId: event._id })
  const registrations = useQuery(
    api.registrations.getEventRegistrations, 
    user?.role === 'organizer' && user.userId ? { eventId: event._id, userId: user.userId } : 'skip'
  )

  const daysUntil = getDaysUntilEvent(event.date)
  const participantCount = registrationCount || 0
  const capacityPct = Math.min((participantCount / event.maxParticipants) * 100, 100)
  const isNew = event._creationTime ? Math.floor((Date.now() - event._creationTime) / 86400000) <= 3 : false
  const isAlmostFull = capacityPct >= 80
  const isFull = capacityPct >= 100

  const catBg = CAT_BG[event.category] || 'bg-gray-300'

  const handleDelete = async () => {
    if (!user?.role || user.role !== 'organizer' || deleting) return
    setDeleting(true)
    try {
      await deleteEvent({ eventId: event._id, userId: user.userId })
      toast.success('Event deleted')
      onDeleted?.(event._id)
    } catch {
      toast.error('Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, rotate: 1 }}
      className="brutal-card-hover flex flex-col h-full group relative"
      onClick={() => navigate(`/event/${event._id}`)}
    >
      {/* ── Category header block ─────────────────────────────── */}
      <div className={`${catBg} border-b-2 border-black/20 px-4 py-3 flex items-center justify-between rounded-t-lg`}>
        <span className="font-black text-[11px] uppercase tracking-[0.2em] font-display">{event.category}</span>
        <div className="flex gap-2">
          {isNew && <span className="brutal-tag bg-white text-black">NEW</span>}
          {daysUntil === 0 && <span className="brutal-tag bg-nb-red text-white">TODAY</span>}
          {isAlmostFull && !isFull && <span className="brutal-tag bg-nb-orange text-white">HOT</span>}
          {isFull && <span className="brutal-tag bg-black text-white">FULL</span>}
        </div>
      </div>

      {/* ── Organizer hover actions ───────────────────────────── */}
      {user?.role === 'organizer' && (
        <div className="absolute top-14 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              import('../lib/utils').then(({ exportToCSV }) => {
                const data = registrations?.map(r => ({ ...r, eventName: event.title })) || []
                exportToCSV(data, `${event.title}_registrations`)
              })
            }}
            disabled={!registrations || registrations.length === 0}
            className="brutal-sm bg-nb-blue text-black p-2 disabled:opacity-40 hover:scale-110 transition-transform"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true) }}
            disabled={deleting}
            className="brutal-sm bg-nb-red text-white p-2 disabled:opacity-40 hover:scale-110 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-xl font-black mb-2 line-clamp-2 uppercase tracking-tight leading-tight">
          {event.title}
        </h3>
        <p className="text-black/60 text-sm mb-5 line-clamp-3 flex-1 font-semibold">
          {event.description}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 gap-2 mb-5">
          <div className="brutal-sm flex items-center gap-2 text-[10px] font-bold text-black bg-nb-cream/50 p-2 uppercase">
            <Calendar className="w-4 h-4 text-nb-purple" />
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="brutal-sm flex items-center gap-2 text-[10px] font-bold text-black bg-nb-cream/50 p-2 uppercase">
            <Clock className="w-4 h-4 text-nb-green" />
            {event.time}
          </div>
          <div className="brutal-sm flex items-center gap-2 text-[10px] font-bold text-black bg-nb-cream/50 p-2 uppercase">
            <MapPin className="w-4 h-4 text-nb-pink" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide mb-2">
            <span className="text-black/50">SQUAD: {participantCount} / {event.maxParticipants}</span>
            <span className={`px-2 py-0.5 rounded ${capacityPct >= 80 ? 'bg-nb-red text-white' : capacityPct >= 50 ? 'bg-nb-yellow text-black' : 'bg-nb-green text-black'}`}>
              {Math.round(capacityPct)}%
            </span>
          </div>
          <div className="h-3 bg-nb-cream border border-black/20 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPct}%` }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className={`h-full ${capacityPct >= 80 ? 'bg-nb-red' : capacityPct >= 50 ? 'bg-nb-yellow' : 'bg-nb-green'}`}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/event/${event._id}`) }}
          disabled={isFull}
          className={`brutal-btn w-full ${isFull ? 'bg-nb-paper text-black/30 cursor-not-allowed opacity-50' : 'bg-black text-white hover:bg-nb-purple'}`}
        >
          {isFull ? 'MISSION FULL' : 'LOCK IN NOW →'}
        </button>
      </div>

      {showConfirmDelete && (
        <ConfirmDialog
          title="Delete this event?"
          message="All registrations and attendance data will be lost. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => { setShowConfirmDelete(false); handleDelete() }}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </motion.div>
  )
}
