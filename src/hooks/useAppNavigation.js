import { useEffect, useState } from "react";

const PROTECTED_SCREENS = ["dashboard", "schedule", "room", "feedback", "history"];
// Screens meant for signed-out visitors only — an authenticated user
// landing on any of these (e.g. after a refresh) gets sent to the
// dashboard instead.
const LOGGED_OUT_ONLY_SCREENS = ["landing", "login", "signup"];

// ---------------------------------------------------------------------------
// useAppNavigation
// Owns which screen is showing, plus the interview currently in progress
// (activeConfig) and the last finished mock session (lastSession). Auth
// state and interview data live in their own hooks (useAuth, useInterviews)
// — this hook just reacts to `user`/`authLoading` to decide whether the
// current screen is even allowed, and exposes navigation actions.
//
// Note: navigation is plain state, not URL routing. If the app grows
// enough to need shareable URLs, this is the one place to swap in React
// Router — no page component would need to change.
// ---------------------------------------------------------------------------
export function useAppNavigation(user, authLoading) {
  const [screen, setScreen] = useState("landing");
  const [activeConfig, setActiveConfig] = useState(null);
  const [lastSession, setLastSession] = useState(null);

  // Route protection, both directions.
  useEffect(() => {
    if (authLoading) return;
    if (!user && PROTECTED_SCREENS.includes(screen)) setScreen("login");
    if (user && LOGGED_OUT_ONLY_SCREENS.includes(screen)) setScreen("dashboard");
  }, [user, authLoading, screen]);

  const goToLanding = () => setScreen("landing");
  const goToLogin = () => setScreen("login");
  const goToSignup = () => setScreen("signup");
  const goToSchedule = () => setScreen(user ? "schedule" : "login");
  const backFromSchedule = () => setScreen("dashboard");

  // Used both for a fresh "Join now" (after the backend /start call) and
  // for resuming an already-in_progress interview after a page refresh.
  // `interview` is always a mapInterviewRecord() result, so it carries the
  // company/position targeting fields (null for custom / older interviews).
  // This config is display context only — the AI's targeting context is
  // rebuilt server-side from the DB row when questions are generated.
  const joinInterview = (interview) => {
    if (!interview) return;
    setActiveConfig({
      id: interview.id,
      type: interview.type || "DSA",
      difficulty: interview.difficulty,
      duration: interview.duration,
      role: interview.role,
      company: interview.company || null,
      position: interview.position || null,
      startedAt: interview.startedAt,
    });
    setScreen("room");
  };

  const endInterview = (session) => {
    setLastSession(session);
    setScreen("feedback");
  };

  return {
    screen,
    setScreen,
    activeConfig,
    lastSession,
    goToLanding,
    goToLogin,
    goToSignup,
    goToSchedule,
    backFromSchedule,
    joinInterview,
    endInterview,
  };
}
