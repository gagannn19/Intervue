import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { StatsCards } from "../components/dashboard/StatsCards";
import { UpcomingInterview } from "../components/dashboard/UpcomingInterview";
import { RecentInterviews } from "../components/dashboard/RecentInterviews";

export function DashboardPage({ user, history, upcoming, onSchedule, onJoin, onViewHistory }) {
  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <DashboardHeader userName={user.name} onSchedule={onSchedule} />
      <StatsCards history={history} />
      <UpcomingInterview upcoming={upcoming} onSchedule={onSchedule} onJoin={onJoin} />
      <RecentInterviews history={history} onViewAll={onViewHistory} />
    </div>
  );
}
