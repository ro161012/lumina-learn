import { useState } from 'react'
import { GLASS, GLASS_ACTIVE, GLASS_HOVER } from './Glass'
import { deckStats, type Doc, type Profile } from '../lib/store'
import Flashcard from './Flashcard'
import Quiz from './Quiz'

interface Props {
  doc: Doc; docs: Doc[]; setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
  profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

export default function StudyView({ doc, docs, setDocs, profile, setProfile }: Props) {
  const [mode, setMode] = useState<'cards' | 'quiz'>('cards')
  const stats = deckStats(doc)

  return (
    <div>
      {/* Mode toggle + stats */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className={`${GLASS} rounded-xl p-1 flex gap-0.5`}>
          <button onClick={() => setMode('cards')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              mode === 'cards' ? 'bg-indigo-500/25 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white'
            }`}>
            🎓 Flashcards
          </button>
          <button onClick={() => setMode('quiz')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              mode === 'quiz' ? 'bg-indigo-500/25 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white'
            }`}>
            📝 Quiz
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-slate-400 backdrop-blur-xl">
            📚 {stats.total}
          </span>
          <span className="rounded-full border border-amber-500/15 bg-amber-500/5 px-2.5 py-1 text-amber-300 backdrop-blur-xl">
            ⏰ {stats.due}
          </span>
          <span className="rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1 text-emerald-300 backdrop-blur-xl">
            ✓ {stats.mastered}
          </span>
        </div>
      </div>

      {doc.cards.length === 0 ? (
        <p className={`${GLASS} rounded-2xl p-8 text-center text-sm text-slate-400`}>
          No cards generated. Try longer text.
        </p>
      ) : mode === 'cards' ? (
        <Flashcard doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      ) : (
        <Quiz doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      )}
    </div>
  )
}
