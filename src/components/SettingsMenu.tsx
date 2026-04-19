import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Check } from 'lucide-react'
import { useLanguage } from '../hooks/use-language'

interface Props {
  onClose: () => void
}

// Indian languages only
const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',  flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी',    flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',    flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',   flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',    flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',   flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',    flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',    flag: '🇮🇳' },
]

export default function SettingsMenu({ onClose }: Props) {
  const { language, setLanguage } = useLanguage()

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <AnimatePresence>
      <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl
                     border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                     w-full max-w-[520px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-nb-purple flex items-center justify-center
                              shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-display text-base font-black text-black tracking-tight">Settings</h2>
                <p className="text-xs text-black/40 font-medium">Language preference</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10
                         flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-black/60" />
            </button>
          </div>

          {/* Language section */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                Language
              </p>
              <span className="text-xs font-semibold text-black/50">
                {current.flag} {current.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl
                                text-sm font-semibold transition-all text-left
                                border
                                ${isActive
                                  ? 'bg-nb-purple text-white border-nb-purple shadow-[2px_2px_0_rgba(0,0,0,0.7)]'
                                  : 'bg-black/3 text-black border-black/15 hover:bg-black/8 hover:border-black/25'
                                }`}
                  >
                    <span className="text-base leading-none shrink-0">{lang.flag}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight truncate">{lang.name}</p>
                      <p className={`text-xs leading-tight truncate ${isActive ? 'text-white/70' : 'text-black/40'}`}>
                        {lang.native}
                      </p>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-auto" />}
                  </button>
                )
              })}
            </div>

            <p className="text-[10px] text-black/35 font-medium text-center pt-1">
              Language applies instantly across the app
            </p>
          </div>

          {/* Done */}
          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-sm font-bold
                         bg-nb-green text-black border border-black/20
                         shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                         hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-px
                         active:shadow-[1px_1px_0_rgba(0,0,0,0.7)] active:translate-y-0
                         transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
