import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { StatsCards } from "../components/dashboard/StatsCards";
import { UpcomingInterview } from "../components/dashboard/UpcomingInterview";
import { RecentInterviews } from "../components/dashboard/RecentInterviews";

export function DashboardPage({ user, history, upcoming, loading, onSchedule, onQuickStart, onJoin, onViewHistory }) {
  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <DashboardHeader userName={user.name} onSchedule={onSchedule} />
      <StatsCards history={history} loading={loading} />
      <UpcomingInterview upcoming={upcoming} loading={loading} onQuickStart={onQuickStart} onJoin={onJoin} />
      <RecentInterviews history={history} loading={loading} onViewAll={onViewHistory} />
    </div>
  );
}
