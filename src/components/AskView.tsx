import { useMemo, useRef, useState } from 'react'
import { Send, Zap } from 'lucide-react'
import { Badge, Button, Card } from './ui'
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
      setError('The AI models could not load. You need an internet connection on first use — after that they run offline.')
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col">
      <p className="mb-5 text-sm leading-relaxed text-paper-500">
        Ask anything about <span className="font-medium text-paper-200">{doc.title}</span>. A sentence-embedding
        model finds the relevant passages, then a QA network extracts the answer — all in your browser.
      </p>

      <div className="space-y-4">
        {turns.length === 0 && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-500">Try asking</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestQuestions(doc).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-white/[0.08] bg-ink-900 px-3.5 py-1.5 text-xs text-paper-300 transition-colors hover:border-accent-500/40 hover:text-paper-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2.5 fade-up" style={{ animationDelay: `${Math.min(i * 0.03, 0.15)}s` }}>
            {/* Question */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-xl rounded-br-sm bg-accent-500 px-4 py-2.5">
                <p className="text-sm font-medium text-ink-950">{t.q}</p>
              </div>
            </div>
            {/* Answer */}
            <div className="flex justify-start">
              <Card className="max-w-[85%] rounded-xl rounded-bl-sm px-4 py-3">
                {t.a ? (
                  <>
                    <p className="text-sm leading-relaxed text-paper-200">{t.a.answer}</p>
                    <div className="mt-2.5 flex items-center gap-2.5 text-[11px] text-paper-500">
                      <Badge tone="success">
                        <Zap size={9} />
                        {(t.a.score * 100).toFixed(0)}% confidence
                      </Badge>
                      {t.citedSentence && <span className="truncate italic">“{t.citedSentence}”</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-paper-500">Couldn't find that in this document. Try rephrasing.</p>
                )}
              </Card>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-xs text-red-300">{error}</p>
      )}

      {/* Input */}
      <form
        className="sticky bottom-0 mt-6 flex gap-2 bg-ink-950/95 pb-2 pt-4 backdrop-blur-sm"
        onSubmit={(e) => { e.preventDefault(); send(input) }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Thinking…' : 'Ask a question about this text…'}
          disabled={busy}
          className="flex-1 rounded-lg border border-white/[0.1] bg-ink-850 px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-600 transition-colors focus:border-accent-500/50 focus:outline-none disabled:opacity-50"
        />
        <Button variant="primary" size="md" disabled={busy || !input.trim()} className="px-4">
          {busy ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-ink-950/60" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-ink-950/60" style={{ animationDelay: '0.15s' }} />
              <span className="h-1 w-1 animate-pulse rounded-full bg-ink-950/60" style={{ animationDelay: '0.3s' }} />
            </span>
          ) : (
            <Send size={15} />
          )}
        </Button>
      </form>
    </div>
  )
}

function suggestQuestions(doc: Doc): string[] {
  const qs = doc.cards.filter((c) => c.type === 'definition').slice(0, 3).map((c) => c.question)
  return qs.length > 0 ? qs : ['What is the main idea?', 'Summarize the key points']
}
