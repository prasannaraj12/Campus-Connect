import { motion } from 'framer-motion'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Calendar, MapPin, Users, ChevronRight } from 'lucide-react'

interface RecommendedEventsProps {
    userId: Id<"users">
}

const categoryColors: Record<string, { bg: string, text: string }> = {
    Workshop: { bg: 'bg-nb-purple', text: 'text-white' },
    Seminar: { bg: 'bg-nb-green', text: 'text-black' },
    Sports: { bg: 'bg-nb-yellow', text: 'text-black' },
    Cultural: { bg: 'bg-nb-pink', text: 'text-white' },
    Technical: { bg: 'bg-nb-purple', text: 'text-white' },
    Social: { bg: 'bg-nb-yellow', text: 'text-black' },
    Hackathon: { bg: 'bg-black', text: 'text-white' },
}

export default function RecommendedEvents({ userId }: RecommendedEventsProps) {
    const navigate = useNavigate()
    const recommendedEvents = useQuery(api.recommendations.getRecommendedEvents, { userId })

    if (!recommendedEvents || recommendedEvents.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
        >
            {/* Section Header */}
            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-4 bg-black text-white px-6 py-2 nb-pill border-4 border-black shadow-[6px_6px_0_#FF2D92] rotate-[-2deg]">
                    <Sparkles className="w-6 h-6 text-nb-yellow fill-nb-yellow animate-pulse" />
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">RECOMMENDED EVENTS</h2>
                </div>
                <div className="h-2 flex-1 bg-black/10" />
                <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] italic hidden md:block">PERSONALIZED FOR YOU</span>
            </div>

            {/* Horizontal Scrollable Cards */}
            <div className="relative">
                <div className="flex gap-10 overflow-x-auto pb-10 custom-scrollbar scroll-smooth p-2">
                    {recommendedEvents.map((event: any) => (
                        <motion.div
                            key={event._id}
                            whileHover={{ y: -10, rotate: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/event/${event._id}`)}
                            className="flex-shrink-0 w-80 bg-white nb shadow-[12px_12px_0_#000000] border-4 border-black cursor-pointer group hover:shadow-[4px_4px_0_#000000] transition-all"
                        >
                            {/* Category Badge */}
                            <div className={`${categoryColors[event.category]?.bg || 'bg-black'} ${categoryColors[event.category]?.text || 'text-white'} px-6 py-4 border-b-4 border-black flex justify-between items-center group-hover:bg-nb-yellow group-hover:text-black transition-colors`}>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{event.category}</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Title */}
                                <h3 className="font-display text-2xl font-black text-black uppercase italic tracking-tighter leading-tight group-hover:underline underline-offset-8 decoration-nb-pink decoration-4">
                                    {event.title}
                                </h3>

                                {/* Meta Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-black/40 group-hover:text-black transition-colors">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">
                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-black/40 group-hover:text-black transition-colors">
                                        <MapPin className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic leading-none truncate">{event.location}</span>
                                    </div>
                                </div>

                                {/* Status Meter */}
                                <div className="pt-6 border-t-2 border-dashed border-black/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-nb-purple" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{event.maxParticipants} SPOTS</span>
                                    </div>
                                    <div className="bg-nb-green/20 text-nb-green px-3 py-1 border-2 border-nb-green text-[8px] font-black tracking-widest uppercase">AVAILABLE</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
