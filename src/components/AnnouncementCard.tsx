import { motion } from 'framer-motion'
import { Megaphone, AlertCircle, Trash2 } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'

interface Props {
  announcement: any
  showDelete?: boolean
  organizerId?: Id<'users'>
}

export default function AnnouncementCard({ announcement, showDelete = false, organizerId }: Props) {
  const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!organizerId || !confirm('Confirm deletion of this broadcast?')) return
    setDeleting(true)
    try {
      await deleteAnnouncement({ announcementId: announcement._id, organizerId })
    } catch {
      alert('Failed to delete announcement')
    } finally {
      setDeleting(false)
    }
  }

  const isImportant = announcement.priority === 'important'

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative nb-sm border-2 border-nb-black p-6 ${
        isImportant
          ? 'bg-nb-orange text-white'
          : 'bg-nb-yellow text-nb-black'
      } shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all mb-4`}
    >
      {/* Delete Button */}
      {showDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-4 right-4 nb-btn-sm bg-white text-nb-black p-2 border-2 border-nb-black hover:bg-nb-black hover:text-white transition-colors disabled:opacity-50"
          title="PURGE SIGNAL"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-5 pr-10">
        {/* Icon */}
        <div className={`nb-sm border-2 border-nb-black w-12 h-12 flex-shrink-0 flex items-center justify-center ${
          isImportant ? 'bg-nb-black text-nb-orange' : 'bg-nb-orange text-white'
        }`}>
          {isImportant
            ? <AlertCircle className="w-6 h-6 stroke-[3px]" />
            : <Megaphone className="w-6 h-6 stroke-[3px]" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h3 className="font-display text-lg font-black uppercase tracking-tight leading-none italic">
              {announcement.title}
            </h3>
            {isImportant && (
              <span className="nb-tag bg-nb-black text-white text-[9px] font-black uppercase px-2 py-0.5 animate-pulse">
                CRITICAL SIGNAL
              </span>
            )}
            {announcement.eventId && (
              <span className={`nb-tag text-[9px] font-black uppercase px-2 py-0.5 border border-nb-black ${
                isImportant ? 'bg-white text-nb-black' : 'bg-nb-black text-white'
              }`}>
                TARGETED RELAY
              </span>
            )}
          </div>

          <p className="text-[11px] font-black uppercase tracking-tighter leading-relaxed mb-4 opacity-80 italic">
            {announcement.message}
          </p>

          <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
            TRANSMITTED: {new Date(announcement.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
