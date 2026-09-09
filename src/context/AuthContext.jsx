import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";

const NOT_CONFIGURED_MSG =
  "Firebase isn't configured yet. Add your VITE_FIREBASE_* values to .env and restart the dev server.";

// ---------------------------------------------------------------------------
// AuthContext
//
// Firebase Auth is the single source of truth for authentication:
// email/password signup + login, Google sign-in, logout, and session
// persistence across refreshes. There is no backend login — the backend
// just verifies the Firebase ID token that apiClient attaches to each
// request (any provider produces the same kind of token).
//
// The rest of the app reads `auth.user` / `auth.loading` and calls
// `auth.login/signup/loginWithGoogle/logout` (see App.jsx); it doesn't
// know or care that Firebase is behind it.
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();

// Firebase user -> the shape the app consumes (DashboardHeader reads
// user.name, useInterviews just needs a truthy user, etc.).
function toAppUser(firebaseUser) {
  if (!firebaseUser) return null;
  const email = firebaseUser.email || "";
  return {
    uid: firebaseUser.uid,
    email,
    name: firebaseUser.displayName || email.split("@")[0] || "there",
    emailVerified: firebaseUser.emailVerified,
  };
}

// Turn Firebase's error codes into the plain sentences LoginPage/SignupPage
// already render via `err.message`.
function friendlyAuthError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with that email already exists. Try logging in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Password is too weak — use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error reaching Firebase. Check your connection.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "You already have an account with this email using a different sign-in method.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this project yet. Enable it in the Firebase console.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for Google sign-in. Add it in Firebase console → Authentication → Settings.";
    default:
      return err?.message?.replace(/^Firebase:\s*/, "") || "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fires once on load with the persisted user (or null), then on every
  // sign-in / sign-out. This is what keeps the user logged in after a
  // refresh.
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // No Firebase config — app still runs, just permanently signed out.
      setLoading(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(toAppUser(firebaseUser));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      const appUser = toAppUser(cred.user);
      setUser(appUser); // reflect displayName immediately
      return appUser;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const appUser = toAppUser(cred.user);
      setUser(appUser);
      return appUser;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const appUser = toAppUser(cred.user);
      setUser(appUser);
      return appUser;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOut(auth); // onAuthStateChanged will set user -> null
    } else {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, loginWithGoogle, logout }),
    [user, loading, login, signup, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
