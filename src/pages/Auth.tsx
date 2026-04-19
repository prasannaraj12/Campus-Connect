import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Mail, Lock, Check, AlertCircle, Shield, Zap, Sparkles } from 'lucide-react'
import { Brainbox, GhostBlob, NBStar } from '../components/Mascots'

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
    <div className="min-h-screen bg-nb-green flex items-center justify-center p-4 relative overflow-hidden grid-bg">
      {/* Background Decorative Elements - Fixed positioning */}
      <Brainbox className="absolute top-[-5%] left-[-5%] w-80 h-80 opacity-20 hidden lg:block rotate-[-15deg] pointer-events-none" />
      <GhostBlob className="absolute bottom-[-5%] right-[-5%] w-80 h-80 opacity-20 hidden lg:block rotate-[15deg] pointer-events-none" />
      
      <div className="absolute bottom-10 left-10 flex gap-4 opacity-20 pointer-events-none">
        <Zap className="w-16 h-16 text-black" />
        <NBStar className="w-16 h-16" />
      </div>

      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <button onClick={() => navigate('/')} className="font-display font-black text-5xl text-black tracking-tighter uppercase italic flex items-center gap-3 hover:scale-105 transition-transform group">
          CAMPUS<span className="bg-nb-purple text-white px-4 border-4 border-black -rotate-3 shadow-[8px_8px_0_#FFF500] group-hover:rotate-0 transition-transform">CONNECT.</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="nb bg-white w-full max-w-md relative z-10 border-4 shadow-[20px_20px_0_#7400E8] overflow-hidden"
      >
        {/* Header strip */}
        <div className="bg-nb-purple border-b-4 border-black px-10 py-10 text-white relative">
          <div className="absolute top-6 right-6 text-nb-green opacity-30 pointer-events-none"><Zap className="w-16 h-16" /></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0_#FFF500] rotate-3">
              <Shield className="w-10 h-10 text-black stroke-[3px]" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-black uppercase italic tracking-tighter leading-none">COMMAND_LOGIN</h1>
              <p className="text-nb-yellow text-[10px] font-black uppercase tracking-[0.4em] mt-3 underline underline-offset-4 decoration-4">SECURE // AUTHENTICATE</p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="nb bg-nb-pink text-white p-5 mb-8 flex items-center gap-4 border-4 border-black shadow-[6px_6px_0_#000000]">
                <AlertCircle className="w-8 h-8 flex-shrink-0" />
                <p className="text-xs font-black uppercase italic tracking-widest">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {generatedOtp && (
            <div className="nb bg-nb-yellow border-4 border-black p-6 mb-10 shadow-[8px_8px_0_#000000] rotate-[-1deg]">
              <p className="font-black text-[10px] text-black/40 uppercase tracking-[0.3em] mb-2 underline decoration-black/10">INTERCEPTED_ACCESS_CODE</p>
              <p className="font-display font-black text-4xl text-black tracking-[0.4em] italic leading-none">{generatedOtp}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP} className="space-y-8">
                <div className="nb bg-nb-cream p-5 flex items-center gap-4 text-[10px] font-black text-black border-4 border-black shadow-[6px_6px_0_#7400E8] italic uppercase">
                  <Lock className="w-6 h-6 flex-shrink-0 text-nb-purple" />
                  WE WILL DISPATCH A ONE-TIME AUTH CODE TO VERIFY YOUR OPERATIVE STATUS.
                </div>

                <div>
                  <label className="block font-black text-[12px] mb-4 uppercase tracking-[0.3em] italic underline decoration-nb-purple decoration-4 underline-offset-4">INTEL_ADDRESS (EMAIL)</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`nb-input w-full pl-14 pr-14 py-6 text-sm uppercase font-black border-4 shadow-[8px_8px_0_#000000] transition-all bg-nb-cream/20 ${emailValid === null ? 'border-black' : emailValid ? 'border-nb-green shadow-nb-green/20' : 'border-nb-pink shadow-nb-pink/20'}`}
                      placeholder="OPERATIVE@COLLEGE.EDU"
                    />
                    {emailValid !== null && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {emailValid ? <Check className="w-8 h-8 text-nb-green stroke-[4px]" /> : <AlertCircle className="w-8 h-8 text-nb-pink stroke-[4px]" />}
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={loading || !emailValid}
                  className={`nb w-full py-6 text-xl font-black uppercase tracking-[0.4em] border-4 shadow-[10px_10px_0_#000000] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all italic ${emailValid ? 'bg-nb-purple text-white hover:bg-nb-yellow hover:text-black' : 'bg-nb-paper text-black/20 cursor-not-allowed shadow-none border-black/10'}`}>
                  {loading ? 'TRANSMITTING...' : 'REQUEST_CODE →'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} className="space-y-8">
                <div className="text-center mb-10">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-4 underline decoration-black/10 underline-offset-8">ENTER THE 6-DIGIT CODE DISPATCHED TO</p>
                  <p className="font-display font-black text-2xl mt-4 bg-nb-purple text-white px-4 py-2 border-4 border-black -rotate-1 shadow-[6px_6px_0_#00FF75] italic tracking-tighter">{email}</p>
                </div>

                <div className="flex justify-center gap-4" onPaste={handleOtpPaste}>
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
                      className={`w-12 h-20 text-center text-3xl font-black border-4 shadow-[6px_6px_0_#000000] focus:shadow-none focus:translate-x-1.5 focus:translate-y-1.5 transition-all ${digit ? 'bg-nb-yellow border-black rotate-2 shadow-none' : 'bg-white border-black/20'}`}
                    />
                  ))}
                </div>

                <div className="text-center text-sm">
                  {resendTimer > 0 ? (
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] italic">RETRANSMIT_SYNC IN <span className="text-nb-purple font-black underline decoration-4 underline-offset-4">{resendTimer}S</span></p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} className="text-[10px] font-black uppercase tracking-[0.3em] underline underline-offset-8 decoration-nb-purple decoration-4 hover:text-nb-purple transition-colors italic">
                      RETRANSMIT_CODE
                    </button>
                  )}
                </div>

                <button type="submit" disabled={loading || !isOtpComplete}
                  className={`nb w-full py-6 text-xl font-black uppercase tracking-[0.4em] border-4 shadow-[10px_10px_0_#000000] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all italic ${isOtpComplete ? 'bg-nb-purple text-white hover:bg-nb-green hover:text-black' : 'bg-nb-paper text-black/20 cursor-not-allowed shadow-none border-black/10'}`}>
                  {loading ? 'VALIDATING...' : 'VERIFY_SYNC →'}
                </button>

                <button type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setGeneratedOtp('') }}
                  className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-black/40 hover:text-black transition-colors italic underline decoration-black/10 underline-offset-8">
                  ← REVISE_INTEL_ADDRESS
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-10 border-t-4 border-black text-center">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-6 underline decoration-black/10 underline-offset-8">NOT AN ORGANIZER?</p>
            <button onClick={() => navigate('/role-selection')} className="nb bg-white text-black font-black px-10 py-4 text-xs uppercase tracking-[0.3em] border-4 shadow-[8px_8px_0_#FF2D92] hover:bg-nb-purple hover:text-white transition-all italic hover:shadow-none hover:translate-x-1 hover:translate-y-1">
              ENTER AS PIONEER →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
