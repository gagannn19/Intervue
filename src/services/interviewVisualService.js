import { API_URL, getIdToken } from "../lib/apiClient";

// ---------------------------------------------------------------------------
// Server-Sent Events from the backend carrying the AI interviewer's visual
// explanations during a live call (GET /interviews/:id/visuals/stream).
// This is a separate channel from the call audio: the interviewer's voice
// comes through Daily; visuals come only through here.
//
// Read with fetch() instead of EventSource because EventSource can't send
// the Authorization header (and the Firebase token shouldn't go in a URL).
// Reconnects with backoff when the stream ends (the backend's hosting
// closes long requests periodically); every (re)connect starts with a
// snapshot of exactly what's on screen.
//
// Visual lifecycle events, each passed to onEvent({ type, ... }):
//   visual.snapshot { visuals: [...] }  — replace everything with this set
//   visual.create   { visual }          — add one
//   visual.update   { visual }          — replace that one's content
//   visual.remove   { visualId }        — remove that one only
// Returns a stop() function.
// ---------------------------------------------------------------------------

const MAX_BACKOFF_MS = 10_000;

function parseFrame(frame) {
  let event = "message";
  const data = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith(":")) continue; // heartbeat comment
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  }
  if (!data.length) return null;
  try {
    return { event, payload: JSON.parse(data.join("\n")) };
  } catch {
    return null;
  }
}

const EVENT_TYPES = new Set(["visual.snapshot", "visual.create", "visual.update", "visual.remove"]);

export function subscribeToInterviewVisuals(interviewId, onEvent) {
  const controller = new AbortController();
  let stopped = false;
  let attempt = 0;

  (async () => {
    while (!stopped) {
      try {
        const token = await getIdToken();
        const res = await fetch(`${API_URL}/interviews/${interviewId}/visuals/stream`, {
          headers: { Accept: "text/event-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
          signal: controller.signal,
        });
        if (res.status === 403 || res.status === 404) {
          console.warn(`[visual] stream refused (${res.status}); not retrying`);
          return;
        }
        if (!res.ok || !res.body) throw new Error(`visual stream HTTP ${res.status}`);
        attempt = 0;
        console.info("[visual] stream connected");

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += value.replace(/\r\n/g, "\n");
          let end;
          while ((end = buf.indexOf("\n\n")) >= 0) {
            const parsed = parseFrame(buf.slice(0, end));
            buf = buf.slice(end + 2);
            if (parsed && EVENT_TYPES.has(parsed.event)) onEvent({ ...parsed.payload, type: parsed.event });
          }
        }
      } catch (err) {
        if (stopped) return;
        console.warn("[visual] stream error, reconnecting:", err?.message || err);
      }
      if (stopped) return;
      const delay = Math.min(1000 * 2 ** attempt++, MAX_BACKOFF_MS);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  })();

  return () => {
    stopped = true;
    controller.abort();
  };
}
