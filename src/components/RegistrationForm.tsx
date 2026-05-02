import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Check, AlertCircle, Users } from 'lucide-react'
import TeamTicketsDialog from './TeamTicketsDialog'

interface Props {
  event: any
  userId: Id<"users">
  onSuccess: () => void
  onCancel?: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\s/g, ''))
const formatPhone  = (value: string) => {
  const d = value.replace(/\D/g, '').slice(0, 10)
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d
}

// Shared input class
const inp = (valid: boolean | null) =>
  `w-full px-3 py-2.5 text-sm font-semibold rounded-lg bg-white/70 backdrop-blur-sm
   border-2 outline-none transition-all placeholder:text-black/25
   ${valid === null
     ? 'border-black/20 focus:border-nb-purple focus:shadow-[0_0_0_3px_rgba(116,0,232,0.12)]'
     : valid
       ? 'border-green-400 focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]'
       : 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
   }`

export default function RegistrationForm({ event, userId, onSuccess, onCancel, onDirtyChange }: Props) {
  const register = useMutation(api.registrations.register)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [touched, setTouched]   = useState<Record<string, boolean>>({})
  const [showTeamTickets, setShowTeamTickets]     = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)

  const isTeamEvent        = event.isTeamEvent === true
  const teamSize           = event.teamSize || 0
  const requiredMembers    = isTeamEvent ? teamSize - 1 : 0

  const [formData, setFormData] = useState({
    participantName:  '',
    participantEmail: '',
    participantPhone: '',
    college: '',
    year:    '',
    teamName: '',
    teamMembers: Array.from({ length: requiredMembers }, () => ({ name: '', email: '' })),
  })

  const updateDirtyState = useCallback((d: typeof formData) => {
    onDirtyChange?.(
      d.participantName.trim() !== '' || d.participantEmail.trim() !== '' ||
      d.participantPhone.trim() !== '' || d.college.trim() !== '' ||
      d.year !== '' || d.teamName.trim() !== '' ||
      d.teamMembers.some(m => m.name.trim() !== '' || m.email.trim() !== '')
    )
  }, [onDirtyChange])

  const v = useMemo(() => ({
    name:     { ok: formData.participantName.trim().length > 0 },
    email:    { ok: validateEmail(formData.participantEmail), msg: formData.participantEmail && !validateEmail(formData.participantEmail) ? 'Enter a valid email' : '' },
    phone:    { ok: validatePhone(formData.participantPhone), msg: formData.participantPhone.replace(/\s/g,'').length > 0 && !validatePhone(formData.participantPhone) ? 'Must be 10 digits' : '' },
    college:  { ok: formData.college.trim().length > 0 },
    year:     { ok: formData.year !== '' },
    teamName: { ok: !isTeamEvent || formData.teamName.trim().length > 0 },
  }), [formData, isTeamEvent])

  const isFormValid = useMemo(() => {
    if (!v.name.ok || !v.email.ok || !v.phone.ok || !v.college.ok || !v.year.ok) return false
    if (isTeamEvent) {
      if (!v.teamName.ok) return false
      if (formData.teamMembers.some(m => !m.name.trim() || !validateEmail(m.email))) return false
    }
    return true
  }, [v, isTeamEvent, formData.teamMembers])

  const filledMembers = formData.teamMembers.filter(m => m.name.trim() && m.email.trim()).length

  const touch = (f: string) => setTouched(p => ({ ...p, [f]: true }))

  const set = (field: string, value: string) => {
    const next = { ...formData, [field]: value }
    setFormData(next); updateDirtyState(next)
  }

  const setPhone = (value: string) => {
    const next = { ...formData, participantPhone: formatPhone(value) }
    setFormData(next); updateDirtyState(next)
  }

  const setMember = (i: number, field: 'name' | 'email', value: string) => {
    const members = [...formData.teamMembers]
    members[i][field] = value
    const next = { ...formData, teamMembers: members }
    setFormData(next); updateDirtyState(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const result = await register({
        eventId: event._id, userId,
        participantName:  formData.participantName,
        participantEmail: formData.participantEmail,
        participantPhone: formData.participantPhone.replace(/\s/g, ''),
        college: formData.college,
        year:    formData.year,
        teamName:    isTeamEvent ? formData.teamName    : undefined,
        teamMembers: isTeamEvent ? formData.teamMembers : undefined,
      })
      setRegistrationResult(result)
      if (isTeamEvent && result.allRegistrationCodes?.length > 1) {
        setShowTeamTickets(true)
      } else {
        window.location.href = `/ticket/${result.leaderRegistrationId}`
      }
    } catch (err: any) { setError(err.message || 'Failed to register') }
    finally { setLoading(false) }
  }

  if (showTeamTickets && registrationResult) {
    return (
      <TeamTicketsDialog
        isOpen={showTeamTickets}
        registration={registrationResult}
        onClose={() => { setShowTeamTickets(false); onSuccess() }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ── Personal Details ─────────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">Personal Details</p>

        {/* Name + Email — 2 col */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/60">Full Name *</label>
            <div className="relative">
              <input
                type="text" required autoComplete="name"
                value={formData.participantName}
                onChange={e => set('participantName', e.target.value)}
                onBlur={() => touch('name')}
                placeholder="John Doe"
                className={inp(touched.name ? v.name.ok : null)}
              />
              {touched.name && v.name.ok && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-black/60">Email *</label>
            <div className="relative">
              <input
                type="email" required autoComplete="email"
                value={formData.participantEmail}
                onChange={e => set('participantEmail', e.target.value)}
                onBlur={() => touch('email')}
                placeholder="you@college.edu"
                className={inp(touched.email ? v.email.ok : null)}
              />
              {touched.email && (
                v.email.ok
                  ? <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500" />
                  : <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-500" />
              )}
            </div>
            {touched.email && v.email.msg && (
              <p className="text-xs text-red-500 font-medium">{v.email.msg}</p>
            )}
            <p className="text-[10px] text-black/35 font-medium">Confirmation will be sent here</p>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-black/60">Phone *</label>
          <div className="flex rounded-lg overflow-hidden border-2 border-black/20
                          focus-within:border-nb-purple
                          focus-within:shadow-[0_0_0_3px_rgba(116,0,232,0.12)]
                          transition-all">
            <span className="px-3 py-2.5 bg-nb-yellow text-black text-sm font-bold shrink-0 border-r border-black/15">
              +91
            </span>
            <input
              type="tel" required autoComplete="tel" inputMode="numeric"
              value={formData.participantPhone}
              onChange={e => setPhone(e.target.value)}
              onBlur={() => touch('phone')}
              placeholder="98765 43210"
              className="flex-1 px-3 py-2.5 text-sm font-semibold bg-white/70 backdrop-blur-sm
                         outline-none placeholder:text-black/25"
            />
          </div>
          {touched.phone && v.phone.msg && (
            <p className="text-xs text-red-500 font-medium">{v.phone.msg}</p>
          )}
          <p className="text-[10px] text-black/35 font-medium">Used for event updates</p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-black/8" />

      {/* ── Academic Details ─────────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40">Academic Details</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/60">College / Department *</label>
            <input
              type="text" required
              value={formData.college}
              onChange={e => set('college', e.target.value)}
              onBlur={() => touch('college')}
              placeholder="Computer Science"
              className={inp(touched.college ? v.college.ok : null)}
            />
            <p className="text-[10px] text-black/35 font-medium">e.g. AIML – Sri Sairam Engineering College</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-black/60">Year *</label>
            <select
              required
              value={formData.year}
              onChange={e => set('year', e.target.value)}
              onBlur={() => touch('year')}
              className={inp(touched.year ? v.year.ok : null)}
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="PG">PG</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Team Details ─────────────────────────────────── */}
      {isTeamEvent && (
        <>
          <div className="border-t border-black/8" />
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-black/40">Team Details</p>
              <span className="flex items-center gap-1.5 text-xs font-bold text-black/50">
                <Users className="w-3.5 h-3.5" />
                {filledMembers}/{requiredMembers} filled
              </span>
            </div>

            <div className="rounded-lg bg-nb-purple/8 border border-nb-purple/20 px-4 py-3">
              <p className="text-xs font-semibold text-nb-purple">
                Team size: {teamSize} · You are the team leader
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black/60">Team Name *</label>
              <input
                type="text" required
                value={formData.teamName}
                onChange={e => set('teamName', e.target.value)}
                placeholder="Team Awesome"
                className={inp(null)}
              />
            </div>

            <div className="space-y-3">
              {formData.teamMembers.map((member, i) => (
                <div key={i} className="rounded-lg bg-black/3 border border-black/10 p-4 space-y-3">
                  <p className="text-xs font-bold text-black/50 uppercase tracking-wider">
                    Member {i + 1}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text" required
                      value={member.name}
                      onChange={e => setMember(i, 'name', e.target.value)}
                      placeholder="Full name"
                      className={inp(null)}
                    />
                    <input
                      type="email" required
                      value={member.email}
                      onChange={e => setMember(i, 'email', e.target.value)}
                      placeholder="email@college.edu"
                      className={inp(null)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-black/60
                       border border-black/15 bg-white hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`${onCancel ? 'flex-1' : 'w-full'} py-2.5 rounded-lg text-sm font-bold
                      border border-black/20 transition-all
                      ${isFormValid && !loading
                        ? `bg-nb-purple text-white
                           shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                           hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:-translate-x-px hover:-translate-y-px
                           active:shadow-[1px_1px_0_rgba(0,0,0,0.7)] active:translate-x-px active:translate-y-px`
                        : 'bg-black/5 text-black/30 cursor-not-allowed'
                      }`}
        >
          {loading ? 'Registering…' : 'Register →'}
        </button>
      </div>

      <p className="text-center text-xs text-black/30 font-medium">
        Your details are shared only with the event organizer.
      </p>
    </form>
  )
}
