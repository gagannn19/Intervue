# intervue-frontend — architecture notes for Claude

> **Keep this file current.** Whenever a change here is architectural —
> a new external integration, a new data flow, a new page/subsystem, or a
> removed/replaced one — update the relevant section below in the SAME
> session as the change, not as a follow-up. This file is what a future
> session (with no memory of this one) reads first to understand how the
> system actually works. Treat a stale line here as worse than a missing
> one.

## What this is

React (Vite) + Tailwind frontend for Intervue, an AI mock-interview
platform. Firebase Auth for login; all app data comes from `intervue-backend`'s
REST API. One of three repos:

| Repo | Role |
|---|---|
| `intervue-backend` | REST API, DB, owns interview state, runs the voice orchestrator |
| `intervue-frontend` (this repo) | This app |
| `cuecast-pipecat-langchain` | Separate service: Daily WebRTC join, STT/TTS, LLM calls |

## Directory structure

```
src/
  pages/        route-level screens (InterviewPage, etc.)
  components/   organized by feature area (interview/, dashboard/, schedule/, ...)
  hooks/        stateful logic pulled out of pages (useInterviewEngine, useInterviews, ...)
  services/     one file per backend resource — thin wrappers around apiClient.apiRequest
  lib/          apiClient (fetch + Firebase token attach), firebase init
  context/      AuthContext
  constants/    static data (question bank, starter code, theme tokens)
```

Pattern: a page is presentational; a hook owns the state and side effects;
a service is a thin fetch wrapper. Keep new features in that shape.

## The interview room is a real-time voice call

`InterviewPage.jsx` + `useInterviewEngine.js` are NOT a chat UI — the
candidate joins a **Daily.co WebRTC room** directly from the browser
(`@daily-co/daily-js`, headless call object — no Daily iframe UI). The AI
interviewer is a separate bot (cuecast-pipecat-langchain, a pipecat
process) already in that room. This frontend never talks to the AI
interviewer directly and never sees individual conversation turns — audio
in, audio out, that's it.

Flow:
1. `useInterviewEngine` ensures this interview's AI questions exist (`getQuestions`/`generateQuestions`, unchanged from before), then calls `startInterview(id)` (`interviewService.js`), which now returns `{ ...interview, dailyRoomUrl, dailyToken }`.
2. Creates a Daily call object (`Daily.createCallObject()`) and joins `{ url: dailyRoomUrl, token: dailyToken }`.
3. Local mic/cam mute maps to `call.setLocalAudio()` / `call.setLocalVideo()`. The local video track is attached to `UserVideoPanel`'s `<video>` via a ref set on Daily's `track-started` event (see the comment in `useInterviewEngine.js` about why it has to be re-attached on every camera toggle — the `<video>` element unmounts/remounts).
4. **The bot's voice — this is not automatic.** `Daily.createCallObject()` (headless call object, no iframe UI) does NOT auto-create/play an `<audio>` element for remote participants the way Daily's iframe mode does — confirmed empirically (a `track-started` event fires with a live remote audio track, but `document.querySelectorAll('audio')` is empty until you do it yourself). `useInterviewEngine.js`'s `track-started` handler creates one manually (`audioEl.srcObject = new MediaStream([ev.track])`, `.play()`). If this is ever missing, symptom is: pipecat logs show the bot is talking (`Bot started speaking`, real TTS usage), the candidate hears nothing, and there is no error anywhere. `.play()` can also be blocked by autoplay policy — caught via `audioBlocked` state, surfaced as a "Tap to enable sound" button in `CallPanel.jsx` (`unblockAudio()`), since a real click always satisfies autoplay policy.
5. "AI speaking" indicator is a heuristic off Daily's `active-speaker-change` event (active speaker ≠ local participant).
6. Ending the call: `call.leave()`, then the existing report flow (`App.jsx`'s `handleEndInterview` → `generateReport`) runs unchanged — the backend now finalizes any trailing evaluation server-side (see `intervue-backend`'s CLAUDE.md), so `finalizeEvaluation` here is a no-op.

**Known limitation (first pass, intentional for now):** no live captions —
the coding panel always shows the interview's main problem rather than
tracking which question the server-side conversation has actually
advanced to, since there's currently no backend→frontend channel during
the call to signal that. Revisit if live captions are ever added.

**Removed as part of this change** (fully superseded, not kept for
backwards compat): `Transcript.jsx`, `AnswerInput.jsx`,
`interviewConversationService.js` (typed-chat REST turn flow), and
`aiService.js` (browser `speechSynthesis` mock TTS — real TTS is
ElevenLabs, via the pipecat bot, now).

## Environment variables

`VITE_API_URL` — intervue-backend's base URL (default `http://localhost:4000/api`). No Daily or cuecast config lives here — the backend hands this app a room URL + token per interview; it never talks to Daily's REST API or to cuecast-pipecat-langchain directly.
