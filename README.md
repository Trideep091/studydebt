# StudyDebt — Your backlog, under control.

> **Small sessions. Steady progress. Less academic chaos.**

StudyDebt is a creative, premium, liquid-glass-themed study recovery application designed to rescue students from academic chaos. It transforms forgotten piles of educational screenshots, lecture slides, and unstructured to-do lists into manageable, bite-sized study sessions and deadline-aware weekly plans.

---

## 🌟 Key Features

### 1. Liquid Glass Aesthetic
- Deep midnight navy palette (`#080B18`) and frosted glass surfaces with refined background depth.
- `backdrop-filter: blur(20px)` with saturation boosts, translucent glowing borders, and realistic reflective highlights.
- Distraction-free, accessible contrast adhering to WCAG and `prefers-reduced-motion`.

### 2. Backlog Manager & "Your Next Small Win"
- Topic organization with subjects, effort estimates in minutes, priorities (Low, Medium, High, Urgent), and deadlines.
- **Your Next Small Win**: A deterministic recommendation algorithm that factors in urgency, available time slots (5m, 10m, 15m, 25m), and concept mastery to suggest the exact next step without cognitive overload.

### 3. Screenshot Vault & Smart Overview
- Dedicated **My Screenshots** library with drag-and-drop and multi-image uploads (PNG, JPG, WebP).
- **Smart Overview**: Generates structured overviews containing plain-language gists, core concepts, definitions, formulas, key takeaways, and practice check questions.
- Signature Dashboard Panel: **"Have 10 minutes?"** ("Your saved screenshots still have something to teach you") for immediate 10-minute micro-learning.
- Convert any screenshot into an active backlog topic with one click.

### 4. Minimum Viable Study & Adaptive Focus Sessions
- Distraction-free focus view with live countdown timer, pause/resume, and exit controls.
- Micro-learning progression:
  1. **Intuition**: Learning objective & clear explanation (with **"Explain Simpler"** button).
  2. **Example**: Concrete code walkthrough or real-world application.
  3. **Practice**: Interactive mid-session practice question.
  4. **Knowledge Check**: End-of-session evaluation with confidence rating (1–5 stars).
- Session duration logged, backlog updated, and topic automatically scheduled for spaced repetition.

### 5. Weekly Planner & "Rebalance My Week"
- Natural language workload input (e.g. *"I need to finish Java arrays, revise linear algebra, and solve 3 practice problems before Friday"*).
- Deadline presets: **Within 2 days**, **Within 3 days**, **Within 7 days**, or Custom.
- Daily time capacity meters (e.g. 45m / 60m) detecting overloaded days.
- **Rebalance My Week**: Intelligently reschedules pending or missed tasks across remaining days without punishing the student or destroying completed work.

### 6. Revision Queue & Backlog Debt Tracker
- **Revision Queue**: Transparent spaced repetition scheduling (adaptive intervals based on quiz score & confidence).
- **Backlog Debt Tracker**: Displays outstanding study debt hours, backlog reduction velocity, and 7-day session rhythms.
- Zero fake analytics: all numbers are derived strictly from actual saved records.

### 7. Local-First Privacy & Persistence
- Fast client-side persistence via **IndexedDB** (`idb`).
- Full JSON backup export and restore.
- Zero tracking or unconfigured telemetry.

---

## 🏗️ Architecture & Technology Stack

