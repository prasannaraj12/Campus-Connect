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
      className={`bg-white rounded-xl border ${discussion.isPinned ? 'border-2 border-yellow-400 shadow-md' : 'border-gray-100 shadow-sm'} p-5 hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-gray-900 mb-2 leading-snug">
            {isQuestion && discussion.title ? discussion.title : discussion.message.split('\n')[0].substring(0, 100)}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{discussion.userName}</span>
            <span>•</span>
            <span>{getTimeAgo(discussion.createdAt)}</span>
            {commentCount > 0 && (
              <>
                <span>•</span>
                <span className="font-medium">{commentCount} {commentCount === 1 ? 'reply' : 'replies'}</span>
              </>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {discussion.userRole === 'organizer' && (
              <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 font-semibold rounded-lg">
                Organizer
              </span>
            )}
            {discussion.isPinned && (
              <span className="text-xs px-2.5 py-1 bg-yellow-100 text-yellow-700 font-semibold rounded-lg inline-flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {isQuestion && discussion.isAnswered && (
              <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 font-semibold rounded-lg inline-flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Answered
              </span>
            )}
            {isQuestion && !discussion.isAnswered && (
              <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 font-semibold rounded-lg">
                Awaiting Answer
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          {user && !isAuthor && !isOrganizer && (
            <button
              onClick={handleReport}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              title="Report"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={handleTogglePin}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${discussion.isPinned
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              title={discussion.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-4 h-4" />
            </button>
          )}
          {(isAuthor || isOrganizer) && (
            <button
              onClick={() => setConfirmDelete('discussion')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Content */}
      {isQuestion && discussion.title ? (
        <p className="text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
          {discussion.message}
        </p>
      ) : discussion.message.split('\n').length > 1 ? (
        <p className="text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
          {discussion.message.split('\n').slice(1).join('\n')}
        </p>
      ) : null}

      {/* View Replies Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {showComments ? 'Hide' : 'View'} {commentCount} {commentCount === 1 ? 'Reply' : 'Replies'}
        {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-l-4 ${comment.isAnswer
                        ? 'bg-green-50 border-green-500'
                        : comment.userRole === 'organizer'
                          ? 'bg-purple-50 border-purple-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
                        {comment.userRole === 'organizer' && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold rounded-md">
                            Organizer
                          </span>
                        )}
                        {comment.isAnswer && (
                          <span className="text-xs px-2 py-0.5 bg-green-500 text-white font-semibold rounded-md inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Answer
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{getTimeAgo(comment.createdAt)}</span>
                      </div>
                      {(user?.userId === comment.userId || isOrganizer) && (
                        <button
                          onClick={() => setConfirmDelete(comment._id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.message}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !commentText.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
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
