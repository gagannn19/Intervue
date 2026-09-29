import { Clock, ChevronRight, Zap } from "lucide-react";
import { Card } from "../ui/Card";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";
import { Skeleton } from "../ui/Skeleton";

export function UpcomingInterview({ upcoming, loading, onSchedule, onJoin }) {
  if (loading) {
    return (
      <Card className="p-5 mb-6 flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    );
  }

  if (upcoming) {
    return (
      <Card className="p-5 mb-6 flex items-center justify-between flex-wrap gap-4 border-[#FF7A00]/30">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#CC5500]"><Clock size={18} /></div>
          <div>
            <p className="font-semibold text-sm text-[var(--ink)]">
              {upcoming.type} · {upcoming.difficulty}
              {upcoming.company && <span className="text-[var(--ink)]/50"> · {upcoming.company}{upcoming.position ? ` (${upcoming.position})` : ""}</span>}
            </p>
            <p className="text-xs text-[var(--ink)]/50 mt-0.5">{upcoming.date} at {upcoming.time} · {upcoming.duration} min</p>
          </div>
        </div>
        <GradientButton onClick={onJoin}>Join now <ChevronRight size={14} /></GradientButton>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
      <div>
        <p className="font-semibold text-sm text-[var(--ink)]">No upcoming interview</p>
        <p className="text-xs text-[var(--ink)]/50 mt-1">Schedule one, or jump straight into a quick-start round.</p>
      </div>
      <GhostButton onClick={onSchedule}>Quick start <Zap size={14} /></GhostButton>
    </Card>
  );
}
