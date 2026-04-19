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
      className={`relative brutal-sm p-5 ${
        isImportant
          ? 'bg-nb-orange text-white'
          : 'bg-nb-yellow text-nb-black'
      } hover:scale-[1.01] transition-all mb-3`}
    >
      {/* Delete Button */}
      {showDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-3 right-3 brutal-sm bg-white text-nb-black p-1.5 hover:bg-nb-black hover:text-white transition-colors disabled:opacity-50"
          title="PURGE SIGNAL"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        <div className={`brutal-sm w-10 h-10 flex-shrink-0 flex items-center justify-center ${
          isImportant ? 'bg-nb-black text-nb-orange' : 'bg-nb-orange text-white'
        }`}>
          {isImportant
            ? <AlertCircle className="w-5 h-5" />
            : <Megaphone className="w-5 h-5" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-display text-base font-black uppercase tracking-tight leading-none">
              {announcement.title}
            </h3>
            {isImportant && (
              <span className="brutal-tag bg-nb-black text-white animate-pulse">
                CRITICAL
              </span>
            )}
            {announcement.eventId && (
              <span className={`brutal-tag ${
                isImportant ? 'bg-white text-nb-black' : 'bg-nb-black text-white'
              }`}>
                TARGETED
              </span>
            )}
          </div>

          <p className="text-sm font-semibold leading-relaxed mb-3 opacity-90">
            {announcement.message}
          </p>

          <p className="text-[10px] font-bold uppercase tracking-wide opacity-50">
            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
