import { memo, useMemo } from 'react'
import { GLASS } from './Glass'
import { deckStats, type Doc } from '../lib/store'
import { masteryOf } from '../lib/scheduler'

export default function ProgressView({ doc }: { doc: Doc }) {
  const stats = deckStats(doc)

  const buckets = useMemo(() => {
    const b = { new: 0, learning: 0, familiar: 0, mastered: 0 }
    for (const c of doc.cards) {
      const m = masteryOf(c.state)
      if (m >= 80) b.mastered++
      else if (m >= 40) b.familiar++
      else if (m > 0) b.learning++
      else b.new++
    }
    return b
  }, [doc.cards])

  const ratings = useMemo(() => {
    const counts = [0, 0, 0, 0]
    for (const c of doc.cards) for (const h of c.history) counts[h.rating]++
    return counts
  }, [doc.cards])

  const totalReviews = ratings.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 fade-up">
        <StatCard label="Mastery" value={`${stats.masteryPct}%`} accent="text-indigo-300" />
        <StatCard label="Due" value={String(stats.due)} accent="text-amber-300" />
        <StatCard label="Mastered" value={`${stats.mastered}/${stats.total}`} accent="text-emerald-300" />
        <StatCard label="Reviews" value={String(totalReviews)} accent="text-violet-300" />
      </div>

      {/* Card maturity */}
      <div className={`${GLASS} rounded-3xl p-6 fade-up`} style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card maturity</h2>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/5">
          {buckets.mastered > 0 && <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(buckets.mastered / stats.total) * 100}%` }} />}
          {buckets.familiar > 0 && <div className="bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${(buckets.familiar / stats.total) * 100}%` }} />}
          {buckets.learning > 0 && <div className="bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${(buckets.learning / stats.total) * 100}%` }} />}
          {buckets.new > 0 && <div className="bg-white/10" style={{ width: `${(buckets.new / stats.total) * 100}%` }} />}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Mastered ({buckets.mastered})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Familiar ({buckets.familiar})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Learning ({buckets.learning})</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-white/20" />New ({buckets.new})</span>
        </div>
      </div>

      {/* Review behavior */}
      <div className={`${GLASS} rounded-3xl p-6 fade-up`} style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Review behavior</h2>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, i) => {
            const pct = totalReviews ? Math.round((ratings[i] / totalReviews) * 100) : 0
            return (
              <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-4 text-center backdrop-blur-xl">
                <div className="text-xl font-bold text-white">{pct}%</div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500">SM-2 scheduler uses these ratings to schedule reviews.</p>
      </div>

      {/* Card detail */}
      <div className={`${GLASS} rounded-3xl p-6 fade-up`} style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card detail</h2>
        <div className="mt-4 space-y-2">
          {doc.cards.slice(0, 15).map((c) => {
            const m = masteryOf(c.state)
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-2.5 border border-white/5">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${m >= 80 ? 'bg-emerald-500' : m >= 40 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(4, m)}%` }} />
                </div>
                <span className="flex-1 truncate text-xs text-slate-300">{c.question}</span>
                <span className="text-[11px] text-slate-500 tabular-nums">{m}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const StatCard = memo(function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`${GLASS} rounded-2xl p-5`}>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  )
})
