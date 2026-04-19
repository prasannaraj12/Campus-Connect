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
                <div className={`${stat.bg} nb border-4 border-black px-12 py-8 mb-4 shadow-[10px_10px_0_#000000] group-hover:translate-y-[-8px] transition-transform relative z-10`}>
                  <p className={`font-display text-6xl font-black ${stat.color} leading-none tracking-tighter`}>{stat.value}</p>
                </div>
                <p className="text-white text-[14px] font-black tracking-[0.5em] uppercase italic underline decoration-white/20 underline-offset-8">{stat.label}</p>
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
        <section className="mb-20 space-y-12">
          <div className="flex flex-col xl:flex-row gap-10 items-stretch xl:items-end">
            {/* Search Module */}
            <div className="flex-1 space-y-4">
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 italic ml-2 underline decoration-nb-purple underline-offset-4">SEARCH ENGINE</p>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-black/20 group-focus-within:text-nb-purple transition-all" />
                <input
                  type="text"
                  placeholder="SEARCH FOR EVENTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nb-input w-full pl-20 pr-10 py-6 text-xl uppercase font-black placeholder:text-black/10 border-4 shadow-[10px_10px_0_#000000] focus:shadow-none focus:translate-x-1.5 focus:translate-y-1.5 transition-all italic"
                />
              </div>
            </div>

            {/* Filter Module */}
            <div className="flex-shrink-0 space-y-4">
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 italic ml-2 underline decoration-nb-pink underline-offset-4">SYNC FILTERS</p>
              <div className="flex flex-wrap gap-4">
                {DATE_FILTERS.map(date => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    className={`nb px-6 py-4 text-[11px] font-black transition-all border-4 shadow-[6px_6px_0_#000000] uppercase tracking-widest italic leading-none ${
                      dateFilter === date
                        ? 'bg-nb-pink text-white shadow-none translate-x-1.5 translate-y-1.5 rotate-1deg'
                        : 'bg-white text-black hover:bg-nb-yellow'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Quick-Select */}
          <div className="bg-black/5 p-8 nb border-4 border-black/10">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mr-4">CATEGORIES:</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`nb-sm px-6 py-2.5 text-[10px] font-black transition-all border-3 border-black uppercase tracking-widest italic ${
                    categoryFilter === cat
                      ? 'bg-nb-purple text-white rotate-[-2deg]'
                      : 'bg-white text-black hover:bg-nb-yellow'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <div className="flex items-center justify-between mb-16 border-b-8 border-black pb-8">
          <h2 className="font-display text-7xl font-black text-black italic tracking-tighter uppercase leading-none">
            {dateFilter === 'Past' ? 'PAST EVENTS' : 'UPCOMING EVENTS'}
            {filteredEvents.length > 0 && (
              <span className="ml-8 text-3xl font-black text-white bg-nb-pink border-4 border-black px-5 py-2 inline-block vertical-middle rotate-3 shadow-[6px_6px_0_#00FF75]">{filteredEvents.length}</span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayedEvents.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {displayedEvents.map((event: any, index: number) => {
                const catColor = getCategoryColor(event.category)
                return (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="nb bg-white flex flex-col group cursor-pointer nb-hover shadow-[15px_15px_0_#000000] border-4 overflow-hidden"
                    onClick={() => navigate('/role-selection')}
                  >
                    <div className={`${catColor} px-8 py-5 border-b-4 border-black flex justify-between items-center bg-opacity-100`}>
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] italic">{event.category}</span>
                      <div className="bg-white border-3 border-black px-3 py-1 shadow-[4px_4px_0_#000000] rotate-6 text-[10px] font-black tracking-widest">LIVE SYNC</div>
                    </div>

                    <div className="p-10 flex flex-col flex-1">
                      <h3 className="font-display text-3xl font-black text-black mb-6 line-clamp-2 uppercase italic leading-none tracking-tighter group-hover:underline underline-offset-8 decoration-nb-purple decoration-4">
                        {event.title}
                      </h3>
                      <p className="text-black/70 text-sm font-black mb-10 line-clamp-2 leading-relaxed flex-1 italic uppercase tracking-tight">
                        {event.description}
                      </p>

                      <div className="flex gap-6 mb-10">
                        <div className="bg-nb-cream nb border-4 border-black px-4 py-3 flex items-center gap-3">
                           <Calendar className="w-5 h-5 text-nb-purple stroke-[3px]" />
                           <span className="text-[11px] font-black uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-nb-cream nb border-4 border-black px-4 py-3 flex items-center gap-3">
                           <MapPin className="w-5 h-5 text-nb-pink stroke-[3px]" />
                           <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">{event.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/role-selection') }}
                        className="nb bg-nb-purple text-white font-black text-lg py-6 uppercase tracking-[0.4em] hover:bg-nb-yellow hover:text-black transition-all border-4 shadow-[8px_8px_0_#000000] italic group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1"
                      >
                        VIEW DETAILS →
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            {filteredEvents.length > 6 && !showMoreEvents && (
              <div className="text-center mt-24">
                <button
                  onClick={() => setShowMoreEvents(true)}
                  className="nb bg-white text-black font-black px-16 py-8 text-lg tracking-[0.4em] hover:bg-nb-green border-4 shadow-[15px_15px_0_#000000] active:shadow-none transition-all uppercase italic"
                >
                  LOAD MORE EVENTS +
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="nb bg-white p-24 text-center border-4 shadow-[20px_20px_0_#000000] rotate-[-1deg]">
             <h3 className="font-display text-5xl font-black text-black uppercase italic mb-6 tracking-tighter underline decoration-nb-pink decoration-8 underline-offset-8">{dateFilter === "Upcoming" ? "NO UPCOMING EVENTS" : "NO EVENTS FOUND"}</h3>
             <p className="text-black/40 font-black text-xl uppercase tracking-[0.4em] italic leading-tight">{dateFilter === "Upcoming" ? "TRY SWITCHING TO 'PAST' EVENTS OR CHECK BACK SOON." : "NO RESULTS MATCH YOUR SEARCH."}<br/>STAY TUNED FOR UPDATES.</p>
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
                  { icon: Calendar, title: 'MGMT', desc: 'EASY_EVENT_MANAGEMENT.', color: 'bg-white' },
                  { icon: QrCode,   title: 'SCAN',  desc: 'QUICK_QR_TICKETS.', color: 'bg-nb-green' },
                  { icon: Zap,      title: 'LIVE',  desc: 'REALTIME_SYNCING.', color: 'bg-nb-purple text-white' },
                  { icon: Shield,   title: 'GUARD', desc: 'SECURE_AND_FAST.', color: 'bg-nb-pink text-white' },
                ].map((f, i) => (
                  <motion.div key={i} whileHover={{ y: -15, rotate: i % 2 === 0 ? 2 : -2 }} 
                    className={`nb p-10 ${f.color} border-4 shadow-[10px_10px_0_#000000] transition-all`}>
                    <div className="nb border-4 border-black bg-white text-black w-20 h-20 flex items-center justify-center mb-8 shadow-[6px_6px_0_#000000] -rotate-2">
                      <f.icon className="w-10 h-10 stroke-[3px]" />
                    </div>
                    <h3 className="font-display font-black text-3xl mb-4 uppercase italic leading-none tracking-tighter underline decoration-black/10 underline-offset-4">{f.title}</h3>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 leading-tight italic">{f.desc}</p>
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
