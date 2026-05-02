import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Id } from '../../convex/_generated/dataModel'
import { Check, X, Award, ArrowLeft, Download, CheckCircle, AlertCircle, Clock, Loader2, Maximize2 } from 'lucide-react'
import Certificate from '../components/Certificate'
import QRCode from 'react-qr-code'

export default function Ticket() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [fullscreenQR, setFullscreenQR] = useState(false)

  const markAttendance = useMutation(api.registrations.markAttendance)

  const isCode = registrationId?.includes('REG-') || (registrationId && registrationId.length <= 10)

  // Public queries — work without login so ticket is always accessible
  const publicTicket = useQuery(
    api.registrations.getTicketPublic,
    !isCode && registrationId ? { registrationId: registrationId as Id<'registrations'> } : 'skip'
  )

  // Authenticated queries for organizer scanning
  const registrationById = useQuery(
    api.registrations.getRegistrationById,
    !isCode && registrationId && user?.userId && user?.role === 'organizer' ? {
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

  // Use public ticket for participants, auth query for organizers
  const registration = user?.role === 'organizer'
    ? (isCode ? registrationByCode : registrationById)
    : (isCode ? registrationByCode : (publicTicket ?? registrationById))

  const publicAttendance = useQuery(
    api.registrations.getAttendancePublic,
    !isCode && registrationId ? { registrationId: registrationId as Id<'registrations'> } : 'skip'
  )

  const attendance = useQuery(
    api.registrations.getAttendance,
    registration?._id && (isCode || user?.role === 'organizer') ? { registrationId: registration._id } : 'skip'
  )

  // Use public attendance for direct ID access
  const effectiveAttendance = isCode ? attendance : (publicAttendance ?? attendance)

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

  // ── Shared navbar ─────────────────────────────────────────────────
  const Navbar = () => (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm text-white border-b border-white/10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-display font-black text-base tracking-tight">
          CAMPUS<span className="text-nb-yellow">_CONNECT</span>
        </span>
        <div className="w-8" />
      </div>
    </header>
  )

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
      <div className="min-h-screen bg-nb-cream grid-bg flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-start justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* ── Ticket Card ──────────────────────────────── */}
            <div
              id="ticket-content"
              className="bg-white rounded-2xl border-2 border-black/80
                         shadow-[6px_6px_0_rgba(0,0,0,0.85)] overflow-hidden relative"
            >
              {/* Ticket punch holes */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-nb-cream rounded-full border-2 border-black/20 -translate-y-1/2 z-10" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-nb-cream rounded-full border-2 border-black/20 -translate-y-1/2 z-10" />

              {/* Header */}
              <div className="bg-nb-purple px-6 py-6 text-white text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3
                                shadow-[2px_2px_0_rgba(255,229,0,0.8)]">
                  <Check className="w-6 h-6 text-nb-purple" />
                </div>
                <h1 className="font-display text-2xl font-black uppercase tracking-tight leading-none">
                  Entry Pass
                </h1>
                <p className="text-nb-yellow text-xs font-semibold uppercase tracking-widest mt-1.5">
                  Ticket Confirmed
                </p>
              </div>

              {/* Dashed divider */}
              <div className="border-t-2 border-dashed border-black/15 mx-4" />

              <div className="px-6 py-5 space-y-4">
                {/* Serial code */}
                <div className="text-center">
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1.5">
                    Ticket Code
                  </p>
                  <div className="inline-block bg-nb-yellow px-4 py-2 rounded-lg
                                  border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
                    <p className="font-display font-black text-xl text-black tracking-widest">
                      {registration?.registrationCode || registrationId}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => setFullscreenQR(true)}
                    className="relative p-3 bg-white rounded-xl border border-black/15
                                shadow-[2px_2px_0_rgba(0,0,0,0.6)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.7)]
                                hover:-translate-y-px transition-all group"
                  >
                    <QRCode
                      value={registration?.registrationCode || registrationId || ''}
                      size={120}
                      level="M"
                      fgColor="#000000"
                      bgColor="transparent"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md p-0.5">
                      <Maximize2 className="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">
                    Tap to expand
                  </p>
                </div>

                {/* Participant name */}
                {registration?.participantName && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg
                                  bg-nb-cream border border-black/15">
                    <div className="w-9 h-9 rounded-lg bg-nb-purple flex items-center justify-center
                                    text-white text-sm font-black shrink-0">
                      {registration.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Participant</p>
                      <p className="font-bold text-sm text-black">{registration.participantName}</p>
                    </div>
                  </div>
                )}

                {/* Attendance status */}
                {effectiveAttendance ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg
                                  bg-nb-green border border-black/15">
                    <CheckCircle className="w-5 h-5 text-black shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-black">Checked In</p>
                      <p className="text-[10px] text-black/50 font-medium">
                        {new Date(effectiveAttendance.markedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t-2 border-dashed border-black/15 pt-4">
                    <div className="flex items-center gap-2 text-black/50">
                      <Clock className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-semibold">
                        Show this QR or code at the venue for check-in
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Action Buttons ───────────────────────────── */}
            <div className="space-y-3">
              {effectiveAttendance && registration && (
                <button
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
                        attendedAt={effectiveAttendance!.markedAt}
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
                             bg-nb-purple text-white text-sm font-bold
                             border border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                             hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-px
                             active:shadow-[1px_1px_0_rgba(0,0,0,0.7)] active:translate-y-0
                             transition-all"
                >
                  <Award className="w-4 h-4" />
                  Download Certificate
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadTicket}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg
                             bg-black text-white text-sm font-bold
                             border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                             hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-y-px
                             transition-all"
                >
                  <Download className="w-4 h-4" />
                  Save Ticket
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg
                             bg-white text-black text-sm font-bold
                             border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.6)]
                             hover:bg-black/5 transition-all"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </main>

        {/* ── Fullscreen QR Overlay ────────────────────── */}
        {fullscreenQR && (
          <div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6"
            onClick={() => setFullscreenQR(false)}
          >
            <div className="p-5 bg-white rounded-2xl shadow-2xl">
              <QRCode
                value={registration?.registrationCode || registrationId || ''}
                size={280}
                level="M"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <p className="font-display font-black text-2xl text-white tracking-widest">
              {registration?.registrationCode || registrationId}
            </p>
            <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">
              Tap anywhere to close
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Organizer View ────────────────────────────────────────────────
  if (user.role === 'organizer') {

    // Loading
    if (processing) {
      return (
        <div className="min-h-screen bg-nb-cream grid-bg flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-black/80 shadow-[4px_4px_0_rgba(0,0,0,0.8)]
                       p-10 text-center max-w-xs w-full"
          >
            <Loader2 className="w-8 h-8 animate-spin text-nb-purple mx-auto mb-4" />
            <p className="text-sm font-bold text-black/60">Marking attendance…</p>
          </motion.div>
        </div>
      )
    }

    // Result
    if (result) {
      const isSuccess      = result.success && !result.alreadyMarked
      const isAlreadyMarked = result.alreadyMarked
      const isError        = !result.success && !result.alreadyMarked

      const headerBg = isSuccess ? 'bg-green-500' : isAlreadyMarked ? 'bg-nb-yellow' : 'bg-red-500'
      const headerText = isSuccess ? 'Checked In' : isAlreadyMarked ? 'Already Checked In' : 'Error'
      const headerSub  = isSuccess
        ? 'Attendance marked successfully'
        : isAlreadyMarked
          ? 'This ticket was already scanned'
          : result.message

      return (
        <div className="min-h-screen bg-nb-cream grid-bg flex flex-col">
          <Navbar />

          <main className="flex-1 flex items-start justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-2xl border-2 border-black/80
                              shadow-[6px_6px_0_rgba(0,0,0,0.85)] overflow-hidden">

                {/* Status header — compact */}
                <div className={`${headerBg} px-6 py-6 text-center`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3
                               shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
                  >
                    {isError
                      ? <X className="w-7 h-7 text-red-500" />
                      : <Check className="w-7 h-7 text-green-600" />
                    }
                  </motion.div>
                  <h1 className="font-display text-2xl font-black text-black tracking-tight leading-none">
                    {headerText}
                  </h1>
                  <p className="text-black/60 text-xs font-medium mt-1.5">{headerSub}</p>
                </div>

                {/* Info */}
                <div className="px-6 py-5 space-y-3">
                  {isSuccess && (
                    <>
                      {/* Name + status grouped */}
                      <div className="rounded-xl bg-nb-cream border border-black/15 overflow-hidden">
                        <div className="px-4 py-3 border-b border-black/10">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Participant</p>
                          <p className="font-bold text-base text-black">{result.registration?.participantName}</p>
                        </div>
                        <div className="px-4 py-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-bold text-black">
                              Present · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {result.registration?.teamName && (
                        <div className="rounded-xl bg-nb-purple/10 border border-nb-purple/20 px-4 py-3">
                          <p className="text-[10px] font-bold text-nb-purple uppercase tracking-wider mb-0.5">Team</p>
                          <p className="font-bold text-sm text-black">{result.registration.teamName}</p>
                          {result.registration.isTeamLeader && (
                            <span className="text-[10px] font-bold text-nb-purple uppercase tracking-wider">Team Leader</span>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {isAlreadyMarked && (
                    <div className="rounded-xl bg-nb-cream border border-black/15 overflow-hidden">
                      <div className="px-4 py-3 border-b border-black/10">
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Participant</p>
                        <p className="font-bold text-base text-black">{result.attendance?.participantName}</p>
                      </div>
                      <div className="px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Previously checked in</p>
                          <p className="text-sm font-bold text-black">
                            {new Date(result.attendance?.markedAt).toLocaleString([], {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 rounded-lg text-sm font-bold
                               bg-black text-white border border-black/20
                               shadow-[3px_3px_0_rgba(0,0,0,0.5)]
                               hover:shadow-[4px_4px_0_rgba(0,0,0,0.7)] hover:-translate-y-px
                               active:shadow-[1px_1px_0_rgba(0,0,0,0.4)] active:translate-y-0
                               transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      )
    }
  }

  return null
}
