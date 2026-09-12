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

All `VITE_*` — see `.env.example`. `VITE_API_URL` is intervue-backend's
base URL (default `http://localhost:4000/api`). The rest
(`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`) are Firebase
web config for `src/lib/firebase.js` — these ship in the client bundle by
design (Firebase's web SDK config is not a secret), they're just sourced
from Secret Manager in production for convenience (see Deployment
below). No Daily or cuecast config lives here — the backend hands this
app a room URL + token per interview; it never talks to Daily's REST API
or to cuecast-pipecat-langchain directly.

## Deployment

GCP project `cuecast-507920`, region `asia-south1`. Google Cloud Run via
Cloud Build, triggered on push to `master`:

```
master push → Cloud Build trigger "cuecast-github-cicd-trigger"
            → build (Dockerfile, via cloudbuild.yaml committed in this repo —
              the trigger itself is marked "autodetect" but Cloud Build
              prefers a committed cloudbuild.yaml over Buildpacks when one exists)
            → push image to Artifact Registry
              (asia-south1-docker.pkg.dev/cuecast-507920/intervue-frontend)
            → gcloud run deploy intervue-frontend
              (--region=asia-south1 --allow-unauthenticated --port=8080
               --cpu=1 --memory=512Mi --min-instances=0 --max-instances=3
               --concurrency=80)
```

`dev` is the development branch; `master` is production and is what the
trigger watches (`^master$`). Both branches have GitHub branch protection
(PR + signed commits required); direct pushes need an admin bypass.

The trigger is a classic (1st-gen) Cloud Build GitHub App connection —
same GitHub App installation `cuecast-pipecat-langchain`'s trigger uses.
Runs as service account `cuecast-github-cicd@cuecast-507920.iam.gserviceaccount.com`
(shared with that repo's trigger too).

### Build-time config (not runtime — this is a static bundle)

This app is a Vite static build served by nginx (see Dockerfile) — there
is no running process to inject runtime env vars into, everything must be
baked into the JS bundle *at build time*. All the `VITE_*` values (see
above) live in one Secret Manager secret, `cuecast-intervue-frontend` —
one `.env`-formatted blob, same pattern as `cuecast-pipecat-langchain`'s
secret. `cloudbuild.yaml`'s build step pulls it via `availableSecrets` /
`secretEnv`, `eval`s it into shell vars (`entrypoint: sh`, not `bash` —
`gcr.io/cloud-builders/docker` is Alpine-based and has no bash), then
passes each one as a separate `docker build --build-arg`; the Dockerfile
declares a matching `ARG`/`ENV` pair per var before `COPY . .` /
`npm run build`. The `--build-arg`s only exist in the `build` stage of the
multi-stage Dockerfile, not the final `nginx` runtime stage that actually
gets pushed.

To update a value: add a new version to the `cuecast-intervue-frontend`
secret (Secret Manager versions are immutable, no partial edit) — takes
effect on the *next* build, since it's baked in at build time, not
picked up by already-running containers.
