import { useState } from 'react'
import LiquidGlass from 'liquid-glass-react'
import { deckStats, type Doc, type Profile } from '../lib/store'
import Flashcard from './Flashcard'
import Quiz from './Quiz'

interface Props {
  doc: Doc
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

export default function StudyView({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [mode, setMode] = useState<'cards' | 'quiz'>('cards')
  const stats = deckStats(doc)

  return (
    <div>
      {/* Mode toggle + stats */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LiquidGlass displacementScale={35} blurAmount={0.03} saturation={115} aberrationIntensity={0.6} elasticity={0.1} cornerRadius={14} className="rounded-xl p-0.5">
          <div className="flex gap-0.5 rounded-xl p-0.5">
            {(['cards', 'quiz'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-indigo-500/25 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'cards' ? '🎓 Flashcards' : '📝 Quiz'}
              </button>
            ))}
          </div>
        </LiquidGlass>

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 backdrop-blur-xl">
            📚 {stats.total} cards
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/5 px-2.5 py-1 text-amber-300 backdrop-blur-xl">
            ⏰ {stats.due} due
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1 text-emerald-300 backdrop-blur-xl">
            ✓ {stats.mastered} mastered
          </span>
        </div>
      </div>

      {doc.cards.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center text-sm text-slate-400 backdrop-blur-xl">
          No cards could be generated. Try pasting longer, fact-rich paragraphs.
        </p>
      ) : mode === 'cards' ? (
        <Flashcard doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      ) : (
        <Quiz doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      )}
    </div>
  )
}
