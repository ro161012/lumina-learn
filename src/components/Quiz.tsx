import { useMemo, useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
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
      <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center text-sm text-slate-400 backdrop-blur-xl">
        Not enough material to build a quiz.
      </p>
    )
  }

  if (done) {
    const pct = Math.round((score / items.length) * 100)
    return (
      <LiquidGlass displacementScale={50} blurAmount={0.04} saturation={130} aberrationIntensity={1.5} elasticity={0.2} cornerRadius={28} className="rounded-3xl">
        <div className="fade-up p-10 text-center rounded-3xl">
          <div className="text-6xl mb-2" style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.3))' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📖'}</div>
          <h2 className="mt-2 text-3xl font-bold text-white">{score} / {items.length} correct</h2>
          <p className="mt-3 text-sm text-slate-300">
            {pct >= 80 ? 'Excellent — you know this material!' : pct >= 50 ? 'Good progress. Review the misses and try again.' : 'Head back to flashcards, then retry the quiz.'}
          </p>
          <div className="mx-auto mt-6 h-2.5 w-64 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-8">
            <LiquidGlass displacementScale={50} blurAmount={0.04} saturation={150} aberrationIntensity={2} elasticity={0.35} cornerRadius={14} className="rounded-xl" onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false) }}>
              <span className="flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white cursor-pointer">
                Retry quiz
              </span>
            </LiquidGlass>
          </div>
        </div>
      </LiquidGlass>
    )
  }

  const item = items[current]

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    const correct = i === item.correctIndex
    if (correct) setScore((s) => s + 1)
    const card = doc.cards.find((c) => c.sourceIndex === item.sourceIndex)
    if (card) {
      const rating: Rating = correct ? 3 : 0
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
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-300"
            style={{ width: `${(current / items.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-300">{current + 1} / {items.length}</span>
      </div>

      <LiquidGlass displacementScale={50} blurAmount={0.04} saturation={130} aberrationIntensity={1.5} elasticity={0.2} cornerRadius={28} className="rounded-3xl">
        <div className="p-8 rounded-3xl">
          <p className="text-lg leading-relaxed text-white font-medium">{item.question}</p>

          <div className="mt-6 space-y-2.5">
            {item.options.map((opt, i) => {
              const isCorrect = i === item.correctIndex
              const isPicked = i === selected
              const isRevealed = selected !== null

              return (
                <LiquidGlass
                  key={i}
                  displacementScale={isRevealed ? (isCorrect ? 50 : isPicked ? 45 : 25) : 35}
                  blurAmount={0.035}
                  saturation={isRevealed ? (isCorrect ? 160 : isPicked ? 150 : 100) : 120}
                  aberrationIntensity={isRevealed ? (isCorrect ? 2 : 1) : 1}
                  elasticity={0.2}
                  cornerRadius={16}
                  className="rounded-2xl"
                  onClick={() => choose(i)}
                >
                  <span className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm cursor-pointer transition ${
                    isRevealed
                      ? isCorrect
                        ? 'text-emerald-300'
                        : isPicked
                        ? 'text-red-300'
                        : 'text-slate-500'
                      : 'text-slate-200'
                  }`}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isRevealed && isCorrect && <span className="text-emerald-400">✓</span>}
                    {isRevealed && isPicked && !isCorrect && <span className="text-red-400">✕</span>}
                  </span>
                </LiquidGlass>
              )
            })}
          </div>

          {selected !== null && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-300">
                {selected === item.correctIndex ? (
                  <span className="flex items-center gap-1"><span style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.4))' }}>🎉</span> Correct!</span>
                ) : 'Not quite — the highlighted answer is correct.'}
              </p>
              <LiquidGlass displacementScale={50} blurAmount={0.04} saturation={150} aberrationIntensity={2} elasticity={0.35} cornerRadius={12} className="rounded-xl" onClick={next}>
                <span className="flex items-center rounded-xl px-5 py-2 text-sm font-semibold text-white cursor-pointer">
                  {current + 1 >= items.length ? 'See results' : 'Next →'}
                </span>
              </LiquidGlass>
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}
