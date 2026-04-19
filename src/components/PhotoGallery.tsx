import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Camera, Heart, Trash2, X, Upload, ImageIcon } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

interface Props {
  eventId: Id<"events">
}

export default function PhotoGallery({ eventId }: Props) {
  const { user } = useAuth()
  const [uploading, setUploading]         = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [caption, setCaption]             = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"photos"> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const photos            = useQuery(api.photos.getEventPhotos, { eventId })
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const uploadPhoto       = useMutation(api.photos.uploadPhoto)
  const toggleLike        = useMutation(api.photos.toggleLike)
  const deletePhoto       = useMutation(api.photos.deletePhoto)

  const isOrganizer = user?.role === 'organizer'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Image must be under 5MB'); return }

    setUploading(true); setUploadProgress(10)
    try {
      const uploadUrl = await generateUploadUrl()
      setUploadProgress(30)
      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
      setUploadProgress(70)
      const { storageId } = await result.json()
      await uploadPhoto({ eventId, userId: user.userId, userName: user.name || 'Anonymous', storageId, caption: caption.trim() || undefined })
      setUploadProgress(100)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Photo uploaded')
    } catch { toast.error('Failed to upload photo') }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleLike = async (photoId: Id<"photos">) => {
    if (!user) return
    try { await toggleLike({ photoId, userId: user.userId }) }
    catch { toast.error('Failed to update like') }
  }

  const handleDelete = async (photoId: Id<"photos">) => {
    if (!user) return
    try {
      await deletePhoto({ photoId, userId: user.userId })
      if (selectedPhoto?._id === photoId) setSelectedPhoto(null)
      toast.success('Photo deleted')
    } catch { toast.error('Failed to delete photo') }
  }

  return (
    <div className="space-y-5">

      {/* ── Upload Section ─────────────────────────────────── */}
      {user && (
        <div className="rounded-xl bg-nb-cream/60 border border-black/15 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-nb-pink" />
            <h3 className="text-sm font-bold text-black">Share a photo</h3>
          </div>

          {/* Caption input */}
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption (optional)…"
            className="w-full px-3 py-2.5 text-sm font-semibold rounded-lg
                       bg-white border border-black/20
                       shadow-[2px_2px_0_rgba(0,0,0,0.15)]
                       focus:outline-none focus:border-nb-purple
                       placeholder:text-black/30 transition-all"
            maxLength={200}
          />

          {/* Upload button */}
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold
                         bg-cyan-500 text-white border border-black/20
                         shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                         hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                         active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                         transition-all"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Choose file'}
            </button>
            <span className="text-xs text-black/35 font-medium">JPG, PNG, GIF, WEBP · max 5MB</span>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-nb-green rounded-full"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Photo Grid ─────────────────────────────────────── */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map(photo => (
            <PhotoCard
              key={photo._id}
              photo={photo}
              onLike={handleLike}
              onDelete={handleDelete}
              onClick={() => setSelectedPhoto(photo)}
              isOrganizer={isOrganizer}
              currentUserId={user?.userId}
            />
          ))}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────── */
        <div className="flex flex-col items-center text-center py-10 px-6 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-cyan-600" />
          </div>
          <h3 className="font-bold text-base text-black mb-1">No photos yet</h3>
          <p className="text-sm text-black/40 font-medium mb-5">
            0 photos · Be the first to share a moment
          </p>
          {user && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                         bg-cyan-500 text-white border border-black/20
                         shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                         hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                         transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload photo
            </button>
          )}
        </div>
      )}

      {/* ── Photo Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onLike={handleLike}
            onDelete={(id: Id<"photos">) => setConfirmDeleteId(id)}
            isOrganizer={isOrganizer}
            currentUserId={user?.userId}
          />
        )}
      </AnimatePresence>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete photo?"
          message="This photo will be permanently removed."
          confirmLabel="Delete"
          danger
          onConfirm={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}

// ── Photo Card ──────────────────────────────────────────────────
function PhotoCard({ photo, onLike, onDelete, onClick, isOrganizer, currentUserId }: any) {
  const photoUrl = useQuery(api.photos.getPhotoUrl, { storageId: photo.storageId })
  const hasLiked = useQuery(
    api.photos.hasLiked,
    currentUserId ? { photoId: photo._id, userId: currentUserId } : 'skip'
  )
  const canDelete = isOrganizer || currentUserId === photo.uploadedByUserId

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl border-2 border-black/80
                 shadow-[3px_3px_0_rgba(0,0,0,0.75)]
                 hover:shadow-[5px_5px_0_rgba(0,0,0,0.85)]
                 overflow-hidden cursor-pointer group transition-all"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-nb-cream relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photo.caption || 'Event photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black/20 border-t-nb-purple rounded-full animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all
                        flex items-center justify-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onLike(photo._id) }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border border-white/30
                        transition-colors ${hasLiked ? 'bg-nb-pink text-white' : 'bg-white/90 text-black'}`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
          </button>
          {canDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(photo._id) }}
              className="w-9 h-9 rounded-lg bg-white/90 text-red-500 flex items-center justify-center
                         border border-white/30 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-black/50 truncate">{photo.uploadedByName}</span>
        <span className="flex items-center gap-1 text-xs font-bold text-nb-pink shrink-0">
          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
          {photo.likes || 0}
        </span>
      </div>
    </motion.div>
  )
}

// ── Photo Modal ─────────────────────────────────────────────────
function PhotoModal({ photo, onClose, onLike, onDelete, isOrganizer, currentUserId }: any) {
  const photoUrl = useQuery(api.photos.getPhotoUrl, { storageId: photo.storageId })
  const hasLiked = useQuery(
    api.photos.hasLiked,
    currentUserId ? { photoId: photo._id, userId: currentUserId } : 'skip'
  )
  const canDelete = isOrganizer || currentUserId === photo.uploadedByUserId

  return (
    <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                   w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-nb-yellow/60">
          <div>
            <p className="font-bold text-sm text-black">{photo.uploadedByName}</p>
            <p className="text-xs text-black/40 font-medium mt-0.5">
              {new Date(photo.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/8 hover:bg-black/15 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-black/5 flex items-center justify-center p-6">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={photo.caption || 'Event photo'}
              className="max-w-full max-h-full object-contain rounded-lg
                         border-2 border-black/15 shadow-[3px_3px_0_rgba(0,0,0,0.6)]"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/10 space-y-3">
          {photo.caption && (
            <p className="text-sm font-semibold text-black/70 border-l-2 border-nb-purple pl-3">
              {photo.caption}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => onLike(photo._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                          border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.6)]
                          hover:shadow-[3px_3px_0_rgba(0,0,0,0.7)] hover:-translate-x-px hover:-translate-y-px
                          active:shadow-[1px_1px_0_rgba(0,0,0,0.5)] active:translate-x-px active:translate-y-px
                          transition-all ${hasLiked ? 'bg-nb-pink text-white' : 'bg-nb-cream text-black'}`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
              {photo.likes || 0} likes
            </button>
            {canDelete && (
              <button
                onClick={() => { onDelete(photo._id); onClose() }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                           bg-white text-red-500 border border-red-200
                           shadow-[2px_2px_0_rgba(239,68,68,0.4)]
                           hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
