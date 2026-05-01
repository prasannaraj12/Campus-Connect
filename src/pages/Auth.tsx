import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Mail, Lock, Check, AlertCircle, Shield, ArrowLeft } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [step, setStep]       = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [resendTimer, setResendTimer]   = useState(0)
  const [emailValid, setEmailValid]     = useState<boolean | null>(null)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const otpInputRefs  = useRef<(HTMLInputElement | null)[]>([])

  const sendOTP           = useMutation(api.auth.sendOTP)
  const verifyOTP         = useMutation(api.auth.verifyOTP)
  const createOrganizerUser = useMutation(api.users.createOrganizerUser)

  useEffect(() => { emailInputRef.current?.focus() }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleEmailChange = (v: string) => {
    setEmail(v)
    setEmailValid(v.length > 0 ? validateEmail(v) : null)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValid) return
    setLoading(true); setError('')
    try {
      const result = await sendOTP({ email })
      setGeneratedOtp(result.code || '')
      setStep('otp'); setResendTimer(30)
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } catch (err: any) { setError(err.message || 'Failed to send OTP') }
    finally { setLoading(false) }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next)
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpInputRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]
    pasted.split('').forEach((c, i) => { next[i] = c })
    setOtp(next)
    otpInputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return
    setLoading(true); setError('')
    try {
      await verifyOTP({ email, code })
      const userId = await createOrganizerUser({ email })
      login({ userId, role: 'organizer', email })
      navigate('/dashboard')
    } catch (err: any) { setError(err.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    setLoading(true); setError('')
    try {
      const result = await sendOTP({ email })
      setGeneratedOtp(result.code || ''); setResendTimer(30)
    } catch (err: any) { setError(err.message || 'Failed to resend OTP') }
    finally { setLoading(false) }
  }

  const isOtpComplete = otp.every(d => d !== '')

  return (
    <div className="min-h-screen bg-nb-green grid-bg flex flex-col items-center justify-center p-4 gap-6">

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 group"
      >
        <span className="bg-nb-purple text-white text-sm font-black px-2.5 py-1 rounded-md
                         shadow-[2px_2px_0_rgba(0,0,0,0.8)]
                         group-hover:bg-black transition-colors">
          CAMPUS
        </span>
        <span className="font-display font-black text-xl text-black tracking-tight">
          CONNECT.
        </span>
      </button>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[600px] bg-white rounded-2xl overflow-hidden
                   border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]"
      >

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="bg-nb-purple px-8 py-6 flex items-center gap-4">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center
                          shadow-[2px_2px_0_rgba(255,229,0,0.9)] shrink-0">
            <Shield className="w-6 h-6 text-nb-purple" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white tracking-tight leading-none">
              ORGANIZER LOGIN
            </h1>
            <p className="text-nb-yellow text-xs font-semibold tracking-widest mt-1 uppercase">
              Secure · Authenticate
            </p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="px-8 py-7 space-y-5">

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dev OTP display */}
          {generatedOtp && (
            <div className="bg-nb-yellow/30 border border-nb-yellow rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">
                Access Code (dev)
              </p>
              <p className="font-display font-black text-3xl text-black tracking-[0.3em]">
                {generatedOtp}
              </p>
            </div>
          )}

          {/* ── Step: Email ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                onSubmit={handleSendOTP}
                className="space-y-5"
              >
                {/* Info box — glass style */}
                <div className="flex items-start gap-3 rounded-lg px-4 py-3
                                bg-white/40 backdrop-blur-sm border border-black/15">
                  <Lock className="w-4 h-4 text-nb-purple mt-0.5 shrink-0" />
                  <p className="text-sm text-black/60 font-medium leading-snug">
                    We'll send a one-time code to verify your organizer account.
                  </p>
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-black/70 tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 pointer-events-none" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={e => handleEmailChange(e.target.value)}
                      required
                      placeholder="you@college.edu"
                      className={`w-full pl-10 pr-10 py-3 text-sm font-semibold rounded-lg
                                  bg-white border-2 transition-all outline-none
                                  placeholder:text-black/30
                                  ${emailValid === null
                                    ? 'border-black/20 focus:border-nb-purple shadow-[2px_2px_0_rgba(0,0,0,0.15)] focus:shadow-[2px_2px_0_rgba(116,0,232,0.4)]'
                                    : emailValid
                                      ? 'border-green-400 shadow-[2px_2px_0_rgba(34,197,94,0.4)]'
                                      : 'border-red-400 shadow-[2px_2px_0_rgba(239,68,68,0.4)]'
                                  }`}
                    />
                    {emailValid !== null && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {emailValid
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <AlertCircle className="w-4 h-4 text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading || !emailValid}
                  className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide
                              border-2 transition-all
                              ${emailValid && !loading
                                ? `bg-nb-yellow text-black border-black/80
                                   shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                                   hover:shadow-[5px_5px_0_rgba(0,0,0,0.9)]
                                   hover:-translate-x-0.5 hover:-translate-y-0.5
                                   active:shadow-[1px_1px_0_rgba(0,0,0,0.7)]
                                   active:translate-x-0.5 active:translate-y-0.5`
                                : 'bg-black/5 text-black/30 border-black/10 cursor-not-allowed'
                              }`}
                >
                  {loading ? 'Sending code…' : 'Request Code →'}
                </button>
              </motion.form>

            ) : (
              /* ── Step: OTP ──────────────────────────────────── */
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleVerifyOTP}
                className="space-y-5"
              >
                {/* Sent-to label */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">
                    Code sent to
                  </p>
                  <p className="font-bold text-sm text-nb-purple bg-nb-purple/10
                                 rounded-lg px-3 py-1.5 inline-block">
                    {email}
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpInputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-2xl font-black rounded-lg
                                  border-2 outline-none transition-all
                                  ${digit
                                    ? 'bg-nb-yellow border-black shadow-[2px_2px_0_rgba(0,0,0,0.8)]'
                                    : 'bg-white border-black/20 focus:border-nb-purple focus:shadow-[2px_2px_0_rgba(116,0,232,0.4)]'
                                  }`}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-black/40 font-semibold">
                      Resend in <span className="text-nb-purple font-bold">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-xs font-bold text-nb-purple hover:underline transition-colors"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                {/* Verify CTA */}
                <button
                  type="submit"
                  disabled={loading || !isOtpComplete}
                  className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide
                              border-2 transition-all
                              ${isOtpComplete && !loading
                                ? `bg-nb-purple text-white border-nb-purple/80
                                   shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                                   hover:shadow-[5px_5px_0_rgba(0,0,0,0.9)]
                                   hover:-translate-x-0.5 hover:-translate-y-0.5
                                   active:shadow-[1px_1px_0_rgba(0,0,0,0.7)]
                                   active:translate-x-0.5 active:translate-y-0.5`
                                : 'bg-black/5 text-black/30 border-black/10 cursor-not-allowed'
                              }`}
                >
                  {loading ? 'Verifying…' : 'Verify & Sign In →'}
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setGeneratedOtp('') }}
                  className="w-full flex items-center justify-center gap-1.5
                             text-xs font-semibold text-black/40 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Divider ──────────────────────────────────────── */}
          <div className="border-t border-black/10 pt-5 flex flex-col items-center gap-3">
            <p className="text-xs text-black/40 font-medium">Not an organizer?</p>
            <button
              onClick={() => navigate('/role-selection')}
              className="px-5 py-2 rounded-lg text-sm font-bold text-black
                         border border-black/20 bg-transparent
                         hover:bg-black/5 hover:border-black/40
                         transition-all"
            >
              Browse as Participant →
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
