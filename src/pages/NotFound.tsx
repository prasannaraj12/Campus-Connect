import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'
import { GhostBlob, NBStar } from '../components/Mascots'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-nb-purple flex items-center justify-center p-6 relative overflow-hidden grid-bg">
      {/* Decorative Elements */}
      <GhostBlob className="absolute top-20 right-10 w-64 h-64 opacity-20 rotate-12" />
      <NBStar className="absolute bottom-20 left-10 w-32 h-32 opacity-20" color="#FFF500" />
      <Zap className="absolute top-1/2 left-10 -translate-y-1/2 w-48 h-48 opacity-10 text-white pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="nb bg-white p-16 text-center max-w-xl border-4 shadow-[20px_20px_0_#000000] relative"
      >
        <div className="absolute -top-10 -left-10 bg-nb-yellow border-4 border-black px-6 py-2 rotate-[-10deg] shadow-[6px_6px_0_#000000]">
          <p className="font-black text-xs uppercase tracking-[0.3em]">ERROR_CODE: 404</p>
        </div>
        
        <h1 className="font-display text-[12rem] font-black mb-0 leading-none italic tracking-tighter [text-shadow:12px_12px_0_#00FF75]">404</h1>
        <h2 className="font-display text-4xl font-black mb-6 uppercase italic tracking-tighter underline underline-offset-8 decoration-nb-pink decoration-8">LOST_IN_TRANSMISSION</h2>
        <p className="text-xl font-black mb-12 uppercase tracking-tight italic opacity-60">
          WE COULD NOT LOCATE THE COORDINATES YOU REQUESTED. <br/>RECALIBRATING_CORE...
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="nb bg-nb-purple text-white px-12 py-6 font-black text-xl uppercase tracking-[0.4em] inline-flex items-center gap-4 border-4 shadow-[10px_10px_0_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
        >
          <Home className="w-8 h-8 stroke-[3px]" />
          RETURN_TO_BASE
        </motion.button>
      </motion.div>
    </div>
  )
}
