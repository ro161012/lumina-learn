/**
 * Lumina UI primitives — one consistent design system.
 * No glass, no glow-slop: solid layered surfaces, crisp borders,
 * a warm ink/paper palette with a single amber accent.
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// ─── Logo mark ──────────────────────────────────────────────────────────────

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#1b1915" stroke="rgba(255,255,255,0.08)" />
      <path
        d="M12 5.5l1.9 4.6 4.6 1.9-4.6 1.9L12 18.5l-1.9-4.6-4.6-1.9 4.6-1.9z"
        fill="#e9ae44"
      />
      <path d="M18.5 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" fill="#f2c669" opacity="0.85" />
    </svg>
  )
}

// ─── Button ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-500 text-ink-950 font-semibold hover:bg-accent-400 active:bg-accent-600 shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
  secondary:
    'border border-white/[0.1] text-paper-200 hover:bg-white/[0.05] hover:border-white/[0.16] active:bg-white/[0.08]',
  ghost: 'text-paper-400 hover:text-paper-100 hover:bg-white/[0.04]',
  danger: 'border border-red-500/25 text-red-300 hover:bg-red-500/10 active:bg-red-500/15',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'secondary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  )
}

// ─── Card ───────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] bg-ink-850 shadow-card',
        onClick && 'cursor-pointer transition-colors hover:border-white/[0.12] hover:bg-ink-800',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

// ─── Badge ──────────────────────────────────────────────────────────────────

type BadgeTone = 'accent' | 'success' | 'warn' | 'danger' | 'neutral'

const BADGE_TONES: Record<BadgeTone, string> = {
  accent: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  warn: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-300 border-red-500/20',
  neutral: 'bg-white/[0.05] text-paper-400 border-white/[0.08]',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── Section label ──────────────────────────────────────────────────────────

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-500', className)}>
      {children}
    </h2>
  )
}

// ─── StatCard ───────────────────────────────────────────────────────────────

export function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode
  label: string
  value: string
  className?: string
}) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="font-display text-2xl font-semibold tracking-tight text-paper-100">{value}</div>
          <div className="mt-0.5 truncate text-xs text-paper-500">{label}</div>
        </div>
        <div className="text-paper-500">{icon}</div>
      </div>
    </Card>
  )
}
