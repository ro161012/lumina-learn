import { deckStats, type Doc, type Profile } from '../lib/store'
import type { Tab } from '../App'

interface Props {
  docs: Doc[]
  activeDocId: string | null
  onSelectDoc: (id: string) => void
  onNewDoc: () => void
  onDeleteDoc: (id: string) => void
  profile: Profile
  aiStatus: 'idle' | 'loading' | 'ready'
}

export default function Sidebar({ docs, activeDocId, onSelectDoc, onNewDoc, onDeleteDoc, profile, aiStatus }: Props) {
  return (
    <aside className="flex w-72 flex-col border-r border-ink-700 bg-ink-900">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-2xl">✨</span>
        <div>
          <div className="text-base font-bold text-white">Lumina</div>
          <div className="text-[11px] text-slate-500">Learn anything, faster</div>
        </div>
      </div>

      {/* New doc button */}
      <div className="px-4">
        <button
          onClick={onNewDoc}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + New study set
        </button>
      </div>

      {/* Doc list */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {docs.length === 0 && (
          <p className="px-2 py-6 text-xs text-slate-500">No study sets yet. Paste some text to begin.</p>
        )}
        {docs.map((d) => {
          const stats = deckStats(d)
          return (
            <div
              key={d.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                d.id === activeDocId ? 'bg-ink-700 text-white' : 'text-slate-300 hover:bg-ink-800'
              }`}
              onClick={() => onSelectDoc(d.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{d.title}</div>
                <div className="text-[11px] text-slate-500">
                  {stats.total} cards · {stats.due} due
                </div>
              </div>
              <button
                className="opacity-0 transition group-hover:opacity-100 text-slate-500 hover:text-red-400"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${d.title}"?`)) onDeleteDoc(d.id)
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </nav>

      {/* Footer: streak + AI status */}
      <div className="border-t border-ink-700 px-5 py-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">🔥 Streak</span>
          <span className="font-semibold text-white">{profile.streak} day{profile.streak === 1 ? '' : 's'}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-slate-400">🧠 AI models</span>
          <span className={aiStatus === 'ready' ? 'text-emerald-400' : aiStatus === 'loading' ? 'text-amber-400 pulse-dot' : 'text-slate-500'}>
            {aiStatus === 'ready' ? 'ready · offline' : aiStatus === 'loading' ? 'downloading…' : 'on first use'}
          </span>
        </div>
      </div>
    </aside>
  )
}
