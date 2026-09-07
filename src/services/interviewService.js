import { apiRequest } from "../lib/apiClient";

// ---------------------------------------------------------------------------
// Real backend calls: scheduling, reading, and the start/complete lifecycle.
// The actual interview room conversation still runs on local mock AI (see
// aiService.js) — only the final score/summary gets persisted here.
// ---------------------------------------------------------------------------

export async function scheduleInterview({ difficulty, duration, date, time, role, instructions }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return apiRequest("/interviews", {
    method: "POST",
    auth: true,
    body: { difficulty, duration, date, time, role, customInstructions: instructions, timezone },
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

// Persists the result. score/feedbackSummary come from the frontend's local
// mock heuristic (see aiService.generateFeedback) — the backend clearly
// tags it as a mock result, since there's no real AI evaluator yet.
export async function completeInterview(interviewId, { score, feedbackSummary }) {
  return apiRequest(`/interviews/${interviewId}/complete`, {
    method: "POST",
    auth: true,
    body: { score, feedbackSummary },
  });
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
