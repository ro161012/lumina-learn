/**
 * SM-2 spaced repetition scheduler (Anki-style).
 * Tracks per-card ease and interval so Lumina schedules reviews
 * right before you'd forget — the core of personalized learning.
 */

export type Rating = 0 | 1 | 2 | 3 // Again, Hard, Good, Easy

export interface CardState {
  ease: number // multiplier, starts 2.5
  intervalDays: number
  reps: number
  lapses: number
  due: number // epoch ms
}

export function newCardState(now = Date.now()): CardState {
  return { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, due: now }
}

export function isDue(state: CardState, now = Date.now()): boolean {
  return state.due <= now
}

export function schedule(state: CardState, rating: Rating, now = Date.now()): CardState {
  const s = { ...state }
  s.reps += 1

  if (rating === 0) {
    s.lapses += 1
    s.ease = Math.max(1.3, s.ease - 0.2)
    s.intervalDays = 0
    s.due = now + 1 * 60 * 1000 // relearn in ~1 minute
    return s
  }

  if (s.reps === 1) {
    s.intervalDays = rating === 3 ? 3 : rating === 2 ? 1 : 0.5
  } else if (s.reps === 2) {
    s.intervalDays = rating === 3 ? 6 : rating === 2 ? 3.5 : 1.5
  } else {
    const easeDelta = rating === 3 ? 0.15 : rating === 2 ? 0 : -0.15
    s.ease = Math.min(3.2, Math.max(1.3, s.ease + easeDelta))
    const mult = rating === 3 ? s.ease : rating === 2 ? Math.max(1.2, s.ease * 0.85) : 1.2
    s.intervalDays = Math.max(1, s.intervalDays * mult)
  }

  s.due = now + s.intervalDays * 24 * 60 * 60 * 1000
  return s
}

/** Rough mastery: blend of reps, interval and ease. 0..100 */
export function masteryOf(state: CardState): number {
  const intervalScore = Math.min(1, state.intervalDays / 21)
  const repScore = Math.min(1, state.reps / 5)
  const easeScore = (state.ease - 1.3) / (3.2 - 1.3)
  return Math.round(100 * (0.45 * intervalScore + 0.35 * repScore + 0.2 * easeScore))
}
