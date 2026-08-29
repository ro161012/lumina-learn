import { useMemo, useRef, useState } from 'react'
import { splitSentences } from '../lib/nlp'
import { ask, embedBatch, getEmbedder, getQA, type AnswerResult } from '../lib/ai'
import type { Doc } from '../lib/store'

interface Turn {
  q: string
  a: AnswerResult | null
  citedSentence?: string
}

export default function AskView({ doc }: { doc: Doc }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sentences = useMemo(() => splitSentences(doc.text), [doc.text])

  async function send(question: string) {
    if (!question.trim() || busy) return
    setBusy(true)
    setError(null)
    setInput('')

    try {
      const extractor = await getEmbedder()
      const qa = await getQA()
      const embeddings = await embedBatch(sentences, extractor)
      const result = await ask(question.trim(), sentences, embeddings, extractor, qa)

      const cited = result ? sentences[result.sentenceIndex] : undefined
      setTurns((prev) => [...prev, { q: question.trim(), a: result, citedSentence: cited }])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e) {
      console.error(e)
      setError('AI models could not load. Check your internet connection on first use — after that they run offline.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-sm text-slate-400">
        Ask anything about <span className="font-medium text-slate-200">{doc.title}</span>. A sentence-embedding model
        finds the most relevant passages, then a QA neural net extracts the exact answer — all in your browser.
      </p>

      {/* Conversation */}
      <div className="space-y-4">
        {turns.length === 0 && (
          <div className="rounded-xl border border-ink-600 bg-ink-850 p-6 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Try asking:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestQuestions(doc).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            {/* Question bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white">
                {t.q}
              </div>
            </div>
            {/* Answer bubble */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-ink-600 bg-ink-850 px-4 py-3">
                {t.a ? (
                  <>
                    <p className="text-sm leading-relaxed text-slate-100">{t.a.answer}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                        {(t.a.score * 100).toFixed(0)}% confidence
                      </span>
                      {t.citedSentence && <span className="truncate">“{t.citedSentence}”</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    I couldn't find that in this document. Try rephrasing or asking about a topic the text covers.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">{error}</p>
      )}

      {/* Input */}
      <form
        className="sticky bottom-0 mt-6 flex gap-2 bg-gradient-to-t from-ink-950 via-ink-950 pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Thinking…' : 'Ask a question about this text…'}
          disabled={busy}
          className="flex-1 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          {busy ? '…' : 'Ask'}
        </button>
      </form>
    </div>
  )
}

/** Generate a few starter questions from the document's card questions. */
function suggestQuestions(doc: Doc): string[] {
  const qs = doc.cards
    .filter((c) => c.type === 'definition')
    .slice(0, 3)
    .map((c) => c.question.replace(/^What (is|are) /, 'What is ').replace(/\?$/, '?'))
  if (qs.length > 0) return qs
  return ['What is the main idea?', 'Summarize the key points']
}
