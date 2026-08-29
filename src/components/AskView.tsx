import { memo, useMemo, useRef, useState } from 'react'
import { GLASS, GLASS_HOVER } from './Glass'
import { splitSentences } from '../lib/nlp'
import { ask, embedBatch, getEmbedder, getQA, type AnswerResult } from '../lib/ai'
import type { Doc } from '../lib/store'

interface Turn { q: string; a: AnswerResult | null; citedSentence?: string }

export default function AskView({ doc }: { doc: Doc }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentences = useMemo(() => splitSentences(doc.text), [doc.text])

  async function send(question: string) {
    if (!question.trim() || busy) return
    setBusy(true); setError(null); setInput('')
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
      setError('AI models could not load. Check your internet connection on first use.')
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-sm text-slate-300">
        Ask anything about <span className="font-semibold text-white">{doc.title}</span>.
      </p>

      <div className="space-y-4">
        {turns.length === 0 && (
          <div className={`${GLASS} rounded-2xl p-5`}>
            <p className="font-medium text-sm text-white">Try asking:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestQuestions(doc).map((q) => (
                <button key={q} onClick={() => send(q)}
                  className={`rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300
                    backdrop-blur-xl hover:bg-white/[0.08] hover:text-white transition-all duration-200`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2 fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
            {/* Question bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-500/20 border border-indigo-500/20 px-4 py-2.5 backdrop-blur-xl">
                <p className="text-sm text-white">{t.q}</p>
              </div>
            </div>
            {/* Answer bubble */}
            <div className="flex justify-start">
              <div className={`${GLASS} max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3`}>
                {t.a ? (
                  <>
                    <p className="text-sm leading-relaxed text-slate-100">{t.a.answer}</p>
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400 border border-emerald-500/20">
                        {(t.a.score * 100).toFixed(0)}%
                      </span>
                      {t.citedSentence && <span className="truncate italic">"{t.citedSentence}"</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Couldn't find that. Try rephrasing.</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300 backdrop-blur-xl">{error}</p>
      )}

      {/* Input */}
      <form className="sticky bottom-0 mt-6 flex gap-2 pt-6 pb-2"
        onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Thinking…' : 'Ask a question…'} disabled={busy}
          className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white
            placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none
            focus:ring-2 focus:ring-indigo-400/20 transition disabled:opacity-50" />
        <button type="submit" disabled={busy || !input.trim()}
          className="rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-5 py-3.5 text-sm font-semibold text-white
            hover:bg-indigo-500/30 active:scale-[0.98] transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed">
          {busy ? '…' : 'Ask →'}
        </button>
      </form>
    </div>
  )
}

function suggestQuestions(doc: Doc): string[] {
  const qs = doc.cards.filter((c) => c.type === 'definition').slice(0, 3).map((c) => c.question)
  return qs.length > 0 ? qs : ['What is the main idea?', 'Summarize the key points']
}
