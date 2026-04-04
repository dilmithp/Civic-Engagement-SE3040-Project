/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        surfaceHover: 'var(--surface-hover)',
        border: 'var(--border-color)',
        textMain: 'var(--text-main)',
        textMuted: 'var(--text-muted)',
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa', // soft violet accents
          500: '#8b5cf6',
          600: '#7c3aed', // purple primary
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
