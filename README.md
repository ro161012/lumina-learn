# ✨ Lumina — Learn Anything, Faster

> **SPEED August AI Challenge** submission · Educational AI tool that transforms any text into flashcards, quizzes, and an AI tutor — 100% in your browser.

![Lumina](https://img.shields.io/badge/Built_with-React+TypeScript+Tailwind-61DAFB?style=flat-square&logo=react&logoColor=white)
![AI](https://img.shields.io/badge/AI-Transformers.js-WASM-orange?style=flat-square&logo=tensorflow)
![Privacy](https://img.shields.io/badge/Privacy-100%25_Local-4CAF50?style=flat-square)

---

## 🎯 What Is Lumina?

Lumina is an AI-powered study tool that turns any text — lecture notes, textbook chapters, articles — into an interactive learning experience. Paste your material and get:

- **Smart Flashcards** — cloze deletions, definition cards, and Q&A cards generated automatically
- **Adaptive Quizzes** — multiple-choice with instant feedback and scoring
- **Neural Search** — ask questions in natural language and get precise answers with citations
- **Concept Explorer** — keyword cloud and ranked search to map your material's structure
- **Progress Tracking** — spaced repetition (SM-2), streaks, mastery percentages, and per-card analytics

---

## 🧠 How It Uses AI/Machine Learning

Lumina's AI is **core to the functionality**, not an afterthought:

| Component | What It Does | Technology |
|-----------|-------------|------------|
| **Semantic Search** | Embeds all sentences into 384-dim vectors; finds the most relevant context for any question | `Xenova/all-MiniLM-L6-v2` (sentence-transformers) |
| **Extractive QA** | Locates the exact answer span within top-ranked sentences | `Xenova/deepset-roberta-base-squad2` (RoBERTa fine-tuned on SQuAD 2.0) |
| **NLP Pipeline** | Sentence splitting, keyword extraction, cloze deletion, MCQ distractor generation | Custom dependency-free NLP engine |
| **Spaced Repetition** | SM-2 scheduler (Anki-style) adapts review intervals based on your performance | Algorithmic ML |

All models run **in-browser via WebAssembly** — no server, no API keys, no data leaves your device. After the first load, everything works **offline**.

---

## 🏗️ Architecture

```
src/
├── lib/
│   ├── ai.ts          # transformers.js wrapper (embeddings + QA)
│   ├── nlp.ts         # NLP engine (cards, quiz, search)
│   ├── scheduler.ts   # SM-2 spaced repetition
│   ├── store.ts       # Data model + localStorage persistence
│   └── samples.ts     # Built-in demo texts
├── components/
│   ├── Sidebar.tsx     # Navigation + deck list
│   ├── StudyView.tsx   # Study mode container
│   ├── Flashcard.tsx   # 3D flip card with SM-2 ratings
│   ├── Quiz.tsx        # Multiple-choice quiz with feedback
│   ├── AskView.tsx     # Neural QA chat interface
│   ├── ConceptsView.tsx # Keyword cloud + search
│   ├── ProgressView.tsx # Mastery stats + analytics
│   └── NewDocView.tsx  # Paste/import document form
├── App.tsx             # Root component + routing
├── main.tsx            # Entry point
└── index.css           # Global styles + animations
```

**Stack:** React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Transformers.js 2.17 · ONNX Runtime Web

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/ro161012/lumina-learn.git
cd lumina-learn

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

---

## 🎬 Demo Flow (for 2-minute video)

1. **Paste text** → Show the "Add study material" form with a sample
2. **Instant deck** → Flashcards appear with cloze deletions and definitions
3. **3D flashcard flip** → Click to reveal, rate yourself (Again/Hard/Good/Easy)
4. **Quiz mode** → Multiple-choice with instant feedback
5. **Ask questions** → Type a question, see neural QA with confidence scores and citations
6. **Concepts tab** → Keyword cloud and ranked search
7. **Progress tab** → Mastery percentages, card maturity, review behavior analytics

---

## 📊 Judging Criteria Alignment

| Criteria | How Lumina Excels |
|----------|------------------|
| **Educational Impact (25 pts)** | Solves the real problem of passive reading → active recall. Flashcards + spaced repetition proven to boost retention by 50-200%. |
| **Creative Use of AI/ML (25 pts)** | Neural embeddings + extractive QA run entirely in-browser via WASM. Real AI, not API wrappers. |
| **Technical Execution (25 pts)** | Clean React/TS architecture, smooth 3D card animations, responsive Tailwind UI, zero external API dependencies. |
| **The Pitch & Demo (25 pts)** | 2-minute video shows the full flow: paste → flashcards → quiz → AI tutor → progress tracking. |

---

## 🔒 Privacy

- **100% client-side** — no data sent to any server
- **AI models cached locally** — after first load, works offline
- **localStorage only** — your study progress stays on your device

---

## 📄 License

MIT © 2026 ro161012

---

## 🙏 Acknowledgments

- [Transformers.js](https://github.com/xenova/transformers.js) — Hugging Face models in the browser
- [Vite](https://vitejs.dev/) — Fast, modern build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [SM-2 Algorithm](https://supermemo.com/) — Spaced repetition scheduling
