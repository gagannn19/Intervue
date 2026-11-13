import { apiRequest } from "../lib/apiClient";

// The system design whiteboard (Excalidraw) — see backend
// src/services/whiteboard.service.ts. Returns { elements, version }.
export async function getWhiteboard(interviewId) {
  return apiRequest(`/interviews/${interviewId}/whiteboard`, { auth: true });
}

// Autosave. `version` only ever grows, so the backend can ignore a save
// that arrives after a newer one. Returns { version, stale }.
export async function saveWhiteboard(interviewId, elements, version) {
  return apiRequest(`/interviews/${interviewId}/whiteboard`, {
    method: "PUT",
    auth: true,
    body: { elements, version },
  });
}
