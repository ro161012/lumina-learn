import { memo } from 'react'
import { Flame, Plus, Cpu, Trash2, BookOpen } from 'lucide-react'
import { cn } from './ui'
import { Logo } from './ui'
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

export default function Sidebar({
  docs,
  activeDocId,
  onSelectDoc,
  onNewDoc,
  onDeleteDoc,
  profile,
  aiStatus,
}: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <Logo />
        <div>
          <div className="font-display text-[17px] font-semibold leading-tight tracking-tight text-paper-100">
            Lumina
          </div>
          <div className="text-[11px] leading-tight text-paper-500">From notes to knowledge</div>
        </div>
      </div>

      {/* New study set */}
      <div className="px-4">
        <button
          onClick={onNewDoc}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all hover:bg-accent-400 active:scale-[0.98] active:bg-accent-600"
        >
          <Plus size={16} strokeWidth={2.5} />
          New study set
        </button>
      </div>

      {/* Deck list */}
      <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-600">
          Study sets
        </p>
        {docs.length === 0 && (
          <p className="px-2 py-6 text-xs text-paper-500">No study sets yet. Paste some text to begin.</p>
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
      <div className="border-t border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-paper-500">
            <Flame size={14} className="text-amber-500/80" />
            Streak
          </span>
          <span className="font-medium text-paper-200">{profile.streak} day{profile.streak === 1 ? '' : 's'}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-paper-500">
            <Cpu size={14} className="text-paper-500" />
            AI engine
          </span>
          <span className={cn(
            'flex items-center gap-1.5 font-medium',
            aiStatus === 'ready' ? 'text-emerald-400' : aiStatus === 'loading' ? 'text-accent-400' : 'text-paper-500',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', aiStatus === 'ready' ? 'bg-emerald-400' : aiStatus === 'loading' ? 'bg-accent-400 animate-pulse' : 'bg-paper-600')} />
            {aiStatus === 'ready' ? 'Ready · offline' : aiStatus === 'loading' ? 'Loading…' : 'On first use'}
          </span>
        </div>
      </div>
    </aside>
  )
}

const DocItem = memo(function DocItem({
  doc,
  active,
  onSelect,
  onDelete,
}: {
  doc: Doc
  active: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const stats = deckStats(doc)
  return (
    <div
      className={cn(
        'group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
        active ? 'bg-white/[0.06] text-paper-100' : 'text-paper-300 hover:bg-white/[0.03] hover:text-paper-100',
      )}
      onClick={onSelect}
    >
      <BookOpen size={15} className={cn('shrink-0', active ? 'text-accent-400' : 'text-paper-600 group-hover:text-paper-400')} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium leading-tight">{doc.title}</div>
        <div className="mt-0.5 text-[11px] leading-tight text-paper-600">
          {stats.total} cards{stats.due > 0 ? ` · ${stats.due} due` : ''}
        </div>
      </div>
      <button
        className="shrink-0 rounded p-1 text-paper-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
})
