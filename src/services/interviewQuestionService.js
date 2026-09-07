import { apiRequest } from "../lib/apiClient";

// Fetches whatever questions already exist for this interview (empty
// array if none have been generated yet).
export async function getQuestions(interviewId) {
  return apiRequest(`/interviews/${interviewId}/questions`, { auth: true });
}

// Idempotent on the backend — safe to call even if questions already
// exist (just returns them, doesn't regenerate/re-bill).
export async function generateQuestions(interviewId) {
  return apiRequest(`/interviews/${interviewId}/questions/generate`, { method: "POST", auth: true });
}
