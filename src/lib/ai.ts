/**
 * transformers.js AI layer — real neural networks, 100% in-browser via WASM.
 *  - all-MiniLM-L6-v2: 384-dim sentence embeddings for semantic retrieval
 *  - deepset/roberta-base-squad2: extractive QA (finds the exact answer span)
 *
 * Models download once from the Hugging Face CDN, then are cached by the
 * browser — after that, everything works offline.
 *
 * We use dynamic import() so onnxruntime-web's WASM backend initializes
 * inside the browser context rather than at module-load time (Vite dev fix).
 */

// Structural types we consume from the QA pipeline output
interface QAOutput {
  answer: string
  score: number
}
type QAPipeline = (
  question: string,
  context: string,
) => Promise<QAOutput | QAOutput[]>

type FeatureExtractor = {
  (text: string, options?: Record<string, unknown>): Promise<{
    data: Float32Array
  }>
}

let _mod: {
  env: { backends: { onnx: { wasm: { wasmPaths: string } } } }
  pipeline: (...args: any[]) => Promise<any>
} | null = null

async function ensureMod() {
  if (!_mod) {
    const mod = await import('@xenova/transformers')
    mod.env.backends.onnx.wasm.wasmPaths =
      'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/'
    _mod = mod as any
  }
  return _mod
}

let embedderPromise: Promise<FeatureExtractor> | null = null
let qaPromise: Promise<QAPipeline> | null = null

export type ProgressFn = (progress: { status: string; file?: string; progress?: number }) => void

/** Lazily load the embedding model (all-MiniLM-L6-v2, ~23MB). */
export function getEmbedder(onProgress?: ProgressFn): Promise<FeatureExtractor> {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const mod = (await ensureMod())!
      const pipe = await mod.pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { quantized: true, progress_callback: onProgress },
      )
      return pipe as unknown as FeatureExtractor
    })()
  }
  return embedderPromise
}

/** Lazily load the QA model (roberta-base-squad2, ~80MB quantized). */
export function getQA(onProgress?: ProgressFn): Promise<QAPipeline> {
  if (!qaPromise) {
    qaPromise = (async () => {
      const mod = (await ensureMod())!
      const pipe = await mod.pipeline(
        'question-answering',
        'Xenova/deepset-roberta-base-squad2',
        { quantized: true, progress_callback: onProgress },
      )
      return pipe as unknown as QAPipeline
    })()
  }
  return qaPromise
}

/** Mean-pooled, L2-normalized embedding for one text. */
export async function embed(text: string, extractor: FeatureExtractor): Promise<number[]> {
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

/** Embed a batch of texts. */
export async function embedBatch(texts: string[], extractor: FeatureExtractor): Promise<number[][]> {
  const out: number[][] = []
  for (const t of texts) out.push(await embed(t, extractor))
  return out
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot // vectors are pre-normalized
}

export interface AnswerResult {
  answer: string
  score: number
  sentenceIndex: number
}

/**
 * Ask a question against the document: embed all sentences, pick the most
 * semantically similar context, then run extractive QA to find the span.
 */
export async function ask(
  question: string,
  sentences: string[],
  sentenceEmbeddings: number[][],
  extractor: FeatureExtractor,
  qa: QAPipeline,
): Promise<AnswerResult | null> {
  if (sentences.length === 0) return null
  const qEmb = await embed(question, extractor)

  // Rank sentences by semantic similarity to the question
  const ranked = sentences
    .map((s, i) => ({ i, s, score: cosineSimilarity(qEmb, sentenceEmbeddings[i]) }))
    .sort((a, b) => b.score - a.score)

  // Top 4 sentences as QA context (keeps inference fast and focused)
  const context = ranked.slice(0, 4).map((r) => r.s).join(' ')

  const output = await qa(question, context)
  const best = Array.isArray(output) ? output[0] : output
  if (!best || best.score < 0.05) return null

  // Map the answer back to the sentence containing it
  const answerText = best.answer.trim().toLowerCase()
  let sentenceIndex = ranked[0].i
  if (answerText.length > 0) {
    for (const r of ranked.slice(0, 4)) {
      if (r.s.toLowerCase().includes(answerText)) {
        sentenceIndex = r.i
        break
      }
    }
  }

  return { answer: best.answer.trim(), score: best.score, sentenceIndex }
}

/** Warm up both models in the background (call once on app load). */
export function preloadModels(onProgress?: ProgressFn): void {
  getEmbedder(onProgress).catch(() => {})
  getQA(onProgress).catch(() => {})
}
