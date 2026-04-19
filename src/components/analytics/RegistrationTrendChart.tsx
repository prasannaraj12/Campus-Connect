import { motion } from 'framer-motion'

interface TrendData {
    date: string
    count: number
    label: string
}

interface RegistrationTrendChartProps {
    data: TrendData[]
}

export default function RegistrationTrendChart({ data }: RegistrationTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-sm font-black text-nb-black mb-4 uppercase tracking-[0.2em]">Registration Trends</h3>
                <div className="flex-1 nb-sm bg-nb-paper flex items-center justify-center text-nb-black/20 text-[10px] font-black uppercase">
                    No data points logged
                </div>
            </div>
        )
    }

    const maxCount = Math.max(...data.map(d => d.count), 1)
    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 500
    const height = 240
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth
        const y = padding.top + chartHeight - (d.count / maxCount) * chartHeight
        return { x, y, ...d }
    })

    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ')

    const labelCount = 6
    const labelIndices = Array.from({ length: labelCount }, (_, i) =>
        Math.round((i / (labelCount - 1)) * (data.length - 1))
    )

    const yLabels = [0, Math.round(maxCount / 2), maxCount]

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-nb-black uppercase tracking-[0.2em]">REGISTRATION TRENDS</h3>
                    <p className="text-[10px] font-bold text-nb-black/40 uppercase tracking-widest mt-1 italic">LAST 30 ACTIVITY DAYS</p>
                </div>
                <div className="nb-tag bg-nb-black text-white text-[9px]">ACTIVE STATS</div>
            </div>

            <div className="flex-1 w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto"
                >
                    {/* Grid lines */}
                    {[0, 0.5, 1].map((ratio) => (
                        <line
                            key={ratio}
                            x1={padding.left}
                            y1={padding.top + chartHeight - ratio * chartHeight}
                            x2={padding.left + chartWidth}
                            y2={padding.top + chartHeight - ratio * chartHeight}
                            stroke="#000"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.1"
                        />
                    ))}

                    {/* Y-axis labels */}
                    {yLabels.map((label, i) => (
                        <text
                            key={i}
                            x={padding.left - 12}
                            y={padding.top + chartHeight - (i / 2) * chartHeight + 4}
                            textAnchor="end"
                            className="fill-nb-black/30 font-black"
                            style={{ fontSize: '10px' }}
                        >
                            {label}
                        </text>
                    ))}

                    {/* Main Trend Line */}
                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke="#000"
                        strokeWidth="3"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    />

                    {/* Data points */}
                    {labelIndices.map((idx) => {
                        const p = points[idx]
                        return (
                            <g key={idx}>
                                <rect
                                    x={p.x - 4}
                                    y={p.y - 4}
                                    width="8"
                                    height="8"
                                    fill="#facc15"
                                    stroke="#000"
                                    strokeWidth="2"
                                />
                            </g>
                        )
                    })}

                    {/* X-axis labels */}
                    {labelIndices.map((idx) => {
                        const p = points[idx]
                        return (
                            <text
                                key={p.date}
                                x={p.x}
                                y={height - 5}
                                textAnchor="middle"
                                className="fill-nb-black font-black uppercase"
                                style={{ fontSize: '9px', letterSpacing: '0.1em' }}
                            >
                                {p.label}
                            </text>
                        )
                    })}
                </svg>
            </div>
        </div>
    )
}
