# Lumina — Devpost Submission

## Tagline
**Lumina** — Paste any text, get instant flashcards, quizzes, and an AI tutor that answers questions from your material. 100% in-browser AI.

---

## Description (for Devpost)

### The Problem
Students spend hours reading passively, then forget 70% of what they studied within 24 hours. Existing study tools require manual card creation, which is tedious and kills momentum.

### The Solution
**Lumina** transforms passive reading into active learning in seconds. Paste any text — lecture notes, a textbook chapter, an article — and Lumina's AI automatically generates:

- **Smart flashcards** with cloze deletions, definitions, and Q&A pairs
- **Adaptive quizzes** with instant feedback and scoring
- **A neural AI tutor** you can ask questions in natural language
- **Concept maps** showing keyword relationships and frequency
- **Progress tracking** with spaced repetition (SM-2) and mastery analytics

### Why It's Special
All AI runs **100% in your browser** using WebAssembly — no API keys, no servers, no data leaves your device. After the first load, everything works offline. This is real AI (sentence embeddings + extractive QA), not a chatbot wrapper.

---

## Features

1. **One-Click Deck Generation** — Paste text → instant flashcards + quiz
2. **3D Flip Flashcards** — Click to reveal, rate your knowledge
3. **SM-2 Spaced Repetition** — Cards come back right before you'd forget
4. **Neural Q&A** — Ask questions, get precise answers with confidence scores and citations
5. **Keyword Cloud** — Visualize your material's key concepts
6. **Ranked Search** — Find relevant sentences by term frequency
7. **Progress Dashboard** — Mastery percentages, streaks, review analytics
8. **Built-in Samples** — Try it instantly with Photosynthesis, Supply & Demand, or Newton's Laws
9. **100% Offline** — No internet needed after first load
10. **Privacy-First** — Everything stays on your device

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Build | Vite 5 |
| AI Engine | Transformers.js 2.17 (all-MiniLM-L6-v2 + roberta-base-squad2) |
| WASM Runtime | ONNX Runtime Web |
| Spaced Repetition | SM-2 Algorithm |
| Persistence | localStorage |

---

## What We're Proud Of

- **Real AI, not wrappers** — Sentence embeddings + extractive QA run entirely in-browser via WASM
- **Privacy by design** — Zero network requests after model load
- **Beautiful UI** — Dark theme, smooth 3D card animations, responsive layout
- **Instant gratification** — Paste text → flashcards in under 2 seconds

---

## Challenges We Faced

1. **WASM initialization** — ONNX Runtime crashes at import time in Vite dev mode; solved with dynamic imports
2. **Model loading UX** — 100MB+ of models need to download; added background preloading with status indicators
3. **NLP quality** — Building a dependency-free sentence splitter and keyword extractor that handles real-world text
4. **Card generation** — Balancing coverage (too few cards) vs noise (too many low-quality cards)

---

## Built For
**SPEED August AI Challenge** — Educational tools that leverage AI/ML to transform learning.

**Team:** Solo project by ro161012
