import { useState, useEffect, useRef } from 'react'
import api from '../api'

const inp = "w-full bg-black/30 border border-border rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/10 transition-all placeholder:text-gray-600"
const lbl = "block text-xs font-medium text-gray-500 mb-1.5"

export default function ProblemModal({ open, onClose, onSave, topics, editing }) {
  const blank = {
    title: '', link: '', platform: 'leetcode', difficulty: 'medium',
    topic_ids: [], notes: '', brute_force: '', optimized: '',
    time_complexity: '', space_complexity: ''
  }

  const [form,       setForm]       = useState(blank)
  const [saving,     setSaving]     = useState(false)
  const [topicQ,     setTopicQ]     = useState('')
  const [fetching,   setFetching]   = useState(false)
  const [fetchError, setFetchError] = useState('')
  const titleRef = useRef()

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        title:            editing.title,
        link:             editing.link || '',
        platform:         editing.platform,
        difficulty:       editing.difficulty,
        topic_ids:        editing.topics?.map(t => t.id) || [],
        notes:            editing.notes || '',
        brute_force:      editing.solution?.brute_force      || '',
        optimized:        editing.solution?.optimized        || '',
        time_complexity:  editing.solution?.time_complexity  || '',
        space_complexity: editing.solution?.space_complexity || '',
      })
    } else {
      setForm(blank)
    }
    setTopicQ('')
    setFetchError('')
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [editing, open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFetchUrl = async () => {
    if (!form.link.trim()) return
    setFetching(true)
    setFetchError('')
    try {
      const res = await api.post('/fetch-problem/', { url: form.link })
      const d = res.data
      setForm(f => ({
        ...f,
        title:      d.title      || f.title,
        difficulty: d.difficulty || f.difficulty,
        platform:   d.platform   || f.platform,
        topic_ids:  d.topics?.map(t => t.id) || f.topic_ids,
      }))
    } catch (err) {
      setFetchError(err.response?.data?.error || 'Could not fetch problem details')
    } finally {
      setFetching(false)
    }
  }

  const toggleTopic = (id) => {
    setForm(f => ({
      ...f,
      topic_ids: f.topic_ids.includes(id)
        ? f.topic_ids.filter(x => x !== id)
        : [...f.topic_ids, id]
    }))
  }

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(topicQ.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title:      form.title,
        link:       form.link,
        platform:   form.platform,
        difficulty: form.difficulty,
        notes:      form.notes,
        topic_ids:  form.topic_ids,
      }
      let problemId = editing?.id
      if (editing) {
        await api.patch(`/problems/${editing.id}/`, payload)
      } else {
        const res = await api.post('/problems/', payload)
        problemId = res.data.id
      }
      if (form.brute_force || form.optimized || form.time_complexity) {
        await api.post(`/problems/${problemId}/solution/`, {
          brute_force:      form.brute_force,
          optimized:        form.optimized,
          time_complexity:  form.time_complexity,
          space_complexity: form.space_complexity,
        })
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  const platforms = ['leetcode', 'gfg', 'codeforces', 'codechef', 'hackerrank', 'other']
  const platColor = {
    leetcode:   'border-orange-500/50 bg-orange-500/10 text-orange-400',
    gfg:        'border-green-500/50 bg-green-500/10 text-green-400',
    codeforces: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    codechef:   'border-amber-500/50 bg-amber-500/10 text-amber-400',
    hackerrank: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    other:      'border-gray-500/50 bg-gray-500/10 text-gray-400',
  }

  return (
    <div onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div onClick={e => e.stopPropagation()}
        className="bg-[#111] border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="font-cal text-lg text-white">
            {editing ? 'Edit Problem' : 'Add Problem'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Track a problem from any platform
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Link with Auto-fill — FIRST so user pastes URL before anything else */}
          <div>
            <label className={lbl}>Link</label>
            <div className="flex gap-2">
              <input
                className={inp}
                value={form.link}
                onChange={e => { set('link', e.target.value); setFetchError('') }}
                placeholder="Paste a LeetCode / GFG / Codeforces URL to auto-fill…"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={!form.link.trim() || fetching}
                className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {fetching ? (
                  <span className="inline-block w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                )}
                {fetching ? 'Fetching…' : 'Auto-fill'}
              </button>
            </div>
            {fetchError && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {fetchError}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className={lbl}>Title *</label>
            <input
              ref={titleRef}
              className={inp}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Two Sum"
            />
          </div>

          {/* Platform */}
          <div>
            <label className={lbl}>Platform</label>
            <div className="flex gap-2 flex-wrap">
              {platforms.map(p => (
                <button key={p} type="button" onClick={() => set('platform', p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                    form.platform === p
                      ? platColor[p]
                      : 'border-border text-gray-600 hover:border-muted hover:text-gray-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className={lbl}>Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => {
                const active = form.difficulty === d
                const col = d === 'easy'
                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : d === 'medium'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-red-500/50 bg-red-500/10 text-red-400'
                return (
                  <button key={d} type="button" onClick={() => set('difficulty', d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all ${
                      active ? col : 'border-border text-gray-600 hover:border-muted hover:text-gray-400'
                    }`}>
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className={lbl}>
              Topics
              {form.topic_ids.length > 0 && (
                <span className="ml-2 text-green-500">{form.topic_ids.length} selected</span>
              )}
            </label>

            {/* Selected chips */}
            {form.topic_ids.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {form.topic_ids.map(id => {
                  const t = topics.find(x => x.id === id)
                  return t ? (
                    <span key={id} onClick={() => toggleTopic(id)}
                      className="tag bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
                      {t.name} ✕
                    </span>
                  ) : null
                })}
              </div>
            )}

            {/* Search */}
            <input
              className={inp}
              placeholder="Search topics…"
              value={topicQ}
              onChange={e => setTopicQ(e.target.value)}
            />

            {/* Topic grid */}
            <div className="mt-2 flex gap-1.5 flex-wrap max-h-32 overflow-y-auto pr-1">
              {filteredTopics.map(t => (
                <button key={t.id} type="button" onClick={() => toggleTopic(t.id)}
                  className={`tag border transition-all ${
                    form.topic_ids.includes(t.id)
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-white/5 text-gray-500 border-border hover:border-muted hover:text-gray-300'
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Solution
            </div>

            <div>
              <label className={lbl}>Brute Force</label>
              <textarea
                className={`${inp} min-h-[72px] resize-y`}
                value={form.brute_force}
                onChange={e => set('brute_force', e.target.value)}
                placeholder="Describe your brute force approach…"
              />
            </div>

            <div>
              <label className={lbl}>Optimized</label>
              <textarea
                className={`${inp} min-h-[72px] resize-y`}
                value={form.optimized}
                onChange={e => set('optimized', e.target.value)}
                placeholder="Describe your optimized solution…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Time Complexity</label>
                <input
                  className={inp}
                  value={form.time_complexity}
                  onChange={e => set('time_complexity', e.target.value)}
                  placeholder="O(n log n)"
                />
              </div>
              <div>
                <label className={lbl}>Space Complexity</label>
                <input
                  className={inp}
                  value={form.space_complexity}
                  onChange={e => set('space_complexity', e.target.value)}
                  placeholder="O(n)"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={lbl}>Notes</label>
            <textarea
              className={`${inp} min-h-[72px] resize-y`}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Key insights, patterns, edge cases to remember…"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-gray-600">Press Esc to close</span>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title.trim()}
              className="px-5 py-2 text-sm font-semibold bg-green-500 hover:bg-green-400 text-black rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-green"
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Problem'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}