# Intervue Frontend

React + Vite frontend for Intervue, an AI-powered mock interview platform.
This repository is completely independent of the backend — separate
install, separate dev server, separate deploy.

## Tech stack

- **React 19** + **Vite** — UI and build tooling
- **Tailwind CSS v4** — styling (via `@tailwindcss/postcss`)
- **lucide-react** — icons
- Plain `fetch` (via `src/lib/apiClient.js`) — no extra HTTP library

## Folder structure

```
intervue-frontend/
├── public/               → static assets served as-is
├── src/
│   ├── components/        → UI building blocks, grouped by page/feature
│   ├── pages/              → one file per screen (Landing, Dashboard, Schedule, Interview, Feedback, History, Login, Signup)
│   ├── hooks/               → reusable stateful logic (auth, theme, interview data, navigation, the interview engine)
│   ├── services/             → talks to the backend API (authService, interviewService) and the local mock AI (aiService)
│   ├── lib/                   → apiClient.js — the shared fetch wrapper + token storage
│   ├── utils/                  → small helpers (mapInterview, diffTone)
│   ├── constants/                → static data (question bank, interview types, theme tokens)
│   ├── App.jsx                    → wires fonts/theme/auth/navigation together, picks which page renders
│   └── main.jsx                    → React entry point
├── index.html
├── vite.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

## Requirements

- Node.js 18+
- The [intervue-backend](../intervue-backend) running locally (or reachable) — this frontend talks to it for auth and interview data

## Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) — open it
in your browser.

### Configure the backend URL

`.env` needs one variable, pointing at your running backend:
```
VITE_API_URL="http://localhost:4000/api"
```

### Other commands
```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## How this talks to the backend

`src/lib/apiClient.js` is the single place that knows the API base URL and
attaches the auth token (stored in `localStorage`) to requests. Every
service (`authService.js`, `interviewService.js`) calls through it —
components never call `fetch` directly.

## What's real vs. still mocked

- **Real, backend-backed:** signup/login/JWT sessions, scheduling an
  interview, the interview status lifecycle (`scheduled` → `in_progress` →
  `completed`), dashboard/history data, average score.
- **Still mocked (frontend-only):** the interview room's AI conversation
  (scripted follow-ups, not a real LLM), browser speech synthesis for the
  AI's voice, the code editor's "Run" button, and the feedback score
  itself (a local heuristic on the transcript — clearly persisted to the
  backend as a `[Mock result]`, not a real AI evaluation).

## Dark mode, fonts, everything else

No configuration needed — the theme toggle, Google Fonts loading, and all
styling work out of the box once `npm run dev` is running.
