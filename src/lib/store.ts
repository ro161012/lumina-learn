/**
 * Document + progress model with localStorage persistence.
 * Everything stays on-device — privacy is a feature.
 */

import { buildQuiz, generateCards } from './nlp'
import { isDue, masteryOf, newCardState, schedule, type CardState, type Rating } from './scheduler'

export interface Card {
  id: string
  type: 'cloze' | 'qa' | 'definition'
  question: string
  answer: string
  sourceIndex: number // sentence index for citation
  state: CardState
  history: { t: number; rating: Rating }[]
}

export interface QuizItem {
  question: string
  options: string[]
  correctIndex: number
  sourceIndex: number
}

export interface Doc {
  id: string
  title: string
  text: string
  createdAt: number
  cards: Card[]
  quiz: QuizItem[]
}

export interface DeckStats {
  total: number
  due: number
  mastered: number
  masteryPct: number
  streak: number
  lastStudied: number | null
}

const LS_DOCS = 'lumina.docs.v1'
const LS_PROFILE = 'lumina.profile.v1'

export interface Profile {
  streak: number
  lastStudyDay: string | null
  totalReviews: number
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

export function loadDocs(): Doc[] {
  return load<Doc[]>(LS_DOCS, [])
}

export function persistDocs(docs: Doc[]) {
  save(LS_DOCS, docs)
}

export function loadProfile(): Profile {
  return load<Profile>(LS_PROFILE, { streak: 0, lastStudyDay: null, totalReviews: 0 })
}

export function persistProfile(p: Profile) {
  save(LS_PROFILE, p)
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

/** Update streak when a study session completes. */
export function bumpStreak(p: Profile): Profile {
  const today = todayKey()
  if (p.lastStudyDay === today) return p
  const yesterday = todayKey(new Date(Date.now() - 86_400_000))
  return {
    streak: p.lastStudyDay === yesterday ? p.streak + 1 : 1,
    lastStudyDay: today,
    totalReviews: p.totalReviews,
  }
}

let idCounter = 0
export function uid(prefix = 'id'): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.random().toString(36).slice(2, 7)}`
}

/** Build a full study deck (cards + quiz) from raw text. */
export function makeDoc(title: string, text: string): Doc {
  const generated = generateCards(text)
  const cards: Card[] = generated.map((g) => ({
    id: uid('card'),
    type: g.type,
    question: g.question,
    answer: g.answer,
    sourceIndex: g.sourceIndex,
    state: newCardState(),
    history: [],
  }))

  return {
    id: uid('doc'),
    title,
    text,
    createdAt: Date.now(),
    cards,
    quiz: buildQuiz(generated, 8),
  }
}

/** Apply a review rating to a card and persist. */
export function rateCard(docs: Doc[], docId: string, cardId: string, rating: Rating, profile: Profile): { docs: Doc[]; profile: Profile } {
  const next = docs.map((d) => {
    if (d.id !== docId) return d
    return {
      ...d,
      cards: d.cards.map((c) =>
        c.id === cardId
          ? { ...c, state: schedule(c.state, rating), history: [...c.history, { t: Date.now(), rating }] }
          : c,
      ),
    }
  })
  const totalReviews = profile.totalReviews + 1
  const withStreak = bumpStreak(profile)
  return { docs: next, profile: { ...withStreak, totalReviews } }
}

/** Recompute deck-level stats for the UI. */
export function deckStats(doc: Doc): DeckStats {
  const now = Date.now()
  const due = doc.cards.filter((c) => isDue(c.state, now)).length
  const mastered = doc.cards.filter((c) => masteryOf(c.state) >= 80).length
  const lastReview = doc.cards.reduce((latest, c) => {
    const last = c.history.at(-1)?.t ?? 0
    return last > latest ? last : latest
  }, 0)

  const avg = doc.cards.length
    ? doc.cards.reduce((sum, c) => sum + masteryOf(c.state), 0) / doc.cards.length
    : 0

  const profile = loadProfile()
  return {
    total: doc.cards.length,
    due,
    mastered,
    masteryPct: Math.round(avg),
    streak: profile.streak,
    lastStudied: lastReview || null,
  }
}
