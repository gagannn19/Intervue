import { useCallback, useState } from "react";
import { getMyInterviewAccess, requestInterviewAccess } from "../services/interviewAccessService";

// State for the "permission needed" modal shown when the backend refuses
// to start an interview (INTERVIEW_ACCESS_REQUIRED). `status` is null while
// the modal is closed, otherwise "NONE" | "PENDING".
export function useInterviewAccess() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Open the modal in the right state — "NONE" if the lookup itself fails,
  // since offering a (idempotent) request is always safe.
  const prompt = useCallback(async () => {
    setError(null);
    try {
      const access = await getMyInterviewAccess();
      setStatus(access.status === "PENDING" ? "PENDING" : "NONE");
    } catch {
      setStatus("NONE");
    }
  }, []);

  const request = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const access = await requestInterviewAccess();
      setStatus(access.status === "APPROVED" ? null : "PENDING");
    } catch (err) {
      setError(err.message || "Couldn't send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  // Wraps a retry of the original action (re-joining) so the button shows
  // progress; the action re-opens the modal itself if access is still missing.
  const retry = useCallback(async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  const close = useCallback(() => {
    setStatus(null);
    setError(null);
  }, []);

  return { status, busy, error, prompt, request, retry, close, setError };
}
