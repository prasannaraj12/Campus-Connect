import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, CheckCircle, Percent } from 'lucide-react'

interface OverviewStatsProps {
    totalEvents: number
    totalRegistrations: number
    totalAttendance: number
    attendanceRate: number
    upcomingEvents: number
}

export default function OverviewStats({
    totalEvents,
    totalRegistrations,
    totalAttendance,
    attendanceRate,
    upcomingEvents,
}: OverviewStatsProps) {
    const stats = [
        {
            label: 'Total Events',
            value: totalEvents,
            subtitle: `${upcomingEvents} upcoming`,
            icon: Calendar,
            color: 'bg-nb-yellow',
        },
        {
            label: 'Registrations',
            value: totalRegistrations,
            subtitle: 'Confirmed entries',
            icon: Users,
            color: 'bg-nb-orange',
        },
        {
            label: 'Attendance',
            value: totalAttendance,
            subtitle: 'Marked present',
            icon: CheckCircle,
            color: 'bg-white',
        },
        {
            label: 'Show-up Rate',
            value: `${attendanceRate}%`,
            subtitle: 'Efficiency metric',
            icon: Percent,
            color: 'bg-nb-yellow',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`nb ${stat.color} p-5 nb-hover relative overflow-hidden`}
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <stat.icon className="w-4 h-4 text-black opacity-30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                                {stat.label}
                            </span>
                        </div>
                        <p className="text-4xl font-black text-black font-display tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mt-1">{stat.subtitle}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
