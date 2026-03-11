/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: '#0f0f0f',
        panel:   '#161616',
        border:  '#1f1f1f',
        muted:   '#2a2a2a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        cal:  ['Cal Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}