import { useMemo } from 'react'
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Mastery" value={`${stats.masteryPct}%`} accent="text-indigo-300" />
        <StatCard label="Cards due" value={String(stats.due)} accent="text-amber-300" />
        <StatCard label="Mastered" value={`${stats.mastered}/${stats.total}`} accent="text-emerald-300" />
        <StatCard label="Reviews" value={String(totalReviews)} accent="text-violet-300" />
      </div>

      {/* Mastery distribution */}
      <section className="rounded-2xl border border-ink-600 bg-ink-850 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card maturity</h2>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-ink-700">
          {buckets.mastered > 0 && <Segment pct={buckets.mastered / stats.total} cls="bg-emerald-500" />}
          {buckets.familiar > 0 && <Segment pct={buckets.familiar / stats.total} cls="bg-indigo-500" />}
          {buckets.learning > 0 && <Segment pct={buckets.learning / stats.total} cls="bg-amber-500" />}
          {buckets.new > 0 && <Segment pct={buckets.new / stats.total} cls="bg-ink-600" />}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <Legend cls="bg-emerald-500" label={`Mastered (${buckets.mastered})`} />
          <Legend cls="bg-indigo-500" label={`Familiar (${buckets.familiar})`} />
          <Legend cls="bg-amber-500" label={`Learning (${buckets.learning})`} />
          <Legend cls="bg-ink-600" label={`New (${buckets.new})`} />
        </div>
      </section>

      {/* Review behavior */}
      <section className="rounded-2xl border border-ink-600 bg-ink-850 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Review behavior</h2>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, i) => {
            const pct = totalReviews ? Math.round((ratings[i] / totalReviews) * 100) : 0
            return (
              <div key={label} className="rounded-xl border border-ink-600 bg-ink-800 p-4 text-center">
                <div className="text-xl font-bold text-white">{pct}%</div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          The SM-2 scheduler uses these ratings to decide exactly when each card comes back — harder cards
          return sooner, easy ones wait longer.
        </p>
      </section>

      {/* Per-card table */}
      <section className="rounded-2xl border border-ink-600 bg-ink-850 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card detail</h2>
        <div className="mt-4 space-y-2">
          {doc.cards.slice(0, 20).map((c) => {
            const m = masteryOf(c.state)
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-ink-800 px-4 py-2.5">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className={`h-full rounded-full ${m >= 80 ? 'bg-emerald-500' : m >= 40 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(4, m)}%` }}
                  />
                </div>
                <span className="flex-1 truncate text-xs text-slate-300">{c.question}</span>
                <span className="text-[11px] text-slate-500">{m}%</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-5">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  )
}

function Segment({ pct, cls }: { pct: number; cls: string }) {
  return <div className={cls} style={{ width: `${pct * 100}%` }} />
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-400">
      <span className={`h-2 w-2 rounded-full ${cls}`} />
      {label}
    </span>
  )
}
