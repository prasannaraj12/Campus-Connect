import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Camera, Heart, Trash2, X } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'

interface Props {
  eventId: Id<"events">
}

export default function PhotoGallery({ eventId }: Props) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photos = useQuery(api.photos.getEventPhotos, { eventId })
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const uploadPhoto = useMutation(api.photos.uploadPhoto)
  const toggleLike = useMutation(api.photos.toggleLike)
  const deletePhoto = useMutation(api.photos.deletePhoto)

  const isOrganizer = user?.role === 'organizer'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      const { storageId } = await result.json()

      // Save photo metadata
      await uploadPhoto({
        eventId,
        userId: user.userId,
        userName: user.name || 'Anonymous',
        storageId,
        caption: caption.trim() || undefined,
      })

      setCaption('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (photoId: Id<"photos">) => {
    if (!user) return
    try {
      await toggleLike({ photoId, userId: user.userId })
    } catch (err) {
      console.error('Failed to like photo:', err)
    }
  }

  const handleDelete = async (photoId: Id<"photos">) => {
    if (!user || !confirm('Delete this photo?')) return
    try {
      await deletePhoto({ photoId, userId: user.userId })
      if (selectedPhoto?._id === photoId) {
        setSelectedPhoto(null)
      }
    } catch (err) {
      console.error('Failed to delete photo:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {user && (
        <div className="neo-brutal bg-white p-4">
          <h3 className="font-black text-lg mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Photo
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="neo-brutal-sm w-full px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              maxLength={200}
            />
            <div className="flex gap-2">
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
                className="neo-brutal bg-blue-400 px-4 py-2 font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </button>
            </div>
            <p className="text-xs text-gray-500 font-semibold">
              Max size: 5MB • Formats: JPG, PNG, GIF, WebP
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
        <div className="neo-brutal bg-gray-50 p-12 text-center">
          <p className="font-bold text-gray-900 text-lg mb-2">No photos shared yet</p>
          <p className="text-gray-600 mb-4">
            Photos can be uploaded by organizers and participants after the event.
          </p>
          {user && (
            <p className="text-sm text-gray-500 flex flex-col items-center">
              <Camera className="w-12 h-12 text-gray-400 mb-2" />
              Upload photos to share memories and highlights from this event.
            </p>
          )}
        </div>
      )}

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onLike={handleLike}
            onDelete={handleDelete}
            isOrganizer={isOrganizer}
            currentUserId={user?.userId}
          />
        )}
      </AnimatePresence>
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
      className="neo-brutal bg-white overflow-hidden group cursor-pointer relative"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photo.caption || 'Event photo'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike(photo._id)
              }}
              className={`neo-brutal-sm p-2 ${hasLiked ? 'bg-red-400' : 'bg-white'}`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white text-white' : ''}`} />
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(photo._id)
                }}
                className="neo-brutal-sm bg-red-400 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600 truncate">
            {photo.uploadedByName}
          </span>
          <span className="text-xs font-bold text-red-500 flex items-center gap-1">
            <Heart className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <div>
            <p className="font-black">{photo.uploadedByName}</p>
            <p className="text-xs text-gray-500">
              {new Date(photo.uploadedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="neo-brutal-sm bg-red-400 p-2 hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={photo.caption || 'Event photo'}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-black">
          {photo.caption && (
            <p className="font-semibold mb-3">{photo.caption}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onLike(photo._id)}
              className={`neo-brutal ${hasLiked ? 'bg-red-400' : 'bg-gray-200'} px-4 py-2 font-bold flex items-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white text-white' : ''}`} />
              {photo.likes || 0} Likes
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  onDelete(photo._id)
                  onClose()
                }}
                className="neo-brutal bg-red-400 px-4 py-2 font-bold flex items-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
