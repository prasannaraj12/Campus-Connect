import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { MessageCircle, HelpCircle, Image, Plus, X, Sparkles, MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import DiscussionThread from './DiscussionThread'
import PhotoGallery from './PhotoGallery'

interface Props {
  eventId: Id<"events">
}

type TabType = 'discussions' | 'questions' | 'photos'

export default function EventCommunity({ eventId }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('discussions')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const discussions = useQuery(
    api.discussions.getEventDiscussions,
    activeTab === 'discussions' ? { eventId, type: 'discussion' } : 'skip'
  )

  const questions = useQuery(
    api.discussions.getEventDiscussions,
    activeTab === 'questions' ? { eventId, type: 'question' } : 'skip'
  )

  const tabs = [
    { id: 'discussions' as TabType, label: 'Discussions', icon: MessageCircle, count: discussions?.length, color: 'blue' },
    { id: 'questions' as TabType, label: 'Q&A', icon: HelpCircle, count: questions?.length, color: 'green' },
    { id: 'photos' as TabType, label: 'Photos', icon: Image, color: 'purple' },
  ]

  const colors: Record<string, { active: string, inactive: string }> = {
    discussions: { active: 'bg-nb-purple text-white border-black shadow-none translate-x-1 translate-y-1', inactive: 'bg-white text-black border-black/20 hover:bg-nb-yellow hover:border-black shadow-[6px_6px_0_#000000]' },
    questions: { active: 'bg-nb-green text-black border-black shadow-none translate-x-1 translate-y-1', inactive: 'bg-white text-black border-black/20 hover:bg-nb-yellow hover:border-black shadow-[6px_6px_0_#000000]' },
    photos: { active: 'bg-nb-pink text-white border-black shadow-none translate-x-1 translate-y-1', inactive: 'bg-white text-black border-black/20 hover:bg-nb-yellow hover:border-black shadow-[6px_6px_0_#000000]' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black p-10 shadow-[15px_15px_0_#000000]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-nb-yellow border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000000] rotate-3">
            <MessageSquare className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">COMMUNITY_RELAY</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">OPEN BROADCAST CHANNEL</p>
          </div>
        </div>

        {/* Create Button */}
        {user && activeTab !== 'photos' && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="nb bg-nb-green text-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] border-4 shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
            {activeTab === 'discussions' ? 'START_THREAD' : 'ASK_QUESTION'}
          </button>
        )}
      </div>

      {/* Tab Navigation - Pill Style */}
      <div className="flex flex-wrap gap-4 mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const currentColors = colors[tab.id]
          const style = isActive ? currentColors.active : currentColors.inactive
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nb border-4 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all italic flex items-center gap-3 ${style} ${isActive ? 'shadow-none translate-x-1 translate-y-1' : 'shadow-[6px_6px_0_#000000]'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 text-[10px] border-2 border-black inline-block ml-1 ${isActive ? 'bg-white text-black' : 'bg-nb-yellow text-black'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'discussions' && (
          <motion.div
            key="discussions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {discussions && discussions.length > 0 ? (
              discussions.map((discussion) => (
                <DiscussionThread
                  key={discussion._id}
                  discussion={discussion}
                />
              ))
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="No discussions yet"
                description="Be the first to start a conversation about schedules, rules, or logistics."
                buttonText="Start Discussion"
                buttonColor="blue"
                onAction={user ? () => setShowCreateDialog(true) : undefined}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {questions && questions.length > 0 ? (
              questions.map((question) => (
                <DiscussionThread
                  key={question._id}
                  discussion={question}
                />
              ))
            ) : (
              <EmptyState
                icon={HelpCircle}
                title="ZERO_QUESTIONS_DETECTED"
                description="HAVE_A_QUERY? ASK_THE_ORGANIZERS_DIRECTLY_HERE."
                buttonText="ASK_QUESTION"
                buttonColor="green"
                onAction={user ? () => setShowCreateDialog(true) : undefined}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PhotoGallery eventId={eventId} />
          </motion.div>
        )}
      </AnimatePresence>

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

// Empty State Component - Matches Dashboard Widget Style
function EmptyState({ icon: Icon, title, description, buttonText, buttonColor, onAction }: {
  icon: any
  title: string
  description: string
  buttonText: string
  buttonColor: 'blue' | 'green' | 'purple'
  onAction?: () => void
}) {
  const bgColors = {
    blue: 'bg-nb-purple text-white',
    green: 'bg-nb-green text-black',
    purple: 'bg-nb-pink text-white',
  }

  return (
    <div className="bg-nb-cream border-4 border-dashed border-black/20 p-20 text-center rotate-[-1deg]">
      <div className={`w-20 h-20 bg-nb-yellow border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0_#000000] rotate-3`}>
        <Icon className={`w-10 h-10 text-black stroke-[3px]`} />
      </div>
      <h3 className="font-display text-4xl font-black mb-4 uppercase italic tracking-tighter">{title}</h3>
      <p className="text-black/40 text-sm font-black uppercase tracking-[0.3em] mb-12 italic leading-tight max-w-md mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className={`nb ${bgColors[buttonColor]} px-12 py-5 text-sm font-black uppercase tracking-[0.4em] border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all italic`}
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}

// Create Discussion Dialog with AI-Powered Q&A - Modern Style
function CreateDiscussionDialog({ eventId, type, onClose }: any) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // AI Suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [showAIBox, setShowAIBox] = useState(false)

  const createDiscussion = useMutation(api.discussions.createDiscussion)
  const generateAIAnswer = useAction(api.ai.generateQAAnswer)

  const isQuestion = type === 'question'

  // Get AI Suggestion for the question
  const handleGetAISuggestion = async () => {
    if (!title.trim()) return

    setLoadingAI(true)
    setShowAIBox(true)
    try {
      const result = await generateAIAnswer({
        eventId,
        userQuestion: title.trim(),
      })
      setAiSuggestion(result.answer)
    } catch (err) {
      console.error('AI suggestion failed:', err)
      setAiSuggestion("I'm having trouble generating a response. Please ask the organizer directly.")
    } finally {
      setLoadingAI(false)
    }
  }

  // Use AI answer as the message
  const handleUseAnswer = () => {
    if (aiSuggestion) {
      setMessage(aiSuggestion)
      setShowAIBox(false)
      setAiSuggestion(null)
    }
  }

  // Edit - prefill message and let user modify
  const handleEditAnswer = () => {
    if (aiSuggestion) {
      setMessage(aiSuggestion)
      setShowAIBox(false)
    }
  }

  // Ignore AI suggestion
  const handleIgnore = () => {
    setShowAIBox(false)
    setAiSuggestion(null)
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
    } catch (err) {
      console.error('Failed to create:', err)
      alert('Failed to create. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
        className="bg-white border-8 border-black p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-[30px_30px_0_#7400E8]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 ${isQuestion ? 'bg-nb-green' : 'bg-nb-purple'} border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000000] rotate-3`}>
              {isQuestion ? (
                <HelpCircle className="w-8 h-8 text-black" />
              ) : (
                <MessageCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                {isQuestion ? 'ASK_A_QUERY' : 'NEW_BROADCAST'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">TRANSMITTING_TO_COMMUNITY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="nb bg-nb-pink text-white p-3 border-4 border-black hover:rotate-90 transition-transform shadow-[6px_6px_0_#000000]"
          >
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {isQuestion && (
            <div className="space-y-4">
              <label className="text-[12px] font-black uppercase tracking-[0.4em] text-black">QUESTION_TITLE</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="WHAT_IS_YOUR_QUERY?"
                  className="nb-input flex-1 px-6 py-4 text-sm font-black uppercase"
                  maxLength={200}
                  required
                />
                <button
                  type="button"
                  onClick={handleGetAISuggestion}
                  disabled={!title.trim() || loadingAI}
                  className="nb bg-black text-nb-yellow px-6 py-4 text-xs font-black uppercase tracking-[0.2em] border-4 shadow-[6px_6px_0_#00FF75] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-nb-pink animate-pulse" />
                  {loadingAI ? 'SYNCING...' : 'AI_HELP'}
                </button>
              </div>
            </div>
          )}

          {/* AI Suggestion Box */}
          {isQuestion && showAIBox && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-nb-yellow border-4 border-black p-6 shadow-[10px_10px_0_#000000] rotate-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-nb-pink" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black underline decoration-4 underline-offset-4 decoration-nb-pink">AI_INTEL_SUGGESTION</p>
              </div>

              {loadingAI ? (
                <div className="flex items-center gap-4 py-4">
                  <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest italic">SCANNING_DATA_LOGS...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-black italic uppercase tracking-tight text-black/80 leading-relaxed bg-white/50 p-4 border-2 border-black/10">{aiSuggestion}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleUseAnswer}
                      className="nb bg-nb-green text-black px-6 py-2 text-[10px] font-black uppercase border-3 border-black shadow-[4px_4px_0_#000000] transition-all"
                    >
                      USE_INTEL
                    </button>
                    <button
                      type="button"
                      onClick={handleEditAnswer}
                      className="nb bg-nb-purple text-white px-6 py-2 text-[10px] font-black uppercase border-3 border-black shadow-[4px_4px_0_#000000] transition-all"
                    >
                      MODIFY
                    </button>
                    <button
                      type="button"
                      onClick={handleIgnore}
                      className="nb bg-white text-black px-6 py-2 text-[10px] font-black uppercase border-3 border-black shadow-[4px_4px_0_#000000] transition-all"
                    >
                      DISCARD
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-[0.4em] text-black">
              {isQuestion ? 'DETAILED_RECORDS' : 'BROADCAST_MESSAGE'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isQuestion ? 'LOG_ADDITIONAL_DETAILS...' : 'WHAT_IS_ON_YOUR_MIND?'}
              className="nb-input w-full px-6 py-4 text-sm font-black uppercase resize-none min-h-[150px]"
              maxLength={1000}
              required
            />
            <p className="text-[10px] font-black text-black/30 text-right uppercase tracking-widest">
              {message.length}/1000_BYTES
            </p>
          </div>

          <div className="flex gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-white text-black border-4 border-black font-black uppercase tracking-[0.3em] shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all italic"
            >
              ABORT
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim() || (isQuestion && !title.trim())}
              className={`flex-1 py-5 ${isQuestion ? 'bg-nb-green text-black' : 'bg-nb-blue text-white'} border-4 border-black font-black uppercase tracking-[0.3em] shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all italic disabled:opacity-20`}
            >
              {loading ? 'TRANSMITTING...' : 'POST_LOG'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
