import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { MessageCircle, Pin, Trash2, CheckCircle, Send, Flag, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

interface Props {
  discussion: any
  onDeleted?: () => void
}

export default function DiscussionThread({ discussion, onDeleted }: Props) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<null | 'discussion' | Id<"comments">>(null)
  const toast = useToast()

  const comments = useQuery(
    api.discussions.getDiscussionComments,
    showComments ? { discussionId: discussion._id } : 'skip'
  )

  const addComment = useMutation(api.discussions.addComment)
  const deleteDiscussion = useMutation(api.discussions.deleteDiscussion)
  const deleteComment = useMutation(api.discussions.deleteComment)
  const togglePin = useMutation(api.discussions.togglePin)
  const reportContent = useMutation(api.discussions.reportContent)

  const isOrganizer = user?.role === 'organizer'
  const isAuthor = user?.userId === discussion.userId
  const isQuestion = discussion.type === 'question'
  const commentCount = comments?.length || 0

  // Format time ago
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    setLoading(true)
    try {
      await addComment({
        discussionId: discussion._id,
        userId: user.userId,
        userName: user.name || 'Anonymous',
        userRole: user.role,
        message: commentText.trim(),
        isAnswer: isQuestion && isOrganizer,
      })
      setCommentText('')
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    try {
      await deleteDiscussion({ discussionId: discussion._id, userId: user.userId })
      toast.success('Discussion deleted')
      onDeleted?.()
    } catch (err) {
      toast.error('Failed to delete discussion')
    }
  }

  const handleTogglePin = async () => {
    if (!user) return
    try {
      const result = await togglePin({ discussionId: discussion._id, userId: user.userId })
      toast.success(result.isPinned ? 'Discussion pinned' : 'Discussion unpinned')
    } catch (err) {
      toast.error('Failed to update pin')
    }
  }

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!user) return
    try {
      await deleteComment({ commentId, userId: user.userId })
      toast.success('Comment deleted')
    } catch (err) {
      toast.error('Failed to delete comment')
    }
  }

  const handleReport = async () => {
    if (!user) return
    const reason = window.prompt('Describe why you are reporting this content:')
    if (!reason?.trim()) return
    try {
      await reportContent({
        userId: user.userId,
        userName: user.name || 'Anonymous',
        contentType: 'discussion',
        contentId: discussion._id,
        reason: reason.trim(),
      })
      toast.success('Report submitted. Organizers will review it.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border-[6px] border-black p-10 shadow-[20px_20px_0_#000000] transition-all my-8 relative overflow-hidden ${discussion.isPinned ? 'ring-8 ring-nb-yellow/20' : ''}`}
    >
      {/* Pinned Diagonal Ribbon */}
      {discussion.isPinned && (
        <div className="absolute top-0 right-0 bg-nb-yellow text-black px-12 py-2 border-b-4 border-l-4 border-black font-black uppercase text-[10px] tracking-widest italic translate-x-[30%] translate-y-[30%] rotate-45 z-10">
          PINNED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Metadata Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-4 py-2 border-4 border-black font-black uppercase text-[10px] italic tracking-widest ${discussion.userRole === 'organizer' ? 'bg-nb-purple text-white shadow-[4px_4px_0_#000000]' : 'bg-nb-cream text-black'}`}>
              AGENT_{discussion.userName.replace(/\s+/g, '_').toUpperCase()}
            </div>
            <div className="h-1 flex-1 bg-black/10" />
            <span className="text-[10px] font-black uppercase opacity-30 italic tracking-widest">{getTimeAgo(discussion.createdAt)}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-3xl font-black uppercase italic tracking-tighter text-black mb-6 leading-[0.9] group">
            {isQuestion && discussion.title ? (
              <span className="underline decoration-[6px] decoration-nb-pink underline-offset-8 decoration-skip-ink-none">{discussion.title}</span>
            ) : (
              <span className="underline decoration-[6px] decoration-nb-purple underline-offset-8 decoration-skip-ink-none">{discussion.message.split('\n')[0].substring(0, 100)}</span>
            )}
          </h3>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            {isQuestion && discussion.isAnswered && (
              <div className="bg-nb-green text-black border-4 border-black px-4 py-2 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 shadow-[4px_4px_0_#000000]">
                <CheckCircle className="w-4 h-4 stroke-[3px]" />
                SECTOR_RESOLVED
              </div>
            )}
            {isQuestion && !discussion.isAnswered && (
              <div className="bg-nb-pink text-white border-4 border-black px-4 py-2 text-[10px] font-black uppercase tracking-widest italic shadow-[4px_4px_0_#000000]">
                AWAITING_SIGINT
              </div>
            )}
          </div>
        </div>

        {/* Actions Console */}
        <div className="flex flex-col gap-3">
          {(isAuthor || isOrganizer) && (
            <button
              onClick={() => setConfirmDelete('discussion')}
              className="w-14 h-14 flex items-center justify-center border-4 border-black bg-white text-nb-pink shadow-[6px_6px_0_#000000] hover:bg-nb-pink hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              title="PURGE_RECORD"
            >
              <Trash2 className="w-6 h-6 stroke-[3px]" />
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={handleTogglePin}
              className={`w-14 h-14 flex items-center justify-center border-4 border-black transition-all shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${discussion.isPinned
                  ? 'bg-nb-yellow text-black'
                  : 'bg-white text-black/20 hover:text-black'
                }`}
              title={discussion.isPinned ? 'RELEASE_PIN' : 'SECURE_PIN'}
            >
              <Pin className="w-6 h-6 stroke-[3px]" />
            </button>
          )}
        </div>
      </div>

      {/* Message Content Body */}
      <div className="mt-10 bg-nb-cream/30 border-l-8 border-black p-8 relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MessageCircle className="w-20 h-20 text-black rotate-12" />
        </div>
        {isQuestion && discussion.title ? (
          <p className="text-lg font-black italic uppercase tracking-tight leading-[1.3] text-black/80 whitespace-pre-wrap">
            {discussion.message}
          </p>
        ) : discussion.message.split('\n').length > 1 ? (
          <p className="text-lg font-black italic uppercase tracking-tight leading-[1.3] text-black/80 whitespace-pre-wrap">
            {discussion.message.split('\n').slice(1).join('\n')}
          </p>
        ) : (
           <p className="text-lg font-black italic uppercase tracking-tight leading-[1.3] text-black/80 whitespace-pre-wrap">
            {discussion.message}
          </p>
        )}
      </div>

      {/* Footer Console */}
      <div className="mt-10 pt-10 border-t-4 border-dashed border-black/10 flex items-center justify-between">
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-4 px-8 py-4 border-4 border-black text-xs font-black uppercase tracking-[0.3em] italic transition-all shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${showComments ? 'bg-black text-white' : 'bg-nb-yellow text-black'}`}
        >
          <MessageSquare className="w-5 h-5" />
          {showComments ? 'CLOSE_COMMS_LOG' : 'ACCESS_COMMS_LOG'} ({commentCount})
        </button>

        <div className="hidden sm:flex items-center gap-6">
             <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center shadow-[2px_2px_0_#000000] rotate-[5deg]">
                         <span className="text-[10px] font-black italic">#{i}</span>
                     </div>
                 ))}
             </div>
             <div className="h-10 w-[2px] bg-black/10" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 italic">DISCUSSION ACTIVE</span>
        </div>
      </div>

      {/* Comments Section Console */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-10 p-10 bg-black/5 border-4 border-black border-dashed space-y-6"
          >
            {/* Existing Comments Log */}
            {comments && comments.length > 0 && (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-8 border-4 shadow-[8px_8px_0_#000000] transition-all relative ${comment.isAnswer
                        ? 'bg-nb-green border-black rotate-[0.5deg]'
                        : comment.userRole === 'organizer'
                          ? 'bg-nb-purple text-white border-black rotate-[-0.5deg]'
                          : 'bg-white border-black text-black'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-1 border-2 border-black text-[9px] font-black uppercase italic tracking-widest ${comment.userRole === 'organizer' ? 'bg-white text-black' : 'bg-nb-yellow text-black'}`}>
                          {comment.userName.toUpperCase()}
                        </div>
                        {comment.isAnswer && (
                          <div className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest italic flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-nb-green" />
                            ANSWERED
                          </div>
                        )}
                        <span className="text-[8px] font-black uppercase opacity-50 italic tracking-widest">{getTimeAgo(comment.createdAt)}</span>
                      </div>
                      {(user?.userId === comment.userId || isOrganizer) && (
                        <button
                          onClick={() => setConfirmDelete(comment._id)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white text-nb-pink hover:bg-nb-pink hover:text-white shadow-[3px_3px_0_#000000] transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-black italic uppercase tracking-tight leading-relaxed whitespace-pre-wrap">{comment.message}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleAddComment} className="flex gap-4 mt-8">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="TRANSMIT_REPLY..."
                  className="nb-input flex-1 px-6 py-4 text-xs font-black uppercase transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !commentText.trim()}
                  className="nb bg-nb-green text-black px-10 py-4 text-xs font-black uppercase tracking-[0.2em] border-4 shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic disabled:opacity-20"
                >
                  <Send className="w-5 h-5 stroke-[3px]" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete === 'discussion' ? 'Delete discussion?' : 'Delete comment?'}
          message="This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            if (confirmDelete === 'discussion') handleDelete()
            else handleDeleteComment(confirmDelete as Id<"comments">)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </motion.div>
  )
}
