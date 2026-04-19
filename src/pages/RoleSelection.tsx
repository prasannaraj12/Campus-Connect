import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Briefcase, ArrowRight } from 'lucide-react'
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
  const createAnonymousUser = useMutation(api.users.createAnonymousUser)

  const handleParticipant = async () => {
    try {
      setLoading(true)
      setSelected('participant')
      setError('')
      const userId = await createAnonymousUser({ name: 'Anonymous' })
      await new Promise(r => setTimeout(r, 300))
      login({ userId, role: 'participant', name: 'Anonymous' })
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (id: string) => {
    if (id === 'participant') handleParticipant()
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
    </div>
  )
}
