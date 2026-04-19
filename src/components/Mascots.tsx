import { motion } from 'framer-motion'

export const Brainbox = ({ className }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className={className}
    initial={{ y: 0 }}
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* Jar */}
    <rect x="50" y="60" width="100" height="120" rx="20" fill="white" stroke="black" strokeWidth="6" />
    <rect x="60" y="40" width="80" height="20" fill="#7400E8" stroke="black" strokeWidth="6" />
    {/* Brain */}
    <path
      d="M70 120c0-15 10-25 25-25s25 10 25 25-10 25-25 25-25-10-25-25z"
      fill="#FF2D92"
      stroke="black"
      strokeWidth="4"
    />
    <path d="M85 110c0 5 5 5 5 0s-5-5-5 0z" fill="black" />
    <path d="M105 110c0 5 5 5 5 0s-5-5-5 0z" fill="black" />
    {/* Liquid bubbles */}
    <circle cx="75" cy="150" r="4" fill="#00FF75" stroke="black" strokeWidth="2" />
    <circle cx="125" cy="140" r="3" fill="#00FF75" stroke="black" strokeWidth="2" />
  </motion.svg>
)

export const HappyDog = ({ className }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className={className}
    animate={{ rotate: [-2, 2, -2] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* Face */}
    <circle cx="100" cy="100" r="70" fill="white" stroke="black" strokeWidth="6" />
    {/* Ears */}
    <ellipse cx="40" cy="80" rx="15" ry="30" fill="white" stroke="black" strokeWidth="6" rotate="-30" />
    <ellipse cx="160" cy="80" rx="15" ry="30" fill="white" stroke="black" strokeWidth="6" rotate="30" />
    {/* Eyes */}
    <rect x="75" y="80" width="10" height="15" rx="5" fill="black" />
    <rect x="115" y="80" width="10" height="15" rx="5" fill="black" />
    {/* Nose */}
    <circle cx="100" cy="110" r="8" fill="black" />
    {/* Mouth */}
    <path d="M80 130c10 10 30 10 40 0" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
  </motion.svg>
)

export const GhostBlob = ({ className }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 200 200"
    className={className}
    animate={{ scale: [1, 1.05, 1], y: [0, 5, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
  >
    <path
      d="M50 150c0-30 20-80 50-80s50 50 50 80-20 20-50 20-50-10-50-20z"
      fill="#00FF75"
      stroke="black"
      strokeWidth="6"
    />
    <circle cx="100" cy="110" r="15" fill="white" stroke="black" strokeWidth="4" />
    <circle cx="100" cy="110" r="6" fill="black" />
    <path d="M80 140h40" stroke="black" strokeWidth="4" strokeLinecap="round" />
  </motion.svg>
)

export const NBStar = ({ className, color = "#FFF500" }: { className?: string, color?: string }) => (
  <motion.svg
    viewBox="0 0 100 100"
    className={className}
    animate={{ rotate: 360 }}
    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
  >
    <path
      d="M50 0L61 35H98L68 57L79 92L50 70L21 92L32 57L2 35H39L50 0Z"
      fill={color}
      stroke="black"
      strokeWidth="4"
    />
  </motion.svg>
)
