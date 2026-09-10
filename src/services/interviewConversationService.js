import { apiRequest } from "../lib/apiClient";

// Phase 3.2 — sends one candidate message to the conversational
// interviewer and returns the AI's structured reply:
//   { reply, action, shouldAdvance, currentQuestionId, nextQuestionId,
//     isLastQuestion, assessmentNote }
//
// `currentQuestionId` is "main" for the opening DSA problem, otherwise a
// generated question's id. `history` is a trimmed transcript — an array
// of { role: "interviewer" | "candidate", text } — the backend caps it
// again on its side.
export async function sendConversationTurn(interviewId, { currentQuestionId, message, history }) {
  return apiRequest(`/interviews/${interviewId}/conversation`, {
    method: "POST",
    auth: true,
    body: { currentQuestionId, message, history },
  });
}
