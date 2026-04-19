import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { MessageCircle, HelpCircle, Image, Plus, X, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import DiscussionThread from './DiscussionThread'
import PhotoGallery from './PhotoGallery'

interface Props {
  eventId: Id<"events">
}

type TabType = 'discussions' | 'questions' | 'photos'

// Per-tab accent config
const TAB_CONFIG = {
  discussions: {
    label: 'Discussions',
    icon: MessageCircle,
    active: 'bg-nb-purple text-white border-nb-purple shadow-[2px_2px_0_rgba(0,0,0,0.7)]',
    inactive: 'bg-white text-black/60 border-black/15 hover:border-black/30 hover:text-black',
    emptyIcon: 'bg-nb-purple/10 text-nb-purple',
    emptyTitle: 'No discussions yet',
    emptyDesc: '0 threads · Be the first to start a conversation',
    btnColor: 'bg-nb-purple text-white',
    createLabel: 'Start Thread',
  },
  questions: {
    label: 'Q&A',
    icon: HelpCircle,
    active: 'bg-nb-green text-black border-nb-green shadow-[2px_2px_0_rgba(0,0,0,0.7)]',
    inactive: 'bg-white text-black/60 border-black/15 hover:border-black/30 hover:text-black',
    emptyIcon: 'bg-nb-green/20 text-green-700',
    emptyTitle: 'No questions yet',
    emptyDesc: '0 questions · Ask the organizer anything',
    btnColor: 'bg-nb-green text-black',
    createLabel: 'Ask Question',
  },
  photos: {
    label: 'Photos',
    icon: Image,
    active: 'bg-cyan-500 text-white border-cyan-500 shadow-[2px_2px_0_rgba(0,0,0,0.7)]',
    inactive: 'bg-white text-black/60 border-black/15 hover:border-black/30 hover:text-black',
    emptyIcon: 'bg-cyan-100 text-cyan-700',
    emptyTitle: 'No photos yet',
    emptyDesc: '0 photos · Share moments from this event',
    btnColor: 'bg-cyan-500 text-white',
    createLabel: 'Upload Photo',
  },
}

export default function EventCommunity({ eventId }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('discussions')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const discussions = useQuery(
    api.discussions.getEventDiscussions,
    activeTab === 'discussions' && user?.userId
      ? { eventId, type: 'discussion', userId: user.userId }
      : 'skip'
  )

  const questions = useQuery(
    api.discussions.getEventDiscussions,
    activeTab === 'questions' && user?.userId
      ? { eventId, type: 'question', userId: user.userId }
      : 'skip'
  )

  const cfg = TAB_CONFIG[activeTab]

  const tabCounts: Partial<Record<TabType, number>> = {
    discussions: discussions?.length,
    questions: questions?.length,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-black/15 shadow-[4px_4px_0_rgba(0,0,0,0.75)] overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight text-black">Community</h2>
          <p className="text-xs text-black/40 font-medium mt-0.5">Open channel · All members</p>
        </div>

        {user && activeTab !== 'photos' && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold
                       bg-nb-green text-black border border-black/20
                       shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                       hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                       active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                       transition-all"
          >
            <Plus className="w-4 h-4" />
            {cfg.createLabel}
          </button>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 px-6 pt-4 pb-3 border-b border-black/8">
        {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => {
          const t = TAB_CONFIG[tab]
          const Icon = t.icon
          const isActive = activeTab === tab
          const count = tabCounts[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                          border transition-all duration-150
                          ${isActive ? t.active : t.inactive}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {count !== undefined && count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                  ${isActive ? 'bg-white/25' : 'bg-black/8'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'discussions' && (
            <motion.div key="discussions"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {discussions && discussions.length > 0
                ? discussions.map(d => <DiscussionThread key={d._id} discussion={d} />)
                : <EmptyState tab="discussions" onAction={user ? () => setShowCreateDialog(true) : undefined} />
              }
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div key="questions"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {questions && questions.length > 0
                ? questions.map(q => <DiscussionThread key={q._id} discussion={q} />)
                : <EmptyState tab="questions" onAction={user ? () => setShowCreateDialog(true) : undefined} />
              }
            </motion.div>
          )}

          {activeTab === 'photos' && (
            <motion.div key="photos"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            >
              <PhotoGallery eventId={eventId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && user && (
        <CreateDiscussionDialog
          eventId={eventId}
          type={activeTab === 'questions' ? 'question' : 'discussion'}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </motion.div>
  )
}

// ── Empty State ─────────────────────────────────────────────────
function EmptyState({ tab, onAction }: { tab: TabType; onAction?: () => void }) {
  const cfg = TAB_CONFIG[tab]
  const Icon = cfg.icon
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 max-w-sm mx-auto">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cfg.emptyIcon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-base text-black mb-1">{cfg.emptyTitle}</h3>
      <p className="text-sm text-black/40 font-medium mb-5">{cfg.emptyDesc}</p>
      {onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                      border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                      hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                      active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                      transition-all ${cfg.btnColor}`}
        >
          <Plus className="w-4 h-4" />
          {cfg.createLabel}
        </button>
      )}
    </div>
  )
}

// ── Create Dialog ───────────────────────────────────────────────
function CreateDiscussionDialog({ eventId, type, onClose }: {
  eventId: Id<"events">
  type: 'discussion' | 'question'
  onClose: () => void
}) {
  const { user } = useAuth()
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion]   = useState<string | null>(null)
  const [loadingAI, setLoadingAI]         = useState(false)
  const [showAIBox, setShowAIBox]         = useState(false)

  const createDiscussion = useMutation(api.discussions.createDiscussion)
  const generateAIAnswer = useAction(api.ai.generateQAAnswer)

  const isQuestion = type === 'question'
  const cfg = isQuestion ? TAB_CONFIG.questions : TAB_CONFIG.discussions

  const handleGetAISuggestion = async () => {
    if (!title.trim()) return
    setLoadingAI(true); setShowAIBox(true)
    try {
      const result = await generateAIAnswer({ eventId, userQuestion: title.trim() })
      setAiSuggestion(result.answer)
    } catch {
      setAiSuggestion("Couldn't generate a response. Please ask the organizer directly.")
    } finally { setLoadingAI(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return
    if (isQuestion && !title.trim()) return
    setLoading(true)
    try {
      await createDiscussion({
        eventId,
        userId: user.userId,
        userName: user.name || 'Anonymous',
        userRole: user.role,
        type,
        title: isQuestion ? title.trim() : undefined,
        message: message.trim(),
      })
      onClose()
    } catch { alert('Failed to post. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="bg-white rounded-2xl border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                   w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <h2 className="font-display text-lg font-black tracking-tight">
              {isQuestion ? 'Ask a Question' : 'Start a Discussion'}
            </h2>
            <p className="text-xs text-black/40 font-medium mt-0.5">
              {isQuestion ? 'Organizers will be notified' : 'Visible to all participants'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Question title */}
          {isQuestion && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
                Your Question
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What would you like to know?"
                  className="flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg
                             bg-white border-2 border-black/20
                             shadow-[2px_2px_0_rgba(0,0,0,0.15)]
                             focus:outline-none focus:border-nb-green
                             placeholder:text-black/25 transition-all"
                  maxLength={200}
                  required
                />
                <button
                  type="button"
                  onClick={handleGetAISuggestion}
                  disabled={!title.trim() || loadingAI}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                             bg-black text-nb-yellow border border-black/20
                             shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                             hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingAI ? '…' : 'AI'}
                </button>
              </div>
            </div>
          )}

          {/* AI suggestion box */}
          {isQuestion && showAIBox && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-nb-yellow/30 border border-nb-yellow p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nb-purple" />
                <span className="text-xs font-bold text-black/60 uppercase tracking-wider">AI Suggestion</span>
              </div>
              {loadingAI ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-nb-purple rounded-full animate-spin" />
                  <span className="text-xs text-black/50 font-medium">Generating…</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-black/70 font-medium leading-relaxed bg-white/60 rounded-lg p-3">
                    {aiSuggestion}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setMessage(aiSuggestion!); setShowAIBox(false) }}
                      className="px-3 py-1.5 rounded-md text-xs font-bold bg-nb-green text-black border border-black/20 hover:bg-nb-green/80 transition-colors">
                      Use this
                    </button>
                    <button type="button" onClick={() => { setMessage(aiSuggestion!); setShowAIBox(false) }}
                      className="px-3 py-1.5 rounded-md text-xs font-bold bg-white text-black border border-black/20 hover:bg-black/5 transition-colors">
                      Edit first
                    </button>
                    <button type="button" onClick={() => { setShowAIBox(false); setAiSuggestion(null) }}
                      className="px-3 py-1.5 rounded-md text-xs font-bold text-black/40 hover:text-black transition-colors">
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
              {isQuestion ? 'Additional Details' : 'Message'}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={isQuestion ? 'Add more context (optional)…' : "What's on your mind?"}
              rows={4}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-lg resize-none
                         bg-white/70 backdrop-blur-sm border-2 border-black/20
                         shadow-[2px_2px_0_rgba(0,0,0,0.15)]
                         focus:outline-none focus:border-nb-purple
                         placeholder:text-black/25 transition-all"
              maxLength={1000}
              required
            />
            <p className="text-[10px] text-black/30 text-right font-medium">{message.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-black/60
                         border border-black/15 bg-white hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim() || (isQuestion && !title.trim())}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold
                          border border-black/20
                          shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                          hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                          active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                          transition-all ${cfg.btnColor}`}
            >
              {loading ? 'Posting…' : isQuestion ? 'Post Question' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
