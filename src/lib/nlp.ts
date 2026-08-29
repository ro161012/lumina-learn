/**
 * Lightweight, dependency-free NLP toolkit.
 * Powers flashcard generation, cloze deletions, MCQ distractors,
 * keyword extraction and keyword search — all offline, all local.
 */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't he her here hers herself him himself his how i if in into is isn't it its itself let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she should shouldn't so some such than that the their theirs them themselves then there these they this those through to too under until up very was wasn't we were weren't what when where which while who whom why with won't would wouldn't you your yours yourself yourselves also using used use often may might many much however therefore thus whereas although though via e.g i.e etc'`.split(
    /\s+/,
  ),
)

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'-]*|\d+(?:\.\d+)?/g) ?? []).filter(Boolean)
}

export function contentWords(text: string): string[] {
  return tokenize(text).filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

/** Split text into clean sentences (handles abbreviations roughly well). */
export function splitSentences(text: string): string[] {
  const protectedText = text
    .replace(/\b(e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|Prof|Fig|No)\./g, '$1<DOT>')
    .replace(/(\d)\.(\d)/g, '$1<DOT>$2')

  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])|\n+/)
    .map((s) => s.replace(/<DOT>/g, '.').replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0)
}

/** Frequency map of meaningful words — used for keyword ranking. */
export function termFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>()
  for (const w of contentWords(text)) freq.set(w, (freq.get(w) ?? 0) + 1)
  return freq
}

/** Top keywords for the whole document. */
export function topKeywords(text: string, n = 12): string[] {
  return [...termFrequencies(text).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([w]) => w)
}

/** Keyword summary of a single sentence. */
export function keywordsOf(sentence: string, n = 6): string[] {
  return [...termFrequencies(sentence).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([w]) => w)
}

/** True if a sentence is declarative and meaty enough to build cards from. */
function isCardworthy(s: string): boolean {
  if (s.length < 40 || s.length > 320) return false
  const words = s.split(/\s+/)
  if (words.length < 6) return false
  if (/^(this|these|those|it|they|he|she|we|you)\s+(is|are|was|were|has|have|can|will|do|does)\b/i.test(s)) return false
  if (/\b(above|below|previous|following|earlier|later chapter|as mentioned)\b/i.test(s)) return false
  return true
}

export interface GeneratedCard {
  type: 'cloze' | 'qa' | 'definition'
  question: string
  answer: string
  sourceIndex: number
}

/**
 * Generate study cards from sentences.
 *  - definition sentences ("X is ...") -> definition + QA cards
 *  - fact-rich sentences with a key term               -> cloze cards
 */
export function generateCards(text: string): GeneratedCard[] {
  const sentences = splitSentences(text)
  const globalFreq = termFrequencies(text)
  const cards: GeneratedCard[] = []
  const seenQuestions = new Set<string>()

  sentences.forEach((sentence, i) => {
    if (!isCardworthy(sentence)) return
    const kws = keywordsOf(sentence)
    if (kws.length === 0) return

    // --- Definition / QA pattern: "Term is/are/refers to ..." ---
    const defMatch = sentence.match(
      /^(?:The\s+|An?\s+)?([A-Z][\w-]*(?:\s+[\w-]+){0,3})\s+(?:is|are|was|were|refers to|means|describes)\s+(.{15,})$/i,
    )
    if (defMatch) {
      const term = defMatch[1].replace(/^(the|an?)\s+/i, '')
      const tail = defMatch[2].replace(/[.;]$/, '')
      if (term.length > 2 && term.split(/\s+/).length <= 4 && !STOPWORDS.has(term.toLowerCase())) {
        const q = `What ${/s$/i.test(term) ? 'are' : 'is'} ${term}?`
        if (!seenQuestions.has(q.toLowerCase())) {
          seenQuestions.add(q.toLowerCase())
          cards.push({ type: 'definition', question: q, answer: capitalize(tail) + '.', sourceIndex: i })
        }
      }
    }

    // --- Cloze: blank out the most document-salient keyword ---
    const candidates = kws.filter((w) => (globalFreq.get(w) ?? 0) >= 1)
    if (candidates.length === 0) return
    const best = candidates.sort((a, b) => (globalFreq.get(b) ?? 0) - (globalFreq.get(a) ?? 0))[0]
    const re = new RegExp(`\\b${escapeRegex(best)}\\b`, 'i')
    if (!re.test(sentence)) return
    const clozeQuestion = sentence.replace(re, '_____')
    if (!clozeQuestion.includes('_____')) return
    const qKey = clozeQuestion.toLowerCase()
    if (!seenQuestions.has(qKey)) {
      seenQuestions.add(qKey)
      cards.push({ type: 'cloze', question: clozeQuestion, answer: best, sourceIndex: i })
    }
  })

  return cards
}

/** Build a multiple-choice quiz from cards: 4 options, one correct. */
export function buildQuiz(cards: GeneratedCard[], count = 8): QuizItem[] {
  const pool = cards.filter((c) => c.answer.length < 60)
  if (pool.length < 4) return []

  const allAnswers = [...new Set(pool.map((c) => c.answer))]
  const items: QuizItem[] = []
  const used = new Set<number>()

  // Prefer definition cards first (higher value), then cloze
  const ordered = [...pool].sort((a, b) => (a.type === 'definition' ? -1 : 1) - (b.type === 'definition' ? -1 : 1))

  for (const card of ordered) {
    if (items.length >= count) break
    if (used.has(card.sourceIndex)) continue
    used.add(card.sourceIndex)

    const distractors = shuffle(allAnswers.filter((a) => a !== card.answer)).slice(0, 3)
    if (distractors.length < 3) continue

    const options = shuffle([card.answer, ...distractors])
    items.push({
      question: card.type === 'cloze' ? card.question : card.question,
      options,
      correctIndex: options.indexOf(card.answer),
      sourceIndex: card.sourceIndex,
    })
  }
  return items
}

export interface QuizItem {
  question: string
  options: string[]
  correctIndex: number
  sourceIndex: number
}

/** Case-insensitive keyword search over sentences, with snippet context. */
export function keywordSearch(text: string, query: string, max = 8): { sentence: string; index: number; score: number }[] {
  const sentences = splitSentences(text)
  const terms = contentWords(query)
  if (terms.length === 0) return []

  const results: { sentence: string; index: number; score: number }[] = []
  sentences.forEach((sentence, index) => {
    const lower = sentence.toLowerCase()
    let score = 0
    for (const t of terms) {
      const re = new RegExp(`\\b${escapeRegex(t)}\\b`, 'g')
      const hits = (lower.match(re) ?? []).length
      score += hits > 0 ? 1 + Math.min(hits - 1, 2) * 0.5 : 0
    }
    if (score > 0) results.push({ sentence, index, score: score / terms.length })
  })

  return results.sort((a, b) => b.score - a.score).slice(0, max)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
