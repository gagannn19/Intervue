import { useState } from "react";
import { MOCK_HISTORY } from "../constants/mockHistory";
import { createHistoryEntry, createInterviewConfig } from "../services/interviewService";

// ---------------------------------------------------------------------------
// useAppNavigation
// Owns which screen is showing plus all the cross-page state (logged-in
// user, upcoming interview, history list, the interview currently in
// progress). This is what used to make App.jsx hundreds of lines long — now
// App.jsx just calls this hook and renders whichever page it points to.
//
// Note: navigation here is plain state, not URL routing (see the refactor
// notes in the project README for why). If the app grows enough to need
// shareable/bookmarkable URLs, this hook is the single place to swap in
// React Router without touching any page component.
// ---------------------------------------------------------------------------
export function useAppNavigation() {
  const [screen, setScreen] = useState("landing"); // landing | dashboard | schedule | room | feedback | history
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [activeConfig, setActiveConfig] = useState(null);
  const [lastSession, setLastSession] = useState(null);

  const mockLogin = () => {
    setUser({ name: "Gagan Sharma", email: "gagan@example.com" });
    setScreen("dashboard");
  };

  const logout = () => setScreen("landing");

  const goToSchedule = () => {
    if (!user) mockLogin();
    setScreen("schedule");
  };

  const backFromSchedule = () => setScreen(user ? "dashboard" : "landing");

  const confirmSchedule = (formValues) => {
    setUpcoming(createInterviewConfig(formValues));
    setScreen("dashboard");
  };

  const joinInterview = () => {
    setActiveConfig(upcoming || { type: "DSA", difficulty: "Medium", duration: 30 });
    setScreen("room");
  };

  const endInterview = (session) => {
    const entry = createHistoryEntry(session);
    setHistory((h) => [entry, ...h]);
    setUpcoming(null);
    setLastSession(session);
    setScreen("feedback");
  };

  return {
    screen,
    setScreen,
    user,
    upcoming,
    history,
    activeConfig,
    lastSession,
    mockLogin,
    logout,
    goToSchedule,
    backFromSchedule,
    confirmSchedule,
    joinInterview,
    endInterview,
  };
}
