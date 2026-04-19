import { motion } from 'framer-motion'

interface AttendanceData {
    eventId: string
    title: string
    registrations: number
    attendance: number
    rate: number
    date: string
}

interface AttendanceBarChartProps {
    data: AttendanceData[]
}

export default function AttendanceBarChart({ data }: AttendanceBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-sm font-black text-nb-black mb-4 uppercase tracking-[0.2em]">Attendance by Event</h3>
                <div className="flex-1 nb-sm bg-nb-paper flex items-center justify-center text-nb-black/20 text-[10px] font-black uppercase">
                    No session data
                </div>
            </div>
        )
    }

    const displayData = data.slice(0, 6)

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-nb-black uppercase tracking-[0.2em]">ATTENDANCE METRICS</h3>
                    <p className="text-[10px] font-bold text-nb-black/40 uppercase tracking-widest mt-1 italic">RECENT PERFORMANCE</p>
                </div>
            </div>

            <div className="space-y-6">
                {displayData.map((event, index) => (
                    <motion.div
                        key={event.eventId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-nb-black uppercase truncate max-w-[200px]">
                                {event.title}
                            </span>
                            <span className="text-[10px] font-bold text-nb-black/50">
                                {event.attendance}/{event.registrations} — <span className="text-nb-black font-black">{event.rate}%</span>
                            </span>
                        </div>
                        <div className="h-4 bg-nb-paper border-2 border-nb-black overflow-hidden nb-sm">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${event.rate}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                className={`h-full border-r-2 border-nb-black ${
                                    event.rate >= 80 ? 'bg-nb-yellow' : event.rate >= 50 ? 'bg-nb-orange' : 'bg-nb-paper'
                                }`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t-2 border-nb-black/5 flex flex-wrap gap-6 text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 nb-sm bg-nb-yellow border border-nb-black" />
                    <span className="text-nb-black/40">EXCELLENT [80%+]</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 nb-sm bg-nb-orange border border-nb-black" />
                    <span className="text-nb-black/40">NOMINAL [50%+]</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 nb-sm bg-nb-paper border border-nb-black" />
                    <span className="text-nb-black/40">CRITICAL [LOW]</span>
                </div>
            </div>
        </div>
    )
}
