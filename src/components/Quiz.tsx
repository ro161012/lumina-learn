import { useMemo, useState } from 'react'
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
    return (
      <p className="rounded-xl border border-ink-600 bg-ink-850 p-8 text-center text-sm text-slate-400">
        Not enough material to build a quiz. Add more text.
      </p>
    )
  }

  if (done) {
    const pct = Math.round((score / items.length) * 100)
    return (
      <div className="fade-up rounded-2xl border border-ink-600 bg-ink-850 p-10 text-center">
        <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📖'}</div>
        <h2 className="mt-4 text-2xl font-bold text-white">
          {score} / {items.length} correct
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {pct >= 80 ? 'Excellent — you know this material!' : pct >= 50 ? 'Good progress. Review the misses and try again.' : 'Head back to flashcards, then retry the quiz.'}
        </p>
        <div className="mx-auto mt-6 h-2 w-64 overflow-hidden rounded-full bg-ink-700">
          <div
            className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={() => {
            setCurrent(0)
            setSelected(null)
            setScore(0)
            setDone(false)
          }}
          className="mt-8 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
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
    const correct = i === item.correctIndex
    if (correct) setScore((s) => s + 1)

    // Quiz performance feeds the same SM-2 scheduler as flashcards
    const card = doc.cards.find((c) => c.sourceIndex === item.sourceIndex)
    if (card) {
      const rating: Rating = correct ? 3 : 0
      const result = rateCard(docs, doc.id, card.id, rating, profile)
      setDocs(result.docs)
      setProfile(result.profile)
    }
  }

  function next() {
    if (current + 1 >= items.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  return (
    <div className="fade-up" key={current}>
      {/* Progress */}
      <div className="mb-4 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-300"
            style={{ width: `${(current / items.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {current + 1} / {items.length}
        </span>
      </div>

      <div className="rounded-2xl border border-ink-600 bg-ink-850 p-8">
        <p className="text-lg leading-relaxed text-white">{item.question}</p>

        <div className="mt-6 space-y-2">
          {item.options.map((opt, i) => {
            const isCorrect = i === item.correctIndex
            const isPicked = i === selected
            let cls = 'border-ink-600 bg-ink-800 text-slate-200 hover:border-indigo-500'
            if (selected !== null) {
              if (isCorrect) cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
              else if (isPicked) cls = 'border-red-500/60 bg-red-500/10 text-red-300'
              else cls = 'border-ink-600 bg-ink-800 text-slate-500'
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
                {selected !== null && isCorrect && <span className="ml-auto">✓</span>}
                {selected !== null && isPicked && !isCorrect && <span className="ml-auto">✕</span>}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {selected === item.correctIndex ? '🎉 Correct!' : 'Not quite — the highlighted answer is correct.'}
            </p>
            <button
              onClick={next}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {current + 1 >= items.length ? 'See results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
