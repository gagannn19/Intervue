# Intervue — Phase 3 refactor notes

## How to apply this
1. In your `intervue-app` project, back up your current `src` folder (rename it `src-old` or similar).
2. Copy this `src` folder into your project root, replacing the old one.
3. No new dependencies needed — same package.json, same postcss.config.js, same index.css.
   `npm run dev` should just work.

## Folder structure
- `constants/` — static config: theme tokens, interview types, the DSA question bank, mock history, hero/FAQ copy.
- `utils/` — tiny generic helpers (currently just `diffTone`, difficulty → badge color).
- `services/` — business logic with no UI in it:
  - `aiService.js` — the mock AI interviewer (script builder, speech synthesis, feedback scoring). This is the single place to swap in a real LLM later.
  - `interviewService.js` — turning a finished session into a history entry, average score calc.
- `hooks/` — reusable stateful logic:
  - `useFonts`, `useTheme` — small, single-purpose.
  - `useRotatingText` — the hero's fading text cycle.
  - `useInterviewEngine` — the big one. All of the interview room's state (script walkthrough, timer, camera, code editor) used to live inside one component; it's now here, and `InterviewPage` just reads what it returns.
  - `useAppNavigation` — screen state + all the handlers that used to bloat `App.jsx`.
- `components/ui/` — small reusable primitives (Button, Card, Badge, ScoreRing, etc.) used everywhere.
- `components/{landing,dashboard,schedule,interview,history,feedback}/` — page-specific building blocks.
- `components/layout/AppShell.jsx` — the sidebar shell shared by every logged-in page.
- `pages/` — one file per screen, composed almost entirely from the components above.
- `App.jsx` — ~50 lines. Just wires up fonts, theme, navigation, and picks which page to render.

## Architectural decisions worth knowing about
- **No React Router.** Screens are still driven by simple state (`useAppNavigation`), not URLs. Reasoning: the interview/feedback screens depend on in-memory session data that isn't naturally URL-shareable without a bigger state change, and adding a routing dependency risked another install/config issue. If you want real URLs later (e.g. `/dashboard`, `/history`), `useAppNavigation` is the one place to swap — no page component needs to change.
- **InterviewPage stays dark regardless of the site theme.** It's a focus-mode call UI by design, not tied to the light/dark toggle — noted directly in that file.
- **DifficultyDurationSelector combines two small pickers into one file** rather than splitting into two near-empty ones — logical grouping over rigid one-thing-per-file.

## Files intentionally over ~200 lines
- `hooks/useInterviewEngine.js` (~180 lines) — right at the edge; it's the one genuinely complex piece of stateful logic (timer + camera + script engine + code runner all interacting), and splitting it further would mean passing the same handful of refs/state between multiple hooks for no real readability gain.
- Everything else is comfortably under 150 lines.

## Verified
Ran `npm run build` against this exact folder in a clean Vite + Tailwind v4 + lucide-react setup — builds with zero errors. All original functionality (theme toggle, rotating hero text, FAQ accordion, full interview flow, mock AI, feedback scoring, history) is unchanged — only the file organization changed.
