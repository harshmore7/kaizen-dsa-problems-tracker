import { useState, useEffect } from 'react'
import api from '../api'

function PlatformCard({ data, platform, username, color, icon }) {
  if (!username) return (
    <div className="glass rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] border-dashed border-2 border-border">
      <div className="text-gray-700 text-sm mb-1">No username set</div>
      <div className="text-gray-600 text-xs">Add your {platform} username above</div>
    </div>
  )

  if (!data) return (
    <div className="glass rounded-xl p-6 flex items-center justify-center min-h-[200px]">
      <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  )

  if (data.error) return (
    <div className="glass rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
      <div className="text-red-400 text-sm mb-1">Could not fetch stats</div>
      <div className="text-gray-600 text-xs">{data.error}</div>
    </div>
  )

  return (
    <div className="glass rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${color}`}>
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{platform}</div>
            <div className="text-xs text-gray-500">@{username}</div>
          </div>
        </div>
        {platform === 'Codeforces' && data.rank && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-border capitalize"
            style={{ color: data.rank_color }}>
            {data.rank}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{data.total_solved ?? '—'}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Solved</div>
        </div>

        {platform === 'LeetCode' && <>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">{data.easy_solved}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Easy</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-amber-400">{data.medium_solved}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Medium</div>
          </div>
        </>}

        {platform === 'GFG' && <>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-amber-400">{data.coding_score ?? '—'}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Score</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-400">{data.streak ?? '—'}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Streak</div>
          </div>
        </>}

        {platform === 'Codeforces' && <>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{data.rating ?? '—'}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Rating</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-300">{data.max_rating ?? '—'}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Max Rating</div>
          </div>
        </>}
      </div>

      {/* Extra info */}
      {platform === 'LeetCode' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-red-400">{data.hard_solved}</div>
            <div className="text-[10px] text-gray-500">Hard</div>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5 text-center">
            <div className="text-sm font-bold text-white">
              {data.contest_rating > 0 ? data.contest_rating : '—'}
            </div>
            <div className="text-[10px] text-gray-500">Contest Rating</div>
          </div>
        </div>
      )}

      {platform === 'GFG' && data.institute_rank && (
        <div className="bg-black/20 rounded-lg p-2.5 text-center">
          <div className="text-sm font-bold text-green-400">#{data.institute_rank}</div>
          <div className="text-[10px] text-gray-500">Institute Rank</div>
        </div>
      )}

      {platform === 'Codeforces' && data.contests?.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Recent contests</div>
          {data.contests.slice(-3).reverse().map((c, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
              <span className="text-xs text-gray-400 truncate mr-2">{c.name}</span>
              <span className="text-xs font-mono text-blue-400 shrink-0">{c.rating}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Heatmap
function HeatCell({ count, date }) {
  const bg = count === 0 ? '#1a1a1a' : count === 1 ? '#14532d' : count === 2 ? '#166534' : '#22c55e'
  return <div title={`${date}: ${count}`} style={{ width:11, height:11, background:bg, borderRadius:2, flexShrink:0 }} />
}

function Heatmap({ data }) {
  const today = new Date()
  const days  = []
  for (let i = 89; i >= 0; i--) {
    const d   = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: data[key] || 0 })
  }
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) => <HeatCell key={di} count={day.count} date={day.date} />)}
        </div>
      ))}
    </div>
  )
}

export default function Profile() {
  const [profile,  setProfile]  = useState(null)
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState({
    leetcode_username: '', gfg_username: '', codeforces_username: ''
  })

  useEffect(() => {
    api.get('/profile/').then(r => {
      setProfile(r.data)
      setForm({
        leetcode_username:   r.data.leetcode_username   || '',
        gfg_username:        r.data.gfg_username        || '',
        codeforces_username: r.data.codeforces_username || '',
      })
      setLoading(false)
      // auto-fetch stats if any username is set
      if (r.data.leetcode_username || r.data.gfg_username || r.data.codeforces_username) {
        fetchStats()
      }
    })
  }, [])

  const fetchStats = () => {
    setFetching(true)
    api.get('/profile/stats/').then(r => {
      setStats(r.data)
      setFetching(false)
    }).catch(() => setFetching(false))
  }

  const handleSave = async () => {
    setSaving(true)
    await api.put('/profile/', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
    fetchStats()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  )

  const platforms = [
    { key: 'leetcode',   label: 'LeetCode',   username: form.leetcode_username,   data: stats?.leetcode,   color: 'bg-amber-500/20 text-amber-400',  icon: 'LC' },
    { key: 'gfg',        label: 'GFG',         username: form.gfg_username,         data: stats?.gfg,        color: 'bg-green-500/20 text-green-400',  icon: 'GF' },
    { key: 'codeforces', label: 'Codeforces',  username: form.codeforces_username,  data: stats?.codeforces, color: 'bg-blue-500/20 text-blue-400',    icon: 'CF' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cal text-2xl text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-500">Connect your competitive programming accounts</p>
      </div>

      {/* Username inputs */}
      <div className="glass rounded-xl p-5 mb-6">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">Platform Usernames</div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { key: 'leetcode_username',   label: 'LeetCode',  placeholder: 'your_lc_username',  color: 'focus:border-amber-500/50' },
            { key: 'gfg_username',        label: 'GFG',        placeholder: 'your_gfg_username', color: 'focus:border-green-500/50' },
            { key: 'codeforces_username', label: 'Codeforces', placeholder: 'your_cf_handle',    color: 'focus:border-blue-500/50'  },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 mb-1.5 block">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={`w-full bg-black/30 border border-border ${f.color} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 outline-none transition-colors font-mono`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
            {saving
              ? <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : null}
            Save & Refresh
          </button>
          {saved && <span className="text-xs text-green-400">✓ Saved</span>}
          {fetching && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
              Fetching live stats…
            </span>
          )}
        </div>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {platforms.map(p => (
          <PlatformCard
            key={p.key}
            platform={p.label}
            username={p.username}
            data={p.data}
            color={p.color}
            icon={p.icon}
          />
        ))}
      </div>

      {/* Combined heatmap */}
      {stats?.heatmap && Object.keys(stats.heatmap).length > 0 && (
        <div className="glass rounded-xl p-5">
          <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">
            LeetCode Activity — Last 90 Days
          </div>
          <Heatmap data={stats.heatmap} />
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-[10px] text-gray-600">Less</span>
            {[0,1,2,3].map(c => <HeatCell key={c} count={c} date="" />)}
            <span className="text-[10px] text-gray-600">More</span>
          </div>
        </div>
      )}

    </div>
  )
}