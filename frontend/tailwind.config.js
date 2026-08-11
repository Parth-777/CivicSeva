/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
        dm: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1a9e8f',
          light: '#22c5b2',
        },
        bg: {
          DEFAULT: '#f0f1f3',
          2: '#e8eaed',
        },
        fg: '#0e1117',
        card: '#ffffff',
        muted: '#7a8799',
        border: '#dde1e7',
        orange: '#f0792a',
        blue: '#4a90d9',
        green: '#1a9e8f',
        red: '#e04b4b',
        yellow: '#f5a623',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(14,17,23,0.08)',
        'card-lg': '0 12px 48px rgba(14,17,23,0.14)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.5', transform: 'scale(1.5)' },
        },
        floatPill: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        photoscroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        spinStar: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s ease forwards',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        pulseDot: 'pulseDot 2s infinite',
        floatPill: 'floatPill 3s ease-in-out infinite',
        photoscroll: 'photoscroll 28s linear infinite',
        spinStar: 'spinStar 8s linear infinite',
      },
    },
  },
  plugins: [],
}