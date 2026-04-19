import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Briefcase, ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { Brainbox, GhostBlob, HappyDog, NBStar } from '../components/Mascots'

export default function RoleSelection() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const createAnonymousUser = useMutation(api.users.createAnonymousUser)

  const handleParticipant = async () => {
    try {
      setLoading(true)
      setError('')
      
      const userId = await createAnonymousUser({ name: 'Anonymous' })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      login({
        userId,
        role: 'participant',
        name: 'Anonymous'
      })
      
      navigate('/dashboard')
    } catch (err) {
      console.error('Error creating participant:', err)
      setError('Failed to create participant account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizer = () => {
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-nb-purple flex flex-col items-center justify-center p-6 relative overflow-hidden grid-bg">
      {/* Background Decorative Elements - Fixed positioning */}
      <Brainbox className="absolute top-10 right-4 w-64 h-64 md:w-80 md:h-80 opacity-20 rotate-12 pointer-events-none" />
      <HappyDog className="absolute bottom-10 left-4 w-64 h-64 md:w-80 md:h-80 opacity-20 -rotate-12 pointer-events-none" />

      <div className="mb-20">
        <button onClick={() => navigate('/')} className="font-display font-black text-5xl text-white tracking-tighter uppercase italic flex items-center gap-4 hover:scale-110 transition-transform group">
          CAMPUS<span className="bg-nb-yellow text-black px-6 py-2 nb-pill border-4 border-black -rotate-3 shadow-[8px_8px_0_#FFF500] group-hover:rotate-0 transition-transform">CONNECT.</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full relative z-10"
      >
        <div className="text-center mb-16">
          <p className="text-nb-green font-black text-xs uppercase tracking-[0.6em] mb-6 underline decoration-nb-green underline-offset-8 decoration-4">AUTHENTICATION_PROTOCOL_v2.0</p>
          <h1 className="font-display text-7xl md:text-8xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none [text-shadow:8px_8px_0_#000000]">CHOOSE_YOUR_PATH</h1>
          <p className="text-white/60 font-black text-sm uppercase tracking-[0.3em] italic">SELECT_OPERATIONAL_ROLE_TO_CONTINUE</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="nb bg-nb-pink text-white p-6 mb-12 text-center font-black text-sm border-4 shadow-[10px_10px_0_#000000] uppercase italic tracking-widest">
            {error}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-10">
          {/* Participant */}
          <motion.button
            whileHover={{ y: -15, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleParticipant}
            disabled={loading}
            className="nb bg-nb-green text-black p-12 text-left disabled:opacity-60 disabled:cursor-not-allowed group border-4 shadow-[15px_15px_0_#000000] transition-all"
          >
            <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mb-10 shadow-[8px_8px_0_#000000] rotate-[-2deg]">
              <UserCircle className="w-12 h-12 text-black stroke-[3px]" />
            </div>
            <h2 className="font-display text-4xl font-black mb-4 uppercase italic tracking-tighter leading-none underline underline-offset-8 decoration-nb-purple decoration-8">PARTICIPANT</h2>
            <p className="text-black font-black text-xs leading-relaxed mb-10 uppercase tracking-tight italic opacity-70 group-hover:opacity-100">
              BROWSE_ACTIVE_MISSIONS, <br/>LOCK_IN_INSTANTLY, AND ACCESS <br/>HIGH-LEVEL SECURE_QR_PASSES.
            </p>
            <div className="flex items-center gap-4 font-black text-xs uppercase tracking-[0.3em] group-hover:gap-8 transition-all italic border-t-2 border-black/10 pt-8">
              {loading ? (
                <>INITIATING_SYNC...</>
              ) : (
                <>ENTER AS PIONEER <ArrowRight className="w-8 h-8 text-nb-purple stroke-[4px]" /></>
              )}
            </div>
          </motion.button>

          {/* Organizer */}
          <motion.button
            whileHover={{ y: -15, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOrganizer}
            disabled={loading}
            className="nb bg-nb-yellow text-black p-12 text-left disabled:opacity-60 group border-4 shadow-[15px_15px_0_#000000] transition-all"
          >
            <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mb-10 shadow-[8px_8px_0_#000000] rotate-[2deg]">
              <Briefcase className="w-12 h-12 text-black stroke-[3px]" />
            </div>
            <h2 className="font-display text-4xl font-black mb-4 uppercase italic tracking-tighter leading-none underline underline-offset-8 decoration-nb-pink decoration-8">ORGANIZER</h2>
            <p className="text-black font-black text-xs leading-relaxed mb-10 uppercase tracking-tight italic opacity-70 group-hover:opacity-100">
              COMMAND_THE_FIELD. <br/>CREATE_MISSIONS, TRACK_SQUADS, <br/>AND VIEW_INTEL_ANALYTICS.
            </p>
            <div className="flex items-center gap-4 font-black text-xs uppercase tracking-[0.3em] group-hover:gap-8 transition-all italic border-t-2 border-black/10 pt-8">
              HQ_COMMAND_LINK <ArrowRight className="w-8 h-8 text-nb-pink stroke-[4px]" />
            </div>
          </motion.button>
        </div>

        <p className="text-center text-white/40 text-[10px] font-black uppercase tracking-[0.6em] mt-20 italic underline decoration-white/10 underline-offset-8">
          PROTOCOL_SECURITY_SYNC // ALL_RIGHTS_RESERVED_2024
        </p>
      </motion.div>
    </div>
  )
}
