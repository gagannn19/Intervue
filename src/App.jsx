import { useFonts } from "./hooks/useFonts";
import { useTheme } from "./hooks/useTheme";
import { useAppNavigation } from "./hooks/useAppNavigation";

import { AppShell } from "./components/layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SchedulePage } from "./pages/SchedulePage";
import { InterviewPage } from "./pages/InterviewPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HistoryPage } from "./pages/HistoryPage";

// App.jsx only wires things together: global setup (fonts), the two
// cross-cutting concerns (theme, navigation), and which page to render.
// All page content lives in src/pages/*, composed from src/components/*.
export default function App() {
  useFonts();
  const { dark, toggleDark } = useTheme();
  const nav = useAppNavigation();

  if (nav.screen === "landing") {
    return <LandingPage onSchedule={nav.goToSchedule} onLogin={nav.mockLogin} dark={dark} onToggleDark={toggleDark} />;
  }

  if (nav.screen === "room" && nav.activeConfig) {
    return <InterviewPage config={nav.activeConfig} onEnd={nav.endInterview} />;
  }

  // Every other screen shares the sidebar shell.
  return (
    <AppShell active={nav.screen === "history" || nav.screen === "feedback" ? "history" : "dashboard"} onNav={nav.setScreen} onLogout={nav.logout} dark={dark} onToggleDark={toggleDark}>
      {nav.screen === "schedule" && (
        <SchedulePage onBack={nav.backFromSchedule} onConfirm={nav.confirmSchedule} />
      )}
      {nav.screen === "feedback" && nav.lastSession && (
        <FeedbackPage session={nav.lastSession} onBackToDashboard={() => nav.setScreen("dashboard")} onHistory={() => nav.setScreen("history")} />
      )}
      {nav.screen === "history" && (
        <HistoryPage history={nav.history} />
      )}
      {nav.screen === "dashboard" && (
        <DashboardPage
          user={nav.user || { name: "Guest" }}
          history={nav.history}
          upcoming={nav.upcoming}
          onSchedule={() => nav.setScreen("schedule")}
          onJoin={nav.joinInterview}
          onViewHistory={() => nav.setScreen("history")}
        />
      )}
    </AppShell>
  );
}
