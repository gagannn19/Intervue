import { apiRequest } from "../lib/apiClient";

// Only emails an admin has allowed (admin "Interview Access" page) can
// start an interview — POST /interviews/:id/start answers 403 with this
// code otherwise. Everyone else can ask for access from the app.
export const INTERVIEW_ACCESS_REQUIRED = "INTERVIEW_ACCESS_REQUIRED";

// { status: "APPROVED" | "PENDING" | "NONE" }
export async function getMyInterviewAccess() {
  return apiRequest("/interview-access/me", { auth: true });
}

// Sends the request to the admins; returns the new { status }.
export async function requestInterviewAccess() {
  return apiRequest("/interview-access/request", { method: "POST", auth: true });
}
