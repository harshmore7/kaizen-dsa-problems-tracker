import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../ThemeContext'
import XPBar from './XPBar'

const tabs = [
  { label: 'Problems',  path: '/problems'  },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Profile',   path: '/profile'   },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <span className="font-cal text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kaizen
          </span>
        </button>

        {/* Tabs */}
        <div className="flex items-center bg-white/5 border border-border rounded-lg p-0.5">
          {tabs.map(tab => (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                location.pathname === tab.path
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-all hover:bg-white/5"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ color: 'var(--text-secondary)' }}>
            {dark ? (
              /* Sun icon */
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1"  x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1"  y1="12" x2="3"  y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <XPBar />
        </div>
      </div>
    </nav>
  )
}