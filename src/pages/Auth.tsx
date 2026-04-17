import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Mail, Lock, Check, AlertCircle, Shield } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOTP = useMutation(api.auth.sendOTP)
  const verifyOTP = useMutation(api.auth.verifyOTP)
  const createOrganizerUser = useMutation(api.users.createOrganizerUser)

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Email validation
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(value)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.length > 0) {
      setEmailValid(validateEmail(value))
    } else {
      setEmailValid(null)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValid) return

    setLoading(true)
    setError('')

    try {
      const result = await sendOTP({ email })
      setGeneratedOtp(result.code || '')
      setStep('otp')
      setResendTimer(30)
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    otpInputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return

    setLoading(true)
    setError('')

    try {
      await verifyOTP({ email, code })
      const userId = await createOrganizerUser({ email })
      login({ userId, role: 'organizer', email })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    setError('')
    try {
      const result = await sendOTP({ email })
      setGeneratedOtp(result.code || '')
      setResendTimer(30)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const isOtpComplete = otp.every(d => d !== '')

  return (
    <div className="min-h-screen bg-nb-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-nb-yellow opacity-5" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-nb-orange opacity-5" />

      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <button onClick={() => navigate('/')} className="font-display font-bold text-xl text-white tracking-tight">
          Campus<span className="text-nb-yellow">Connect</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="nb-lg bg-white w-full max-w-md relative z-10"
      >
        {/* Header strip */}
        <div className="bg-nb-yellow border-b-4 border-black px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nb-black border-2 border-black flex items-center justify-center">
              <Shield className="w-5 h-5 text-nb-yellow" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-black">Organizer Login</h1>
              <p className="text-black/60 text-xs font-medium">Secure · No password required</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="nb-sm bg-red-400 text-black p-3 mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dev OTP */}
          {generatedOtp && (
            <div className="nb-sm bg-nb-yellow p-3 mb-5">
              <p className="font-bold text-sm text-black">Your OTP: <span className="font-mono tracking-widest">{generatedOtp}</span></p>
              <p className="text-xs text-black/60 mt-0.5">In production, this would be emailed</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form key="email" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                onSubmit={handleSendOTP} className="space-y-5">
                <div className="nb-sm bg-nb-paper p-3 flex items-center gap-2 text-sm text-black/60">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  We'll send a one-time code to verify your account.
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`nb-input w-full pl-10 pr-10 py-3 text-sm ${emailValid === null ? '' : emailValid ? 'input-valid' : 'input-invalid'}`}
                      placeholder="name@college.edu"
                    />
                    {emailValid !== null && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {emailValid ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                    )}
                  </div>
                  {emailValid === false && email && (
                    <p className="validation-message error">Please enter a valid email address</p>
                  )}
                </div>

                <button type="submit" disabled={loading || !emailValid}
                  className={`nb-btn w-full py-3 text-sm ${emailValid ? 'bg-nb-yellow text-black' : 'bg-nb-paper text-black/40 cursor-not-allowed shadow-none border-black/20'}`}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-black/50">Enter the 6-digit code sent to</p>
                  <p className="font-bold text-sm mt-0.5">{email}</p>
                </div>

                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
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
                      className={`w-11 h-12 text-center text-xl font-bold nb-input transition-all ${digit ? 'bg-nb-yellow' : 'bg-white'}`}
                    />
                  ))}
                </div>

                <div className="text-center text-sm">
                  {resendTimer > 0 ? (
                    <p className="text-black/40 font-medium">Resend in <span className="font-bold text-black">{resendTimer}s</span></p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} className="font-bold underline underline-offset-2">
                      Resend OTP
                    </button>
                  )}
                </div>

                <button type="submit" disabled={loading || !isOtpComplete}
                  className={`nb-btn w-full py-3 text-sm ${isOtpComplete ? 'bg-nb-yellow text-black' : 'bg-nb-paper text-black/40 cursor-not-allowed shadow-none border-black/20'}`}>
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setGeneratedOtp('') }}
                  className="w-full text-center text-sm font-semibold text-black/50 hover:text-black transition-colors">
                  ← Change email
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t-2 border-black text-center text-sm text-black/50">
            Are you a participant?{' '}
            <button onClick={() => navigate('/role-selection')} className="font-bold text-black underline underline-offset-2">
              Participant Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
