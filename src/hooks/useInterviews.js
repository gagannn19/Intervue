import { useCallback, useEffect, useState } from "react";
import { getUpcomingInterviews, getHistoryInterviews } from "../services/interviewService";
import { mapInterviewRecord } from "../utils/mapInterview";

// Loads the current user's interviews from the backend, split into three
// buckets:
//   - upcoming: the nearest interview still purely "scheduled"
//   - inProgress: an interview already started (used to auto-resume the
//     room after a refresh — see App.jsx)
//   - history: completed/cancelled interviews, for the History page and
//     the dashboard's average score
// Exposes refresh() so pages can re-fetch after scheduling/starting/
// completing one.
export function useInterviews(user) {
  const [upcoming, setUpcoming] = useState(null);
  const [inProgress, setInProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(null);
  // Whose interviews are in state (uid), once a load has finished.
  const [loadedFor, setLoadedFor] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setUpcoming(null);
      setInProgress(null);
      setHistory([]);
      setLoading(false);
      setLoadedFor(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [upcomingRaw, historyRaw] = await Promise.all([
        getUpcomingInterviews(),
        getHistoryInterviews(),
      ]);

      const active = upcomingRaw.find((r) => r.status === "IN_PROGRESS") || null;
      const scheduledOnly = upcomingRaw
        .filter((r) => r.status === "SCHEDULED")
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

      setInProgress(active ? mapInterviewRecord(active) : null);
      setUpcoming(scheduledOnly[0] ? mapInterviewRecord(scheduledOnly[0]) : null);
      setHistory(historyRaw.map(mapInterviewRecord));
    } catch (err) {
      setError(err.message || "Couldn't load your interviews.");
    } finally {
      setLoading(false);
      setLoadedFor(user.uid);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Also loading while the data isn't this user's yet — e.g. the render
  // right after login, before the effect above has even started the
  // fetch. Otherwise the dashboard shows "no interviews" for a moment and
  // App's resume-after-refresh check decides nothing is in progress.
  const loadingForUser = loading || (!!user && loadedFor !== user.uid);

  return { upcoming, inProgress, history, loading: loadingForUser, error, refresh };
}
