import { apiRequest } from "../lib/apiClient";

// ---------------------------------------------------------------------------
// Real backend calls: scheduling, reading, and the start/complete lifecycle.
// The actual interview room conversation still runs on local mock AI (see
// aiService.js) — only the final score/summary gets persisted here.
// ---------------------------------------------------------------------------

// `company`, `position`, `salaryMin`, `salaryMax` and `type` are optional —
// the old "Custom Settings" form doesn't send them, and the backend stores
// null for those columns in that case. `undefined` values are dropped by
// JSON.stringify, so the request body stays identical to before for the
// custom path.
export async function scheduleInterview({
  difficulty,
  duration,
  date,
  time,
  role,
  instructions,
  type,
  company,
  position,
  salaryMin,
  salaryMax,
}) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return apiRequest("/interviews", {
    method: "POST",
    auth: true,
    body: {
      difficulty,
      duration,
      date,
      time,
      role,
      customInstructions: instructions,
      timezone,
      type,
      company,
      position,
      salaryMin,
      salaryMax,
    },
  });
}

export async function getUpcomingInterviews() {
  return apiRequest("/interviews/upcoming", { auth: true });
}

export async function getHistoryInterviews() {
  return apiRequest("/interviews/history", { auth: true });
}

// Marks the interview in_progress on the backend and records a real
// startedAt — this is the source of truth the timer resumes from if the
// page gets refreshed mid-interview.
export async function startInterview(interviewId) {
  return apiRequest(`/interviews/${interviewId}/start`, { method: "POST", auth: true });
}

// Fallback completion only. Since Phase 3.5 the visible result comes from
// generateReport() below; this is used just to make sure an interview
// isn't left stuck IN_PROGRESS if report generation fails hard. Passing an
// empty body leaves score null and a neutral summary.
export async function completeInterview(interviewId, { score, feedbackSummary } = {}) {
  return apiRequest(`/interviews/${interviewId}/complete`, {
    method: "POST",
    auth: true,
    body: { score, feedbackSummary },
  });
}

// Phase 3.5 — finish the interview and get the authoritative final report.
// The backend aggregates the stored per-question evaluations (Phase 3.3),
// optionally has Gemini rephrase the prose, persists everything on the
// interview row, and marks it COMPLETED. Idempotent.
export async function generateReport(interviewId) {
  return apiRequest(`/interviews/${interviewId}/report`, { method: "POST", auth: true });
}

// Read a previously generated report (e.g. re-opening from History).
export async function getReport(interviewId) {
  return apiRequest(`/interviews/${interviewId}/report`, { auth: true });
}

// ---------------------------------------------------------------------------
// getAverageScore is still local — it just averages whatever `score` values
// are present on the history array, regardless of where that array came
// from (works the same whether scores are real or, for now, mock).
// ---------------------------------------------------------------------------
export function getAverageScore(history) {
  const scored = history.filter((h) => typeof h.score === "number");
  if (!scored.length) return null;
  return Math.round(scored.reduce((sum, h) => sum + h.score, 0) / scored.length);
}
