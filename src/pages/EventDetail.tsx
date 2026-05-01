import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, QrCode, Clock, AlertCircle, CheckCircle, Play, FileText, Ticket, X } from 'lucide-react'
import EventInfo from '../components/event-detail/EventInfo'
import EventSidebar from '../components/event-detail/EventSidebar'
import AnnouncementCard from '../components/AnnouncementCard'
import SimilarEvents from '../components/SimilarEvents'
import EventCommunity from '../components/EventCommunity'
import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { PageLoader } from '../components/Skeleton'
import AppShell from '../components/AppShell'
import { GhostBlob } from '../components/Mascots'

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showQRCheckIn, setShowQRCheckIn] = useState(false)
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const event = useQuery(
    api.events.getEventById,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
  )

  const registrationCount = useQuery(
    api.registrations.getRegistrationCount,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
  )
  const registrations = useQuery(
    api.registrations.getEventRegistrations,
    eventId && user?.role === 'organizer' && user.userId ? { eventId: eventId as Id<"events">, userId: user.userId } : 'skip'
  )

  const myRegistration = useQuery(
    api.registrations.isRegistered,
    eventId && user?.userId ? {
      eventId: eventId as Id<"events">,
      userId: user.userId
    } : 'skip'
  )

  const organizer = useQuery(
    api.users.getUser,
    event ? { userId: event.organizerId } : 'skip'
  )

  const eventAnnouncements = useQuery(
    api.announcements.getEventAnnouncements,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
  )

  const attendanceCount = useQuery(
    api.registrations.getAttendanceCount,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
  )
  const attendance = useQuery(
    api.registrations.getEventAttendance,
    eventId && user?.role === 'organizer' && user.userId ? { eventId: eventId as Id<"events">, userId: user.userId } : 'skip'
  )

  // Countdown timer
  useEffect(() => {
    if (!event) return

    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${event.date}T${event.time}`)
      const now = new Date()
      const difference = eventDateTime.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [event])

  if (!event) {
    return (
      <div className="min-h-screen bg-nb-cream flex items-center justify-center">
        <PageLoader message="Summoning event details..." />
      </div>
    )
  }

  const isOrganizer = user?.role === 'organizer'
  const participantCount = registrationCount ?? (registrations?.length || 0)
  const presentCount = attendanceCount ?? (attendance?.length || 0)

  // Event status calculation
  const eventDateTime = new Date(`${event.date}T${event.time}`)
  const now = new Date()
  const isLive = now >= eventDateTime && now <= new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000)
  const isEnded = now > new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000)
  const isToday = timeLeft.days === 0 && !isLive && !isEnded
  const isSoon = timeLeft.days <= 1 && !isToday && !isLive && !isEnded

  const getEventStatus = () => {
    if (isEnded) return { color: 'bg-nb-black text-white', text: 'EVENT ENDED', action: 'EXPORT FINAL REPORT', icon: FileText }
    if (isLive) return { color: 'bg-nb-orange text-white', text: 'LIVE SESSION', action: 'MANAGE ATTENDANCE', icon: Play }
    if (isToday) return { color: 'bg-nb-yellow text-black', text: 'STARTING TODAY', action: 'PREPARE CHECK-IN', icon: AlertCircle }
    if (isSoon) return { color: 'bg-nb-yellow text-black', text: `${timeLeft.days}D ${timeLeft.hours}H LEFT`, action: 'SEND ALERT', icon: Clock }
    if (isLive) return { color: 'bg-nb-green text-black', text: 'LIVE SESSION', action: 'MANAGE ATTENDANCE', icon: Play }
    if (isToday) return { color: 'bg-nb-purple text-white', text: 'STARTING TODAY', action: 'PREPARE CHECK-IN', icon: AlertCircle }
    if (isSoon) return { color: 'bg-nb-purple text-white', text: `${timeLeft.days}D ${timeLeft.hours}H LEFT`, action: 'SEND ALERT', icon: Clock }
    return { color: 'bg-nb-black text-white', text: `${timeLeft.days} DAYS LEFT`, action: 'SYNC DETAILS', icon: CheckCircle }
  }

  const status = getEventStatus()

  return (
    <AppShell className="grid-bg">
      {/* ── Organizer Status Bar ──────────────────────────── */}
      <AnimatePresence>
        {isOrganizer && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/90 backdrop-blur-sm text-white sticky top-[3.5rem] z-[40] border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-nb-yellow animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">Organizer Access</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold ${status.color}`}>
                <status.icon className="w-3.5 h-3.5" />
                {status.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── Navigation ─────────────────────────────────────── */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-black/20
                       text-sm font-semibold shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                       hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                       active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_rgba(0,0,0,0.6)]
                       transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* ── Command Center (Organizer Only) ────────────────── */}
        {isOrganizer && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-xl border border-black/15 bg-white/80 backdrop-blur-sm
                       shadow-[4px_4px_0_rgba(0,0,0,0.75)] overflow-hidden"
          >
            {/* Grid layout: left = status+timer, right = stats+actions */}
            <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-black/10">

              {/* ── Left: Status + Timer ─────────────────────── */}
              <div className="p-6 space-y-5">
                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2">
                    Registration Status
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                                   border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)] ${status.color}`}>
                    <status.icon className="w-4 h-4" />
                    {status.text}
                  </div>
                </div>

                {/* Timer */}
                {!isEnded && (
                  <div>
                    <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">
                      Time Remaining
                    </p>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'D', value: timeLeft.days },
                        { label: 'H', value: timeLeft.hours },
                        { label: 'M', value: timeLeft.minutes },
                        { label: 'S', value: timeLeft.seconds },
                      ].map((unit, i) => (
                        <div key={unit.label} className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-lg bg-nb-yellow/80 border border-black/25
                                            shadow-[2px_2px_0_rgba(0,0,0,0.6)]
                                            flex items-center justify-center
                                            font-display font-black text-xl text-black">
                              {unit.value.toString().padStart(2, '0')}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 mt-1">
                              {unit.label}
                            </p>
                          </div>
                          {i < 3 && <span className="text-black/30 font-bold text-lg mb-4">:</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Stats + Actions ───────────────────── */}
              <div className="p-6 space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-nb-cream border border-black/15
                                  shadow-[2px_2px_0_rgba(0,0,0,0.6)] p-4 text-center">
                    <p className="text-3xl font-black text-black leading-none">{participantCount}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 mt-1">
                      Registered
                    </p>
                  </div>
                  <div className="rounded-lg bg-nb-green border border-black/15
                                  shadow-[2px_2px_0_rgba(0,0,0,0.6)] p-4 text-center">
                    <p className="text-3xl font-black text-black leading-none">{presentCount}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 mt-1">
                      Present
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Primary */}
                  <button
                    onClick={() => setShowQRCheckIn(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                               rounded-lg bg-nb-pink text-white text-sm font-bold
                               border border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                               hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:-translate-x-px hover:-translate-y-px
                               active:shadow-[1px_1px_0_rgba(0,0,0,0.7)] active:translate-x-px active:translate-y-px
                               transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Check-in QR
                  </button>
                  {/* Secondary */}
                  <button
                    onClick={() => navigate(`/edit-event/${event._id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                               rounded-lg bg-black text-white text-sm font-bold
                               border border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.5)]
                               hover:shadow-[4px_4px_0_rgba(0,0,0,0.7)] hover:-translate-x-px hover:-translate-y-px
                               active:shadow-[1px_1px_0_rgba(0,0,0,0.4)] active:translate-x-px active:translate-y-px
                               transition-all opacity-85 hover:opacity-100"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Event
                  </button>
                </div>
              </div>
            </div>

            {/* Notice footer */}
            <div className="px-6 py-3 bg-black/3 border-t border-black/8 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                Recommended:
              </span>
              <span className="text-xs font-semibold text-black/60">
                {status.action}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Main Layout Engine ──────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20 items-start">
          <div className="lg:col-span-8 space-y-20">
            {/* Event Header Infusion */}
            <div className="space-y-8 relative">
               <GhostBlob 
                className="absolute top-[-40px] right-0 w-32 h-32 opacity-15 hidden xl:block pointer-events-none"
              />
              <div className="flex items-center gap-6">
                <span className="nb bg-nb-pink text-white text-xs font-black tracking-[0.3em] px-6 py-2 border-3 border-black shadow-[4px_4px_0_#000000] uppercase italic">{event.category}</span>
                <span className="text-[12px] font-black text-black/30 uppercase tracking-[0.5em] italic shrink-0">CODE: {eventId?.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="font-display text-6xl sm:text-8xl xl:text-9xl font-black text-black uppercase tracking-tighter leading-[0.8] border-l-[16px] border-nb-yellow pl-10 py-4 drop-shadow-[8px_8px_0_#7400E8]">
                {event.title}
              </h1>
            </div>

            {/* Announcement Feed */}
            {eventAnnouncements && eventAnnouncements.length > 0 && (
              <section className="nb bg-white p-10 border-4 border-black shadow-[15px_15px_0_#00FF75]">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 nb bg-nb-green text-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0_#000000]">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">ANNOUNCEMENTS</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">FROM THE ORGANIZER</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {eventAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement._id} announcement={announcement} />
                  ))}
                </div>
              </section>
            )}

            <EventInfo
              event={event}
              organizer={organizer}
              participantCount={participantCount}
              isOrganizer={Boolean(isOrganizer)}
              isRegistered={Boolean(myRegistration)}
            />

            {/* Discussion Hub */}
            <section className="pt-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-8 border-black/5 pb-10">
                <div className="space-y-2">
                  <h2 className="font-display text-5xl font-black uppercase italic tracking-tighter">DISCUSSIONS</h2>
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30">ASK QUESTIONS · SHARE IDEAS</p>
                </div>
                <div className="nb bg-black text-nb-green text-[12px] font-black px-6 py-2 border-3 border-white -rotate-2 shadow-[4px_4px_0_#7400E8]">OPEN NOW</div>
              </div>
              <EventCommunity eventId={event._id} />
            </section>

            <SimilarEvents eventId={event._id} />
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-36 space-y-12">
            <EventSidebar
              event={event}
              isOrganizer={Boolean(isOrganizer)}
              myRegistration={myRegistration}
              registrations={registrations || []}
              participantCount={participantCount}
              showRegistrationDialog={showRegistrationDialog}
              setShowRegistrationDialog={setShowRegistrationDialog}
            />
            
            {/* Quick Tips or Meta Info */}
            <div className="nb bg-black p-8 text-white text-[12px] font-black uppercase tracking-[0.3em] leading-relaxed border-4 shadow-[10px_10px_0_#00FF75] italic">
              <span className="text-nb-yellow decoration-nb-pink underline decoration-4 underline-offset-8">QUICK REMINDER:</span> <br/><br/>
              PLEASE MAKE SURE YOU ARE LOGGED IN BEFORE TRYING TO JOIN ANY EVENT.
            </div>
          </aside>
        </div>
      </div>

      {/* ── QR Check-in Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showQRCheckIn && (
          <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                         w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
                <div>
                  <h2 className="font-display text-xl font-black uppercase tracking-tight">Check-in Station</h2>
                  <p className="text-xs text-black/40 font-medium mt-0.5">Scan to verify attendance</p>
                </div>
                <button
                  onClick={() => setShowQRCheckIn(false)}
                  className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code */}
              <div className="p-6 flex justify-center">
                <div className="p-4 bg-nb-yellow rounded-xl border border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.7)]">
                  <QRCode
                    value={`${window.location.host}/event/${event._id}`}
                    size={200}
                    level="H"
                    fgColor="#000000"
                    bgColor="transparent"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mx-6 mb-6 rounded-xl bg-nb-cream border border-black/15
                              shadow-[2px_2px_0_rgba(0,0,0,0.6)] p-4
                              flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">Present</p>
                  <p className="text-3xl font-black text-nb-pink leading-none mt-0.5">{presentCount}</p>
                </div>
                <div className="text-black/20 font-bold text-2xl">/</div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">Registered</p>
                  <p className="text-3xl font-black text-black leading-none mt-0.5">{participantCount}</p>
                </div>
              </div>

              {/* Close */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowQRCheckIn(false)}
                  className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-bold
                             border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.5)]
                             hover:bg-nb-pink transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Action Bar (Aggressive) ─────────────────────── */}
      {!isOrganizer && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] z-50 lg:hidden">
          <div className="nb bg-white border-4 border-black p-6 flex items-center justify-between gap-8 shadow-[10px_10px_0_#000000] overflow-hidden">
            {myRegistration ? (
              <div className="flex items-center justify-between w-full gap-6">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-black/40 tracking-widest underline decoration-nb-green underline-offset-4">STATUS: REGISTERED</p>
                  <p className="text-lg font-black text-black uppercase italic tracking-tighter">CODE: {myRegistration.registrationCode}</p>
                </div>
                <button
                  onClick={() => navigate(`/ticket/${myRegistration._id}`)}
                  className="nb bg-nb-yellow py-4 px-8 text-[12px] font-black uppercase border-3 border-black shadow-[4px_4px_0_#000000] italic"
                >
                  VIEW TICKET
                </button>
              </div>
            ) : participantCount >= event.maxParticipants ? (
              <div className="w-full text-center py-3 bg-black">
                <p className="text-sm font-black text-nb-yellow uppercase italic tracking-[0.2em]">EVENT IS FULL • REGISTRATION CLOSED</p>
              </div>
            ) : (
              <button
                onClick={() => setShowRegistrationDialog(true)}
                className="nb bg-nb-yellow w-full py-5 flex items-center justify-center gap-4 border-4 border-black shadow-[6px_6px_0_#7400E8] active:shadow-none transition-all"
              >
                <Ticket className="w-6 h-6 stroke-[3px]" />
                <span className="text-sm font-black uppercase tracking-[0.2em] italic">JOIN EVENT</span>
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
