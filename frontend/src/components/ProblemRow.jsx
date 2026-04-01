import Timer from './Timer'
import { useState } from 'react'
import CodeEditor from './CodeEditor'
import api from '../api'

const diffStyle = {
  easy:   { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10'  },
  medium: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10'  },
  hard:   { dot: 'bg-red-500',   text: 'text-red-400',   bg: 'bg-red-500/10'    },
}
const statusStyle = {
  solved:   { text: 'text-green-400', bg: 'bg-green-500/10', label: 'Solved'   },
  revision: { text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Revision' },
  unsolved: { text: 'text-gray-500',  bg: 'bg-white/5',      label: 'Unsolved' },
}

export default function ProblemRow({ problem: p, onEdit, onDelete, onStatusChange, platColor, platLabel }) {
  const [expanded,  setExpanded]  = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [localP,    setLocalP]    = useState(p)

  const diff   = diffStyle[p.difficulty]  || diffStyle.medium
  const status = statusStyle[p.status]    || statusStyle.unsolved

  if (p.id === localP.id && p.status !== localP.status) setLocalP(p)

  const handleSaved = async () => {
    const res = await api.get(`/problems/${p.id}/`)
    setLocalP(res.data)
  }

  return (
    <>
      {/* Row */}
      <div
        className={`grid grid-cols-[1fr_88px_80px_160px_96px_120px] px-5 py-3.5 transition-all group cursor-pointer
          ${expanded ? 'border-l-2 border-green-500' : 'border-l-2 border-transparent hover:border-green-500/40'}`}
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        onClick={e => { if (!e.target.closest('button') && !e.target.closest('a')) setExpanded(v => !v) }}
      >
        {/* Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="transition-colors shrink-0"
            style={{ color: expanded ? '#22c55e' : 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <div className="min-w-0">
            {p.link ? (
              <a href={p.link} target="_blank" rel="noreferrer"
                className="text-sm font-medium hover:text-green-400 transition-colors truncate block"
                style={{ color: 'var(--text-primary)' }}>
                {p.title}
              </a>
            ) : (
              <span className="text-sm font-medium truncate block" style={{ color: 'var(--text-primary)' }}>
                {p.title}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {p.date_added}
              </span>
              {p.time_spent_mins > 0 && (
                <span className="text-[11px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {p.time_spent_mins >= 60
                    ? `${Math.floor(p.time_spent_mins/60)}h ${p.time_spent_mins%60}m`
                    : `${p.time_spent_mins}m`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Platform */}
        <div className="flex items-center">
          <span className={`tag font-mono font-medium ${platColor[p.platform]}`}>
            {platLabel[p.platform]}
          </span>
        </div>

        {/* Difficulty */}
        <div className="flex items-center">
          <span className={`tag ${diff.text} ${diff.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {p.difficulty}
          </span>
        </div>

        {/* Topics */}
        <div className="flex items-center gap-1 flex-wrap">
          {p.topics?.length > 0
            ? p.topics.slice(0,2).map(t => (
                <span key={t.id} className="tag" style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--bg-border)'
                }}>{t.name}</span>
              ))
            : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
          }
          {p.topics?.length > 2 && (
            <span className="tag" style={{
              background: 'var(--bg-muted)',
              color: 'var(--text-muted)'
            }}>+{p.topics.length - 2}</span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center">
          <span className={`tag ${status.text} ${status.bg}`}>{status.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onStatusChange(p.id, p.status === 'solved' ? 'unsolved' : 'solved') }}
            title={p.status === 'solved' ? 'Mark unsolved' : 'Mark solved'}
            className={`p-1.5 rounded-md transition-colors ${p.status === 'solved' ? 'text-green-500 bg-green-500/10' : 'text-gray-600 hover:text-green-400 hover:bg-green-500/10'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onStatusChange(p.id, p.status === 'revision' ? 'unsolved' : 'revision') }}
            title="Mark for revision"
            className={`p-1.5 rounded-md transition-colors ${p.status === 'revision' ? 'text-amber-500 bg-amber-500/10' : 'text-gray-600 hover:text-amber-400 hover:bg-amber-500/10'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(p) }}
            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(p.id) }}
            className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {expanded && (
        <div className="border-l-2 border-green-500"
          style={{ borderBottom: '1px solid var(--bg-border)', background: 'var(--bg-muted)' }}>

          {/* Timer */}
          <div style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <Timer problem={localP} onTimeSaved={handleSaved} />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 px-10" style={{ borderBottom: '1px solid var(--bg-border)' }}>
            {[
              { id: 'notes', label: 'Notes & Approach' },
              { id: 'code',  label: `Code ${localP.solution?.code ? '✓' : ''}` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-green-500'
                    : 'border-transparent hover:border-green-500/30'
                }`}
                style={{ color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="px-10 py-5 grid grid-cols-3 gap-8">
              {[
                { label: 'Brute Force',        value: localP.solution?.brute_force },
                { label: 'Optimized Approach', value: localP.solution?.optimized,
                  extra: localP.solution?.time_complexity
                    ? `${localP.solution.time_complexity} time · ${localP.solution.space_complexity} space`
                    : null },
                { label: 'Notes', value: localP.notes },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                  {s.value
                    ? <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.value}</p>
                    : <p className="text-sm italic" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Not added</p>
                  }
                  {s.extra && (
                    <div className="mt-2 font-mono text-[11px] text-green-600">{s.extra}</div>
                  )}
                </div>
              ))}
              {localP.topics?.length > 0 && (
                <div className="col-span-3 pt-3 flex gap-2 flex-wrap"
                  style={{ borderTop: '1px solid var(--bg-border)' }}>
                  <span className="text-[11px] uppercase tracking-wider self-center"
                    style={{ color: 'var(--text-muted)' }}>All topics:</span>
                  {localP.topics.map(t => (
                    <span key={t.id} className="tag" style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--bg-border)'
                    }}>{t.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="h-[420px]">
              <CodeEditor problem={localP} onSaved={handleSaved} />
            </div>
          )}
        </div>
      )}
    </>
  )
}