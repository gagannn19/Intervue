import { apiRequest, setToken } from "../lib/apiClient";

export async function signup({ name, email, password }) {
  const data = await apiRequest("/auth/signup", { method: "POST", body: { name, email, password } });
  setToken(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
  setToken(data.token);
  return data.user;
}

export function logout() {
  setToken(null);
}

export async function getCurrentUser() {
  return apiRequest("/auth/me", { auth: true });
}
