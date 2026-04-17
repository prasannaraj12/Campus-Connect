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
import {
  Plus, Calendar, Users, TrendingUp, QrCode,
  Megaphone, BarChart3, History, Search, ChevronDown, LogOut
} from 'lucide-react'

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
        <div className="h-14 glass border-b-2 border-black mb-6" />
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
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Stats config
  const organizerStats = [
    { label: 'Events Created', value: myEvents?.length || 0, sub: `${myEvents?.filter((e: any) => new Date(e.date) >= new Date()).length || 0} upcoming`, icon: Calendar, bg: 'bg-nb-yellow' },
    { label: 'Total Events', value: events?.length || 0, sub: 'Click to browse', icon: Users, bg: 'bg-white', onClick: scrollToEvents },
    { label: 'Upcoming', value: myEvents?.filter((e: any) => new Date(e.date) >= new Date()).length || 0, sub: "You're organizing", icon: TrendingUp, bg: 'bg-nb-orange text-white' },
  ]
  const participantStats = [
    { label: 'Registered', value: myRegistrations?.length || 0, sub: 'Events signed up', icon: Calendar, bg: 'bg-nb-yellow' },
    { label: 'Available', value: events?.length || 0, sub: 'Open now', icon: Users, bg: 'bg-white', onClick: scrollToEvents },
    { label: 'Attended', value: myAttendanceCount || 0, sub: myAttendanceCount === 0 ? 'Attend your first!' : 'Great work!', icon: TrendingUp, bg: 'bg-nb-black text-white' },
  ]
  const stats = user.role === 'organizer' ? organizerStats : participantStats

  return (
    <div className="min-h-screen bg-nb-cream">

      {/* ── Glassmorphism Navbar ─────────────────────────────────── */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-xl text-nb-black tracking-tight"
          >
            Campus<span className="text-nb-orange">Connect</span>
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1.5 nb-sm bg-white nb-hover"
            >
              <div className="w-7 h-7 bg-nb-yellow border-2 border-black flex items-center justify-center font-bold text-xs text-black">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-sm hidden sm:block">{userName}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-52 bg-white nb border-black overflow-hidden z-50"
                >
                  <div className="px-4 py-3 bg-nb-yellow border-b-2 border-black">
                    <p className="font-bold text-sm text-black">{user.name || userName}</p>
                    <p className="text-xs text-black/60 capitalize font-medium">{user.role}</p>
                  </div>
                  <div className="py-1">
                    {user.role === 'organizer' && (
                      <button onClick={() => { navigate('/analytics'); setShowProfileMenu(false) }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-nb-yellow/30 flex items-center gap-2 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Analytics
                      </button>
                    )}
                    {user.role === 'participant' && (
                      <button onClick={() => { navigate('/my-history'); setShowProfileMenu(false) }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-nb-yellow/30 flex items-center gap-2 transition-colors">
                        <History className="w-4 h-4" /> My History
                      </button>
                    )}
                  </div>
                  <div className="border-t-2 border-black">
                    <button onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── Welcome Banner ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="nb-lg bg-nb-black text-white p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-nb-yellow font-bold text-xs uppercase tracking-widest mb-1">{greeting}</p>
            <h2 className="font-display text-2xl font-bold text-white">{userName} 👋</h2>
            <p className="text-white/50 text-sm mt-1">
              {user.role === 'organizer' ? 'Manage your events and track registrations' : "Here's what's happening on campus"}
            </p>
          </div>
          {user.role === 'participant' && (
            <button
              onClick={() => navigate('/my-history')}
              className="hidden sm:flex items-center gap-2 nb-btn bg-nb-yellow text-black px-4 py-2 text-sm"
            >
              <History className="w-4 h-4" /> My History
            </button>
          )}
        </motion.div>

        {/* ── Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={s.onClick}
              className={`nb ${s.bg} p-4 ${s.onClick ? 'cursor-pointer nb-hover' : ''}`}
            >
              <s.icon className="w-5 h-5 mb-3 opacity-70" />
              <p className="text-3xl font-bold font-display">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wide mt-1 opacity-80">{s.label}</p>
              <p className="text-xs opacity-50 mt-0.5">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile history button */}
        {user.role === 'participant' && (
          <div className="flex sm:hidden">
            <button onClick={() => navigate('/my-history')}
              className="nb-btn bg-nb-yellow text-black px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <History className="w-4 h-4" /> My History
            </button>
          </div>
        )}

        {/* ── AI Recommendations ───────────────────────────────────── */}
        {user.role === 'participant' && user.userId && (
          <RecommendedEvents userId={user.userId} />
        )}

        {/* ── Organizer Actions ────────────────────────────────────── */}
        {user.role === 'organizer' && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Create Event', icon: Plus, bg: 'bg-nb-yellow', action: () => setShowCreateDialog(true) },
              { label: 'Announcement', icon: Megaphone, bg: 'bg-nb-orange text-white', action: () => setShowAnnouncementDialog(true) },
              { label: 'Scan QR', icon: QrCode, bg: 'bg-nb-black text-white', action: () => setShowQRScanner(true) },
              { label: 'Analytics', icon: BarChart3, bg: 'bg-white', action: () => navigate('/analytics') },
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileTap={{ scale: 0.97 }}
                onClick={btn.action}
                className={`nb-btn ${btn.bg} px-4 py-2.5 text-sm inline-flex items-center gap-2`}
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Search + Filter ──────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="Search events by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nb-input w-full pl-10 pr-4 py-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategories.includes(cat) || (cat === 'All' && selectedCategories.includes('All'))
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`nb-tag transition-all ${isActive
                    ? 'bg-nb-black text-white'
                    : 'bg-white text-black hover:bg-nb-yellow'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Events Grid ──────────────────────────────────────────── */}
        <div ref={eventsRef}>
          {filteredEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="nb bg-white p-12 text-center">
              <div className="w-14 h-14 bg-nb-yellow nb-sm flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-black" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">No Events Found</h3>
              <p className="text-black/50 text-sm mb-5">
                {selectedCategories.includes('All') && !searchQuery
                  ? 'No events available yet. Check back soon!'
                  : searchQuery ? `No events match "${searchQuery}".`
                  : `No ${selectedCategories.join(' or ')} events right now.`}
              </p>
              {(!selectedCategories.includes('All') || searchQuery) && (
                <button onClick={() => { setSelectedCategories(['All']); setSearchQuery('') }}
                  className="nb-btn bg-nb-black text-white px-5 py-2 text-sm">
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredEvents.map((event: any) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Announcements ────────────────────────────────────────── */}
        {user.role === 'organizer' && (
          <div>
            <h2 className="font-display font-bold text-base uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-nb-yellow border-2 border-black inline-block" />
              Your Announcements
            </h2>
            {!myAnnouncements ? (
              <div className="nb bg-nb-paper h-20 animate-pulse" />
            ) : myAnnouncements.length === 0 ? (
              <div className="nb bg-white p-6 text-center">
                <Megaphone className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold text-black/40">No announcements yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {myAnnouncements.map((a) => (
                  <AnnouncementCard key={a._id} announcement={a} showDelete organizerId={user.userId as any} />
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'participant' && generalAnnouncements && generalAnnouncements.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-base uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-nb-yellow border-2 border-black inline-block" />
              Announcements
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {generalAnnouncements.slice(0, 4).map((a) => (
                <AnnouncementCard key={a._id} announcement={a} showDelete={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      {showCreateDialog && user.userId && (
        <CreateEventDialog organizerId={user.userId} onClose={() => setShowCreateDialog(false)} />
      )}
      {showAnnouncementDialog && user.userId && (
        <CreateAnnouncementDialog organizerId={user.userId} onClose={() => setShowAnnouncementDialog(false)} />
      )}
      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </div>
  )
}
