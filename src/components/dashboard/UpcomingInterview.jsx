import { Clock, ChevronRight, Zap } from "lucide-react";
import { Card } from "../ui/Card";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";

export function UpcomingInterview({ upcoming, onSchedule, onJoin }) {
  if (upcoming) {
    return (
      <Card className="p-5 mb-6 flex items-center justify-between flex-wrap gap-4 border-[#6D5EF8]/30">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#6D5EF8]/10 flex items-center justify-center text-[#4C3FE0]"><Clock size={18} /></div>
          <div>
            <p className="font-semibold text-sm text-[var(--ink)]">{upcoming.type} · {upcoming.difficulty}</p>
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
