import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Briefcase, ArrowRight, Mail, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'

const roles = [
  {
    id: 'participant',
    icon: UserCircle,
    title: 'Participant',
    subtitle: 'Browse & join events',
    description: 'Discover workshops, seminars, and campus events. Register instantly and get your QR ticket.',
    cta: 'Enter as Participant',
    bg: 'bg-nb-green',
    accent: 'bg-white',
    iconColor: 'text-nb-green',
    rotate: '-rotate-2',
    hoverRotate: 'hover:-rotate-1',
    shadow: 'shadow-[4px_4px_0_rgba(0,0,0,0.85)]',
    hoverShadow: 'hover:shadow-[6px_6px_0_rgba(0,0,0,0.9)]',
  },
  {
    id: 'organizer',
    icon: Briefcase,
    title: 'Organizer',
    subtitle: 'Create & manage events',
    description: 'Launch events, track registrations, manage attendance with QR check-in, and view analytics.',
    cta: 'Enter as Organizer',
    bg: 'bg-nb-yellow',
    accent: 'bg-white',
    iconColor: 'text-nb-yellow',
    rotate: 'rotate-2',
    hoverRotate: 'hover:rotate-1',
    shadow: 'shadow-[4px_4px_0_rgba(0,0,0,0.85)]',
    hoverShadow: 'hover:shadow-[6px_6px_0_rgba(0,0,0,0.9)]',
  },
]

