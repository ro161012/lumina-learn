import { useMemo, useState } from 'react'
import { rateCard, type Doc, type Profile } from '../lib/store'
import { isDue, type Rating } from '../lib/scheduler'

interface Props {
  doc: Doc
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

const RATINGS: { r: Rating; label: string; cls: string }[] = [
  { r: 0, label: 'Again', cls: 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20' },
  { r: 1, label: 'Hard', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' },
  { r: 2, label: 'Good', cls: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' },
  { r: 3, label: 'Easy', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' },
]

export default function Flashcard({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Study queue: due cards first, then fresh cards
  const queue = useMemo(() => {
    const now = Date.now()
    const due = doc.cards.filter((c) => isDue(c.state, now))
    const upcoming = doc.cards.filter((c) => !isDue(c.state, now))
    return [...due, ...upcoming]
  }, [doc.cards])

  if (queue.length === 0) {
    return (
      <p className="rounded-xl border border-ink-600 bg-ink-850 p-8 text-center text-sm text-slate-400">
        No cards to study.
      </p>
    )
  }

  const safeIndex = index % queue.length
  const card = queue[safeIndex]

  function rate(r: Rating) {
    const result = rateCard(docs, doc.id, card.id, r, profile)
    setDocs(result.docs)
    setProfile(result.profile)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const progress = (safeIndex / queue.length) * 100

  return (
    <div className="fade-up" key={card.id + '-' + safeIndex}>
      {/* Progress bar */}
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card scene */}
      <div className="flip-scene">
        <div
          className={`flip-inner relative h-72 w-full cursor-pointer ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div className="flip-face absolute inset-0 flex flex-col rounded-2xl border border-ink-600 bg-gradient-to-br from-ink-800 to-ink-850 p-8 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                {card.type}
              </span>
              {isDue(card.state) && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  due
                </span>
              )}
            </div>
            <div className="flex flex-1 items-center justify-center px-2 text-center">
              <p className="text-lg leading-relaxed text-white">{card.question}</p>
            </div>
            <p className="text-center text-xs text-slate-500">click to reveal</p>
          </div>

          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 flex flex-col rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-ink-800 to-ink-900 p-8 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                answer
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center px-2 text-center">
              <p className="text-xl font-semibold leading-relaxed text-emerald-300">{card.answer}</p>
            </div>
            <p className="text-center text-xs text-slate-500">how well did you know it?</p>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="fade-up mt-5 grid grid-cols-4 gap-2">
          {RATINGS.map(({ r, label, cls }) => (
            <button
              key={r}
              onClick={() => rate(r)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
