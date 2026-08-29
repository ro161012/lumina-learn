import { useMemo } from 'react'
import LiquidGlass from 'liquid-glass-react'
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
        <GlassStat label="Mastery" value={`${stats.masteryPct}%`} accent="text-indigo-300" glow="rgba(99,102,241,0.15)" />
        <GlassStat label="Cards due" value={String(stats.due)} accent="text-amber-300" glow="rgba(245,158,11,0.15)" />
        <GlassStat label="Mastered" value={`${stats.mastered}/${stats.total}`} accent="text-emerald-300" glow="rgba(16,185,129,0.15)" />
        <GlassStat label="Reviews" value={String(totalReviews)} accent="text-violet-300" glow="rgba(139,92,246,0.15)" />
      </div>

      {/* Mastery distribution */}
      <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={120} aberrationIntensity={0.8} elasticity={0.15} cornerRadius={24} className="rounded-3xl fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="p-6 rounded-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card maturity</h2>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/5">
            {buckets.mastered > 0 && <Seg pct={buckets.mastered / stats.total} cls="bg-gradient-to-r from-emerald-500 to-emerald-400" />}
            {buckets.familiar > 0 && <Seg pct={buckets.familiar / stats.total} cls="bg-gradient-to-r from-indigo-500 to-violet-400" />}
            {buckets.learning > 0 && <Seg pct={buckets.learning / stats.total} cls="bg-gradient-to-r from-amber-500 to-amber-400" />}
            {buckets.new > 0 && <Seg pct={buckets.new / stats.total} cls="bg-white/10" />}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <Leg cls="bg-emerald-500" label={`Mastered (${buckets.mastered})`} />
            <Leg cls="bg-indigo-500" label={`Familiar (${buckets.familiar})`} />
            <Leg cls="bg-amber-500" label={`Learning (${buckets.learning})`} />
            <Leg cls="bg-white/20" label={`New (${buckets.new})`} />
          </div>
        </div>
      </LiquidGlass>

      {/* Review behavior */}
      <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={120} aberrationIntensity={0.8} elasticity={0.15} cornerRadius={24} className="rounded-3xl fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-6 rounded-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Review behavior</h2>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, i) => {
              const pct = totalReviews ? Math.round((ratings[i] / totalReviews) * 100) : 0
              return (
                <LiquidGlass key={label} displacementScale={30} blurAmount={0.03} saturation={115} aberrationIntensity={0.6} elasticity={0.1} cornerRadius={16} className="rounded-2xl">
                  <div className="p-4 text-center rounded-2xl">
                    <div className="text-xl font-bold text-white">{pct}%</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                </LiquidGlass>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            The SM-2 scheduler uses these ratings to decide exactly when each card comes back.
          </p>
        </div>
      </LiquidGlass>

      {/* Per-card detail */}
      <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={120} aberrationIntensity={0.8} elasticity={0.15} cornerRadius={24} className="rounded-3xl fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="p-6 rounded-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card detail</h2>
          <div className="mt-4 space-y-2">
            {doc.cards.slice(0, 15).map((c) => {
              const m = masteryOf(c.state)
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-2.5 border border-white/5">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${m >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : m >= 40 ? 'bg-gradient-to-r from-indigo-500 to-violet-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}
                      style={{ width: `${Math.max(4, m)}%` }}
                    />
                  </div>
                  <span className="flex-1 truncate text-xs text-slate-300">{c.question}</span>
                  <span className="text-[11px] text-slate-500 tabular-nums">{m}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </LiquidGlass>
    </div>
  )
}

function GlassStat({ label, value, accent, glow }: { label: string; value: string; accent: string; glow: string }) {
  return (
    <LiquidGlass displacementScale={35} blurAmount={0.03} saturation={115} aberrationIntensity={0.7} elasticity={0.12} cornerRadius={22} className="rounded-[22px]">
      <div className="p-5 rounded-[22px]">
        <div className={`text-2xl font-bold ${accent}`} style={{ textShadow: `0 0 20px ${glow}` }}>{value}</div>
        <div className="mt-1 text-xs text-slate-400">{label}</div>
      </div>
    </LiquidGlass>
  )
}

function Seg({ pct, cls }: { pct: number; cls: string }) {
  return <div className={cls} style={{ width: `${pct * 100}%` }} />
}

function Leg({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-400">
      <span className={`h-2.5 w-2.5 rounded-full ${cls}`} />
      {label}
    </span>
  )
}
