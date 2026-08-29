import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, SectionLabel } from './ui'
import { splitSentences, topKeywords, keywordSearch, termFrequencies } from '../lib/nlp'
import type { Doc } from '../lib/store'

export default function ConceptsView({ doc }: { doc: Doc }) {
  const [query, setQuery] = useState('')
  const keywords = useMemo(() => topKeywords(doc.text, 24), [doc.text])
  const freqMap = useMemo(() => termFrequencies(doc.text), [doc.text])
  const maxFreq = useMemo(() => Math.max(1, ...[...freqMap.values()]), [freqMap])
  const results = useMemo(() => (query.trim() ? keywordSearch(doc.text, query, 8) : []), [doc.text, query])

  return (
    <div className="space-y-5">
      {/* Keyword cloud */}
      <Card className="fade-up p-6">
        <SectionLabel>Key concepts</SectionLabel>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2.5">
          {keywords.map((k) => {
            const freq = freqMap.get(k) ?? 0
            const size = 13 + Math.min(10, (freq / maxFreq) * 10)
            const active = k === query.trim().toLowerCase()
            return (
              <button
                key={k}
                onClick={() => setQuery(k)}
                className={
                  active
                    ? 'font-medium text-accent-300 underline decoration-accent-500/40 underline-offset-4'
                    : 'text-paper-400 transition-colors hover:text-paper-100'
                }
                style={{ fontSize: `${size}px` }}
              >
                {k}
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-paper-600">Click a term to find every sentence it appears in.</p>
      </Card>

      {/* Search */}
      <Card className="fade-up p-6" >
        <SectionLabel>Search within the text</SectionLabel>
        <div className="relative mt-3">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a term or phrase…"
            className="w-full rounded-lg border border-white/[0.08] bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-paper-100 placeholder:text-paper-600 transition-colors focus:border-accent-500/50 focus:outline-none"
          />
        </div>

        <div className="mt-4 space-y-2">
          {query.trim() !== '' && results.length === 0 && (
            <p className="py-4 text-sm text-paper-500">No matches for “{query}”.</p>
          )}
          {results.map((r) => (
            <div key={r.index} className="rounded-lg border border-white/[0.05] bg-ink-900 px-4 py-3">
              <p className="text-sm leading-relaxed text-paper-300">{r.sentence}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent-500" style={{ width: `${r.score * 100}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-paper-600">
                  {Math.round(r.score * 100)}% relevance
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
