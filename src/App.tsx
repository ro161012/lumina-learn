import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import StudyView from './components/StudyView'
import AskView from './components/AskView'
import ConceptsView from './components/ConceptsView'
import ProgressView from './components/ProgressView'
import NewDocView from './components/NewDocView'
import { loadDocs, persistDocs, loadProfile, persistProfile, type Doc, type Profile } from './lib/store'
import { preloadModels } from './lib/ai'

export type Tab = 'study' | 'ask' | 'concepts' | 'progress' | 'new'

export default function App() {
  const [docs, setDocs] = useState<Doc[]>(() => loadDocs())
  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const [activeDocId, setActiveDocId] = useState<string | null>(() => loadDocs()[0]?.id ?? null)
  const [tab, setTab] = useState<Tab>('study')
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready'>('idle')

  // Persist whenever docs change
  useEffect(() => {
    persistDocs(docs)
  }, [docs])

  useEffect(() => {
    persistProfile(profile)
  }, [profile])

  // Warm up AI models in the background on first load
  useEffect(() => {
    preloadModels((p) => {
      if (p.status === 'ready') setAiStatus('ready')
      else if (p.status === 'progress' || p.status === 'initiate') setAiStatus('loading')
    })
    // Give it a moment then check readiness
    const t = setTimeout(() => setAiStatus((s) => (s === 'loading' ? 'loading' : s)), 100)
    return () => clearTimeout(t)
  }, [])

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null

  return (
    <div className="flex h-full">
      <Sidebar
        docs={docs}
        activeDocId={activeDocId}
        onSelectDoc={(id) => {
          setActiveDocId(id)
          setTab('study')
        }}
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
          <NewDocView
            onCreated={(doc) => {
              setDocs((prev) => [doc, ...prev])
              setActiveDocId(doc.id)
              setTab('study')
            }}
          />
        )}

        {tab !== 'new' && !activeDoc && (
          <EmptyState onNew={() => setTab('new')} />
        )}

        {tab !== 'new' && activeDoc && (
          <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Doc header */}
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-white">{activeDoc.title}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {activeDoc.cards.length} cards · {activeDoc.quiz.length} quiz questions · created{' '}
                {new Date(activeDoc.createdAt).toLocaleDateString()}
              </p>
            </header>

            {/* Tabs */}
            <nav className="mb-6 flex gap-1 rounded-xl bg-ink-850 p-1">
              {(
                [
                  ['study', '🎓 Study'],
                  ['ask', '💬 Ask'],
                  ['concepts', '🧠 Concepts'],
                  ['progress', '📊 Progress'],
                ] as [Tab, string][]
              ).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    tab === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === 'study' && <StudyView doc={activeDoc} docs={docs} setDocs={setDocs} profile={profile} setProfile={setProfile} />}
            {tab === 'ask' && <AskView doc={activeDoc} />}
            {tab === 'concepts' && <ConceptsView doc={activeDoc} />}
            {tab === 'progress' && <ProgressView doc={activeDoc} />}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">✨</div>
      <h2 className="text-xl font-semibold text-white">No document selected</h2>
      <p className="max-w-md text-sm text-slate-400">
        Paste any study material — lecture notes, a textbook section, an article — and Lumina will instantly
        build flashcards, a quiz, and an AI tutor you can ask questions.
      </p>
      <button
        onClick={onNew}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        + Add your first text
      </button>
    </div>
  )
}
