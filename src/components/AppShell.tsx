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
    <div className={`min-h-screen flex flex-col bg-nb-cream grid-bg ${className}`}>
      {/* ── Neo-Brutal Navbar ─────────────────────────────── */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-display font-black text-2xl text-black tracking-tighter flex items-center group uppercase"
          >
            <span className="bg-nb-purple text-white border-3 border-black px-2 py-0.5 group-hover:bg-nb-yellow group-hover:text-black transition-colors rotate-[-1deg]">CAMPUS</span>
            <span className="ml-2">CONNECT.</span>
          </button>

          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 nb-sm bg-white nb-hover shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-3 border-black"
              >
                <div className="w-8 h-8 bg-nb-purple border-3 border-black flex items-center justify-center font-black text-sm text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {initial}
                </div>
                <span className="hidden sm:block font-black text-sm tracking-tighter italic">{userName.toUpperCase()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-4 w-60 bg-white nb-lg border-4 border-black overflow-hidden z-50 shadow-[10px_10px_0_#000000]"
                  >
                    <div className="px-6 py-5 bg-nb-yellow border-b-4 border-black">
                      <p className="font-black text-lg leading-none mb-1 uppercase italic tracking-tighter">{user.name || userName}</p>
                      <p className="text-[10px] text-black/70 uppercase tracking-[0.3em] font-black">{user.role}</p>
                    </div>
                    <div className="py-2 bg-white">
                      {user.role === 'organizer' && (
                        <button onClick={() => { navigate('/analytics'); setOpen(false) }}
                          className="w-full px-5 py-4 text-left text-xs font-black uppercase tracking-widest hover:bg-nb-green transition-colors flex items-center gap-4">
                          <BarChart3 className="w-5 h-5" /> Analytics
                        </button>
                      )}
                      {user.role === 'participant' && (
                        <button onClick={() => { navigate('/my-history'); setOpen(false) }}
                          className="w-full px-5 py-4 text-left text-xs font-black uppercase tracking-widest hover:bg-nb-green transition-colors flex items-center gap-4">
                          <History className="w-5 h-5" /> My History
                        </button>
                      )}
                      <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
                        className="w-full px-5 py-4 text-left text-xs font-black uppercase tracking-widest hover:bg-nb-green transition-colors flex items-center gap-4">
                        <Settings className="w-5 h-5" /> Dashboard
                      </button>
                    </div>
                    <div className="border-t-4 border-black">
                      <button onClick={handleLogout}
                        className="w-full px-5 py-5 text-left text-xs font-black uppercase tracking-widest text-white bg-nb-red hover:bg-black transition-colors flex items-center gap-4 group">
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/role-selection')}
              className="nb-btn bg-nb-yellow text-black px-6 py-2.5 text-xs font-black tracking-widest uppercase"
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
