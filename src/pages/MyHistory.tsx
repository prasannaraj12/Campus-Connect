import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import AppShell from '../components/AppShell'
import { PageLoader } from '../components/Skeleton'
import {
    Calendar,
    MapPin,
    Clock,
    Award,
    CheckCircle,
    Users,
    Trophy,
    Download,
    ArrowLeft,
    Ticket,
    ExternalLink
} from 'lucide-react'

export default function MyHistory() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('past')

    const history = useQuery(
        api.history.getMyAttendanceHistory,
        user?.userId ? { userId: user.userId } : 'skip'
    )

    const stats = useQuery(
        api.history.getMyStats,
        user?.userId ? { userId: user.userId } : 'skip'
    )

    const myRegistrations = useQuery(
        api.registrations.myRegistrations,
        user?.userId ? { userId: user.userId } : 'skip'
    )

    const allEvents = useQuery(api.events.getAllEvents)

    if (!user) return null

    const isLoading = history === undefined || stats === undefined
    const isUpcomingLoading = myRegistrations === undefined || allEvents === undefined

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingRegistrations = (() => {
        if (!myRegistrations || !allEvents) return []
        const eventMap = new Map(allEvents.map((e: any) => [e._id, e]))
        return myRegistrations
            .filter((reg: any) => {
                const event = eventMap.get(reg.eventId) as any
                if (!event) return false
                const eventDate = new Date(`${event.date}T${event.time || '00:00'}`)
                return eventDate >= today
            })
            .map((reg: any) => ({
                ...reg,
                event: eventMap.get(reg.eventId) as any,
            }))
            .sort((a: any, b: any) => {
                const da = new Date(`${a.event.date}T${a.event.time || '00:00'}`).getTime()
                const db = new Date(`${b.event.date}T${b.event.time || '00:00'}`).getTime()
                return da - db
            })
    })()

    return (
        <AppShell className="grid-bg">
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
                {/* ── Page Header ────────────────────────────────────── */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="nb bg-white p-4 border-3 border-black shadow-[4px_4px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-black" />
                    </button>
                    <div>
                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-black/40 underline decoration-nb-purple underline-offset-4 mb-2">YOUR ACTIVITY</p>
                        <h1 className="font-display text-5xl font-black text-black uppercase tracking-tighter italic">MY HISTORY</h1>
                    </div>
                </div>

                {isLoading ? (
                    <PageLoader message="Loading your history..." />
                ) : (
                    <>
                        {/* ── Stats ──────────────────────────────────────────── */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'REGISTERED', value: stats?.totalRegistrations || 0, icon: Calendar, color: 'bg-white' },
                                { label: 'ATTENDED', value: stats?.totalAttended || 0, icon: CheckCircle, color: 'bg-nb-green' },
                                { label: 'RATE', value: `${stats?.attendanceRate || 0}%`, icon: Award, color: 'bg-nb-pink text-white' },
                                { label: 'TOP CATEGORY', value: stats?.topCategory || 'NONE YET', icon: Trophy, color: 'bg-nb-purple text-white', isTag: true },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`nb ${stat.color} p-6 flex flex-col justify-between h-40 border-4 shadow-[8px_8px_0_#000000] hover:rotate-0 transition-all`}
                                >
                                    <div className="flex justify-between items-start">
                                        <stat.icon className="w-6 h-6 opacity-40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                                    </div>
                                    <p className={`${(stat as any).isTag ? 'text-xl font-black leading-tight' : 'text-5xl font-black'} font-display uppercase truncate italic tracking-tighter`}>
                                        {stat.value}
                                    </p>
                                </motion.div>
                            ))}
                        </section>

                        {/* ── Tabs ─────────────────────────────────────────── */}
                        <div className="flex gap-0 border-4 border-black w-fit shadow-[6px_6px_0_#000000]">
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-8 py-4 font-black text-sm uppercase tracking-[0.2em] transition-all border-r-4 border-black ${
                                    activeTab === 'past' ? 'bg-black text-white' : 'bg-white text-black hover:bg-nb-cream'
                                }`}
                            >
                                Past Activity
                            </button>
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-8 py-4 font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                    activeTab === 'upcoming' ? 'bg-nb-yellow text-black' : 'bg-white text-black hover:bg-nb-cream'
                                }`}
                            >
                                Upcoming Events
                                {upcomingRegistrations.length > 0 && (
                                    <span className="nb bg-nb-green text-black text-[10px] font-black px-2 py-0.5 border-2 border-black">
                                        {upcomingRegistrations.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* ── Past Activity Tab ─────────────────────────────── */}
                        {activeTab === 'past' && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-4 bg-black shadow-[4px_4px_0_#7400E8]" />
                                    <h2 className="font-display text-3xl font-black text-black uppercase tracking-tighter italic">PAST ACTIVITY</h2>
                                </div>

                                {history && history.length === 0 ? (
                                    <div className="nb bg-white p-24 text-center border-4 shadow-[15px_15px_0_#000000]">
                                        <Calendar className="w-24 h-24 mx-auto mb-8 text-black/10 animate-pulse" />
                                        <h3 className="font-display text-4xl font-black text-black mb-4 italic uppercase">NO HISTORY YET</h3>
                                        <p className="text-black/50 font-black uppercase tracking-tight mb-12 max-w-sm mx-auto text-sm italic">
                                            You haven't attended any events yet. Start exploring!
                                        </p>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="nb bg-nb-yellow text-black font-black px-12 py-5 text-sm tracking-[0.3em] uppercase border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                        >
                                            EXPLORE EVENTS →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {history?.map((item: any, index: number) => (
                                            <motion.div
                                                key={item.registrationId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#000000] hover:shadow-[16px_16px_0_#7400E8] transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className={`nb px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 border-black ${item.attended ? 'bg-nb-green text-black' : 'bg-nb-cream text-black/40'}`}>
                                                                {item.attended ? 'ATTENDED' : 'REGISTERED'}
                                                            </span>
                                                            <span className="nb px-3 py-1 bg-nb-purple text-white border-2 border-black font-black text-[9px] uppercase tracking-widest italic">
                                                                CATEGORY: {item.eventCategory.toUpperCase()}
                                                            </span>
                                                            {item.isTeamEvent && (
                                                                <span className="nb px-3 py-1 bg-nb-pink text-white border-2 border-black font-black text-[9px] uppercase tracking-widest flex items-center gap-2 italic">
                                                                    <Users className="w-4 h-4" /> TEAM EVENT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3
                                                            className="font-display text-4xl font-black text-black uppercase tracking-tighter italic cursor-pointer group-hover:text-nb-purple transition-colors leading-none"
                                                            onClick={() => navigate(`/event/${item.eventId}`)}
                                                        >
                                                            {item.eventTitle}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] font-black text-black/50 uppercase tracking-[0.2em] italic">
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="w-5 h-5 text-nb-purple" />
                                                                {new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Clock className="w-5 h-5 text-nb-green" />
                                                                {item.eventTime}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <MapPin className="w-5 h-5 text-nb-pink" />
                                                                {item.eventLocation}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex md:flex-col items-center gap-4">
                                                        {item.attended ? (
                                                            <button
                                                                onClick={() => navigate(`/ticket/${item.registrationId}`)}
                                                                className="nb bg-black text-white px-8 py-5 text-xs font-black tracking-[0.3em] uppercase border-4 shadow-[6px_6px_0_#00FF75] group-hover:bg-nb-purple transition-all italic flex items-center gap-3"
                                                            >
                                                                <Download className="w-5 h-5" /> CERTIFICATE
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => navigate(`/event/${item.eventId}`)}
                                                                className="nb bg-nb-yellow text-black px-8 py-5 text-xs font-black tracking-[0.3em] uppercase border-4 shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
                                                            >
                                                                VIEW EVENT
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ── Upcoming Events Tab ───────────────────────────── */}
                        {activeTab === 'upcoming' && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-4 bg-black shadow-[4px_4px_0_#00FF75]" />
                                    <h2 className="font-display text-3xl font-black text-black uppercase tracking-tighter italic">UPCOMING REGISTRATIONS</h2>
                                </div>

                                {isUpcomingLoading ? (
                                    <PageLoader message="Loading your upcoming events..." />
                                ) : upcomingRegistrations.length === 0 ? (
                                    <div className="nb bg-white p-24 text-center border-4 shadow-[15px_15px_0_#000000]">
                                        <Calendar className="w-24 h-24 mx-auto mb-8 text-black/10 animate-pulse" />
                                        <h3 className="font-display text-4xl font-black text-black mb-4 italic uppercase">NO UPCOMING EVENTS</h3>
                                        <p className="text-black/50 font-black uppercase tracking-tight mb-12 max-w-sm mx-auto text-sm italic">
                                            You have no upcoming registrations. Find something exciting!
                                        </p>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="nb bg-nb-yellow text-black font-black px-12 py-5 text-sm tracking-[0.3em] uppercase border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                        >
                                            EXPLORE EVENTS →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {upcomingRegistrations.map((item: any, index: number) => (
                                            <motion.div
                                                key={item._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="nb bg-white p-8 border-4 shadow-[12px_12px_0_#000000] hover:shadow-[16px_16px_0_#00FF75] transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="nb px-3 py-1 bg-nb-green text-black border-2 border-black font-black text-[9px] uppercase tracking-widest">
                                                                REGISTERED
                                                            </span>
                                                            <span className="nb px-3 py-1 bg-nb-yellow text-black border-2 border-black font-black text-[9px] uppercase tracking-widest italic">
                                                                CATEGORY: {item.event.category.toUpperCase()}
                                                            </span>
                                                            {item.event.isTeamEvent && (
                                                                <span className="nb px-3 py-1 bg-nb-pink text-white border-2 border-black font-black text-[9px] uppercase tracking-widest flex items-center gap-2 italic">
                                                                    <Users className="w-4 h-4" /> TEAM EVENT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3
                                                            className="font-display text-4xl font-black text-black uppercase tracking-tighter italic cursor-pointer group-hover:text-nb-green transition-colors leading-none"
                                                            onClick={() => navigate(`/event/${item.eventId}`)}
                                                        >
                                                            {item.event.title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] font-black text-black/50 uppercase tracking-[0.2em] italic">
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="w-5 h-5 text-nb-green" />
                                                                {new Date(item.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Clock className="w-5 h-5 text-nb-yellow" />
                                                                {item.event.time}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <MapPin className="w-5 h-5 text-nb-pink" />
                                                                {item.event.location}
                                                            </div>
                                                        </div>
                                                        {item.registrationCode && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Code:</span>
                                                                <span className="nb bg-nb-cream px-3 py-1 font-mono font-black text-xs border-2 border-black tracking-widest">
                                                                    {item.registrationCode}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex md:flex-col items-center gap-4">
                                                        <button
                                                            onClick={() => navigate(`/ticket/${item._id}`)}
                                                            className="nb bg-nb-green text-black px-8 py-5 text-xs font-black tracking-[0.3em] uppercase border-4 border-black shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic flex items-center gap-3"
                                                        >
                                                            <Ticket className="w-5 h-5" /> VIEW TICKET
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/event/${item.eventId}`)}
                                                            className="nb bg-nb-yellow text-black px-8 py-5 text-xs font-black tracking-[0.3em] uppercase border-4 border-black shadow-[6px_6px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic flex items-center gap-3"
                                                        >
                                                            <ExternalLink className="w-5 h-5" /> VIEW EVENT
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </AppShell>
    )
}
