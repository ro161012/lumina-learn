import { memo, useMemo, useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
import { Badge } from './ui'
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
  { r: 0, label: 'Again', cls: 'border-red-500/20 text-red-300 hover:bg-red-500/10' },
  { r: 1, label: 'Hard', cls: 'border-amber-500/20 text-amber-300 hover:bg-amber-500/10' },
  { r: 2, label: 'Good', cls: 'border-accent-500/25 text-accent-300 hover:bg-accent-500/10' },
  { r: 3, label: 'Easy', cls: 'border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10' },
]

const TYPE_LABEL: Record<string, { label: string; tone: 'accent' | 'success' | 'neutral' }> = {
  definition: { label: 'Definition', tone: 'accent' },
  cloze: { label: 'Fill the blank', tone: 'neutral' },
  qa: { label: 'Q & A', tone: 'neutral' },
}

export default function Flashcard({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const queue = useMemo(() => {
    const now = Date.now()
    return [...doc.cards.filter((c) => isDue(c.state, now)), ...doc.cards.filter((c) => !isDue(c.state, now))]
  }, [doc.cards])

  if (queue.length === 0) {
    return <p className="rounded-xl border border-white/[0.06] bg-ink-850 p-10 text-center text-sm text-paper-500">No cards to study.</p>
  }

  const safeIndex = index % queue.length
  const card = queue[safeIndex]
  const typeMeta = TYPE_LABEL[card.type] ?? TYPE_LABEL.qa

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
      {/* Progress */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs tabular-nums text-paper-500">{safeIndex + 1} / {queue.length}</span>
      </div>

      {/* Flashcard — the liquid-glass hero */}
      <div className="flip-scene">
        <div
          className={`flip-inner relative h-80 w-full cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div className="flip-face absolute inset-0">
            <LiquidGlass
              displacementScale={42}
              blurAmount={0.03}
              saturation={115}
              aberrationIntensity={0.8}
              elasticity={0.2}
              cornerRadius={20}
              className="h-full rounded-2xl"
            >
              <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-ink-850 p-8">
                <div className="flex items-center justify-between">
                  <Badge tone={typeMeta.tone}>{typeMeta.label}</Badge>
                  {isDue(card.state) && <Badge tone="warn">Due now</Badge>}
                </div>
                <div className="flex flex-1 items-center justify-center px-4 text-center">
                  <p className="font-display text-2xl font-medium leading-snug tracking-tight text-paper-100">
                    {card.question}
                  </p>
                </div>
                <p className="text-center text-xs text-paper-600">Click to reveal</p>
              </div>
            </LiquidGlass>
          </div>

          {/* Back */}
          <div className="flip-face flip-back absolute inset-0">
            <LiquidGlass
              displacementScale={42}
              blurAmount={0.03}
              saturation={115}
              aberrationIntensity={0.8}
              elasticity={0.2}
              cornerRadius={20}
              className="h-full rounded-2xl"
            >
              <div className="flex h-full flex-col rounded-2xl border border-accent-500/[0.14] bg-ink-850 p-8">
                <Badge tone="success">Answer</Badge>
                <div className="flex flex-1 items-center justify-center px-4 text-center">
                  <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-accent-300">
                    {card.answer}
                  </p>
                </div>
                <p className="text-center text-xs text-paper-600">How well did you know it?</p>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>

      {/* Ratings */}
      {flipped && (
        <div className="fade-up mt-5 grid grid-cols-4 gap-2">
          {RATINGS.map(({ r, label, cls }) => (
            <button
              key={r}
              onClick={() => rate(r)}
              className={`rounded-lg border bg-ink-850 px-3 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
