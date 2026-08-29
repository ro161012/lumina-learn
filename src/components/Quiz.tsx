import { memo, useMemo, useState } from 'react'
import { GLASS, GLASS_HOVER } from './Glass'
import { rateCard, type Doc, type Profile } from '../lib/store'
import type { Rating } from '../lib/scheduler'

interface Props {
  doc: Doc
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

export default function Quiz({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const items = useMemo(() => doc.quiz, [doc.quiz])

  if (items.length === 0) {
    return <p className={`${GLASS} rounded-2xl p-8 text-center text-sm text-slate-400`}>Not enough material for a quiz.</p>
  }

  if (done) {
    const pct = Math.round((score / items.length) * 100)
    return (
      <div className={`${GLASS} rounded-3xl p-10 text-center fade-up`}>
        <div className="text-6xl mb-2" style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.3))' }}>
          {pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📖'}
        </div>
        <h2 className="mt-2 text-3xl font-bold text-white">{score} / {items.length}</h2>
        <p className="mt-3 text-sm text-slate-300">
          {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good progress.' : 'Keep studying.'}
        </p>
        <div className="mx-auto mt-6 h-2.5 w-64 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false) }}
          className="mt-8 rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-6 py-2.5 text-sm font-semibold text-white
            hover:bg-indigo-500/30 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
        >
          Retry quiz
        </button>
      </div>
    )
  }

  const item = items[current]

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === item.correctIndex) setScore((s) => s + 1)
    const card = doc.cards.find((c) => c.sourceIndex === item.sourceIndex)
    if (card) {
      const rating: Rating = i === item.correctIndex ? 3 : 0
      const result = rateCard(docs, doc.id, card.id, rating, profile)
      setDocs(result.docs)
      setProfile(result.profile)
    }
  }

  function next() {
    if (current + 1 >= items.length) setDone(true)
    else { setCurrent((c) => c + 1); setSelected(null) }
  }

  return (
    <div className="fade-up" key={current}>
      {/* Progress */}
      <div className="mb-5 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-300"
            style={{ width: `${(current / items.length) * 100}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-300">{current + 1}/{items.length}</span>
      </div>

      <div className={`${GLASS} rounded-3xl p-8`}>
        <p className="text-lg leading-relaxed text-white font-medium">{item.question}</p>

        <div className="mt-6 space-y-2.5">
          {item.options.map((opt, i) => {
            const isCorrect = i === item.correctIndex
            const isPicked = i === selected
            const revealed = selected !== null
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm
                  backdrop-blur-xl transition-all duration-200 active:scale-[0.99] ${
                  revealed
                    ? isCorrect ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : isPicked ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : 'border-white/[0.05] bg-white/[0.02] text-slate-500'
                    : 'border-white/[0.08] bg-white/[0.04] text-slate-200 hover:border-white/[0.15] hover:bg-white/[0.07]'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
                {revealed && isPicked && !isCorrect && <span className="text-red-400 font-bold">✕</span>}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-300">
              {selected === item.correctIndex ? '🎉 Correct!' : 'Not quite.'}
            </p>
            <button
              onClick={next}
              className="rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-5 py-2 text-sm font-semibold text-white
                hover:bg-indigo-500/30 active:scale-[0.98] transition-all duration-200"
            >
              {current + 1 >= items.length ? 'Results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
