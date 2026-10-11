/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7a98fc',
          500: '#5370f7',
          600: '#354eee',
          700: '#2638d9',
          800: '#202eae',
          900: '#1e2b8a',
          950: '#141a54'
        },
        brand: {
          dark: '#0f172a',
          navy: '#1e293b',
          accent: '#3b82f6',
          gold: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
