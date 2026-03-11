import { useEffect, useState } from 'react'
import api from '../api'

export default function XPBar() {
  const [stats, setStats] = useState(null)
  const [flash, setFlash] = useState(false)

  const fetch = () => api.get('/stats/').then(r => setStats(r.data))

  useEffect(() => { fetch() }, [])

  // Listen for XP gain events
  useEffect(() => {
    const handler = (e) => {
      setFlash(true)
      setTimeout(() => setFlash(false), 1000)
      fetch()
    }
    window.addEventListener('kaizen:xp', handler)
    return () => window.removeEventListener('kaizen:xp', handler)
  }, [])

  if (!stats) return null

  const pct = stats.xp_in_current_level

  return (
    <div className="flex items-center gap-3">

      {/* Streak */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <span className="text-sm">🔥</span>
        <span className="text-xs font-semibold text-amber-400">{stats.streak}</span>
        <span className="text-xs text-amber-600">streak</span>
      </div>

      {/* Level + XP bar */}
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-300 ${
          flash ? 'bg-green-400 text-black scale-110' : 'bg-green-500/20 text-green-400'
        }`}>
          {stats.level}
        </div>
        <div className="w-24">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-gray-600">Level {stats.level}</span>
            <span className="text-[10px] text-gray-600 font-mono">{stats.xp_in_current_level}/100</span>
          </div>
          <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${flash ? 'bg-green-300' : 'bg-green-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}