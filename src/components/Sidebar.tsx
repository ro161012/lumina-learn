import LiquidGlass from 'liquid-glass-react'
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
    <LiquidGlass
      displacementScale={35}
      blurAmount={0.03}
      saturation={120}
      aberrationIntensity={0.8}
      elasticity={0.15}
      cornerRadius={0}
      className="h-full"
      style={{ width: 288 }}
    >
      <aside className="flex h-full w-72 flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="text-3xl animate-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.3))' }}>✨</div>
          <div>
            <div className="text-base font-bold text-white tracking-wide">Lumina</div>
            <div className="text-[11px] text-slate-400">Learn anything, faster</div>
          </div>
        </div>

        {/* New doc button */}
        <div className="px-4">
          <LiquidGlass
            displacementScale={50}
            blurAmount={0.04}
            saturation={150}
            aberrationIntensity={2}
            elasticity={0.35}
            cornerRadius={14}
            className="rounded-xl"
            onClick={onNewDoc}
          >
            <span className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white cursor-pointer">
              + New study set
            </span>
          </LiquidGlass>
        </div>

        {/* Doc list */}
        <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {docs.length === 0 && (
            <p className="px-2 py-6 text-xs text-slate-500 text-center">No study sets yet. Paste some text to begin.</p>
          )}
          {docs.map((d) => {
            const stats = deckStats(d)
            const active = d.id === activeDocId
            return (
              <div
                key={d.id}
                className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm cursor-pointer glass-hover ${
                  active
                    ? 'bg-indigo-500/15 text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
                onClick={() => onSelectDoc(d.id)}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-400" />
                )}
                <div className="min-w-0 flex-1 pl-1">
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

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="inline-block text-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(251,146,60,0.4))' }}>🔥</span>
              Streak
            </span>
            <span className="font-semibold text-white">{profile.streak} day{profile.streak === 1 ? '' : 's'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="inline-block text-sm">🧠</span>
              AI models
            </span>
            <span className={
              aiStatus === 'ready'
                ? 'text-emerald-400 flex items-center gap-1'
                : aiStatus === 'loading'
                ? 'text-amber-400 flex items-center gap-1 pulse-dot'
                : 'text-slate-500'
            }>
              {aiStatus === 'ready' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {aiStatus === 'loading' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />}
              {aiStatus === 'ready' ? 'ready · offline' : aiStatus === 'loading' ? 'downloading…' : 'on first use'}
            </span>
          </div>
        </div>
      </aside>
    </LiquidGlass>
  )
}
