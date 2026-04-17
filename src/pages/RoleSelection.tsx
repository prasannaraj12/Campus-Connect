import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Briefcase, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'

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
    <div className="min-h-screen bg-nb-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background accent blocks */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-nb-yellow opacity-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-nb-orange opacity-10 translate-x-1/2 translate-y-1/2" />

      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <button onClick={() => navigate('/')} className="font-display font-bold text-xl text-white tracking-tight">
          Campus<span className="text-nb-yellow">Connect</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-10">
          <p className="text-nb-yellow font-bold text-xs uppercase tracking-widest mb-3">CampusConnect</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">How are you joining?</h1>
          <p className="text-white/40 text-sm">Choose your role to continue</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="nb-sm bg-red-500 text-white p-4 mb-6 text-center font-semibold text-sm">
            {error}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Participant */}
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleParticipant}
            disabled={loading}
            className="nb-lg bg-nb-yellow text-black p-8 text-left disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-nb-black border-2 border-black flex items-center justify-center mb-5">
              <UserCircle className="w-6 h-6 text-nb-yellow" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Participant</h2>
            <p className="text-black/60 text-sm leading-relaxed mb-5">
              Browse events, register instantly, get QR tickets, and engage with the community.
            </p>
            <div className="flex items-center gap-2 font-bold text-sm">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>Get started free <ArrowRight className="w-4 h-4" /></>
              )}
            </div>
          </motion.button>

          {/* Organizer */}
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOrganizer}
            disabled={loading}
            className="nb-lg bg-white text-black p-8 text-left disabled:opacity-60 group"
          >
            <div className="w-12 h-12 bg-nb-orange border-2 border-black flex items-center justify-center mb-5">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Organizer</h2>
            <p className="text-black/50 text-sm leading-relaxed mb-5">
              Create events, track attendance, post announcements, and view analytics.
            </p>
            <div className="flex items-center gap-2 font-bold text-sm text-nb-orange">
              Sign in with email <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          By continuing, you agree to our terms of service.
        </p>
      </motion.div>
    </div>
  )
}
