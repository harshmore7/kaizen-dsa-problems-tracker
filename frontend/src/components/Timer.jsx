import { useState, useEffect, useRef } from 'react'
import api from '../api'

export default function Timer({ problem, onTimeSaved }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [saved,   setSaved]   = useState(false)
  const intervalRef = useRef(null)
  const elapsedRef  = useRef(0)

  useEffect(() => { elapsedRef.current = elapsed }, [elapsed])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        const mins = Math.floor(elapsedRef.current / 60)
        if (mins > 0) api.post(`/problems/${problem.id}/log_time/`, { minutes: mins })
      }
    }
  }, [problem.id])

  const start = () => {
    if (running) return
    setRunning(true)
    const startTime = Date.now() - elapsedRef.current * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 500)
  }

  const pause = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const reset = () => {
    pause()
    setElapsed(0)
    elapsedRef.current = 0
    setSaved(false)
  }

  const handleSave = async () => {
    pause()
    const mins = Math.ceil(elapsedRef.current / 60)
    if (mins <= 0) return
    await api.post(`/problems/${problem.id}/log_time/`, { minutes: mins })
    setSaved(true)
    onTimeSaved?.()
    setTimeout(() => setSaved(false), 2000)
  }

  const fmt = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  const totalMins = problem.time_spent_mins || 0
  const totalFmt  = totalMins >= 60
    ? `${Math.floor(totalMins/60)}h ${totalMins%60}m`
    : `${totalMins}m`

  return (
    <div className="flex items-center gap-4 px-5 py-3" style={{ background: 'var(--bg-panel)' }}>

      {/* Timer display */}
      <div className="font-mono text-xl font-bold tabular-nums transition-colors"
        style={{ color: running ? '#22c55e' : elapsed > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
        {fmt(elapsed)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!running ? (
          <button onClick={start}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {elapsed > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            Pause
          </button>
        )}

        {elapsed > 0 && (
          <>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{ background: 'var(--bg-muted)', borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save {Math.ceil(elapsed/60)}m
            </button>
            <button onClick={reset}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Saved flash */}
      {saved && (
        <span className="text-xs text-green-400 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved!
        </span>
      )}

      {/* Total time */}
      {totalMins > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Total: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{totalFmt}</span>
        </div>
      )}
    </div>
  )
}