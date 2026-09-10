import { apiRequest } from "../lib/apiClient";

// Phase 3.3 — asks the backend to evaluate the candidate's performance on
// ONE finished question and store it. This is INTERNAL data: the room
// fires this in the background when a question completes (or at End
// Interview for the last one) and does not use the response. It must
// never block or affect the interview, so callers should `.catch()` and
// carry on.
//
// `questionRef` is "main" for the opening problem, otherwise a generated
// question's id. `transcript` is the slice of the conversation for that
// one question — [{ role: "interviewer" | "candidate", text }].
export async function evaluateQuestion(interviewId, { questionRef, questionTitle, transcript, assessmentNotes }) {
  return apiRequest(`/interviews/${interviewId}/evaluations`, {
    method: "POST",
    auth: true,
    body: { questionRef, questionTitle, transcript, assessmentNotes },
  });
}
