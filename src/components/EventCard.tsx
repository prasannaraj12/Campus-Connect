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
      className="nb bg-white flex flex-col h-full group relative border-4 shadow-[12px_12px_0_#000000] cursor-pointer"
      onClick={() => navigate(`/event/${event._id}`)}
    >
      {/* ── Category header block ─────────────────────────────── */}
      <div className={`${catBg} border-b-4 border-black px-5 py-4 flex items-center justify-between`}>
        <span className="font-black text-[12px] uppercase tracking-[0.3em] font-display italic">{event.category}</span>
        <div className="flex gap-2">
          {isNew && <span className="nb bg-white text-black border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">NEW</span>}
          {daysUntil === 0 && <span className="nb bg-nb-red text-white border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">TODAY</span>}
          {isAlmostFull && !isFull && <span className="nb bg-nb-orange text-white border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase italic">HOT</span>}
          {isFull && <span className="nb bg-black text-white border-2 border-white px-2 py-0.5 text-[8px] font-black uppercase">FULL</span>}
        </div>
      </div>

      {/* ── Organizer hover actions ───────────────────────────── */}
      {user?.role === 'organizer' && (
        <div className="absolute top-16 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              import('../lib/utils').then(({ exportToCSV }) => {
                const data = registrations?.map(r => ({ ...r, eventName: event.title })) || []
                exportToCSV(data, `${event.title}_registrations`)
              })
            }}
            disabled={!registrations || registrations.length === 0}
            className="nb bg-nb-blue text-black border-2 border-black p-2 shadow-[2px_2px_0_#000000] disabled:opacity-40"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true) }}
            disabled={deleting}
            className="nb bg-nb-red text-white border-2 border-black p-2 shadow-[2px_2px_0_#000000] disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-2xl font-black mb-3 line-clamp-2 uppercase italic tracking-tighter leading-none">
          {event.title}
        </h3>
        <p className="text-black/60 text-xs mb-6 line-clamp-3 flex-1 font-black uppercase tracking-tight italic">
          {event.description}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          <div className="flex items-center gap-3 text-[10px] font-black text-black bg-nb-cream p-2 border-2 border-black shadow-[4px_4px_0_#000000] uppercase italic">
            <Calendar className="w-4 h-4 text-nb-purple" />
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black text-black bg-nb-cream p-2 border-2 border-black shadow-[4px_4px_0_#000000] uppercase italic">
            <Clock className="w-4 h-4 text-nb-green" />
            {event.time}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black text-black bg-nb-cream p-2 border-2 border-black shadow-[4px_4px_0_#000000] uppercase italic">
            <MapPin className="w-4 h-4 text-nb-pink" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <span className="text-black/40">SQUAD: {participantCount} / {event.maxParticipants}</span>
            <span className={`px-1 ${capacityPct >= 80 ? 'bg-nb-red text-white' : capacityPct >= 50 ? 'bg-nb-yellow text-black' : 'bg-nb-green text-black'}`}>
              {Math.round(capacityPct)}%
            </span>
          </div>
          <div className="h-4 bg-nb-cream border-2 border-black overflow-hidden shadow-[2px_2px_0_#000000]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPct}%` }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className={`h-full border-r-2 border-black ${capacityPct >= 80 ? 'bg-nb-red' : capacityPct >= 50 ? 'bg-nb-yellow' : 'bg-nb-green'}`}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/event/${event._id}`) }}
          disabled={isFull}
          className={`nb w-full py-4 text-sm font-black uppercase tracking-[0.3em] italic border-4 shadow-[6px_6px_0_#000000] active:shadow-none translate-y-0 active:translate-y-1 transition-all ${isFull ? 'bg-nb-paper text-black/20 cursor-not-allowed shadow-none border-black/10' : 'bg-black text-white hover:bg-nb-purple'}`}
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
