import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { Check, X, Award, ArrowLeft, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Certificate from '../components/Certificate'

export default function Ticket() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const markAttendance = useMutation(api.registrations.markAttendance)

  const isCode = registrationId?.includes('REG-') || (registrationId && registrationId.length <= 10)

  const registrationById = useQuery(
    api.registrations.getRegistrationById,
    !isCode && registrationId ? { registrationId: registrationId as Id<'registrations'> } : 'skip'
  )

  const registrationByCode = useQuery(
    api.registrations.getRegistrationByCode,
    isCode && registrationId ? { code: registrationId.toUpperCase() } : 'skip'
  )

  const registration = isCode ? registrationByCode : registrationById

  const attendance = useQuery(
    api.registrations.getAttendance,
    registration?._id ? { registrationId: registration._id } : 'skip'
  )

  useEffect(() => {
    if (user?.role === 'organizer' && registration?._id && !processing && !result) {
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
      setResult({ success: false, message: err.message || 'Failed to mark attendance' })
    } finally {
      setProcessing(false)
    }
  }

  // ── Participant View ──────────────────────────────────────────────
  if (!user || user.role === 'participant') {
    const handleDownloadTicket = async () => {
      const ticketElement = document.getElementById('ticket-content')
      if (!ticketElement) return
      try {
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(ticketElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
        const link = document.createElement('a')
        link.download = `ticket-${registration?.registrationCode || registrationId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch {
        navigator.clipboard.writeText(registration?.registrationCode || registrationId || '')
        alert('Registration code copied to clipboard.')
      }
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display font-extrabold text-lg text-slate-900">
              Campus<span className="text-brand-500">Connect</span>
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Ticket Card */}
            <div id="ticket-content" className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-4">
              {/* Header strip */}
              <div className="bg-brand-500 px-6 py-5 text-white text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h1 className="font-display text-2xl font-extrabold">Your Ticket</h1>
                <p className="text-brand-100 text-sm mt-1">Registration Confirmed</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Registration Code */}
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registration Code</p>
                  <p className="font-mono font-black text-3xl text-brand-600 tracking-wider">
                    {registration?.registrationCode || registrationId}
                  </p>
                </div>

                {/* Participant */}
                {registration?.participantName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
                      {registration.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Participant</p>
                      <p className="font-semibold text-slate-900">{registration.participantName}</p>
                    </div>
                  </div>
                )}

                {/* Attendance status */}
                {attendance ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">Attendance Marked</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {new Date(attendance.markedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-amber-800">
                      Show this code at the event for check-in
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {attendance && registration && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={async () => {
                    const certContainer = document.createElement('div')
                    certContainer.style.position = 'absolute'
                    certContainer.style.left = '-9999px'
                    certContainer.id = 'cert-temp'
                    document.body.appendChild(certContainer)
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
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Award className="w-5 h-5" />
                  Download Certificate
                </motion.button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDownloadTicket}
                  className="bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Save Ticket
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  // ── Organizer View ────────────────────────────────────────────────
  if (user.role === 'organizer') {
    if (processing) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-md p-12 text-center max-w-sm w-full border border-slate-100"
          >
            <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700">Processing attendance...</p>
          </motion.div>
        </div>
      )
    }

    if (result) {
      const isSuccess = result.success && !result.alreadyMarked
      const isAlreadyMarked = result.alreadyMarked
      const isError = !result.success && !result.alreadyMarked

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-display font-extrabold text-lg text-slate-900">
                Campus<span className="text-brand-500">Connect</span>
              </span>
            </div>
          </header>

          <main className="flex-1 flex items-start justify-center px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden"
            >
              {/* Status header */}
              <div className={`px-6 py-6 text-center ${isSuccess ? 'bg-green-500' : isAlreadyMarked ? 'bg-amber-400' : 'bg-red-500'}`}>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  {isError
                    ? <X className="w-7 h-7 text-white" />
                    : <Check className="w-7 h-7 text-white" />
                  }
                </div>
                <h1 className="font-display text-2xl font-extrabold text-white">
                  {isSuccess ? 'Attendance Marked' : isAlreadyMarked ? 'Already Marked' : 'Error'}
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {isSuccess ? result.message : isAlreadyMarked ? 'Attendance was previously recorded' : result.message}
                </p>
              </div>

              <div className="p-6 space-y-3">
                {isSuccess && (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Participant</p>
                      <p className="font-semibold text-slate-900 text-lg">{result.registration?.participantName}</p>
                    </div>
                    {result.registration?.teamName && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-xs text-slate-500 mb-1">Team</p>
                        <p className="font-semibold text-slate-900">{result.registration.teamName}</p>
                        {result.registration.isTeamLeader && (
                          <span className="text-xs font-bold text-blue-600">Team Leader</span>
                        )}
                      </div>
                    )}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="font-bold text-green-700">Present · {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </>
                )}

                {isAlreadyMarked && (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Participant</p>
                      <p className="font-semibold text-slate-900 text-lg">{result.attendance?.participantName}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-xs text-slate-500">Previously marked at</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(result.attendance?.markedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      )
    }
  }

  return null
}
