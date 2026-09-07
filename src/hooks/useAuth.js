import { useCallback, useEffect, useState } from "react";
import { getToken } from "../lib/apiClient";
import * as authService from "../services/authService";

// Tracks the current logged-in user app-wide. On mount, if a token is
// already stored (from a previous session), it verifies it by fetching
// the current user — this is what makes a page refresh not log you out.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => authService.logout()) // stored token is invalid/expired
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (details) => {
    const newUser = await authService.signup(details);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return { user, loading, login, signup, logout };
}
