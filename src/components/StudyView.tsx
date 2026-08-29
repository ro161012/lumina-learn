import { useMemo, useState } from 'react'
import { rateCard, deckStats, type Doc, type Profile } from '../lib/store'
import { isDue, type Rating } from '../lib/scheduler'
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
      {/* Mode toggle */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-ink-850 p-1">
          <button
            onClick={() => setMode('cards')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              mode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              mode === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quiz
          </button>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
          <span>📚 {stats.total} cards</span>
          <span className="text-amber-400">⏰ {stats.due} due</span>
          <span className="text-emerald-400">✓ {stats.mastered} mastered</span>
        </div>
      </div>

      {doc.cards.length === 0 ? (
        <p className="rounded-xl border border-ink-600 bg-ink-850 p-8 text-center text-sm text-slate-400">
          No cards could be generated from this text. Try pasting longer, fact-rich paragraphs.
        </p>
      ) : mode === 'cards' ? (
        <Flashcard doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      ) : (
        <Quiz doc={doc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />
      )}
    </div>
  )
}
