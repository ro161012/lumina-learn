import { useMemo, useState } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'
import { Badge, Button, Card, cn } from './ui'
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
    return <p className="rounded-xl border border-white/[0.06] bg-ink-850 p-10 text-center text-sm text-paper-500">Not enough material for a quiz.</p>
  }

  if (done) {
    const pct = Math.round((score / items.length) * 100)
    const verdict = pct >= 80 ? 'Solid command of this material.' : pct >= 50 ? 'Good progress — review the misses and try again.' : 'Worth another pass with the flashcards first.'
    return (
      <Card className="fade-up p-10 text-center">
        <div className="font-display text-5xl font-semibold tracking-tight text-paper-100">
          {score}<span className="text-2xl text-paper-500"> / {items.length}</span>
        </div>
        <p className="mt-1 text-sm text-paper-500">{pct}% correct · {verdict}</p>
        <div className="mx-auto mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-accent-500' : 'bg-red-500/70',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <Button
          variant="primary"
          className="mt-8"
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false) }}
        >
          <RotateCcw size={14} />
          Retry quiz
        </Button>
      </Card>
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

  return (
    <div className="fade-up" key={current}>
      {/* Progress */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-accent-500 transition-all duration-300" style={{ width: `${((current + (selected !== null ? 1 : 0)) / items.length) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-paper-500">{current + 1} / {items.length}</span>
      </div>

      <Card className="p-7">
        <p className="font-display text-xl font-medium leading-snug tracking-tight text-paper-100">{item.question}</p>

        <div className="mt-6 space-y-2">
          {item.options.map((opt, i) => {
            const isCorrect = i === item.correctIndex
            const isPicked = i === selected
            const revealed = selected !== null
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                  !revealed && 'border-white/[0.08] bg-ink-900 hover:border-white/[0.16] hover:bg-ink-800 cursor-pointer',
                  revealed && isCorrect && 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200',
                  revealed && isPicked && !isCorrect && 'border-red-500/30 bg-red-500/[0.07] text-red-300',
                  revealed && !isCorrect && !isPicked && 'border-white/[0.05] bg-ink-900 text-paper-500',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                    revealed && isCorrect ? 'border-emerald-500/40 text-emerald-300'
                      : revealed && isPicked ? 'border-red-500/40 text-red-300'
                      : 'border-white/[0.12] text-paper-500',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrect && <Check size={16} className="text-emerald-400" />}
                {revealed && isPicked && !isCorrect && <X size={16} className="text-red-400" />}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-paper-400">
              {selected === item.correctIndex ? 'Correct.' : `That's not right — the answer is ${item.options[item.correctIndex]}.`}
            </p>
            <Button variant="primary" size="sm" onClick={() => { if (current + 1 >= items.length) setDone(true); else { setCurrent((c) => c + 1); setSelected(null) } }}>
              {current + 1 >= items.length ? 'See results' : 'Next'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
