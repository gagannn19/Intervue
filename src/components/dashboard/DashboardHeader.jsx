import { Calendar } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
import { disp } from "../../constants/theme";

export function DashboardHeader({ userName, onSchedule }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Welcome back, {userName.split(" ")[0]}</h1>
        <p className="text-sm text-[var(--ink)]/50 mt-1">Here's where your practice stands.</p>
      </div>
      <GradientButton onClick={onSchedule}><Calendar size={15} /> Schedule Interview</GradientButton>
    </div>
  );
}
