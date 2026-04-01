export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: 'var(--bg-surface)',
        panel:   'var(--bg-panel)',
        border:  'var(--bg-border)',
        muted:   'var(--bg-muted)',
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