import { useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
import { SAMPLES } from '../lib/samples'
import { makeDoc, type Doc } from '../lib/store'

interface Props {
  onCreated: (doc: Doc) => void
}

export default function NewDocView({ onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  function create(t: string, txt: string) {
    if (!t.trim() || !txt.trim()) return
    const doc = makeDoc(t.trim(), txt.trim())
    if (doc.cards.length === 0) {
      alert('Could not generate cards from this text. Try longer, fact-rich paragraphs.')
      return
    }
    onCreated(doc)
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <h1 className="text-2xl font-bold text-white fade-up">Add study material</h1>
      <p className="mt-1 text-sm text-slate-300 fade-up" style={{ animationDelay: '0.05s' }}>
        Paste lecture notes, a textbook chapter, or an article. Lumina runs NLP + neural models locally.
      </p>

      <LiquidGlass displacementScale={45} blurAmount={0.04} saturation={125} aberrationIntensity={1.2} elasticity={0.2} cornerRadius={24} className="mt-8 rounded-3xl fade-up" style={{ animationDelay: '0.1s' }}>
        <form
          className="space-y-4 p-6 rounded-3xl"
          onSubmit={(e) => { e.preventDefault(); create(title, text) }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Chapter 4 — Cell Biology)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition"
            required
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here… (aim for a few solid paragraphs)"
            rows={12}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition"
            required
          />
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">🔒 Stays on your device — nothing is uploaded</p>
            <LiquidGlass displacementScale={55} blurAmount={0.04} saturation={160} aberrationIntensity={2.5} elasticity={0.35} cornerRadius={14} className="rounded-xl">
              <span className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer">
                Generate deck →
              </span>
            </LiquidGlass>
          </div>
        </form>
      </LiquidGlass>

      <div className="mt-10 fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Or try a sample</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <LiquidGlass
              key={s.id}
              displacementScale={40}
              blurAmount={0.035}
              saturation={120}
              aberrationIntensity={1}
              elasticity={0.2}
              cornerRadius={20}
              className="rounded-2xl"
              onClick={() => create(s.title, s.text)}
            >
              <div className="p-5 rounded-2xl cursor-pointer transition group">
                <div className="text-3xl mb-1" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}>{s.emoji}</div>
                <div className="text-sm font-semibold text-white">{s.title}</div>
                <div className="mt-0.5 text-xs text-slate-400">{s.blurb}</div>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </div>
  )
}
