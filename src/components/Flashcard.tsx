import { memo, useMemo, useState } from 'react'
import { GLASS, HeroSurface } from './Glass'
import { rateCard, type Doc, type Profile } from '../lib/store'
import { isDue, type Rating } from '../lib/scheduler'

interface Props {
  doc: Doc
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

const RATINGS: { r: Rating; label: string; cls: string; icon: string }[] = [
  { r: 0, label: 'Again', cls: 'text-red-300 hover:bg-red-500/15 border-red-500/20', icon: '❌' },
  { r: 1, label: 'Hard', cls: 'text-amber-300 hover:bg-amber-500/15 border-amber-500/20', icon: '🔥' },
  { r: 2, label: 'Good', cls: 'text-indigo-300 hover:bg-indigo-500/15 border-indigo-500/20', icon: '👍' },
  { r: 3, label: 'Easy', cls: 'text-emerald-300 hover:bg-emerald-500/15 border-emerald-500/20', icon: '✨' },
]

export default function Flashcard({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const queue = useMemo(() => {
    const now = Date.now()
    return [...doc.cards.filter((c) => isDue(c.state, now)), ...doc.cards.filter((c) => !isDue(c.state, now))]
  }, [doc.cards])

  if (queue.length === 0) {
    return <p className={`${GLASS} rounded-2xl p-8 text-center text-sm text-slate-400`}>No cards to study.</p>
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
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard — the ONE WebGL surface */}
      <div className="flip-scene">
        <div
          className={`flip-inner relative h-80 w-full cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div className="flip-face absolute inset-0">
            <HeroSurface displacementScale={50} cornerRadius={28} className="h-full rounded-3xl">
              <div className="flex h-full flex-col rounded-3xl p-8">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 border border-indigo-500/20">
                    {card.type}
                  </span>
                  {isDue(card.state) && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/20">
                      due
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-center px-4 text-center">
                  <p className="text-xl leading-relaxed text-white font-medium">{card.question}</p>
                </div>
                <p className="text-center text-xs text-slate-400 tracking-wide">tap to reveal</p>
              </div>
            </HeroSurface>
          </div>

          {/* Back */}
          <div className="flip-face flip-back absolute inset-0">
            <HeroSurface displacementScale={55} cornerRadius={28} className="h-full rounded-3xl">
              <div className="flex h-full flex-col rounded-3xl p-8">
                <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                  answer
                </span>
                <div className="flex flex-1 items-center justify-center px-4 text-center">
                  <p className="text-2xl font-bold leading-relaxed text-emerald-300 drop-shadow-lg">{card.answer}</p>
                </div>
                <p className="text-center text-xs text-slate-400 tracking-wide">how well did you know it?</p>
              </div>
            </HeroSurface>
          </div>
        </div>
      </div>

      {/* Rating buttons — CSS only, instant */}
      {flipped && (
        <div className="fade-up mt-5 grid grid-cols-4 gap-2.5">
          {RATINGS.map(({ r, label, cls, icon }) => (
            <button
              key={r}
              onClick={() => rate(r)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold
                backdrop-blur-xl transition-all duration-200 active:scale-95 ${cls}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
