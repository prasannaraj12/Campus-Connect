import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../hooks/use-auth'
import { Id } from '../../../convex/_generated/dataModel'
import QRCode from 'react-qr-code'
import { UserPlus, Check, Download, FileDown, Users, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import EventRegistrationDialog from '../EventRegistrationDialog'

interface Props {
  event: any
  isOrganizer: boolean
  myRegistration: any
  registrations: any[]
  participantCount: number
  showRegistrationDialog?: boolean
  setShowRegistrationDialog?: (show: boolean) => void
}

export default function EventSidebar({ event, isOrganizer, myRegistration, registrations, participantCount, showRegistrationDialog: externalShowDialog, setShowRegistrationDialog: externalSetShowDialog }: Props) {
  const { user } = useAuth()
  const [internalShowDialog, setInternalShowDialog] = useState(false)

  const showRegistrationDialog = externalShowDialog !== undefined ? externalShowDialog : internalShowDialog
  const setShowRegistrationDialog = externalSetShowDialog || setInternalShowDialog

  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const cancelRegistration = useMutation(api.registrations.cancelRegistration)
  const markAttendance = useMutation(api.registrations.markAttendance)

  const attendanceCount = useQuery(
    api.registrations.getAttendanceCount,
    { eventId: event._id }
  )
  const attendance = useQuery(
    api.registrations.getEventAttendance,
    user?.role === 'organizer' && user.userId ? { eventId: event._id, userId: user.userId } : "skip"
  )

  const myAttendance = useQuery(
    api.registrations.getAttendance,
    myRegistration ? { registrationId: myRegistration._id } : "skip"
  )

  const attendanceMap = new Map()
  attendance?.forEach((att: any) => {
    attendanceMap.set(att.registrationId, att)
  })

  const presentCount = attendanceCount ?? (attendance?.length || 0)
  const absentCount = registrations.length - presentCount

  const handleCancelRegistration = async () => {
    if (!user?.userId || !confirm('Confirm identity termination for this event?')) return
    setLoading(true)
    try {
      await cancelRegistration({ eventId: event._id, userId: user.userId })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (registrationId: string) => {
    if (!user?.userId) return
    try {
      await markAttendance({
        registrationId: registrationId as Id<"registrations">,
        organizerId: user.userId as Id<"users">
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllPresent = async () => {
    setMarkingAll(true)
    try {
      for (const reg of registrations) {
        if (!attendanceMap.has(reg._id) && user?.userId) {
          await markAttendance({
            registrationId: reg._id,
            organizerId: user.userId as Id<"users">
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Participant Section ──────────────────────────────── */}
      {!isOrganizer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="nb bg-white p-8 border-4 border-nb-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
        >
          {myRegistration ? (
            <div className="space-y-8">
              <div className="nb-sm bg-nb-yellow p-6 border-2 border-nb-black text-center flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10 text-nb-black grow-animation" />
                <p className="text-sm font-black uppercase tracking-widest">YOU ARE REGISTERED</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-4 bg-nb-black" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">YOUR TICKET</h3>
                </div>
                
                <div className="nb bg-nb-paper p-6 border-2 border-nb-black text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-nb-orange -rotate-45 translate-x-6 -translate-y-6 border-b-2 border-nb-black" />
                  <p className="text-[8px] font-black uppercase opacity-40 mb-3 tracking-[0.3em]">SECURE CODE</p>
                  <p className="font-display text-4xl font-black text-nb-black tracking-widest mb-6 group-hover:scale-110 transition-transform">
                    {myRegistration.registrationCode}
                  </p>
                  
                  <div className="bg-white p-4 border-2 border-nb-black nb-sm inline-block shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6">
                    <QRCode value={myRegistration.registrationCode} size={180} level="H" />
                  </div>
                  
                  <button
                    onClick={() => window.open(`/ticket/${myRegistration._id}`, '_blank')}
                    className="nb-btn-sm bg-nb-black text-white w-full py-4 text-[10px]"
                  >
                    DOWNLOAD CREDENTIALS
                  </button>
                </div>
              </div>

              {myAttendance && (
                <div className="glass nb-sm p-5 border-2 border-nb-black/10 text-center flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-nb-orange" />
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase text-nb-black">IDENTITY VERIFIED</p>
                    <p className="text-[8px] font-bold text-nb-black/40 uppercase">{new Date(myAttendance.markedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleCancelRegistration}
                disabled={loading}
                className="text-nb-black opacity-30 w-full py-4 text-[9px] font-black uppercase tracking-widest hover:opacity-100 hover:text-nb-orange transition-all disabled:opacity-10"
              >
                CANCEL REGISTRATION
              </button>
            </div>
          ) : participantCount >= event.maxParticipants ? (
            <div className="nb bg-nb-paper p-10 border-4 border-nb-black flex flex-col items-center gap-4 text-center grayscale opacity-50">
              <XCircle className="w-16 h-16 text-nb-black" />
              <p className="text-lg font-black uppercase italic tracking-tighter">EVENT IS FULL</p>
            </div>
          ) : (
            <button
              onClick={() => setShowRegistrationDialog(true)}
              className="nb-btn bg-nb-yellow text-black w-full py-8 text-xl font-black uppercase italic tracking-tighter flex flex-col items-center gap-2 drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex items-center gap-4">
                <UserPlus className="w-8 h-8" />
                <span>JOIN EVENT</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">REGISTER NOW</span>
            </button>
          )}
        </motion.div>
      )}

      {/* ── Organizer View ──────────────────────────────────── */}
      {isOrganizer && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="nb bg-nb-paper p-8 border-4 border-nb-black shadow-[8px_8px_0px_rgba(250,204,21,1)]"
        >
          <div className="space-y-8">
            <header>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-nb-black mb-1 leading-none">ATTENDANCE HUB</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-nb-black/40">VIEWING • {registrations.length} REGISTERED</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="nb-sm bg-nb-yellow p-4 border-2 border-nb-black text-center group hover:-translate-y-1 transition-transform">
                <p className="text-[9px] font-black uppercase opacity-40 mb-2">PRESENT</p>
                <p className="text-4xl font-black text-nb-black leading-none">{presentCount}</p>
              </div>
              <div className="nb-sm bg-nb-orange p-4 border-2 border-nb-black text-center group hover:-translate-y-1 transition-transform">
                <p className="text-[9px] font-black uppercase opacity-40 mb-2 text-white/50">ABSENT</p>
                <p className="text-4xl font-black text-white leading-none">{absentCount}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleMarkAllPresent}
                disabled={markingAll || registrations.length === 0}
                className="flex-1 nb-btn-sm bg-nb-black text-white py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
              >
                {markingAll ? 'SYNCING...' : 'SYNC ALL'}
              </button>
              <button
                onClick={() => import('../../lib/utils').then(({ exportToCSV }) => {
                  const data = registrations.map(r => ({
                    ...r,
                    eventName: event.title,
                    attendance: attendanceMap.has(r._id) ? 'Present' : 'Absent',
                    markedAt: attendanceMap.get(r._id)?.markedAt || ''
                  }))
                  exportToCSV(data, `${event.title}_attendance`)
                })}
                disabled={registrations.length === 0}
                className="nb-btn-sm bg-white text-black py-4 px-6 border-2 border-nb-black disabled:opacity-20"
              >
                <FileDown className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-6 border-t-4 border-nb-black/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-nb-black" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">MANIFEST ENTRIES</h4>
              </div>

              {registrations.length === 0 ? (
                <div className="text-center py-12 nb-sm border-2 border-dashed border-nb-black/10">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-10" />
                  <p className="text-[10px] font-black uppercase opacity-20 tracking-tighter italic">NO ONE HAS REGISTERED YET...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] pr-2 overflow-y-auto custom-scrollbar">
                  {registrations.map((reg) => {
                    const hasAttendance = attendanceMap.has(reg._id)
                    const attendanceRecord = attendanceMap.get(reg._id)

                    return (
                      <div
                        key={reg._id}
                        className={`nb-sm p-4 border-2 transition-all flex items-center justify-between gap-4 group ${
                          hasAttendance ? 'bg-nb-yellow border-nb-black scale-[0.98]' : 'bg-white border-nb-black/10 hover:border-nb-black'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-black uppercase truncate tracking-tight">{reg.participantName}</span>
                            {reg.isTeamLeader && <span className="nb-tag bg-nb-black text-white text-[8px] px-1.5 font-black uppercase">LEAD</span>}
                          </div>
                          <p className="text-[9px] font-bold text-nb-black/30 truncate uppercase">{reg.participantEmail}</p>
                          {hasAttendance && (
                            <p className="text-[8px] font-black text-nb-black mt-2 uppercase opacity-40">ATTENDANCE MARKED @ {new Date(attendanceRecord.markedAt).toLocaleTimeString()}</p>
                          )}
                        </div>

                        <button
                          onClick={() => !hasAttendance && handleMarkAttendance(reg._id)}
                          disabled={hasAttendance}
                          className={`w-12 h-12 nb-sm border-2 flex items-center justify-center transition-all ${
                            hasAttendance 
                            ? 'bg-nb-black text-nb-yellow border-nb-black' 
                            : 'bg-nb-paper text-nb-black border-nb-black/10 group-hover:bg-nb-yellow group-hover:border-nb-black'
                          }`}
                        >
                          <Check className={`w-5 h-5 ${hasAttendance ? 'stroke-[4px]' : 'stroke-2'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {showRegistrationDialog && user?.userId && (
        <EventRegistrationDialog
          event={event}
          userId={user.userId}
          onClose={() => setShowRegistrationDialog(false)}
        />
      )}
    </div>
  )
}
