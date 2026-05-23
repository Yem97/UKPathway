import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1a3a',
          50: '#f0f3f9',
          100: '#d8e1f0',
          200: '#b0c2e0',
          300: '#7a9acb',
          400: '#4a72b5',
          500: '#2d559e',
          600: '#1e3f84',
          700: '#162f6a',
          800: '#0d2050',
          900: '#0a1a3a',
          950: '#060f22',
        },
        cream: '#f8f6f1',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        'slide-up': 'slideUp 1.2s ease forwards',
        'counter': 'counter 2s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0a1a3a 0%, #162f6a 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #ffffff 0%, #f0f3f9 100%)',
      },
      boxShadow: {
        'luxury': '0 25px 60px rgba(10, 26, 58, 0.12)',
        'luxury-hover': '0 35px 80px rgba(10, 26, 58, 0.2)',
        'card': '0 4px 24px rgba(10, 26, 58, 0.08)',
        'card-hover': '0 12px 40px rgba(10, 26, 58, 0.16)',
      },
    },
  },
  plugins: [],
}

export default config
