import { useMemo } from 'react'
import { Target, Clock, Award, Repeat, Flame, TrendingUp } from 'lucide-react'
import { Card, SectionLabel, StatCard } from './ui'
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
  const segments = [
    { n: buckets.mastered, cls: 'bg-emerald-500', label: 'Mastered' },
    { n: buckets.familiar, cls: 'bg-accent-500', label: 'Familiar' },
    { n: buckets.learning, cls: 'bg-amber-500/80', label: 'Learning' },
    { n: buckets.new, cls: 'bg-white/[0.1]', label: 'New' },
  ]

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 fade-up">
        <StatCard icon={<Target size={18} />} label="Mastery" value={`${stats.masteryPct}%`} />
        <StatCard icon={<Clock size={18} />} label="Due now" value={String(stats.due)} />
        <StatCard icon={<Award size={18} />} label="Mastered" value={`${stats.mastered}/${stats.total}`} />
        <StatCard icon={<Repeat size={18} />} label="Reviews" value={String(totalReviews)} />
      </div>

      {/* Card maturity */}
      <Card className="fade-up p-6" >
        <SectionLabel>Card maturity</SectionLabel>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
          {segments.map((s) =>
            s.n > 0 ? (
              <div key={s.label} className={s.cls} style={{ width: `${(s.n / Math.max(stats.total, 1)) * 100}%` }} />
            ) : null,
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-paper-500">
          {segments.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${s.cls}`} />
              {s.label} · {s.n}
            </span>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-paper-600">
          <TrendingUp size={13} />
          Based on your {totalReviews} review{totalReviews === 1 ? '' : 's'} across {stats.total} cards.
        </p>
      </Card>

      {/* Review behavior */}
      <Card className="fade-up p-6">
        <SectionLabel>Review behavior</SectionLabel>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, i) => {
            const pct = totalReviews ? Math.round((ratings[i] / totalReviews) * 100) : 0
            return (
              <div key={label} className="rounded-lg border border-white/[0.05] bg-ink-900 px-2 py-3.5 text-center">
                <div className="font-display text-xl font-semibold tabular-nums text-paper-100">{pct}%</div>
                <div className="mt-0.5 text-[11px] text-paper-500">{label}</div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-paper-600">
          The spaced-repetition scheduler reads these ratings to decide when each card returns — hard cards come
          back sooner, easy ones wait longer.
        </p>
      </Card>

      {/* Per-card detail */}
      <Card className="fade-up p-6">
        <SectionLabel>Card detail</SectionLabel>
        <div className="mt-4 space-y-1.5">
          {doc.cards.slice(0, 15).map((c) => {
            const m = masteryOf(c.state)
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]">
                <div className="flex w-32 shrink-0 items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${m >= 80 ? 'bg-emerald-500' : m >= 40 ? 'bg-accent-500' : 'bg-amber-500/80'}`}
                      style={{ width: `${Math.max(4, m)}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11px] tabular-nums text-paper-500">{m}%</span>
                </div>
                <span className="flex-1 truncate text-xs text-paper-300">{c.question}</span>
                <span className="hidden items-center gap-1 text-[11px] text-paper-600 sm:flex">
                  <Flame size={11} className="text-amber-500/70" />
                  {c.history.length}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
