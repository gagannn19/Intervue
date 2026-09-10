import { useEffect, useRef, useState } from "react";
import { useFonts } from "./hooks/useFonts";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./context/AuthContext";
import { useInterviews } from "./hooks/useInterviews";
import { useAppNavigation } from "./hooks/useAppNavigation";
import * as interviewService from "./services/interviewService";
import { mapInterviewRecord } from "./utils/mapInterview";

import { AuthLoadingScreen } from "./components/auth/AuthLoadingScreen";
import { AppShell } from "./components/layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ScheduleWizardPage } from "./pages/ScheduleWizardPage";
import { InterviewPage } from "./pages/InterviewPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HistoryPage } from "./pages/HistoryPage";

// App.jsx only wires things together: global setup (fonts), the
// cross-cutting concerns (theme, auth, interview data, navigation), and
// which page to render. All page content lives in src/pages/*, composed
// from src/components/*.
export default function App() {
  useFonts();
  const { dark, toggleDark } = useTheme();
  const auth = useAuth();
  const interviews = useInterviews(auth.user);
  const nav = useAppNavigation(auth.user, auth.loading);
  const [starting, setStarting] = useState(false);

  // Refresh/reload handling: once we know who's logged in and their
  // interviews have loaded, if one is already in_progress on the backend,
  // drop the user straight back into the room instead of losing it. Only
  // runs once per app load — it won't yank the user back if they
  // deliberately navigate away from an in-progress interview afterward.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!auth.user || interviews.loading || resumedRef.current) return;
    resumedRef.current = true;
    if (interviews.inProgress) {
      nav.joinInterview(interviews.inProgress);
    }
  }, [auth.user, interviews.loading, interviews.inProgress, nav]);

  const handleConfirmSchedule = async (formValues) => {
    await interviewService.scheduleInterview(formValues);
    await interviews.refresh();
    nav.backFromSchedule();
  };

  // "Join now": tell the backend this interview has started (source of
  // truth for status + startedAt), then enter the room with the real
  // record — not just local state.
  const handleStartInterview = async () => {
    if (!interviews.upcoming || starting) return;
    setStarting(true);
    try {
      const started = await interviewService.startInterview(interviews.upcoming.id);
      await interviews.refresh();
      nav.joinInterview(mapInterviewRecord(started));
    } finally {
      setStarting(false);
    }
  };

  // "End Interview" (Phase 3.5): the visible result is now the backend's
  // authoritative final report, aggregated from the real per-question
  // evaluations — no more mock generateFeedback().
  //   1. wait (briefly) for the final in-progress question's evaluation
  //   2. ask the backend to build + persist the final report
  //   3. if that fails hard, still complete the interview so it isn't
  //      stuck IN_PROGRESS
  const handleEndInterview = async (session) => {
    // Give the last question's evaluation a moment to land — but never
    // block the candidate on a slow Gemini call.
    try {
      await Promise.race([
        session.finalizeEvaluation?.() ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    } catch {
      /* evaluation is best-effort — ignore and continue */
    }

    let report = null;
    try {
      report = await interviewService.generateReport(session.config.id);
    } catch {
      try {
        await interviewService.completeInterview(session.config.id);
      } catch {
        /* last resort — the interview stays IN_PROGRESS, user can retry from history later */
      }
    }

    await interviews.refresh();
    nav.endInterview({ config: session.config, report });
  };

  // Re-open a finished interview's report from the History list.
  const handleOpenReport = async (interview) => {
    let report = null;
    try {
      report = await interviewService.getReport(interview.id);
    } catch {
      /* fall through — FeedbackPage handles a null report */
    }
    nav.endInterview({
      config: { type: interview.type, difficulty: interview.difficulty, duration: interview.duration },
      report,
    });
  };

  const handleLogout = () => {
    auth.logout();
    nav.goToLanding();
  };

  if (auth.loading) {
    return <AuthLoadingScreen dark={dark} />;
  }

  if (nav.screen === "landing") {
    return <LandingPage onSchedule={nav.goToSchedule} onLogin={nav.goToLogin} dark={dark} onToggleDark={toggleDark} />;
  }

  if (nav.screen === "login") {
    return <LoginPage onLogin={auth.login} onGoogle={auth.loginWithGoogle} onGoToSignup={nav.goToSignup} onBack={nav.goToLanding} dark={dark} onToggleDark={toggleDark} />;
  }

  if (nav.screen === "signup") {
    return <SignupPage onSignup={auth.signup} onGoogle={auth.loginWithGoogle} onGoToLogin={nav.goToLogin} onBack={nav.goToLanding} dark={dark} onToggleDark={toggleDark} />;
  }

  if (nav.screen === "room" && nav.activeConfig) {
    return <InterviewPage config={nav.activeConfig} onEnd={handleEndInterview} />;
  }

  // Every other screen shares the sidebar shell.
  return (
    <AppShell
      active={nav.screen === "history" || nav.screen === "feedback" ? "history" : "dashboard"}
      onNav={nav.setScreen}
      onLogout={handleLogout}
      dark={dark}
      onToggleDark={toggleDark}
    >
      {nav.screen === "schedule" && (
        <ScheduleWizardPage onBack={nav.backFromSchedule} onConfirm={handleConfirmSchedule} dark={dark} />
      )}
      {nav.screen === "feedback" && nav.lastSession && (
        <FeedbackPage session={nav.lastSession} onBackToDashboard={() => nav.setScreen("dashboard")} onHistory={() => nav.setScreen("history")} />
      )}
      {nav.screen === "history" && (
        <HistoryPage history={interviews.history} onOpen={handleOpenReport} />
      )}
      {nav.screen === "dashboard" && auth.user && (
        <DashboardPage
          user={auth.user}
          history={interviews.history}
          upcoming={interviews.upcoming}
          onSchedule={() => nav.setScreen("schedule")}
          onJoin={handleStartInterview}
          onViewHistory={() => nav.setScreen("history")}
        />
      )}
    </AppShell>
  );
}
