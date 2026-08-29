import { useMemo, useRef, useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
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
      setError('AI models could not load. Check your internet connection on first use — after that they run offline.')
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-sm text-slate-300">
        Ask anything about <span className="font-semibold text-white">{doc.title}</span>. A sentence-embedding model finds the most relevant passages, then a QA neural net extracts the exact answer.
      </p>

      <div className="space-y-4">
        {turns.length === 0 && (
          <LiquidGlass displacementScale={30} blurAmount={0.03} saturation={110} aberrationIntensity={0.6} elasticity={0.15} cornerRadius={20} className="rounded-2xl">
            <div className="p-5 rounded-2xl">
              <p className="font-medium text-sm text-white">Try asking:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestQuestions(doc).map((q) => (
                  <LiquidGlass key={q} displacementScale={25} blurAmount={0.025} saturation={110} aberrationIntensity={0.5} elasticity={0.25} cornerRadius={999} className="rounded-full" onClick={() => send(q)}>
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs text-slate-300 cursor-pointer hover:text-white transition">{q}</span>
                  </LiquidGlass>
                ))}
              </div>
            </div>
          </LiquidGlass>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2.5 fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Question */}
            <div className="flex justify-end">
              <LiquidGlass displacementScale={45} blurAmount={0.04} saturation={140} aberrationIntensity={1.5} elasticity={0.2} cornerRadius={20} className="rounded-2xl rounded-br-md max-w-[80%]">
                <div className="rounded-2xl rounded-br-md px-4 py-2.5">
                  <p className="text-sm text-white">{t.q}</p>
                </div>
              </LiquidGlass>
            </div>
            {/* Answer */}
            <div className="flex justify-start">
              <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={125} aberrationIntensity={1} elasticity={0.2} cornerRadius={20} className="rounded-2xl rounded-bl-md max-w-[85%]">
                <div className="rounded-2xl rounded-bl-md px-4 py-3">
                  {t.a ? (
                    <>
                      <p className="text-sm leading-relaxed text-slate-100">{t.a.answer}</p>
                      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400 border border-emerald-500/20">
                          {(t.a.score * 100).toFixed(0)}% confidence
                        </span>
                        {t.citedSentence && <span className="truncate italic">"{t.citedSentence}"</span>}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">
                      I couldn't find that in this document. Try rephrasing.
                    </p>
                  )}
                </div>
              </LiquidGlass>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300 backdrop-blur-xl">{error}</p>
      )}

      {/* Input */}
      <form
        className="sticky bottom-0 mt-6 flex gap-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-6 pb-2"
        onSubmit={(e) => { e.preventDefault(); send(input) }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Thinking…' : 'Ask a question about this text…'}
          disabled={busy}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition disabled:opacity-50"
        />
        <LiquidGlass displacementScale={50} blurAmount={0.04} saturation={150} aberrationIntensity={2} elasticity={0.35} cornerRadius={16} className="rounded-2xl" onClick={() => send(input)}>
          <span className={`flex items-center rounded-2xl px-5 py-3.5 text-sm font-semibold cursor-pointer transition ${busy || !input.trim() ? 'text-slate-500' : 'text-white'}`}>
            {busy ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </span>
            ) : 'Ask →'}
          </span>
        </LiquidGlass>
      </form>
    </div>
  )
}

function suggestQuestions(doc: Doc): string[] {
  const qs = doc.cards.filter((c) => c.type === 'definition').slice(0, 3).map((c) => c.question.replace(/\?$/, '?'))
  if (qs.length > 0) return qs
  return ['What is the main idea?', 'Summarize the key points']
}
