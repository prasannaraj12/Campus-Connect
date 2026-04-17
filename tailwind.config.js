/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      colors: {
        border:     'hsl(0 0% 0%)',
        background: 'hsl(48 33% 97%)',   // warm off-white
        foreground: 'hsl(0 0% 0%)',

        // Neo-brutal accent palette
        nb: {
          yellow:  '#FACC15',   // primary accent
          orange:  '#F97316',   // secondary
          red:     '#EF4444',
          green:   '#22C55E',
          blue:    '#3B82F6',
          purple:  '#A855F7',
          pink:    '#EC4899',
          black:   '#0A0A0A',
          cream:   '#FAFAF5',
          paper:   '#F5F0E8',
        },

        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        accent: {
          300: '#fde68a',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
      },

      // Neo-brutal hard shadows
      boxShadow: {
        'brutal':      '4px 4px 0px 0px #0A0A0A',
        'brutal-lg':   '6px 6px 0px 0px #0A0A0A',
        'brutal-xl':   '8px 8px 0px 0px #0A0A0A',
        'brutal-sm':   '2px 2px 0px 0px #0A0A0A',
        'brutal-color':'4px 4px 0px 0px #FACC15',
        'glass':       '0 8px 32px rgba(0,0,0,0.12)',
        'card':        '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover':  '0 12px 32px rgba(0,0,0,0.14)',
      },

      borderWidth: {
        '3': '3px',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.4s ease-out forwards',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'slide-in':       'slide-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}

