/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: { 1: '#0a0a0f', 2: '#111118', 3: '#1a1a25', 4: '#22222f' },
        accent: { DEFAULT: '#7c6ef5', 2: '#a78bfa', 3: '#c4b5fd' },
        brand: {
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
          pink: '#f472b6',
        },
        text: { 1: '#f0eeff', 2: '#a8a3c8', 3: '#5a5570' },
      },
    },
  },
  plugins: [],
};
