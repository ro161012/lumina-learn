import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import StudyView from './components/StudyView'
import AskView from './components/AskView'
import ConceptsView from './components/ConceptsView'
import ProgressView from './components/ProgressView'
import NewDocView from './components/NewDocView'
import { GLASS } from './components/Glass'
import { loadDocs, persistDocs, loadProfile, persistProfile, type Doc, type Profile } from './lib/store'
import { preloadModels } from './lib/ai'

export type Tab = 'study' | 'ask' | 'concepts' | 'progress' | 'new'

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
    <div className="glass-bg-orbs flex h-full">
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

      <main className="flex-1 overflow-y-auto p-6">
        {tab === 'new' && (
          <NewDocView onCreated={(doc) => { setDocs((prev) => [doc, ...prev]); setActiveDocId(doc.id); setTab('study') }} />
        )}

        {tab !== 'new' && !activeDoc && <EmptyState onNew={() => setTab('new')} />}

        {tab !== 'new' && activeDoc && (
          <div className="mx-auto max-w-5xl">
            {/* Doc header */}
            <header className="mb-6 fade-up">
              <div className={`${GLASS} rounded-3xl px-7 py-5`}>
                <h1 className="text-2xl font-bold text-white">{activeDoc.title}</h1>
                <p className="mt-1 text-sm text-slate-300">
                  {activeDoc.cards.length} cards · {activeDoc.quiz.length} quiz ·{' '}
                  {new Date(activeDoc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </header>

            {/* Tab bar */}
            <nav className="mb-6 fade-up" style={{ animationDelay: '0.05s' }}>
              <div className={`${GLASS} rounded-2xl p-1.5 flex gap-1`}>
                {(
                  [['study', '🎓 Study'], ['ask', '💬 Ask'], ['concepts', '🧠 Concepts'], ['progress', '📊 Progress']] as [Tab, string][]
                ).map(([t, label]) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      tab === t
                        ? 'bg-indigo-500/25 text-white shadow-[0_0_15px_rgba(99,102,241,0.12)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="fade-up" style={{ animationDelay: '0.1s' }}>
              {tab === 'study' && <StudyView doc={activeDoc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />}
              {tab === 'ask' && <AskView doc={activeDoc} />}
              {tab === 'concepts' && <ConceptsView doc={activeDoc} />}
              {tab === 'progress' && <ProgressView doc={activeDoc} />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center fade-up">
      <div className="text-7xl" style={{ animation: 'float 6s ease-in-out infinite' }}>✨</div>
      <h2 className="text-xl font-semibold text-white">No document selected</h2>
      <p className="max-w-md text-sm text-slate-300">
        Paste any study material and Lumina will build flashcards, quizzes, and an AI tutor instantly.
      </p>
      <button onClick={onNew}
        className="rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-6 py-3 text-sm font-semibold text-white
          hover:bg-indigo-500/30 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
        + Add your first text
      </button>
    </div>
  )
}
