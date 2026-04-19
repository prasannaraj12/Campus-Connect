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
    if (isEnded) return { color: 'bg-nb-black text-white', text: 'EVENT TERMINATED', action: 'EXPORT FINAL REPORT', icon: FileText }
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
      {/* ── Organizer Global Status ──────────────────────────── */}
      <AnimatePresence>
        {isOrganizer && (
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="bg-black text-white py-3 sticky top-[4rem] z-[40] border-b-4 border-white/20"
          >
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-nb-yellow animate-pulse border border-white" />
                <span className="text-[12px] font-black uppercase tracking-[0.4em] italic">ORGANIZER ACCESS ENABLED</span>
              </div>
              <div className={`px-4 py-1.5 nb-sm ${status.color} text-black border-white border-2 text-[10px] font-black uppercase flex items-center gap-3 italic`}>
                <status.icon className="w-4 h-4" />
                {status.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── Navigation ─────────────────────────────────────── */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="nb bg-white px-8 py-4 flex items-center gap-4 border-4 shadow-[8px_8px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-black uppercase tracking-[0.3em] italic">BACK TO DASHBOARD</span>
          </button>
        </div>

        {/* ── Command Center (Organizer Only) ────────────────── */}
        {isOrganizer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nb bg-white p-10 mb-20 border-6 border-black shadow-[20px_20px_0_#7400E8]"
          >
            <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
              <div className="flex flex-col md:flex-row items-center gap-12 w-full xl:w-auto">
                <div className="w-full md:w-auto text-center md:text-left">
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 mb-4 underline decoration-nb-purple">REGISTRATION STATUS</p>
                  <div className={`nb px-8 py-5 ${status.color} border-4 border-black flex items-center gap-4 justify-center shadow-[6px_6px_0_#000000]`}>
                    <status.icon className="w-6 h-6" />
                    <span className="text-xl font-black uppercase tracking-tight italic">{status.text}</span>
                  </div>
                </div>

                {!isEnded && (
                  <div className="w-full md:w-auto">
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30 mb-4 text-center md:text-left underline decoration-nb-green">TIME REMAINING</p>
                    <div className="flex gap-5 justify-center">
                      {[
                        { label: 'D', value: timeLeft.days },
                        { label: 'H', value: timeLeft.hours },
                        { label: 'M', value: timeLeft.minutes },
                        { label: 'S', value: timeLeft.seconds },
                      ].map((unit) => (
                        <div key={unit.label} className="text-center group">
                          <div className="nb bg-nb-yellow border-4 border-black w-16 h-16 flex items-center justify-center font-display font-black text-3xl group-hover:bg-nb-green group-hover:rotate-3 transition-all shadow-[4px_4px_0_#000000]">
                            {unit.value.toString().padStart(2, '0')}
                          </div>
                          <p className="text-[10px] font-black uppercase mt-3 tracking-widest opacity-40">{unit.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Snapshot & Controls */}
              <div className="flex flex-wrap items-center justify-center gap-8 w-full xl:w-auto">
                <div className="flex gap-6">
                  <div className="nb p-8 bg-nb-cream flex flex-col items-center min-w-[150px] border-4 shadow-[8px_8px_0_#000000] rotate-[-1deg]">
                    <p className="text-5xl font-black text-black leading-none mb-3 italic">{participantCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">TOTAL REGISTERED</p>
                  </div>
                  <div className="nb p-8 bg-nb-green flex flex-col items-center min-w-[150px] border-4 shadow-[8px_8px_0_#000000] rotate-[1deg]">
                    <p className="text-5xl font-black text-black leading-none mb-3 italic">{presentCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">PRESENT</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                  <button
                    onClick={() => setShowQRCheckIn(true)}
                    className="nb bg-nb-pink text-white px-10 py-6 flex items-center justify-center gap-4 border-4 shadow-[10px_10px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <QrCode className="w-8 h-8" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] italic">CHECK-IN QR</span>
                  </button>
                  <button
                    onClick={() => navigate(`/edit-event/${event._id}/edit`)}
                    className="nb bg-black text-white px-10 py-6 flex items-center justify-center gap-4 border-4 shadow-[10px_10px_0_#7400E8] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <Settings className="w-8 h-8" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] italic">EDIT EVENT</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t-4 border-black/10 flex items-center gap-6">
              <div className="px-4 py-1.5 bg-black text-nb-yellow text-[12px] font-black uppercase tracking-[0.3em] italic">NOTICE</div>
              <p className="text-sm font-black text-black/50 uppercase tracking-tight italic leading-relaxed">
                RECOMMENDED ACTION: <span className="text-black underline">{status.action}</span> FOR A SUCCESSFUL EVENT.
              </p>
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
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">VITAL BROADCASTS</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">PRIORITY INTEL DISPATCH</p>
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
                  <h2 className="font-display text-5xl font-black uppercase italic tracking-tighter">COMMUNITY HUB</h2>
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/30">OPEN BROADCAST CHANNEL</p>
                </div>
                <div className="nb bg-black text-nb-green text-[12px] font-black px-6 py-2 border-3 border-white -rotate-2 shadow-[4px_4px_0_#7400E8]">ACTIVE CHANNEL</div>
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

      {/* ── High Intensity Modals ───────────────────────────── */}
      <AnimatePresence>
        {showQRCheckIn && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              className="bg-white nb border-8 border-black p-12 max-w-lg w-full relative shadow-[30px_30px_0_#7400E8]"
            >
              <button 
                onClick={() => setShowQRCheckIn(false)}
                className="absolute -top-10 -right-10 nb bg-nb-pink text-white p-5 border-4 border-black hover:rotate-90 transition-transform shadow-[6px_6px_0_#000000]"
              >
                <X className="w-8 h-8 font-black" />
              </button>

              <div className="text-center space-y-10">
                <div>
                  <h2 className="font-display text-5xl font-black uppercase italic leading-[0.8] mb-4 tracking-tighter">CHECK-IN STATION</h2>
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/40 underline decoration-nb-green decoration-2 underline-offset-4">VERIFY IDENTITY CREDENTIALS</p>
                </div>

                <div className="nb bg-nb-yellow p-10 border-4 border-black inline-block shadow-[15px_15px_0_#000000] rotate-[2deg]">
                  <QRCode
                    value={`${window.location.host}/event/${event._id}`}
                    size={260}
                    level="H"
                    fgColor="#000000"
                    bgColor="transparent"
                  />
                </div>

                <div className="nb p-8 bg-nb-cream flex justify-between items-center border-4 border-black shadow-[8px_8px_0_#00FF75]">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">REAL-TIME SYNC</p>
                    <p className="text-2xl font-black uppercase italic tracking-tighter">PARTICIPANT COUNT</p>
                  </div>
                  <div className="text-right flex items-baseline gap-2">
                    <span className="text-6xl font-black text-nb-pink italic drop-shadow-[4px_4px_0_#000000]">{presentCount}</span>
                    <span className="text-2xl font-black opacity-20">/</span>
                    <span className="text-3xl font-black opacity-40 italic">{participantCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowQRCheckIn(false)}
                  className="nb bg-black text-white px-12 py-6 w-full text-base font-black uppercase tracking-[0.3em] border-4 shadow-[10px_10px_0_#7400E8] hover:bg-nb-pink hover:shadow-none transition-all italic"
                >
                  CLOSE STATION
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Action Bar (Aggressive) ─────────────────────── */}
      {!isOrganizer && user && (
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
                <p className="text-sm font-black text-nb-yellow uppercase italic tracking-[0.2em]">SQUAD CAPACITY REACHED • LOCKOUT</p>
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
