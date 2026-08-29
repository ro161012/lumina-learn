/**
 * Reusable glass surface components powered by liquid-glass-react.
 * Provides Card, Panel, Button, and Input variants for consistent
 * liquid glass styling throughout the app.
 */

import { type ReactNode, useRef } from 'react'
import LiquidGlass from 'liquid-glass-react'

// ─── Card: a floating glass panel ────────────────────────────────────────────
interface CardProps {
  children: ReactNode
  className?: string
  padding?: string
  onClick?: () => void
  /** Subtle (default) or intense refraction */
  intensity?: 'subtle' | 'medium' | 'strong'
  cornerRadius?: number
}

const INTENSITY = {
  subtle: { displacementScale: 40, blurAmount: 0.04, aberrationIntensity: 1 },
  medium: { displacementScale: 60, blurAmount: 0.06, aberrationIntensity: 2 },
  strong: { displacementScale: 80, blurAmount: 0.08, aberrationIntensity: 3 },
} as const

export function GlassCard({
  children,
  className = '',
  padding,
  onClick,
  intensity = 'medium',
  cornerRadius = 28,
}: CardProps) {
  return (
    <LiquidGlass
      displacementScale={INTENSITY[intensity].displacementScale}
      blurAmount={INTENSITY[intensity].blurAmount}
      saturation={130}
      aberrationIntensity={INTENSITY[intensity].aberrationIntensity}
      elasticity={0.2}
      cornerRadius={cornerRadius}
      className={`rounded-[28px] ${className}`}
      padding={padding}
      onClick={onClick}
    >
      {children}
    </LiquidGlass>
  )
}

// ─── Panel: a larger surface (sidebar, main background) ─────────────────────
interface PanelProps {
  children: ReactNode
  className?: string
  padding?: string
}

export function GlassPanel({ children, className = '', padding }: PanelProps) {
  return (
    <LiquidGlass
      displacementScale={35}
      blurAmount={0.03}
      saturation={120}
      aberrationIntensity={0.8}
      elasticity={0.15}
      cornerRadius={0}
      className={className}
      padding={padding}
    >
      {children}
    </LiquidGlass>
  )
}

// ─── Button: a small interactive glass element ──────────────────────────────
interface GlassButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}

export function GlassButton({ children, className = '', onClick, active }: GlassButtonProps) {
  return (
    <LiquidGlass
      displacementScale={active ? 55 : 40}
      blurAmount={0.05}
      saturation={active ? 160 : 130}
      aberrationIntensity={active ? 2.5 : 1}
      elasticity={0.35}
      cornerRadius={16}
      className={`rounded-2xl ${className}`}
      padding="6px 14px"
      onClick={onClick}
    >
      {children}
    </LiquidGlass>
  )
}

// ─── Input: glass-styled text field ─────────────────────────────────────────
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

export function GlassInput({
  value,
  onChange,
  placeholder,
  className = '',
  rows,
  disabled,
  required,
  name,
}: GlassInputProps) {
  const isTextArea = rows !== undefined

  if (isTextArea) {
    return (
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition ${className}`}
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
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 backdrop-blur-xl focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition ${className}`}
    />
  )
}

// ─── Glass surfaces for tab bars ────────────────────────────────────────────
interface TabBarProps {
  children: ReactNode
  className?: string
}

export function GlassTabBar({ children, className = '' }: TabBarProps) {
  return (
    <LiquidGlass
      displacementScale={30}
      blurAmount={0.025}
      saturation={110}
      aberrationIntensity={0.6}
      elasticity={0.1}
      cornerRadius={20}
      className={`rounded-2xl ${className}`}
    >
      {children}
    </LiquidGlass>
  )
}

// ─── Chip: tiny glass pill (badges, tags) ───────────────────────────────────
interface GlassChipProps {
  children: ReactNode
  color?: string
  className?: string
}

export function GlassChip({ children, color = 'bg-white/10 text-slate-300', className = '' }: GlassChipProps) {
  return (
    <LiquidGlass
      displacementScale={20}
      blurAmount={0.02}
      saturation={100}
      aberrationIntensity={0.4}
      elasticity={0.05}
      cornerRadius={999}
      className={`rounded-full ${className}`}
    >
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${color}`}>
        {children}
      </span>
    </LiquidGlass>
  )
}
