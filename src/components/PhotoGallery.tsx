import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Camera, Heart, Trash2, X, Upload } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

interface Props {
  eventId: Id<"events">
}

export default function PhotoGallery({ eventId }: Props) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [caption, setCaption] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"photos"> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const photos = useQuery(api.photos.getEventPhotos, { eventId })
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const uploadPhoto = useMutation(api.photos.uploadPhoto)
  const toggleLike = useMutation(api.photos.toggleLike)
  const deletePhoto = useMutation(api.photos.deletePhoto)

  const isOrganizer = user?.role === 'organizer'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setUploadProgress(10)
    try {
      const uploadUrl = await generateUploadUrl()
      setUploadProgress(30)

      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      setUploadProgress(70)

      const { storageId } = await result.json()

      await uploadPhoto({
        eventId,
        userId: user.userId,
        userName: user.name || 'Anonymous',
        storageId,
        caption: caption.trim() || undefined,
      })
      setUploadProgress(100)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Photo uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleLike = async (photoId: Id<"photos">) => {
    if (!user) return
    try {
      await toggleLike({ photoId, userId: user.userId })
    } catch (err) {
      toast.error('Failed to update like')
    }
  }

  const handleDelete = async (photoId: Id<"photos">) => {
    if (!user) return
    try {
      await deletePhoto({ photoId, userId: user.userId })
      if (selectedPhoto?._id === photoId) setSelectedPhoto(null)
      toast.success('Photo deleted')
    } catch (err) {
      toast.error('Failed to delete photo')
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      {user && (
        <div className="bg-nb-cream border-4 border-black p-8 shadow-[10px_10px_0_#000000] rotate-[0.5deg]">
          <h3 className="font-black text-2xl mb-6 flex items-center gap-4 uppercase italic tracking-tighter">
            <Camera className="w-8 h-8 text-nb-pink" />
            UPLOAD_MEMORY
          </h3>
          <div className="space-y-6">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="ADD_CAPTION_LOG..."
              className="nb-input w-full px-6 py-4 font-black uppercase text-sm"
              maxLength={200}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="nb bg-nb-blue text-white px-10 py-5 font-black uppercase tracking-[0.4em] border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all inline-flex items-center justify-center gap-3 italic disabled:opacity-20"
              >
                <Upload className="w-6 h-6 stroke-[3px]" />
                {uploading ? 'UPLOADING...' : 'CHOOSE_FILE'}
              </button>
            </div>
            {/* Upload Progress Bar */}
            {uploading && (
              <div className="h-4 bg-black/10 border-2 border-black overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-nb-green"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-black mix-blend-difference">{uploadProgress}%</span>
              </div>
            )}
            <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.4em] italic leading-tight">
              MAX_SIZE: 5MB • FORMATS: [JPG, PNG, GIF, WEBP]
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
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
        <div className="bg-nb-cream border-4 border-dashed border-black/20 p-20 text-center rotate-[-1deg]">
          <div className="w-20 h-20 bg-nb-yellow border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0_#000000] rotate-3">
            <Camera className="w-10 h-10 text-black stroke-[3px]" />
          </div>
          <h3 className="font-display text-4xl font-black mb-4 uppercase italic tracking-tighter">ZERO_PHOTOS_LOGGED</h3>
          <p className="text-black/40 text-sm font-black uppercase tracking-[0.3em] mb-12 italic leading-tight max-w-md mx-auto">
            THE GALLERY IS EMPTY. BE THE FIRST TO CAPTURE THE MOMENT.
          </p>
        </div>
      )}

      {/* Photo Modal */}
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

      {/* Confirm Delete */}
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

// Photo Card Component
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white border-4 border-black shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer relative rotate-[1deg]"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-nb-cream relative overflow-hidden border-b-4 border-black">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photo.caption || 'Event photo'}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike(photo._id)
              }}
              className={`nb border-4 border-black p-3 shadow-[4px_4px_0_#000000] ${hasLiked ? 'bg-nb-pink text-white' : 'bg-white text-black'}`}
            >
              <Heart className={`w-6 h-6 ${hasLiked ? 'fill-white' : ''}`} />
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(photo._id)
                }}
                className="nb bg-white text-nb-pink border-4 border-black p-3 shadow-[4px_4px_0_#000000]"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-black/50 truncate">
            {photo.uploadedByName}
          </span>
          <span className="text-xs font-black text-nb-pink flex items-center gap-2">
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''} stroke-[3px]`} />
            {photo.likes || 0}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Photo Modal Component
function PhotoModal({ photo, onClose, onLike, onDelete, isOrganizer, currentUserId }: any) {
  const photoUrl = useQuery(api.photos.getPhotoUrl, { storageId: photo.storageId })
  const hasLiked = useQuery(
    api.photos.hasLiked,
    currentUserId ? { photoId: photo._id, userId: currentUserId } : 'skip'
  )

  const canDelete = isOrganizer || currentUserId === photo.uploadedByUserId

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
        className="bg-white border-8 border-black max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[40px_40px_0_#000000]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-8 border-black bg-nb-yellow">
          <div>
            <p className="font-black text-2xl uppercase italic tracking-tighter">{photo.uploadedByName}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">
              LOGGED_AT: {new Date(photo.uploadedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="nb bg-nb-pink text-white p-4 border-4 border-black hover:rotate-90 transition-transform shadow-[6px_6px_0_#000000]"
          >
            <X className="w-8 h-8 stroke-[4px]" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-nb-cream flex items-center justify-center p-8 relative">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={photo.caption || 'Event photo'}
              className="max-w-full max-h-full object-contain border-8 border-black shadow-[20px_20px_0_#000000]"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t-8 border-black bg-white">
          {photo.caption && (
            <p className="font-black text-xl uppercase italic tracking-tight mb-8 border-l-8 border-nb-purple pl-6 py-2 bg-nb-purple/5">{photo.caption}</p>
          )}
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => onLike(photo._id)}
              className={`nb border-4 border-black px-10 py-5 font-black uppercase tracking-[0.4em] italic shadow-[10px_10px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all flex items-center gap-4 ${hasLiked ? 'bg-nb-pink text-white border-black' : 'bg-nb-cream text-black'}`}
            >
              <Heart className={`w-8 h-8 ${hasLiked ? 'fill-white' : ''} stroke-[3px]`} />
              {photo.likes || 0}_LIKES
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  onDelete(photo._id)
                  onClose()
                }}
                className="nb bg-white text-nb-pink px-10 py-5 font-black uppercase tracking-[0.4em] italic border-4 border-black shadow-[10px_10px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all flex items-center gap-4"
              >
                <Trash2 className="w-8 h-8 stroke-[3px]" />
                PURGE_PHOTO
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
