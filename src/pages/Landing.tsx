import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, QrCode, TrendingUp, MapPin, Clock, Search, ChevronDown, Megaphone, AlertCircle, Settings, ArrowRight, Zap, Shield, Sparkle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { getCategoryColor, getDaysUntilEvent } from '../lib/utils'
import SettingsMenu from '../components/SettingsMenu'
import { SkeletonCard } from '../components/Skeleton'
import { Brainbox, GhostBlob, HappyDog, NBStar } from '../components/Mascots'

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social']
const DATE_FILTERS = ['Upcoming', 'Past', 'Today', 'This Week', 'This Month']

export default function Landing() {
  const navigate = useNavigate()
  const events = useQuery(api.events.getAllEvents)
  const announcements = useQuery(api.announcements.getGeneralAnnouncements)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('Upcoming')
  const [showMoreEvents, setShowMoreEvents] = useState(false)

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return []
    const now = new Date()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    
    let filtered = events
      .map((e: any) => ({ ...e, dateTime: new Date(`${e.date}T${e.time || '00:00'}`) }))
      .filter((e: any) => !isNaN(e.dateTime.getTime()))

    if (dateFilter === 'Upcoming') {
      filtered = filtered.filter((e: any) => e.dateTime >= now)
    } else if (dateFilter === 'Past') {
      filtered = filtered.filter((e: any) => e.dateTime < now)
    } else if (dateFilter === 'Today') {
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
    } else if (dateFilter === 'This Week') {
      const end = new Date(today); end.setDate(end.getDate() + 7)
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    } else if (dateFilter === 'This Month') {
      const end = new Date(today); end.setMonth(end.getMonth() + 1)
      filtered = filtered.filter((e: any) => { const d = new Date(e.date); return d >= today && d <= end })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((e: any) =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((e: any) => e.category === categoryFilter)
    }

    return filtered.sort((a: any, b: any) => {
      if (dateFilter === 'Past') return b.dateTime - a.dateTime
      return a.dateTime - b.dateTime
    })
  }, [events, searchQuery, categoryFilter, dateFilter])

  const displayedEvents = showMoreEvents ? filteredEvents : filteredEvents.slice(0, 6)
  const isLoading = events === undefined

  return (
    <div className="min-h-screen bg-nb-cream flex flex-col font-body grid-bg overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-display font-black text-2xl text-black tracking-tighter flex items-center group"
          >
            <span className="bg-nb-yellow border-2 border-black px-1.5 py-0.5 group-hover:bg-nb-blue transition-colors uppercase">CAMPUS</span>
            <span className="ml-1.5 uppercase tracking-[0.1em]">CONNECT.</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 nb-sm bg-white text-black hover:bg-nb-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth?role=organizer')}
              className="hidden sm:block text-[10px] font-black tracking-widest text-black/50 hover:text-black transition-colors px-3 py-2 uppercase"
            >
              Organizer Portal
            </button>
            <button
              onClick={() => navigate('/role-selection')}
              className="nb-btn bg-nb-yellow text-black text-xs font-black px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-nb-purple hover:text-white transition-colors"
            >
              BROWSE EVENTS
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-nb-purple text-white py-28 px-4 overflow-hidden border-b-4 border-black">
        {/* Background Decorative Elements */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-nb-green opacity-10 border-[8px] border-black rounded-full pointer-events-none"
        />
        
        {/* Fixed positioning for Mascot SVGs - avoids overlapping text */}
        <Brainbox className="absolute top-10 right-4 w-40 h-40 md:w-64 md:h-64 z-20 hidden lg:block rotate-12 pointer-events-none" />
        <GhostBlob className="absolute bottom-10 left-4 w-40 h-40 md:w-64 md:h-64 z-20 hidden xl:block -rotate-12 opacity-80 pointer-events-none" />
        
        <NBStar className="absolute top-20 left-4 w-20 h-20 hidden md:block pointer-events-none" />
        <NBStar className="absolute bottom-20 right-[5%] w-28 h-28 hidden xl:block pointer-events-none" color="#FF2D92" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-3 bg-nb-green text-black text-xs font-black uppercase tracking-[0.3em] px-6 py-2.5 nb border-3 border-black shadow-[6px_6px_0px_0px_#000000] mb-12 -rotate-2">
              <Zap className="w-4 h-4" />
              CAMPUS LIFE UNLOCKED.
            </div>

            <h1 className="font-display text-7xl md:text-9xl font-black leading-[0.85] mb-10 tracking-tighter uppercase italic text-shadow-brutal">
              <span className="block mb-2">EVERY EVENT.</span>
              <span className="inline-block bg-nb-yellow text-black border-black border-[6px] px-6 py-3 shadow-[12px_12px_0px_0px_#000000] mt-4 rotate-2">
                ONE PLACE.
              </span>
            </h1>

            <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto mb-14 font-black leading-tight drop-shadow-[2px_2px_0_#000000]">
              Ditch the noise. Join the community. <br />
              The ultimate hub for workshops, seminars, and campus events.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <motion.button 
                whileHover={{ scale: 1.05, rotate: -1 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate('/role-selection')}
                className="w-full sm:w-auto bg-nb-green text-black font-black text-2xl px-14 py-6 nb-xl shadow-[10px_10px_0px_0px_#000000] hover:shadow-[14px_14px_0px_0px_#000000] transition-all inline-flex items-center justify-center gap-4 group italic"
              >
                JOIN THE ACTION
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, rotate: 1 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate('/auth?role=organizer')}
                className="w-full sm:w-auto bg-white text-black font-black text-2xl px-14 py-6 nb-xl shadow-[10px_10px_0px_0px_#000000] hover:shadow-[14px_14px_0px_0px_#000000] transition-all italic"
              >
                LAUNCH EVENT
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Bar - High contrast and clean */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-32 flex items-center justify-center gap-8 sm:gap-20 flex-wrap">
            {[
              { value: '500+', label: 'PIONEERS', color: 'text-white', bg: 'bg-nb-pink' },
              { value: '80+',  label: 'EVENTS',   color: 'text-black', bg: 'bg-nb-yellow' },
              { value: '12+',  label: 'GROUPS',   color: 'text-white', bg: 'bg-nb-green' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className={`${stat.bg} nb border-4 border-black px-10 py-6 mb-3 shadow-[8px_8px_0_#000000] group-hover:translate-y-[-6px] transition-transform`}>
                  <p className={`font-display text-5xl font-black ${stat.color} leading-none tracking-tighter`}>{stat.value}</p>
                </div>
                <p className="text-white text-xs font-black tracking-[0.4em] uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="bg-nb-green py-24 px-4 border-b-4 border-black relative overflow-hidden">
        <NBStar className="absolute top-10 left-10 w-16 h-16 opacity-30 pointer-events-none" color="white" />
        <NBStar className="absolute bottom-10 right-10 w-20 h-20 opacity-30 pointer-events-none" color="white" />

        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-center text-[12px] font-black uppercase tracking-[0.4em] text-black mb-16 italic underline decoration-white underline-offset-8 decoration-4">TRUSTED BY THE COMMUNITY</p>
          <div className="grid md:grid-cols-2 gap-12 text-black">
            {[
              { quote: "Registered for three workshops in under a minute. The QR ticket made check-in instant.", name: "Aisha K.", role: "2nd Year, CSE", color: "bg-nb-pink" },
              { quote: "As an organizer, tracking attendance used to take hours. Now it's done before the event ends.", name: "Rohan M.", role: "Tech Club Lead", color: "bg-nb-yellow" },
            ].map((t) => (
              <div key={t.name} className="nb bg-white p-12 flex flex-col gap-10 nb-hover shadow-[12px_12px_0_#000000] border-4">
                <p className="text-black font-black italic leading-tight text-2xl tracking-tighter">"{t.quote}"</p>
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 ${t.color} nb-lg flex items-center justify-center font-black text-3xl border-4 shadow-[6px_6px_0_#000000] -rotate-3`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-black text-black text-xl uppercase tracking-tighter italic">{t.name}</p>
                    <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.3em] font-body mt-1">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Announcements ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-32">

        {announcements && announcements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-32">
            <h2 className="font-display text-5xl font-black text-black mb-16 flex items-center gap-8 italic">
              <div className="bg-nb-purple text-white p-4 nb border-4 border-black shadow-[8px_8px_0_#000000] rotate-[-2deg]">
                <Megaphone className="w-10 h-10" />
              </div>
              LATEST UPDATES
              <div className="h-2 flex-1 bg-black" />
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              {announcements.slice(0, 4).map((a: any) => {
                const imp = a.priority === 'important'
                return (
                  <div key={a._id} className={`nb p-8 flex gap-8 nb-hover border-4 ${imp ? 'bg-nb-pink text-white shadow-[12px_12px_0_#000000]' : 'bg-white shadow-[8px_8px_0_#000000]'}`}>
                    <div className={`p-5 nb flex-shrink-0 flex items-center justify-center h-20 w-20 border-4 shadow-[6px_6px_0_#000000] ${imp ? 'bg-white text-nb-pink -rotate-2' : 'bg-nb-green text-black rotate-2'}`}>
                      {imp ? <AlertCircle className="w-10 h-10 stroke-[3px]" /> : <Megaphone className="w-10 h-10 stroke-[3px]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <p className={`font-display font-black text-2xl uppercase tracking-tighter italic ${imp ? 'text-white' : 'text-black'}`}>{a.title}</p>
                        {imp && <span className="nb bg-white text-nb-pink text-[10px] px-3 py-1 border-3 border-black font-black tracking-widest">CRITICAL</span>}
                      </div>
                      <p className={`text-sm font-black leading-relaxed italic ${imp ? 'text-white/80' : 'text-black/60'}`}>{a.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
        {/* ── Events Control Console ────────────────────────────── */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-semibold
                           bg-white rounded-lg border-2 border-black/20
                           shadow-[2px_2px_0_rgba(0,0,0,0.6)]
                           focus:outline-none focus:border-nb-purple
                           focus:shadow-[1px_1px_0_rgba(0,0,0,0.5)]
                           transition-all placeholder:text-black/30"
              />
            </div>

            {/* Date filters */}
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map(date => (
                <button
                  key={date}
                  onClick={() => setDateFilter(date)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all
                    ${dateFilter === date
                      ? 'bg-nb-pink text-white border-nb-pink shadow-[2px_2px_0_rgba(0,0,0,0.7)]'
                      : 'bg-white text-black/60 border-black/20 hover:border-black/40 hover:text-black'
                    }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-black/30 uppercase tracking-wider mr-1">Category:</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all
                  ${categoryFilter === cat
                    ? 'bg-nb-purple text-white border-nb-purple shadow-[2px_2px_0_rgba(0,0,0,0.7)]'
                    : 'bg-white text-black/60 border-black/15 hover:border-black/30 hover:text-black'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Events Grid ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/10">
          <h2 className="font-display text-2xl font-black text-black tracking-tight">
            {dateFilter === 'Past' ? 'Past Events' : 'Upcoming Events'}
          </h2>
          {filteredEvents.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-nb-pink text-white
                             border border-black/20 shadow-[1px_1px_0_rgba(0,0,0,0.6)]">
              {filteredEvents.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayedEvents.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event: any, index: number) => {
                const catColor = getCategoryColor(event.category)
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
                return (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl border-2 border-black/80
                               shadow-[4px_4px_0_rgba(0,0,0,0.8)]
                               hover:shadow-[6px_6px_0_rgba(0,0,0,0.9)]
                               flex flex-col cursor-pointer overflow-hidden
                               transition-all duration-200 group"
                    onClick={() => navigate('/role-selection')}
                  >
                    {/* Category strip */}
                    <div className={`${catColor} px-4 py-2.5 flex items-center justify-between border-b border-black/15`}>
                      <span className="text-xs font-bold uppercase tracking-wide">{event.category}</span>
                      {daysUntil === 0 && (
                        <span className="text-[10px] font-bold bg-white/80 text-black px-2 py-0.5 rounded">Today</span>
                      )}
                      {daysUntil > 0 && daysUntil <= 3 && (
                        <span className="text-[10px] font-bold bg-white/80 text-black px-2 py-0.5 rounded">Soon</span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display text-lg font-black text-black mb-2
                                     line-clamp-2 tracking-tight leading-tight
                                     group-hover:text-nb-purple transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-black/55 text-sm mb-4 line-clamp-2 leading-relaxed flex-1 font-medium">
                        {event.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                                        bg-nb-cream border border-black/15 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-nb-purple" />
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                                        bg-nb-cream border border-black/15 text-xs font-semibold truncate">
                          <MapPin className="w-3.5 h-3.5 text-nb-pink shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/role-selection') }}
                        className="w-full py-2.5 rounded-lg text-sm font-bold
                                   bg-nb-purple text-white border border-black/20
                                   shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                                   hover:bg-nb-yellow hover:text-black
                                   hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                                   active:shadow-[1px_1px_0_rgba(0,0,0,0.6)]
                                   transition-all"
                      >
                        View Details →
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
                  className="px-8 py-3 rounded-lg text-sm font-bold bg-white text-black
                             border-2 border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.7)]
                             hover:shadow-[4px_4px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                             active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                             transition-all"
                >
                  Load more events +
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-16 px-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-xl bg-black/5 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-black/30" />
            </div>
            <h3 className="font-display text-xl font-black text-black mb-2">
              {dateFilter === 'Upcoming' ? 'No upcoming events' : 'No events found'}
            </h3>
            <p className="text-sm text-black/40 font-medium mb-5">
              {dateFilter === 'Upcoming'
                ? "Try switching to 'Past' events or check back soon."
                : 'No results match your search. Try different filters.'}
            </p>
            {(searchQuery || categoryFilter !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('All') }}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-nb-yellow text-black
                           border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                           hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                           transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Feature Blocks ────────────────────────────────────────── */}
        <section className="mt-48 mb-20 bg-nb-yellow p-16 nb border-8 border-black shadow-[30px_30px_0_#7400E8] relative overflow-hidden">
           <HappyDog className="absolute top-[-10%] right-[-10%] w-80 h-80 opacity-20 rotate-12 pointer-events-none" />
           <div className="relative z-10">
              <div className="flex items-center gap-10 mb-20">
                <h2 className="font-display text-7xl font-black text-black uppercase italic tracking-tighter leading-none underline decoration-nb-pink decoration-8 underline-offset-8">FEATURES.</h2>
                <div className="h-3 flex-1 bg-black" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { icon: Calendar, title: 'MGMT',  desc: 'Easy Event Management', color: 'bg-white' },
                  { icon: QrCode,   title: 'SCAN',  desc: 'Quick QR Tickets',       color: 'bg-nb-green' },
                  { icon: Zap,      title: 'LIVE',  desc: 'Realtime Syncing',        color: 'bg-nb-purple text-white' },
                  { icon: Shield,   title: 'GUARD', desc: 'Secure & Fast',           color: 'bg-nb-pink text-white' },
                ].map((f, i) => (
                  <motion.div key={i} whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
                    className={`nb p-8 ${f.color} border-4 shadow-[8px_8px_0_#000000] transition-all`}>
                    <div className="nb border-4 border-black bg-white text-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0_#000000] -rotate-2">
                      <f.icon className="w-8 h-8 stroke-[2.5px]" />
                    </div>
                    <h3 className="font-display font-black text-2xl mb-2 uppercase tracking-tight leading-none">{f.title}</h3>
                    <p className="text-sm font-semibold opacity-70 leading-snug">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
           </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-black text-white py-32 px-6 border-t-[12px] border-nb-green relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-20 mb-32">
            <div className="md:col-span-2">
              <p className="font-display font-black text-7xl mb-10 tracking-tighter flex flex-wrap items-center gap-6 leading-none italic uppercase">
                CAMPUS<span className="bg-nb-yellow text-black px-6 py-2 border-4 border-white -rotate-3 shadow-[8px_8px_0_#7400E8]">CONNECT.</span>
              </p>
              <p className="text-white/60 text-2xl font-black leading-tight max-w-lg italic uppercase tracking-tighter underline decoration-white/10 underline-offset-8">
                THE_SMARTEST_WAY_TO_LEAD. <br/>THE_FASTEST_WAY_TO_CONNECT. <br/>BUILT_FOR_YOU.
              </p>
            </div>
            <div>
              <p className="font-black text-[16px] tracking-[0.6em] uppercase mb-12 text-nb-green italic decoration-white decoration-4 underline underline-offset-12">INFO</p>
              <ul className="space-y-6 text-sm font-black italic tracking-[0.2em]">
                <li><button onClick={() => navigate('/role-selection')} className="hover:text-nb-yellow transition-all hover:translate-x-2 text-left block">BROWSE EVENTS →</button></li>
                <li><button onClick={() => navigate('/auth?role=organizer')} className="hover:text-nb-yellow transition-all hover:translate-x-2 text-left block">ORGANIZER PORTAL →</button></li>
              </ul>
            </div>
            <div>
              <p className="font-black text-[16px] tracking-[0.6em] uppercase mb-12 text-nb-green italic decoration-white decoration-4 underline underline-offset-12">SUPPORT</p>
              <ul className="space-y-6 text-sm font-black italic tracking-[0.2em]">
                <li><a href="mailto:support@campusconnect.com" className="hover:text-nb-yellow transition-all hover:translate-x-2 block">EMAIL SUPPORT →</a></li>
                <li><a href="#" className="hover:text-nb-yellow transition-all hover:translate-x-2 block">PROJECT FAQ →</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-20 border-t-8 border-white/10 flex flex-col sm:flex-row justify-between items-center gap-10 text-[14px] font-black uppercase tracking-[0.8em] text-white/30 italic leading-none">
            <p>© 2026 CAMPUS CONNECT PROJECT</p>
            <p>DESIGNED BY PRASANNA // CODED WITH IMPACT</p>
          </div>
        </div>
      </footer>

      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  )
}
