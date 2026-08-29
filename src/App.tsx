import { useEffect, useState } from 'react'
import { GraduationCap, MessageSquare, Layers, BarChart3, FilePlus2 } from 'lucide-react'
import Sidebar from './components/Sidebar'
import StudyView from './components/StudyView'
import AskView from './components/AskView'
import ConceptsView from './components/ConceptsView'
import ProgressView from './components/ProgressView'
import NewDocView from './components/NewDocView'
import { Button, cn } from './components/ui'
import { loadDocs, persistDocs, loadProfile, persistProfile, type Doc, type Profile } from './lib/store'
import { preloadModels } from './lib/ai'

export type Tab = 'study' | 'ask' | 'concepts' | 'progress' | 'new'

const TABS: { id: Tab; label: string; icon: typeof GraduationCap }[] = [
  { id: 'study', label: 'Study', icon: GraduationCap },
  { id: 'ask', label: 'Ask', icon: MessageSquare },
  { id: 'concepts', label: 'Concepts', icon: Layers },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
]

export default function App() {
  const [docs, setDocs] = useState<Doc[]>(() => loadDocs())
  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const [activeDocId, setActiveDocId] = useState<string | null>(() => loadDocs()[0]?.id ?? null)
  const [tab, setTab] = useState<Tab>('study')
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready'>('idle')

  useEffect(() => { persistDocs(docs) }, [docs])
  useEffect(() => { persistProfile(profile) }, [profile])

  useEffect(() => {
    preloadModels((p) => {
      if (p.status === 'ready') setAiStatus('ready')
      else if (p.status === 'progress' || p.status === 'initiate') setAiStatus('loading')
    })
  }, [])

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null

  return (
    <div className="relative flex h-full">
      {/* Deep-space backdrop: starfield + Gargantua black hole */}
      <div aria-hidden className="fixed inset-0 z-0">
        <div className="stars" />
        <div className="blackhole">
          <div className="blackhole-glow" />
          <div className="blackhole-disk" />
          <div className="blackhole-ring" />
          <div className="blackhole-core" />
        </div>
      </div>

      <div className="relative z-10 flex h-full min-w-0 flex-1">
        <Sidebar
        docs={docs}
        activeDocId={activeDocId}
        onSelectDoc={(id) => { setActiveDocId(id); setTab('study') }}
        onNewDoc={() => setTab('new')}
        onDeleteDoc={(id) => {
          setDocs((prev) => prev.filter((d) => d.id !== id))
          if (activeDocId === id) {
            const remaining = docs.filter((d) => d.id !== id)
            setActiveDocId(remaining[0]?.id ?? null)
          }
        }}
        profile={profile}
        aiStatus={aiStatus}
      />

      <main className="flex-1 overflow-y-auto">

        {tab === 'new' && (
          <NewDocView onCreated={(doc) => { setDocs((prev) => [doc, ...prev]); setActiveDocId(doc.id); setTab('study') }} />
        )}

        {tab !== 'new' && !activeDoc && <EmptyState onNew={() => setTab('new')} />}

        {tab !== 'new' && activeDoc && (
          <div className="mx-auto max-w-4xl px-8 py-8">
            {/* Header */}
            <header className="fade-up">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-paper-100">{activeDoc.title}</h1>
              <p className="mt-1.5 text-sm text-paper-500">
                {activeDoc.cards.length} cards · {activeDoc.quiz.length} quiz questions · added{' '}
                {new Date(activeDoc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </header>

            {/* Tab bar */}
            <nav className="fade-up mt-6 flex gap-6 border-b border-white/[0.06]" style={{ animationDelay: '0.04s' }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    '-mb-px flex items-center gap-2 border-b-2 px-0.5 pb-3 pt-1 text-sm font-medium transition-colors',
                    tab === id
                      ? 'border-accent-500 text-paper-100'
                      : 'border-transparent text-paper-500 hover:border-white/[0.12] hover:text-paper-300',
                  )}
                >
                  <Icon size={15} strokeWidth={tab === id ? 2.4 : 2} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="fade-up pt-6" style={{ animationDelay: '0.08s' }}>
              {tab === 'study' && <StudyView doc={activeDoc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />}
              {tab === 'ask' && <AskView doc={activeDoc} />}
              {tab === 'concepts' && <ConceptsView doc={activeDoc} />}
              {tab === 'progress' && <ProgressView doc={activeDoc} />}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-ink-850">
        <FilePlus2 size={24} className="text-accent-400" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-paper-100">No study set selected</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-paper-500">
          Paste lecture notes, a textbook chapter, or an article. Lumina builds flashcards, a quiz, and an AI
          tutor from your material — all in your browser.
        </p>
      </div>
      <Button variant="primary" onClick={onNew}>Create a study set</Button>
    </div>
  )
}
