import { TrendingUp, Award, Target } from "lucide-react";
import { Card } from "../ui/Card";
import { getAverageScore } from "../../services/interviewService";
import { disp } from "../../constants/theme";
import { Skeleton } from "../ui/Skeleton";

export function StatsCards({ history, loading }) {
  const avg = getAverageScore(history);
  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><TrendingUp size={14} /> Average score</div>
        {loading ? <Skeleton className="h-9 w-16 mt-2" /> : <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>{avg ?? "—"}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><Award size={14} /> Interviews done</div>
        {loading ? <Skeleton className="h-9 w-10 mt-2" /> : <p className="text-3xl font-bold mt-2 text-[var(--ink)]" style={disp}>{history.length}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-2 text-[var(--ink)]/50 text-xs font-medium"><Target size={14} /> Focus area</div>
        {loading ? <Skeleton className="h-6 w-32 mt-3" /> : <p className="text-lg font-semibold mt-2 text-[var(--ink)]">{history.length ? "Time complexity" : "Take your first round"}</p>}
      </Card>
    </div>
  );
}
