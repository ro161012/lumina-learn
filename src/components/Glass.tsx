/**
 * Optimized glass component system.
 *
 * Strategy:
 *  - CSS-only backdrop-filter glassmorphism for ~90% of surfaces (fast, zero GPU overhead)
 *  - LiquidGlass (WebGL) reserved for 2-3 hero surfaces only (sidebar, flashcard, main panel)
 *
 * Each LiquidGlass instance creates a WebGL canvas — having 5+ on screen at once
 * tanks FPS. CSS backdrop-filter gives 95% of the look at 1% of the cost.
 */

import { type ReactNode, memo } from 'react'
import LiquidGlass from 'liquid-glass-react'

// ─── CSS-only glass surfaces (no WebGL, zero overhead) ─────────────────────

/** Base CSS glass class — used everywhere for instant, smooth rendering */
export const GLASS = `
  border border-white/[0.08]
  bg-white/[0.04]
  backdrop-blur-xl
  shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.25)]
`.replace(/\n\s*/g, ' ').trim()

export const GLASS_HOVER = `
  ${GLASS}
  transition-all duration-300 ease-out
  hover:bg-white/[0.07]
  hover:border-white/[0.12]
  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(99,102,241,0.06)]
`.replace(/\n\s*/g, ' ').trim()

export const GLASS_ACTIVE = `
  ${GLASS}
  bg-indigo-500/15
  border-indigo-500/20
  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_rgba(99,102,241,0.12)]
`.replace(/\n\s*/g, ' ').trim()

// ─── GlassCard: CSS-only for small/numerous items ──────────────────────────

interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: string
  onClick?: () => void
  active?: boolean
}

export const GlassCard = memo(function GlassCard({
  children,
  className = '',
  padding,
  onClick,
  active,
}: GlassCardProps) {
  return (
    <div
      className={`${active ? GLASS_ACTIVE : GLASS_HOVER} rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={padding ? { padding } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
})

// ─── GlassButton: small interactive elements ────────────────────────────────

interface GlassButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}

export const GlassButton = memo(function GlassButton({
  children,
  className = '',
  onClick,
  active,
}: GlassButtonProps) {
  return (
    <button
      className={`${active ? GLASS_ACTIVE : GLASS_HOVER} rounded-xl px-4 py-2 text-sm font-semibold text-white ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
})

// ─── GlassInput: text fields ───────────────────────────────────────────────

interface GlassInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  name?: string
}

export const GlassInput = memo(function GlassInput({
  value,
  onChange,
  placeholder,
  className = '',
  rows,
  disabled,
  required,
  name,
}: GlassInputProps) {
  const cls = `w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition ${className}`

  if (rows !== undefined) {
    return (
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`${cls} leading-relaxed`}
      />
    )
  }

  return (
    <input
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cls}
    />
  )
})

// ─── GlassPanel: large surfaces (WebGL — use sparingly) ────────────────────

interface GlassPanelProps {
  children: ReactNode
  className?: string
  padding?: string
}

export function GlassPanel({ children, className = '', padding }: GlassPanelProps) {
  return (
    <LiquidGlass
      displacementScale={30}
      blurAmount={0.025}
      saturation={115}
      aberrationIntensity={0.6}
      elasticity={0.12}
      cornerRadius={0}
      className={className}
      padding={padding}
    >
      {children}
    </LiquidGlass>
  )
}

// ─── GlassTabBar: pill container for tabs ───────────────────────────────────

interface TabBarProps {
  children: ReactNode
  className?: string
}

export function GlassTabBar({ children, className = '' }: TabBarProps) {
  return (
    <div className={`${GLASS} rounded-2xl p-1.5 ${className}`}>
      {children}
    </div>
  )
}

// ─── GlassChip: tiny pill (badges, tags) — CSS only ────────────────────────

interface GlassChipProps {
  children: ReactNode
  color?: string
  className?: string
}

export const GlassChip = memo(function GlassChip({
  children,
  color = 'bg-white/[0.06] text-slate-300 border-white/[0.08]',
  className = '',
}: GlassChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xl ${color} ${className}`}>
      {children}
    </span>
  )
})

// ─── HeroSurface: the ONE place to use WebGL glass ─────────────────────────
// Use this for the sidebar and the main flashcard — nothing else.

interface HeroSurfaceProps {
  children: ReactNode
  className?: string
  displacementScale?: number
  cornerRadius?: number
}

export function HeroSurface({ children, className = '', displacementScale = 35, cornerRadius = 0 }: HeroSurfaceProps) {
  return (
    <LiquidGlass
      displacementScale={displacementScale}
      blurAmount={0.03}
      saturation={120}
      aberrationIntensity={0.7}
      elasticity={0.15}
      cornerRadius={cornerRadius}
      className={className}
    >
      {children}
    </LiquidGlass>
  )
}
