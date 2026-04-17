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
  Workshop:  'bg-violet-400',
  Seminar:   'bg-blue-400',
  Sports:    'bg-green-400',
  Cultural:  'bg-pink-400',
  Technical: 'bg-orange-400',
  Social:    'bg-yellow-400',
  Hackathon: 'bg-cyan-400',
}

export default function EventCard({ event, onDeleted }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const deleteEvent = useMutation(api.events.deleteEvent)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const toast = useToast()

  const registrations = useQuery(api.registrations.getEventRegistrations, { eventId: event._id })

  const daysUntil = getDaysUntilEvent(event.date)
  const participantCount = registrations?.length || 0
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
      className="nb bg-white flex flex-col h-full group relative"
    >
      {/* ── Category header block ─────────────────────────────── */}
      <div className={`${catBg} border-b-3 border-black px-4 py-2.5 flex items-center justify-between`}>
        <span className="font-bold text-xs uppercase tracking-widest text-black">{event.category}</span>
        <div className="flex gap-1.5">
          {isNew && <span className="nb-tag bg-white text-black">New</span>}
          {daysUntil === 0 && <span className="nb-tag bg-nb-black text-white">Today</span>}
          {daysUntil === 1 && <span className="nb-tag bg-nb-orange text-white">Tomorrow</span>}
          {daysUntil > 1 && daysUntil <= 7 && <span className="nb-tag bg-nb-yellow text-black">{daysUntil}d</span>}
          {isAlmostFull && !isFull && <span className="nb-tag bg-nb-orange text-white">Hot</span>}
          {isFull && <span className="nb-tag bg-nb-black text-white">Full</span>}
        </div>
      </div>

      {/* ── Organizer hover actions ───────────────────────────── */}
      {user?.role === 'organizer' && (
        <div className="absolute top-10 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              import('../lib/utils').then(({ exportToCSV }) => {
                const data = registrations?.map(r => ({ ...r, eventName: event.title })) || []
                exportToCSV(data, `${event.title}_registrations`)
              })
            }}
            disabled={!registrations || registrations.length === 0}
            className="nb-sm bg-blue-400 text-black px-2 py-1 text-[10px] font-bold inline-flex items-center gap-1 disabled:opacity-40"
          >
            <Users className="w-3 h-3" /> CSV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true) }}
            disabled={deleting}
            className="nb-sm bg-red-400 text-black px-2 py-1 text-[10px] font-bold inline-flex items-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display text-base font-bold mb-1.5 line-clamp-2 leading-snug">
          {event.title}
        </h3>
        <p className="text-black/50 text-xs mb-4 line-clamp-2 flex-1 leading-relaxed">
          {event.description}
        </p>

        {/* Meta */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-black/70">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            <Clock className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
            {event.time}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-black/70">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide mb-1">
            <span className="text-black/50">{participantCount}/{event.maxParticipants} seats</span>
            <span className={capacityPct >= 80 ? 'text-red-600' : capacityPct >= 50 ? 'text-orange-500' : 'text-green-600'}>
              {Math.round(capacityPct)}%
            </span>
          </div>
          <div className="h-2 bg-nb-paper border border-black overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full ${capacityPct >= 80 ? 'bg-red-500' : capacityPct >= 50 ? 'bg-nb-orange' : 'bg-green-500'}`}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/event/${event._id}`) }}
          disabled={isFull}
          className={`nb-btn w-full py-2.5 text-sm ${isFull ? 'bg-nb-paper text-black/40 cursor-not-allowed' : 'bg-nb-yellow text-black'}`}
        >
          {isFull ? 'Event Full' : 'View & Register →'}
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
