import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, QrCode, TrendingUp, MapPin, Clock, Search, ChevronDown, Megaphone, AlertCircle, Settings, ArrowRight, Zap, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { getCategoryColor, getDaysUntilEvent } from '../lib/utils'
import SettingsMenu from '../components/SettingsMenu'
import { SkeletonCard } from '../components/Skeleton'

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social']
const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month']

// Category tag colors â€” distinct per type
const CATEGORY_TAG: Record<string, string> = {
  Workshop:  'bg-violet-100 text-violet-700',
  Seminar:   'bg-blue-100 text-blue-700',
  Sports:    'bg-green-100 text-green-700',
  Cultural:  'bg-pink-100 text-pink-700',
  Technical: 'bg-orange-100 text-orange-700',
  Social:    'bg-yellow-100 text-yellow-700',
  Hackathon: 'bg-cyan-100 text-cyan-700',
}

export default function Landing() {
  const navigate = useNavigate()
  const events = useQuery(api.events.getAllEvents)
  const announcements = useQuery(api.announcements.getGeneralAnnouncements)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [showMoreEvents, setShowMoreEvents] = useState(false)

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return []
    const now = new Date()
    let filtered = events
      .map((e: any) => ({ ...e, dateTime: new Date(`${e.date}T${e.time || '00:00'}`) }))
      .filter((e: any) => !isNaN(e.dateTime.getTime()) && e.dateTime >= now)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((e: any) =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      )
    }
    if (categoryFilter !== 'All') filtered = filtered.filter((e: any) => e.category === categoryFilter)
    if (dateFilter !== 'All') {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      if (dateFilter === 'Today') {
        filtered = filtered.filter((e: any) => { const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
      } else if (dateFilter === 'This Week') {
        const end = new Date(today); end.setDate(end.getDate() + 7)
        filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
      } else if (dateFilter === 'This Month') {
        const end = new Date(today); end.setMonth(end.getMonth() + 1)
        filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
      }
    }
    return filtered.sort((a: any, b: any) => a.dateTime - b.dateTime)
  }, [events, searchQuery, categoryFilter, dateFilter])

  const displayedEvents = showMoreEvents ? filteredEvents : filteredEvents.slice(0, 6)
  const isLoading = events === undefined

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">

      {/* â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
            Campus<span className="text-brand-500">Connect</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth?role=organizer')}
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Organizer Login
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Browse Events
            </button>
          </div>
        </div>
      </nav>

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative bg-slate-900 text-white pt-24 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent-400/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-brand-500/15 text-brand-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 border border-brand-500/25"
            >
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Smart Campus Event Management
            </motion.span>
            <h1 className="font-display text-5xl md:text-[4.5rem] font-extrabold leading-[1.1] mb-6 text-white tracking-tight">
              Every campus event,{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf 0%, #facc15 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
                in one place.
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover workshops, seminars, sports, and cultural events. Register in seconds, get your QR ticket, and never miss what's happening on campus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/role-selection')}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 transition-all inline-flex items-center justify-center gap-2">
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth?role=organizer')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-2xl border border-white/15 transition-all">
                I'm an Organizer
              </motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-16 flex items-center justify-center gap-10 flex-wrap">
            {[
              { value: '500+', label: 'Students' },
              { value: '80+',  label: 'Events' },
              { value: '12+',  label: 'Clubs' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center flex items-center gap-4">
                {i > 0 && <div className="w-px h-8 bg-slate-700 hidden sm:block" />}
                <div>
                  <p className="font-display text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-white border-b border-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by students &amp; organizers</p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { quote: "Registered for three workshops in under a minute. The QR ticket made check-in instant.", name: "Aisha K.", role: "2nd Year, CSE", avatar: "A" },
              { quote: "As an organizer, tracking attendance used to take hours. Now it's done before the event ends.", name: "Rohan M.", role: "Tech Club Lead", avatar: "R" },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4">
                <p className="text-slate-700 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Main content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a: any) => {
                const imp = a.priority === 'important'
                return (
                  <div
                    key={a._id}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${imp ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${imp ? 'bg-red-100' : 'bg-amber-100'}`}>
                      {imp ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Megaphone className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                        {imp && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">IMPORTANT</span>}
                      </div>
                      <p className="text-slate-600 text-sm mt-0.5">{a.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Search + Filters */}
        <div className="mb-8 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Date select */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {DATE_FILTERS.map(f => (
                  <option key={f} value={f}>{f === 'All' ? 'Any date' : f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Events heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Upcoming Events
            {filteredEvents.length > 0 && (
              <span className="ml-2 text-base font-semibold text-slate-400">({filteredEvents.length})</span>
            )}
          </h2>
        </div>

        {/* Events grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayedEvents.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event: any, index: number) => {
                const daysUntil = getDaysUntilEvent(event.date)
                const isNew = Math.floor((Date.now() - event._creationTime) / 86400000) <= 3
                const tagClass = CATEGORY_TAG[event.category] || 'bg-slate-100 text-slate-600'

                return (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                    className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 flex flex-col group cursor-pointer transition-shadow"
                    onClick={() => navigate('/role-selection')}
                  >
                    {/* Date block + category tag */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      {/* Prominent date block */}
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-500 text-white rounded-xl px-3 py-2 text-center min-w-[52px]">
                          <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                          <p className="text-2xl font-extrabold leading-none">
                            {new Date(event.date).getDate()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                          <p className="text-sm font-bold text-slate-700">{event.time}</p>
                        </div>
                      </div>
                      {/* Category tag */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagClass}`}>
                        {event.category}
                      </span>
                    </div>

                    <div className="px-5 pb-5 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {event.maxParticipants} seats
                        </span>
                      </div>

                      {/* Badges row */}
                      <div className="flex items-center gap-2 mb-4">
                        {daysUntil === 0 && (
                          <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">Today</span>
                        )}
                        {daysUntil === 1 && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">Tomorrow</span>
                        )}
                        {daysUntil > 1 && daysUntil <= 7 && (
                          <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">{daysUntil}d left</span>
                        )}
                        {isNew && (
                          <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">New</span>
                        )}
                        {event.isTeamEvent && (
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Team Event</span>
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/role-selection') }}
                        className="w-full bg-slate-900 hover:bg-brand-500 text-white font-bold text-sm py-3 rounded-xl transition-colors"
                      >
                        View & Register â†’
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            {filteredEvents.length > 6 && !showMoreEvents && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowMoreEvents(true)}
                  className="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-semibold px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  Show {filteredEvents.length - 6} more events
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'All' || dateFilter !== 'All'
                ? "No events match your current filters. Try broadening your search."
                : "No upcoming events yet. Check back soon or create one as an organizer."}
            </p>
            {(searchQuery || categoryFilter !== 'All' || dateFilter !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setDateFilter('All') }}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mt-20 mb-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Everything you need for campus events</h2>
            <p className="text-slate-500 text-sm">Built for students and organizers alike</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, title: 'Event Management',  desc: 'Create and publish events in minutes with AI-generated descriptions.', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
              { icon: QrCode,   title: 'QR Tickets',        desc: 'Every participant gets a unique QR code. Scan to mark attendance instantly.', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
              { icon: Zap,      title: 'Real-time Updates', desc: 'Live registration counts, attendance tracking, and community discussions.', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
              { icon: Shield,   title: 'Moderation Tools',  desc: 'Organizers can pin, report, and manage community content with ease.', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.2 }}
                className={`bg-white rounded-2xl p-6 border ${f.border} hover:shadow-md transition-shadow`}>
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <p className="font-display font-extrabold text-xl mb-2">
                Campus<span className="text-brand-400">Connect</span>
              </p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                The smart way to discover, manage, and attend campus events. Built for students, by students.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-300">Platform</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => navigate('/role-selection')} className="hover:text-white transition-colors">Browse Events</button></li>
                <li><button onClick={() => navigate('/auth?role=organizer')} className="hover:text-white transition-colors">Organizer Login</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-300">Contact</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@campusconnect.com" className="hover:text-white transition-colors">support@campusconnect.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            Â© 2026 CampusConnect. All rights reserved.
          </div>
        </div>
      </footer>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  )
}
