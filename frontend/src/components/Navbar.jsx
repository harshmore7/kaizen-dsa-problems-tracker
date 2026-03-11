import { Link, useLocation } from 'react-router-dom'
import XPBar from './XPBar'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center glow-green">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9L5 4L7 7L9 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-cal text-[15px] text-white tracking-tight">Kaizen</span>
        </div>

        {/* Nav tabs */}
        <div className="flex items-center bg-panel border border-border rounded-lg p-1 gap-0.5">
          {[['/', 'Problems'], ['/analytics', 'Analytics']].map(([path, label]) => (
            <Link key={path} to={path}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                pathname === path
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* XP Bar */}
        <XPBar />

      </div>
    </nav>
  )
}