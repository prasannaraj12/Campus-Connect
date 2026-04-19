import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import EventCard from '../components/EventCard'
import CreateEventDialog from '../components/CreateEventDialog'
import CreateAnnouncementDialog from '../components/CreateAnnouncementDialog'
import AnnouncementCard from '../components/AnnouncementCard'
import QRScanner from '../components/QRScanner'
import RecommendedEvents from '../components/RecommendedEvents'
import { SkeletonDashboard } from '../components/Skeleton'
import AppShell from '../components/AppShell'
import {
  Plus, Calendar, Users, TrendingUp, QrCode,
  Megaphone, BarChart3, History, Search, ChevronDown, LogOut, Zap
} from 'lucide-react'
import { Brainbox, GhostBlob, HappyDog, NBStar } from '../components/Mascots'

const categories = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Social', 'Hackathon']

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All'])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const eventsRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const events = useQuery(api.events.getAllEvents)
  const myEvents = useQuery(
    api.events.getEventsByOrganizer,
    user?.role === 'organizer' && user?.userId ? { organizerId: user.userId } : 'skip'
  )
  const myRegistrations = useQuery(
    api.registrations.myRegistrations,
    user?.userId ? { userId: user.userId } : 'skip'
  )
  const myAttendanceCount = useQuery(
    api.registrations.getMyAttendanceCount,
    user?.role === 'participant' && user?.userId ? { userId: user.userId } : 'skip'
  )
  const myAnnouncements = useQuery(
    api.announcements.getOrganizerAnnouncements,
    user?.role === 'organizer' && user?.userId ? { organizerId: user.userId } : 'skip'
  )
  const generalAnnouncements = useQuery(
    api.announcements.getGeneralAnnouncements,
    user?.role === 'participant' ? {} : 'skip'
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node))
        setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) { navigate('/role-selection'); return null }

  if (events === undefined) {
    return (
      <div className="min-h-screen bg-nb-cream">
        <div className="h-16 bg-white border-b-4 border-black mb-10" />
        <div className="max-w-6xl mx-auto px-4"><SkeletonDashboard /></div>
      </div>
    )
  }

  const toggleCategory = (category: string) => {
    if (category === 'All') { setSelectedCategories(['All']); return }
    let next = selectedCategories.filter(c => c !== 'All')
    if (next.includes(category)) {
      next = next.filter(c => c !== category)
      if (next.length === 0) next = ['All']
    } else { next.push(category) }
    setSelectedCategories(next)
  }

  const filteredEvents = events?.filter((event: any) => {
    const matchCat = selectedCategories.includes('All') || selectedCategories.includes(event.category)
    const matchSearch = !searchQuery.trim() ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  }) || []

  const handleLogout = () => { logout(); navigate('/') }
  const scrollToEvents = () => eventsRef.current?.scrollIntoView({ behavior: 'smooth' })

  const userName = user.name?.split(' ')[0] || (user.role === 'organizer' ? 'Organizer' : 'Participant')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING'

  // Stats config
  const organizerStats = [
    { label: 'Events Created', value: myEvents?.length || 0, sub: `${myEvents?.filter((e: any) => new Date(e.date) >= new Date()).length || 0} upcoming`, icon: Calendar, bg: 'bg-nb-yellow' },
    { label: 'Total Events', value: events?.length || 0, sub: 'Click to browse', icon: Users, bg: 'bg-white', onClick: scrollToEvents },
    { label: 'Upcoming', value: myEvents?.filter((e: any) => new Date(e.date) >= new Date()).length || 0, sub: "You're organizing", icon: TrendingUp, bg: 'bg-nb-purple text-white' },
  ]
  const participantStats = [
    { label: 'Registered', value: myRegistrations?.length || 0, sub: 'Events signed up', icon: Calendar, bg: 'bg-nb-yellow' },
    { label: 'Available', value: events?.length || 0, sub: 'Open now', icon: Users, bg: 'bg-nb-green', onClick: scrollToEvents },
    { label: 'Attended', value: myAttendanceCount || 0, sub: myAttendanceCount === 0 ? 'Attend your first!' : 'Great work!', icon: TrendingUp, bg: 'bg-nb-pink text-white' },
  ]
  const stats = user.role === 'organizer' ? organizerStats : participantStats

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 relative">
        {/* Decorative Mascots - Fixed positioning to avoid text overlap */}
        {user.role === 'organizer' ? (
          <Brainbox className="absolute top-10 right-[-10%] w-64 h-64 opacity-5 pointer-events-none hidden xl:block" />
        ) : (
          <HappyDog className="absolute top-10 right-[-10%] w-64 h-64 opacity-5 pointer-events-none hidden xl:block" />
        )}
        <GhostBlob className="absolute bottom-20 left-[-15%] w-80 h-80 opacity-5 pointer-events-none hidden xl:block rotate-12" />

        {/* ── Welcome Banner ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="nb bg-nb-purple text-white p-10 flex flex-col md:flex-row items-center justify-between border-4 shadow-[15px_15px_0_#000000] relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] opacity-20 pointer-events-none"><Zap className="w-48 h-48" /></div>
          <div className="relative z-10">
            <p className="text-nb-yellow font-black text-[12px] uppercase tracking-[0.5em] mb-4 drop-shadow-[2px_2px_0_#000000] underline decoration-4 underline-offset-8 decoration-white/20">{greeting}</p>
            <h2 className="font-display text-6xl font-black text-white italic tracking-tighter uppercase leading-none">HELLO {userName} 👋</h2>
            <p className="text-white/60 text-sm font-black mt-4 uppercase tracking-[0.2em] italic">
              {user.role === 'organizer' ? 'CREATE EVENTS. MANAGE SIGNUPS. TRACK PROGRESS.' : "BROWSE THE LATEST CAMPUS EVENTS."}
            </p>
          </div>
          {user.role === 'participant' && (
            <button
              onClick={() => navigate('/my-history')}
              className="mt-10 md:mt-0 relative z-10 flex items-center gap-4 nb bg-nb-yellow text-black px-10 py-4 text-xs font-black uppercase tracking-[0.3em] border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all italic border-black"
            >
              <History className="w-6 h-6 stroke-[3px]" /> VIEW HISTORY
            </button>
          )}
        </motion.div>

        {/* ── Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={s.onClick}
              className={`nb ${s.bg} p-8 border-4 shadow-[10px_10px_0_#000000] group ${s.onClick ? 'cursor-pointer hover:rotate-1' : ''} transition-all`}
            >
              <div className="bg-white border-2 border-black w-14 h-14 flex items-center justify-center mb-6 shadow-[6px_6px_0_#000000] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                <s.icon className="w-8 h-8 text-black stroke-[3px]" />
              </div>
              <p className="text-6xl font-black font-display italic tracking-tighter leading-none">{s.value}</p>
              <p className="text-[14px] font-black uppercase tracking-[0.4em] mt-3 opacity-80 italic underline decoration-black/10 underline-offset-4">{s.label}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1 italic">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Organizer Actions ────────────────────────────────────── */}
        {user.role === 'organizer' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'NEW EVENT', icon: Plus, bg: 'bg-nb-yellow', action: () => setShowCreateDialog(true) },
              { label: 'SEND NOTIFICATION', icon: Megaphone, bg: 'bg-nb-green', action: () => setShowAnnouncementDialog(true) },
              { label: 'SCAN QR CODE', icon: QrCode, bg: 'bg-nb-pink text-white', action: () => setShowQRScanner(true) },
              { label: 'VIEW ANALYTICS', icon: BarChart3, bg: 'bg-white', action: () => navigate('/analytics') },
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ y: -8, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={btn.action}
                className={`nb ${btn.bg} p-8 text-[12px] font-black uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-6 border-4 shadow-[10px_10px_0_#000000] hover:shadow-[4px_4px_0_#000000] transition-all italic`}
              >
                <div className="bg-white border-3 border-black p-3 shadow-[4px_4px_0_#000000] rotate-3">
                  <btn.icon className="w-8 h-8 text-black stroke-[3px]" />
                </div>
                {btn.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Search + Filter ──────────────────────────────────────── */}
        <div className="space-y-8 bg-white p-8 nb border-4 border-black">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-black/20 group-focus-within:text-nb-purple transition-all" />
            <input
              type="text"
              placeholder="SEARCH FOR EVENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nb-input w-full pl-20 pr-6 py-6 text-xl uppercase font-black border-4 shadow-[10px_10px_0_#000000] focus:shadow-none focus:translate-x-1.5 focus:translate-y-1.5 transition-all italic border-black"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => {
              const isActive = selectedCategories.includes(cat) || (cat === 'All' && selectedCategories.includes('All'))
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`nb border-4 px-6 py-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all italic ${isActive
                    ? 'bg-nb-purple text-white border-black shadow-[6px_6px_0_#000000]'
                    : 'bg-white text-black border-black/20 hover:border-black hover:bg-nb-yellow'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Events Grid ──────────────────────────────────────────── */}
        <div ref={eventsRef} className="pt-8">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="font-display text-5xl font-black text-black italic tracking-tighter uppercase leading-none underline decoration-nb-pink decoration-8 underline-offset-8">EVENT DISCOVERY</h2>
            <div className="h-2 flex-1 bg-black/10" />
          </div>

          {filteredEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="nb bg-white p-24 text-center border-4 shadow-[15px_15px_0_#000000] rotate-[-1deg]">
              <div className="w-24 h-24 bg-nb-yellow border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0_#000000] rotate-3">
                <Calendar className="w-12 h-12 text-black stroke-[3px]" />
              </div>
              <h3 className="font-display text-4xl font-black mb-4 uppercase italic tracking-tighter">NO EVENTS FOUND</h3>
              <p className="text-black/40 text-sm font-black uppercase tracking-[0.3em] mb-12 italic leading-tight">
                {selectedCategories.includes('All') && !searchQuery
                  ? 'THE LIST IS EMPTY. CHECK BACK SOON.'
                  : searchQuery ? `NO RESULTS MATCH: "${searchQuery}".`
                  : `NO ${selectedCategories.join(' OR ')} EVENTS CURRENTLY ACTIVE.`}
              </p>
              {(!selectedCategories.includes('All') || searchQuery) && (
                <button onClick={() => { setSelectedCategories(['All']); setSearchQuery('') }}
                  className="nb bg-nb-purple text-white px-12 py-5 text-sm font-black uppercase tracking-[0.4em] border-4 shadow-[8px_8px_0_#000000] hover:bg-nb-yellow hover:text-black transition-all italic">
                  RESET FILTERS
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <AnimatePresence>
                {filteredEvents.map((event: any) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Announcements ────────────────────────────────────────── */}
        <div className="pt-16 border-t-8 border-black">
          {user.role === 'organizer' && (
            <div className="space-y-8">
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter italic flex items-center gap-6">
                <div className="bg-nb-green p-3 nb border-4 border-black shadow-[6px_6px_0_#000000] -rotate-3">
                  <Megaphone className="w-8 h-8 text-black stroke-[3px]" />
                </div>
                MY ANNOUNCEMENTS
              </h2>
              {!myAnnouncements ? (
                <div className="nb bg-nb-paper/20 h-32 animate-pulse border-4 border-black/10" />
              ) : myAnnouncements.length === 0 ? (
                <div className="nb bg-white p-12 text-center border-4 shadow-[8px_8px_0_#000000] rotate-1">
                  <Megaphone className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-black/30 italic">NO ANNOUNCEMENTS FOUND. SEND YOUR FIRST NOTIFICATION.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {myAnnouncements.map((a) => (
                    <AnnouncementCard key={a._id} announcement={a} showDelete organizerId={user.userId as any} />
                  ))}
                </div>
              )}
            </div>
          )}

          {user.role === 'participant' && generalAnnouncements && generalAnnouncements.length > 0 && (
            <div className="space-y-8">
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter italic flex items-center gap-6">
                <div className="bg-nb-pink p-3 nb border-4 border-black shadow-[6px_6px_0_#000000] rotate-[-2deg]">
                  <Megaphone className="w-8 h-8 text-white stroke-[3px]" />
                </div>
                LATEST UPDATES
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {generalAnnouncements.slice(0, 6).map((a) => (
                  <AnnouncementCard key={a._id} announcement={a} showDelete={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      {showCreateDialog && user.userId && (
        <CreateEventDialog organizerId={user.userId} onClose={() => setShowCreateDialog(false)} />
      )}
      {showAnnouncementDialog && user.userId && (
        <CreateAnnouncementDialog organizerId={user.userId} onClose={() => setShowAnnouncementDialog(false)} />
      )}
      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </AppShell>
  )
}
