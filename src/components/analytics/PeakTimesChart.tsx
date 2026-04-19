import { motion } from 'framer-motion'

interface PeakTimeData {
    hour: number
    count: number
    label: string
    percentage: number
}

interface PeakTimesChartProps {
    data: PeakTimeData[]
}

export default function PeakTimesChart({ data }: PeakTimesChartProps) {
    if (!data || data.length === 0 || data.every(d => d.count === 0)) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-sm font-black text-nb-black mb-4 uppercase tracking-[0.2em]">Peak Activity Times</h3>
                <div className="flex-1 nb-sm bg-nb-paper flex items-center justify-center text-nb-black/20 text-[10px] font-black uppercase">
                    No timeline data
                </div>
            </div>
        )
    }

    const periods = [
        { name: 'MORNING', range: '6AM-12PM', hours: [6, 7, 8, 9, 10, 11], color: 'bg-nb-yellow' },
        { name: 'AFTERNOON', range: '12PM-5PM', hours: [12, 13, 14, 15, 16], color: 'bg-nb-orange' },
        { name: 'EVENING', range: '5PM-9PM', hours: [17, 18, 19, 20], color: 'bg-nb-black' },
        { name: 'NIGHT', range: '9PM-6AM', hours: [21, 22, 23, 0, 1, 2, 3, 4, 5], color: 'bg-nb-paper' },
    ]

    const periodStats = periods.map(period => {
        const total = period.hours.reduce((sum, h) => sum + (data[h]?.count || 0), 0)
        return { ...period, total }
    })

    const maxPeriodTotal = Math.max(...periodStats.map(p => p.total), 1)
    const peakHour = data.reduce((max, curr) => (curr.count > max.count ? curr : max), data[0])

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-nb-black uppercase tracking-[0.2em]">PEAK ENGAGEMENT</h3>
                    <p className="text-[10px] font-bold text-nb-black/40 uppercase tracking-widest mt-1 italic">
                        HIGHEST VOLUME AT <span className="text-nb-black font-black">{peakHour.label.toUpperCase()}</span>
                    </p>
                </div>
            </div>

            {/* Time period bars */}
            <div className="space-y-6 mb-10">
                {periodStats.map((period, index) => (
                    <motion.div
                        key={period.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-nb-black uppercase tracking-tight">{period.name}</span>
                            <span className="text-[8px] font-bold text-nb-black/40 uppercase">{period.range}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-4 bg-nb-paper border-2 border-nb-black nb-sm overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(period.total / maxPeriodTotal) * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                    className={`h-full border-r-2 border-nb-black ${period.color}`}
                                />
                            </div>
                            <span className="text-[10px] font-black text-nb-black w-12 text-right">
                                {period.total}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Hourly heatmap */}
            <div className="mt-auto pt-6 border-t-4 border-nb-black/5">
                <p className="text-[10px] font-black text-nb-black uppercase tracking-widest mb-4">HOURLY DISTRIBUTION HEATMAP</p>
                <div className="grid grid-cols-12 gap-1.5">
                    {data.slice(0, 24).map((hour, i) => {
                        const intensity = hour.percentage
                        let bg = 'bg-nb-paper'
                        if (intensity > 66) bg = 'bg-nb-black'
                        else if (intensity > 33) bg = 'bg-nb-orange'
                        else if (intensity > 5) bg = 'bg-nb-yellow'

                        return (
                            <div
                                key={i}
                                className={`aspect-square nb-sm border-nb-black/20 hover:border-nb-black transition-colors relative group cursor-crosshair ${bg}`}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-transform origin-bottom z-20">
                                    <div className="nb-sm bg-nb-black text-white text-[8px] px-2 py-1 whitespace-nowrap font-black uppercase">
                                        {hour.label} — {hour.count} LOGS
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between mt-3 text-[8px] font-black text-nb-black/30 uppercase tracking-[0.2em]">
                    <span>12AM</span>
                    <span>12PM</span>
                    <span>11PM</span>
                </div>
            </div>
        </div>
    )
}
