import { useState } from 'react'
import { ArrowRight, Lock, FileText } from 'lucide-react'
import { Button, Card, SectionLabel } from './ui'
import { SAMPLES } from '../lib/samples'
import { makeDoc, type Doc } from '../lib/store'

interface Props { onCreated: (doc: Doc) => void }

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
    <div className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="fade-up font-display text-3xl font-semibold tracking-tight text-paper-100">Add study material</h1>
      <p className="fade-up mt-1.5 text-sm text-paper-500" style={{ animationDelay: '0.04s' }}>
        Paste lecture notes, a textbook section, or an article. Lumina builds your deck in your browser.
      </p>

      <Card className="fade-up mt-7 p-6" >
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); create(title, text) }}>
          <div>
            <label htmlFor="doc-title" className="mb-1.5 block text-xs font-medium text-paper-400">Title</label>
            <input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 — Cell Biology"
              className="w-full rounded-lg border border-white/[0.08] bg-ink-900 px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-600 transition-colors focus:border-accent-500/50 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="doc-text" className="mb-1.5 block text-xs font-medium text-paper-400">Text</label>
            <textarea
              id="doc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the material you want to learn…"
              rows={12}
              className="w-full resize-y rounded-lg border border-white/[0.08] bg-ink-900 px-4 py-3 text-sm leading-relaxed text-paper-200 placeholder:text-paper-600 transition-colors focus:border-accent-500/50 focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs text-paper-600">
              <Lock size={12} />
              Stays on your device
            </p>
            <Button variant="primary" type="submit" className="px-5">
              Generate deck
              <ArrowRight size={15} />
            </Button>
          </div>
        </form>
      </Card>

      <div className="fade-up mt-8" style={{ animationDelay: '0.1s' }}>
        <SectionLabel>Or start from a sample</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <Card
              key={s.id}
              className="group p-4"
              onClick={() => create(s.title, s.text)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-900 text-accent-400 transition-colors group-hover:border-accent-500/30">
                <FileText size={16} />
              </div>
              <div className="mt-3 text-sm font-medium text-paper-100">{s.title}</div>
              <div className="mt-0.5 text-xs text-paper-500">{s.blurb}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
