import { useState } from 'react'
import { GLASS, GlassInput } from './Glass'
import { SAMPLES } from '../lib/samples'
import { makeDoc, type Doc } from '../lib/store'

interface Props { onCreated: (doc: Doc) => void }

export default function NewDocView({ onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  function create(t: string, txt: string) {
    if (!t.trim() || !txt.trim()) return
    const doc = makeDoc(t.trim(), txt.trim())
    if (doc.cards.length === 0) { alert('Could not generate cards. Try longer text.'); return }
    onCreated(doc)
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <h1 className="text-2xl font-bold text-white fade-up">Add study material</h1>
      <p className="mt-1 text-sm text-slate-300 fade-up" style={{ animationDelay: '0.05s' }}>
        Paste lecture notes, a textbook chapter, or an article.
      </p>

      <form className={`${GLASS} mt-8 rounded-3xl p-6 space-y-4 fade-up`}
        style={{ animationDelay: '0.1s' }}
        onSubmit={(e) => { e.preventDefault(); create(title, text) }}>
        <GlassInput value={title} onChange={setTitle} placeholder="Title (e.g. Chapter 4 — Cell Biology)" required />
        <GlassInput value={text} onChange={setText} placeholder="Paste your text here…" rows={12} required />
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500">🔒 Stays on your device</p>
          <button type="submit"
            className="rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-5 py-2.5 text-sm font-semibold text-white
              hover:bg-indigo-500/30 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            Generate deck →
          </button>
        </div>
      </form>

      <div className="mt-10 fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Or try a sample</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <button key={s.id} onClick={() => create(s.title, s.text)}
              className={`${GLASS} rounded-2xl p-5 text-left cursor-pointer
                hover:bg-white/[0.07] hover:border-white/[0.12] active:scale-[0.98]
                transition-all duration-200`}>
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="text-sm font-semibold text-white">{s.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">{s.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
