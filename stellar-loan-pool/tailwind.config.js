/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#04060D',
          900: '#080C17',
          800: '#0E1525',
          750: '#121C30',
          700: '#182236',
          600: '#243348',
          500: '#344a64',
        },
        violet: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        teal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        stellarblue: {
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        mist: '#94A3B8',
        'mist-light': '#CBD5E1',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'glow-violet': '0 0 0 1px rgba(139,92,246,0.3), 0 0 32px -4px rgba(139,92,246,0.4)',
        'glow-teal':   '0 0 0 1px rgba(20,184,166,0.3),  0 0 32px -4px rgba(20,184,166,0.4)',
        'glow-amber':  '0 0 0 1px rgba(245,158,11,0.3),  0 0 32px -4px rgba(245,158,11,0.4)',
        'glow-blue':   '0 0 0 1px rgba(59,130,246,0.25), 0 0 24px -4px rgba(59,130,246,0.35)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.25)',
        'card-hover':  '0 2px 8px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pool-hero': 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(20,184,166,0.06) 100%)',
      },
      keyframes: {
        pulseSlow: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '1' },
        },
        fadeSlideIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideOut: {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-8px)' },
        },
        flowDot: {
          '0%':   { transform: 'translateX(0%)',   opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        scalePop: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '70%':  { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        poolFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
      },
      animation: {
        pulseSlow:    'pulseSlow 2.4s ease-in-out infinite',
        fadeSlideIn:  'fadeSlideIn 0.25s ease-out both',
        fadeSlideOut: 'fadeSlideOut 0.2s ease-in both',
        flowDot:      'flowDot 1.8s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
        'spin-slow':  'spin 1.4s linear infinite',
        scalePop:     'scalePop 0.3s ease-out both',
        poolFill:     'poolFill 0.6s ease-out both',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