export default function RoleSelection() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showParticipantLogin, setShowParticipantLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginOtp, setLoginOtp] = useState('')
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')

  const createAnonymousUser = useMutation(api.users.createAnonymousUser)
  const sendOTP = useMutation(api.auth.sendOTP)
  const verifyOTP = useMutation(api.auth.verifyOTP)
  const createParticipantUser = useMutation(api.users.createParticipantUser)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginError('')
    try {
      const result = await sendOTP({ email: loginEmail })
      setGeneratedOtp(result.code || '')
      setLoginStep('otp')
    } catch (err: any) { setLoginError(err.message || 'Failed to send code') }
    finally { setLoginLoading(false) }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginError('')
    try {
      await verifyOTP({ email: loginEmail, code: loginOtp })
      const userId = await createParticipantUser({ email: loginEmail })
      login({ userId, role: 'participant', email: loginEmail })
      navigate('/dashboard')
    } catch (err: any) { setLoginError(err.message || 'Invalid code') }
    finally { setLoginLoading(false) }
  }

  const handleParticipant = async () => {
    try {
      setLoading(true)
      setSelected('participant')
      setError('')
      const userId = await createAnonymousUser({ name: 'Anonymous' })
      await new Promise(r => setTimeout(r, 300))
      login({ userId, role: 'participant', name: 'Anonymous' })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (id: string) => {
    if (id === 'participant') setShowParticipantLogin(true)
    else navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-nb-purple grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mb-12 group"
      >
        <span className="bg-nb-yellow text-black text-sm font-black px-2.5 py-1 rounded-md
                         shadow-[2px_2px_0_rgba(0,0,0,0.8)]
                         group-hover:bg-white transition-colors">
          CAMPUS
        </span>
        <span className="font-display font-black text-xl text-white tracking-tight">
          CONNECT.
        </span>
      </button>

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="text-nb-green text-xs font-bold uppercase tracking-[0.5em] mb-3">
          Choose your role
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight leading-tight
                       [text-shadow:3px_3px_0_rgba(0,0,0,0.5)]">
          How are you joining?
        </h1>
      </motion.div>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-lg bg-red-500/90 text-white text-sm font-semibold
                     border border-red-400 max-w-sm w-full text-center"
        >
          {error}
        </motion.div>
      )}

      {/* ── Cards ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6 w-full max-w-2xl"
      >
        {roles.map((role, i) => {
          const Icon = role.icon
          const isActive = selected === role.id && loading
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(role.id)}
              disabled={loading}
              className={`
                ${role.bg} ${role.rotate} ${role.shadow} ${role.hoverRotate} ${role.hoverShadow}
                text-black text-left p-7 rounded-xl
                border-2 border-black/80
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${selected === role.id ? 'ring-2 ring-white ring-offset-2 ring-offset-nb-purple' : ''}
                group
              `}
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-xl border border-black/20
                              shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                              flex items-center justify-center mb-6">
                <Icon className={`w-7 h-7 ${role.iconColor}`} />
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl font-black tracking-tight leading-none mb-1">
                {role.title}
              </h2>
              <p className="text-sm font-bold text-black/50 mb-4">
                {role.subtitle}
              </p>

              {/* Divider */}
              <div className="h-px bg-black/15 mb-4" />

              {/* Description */}
              <p className="text-sm font-medium text-black/70 leading-relaxed mb-6">
                {role.description}
              </p>

              {/* CTA */}
              <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                bg-black/10 border border-black/20
                group-hover:bg-black/15 group-hover:gap-3
                transition-all
              `}>
                {isActive ? (
                  <span className="text-black/60">Loading…</span>
                ) : (
                  <>
                    {role.cta}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <p className="mt-10 text-white/30 text-xs font-medium tracking-wider">
        © 2026 Campus Connect
      </p>

      {/* ── Participant Login Modal ───────────────────────────── */}
      <AnimatePresence>
        {showParticipantLogin && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)] w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="bg-nb-green px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-black text-black uppercase tracking-tight">Participant Login</h2>
                  <p className="text-black/60 text-xs font-semibold mt-0.5">Access your tickets & history</p>
                </div>
                <button onClick={() => { setShowParticipantLogin(false); setLoginStep('email'); setLoginEmail(''); setLoginOtp(''); setLoginError('') }}
                  className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Dev OTP hint */}
                {generatedOtp && (
                  <div className="bg-nb-yellow/30 border border-nb-yellow rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Your code (dev)</p>
                    <p className="font-display font-black text-3xl text-black tracking-[0.3em]">{generatedOtp}</p>
                  </div>
                )}

                {loginError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-semibold text-red-700">{loginError}</p>
                  </div>
                )}

                {loginStep === 'email' ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-black/60 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 pointer-events-none" />
                        <input
                          type="email" required autoFocus
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="you@college.edu"
                          className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-lg bg-white border-2 border-black/20 focus:border-nb-green focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loginLoading || !loginEmail}
                      className="w-full py-3 rounded-lg text-sm font-bold bg-nb-green text-black border-2 border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      {loginLoading ? 'Sending…' : 'Send Code →'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <p className="text-xs text-black/50 font-semibold text-center">Code sent to <span className="text-black font-bold">{loginEmail}</span></p>
                    <input
                      type="text" required autoFocus maxLength={6} inputMode="numeric"
                      value={loginOtp}
                      onChange={e => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 text-center text-2xl font-black tracking-[0.4em] rounded-lg bg-white border-2 border-black/20 focus:border-nb-green focus:outline-none transition-all"
                    />
                    <button type="submit" disabled={loginLoading || loginOtp.length !== 6}
                      className="w-full py-3 rounded-lg text-sm font-bold bg-nb-green text-black border-2 border-black/20 shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      {loginLoading ? 'Verifying…' : 'Verify & Sign In →'}
                    </button>
                    <button type="button" onClick={() => { setLoginStep('email'); setLoginOtp(''); setGeneratedOtp('') }}
                      className="w-full text-xs font-semibold text-black/40 hover:text-black transition-colors">
                      ← Change email
                    </button>
                  </form>
                )}

                <div className="border-t border-black/10 pt-4 text-center">
                  <p className="text-xs text-black/40 font-medium mb-2">Just browsing?</p>
                  <button onClick={() => { setShowParticipantLogin(false); handleParticipant() }}
                    className="text-xs font-bold text-nb-purple hover:underline transition-colors">
                    Continue as Guest →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
