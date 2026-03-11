import { useState } from 'react'
import api from '../api'

const qualities = [
  { value: 0, label: 'Forgot',  sub: 'Complete blank',     color: 'border-red-500/50 bg-red-500/10 text-red-400',     icon: '✗' },
  { value: 1, label: 'Hard',    sub: 'Needed lots of help', color: 'border-orange-500/50 bg-orange-500/10 text-orange-400', icon: '~' },
  { value: 2, label: 'Okay',    sub: 'Got it with effort',  color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400', icon: '○' },
  { value: 3, label: 'Easy',    sub: 'Minor hesitation',    color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',   icon: '◎' },
  { value: 4, label: 'Perfect', sub: 'Instant recall',      color: 'border-green-500/50 bg-green-500/10 text-green-400', icon: '✓' },
]

export default function ReviewModal({ problem, open, onClose, onReviewed }) {
  const [selected,  setSelected]  = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result,    setResult]    = useState(null)

  if (!open || !problem) return null

  const handleSubmit = async () => {
    if (selected === null) return
    setSubmitting(true)
    try {
      const res = await api.post(`/problems/${problem.id}/review/`, { quality: selected })
      setResult(res.data)
      window.dispatchEvent(new CustomEvent('kaizen:xp', { detail: { xp: res.data.xp_earned } }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelected(null)
    setResult(null)
    onClose()
    if (result) onReviewed()
  }

  return (
    <div onClick={handleClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div onClick={e => e.stopPropagation()}
        className="bg-[#111] border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              📅 Review Due
            </span>
          </div>
          <div className="font-cal text-lg text-white mt-2">{problem.title}</div>
          <div className="flex gap-2 mt-2">
            <span className="tag bg-white/5 text-gray-400 border border-white/[0.06]">{problem.platform}</span>
            <span className={`tag ${
              problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
              problem.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {!result ? (
          <>
            {/* Solution hint */}
            {(problem.solution?.optimized || problem.notes) && (
              <div className="mx-6 mt-4 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Your approach</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {problem.solution?.optimized || problem.notes}
                </p>
              </div>
            )}

            {/* Quality selector */}
            <div className="px-6 py-5">
              <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">How well did you recall this?</div>
              <div className="grid grid-cols-5 gap-2">
                {qualities.map(q => (
                  <button key={q.value} onClick={() => setSelected(q.value)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                      selected === q.value ? q.color : 'border-border text-gray-600 hover:border-muted hover:text-gray-400'
                    }`}>
                    <span className="text-lg mb-1">{q.icon}</span>
                    <span className="text-xs font-semibold">{q.label}</span>
                    <span className="text-[10px] mt-0.5 text-center leading-tight opacity-70">{q.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Skip
              </button>
              <button onClick={handleSubmit} disabled={selected === null || submitting}
                className="px-5 py-2 text-sm font-semibold bg-green-500 hover:bg-green-400 text-black rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? 'Saving…' : 'Submit Review'}
              </button>
            </div>
          </>
        ) : (
          /* Result screen */
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-4">
              {selected >= 3 ? '🎉' : selected >= 2 ? '👍' : '💪'}
            </div>
            <div className="font-cal text-xl text-white mb-1">
              {selected >= 3 ? 'Great recall!' : selected >= 2 ? 'Getting there!' : 'Keep practicing!'}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Next review in <span className="text-white font-semibold">{result.interval} day{result.interval !== 1 ? 's' : ''}</span>
            </div>
            {result.xp_earned > 0 && (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ⚡ +{result.xp_earned} XP earned
              </div>
            )}
            <div>
              <button onClick={handleClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}