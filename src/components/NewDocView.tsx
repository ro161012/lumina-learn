import { SAMPLES } from '../lib/samples'
import { makeDoc, type Doc } from '../lib/store'
import { splitSentences } from '../lib/nlp'

interface Props {
  onCreated: (doc: Doc) => void
}

export default function NewDocView({ onCreated }: Props) {
  function create(title: string, text: string) {
    if (!title.trim() || !text.trim()) return
    const doc = makeDoc(title.trim(), text.trim())
    if (doc.cards.length === 0) {
      alert('Could not generate cards from this text. Try longer, fact-rich paragraphs.')
      return
    }
    onCreated(doc)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Add study material</h1>
      <p className="mt-1 text-sm text-slate-400">
        Paste lecture notes, a textbook chapter, or an article. Lumina runs NLP + neural models locally to
        build your deck in seconds.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          create(String(fd.get('title')), String(fd.get('text')))
        }}
      >
        <input
          name="title"
          placeholder="Title (e.g. Chapter 4 — Cell Biology)"
          className="w-full rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          required
        />
        <textarea
          name="text"
          placeholder="Paste your text here… (aim for a few solid paragraphs)"
          rows={12}
          className="w-full rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          required
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {splitSentences('').length === 0 ? '🔒 Stays on your device — nothing is uploaded' : ''}
          </p>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Generate deck →
          </button>
        </div>
      </form>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Or try a sample</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => create(s.title, s.text)}
              className="rounded-xl border border-ink-600 bg-ink-850 p-4 text-left transition hover:border-indigo-500 hover:bg-ink-800"
            >
              <div className="text-2xl">{s.emoji}</div>
              <div className="mt-2 text-sm font-semibold text-white">{s.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">{s.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
