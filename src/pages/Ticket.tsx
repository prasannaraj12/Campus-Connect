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
    !isCode && registrationId && user?.userId ? { 
      registrationId: registrationId as Id<'registrations'>,
      userId: user.userId 
    } : 'skip'
  )

  const registrationByCode = useQuery(
    api.registrations.getRegistrationByCode,
    isCode && registrationId && user?.userId ? { 
      code: registrationId.toUpperCase(),
      userId: user.userId
    } : 'skip'
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
      }
    }

    return (
      <div className="min-h-screen bg-nb-cream grid-bg flex flex-col font-body">
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-black text-white border-b-4 border-white/20">
          <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 nb bg-white text-black border-2 border-black hover:rotate-6 transition-all shadow-[3px_3px_0_#7400E8]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-display font-black text-xl uppercase tracking-tighter italic">
              CAMPUS<span className="text-nb-yellow">_CONNECT</span>
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            className="w-full max-w-md"
          >
            {/* Ticket Card */}
            <div id="ticket-content" className="bg-white nb border-4 border-black shadow-[20px_20px_0_#000000] overflow-hidden mb-8 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl rotate-45 select-none">OFFICIAL</div>
              
              {/* Header strip */}
              <div className="bg-nb-purple px-8 py-10 text-white text-center border-b-4 border-black relative">
                <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_#000000] rotate-3">
                  <Check className="w-10 h-10 text-black stroke-[3px]" />
                </div>
                <h1 className="font-display text-5xl font-black uppercase italic tracking-tighter leading-none">ENTRY PASS</h1>
                <p className="text-nb-yellow text-[10px] font-black uppercase tracking-[0.4em] mt-3 underline underline-offset-4">TICKET CONFIRMED</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Registration Code */}
                <div className="bg-nb-yellow rounded-none p-6 text-center border-4 border-black shadow-[8px_8px_0_#000000] rotate-[-1deg]">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-3 underline decoration-black/10">TICKET SERIAL CODE</p>
                  <p className="font-display font-black text-4xl text-black tracking-widest italic leading-none">
                    {registration?.registrationCode || registrationId}
                  </p>
                </div>

                {/* Participant */}
                {registration?.participantName && (
                  <div className="flex items-center gap-4 p-5 bg-nb-cream border-4 border-black shadow-[6px_6px_0_#00FF75] rotate-[1deg]">
                    <div className="w-12 h-12 bg-black text-white border-2 border-white flex items-center justify-center font-black text-xl italic">
                      {registration.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-40 -mb-1">PARTICIPANT</p>
                      <p className="font-black text-xl text-black uppercase italic tracking-tighter">{registration.participantName}</p>
                    </div>
                  </div>
                )}

                {/* Attendance status */}
                {attendance ? (
                  <div className="bg-nb-green border-4 border-black p-6 flex items-center gap-4 shadow-[8px_8px_0_#000000]">
                    <CheckCircle className="w-8 h-8 text-black flex-shrink-0" />
                    <div>
                      <p className="font-black text-lg uppercase italic tracking-tighter leading-none">CHECKED IN</p>
                      <p className="text-[10px] font-black text-black/60 mt-1 uppercase">
                        SYNC: {new Date(attendance.markedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-nb-pink text-white border-4 border-black p-6 flex items-center gap-4 shadow-[8px_8px_0_#000000] animate-pulse">
                    <Clock className="w-8 h-8 text-white flex-shrink-0" />
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] italic leading-tight">
                      PRESENT SERIAL AT BASE <br/> FOR CHECK-IN
                    </p>
                  </div>
                )}
              </div>

              {/* Decorative holes */}
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-nb-cream border-4 border-black rounded-full -translate-y-1/2" />
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-nb-cream border-4 border-black rounded-full -translate-y-1/2" />
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {attendance && registration && (
                <motion.button
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  whileTap={{ scale: 0.98 }}
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
                  className="w-full bg-nb-purple hover:bg-black text-white py-5 border-4 border-black font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-[8px_8px_0_#00FF75] transition-all italic"
                >
                  <Award className="w-7 h-7" />
                  ACQUIRE_REWARD
                </motion.button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, rotate: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadTicket}
                  className="bg-black text-white py-5 border-4 border-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[8px_8px_0_#7400E8] transition-all italic"
                >
                  <Download className="w-5 h-5" />
                  SAVE TICKET
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-black py-5 border-4 border-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[8px_8px_0_#FF2D92] transition-all italic"
                >
                  DASHBOARD
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
        <div className="min-h-screen bg-nb-cream grid-bg flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white nb border-4 border-black p-16 text-center max-w-sm w-full shadow-[20px_20px_0_#7400E8]"
          >
            <div className="w-16 h-16 border-4 border-nb-purple border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl font-black text-black uppercase italic tracking-tighter">DECRYPTING_ATTENDANCE...</p>
          </motion.div>
        </div>
      )
    }

    if (result) {
      const isSuccess = result.success && !result.alreadyMarked
      const isAlreadyMarked = result.alreadyMarked
      const isError = !result.success && !result.alreadyMarked

      return (
        <div className="min-h-screen bg-nb-cream grid-bg flex flex-col font-body">
          <header className="sticky top-0 z-50 bg-black text-white border-b-4 border-white/20">
            <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-3 nb bg-white text-black border-2 border-black hover:rotate-6 transition-all shadow-[3px_3px_0_#7400E8]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="font-display font-black text-xl uppercase tracking-tighter italic">
                CAMPUS<span className="text-nb-yellow">_CONNECT</span>
              </span>
            </div>
          </header>

          <main className="flex-1 flex items-start justify-center px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: isError ? -3 : 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              className="w-full max-w-md bg-white nb border-4 border-black shadow-[20px_20px_0_#000000] overflow-hidden"
            >
              {/* Status header */}
              <div className={`px-8 py-10 text-center border-b-4 border-black ${isSuccess ? 'bg-nb-green' : isAlreadyMarked ? 'bg-nb-yellow' : 'bg-nb-pink'}`}>
                <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_#000000]">
                  {isError
                    ? <X className="w-10 h-10 text-black stroke-[4px]" />
                    : <Check className="w-10 h-10 text-black stroke-[4px]" />
                  }
                </div>
                <h1 className="font-display text-4xl font-black text-black uppercase italic tracking-tighter leading-none">
                  {isSuccess ? 'SUCCESS' : isAlreadyMarked ? 'ALREADY CHECKED IN' : 'ERROR'}
                </h1>
                <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-black/10">
                  {isSuccess ? result.message : isAlreadyMarked ? 'SYSTEM DETECTED PREVIOUS ENTRY' : result.message}
                </p>
              </div>

              <div className="p-8 space-y-4">
                {isSuccess && (
                  <>
                    <div className="bg-nb-cream border-2 border-black p-5 shadow-[4px_4px_0_#000000]">
                      <p className="text-[10px] font-black text-black/40 mb-1 uppercase tracking-widest">IDENTIFIED_OPERATIVE</p>
                      <p className="font-black text-black text-xl uppercase italic tracking-tighter leading-none">{result.registration?.participantName}</p>
                    </div>
                    {result.registration?.teamName && (
                      <div className="bg-nb-purple text-white border-2 border-black p-5 shadow-[4px_4px_0_#000000]">
                        <p className="text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">TEAM NAME</p>
                        <p className="font-black text-xl uppercase italic tracking-tighter leading-none">{result.registration.teamName}</p>
                        {result.registration.isTeamLeader && (
                          <span className="text-[10px] font-black text-nb-yellow uppercase mt-2 block tracking-widest">TEAM LEADER</span>
                        )}
                      </div>
                    )}
                    <div className="bg-nb-green border-2 border-black p-5 flex items-center gap-4 shadow-[4px_4px_0_#000000]">
                      <CheckCircle className="w-6 h-6 text-black" />
                      <div>
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">ENTRY_STATUS</p>
                        <p className="font-black text-black uppercase italic">PRESENT · {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </>
                )}

                {isAlreadyMarked && (
                  <>
                    <div className="bg-nb-cream border-2 border-black p-5 shadow-[4px_4px_0_#000000]">
                      <p className="text-[10px] font-black text-black/40 mb-1 uppercase tracking-widest">OPERATIVE_ID</p>
                      <p className="font-black text-black text-xl uppercase italic tracking-tighter leading-none">{result.attendance?.participantName}</p>
                    </div>
                    <div className="bg-nb-yellow border-2 border-black p-5 flex items-center gap-4 shadow-[4px_4px_0_#000000]">
                      <AlertCircle className="w-6 h-6 text-black" />
                      <div>
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">PREVIOUSLY_LOGGED_AT</p>
                        <p className="font-black text-black uppercase italic">
                          {new Date(result.attendance?.markedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-4 bg-black text-white py-6 border-4 border-black font-black uppercase tracking-[0.3em] shadow-[8px_8px_0_#7400E8] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
                >
                  RETURN TO DASHBOARD
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
