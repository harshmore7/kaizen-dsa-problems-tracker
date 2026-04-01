import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import api from '../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Heatmap ───────────────────────────────────────────────────────────────────
function HeatCell({ count, date }) {
  const { dark } = useTheme()
  const bg =
    count === 0 ? (dark ? '#1a1a1a' : '#e4e4e7') :
    count === 1 ? '#14532d' :
    count === 2 ? '#166534' :
    count === 3 ? '#15803d' : '#22c55e'
  return (
    <div title={`${date}: ${count} problem${count !== 1 ? 's' : ''}`}
      style={{ width:11, height:11, background:bg, borderRadius:2, flexShrink:0 }} />
  )
}

function Heatmap({ data }) {
  const today = new Date()
  const days  = []
  for (let i = 364; i >= 0; i--) {
    const d   = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: data[key] || 0 })
  }
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => <HeatCell key={di} count={day.count} date={day.date} />)}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>Less</span>
        {[0,1,2,3,4].map(c => <HeatCell key={c} count={c} date="" />)}
        <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>More</span>
      </div>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs border"
      style={{ background:'var(--bg-panel)', borderColor:'var(--bg-border)', color:'var(--text-secondary)' }}>
      <div className="mb-1 font-medium" style={{ color:'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ title, children, className = '' }) {
  return (
    <div className={`glass rounded-xl p-5 ${className}`}>
      {title && (
        <div className="text-[11px] font-medium uppercase tracking-wider mb-4"
          style={{ color:'var(--text-muted)' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/').then(r => {
      setData(r.data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  )

  const { overview, by_difficulty, by_platform, weaknesses,
          most_practiced, heatmap, progression, user_stats } = data

  const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }

  const progressionData = progression.map(p => ({
    month: p.month, Easy: p.easy, Medium: p.medium, Hard: p.hard,
  }))

  const platformData = Object.entries(by_platform).map(([k, v]) => ({ name: k, count: v }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cal text-2xl mb-1" style={{ color:'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm" style={{ color:'var(--text-muted)' }}>Your coding journey at a glance</p>
      </div>

      {/* XP / Level / Streak hero row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label:'Current Level',  value:`Lvl ${user_stats.level}`,               sub:`${user_stats.xp} total XP`,    color:'#22c55e' },
          { label:'XP This Level',  value:`${user_stats.xp_in_current_level}/100`, sub:'until next level',             color:'#22c55e', bar: user_stats.xp_in_current_level },
          { label:'Current Streak', value:`${user_stats.streak}🔥`,                sub:'consecutive days',             color:'#f59e0b' },
          { label:'Longest Streak', value:`${user_stats.longest_streak}🏆`,        sub:'personal best',                color:'#f59e0b' },
        ].map((s, i) => (
          <Card key={i}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>{s.label}</div>
            <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)', opacity:0.7 }}>{s.sub}</div>
            {s.bar !== undefined && (
              <div className="mt-3 rounded-full h-1" style={{ background:'var(--bg-muted)' }}>
                <div className="bg-green-500 h-1 rounded-full" style={{ width:`${s.bar}%` }} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Overview row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label:'Total Problems', value: overview.total,           color:'var(--text-primary)' },
          { label:'Solved',         value: overview.solved,          color:'#22c55e' },
          { label:'Revision',       value: overview.revision,        color:'#f59e0b' },
          { label:'Solve Rate',     value:`${overview.solve_rate}%`, color:'#22c55e' },
        ].map((s, i) => (
          <Card key={i}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Time Stats */}
      {data.time?.total_mins > 0 && (
        <Card title="⏱ Time Invested" className="mb-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color:'var(--text-primary)' }}>
                {data.time.total_mins >= 60
                  ? `${Math.floor(data.time.total_mins/60)}h ${data.time.total_mins%60}m`
                  : `${data.time.total_mins}m`}
              </div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>Total time spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color:'var(--text-primary)' }}>
                {data.time.avg_mins}m
              </div>
              <div className="text-xs" style={{ color:'var(--text-muted)' }}>Avg per problem</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color:'var(--text-muted)' }}>
                Slowest problems
              </div>
              {data.time.slowest.map(p => (
                <div key={p.id} className="flex justify-between items-center mb-2">
                  <span className="text-xs truncate mr-2" style={{ color:'var(--text-secondary)' }}>{p.title}</span>
                  <span className="text-xs font-mono shrink-0" style={{ color:'#f59e0b' }}>
                    {p.time_spent_mins >= 60
                      ? `${Math.floor(p.time_spent_mins/60)}h ${p.time_spent_mins%60}m`
                      : `${p.time_spent_mins}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Heatmap */}
      <Card title="Activity — Last 365 Days" className="mb-4">
        <Heatmap data={heatmap} />
      </Card>

      {/* Difficulty breakdown + Progression */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card title="By Difficulty">
          {['easy','medium','hard'].map(d => {
            const info = by_difficulty[d]
            const pct  = info.total > 0 ? Math.round((info.solved/info.total)*100) : 0
            const color = diffColors[d]
            return (
              <div key={d} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium capitalize" style={{ color }}>{d}</span>
                  <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                    {info.solved}/{info.total}
                    <span className="ml-1" style={{ color:'var(--text-muted)', opacity:0.6 }}>({pct}%)</span>
                  </span>
                </div>
                <div className="rounded-full h-1.5" style={{ background:'var(--bg-muted)' }}>
                  <div className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width:`${pct}%`, background:color }} />
                </div>
              </div>
            )
          })}
        </Card>

        <Card title="Problems Added — Last 6 Months">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={progressionData} barSize={8} barGap={2}>
              <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(128,128,128,0.05)' }} />
              <Bar dataKey="Easy"   fill={diffColors.easy}   radius={[2,2,0,0]} />
              <Bar dataKey="Medium" fill={diffColors.medium} radius={[2,2,0,0]} />
              <Bar dataKey="Hard"   fill={diffColors.hard}   radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weakness detector + Most practiced */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card title="⚠️ Weakness Detector — Lowest Solve Rate">
          {weaknesses.length === 0
            ? <p className="text-sm italic" style={{ color:'var(--text-muted)' }}>Add more problems to see weaknesses.</p>
            : weaknesses.map(t => (
              <div key={t.topic} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>{t.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>{t.solved}/{t.total}</span>
                    <span className="text-[10px] font-bold" style={{
                      color: t.solve_rate < 30 ? '#ef4444' : t.solve_rate < 60 ? '#f59e0b' : '#22c55e'
                    }}>{t.solve_rate}%</span>
                  </div>
                </div>
                <div className="rounded-full h-1" style={{ background:'var(--bg-muted)' }}>
                  <div className="h-1 rounded-full transition-all duration-700" style={{
                    width:`${t.solve_rate}%`,
                    background: t.solve_rate < 30 ? '#ef4444' : t.solve_rate < 60 ? '#f59e0b' : '#22c55e'
                  }} />
                </div>
              </div>
            ))
          }
        </Card>

        <Card title="🏋️ Most Practiced Topics">
          {most_practiced.length === 0
            ? <p className="text-sm italic" style={{ color:'var(--text-muted)' }}>No data yet.</p>
            : most_practiced.map(t => (
              <div key={t.topic} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>{t.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color:'#22c55e' }}>{t.solved} solved</span>
                    <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>{t.total} total</span>
                  </div>
                </div>
                <div className="rounded-full h-1" style={{ background:'var(--bg-muted)' }}>
                  <div className="h-1 rounded-full transition-all duration-700"
                    style={{ width:`${Math.min((t.total/(most_practiced[0]?.total||1))*100,100)}%`, background:'rgba(34,197,94,0.6)' }} />
                </div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Platform breakdown */}
      {platformData.length > 0 && (
        <Card title="By Platform">
          <div className="grid grid-cols-6 gap-3">
            {platformData.map(p => (
              <div key={p.name} className="rounded-lg p-3 text-center border"
                style={{ background:'var(--bg-muted)', borderColor:'var(--bg-border)' }}>
                <div className="text-2xl font-black mb-1" style={{ color:'#22c55e' }}>{p.count}</div>
                <div className="text-[10px] capitalize" style={{ color:'var(--text-muted)' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
}