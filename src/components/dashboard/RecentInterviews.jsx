import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ScoreRing } from "../ui/ScoreRing";
import { diffTone } from "../../utils/difficulty";

export function RecentInterviews({ history, onViewAll }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-[var(--ink)]">Recent interviews</h2>
        <button onClick={onViewAll} className="text-xs font-semibold text-[#4C3FE0]">View all</button>
      </div>
      <Card className="divide-y divide-[var(--ink)]/6">
        {history.length === 0 && (
          <p className="p-6 text-sm text-[var(--ink)]/45">Nothing here yet — your first interview will show up after you finish it.</p>
        )}
        {history.slice(0, 3).map((h) => (
          <div key={h.id} className="p-4 flex items-center gap-4">
            <ScoreRing score={h.score} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[var(--ink)]">{h.type}</p>
                <Badge tone={diffTone(h.difficulty)}>{h.difficulty}</Badge>
              </div>
              <p className="text-xs text-[var(--ink)]/45 mt-0.5">{h.date} · {h.duration} min</p>
            </div>
            <Badge tone="ink">{h.status}</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}
