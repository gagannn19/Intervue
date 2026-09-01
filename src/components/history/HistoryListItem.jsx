import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { ScoreRing } from "../ui/ScoreRing";
import { diffTone } from "../../utils/difficulty";
import { disp } from "../../constants/theme";

// Score is kept in its own column, well clear of the colored difficulty
// badge, so nothing competes with it for attention (this was the specific
// layout bug fixed in Phase 2).
export function HistoryListItem({ interview, onOpen }) {
  return (
    <button onClick={() => onOpen(interview)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-[var(--ink)]/3 transition-colors">
      <ScoreRing score={interview.score} size={48} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[var(--ink)]">{interview.type}</p>
          <Badge tone={diffTone(interview.difficulty)}>{interview.difficulty}</Badge>
        </div>
        <p className="text-xs text-[var(--ink)]/45 mt-1">{interview.date} · {interview.duration} min</p>
      </div>

      <div className="text-right shrink-0 pl-3">
        <p className="text-lg font-bold text-[var(--ink)] leading-none" style={disp}>
          {interview.score}<span className="text-xs font-normal text-[var(--ink)]/40">/100</span>
        </p>
        <div className="mt-1.5"><Badge tone="ink">{interview.status}</Badge></div>
      </div>

      <ChevronRight size={16} className="text-[var(--ink)]/30 shrink-0" />
    </button>
  );
}
