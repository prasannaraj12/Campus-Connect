import { motion } from 'framer-motion'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, Calendar, MapPin, ArrowRight } from 'lucide-react'

interface SimilarEventsProps {
    eventId: Id<"events">
}

export default function SimilarEvents({ eventId }: SimilarEventsProps) {
    const navigate = useNavigate()
    const similarEvents = useQuery(api.recommendations.getSimilarEvents, { eventId })

    if (!similarEvents || similarEvents.length === 0) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
        >
            <div className="flex items-center justify-between mb-8 border-b-4 border-nb-black/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 nb-sm bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-nb-black animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-display text-4xl font-black uppercase tracking-tight text-nb-black">RECOMMENDED</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nb-black/30 leading-none">Intelligence Matching Signals</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarEvents.map((event: any, idx: number) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(`/event/${event._id}`)}
                        className="nb-sm bg-white border-2 border-nb-black p-6 cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="nb-tag bg-nb-orange text-white text-[8px] uppercase font-black px-2 py-1">
                                {event.category}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-nb-black animate-pulse" />
                        </div>

                        <h3 className="font-display text-lg font-black uppercase tracking-tight text-nb-black mb-4 group-hover:text-nb-orange transition-colors line-clamp-2 leading-[0.9]">
                            {event.title}
                        </h3>

                        <div className="space-y-2 text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-nb-orange" />
                                <span className="truncate">{event.location}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-nb-black/5 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:tracking-[0.4em] transition-all">VIEW SIGNAL</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
