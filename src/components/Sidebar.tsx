import { memo } from 'react'
import { GLASS, GLASS_HOVER, GLASS_ACTIVE, HeroSurface } from './Glass'
import { deckStats, type Doc, type Profile } from '../lib/store'

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
    <HeroSurface className="h-full" displacementScale={30}>
      <aside className="flex h-full w-72 flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.3))', animation: 'glow 4s ease-in-out infinite alternate' }}>✨</div>
          <div>
            <div className="text-base font-bold text-white tracking-wide">Lumina</div>
            <div className="text-[11px] text-slate-400">Learn anything, faster</div>
          </div>
        </div>

        {/* New doc button */}
        <div className="px-4">
          <button
            onClick={onNewDoc}
            className={`w-full rounded-xl bg-indigo-500/20 border border-indigo-500/20 px-4 py-2.5 text-sm font-semibold text-white
              hover:bg-indigo-500/30 hover:border-indigo-500/30
              active:scale-[0.98] transition-all duration-200
              shadow-[0_0_20px_rgba(99,102,241,0.1)]`}
          >
            + New study set
          </button>
        </div>

        {/* Doc list */}
        <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {docs.length === 0 && (
            <p className="px-2 py-6 text-xs text-slate-500 text-center">No study sets yet.</p>
          )}
          {docs.map((d) => (
            <DocItem
              key={d.id}
              doc={d}
              active={d.id === activeDocId}
              onSelect={() => onSelectDoc(d.id)}
              onDelete={() => {
                if (confirm(`Delete "${d.title}"?`)) onDeleteDoc(d.id)
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="text-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(251,146,60,0.4))' }}>🔥</span>
              Streak
            </span>
            <span className="font-semibold text-white">{profile.streak}d</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="text-sm">🧠</span>
              AI
            </span>
            <span className={
              aiStatus === 'ready' ? 'text-emerald-400 flex items-center gap-1'
                : aiStatus === 'loading' ? 'text-amber-400 pulse-dot'
                : 'text-slate-500'
            }>
              {aiStatus === 'ready' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {aiStatus === 'loading' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              {aiStatus === 'ready' ? 'online' : aiStatus === 'loading' ? 'loading…' : 'first use'}
            </span>
          </div>
        </div>
      </aside>
    </HeroSurface>
  )
}

const DocItem = memo(function DocItem({
  doc, active, onSelect, onDelete,
}: {
  doc: Doc; active: boolean; onSelect: () => void; onDelete: () => void
}) {
  const stats = deckStats(doc)
  return (
    <div
      className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm cursor-pointer
        transition-all duration-200
        ${active ? GLASS_ACTIVE : GLASS_HOVER}`}
      onClick={onSelect}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-400" />
      )}
      <div className="min-w-0 flex-1 pl-1">
        <div className="truncate font-medium text-white">{doc.title}</div>
        <div className="text-[11px] text-slate-500">{stats.total} · {stats.due} due</div>
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
        title="Delete"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
      >
        ✕
      </button>
    </div>
  )
})
