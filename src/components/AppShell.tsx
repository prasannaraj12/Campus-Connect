/**
 * AppShell — shared navbar + page wrapper.
 * Refined: glass blur, scroll effect, balanced logo, consistent buttons.
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, BarChart3, History, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function AppShell({ children, className = '' }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const userName = user?.name?.split(' ')[0] || (user?.role === 'organizer' ? 'Organizer' : 'Participant')
  const initial = userName.charAt(0).toUpperCase()

  const handleLogout = () => { logout(); navigate('/') }

  const navLinks =
    user?.role === 'organizer'
      ? [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
         { label: 'Analytics', icon: BarChart3, path: '/analytics' }]
      : [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
         { label: 'My History', icon: History, path: '/my-history' }]

  return (
    <div className={`min-h-screen flex flex-col bg-nb-cream grid-bg ${className}`}>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-black/10 shadow-[0_2px_0_rgba(0,0,0,0.08)]'
            : 'bg-white/60 backdrop-blur-md border-b border-black/10'
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* ── Logo ──────────────────────────────────────────── */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 group shrink-0"
          >
            <span className="bg-nb-purple text-white text-sm font-black px-2 py-0.5 rounded-md
                             group-hover:bg-nb-yellow group-hover:text-black
                             transition-all duration-200 shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              CAMPUS
            </span>
            <span className="font-display font-black text-lg text-black tracking-tight">
              CONNECT.
            </span>
          </button>

          {/* ── Nav Links (desktop) ───────────────────────────── */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, icon: Icon, path }) => {
                const active = location.pathname === path
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold
                                transition-all duration-150
                                ${active
                                  ? 'bg-nb-purple text-white shadow-[2px_2px_0_rgba(0,0,0,0.8)]'
                                  : 'text-black/70 hover:bg-black/5 hover:text-black'
                                }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                )
              })}
            </nav>
          )}

          {/* ── Right side ────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="relative" ref={ref}>
                {/* Profile button */}
                <button
                  onClick={() => setOpen(!open)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm font-semibold
                              transition-all duration-150
                              ${open
                                ? 'bg-nb-yellow border-black/30 shadow-[2px_2px_0_rgba(0,0,0,0.7)]'
                                : 'bg-white border-black/20 hover:border-black/40 hover:shadow-[2px_2px_0_rgba(0,0,0,0.5)]'
                              }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-md bg-nb-purple flex items-center justify-center
                                  text-white text-xs font-black shadow-[1px_1px_0_rgba(0,0,0,0.6)]">
                    {initial}
                  </div>
                  <span className="hidden sm:block tracking-tight">{userName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-black/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* ── Dropdown ──────────────────────────────── */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 z-50 overflow-hidden
                                 bg-white/95 backdrop-blur-xl
                                 border border-black/15
                                 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 bg-nb-yellow/80 border-b border-black/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-nb-purple flex items-center justify-center
                                          text-white text-sm font-black">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-none text-black">{user.name || userName}</p>
                            <p className="text-[10px] text-black/50 uppercase tracking-wider mt-0.5 font-semibold">{user.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Nav items */}
                      <div className="py-1">
                        {navLinks.map(({ label, icon: Icon, path }) => (
                          <button
                            key={path}
                            onClick={() => { navigate(path); setOpen(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold
                                       flex items-center gap-3 text-black/80
                                       hover:bg-nb-green/40 hover:text-black transition-colors"
                          >
                            <Icon className="w-4 h-4 opacity-60" />
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-black/10 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold
                                     flex items-center gap-3 text-red-600
                                     hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not logged in */
              <button
                onClick={() => navigate('/role-selection')}
                className="px-4 py-2 rounded-lg bg-nb-yellow text-black text-sm font-bold
                           border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.7)]
                           hover:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:-translate-x-px hover:-translate-y-px
                           active:shadow-[1px_1px_0_rgba(0,0,0,0.6)] active:translate-x-px active:translate-y-px
                           transition-all duration-150"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
