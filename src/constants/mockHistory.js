// Seed data so the dashboard/history pages aren't empty on first load.
// Real interviews completed in the app get prepended to this via
// interviewService.createHistoryEntry().
export const MOCK_HISTORY = [
  { id: "h1", type: "DSA", difficulty: "Medium", duration: 30, date: "Aug 24, 2026", score: 78, status: "Completed" },
  { id: "h2", type: "DSA", difficulty: "Easy", duration: 15, date: "Aug 18, 2026", score: 91, status: "Completed" },
  { id: "h3", type: "DSA", difficulty: "Hard", duration: 45, date: "Aug 10, 2026", score: 54, status: "Completed" },
];
