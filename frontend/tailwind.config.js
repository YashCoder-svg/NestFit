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
        base: {
          DEFAULT: '#0B1120',
          dark: '#0B1120',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#141B2D',
          elevated: '#1A2332',
          card: '#141B2D',
          hover: '#192238',
          border: '#1F2937',
        },
        primary: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          subtle: 'rgba(13, 148, 136, 0.12)',
          border: 'rgba(13, 148, 136, 0.35)',
        },
        secondary: {
          DEFAULT: '#64748B',
          hover: '#475569',
        },
        pareto: {
          1: '#0D9488', // Muted Teal - Front 1
          2: '#475569', // Slate Blue-Gray - Front 2
          3: '#6B5B95', // Muted Violet-Gray - Front 3+
          excluded: '#334155', // Dark Gray - Excluded
        },
        notice: {
          DEFAULT: '#D97706',
          border: '#78350F',
          subtle: 'rgba(217, 119, 6, 0.08)',
        },
        text: {
          primary: '#E2E8F0',
          secondary: '#94A3B8',
          disabled: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        panel: '12px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.25)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
