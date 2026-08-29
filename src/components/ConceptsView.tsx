import { memo, useMemo, useState } from 'react'
import { GLASS } from './Glass'
import { splitSentences, topKeywords, keywordSearch, termFrequencies } from '../lib/nlp'
import type { Doc } from '../lib/store'

export default function ConceptsView({ doc }: { doc: Doc }) {
  const [query, setQuery] = useState('')
  const keywords = useMemo(() => topKeywords(doc.text, 24), [doc.text])
  const freqMap = useMemo(() => termFrequencies(doc.text), [doc.text])
  const maxFreq = useMemo(() => Math.max(1, ...[...freqMap.values()]), [freqMap])
  const results = useMemo(() => (query.trim() ? keywordSearch(doc.text, query, 8) : []), [doc.text, query])

  return (
    <div className="space-y-6">
      {/* Keyword cloud */}
      <div className={`${GLASS} rounded-3xl p-6 fade-up`}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Key concepts</h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-3">
          {keywords.map((k) => {
            const freq = freqMap.get(k) ?? 0
            const size = 13 + Math.min(16, (freq / maxFreq) * 16)
            const active = k === query.trim().toLowerCase()
            return (
              <button key={k} onClick={() => setQuery(k)}
                className={`transition-all duration-200 hover:text-indigo-300 ${active ? 'text-indigo-400 scale-110' : 'text-slate-300'}`}
                style={{ fontSize: `${size}px` }}>
                {k}
                <span className="ml-1 text-[10px] text-slate-600">{freq}×</span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">Click a keyword to search for it.</p>
      </div>

      {/* Search */}
      <div className={`${GLASS} rounded-3xl p-6 fade-up`} style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Search within text</h2>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search…"
          className="mt-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white
            placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none
            focus:ring-2 focus:ring-indigo-400/20 transition" />

        <div className="mt-4 space-y-2.5">
          {query.trim() !== '' && results.length === 0 && (
            <p className="text-sm text-slate-500">No matches.</p>
          )}
          {results.map((r) => (
            <div key={r.index} className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-4 backdrop-blur-xl">
              <p className="text-sm leading-relaxed text-slate-200">{r.sentence}</p>
              <div className="mt-2 text-[11px] text-slate-500">
                sentence #{r.index + 1} · relevance {r.score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        {query.trim() === '' && (
          <p className="mt-4 text-xs text-slate-500">Ranked by term frequency.</p>
        )}
      </div>
    </div>
  )
}
