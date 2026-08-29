import { useMemo, useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
import { splitSentences, topKeywords, keywordSearch, termFrequencies } from '../lib/nlp'
import type { Doc } from '../lib/store'

export default function ConceptsView({ doc }: { doc: Doc }) {
  const [query, setQuery] = useState('')
  const keywords = useMemo(() => topKeywords(doc.text, 24), [doc.text])
  const sentences = useMemo(() => splitSentences(doc.text), [doc.text])
  const freqMap = useMemo(() => termFrequencies(doc.text), [doc.text])
  const maxFreq = useMemo(() => Math.max(1, ...[...freqMap.values()]), [freqMap])
  const results = useMemo(() => (query.trim() ? keywordSearch(doc.text, query, 8) : []), [doc.text, query])

  return (
    <div className="space-y-6">
      {/* Keyword cloud */}
      <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={120} aberrationIntensity={0.8} elasticity={0.15} cornerRadius={24} className="rounded-3xl fade-up">
        <div className="p-6 rounded-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Key concepts</h2>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-3">
            {keywords.map((k) => {
              const freq = freqMap.get(k) ?? 0
              const size = 13 + Math.min(16, (freq / maxFreq) * 16)
              const isQuery = k === query.trim().toLowerCase()
              return (
                <button
                  key={k}
                  onClick={() => setQuery(k)}
                  className={`transition-all duration-300 hover:text-indigo-300 ${isQuery ? 'text-indigo-400 scale-110' : 'text-slate-300'}`}
                  style={{ fontSize: `${size}px` }}
                >
                  {k}
                  <span className="ml-1 text-[10px] text-slate-600">{freq}×</span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">Click a keyword to find every sentence it appears in.</p>
        </div>
      </LiquidGlass>

      {/* Search */}
      <LiquidGlass displacementScale={40} blurAmount={0.035} saturation={120} aberrationIntensity={0.8} elasticity={0.15} cornerRadius={24} className="rounded-3xl fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="p-6 rounded-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Search within text</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search the document…"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition"
          />

          <div className="mt-4 space-y-3">
            {query.trim() !== '' && results.length === 0 && (
              <p className="text-sm text-slate-500">No matches in this document.</p>
            )}
            {results.map((r) => (
              <LiquidGlass key={r.index} displacementScale={30} blurAmount={0.03} saturation={110} aberrationIntensity={0.6} elasticity={0.15} cornerRadius={16} className="rounded-2xl">
                <div className="p-4 rounded-2xl">
                  <p className="text-sm leading-relaxed text-slate-200">{r.sentence}</p>
                  <div className="mt-2 text-[11px] text-slate-500">
                    sentence #{r.index + 1} · relevance {r.score.toFixed(1)}
                  </div>
                </div>
              </LiquidGlass>
            ))}
          </div>

          {query.trim() === '' && (
            <p className="mt-4 text-xs text-slate-500">Results are ranked by term frequency and coverage.</p>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}
