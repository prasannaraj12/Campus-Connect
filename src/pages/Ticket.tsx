import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { Check, X, Award } from 'lucide-react'
import Certificate from '../components/Certificate'

export default function Ticket() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const markAttendance = useMutation(api.registrations.markAttendance)

  // Check if it's a code or ID
  const isCode = registrationId?.includes('REG-') || (registrationId && registrationId.length <= 10);

  // Fetch registration details by ID or code
  const registrationById = useQuery(
    api.registrations.getRegistrationById,
    !isCode && registrationId ? { registrationId: registrationId as Id<"registrations"> } : "skip"
  )

  const registrationByCode = useQuery(
    api.registrations.getRegistrationByCode,
    isCode && registrationId ? { code: registrationId.toUpperCase() } : "skip"
  )

  const registration = isCode ? registrationByCode : registrationById;

  // Fetch attendance status
  const attendance = useQuery(
    api.registrations.getAttendance,
    registration?._id ? { registrationId: registration._id } : "skip"
  )

  useEffect(() => {
    // 🔵 ORGANIZER SCAN: Auto-mark attendance
    if (user?.role === "organizer" && registration?._id && !processing && !result) {
      handleOrganizerScan()
    }
  }, [user, registration])

  const handleOrganizerScan = async () => {
    if (!user?.userId || !registration?._id) return

    setProcessing(true)
    try {
      const response = await markAttendance({
        registrationId: registration._id,
        organizerId: user.userId,
      })

      setResult(response)
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed to mark attendance"
      })
    } finally {
      setProcessing(false)
    }
  }

  // 🟢 PARTICIPANT VIEW: Show ticket details only
  if (!user || user.role === "participant") {
    const handleDownloadTicket = async () => {
      const ticketElement = document.getElementById('ticket-content')
      if (!ticketElement) return

      try {
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(ticketElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        })

        const link = document.createElement('a')
        link.download = `ticket-${registration?.registrationCode || registrationId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch (err) {
        console.error('Failed to download ticket:', err)
        // Fallback: copy registration code
        navigator.clipboard.writeText(registration?.registrationCode || registrationId || '')
        alert('Ticket downloaded! (If download failed, registration code has been copied to clipboard)')
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-brutal-lg bg-white p-8 max-w-md w-full"
        >
          {/* Ticket Content - wrapped for download */}
          <div id="ticket-content" className="bg-white">
            <div className="text-center mb-6">
              <div className="neo-brutal bg-blue-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black mb-2">Your Ticket</h1>
              <p className="font-semibold text-gray-600">Registration Confirmed</p>
            </div>

            <div className="space-y-4">
              <div className="neo-brutal bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-600 mb-1">Registration Code</p>
                <p className="font-black text-3xl text-center text-blue-600">{registration?.registrationCode || registrationId}</p>
              </div>

              <div className="neo-brutal bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-600 mb-1">Participant</p>
                <p className="font-bold">{registration?.participantName}</p>
              </div>

              <div className="neo-brutal bg-yellow-100 p-4">
                <p className="font-bold text-center">
                  Show this QR code at the event for check-in
                </p>
              </div>

              {attendance && (
                <div className="neo-brutal bg-green-400 p-4 text-center">
                  <Check className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-black">Attendance Marked</p>
                  <p className="text-sm font-semibold mt-1">
                    {new Date(attendance.markedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {attendance && registration && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  // Create hidden certificate and download
                  const certContainer = document.createElement('div')
                  certContainer.style.position = 'absolute'
                  certContainer.style.left = '-9999px'
                  certContainer.id = 'cert-temp'
                  document.body.appendChild(certContainer)

                  // Render certificate using React
                  const { createRoot } = await import('react-dom/client')
                  const root = createRoot(certContainer)
                  root.render(
                    <Certificate
                      participantName={registration.participantName}
                      eventTitle={(registration as any).event?.title || 'Event'}
                      eventDate={(registration as any).event?.date || new Date().toISOString()}
                      registrationCode={registration.registrationCode}
                      attendedAt={attendance.markedAt}
                    />
                  )

                  // Wait for render then capture
                  setTimeout(async () => {
                    const certEl = document.getElementById('certificate-content')
                    if (certEl) {
                      const html2canvas = (await import('html2canvas')).default
                      const canvas = await html2canvas(certEl, { scale: 2, backgroundColor: '#ffffff' })
                      const link = document.createElement('a')
                      link.download = `certificate-${registration.registrationCode}.png`
                      link.href = canvas.toDataURL('image/png')
                      link.click()
                    }
                    document.body.removeChild(certContainer)
                  }, 100)
                }}
                className="neo-brutal bg-amber-400 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Download Certificate
              </motion.button>
            )}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadTicket}
                className="neo-brutal bg-green-400 flex-1 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Download Ticket
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="neo-brutal bg-blue-400 flex-1 py-3 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // 🔵 ORGANIZER VIEW: Show attendance marking result
  if (user.role === "organizer") {
    if (processing) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="neo-brutal-lg bg-white p-12 text-center"
          >
            <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl font-bold">Processing attendance...</p>
          </motion.div>
        </div>
      )
    }

    if (result) {
      const isSuccess = result.success && !result.alreadyMarked
      const isAlreadyMarked = result.alreadyMarked

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neo-brutal-lg bg-white p-8 max-w-md w-full"
          >
            {isSuccess && (
              <>
                <div className="text-center mb-6">
                  <div className="neo-brutal bg-green-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-black mb-2">Attendance Marked</h1>
                  <p className="font-semibold text-gray-600">{result.message}</p>
                </div>

                <div className="space-y-3">
                  <div className="neo-brutal bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-600 mb-1">Participant</p>
                    <p className="font-bold text-lg">{result.registration?.participantName}</p>
                  </div>

                  {result.registration?.teamName && (
                    <div className="neo-brutal bg-blue-100 p-4">
                      <p className="text-sm font-bold text-gray-600 mb-1">Team</p>
                      <p className="font-bold">{result.registration.teamName}</p>
                      {result.registration.isTeamLeader && (
                        <p className="text-sm font-semibold text-blue-700 mt-1">Team Leader</p>
                      )}
                    </div>
                  )}

                  <div className="neo-brutal bg-green-100 p-4">
                    <p className="text-sm font-bold text-gray-600 mb-1">Status</p>
                    <p className="font-black text-green-700">Present</p>
                  </div>

                  <div className="neo-brutal bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-600 mb-1">Time</p>
                    <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </>
            )}

            {isAlreadyMarked && (
              <>
                <div className="text-center mb-6">
                  <div className="neo-brutal bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-black mb-2">Already Marked</h1>
                  <p className="font-semibold text-gray-600">Attendance was previously recorded</p>
                </div>

                <div className="space-y-3">
                  <div className="neo-brutal bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-600 mb-1">Participant</p>
                    <p className="font-bold text-lg">{result.attendance?.participantName}</p>
                  </div>

                  <div className="neo-brutal bg-yellow-100 p-4">
                    <p className="text-sm font-bold text-gray-600 mb-1">Previously Marked At</p>
                    <p className="font-semibold">
                      {new Date(result.attendance?.markedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!isSuccess && !isAlreadyMarked && (
              <>
                <div className="text-center mb-6">
                  <div className="neo-brutal bg-red-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-black mb-2">Error</h1>
                  <p className="font-semibold text-gray-600">{result.message}</p>
                </div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="neo-brutal bg-blue-400 w-full py-3 font-bold mt-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      )
    }
  }

  return null
}
