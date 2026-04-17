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
    if (!organizerId || !confirm('Delete this announcement?')) return
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 ${
        isImportant
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      {/* Delete Button */}
      {showDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-4 right-4 w-8 h-8 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          title="Delete announcement"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
        </button>
      )}

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isImportant ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {isImportant
            ? <AlertCircle className="w-5 h-5 text-red-600" />
            : <Megaphone className="w-5 h-5 text-amber-600" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-900">{announcement.title}</h3>
            {isImportant && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                IMPORTANT
              </span>
            )}
            {announcement.eventId && (
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Event-Specific
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-2">{announcement.message}</p>

          <p className="text-xs text-slate-400">
            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
