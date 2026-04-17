/**
 * AppShell — shared navbar + page wrapper used by all authenticated pages.
 * Keeps the brand, nav links, and profile dropdown in one place.
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, BarChart3, History, Settings } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'

interface Props {
  children: React.ReactNode
  /** Extra classes on the outer wrapper (e.g. bg colour) */
  className?: string
}

export default function AppShell({ children, className = 'bg-nb-cream' }: Props) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const userName = user?.name?.split(' ')[0] || (user?.role === 'organizer' ? 'Organizer' : 'Participant')
  const initial = userName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`min-h-screen flex flex-col bg-nb-cream ${className}`}>
      {/* ── Glassmorphism Navbar ─────────────────────────────── */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-xl text-nb-black tracking-tight"
          >
            Campus<span className="text-nb-orange">Connect</span>
          </button>

          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 nb-sm bg-white nb-hover"
              >
                <div className="w-7 h-7 bg-nb-yellow border-2 border-black flex items-center justify-center font-bold text-xs">
                  {initial}
                </div>
                <span className="hidden sm:block font-bold text-sm">{userName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-52 bg-white nb border-black overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-nb-yellow border-b-2 border-black">
                      <p className="font-bold text-sm">{user.name || userName}</p>
                      <p className="text-xs text-black/60 capitalize font-medium">{user.role}</p>
                    </div>
                    <div className="py-1">
                      {user.role === 'organizer' && (
                        <button onClick={() => { navigate('/analytics'); setOpen(false) }}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-nb-yellow/30 flex items-center gap-2 transition-colors">
                          <BarChart3 className="w-4 h-4" /> Analytics
                        </button>
                      )}
                      {user.role === 'participant' && (
                        <button onClick={() => { navigate('/my-history'); setOpen(false) }}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-nb-yellow/30 flex items-center gap-2 transition-colors">
                          <History className="w-4 h-4" /> My History
                        </button>
                      )}
                      <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-nb-yellow/30 flex items-center gap-2 transition-colors">
                        <Settings className="w-4 h-4" /> Dashboard
                      </button>
                    </div>
                    <div className="border-t-2 border-black">
                      <button onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/role-selection')}
              className="nb-btn bg-nb-yellow text-black px-4 py-2 text-sm"
            >
              Get Started
            </button>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
