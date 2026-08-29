import { useState } from 'react'
import { GraduationCap, ListChecks, BookOpen, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from './ui'
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
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-ink-900 p-1">
          {(
            [
              ['cards', 'Flashcards', GraduationCap],
              ['quiz', 'Quiz', ListChecks],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                mode === m ? 'bg-white/[0.08] text-paper-100' : 'text-paper-500 hover:text-paper-300',
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs text-paper-500">
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {stats.total} cards
          </span>
          <span className="flex items-center gap-1.5 text-accent-400">
            <Clock size={14} />
            {stats.due} due
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={14} />
            {stats.mastered} mastered
          </span>
        </div>
      </div>

      {doc.cards.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-ink-850 p-10 text-center text-sm text-paper-500">
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
