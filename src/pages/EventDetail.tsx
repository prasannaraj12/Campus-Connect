import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, QrCode, Clock, AlertCircle, CheckCircle, Play, FileText, Ticket } from 'lucide-react'
import EventInfo from '../components/event-detail/EventInfo'
import EventSidebar from '../components/event-detail/EventSidebar'
import AnnouncementCard from '../components/AnnouncementCard'
import SimilarEvents from '../components/SimilarEvents'
import EventCommunity from '../components/EventCommunity'
import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'

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

  const registrations = useQuery(
    api.registrations.getEventRegistrations,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
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

  const attendance = useQuery(
    api.registrations.getEventAttendance,
    eventId ? { eventId: eventId as Id<"events"> } : 'skip'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading event...</p>
        </div>
      </div>
    )
  }

  const isOrganizer = user?.role === 'organizer'
  const participantCount = registrations?.length || 0
  const attendanceCount = attendance?.length || 0

  // Event status calculation
  const eventDateTime = new Date(`${event.date}T${event.time}`)
  const now = new Date()
  const isLive = now >= eventDateTime && now <= new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000) // 3 hour window
  const isEnded = now > new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000)
  const isToday = timeLeft.days === 0 && !isLive && !isEnded
  const isSoon = timeLeft.days <= 1 && !isToday && !isLive && !isEnded

  // Status info for organizers
  const getEventStatus = () => {
    if (isEnded) return { color: 'bg-gray-500', text: 'Event Ended', action: 'Export Report', icon: FileText }
    if (isLive) return { color: 'bg-red-500', text: 'Live Now', action: 'Manage Attendance', icon: Play }
    if (isToday) return { color: 'bg-yellow-500', text: 'Starting Soon', action: 'Prepare Check-in', icon: AlertCircle }
    if (isSoon) return { color: 'bg-orange-500', text: `${timeLeft.days}d ${timeLeft.hours}h left`, action: 'Send Reminder', icon: Clock }
    return { color: 'bg-green-500', text: `${timeLeft.days} days left`, action: 'Review Details', icon: CheckCircle }
  }

  const status = getEventStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Organizer Banner */}
      {isOrganizer && (
        <div className="bg-gray-900 text-white py-2">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span className="font-semibold">Organizer View</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300">You are managing this event</span>
            </div>
            <div className={`${status.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
              <status.icon className="w-3 h-3" />
              {status.text}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="bg-white rounded-xl px-4 py-2 font-semibold mb-6 inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Organizer Command Center */}
        {isOrganizer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Status & Countdown */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Status</p>
                  <div className={`${status.color} text-white px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2`}>
                    <status.icon className="w-5 h-5" />
                    {status.text}
                  </div>
                </div>

                {!isEnded && (
                  <div className="flex gap-3">
                    {[
                      { label: 'D', value: timeLeft.days },
                      { label: 'H', value: timeLeft.hours },
                      { label: 'M', value: timeLeft.minutes },
                      { label: 'S', value: timeLeft.seconds },
                    ].map((unit) => (
                      <div key={unit.label} className="text-center">
                        <div className="bg-gray-100 rounded-lg px-3 py-2 font-mono font-bold text-xl">
                          {unit.value.toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{unit.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-black text-blue-600">{participantCount}</p>
                  <p className="text-xs text-gray-600">Registered</p>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                  <p className="text-2xl font-black text-green-600">{attendanceCount}</p>
                  <p className="text-xs text-gray-600">Present</p>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQRCheckIn(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <QrCode className="w-5 h-5" />
                  QR Check-In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/edit-event/${event._id}`)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-200 transition-all"
                >
                  Edit Event
                </motion.button>
              </div>
            </div>

            {/* Action Hint */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Suggested:</span> {status.action}
              </p>
            </div>
          </motion.div>
        )}

        {/* Event Announcements */}
        {eventAnnouncements && eventAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-xl font-black mb-4">Event Announcements</h2>
            <div className="space-y-3">
              {eventAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EventInfo
              event={event}
              organizer={organizer}
              participantCount={participantCount}
              isOrganizer={Boolean(isOrganizer)}
              isRegistered={Boolean(myRegistration)}
              onRegisterClick={() => setShowRegistrationDialog(true)}
            />
          </div>

          <div>
            <EventSidebar
              event={event}
              isOrganizer={Boolean(isOrganizer)}
              myRegistration={myRegistration}
              registrations={registrations || []}
              participantCount={participantCount}
              showRegistrationDialog={showRegistrationDialog}
              setShowRegistrationDialog={setShowRegistrationDialog}
            />
          </div>
        </div>

        {/* Community Section - Discussions, Q&A, Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h2 className="text-2xl font-black mb-4">Community</h2>
          <EventCommunity eventId={event._id} />
        </motion.div>

        {/* Similar Events Section */}
        <SimilarEvents eventId={event._id} />
      </div>

      {/* QR Check-In Modal */}
      {showQRCheckIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black mb-2">QR Check-In Station</h2>
              <p className="text-gray-500 mb-6">Scan this QR or show to participants</p>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block mb-6">
                <QRCode
                  value={`${window.location.origin}/event/${event._id}`}
                  size={200}
                />
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">Live Attendance</p>
                <p className="text-3xl font-black text-green-600">{attendanceCount} / {participantCount}</p>
              </div>

              <button
                onClick={() => setShowQRCheckIn(false)}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold w-full"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Fixed Bottom CTA - Only for Participants */}
      {!isOrganizer && user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-lg">
          <div className="container mx-auto">
            {myRegistration ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">Registered</p>
                    <p className="text-xs text-gray-500">Code: {myRegistration.registrationCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/ticket/${myRegistration._id}`)}
                  className="px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-xl shadow-sm"
                >
                  View Ticket
                </button>
              </div>
            ) : participantCount >= event.maxParticipants ? (
              <div className="text-center py-2">
                <p className="font-bold text-gray-500">Event Full</p>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRegistrationDialog(true)}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                Register Now
                {participantCount >= event.maxParticipants * 0.7 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {event.maxParticipants - participantCount} spots left
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Add padding at bottom for mobile fixed bar */}
      {!isOrganizer && user && <div className="h-24 lg:hidden" />}
    </div>
  )
}
