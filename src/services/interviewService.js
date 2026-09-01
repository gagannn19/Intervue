import { generateFeedback } from "./aiService";

// ---------------------------------------------------------------------------
// INTERVIEW SERVICE
// Business logic around interview records that doesn't belong in a
// component: turning a finished session into a history entry, formatting
// dates, etc. In production this is where real API calls to Supabase would
// live (createInterview, completeInterview, getHistory...) — the pages
// wouldn't need to change, only what's inside these functions.
// ---------------------------------------------------------------------------

// Builds the { type, difficulty, duration, date, time, role } config object
// the rest of the app passes around for a scheduled/active interview.
export function createInterviewConfig({ difficulty, duration, date, time, role }) {
  return { type: "DSA", difficulty, duration, date, time, role };
}

// Turns a finished interview session (transcript + config + question) into
// a history-list entry, scoring it via aiService along the way.
export function createHistoryEntry(session) {
  const feedback = generateFeedback(session);
  return {
    id: `h${Date.now()}`,
    type: session.config.type,
    difficulty: session.config.difficulty,
    duration: session.config.duration,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    score: feedback.overall,
    status: "Completed",
  };
}

export function getAverageScore(history) {
  if (!history.length) return null;
  return Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length);
}
