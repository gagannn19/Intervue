// A small fetch wrapper shared by every service that talks to the
// backend. Handles the base URL, JSON parsing, attaching the auth token,
// and turning a failed response into a thrown Error with a useful message.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "intervue_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
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
