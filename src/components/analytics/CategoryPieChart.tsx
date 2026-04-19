import { motion } from 'framer-motion'

interface CategoryData {
    category: string
    eventCount: number
    registrationCount: number
    color: string
}

interface CategoryPieChartProps {
    data: CategoryData[]
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-sm font-black text-nb-black mb-4 uppercase tracking-[0.2em]">Events by Category</h3>
                <div className="flex-1 nb-sm bg-nb-paper flex items-center justify-center text-nb-black/20 text-[10px] font-black uppercase">
                    No classification data
                </div>
            </div>
        )
    }

    const total = data.reduce((sum, d) => sum + d.eventCount, 0)
    const radius = 90
    const centerX = 100
    const centerY = 100

    let currentAngle = -90

    const slices = data.map((d) => {
        const percentage = d.eventCount / total
        const angle = percentage * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(startRad)
        const y1 = centerY + radius * Math.sin(startRad)
        const x2 = centerX + radius * Math.cos(endRad)
        const y2 = centerY + radius * Math.sin(endRad)

        const largeArc = angle > 180 ? 1 : 0

        const path =
            `M ${centerX} ${centerY} ` +
            `L ${x1} ${y1} ` +
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} ` +
            `Z`

        return { ...d, path, percentage: Math.round(percentage * 100) }
    })

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-nb-black uppercase tracking-[0.2em]">CATEGORY RATIO</h3>
                    <p className="text-[10px] font-bold text-nb-black/40 uppercase tracking-widest mt-1 italic">DISTRUBUTION BY TYPE</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Pie Chart */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {slices.map((slice, i) => (
                        <motion.path
                            key={slice.category}
                            d={slice.path}
                            fill={slice.color}
                            stroke="#000"
                            strokeWidth="3"
                            initial={{ opacity: 0, rotate: -10 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer"
                        />
                    ))}
                    {/* Donut hole with border */}
                    <circle cx={centerX} cy={centerY} r={50} fill="white" stroke="#000" strokeWidth="3" />
                    <text
                        x={centerX}
                        y={centerY - 2}
                        textAnchor="middle"
                        className="font-display text-2xl font-black fill-nb-black"
                    >
                        {total}
                    </text>
                    <text
                        x={centerX}
                        y={centerY + 16}
                        textAnchor="middle"
                        className="text-[8px] font-black uppercase fill-nb-black/30 tracking-widest"
                    >
                        EVENTS
                    </text>
                </svg>

                {/* Legend */}
                <div className="flex-1 w-full space-y-2">
                    {slices.map((slice) => (
                        <div key={slice.category} className="nb-sm bg-nb-paper p-3 flex items-center justify-between group hover:bg-nb-yellow transition-colors">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 nb-sm"
                                    style={{ backgroundColor: slice.color, borderWidth: '2px', borderColor: '#000' }}
                                />
                                <span className="text-[10px] font-black text-nb-black uppercase tracking-tight">
                                    {slice.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-nb-black/40 uppercase">
                                    {slice.eventCount}
                                </span>
                                <span className="text-[10px] font-black text-nb-black">
                                    {slice.percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