```
studydebt/
├── index.html                 # Entry point in the root directory
├── package.json               # Frontend dependencies & scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript root configuration
├── public/                    # Favicon & static assets
├── src/                       # React 19 + TypeScript frontend application
│   ├── components/
│   │   ├── layout/            # Responsive Shell, Navbar, Sidebar
│   │   ├── brand/             # Custom SVG StudyDebt logo & marks
│   │   ├── ui/                # Liquid Glass cards, buttons, modals, badges
│   │   ├── dashboard/         # Hero, StatsOverview, HaveTenMinutes, NextSmallWin
│   │   ├── backlog/           # TopicCard, TopicModal, BacklogManager
│   │   ├── screenshots/       # ScreenshotVault, ScreenshotDetailModal
│   │   ├── study/             # FocusSessionView, SetupModal, SummaryModal
│   │   ├── planner/           # WeeklyPlannerView, TaskCard, RebalanceModal
│   │   ├── revision/          # RevisionQueueView, Spaced repetition cards
│   │   ├── progress/          # BacklogDebtTracker, Activity rhythm chart
│   │   └── settings/          # AI config, backup export/import, privacy
│   ├── services/
│   │   ├── db/                # IndexedDB repository layer
│   │   ├── ai/                # Frontend AI client & fallback handling
│   │   └── scheduler/         # Deterministic recommendation, SM-2, rebalance
│   └── test/                  # Vitest unit tests
├── backend/                   # Python 3 + FastAPI service
│   ├── app/
│   │   ├── config.py          # Settings & environment variables
│   │   ├── main.py            # FastAPI gateway with CORS
│   │   ├── schemas/ai.py      # Pydantic schemas for structured JSON output
│   │   ├── services/
│   │   │   ├── ai_service.py  # Provider-agnostic inference layer
│   │   │   ├── ocr_service.py # PDF & image processing (pypdf, Pillow)
│   │   │   └── prompt_templates.py # Structured JSON prompts
│   │   └── api/routes/        # AI & OCR endpoints
│   ├── requirements.txt       # Frozen backend dependencies
│   └── tests/                 # Pytest automated test suite
├── docker-compose.yml         # Containerized deployment config
└── README.md
```

---

## 🤖 Open-Weight AI Architecture

StudyDebt uses a provider-independent architecture:
- **Local Development**: Connects to **Ollama** running locally on `http://localhost:11434` with open-weight models such as:
  - `llama3.2` (recommended for fast local CPU/GPU inference)
  - `qwen2.5`
  - `mistral`
- **Hosted / Production**: Connects to any OpenAI-compatible open-weight endpoint (Groq, Together AI, vLLM, HuggingFace TGI) via `OPENAI_COMPATIBLE_BASE_URL` and `OPENAI_COMPATIBLE_MODEL`.
- **Privacy & Transparency**: No third-party model branding or promotional badges in normal student workflows. If the model is offline, the system displays honest diagnostics and uses a local grounded fallback engine so students never lose their workflow.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Frontend Setup (From Root Directory)

```bash
# In the project root:
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### 2. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Start Ollama locally for open-weight inference
# ollama run llama3.2

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be live at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

---

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
# Run from project root:
npm test
```
Runs 6 automated tests verifying the Next Small Win recommendation algorithm, spaced repetition intervals, and weekly planner rebalancing.

### Production Build
```bash
# Run from project root:
npm run build
```

### Backend Tests (pytest)
```bash
cd backend
PYTHONPATH=. venv/bin/pytest tests
```
Runs 7 automated tests verifying API endpoints, prompt serialization, micro-learning generation, and weekly planning.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `AI_PROVIDER` | `ollama` | Provider: `ollama` or `openai_compatible` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | URL of local Ollama server |
| `OLLAMA_MODEL` | `llama3.2` | Open-weight model tag |
| `OPENAI_COMPATIBLE_BASE_URL` | `https://api.together.xyz/v1` | URL for remote open-weight API |
| `OPENAI_COMPATIBLE_API_KEY` | `""` | Optional API key for remote endpoint |
| `OPENAI_COMPATIBLE_MODEL` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | Model identifier for remote inference |
| `AI_TIMEOUT_SECONDS` | `45.0` | Request timeout in seconds |

---

## 🚢 Deployment Architecture

- **Frontend**: Can be deployed to **Vercel**, **Cloudflare Pages**, or **Netlify** with zero extra folder configuration because `index.html` and `package.json` are at the repository root (`npm run build`, output: `dist`).
- **Backend**: Can be deployed to **Render**, **Railway**, **Fly.io**, or **AWS ECS** using the FastAPI ASGI runner.
- **Open-Weight Runtime**: In production, configure `AI_PROVIDER=openai_compatible` with a dedicated open-weight host (such as vLLM on a GPU instance, Groq Llama 3.3, or Together AI).

---

## 📄 License & Attribution

- StudyDebt is open-source under the MIT License.
- Default recommended open-weight models:
  - Meta Llama 3.2 / 3.3: Developed by Meta, licensed under the Llama 3.2 Community License.
  - Mistral 7B: Developed by Mistral AI, licensed under the Apache 2.0 License.
