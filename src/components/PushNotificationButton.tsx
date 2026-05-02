import { motion } from 'framer-motion'
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { usePush } from '../hooks/use-push'

export default function PushNotificationButton() {
  const { status, subscribe, unsubscribe } = usePush()

  if (status === 'unsupported') return null

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-black/40" />
      </div>
    )
  }

  if (status === 'subscribed') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={unsubscribe}
        title="Notifications on — click to turn off"
        className="relative w-8 h-8 rounded-lg bg-nb-green flex items-center justify-center
                   border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.6)]
                   hover:bg-nb-yellow transition-colors"
      >
        <BellRing className="w-4 h-4 text-black" />
        {/* Live dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-nb-green rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    )
  }

  if (status === 'denied') {
    return (
      <button
        title="Notifications blocked — enable in browser settings"
        className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center opacity-40 cursor-not-allowed"
      >
        <BellOff className="w-4 h-4 text-black" />
      </button>
    )
  }

  // unsubscribed — show subscribe button
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={subscribe}
      title="Enable push notifications"
      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center
                 border border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.5)]
                 hover:bg-nb-yellow hover:shadow-[3px_3px_0_rgba(0,0,0,0.7)]
                 transition-all"
    >
      <Bell className="w-4 h-4 text-black/70" />
    </motion.button>
  )
}
