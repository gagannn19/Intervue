// A small fetch wrapper shared by every service that talks to the
// backend. Handles the base URL, JSON parsing, attaching the Firebase ID
// token, and turning a failed response into a thrown Error with a useful
// message.

import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// The backend authenticates requests by verifying the current user's
// Firebase ID token. getIdToken() returns a cached token and refreshes it
// automatically when it's close to expiring.
async function getIdToken() {
  const user = auth?.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export async function apiRequest(path, { method = "GET", body, auth: needsAuth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (needsAuth) {
    const token = await getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch itself throws (TypeError) when the server can't be reached at
    // all — a network/CORS/DNS failure, not an API error response.
    throw new Error("Couldn't reach the server. Is the backend running?");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${res.status})`);
  }

  return payload.data;
}
