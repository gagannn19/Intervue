import { Sparkles, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { disp, mono } from "../../constants/theme";

export function InterviewHeader({ questionTitle, difficulty, timeLabel, company, position, type }) {
  // Small context indicator for a company-targeted interview, e.g.
  // "Google · L4 · DSA". Hidden entirely for custom / older interviews.
  const context = company ? [company, position, type].filter(Boolean).join(" · ") : null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center shrink-0">
          <Sparkles size={13} />
        </div>
        <span className="text-sm font-semibold truncate" style={disp}>{questionTitle}</span>
        <Badge tone="violet">{difficulty}</Badge>
        {context && (
          <span className="hidden sm:inline text-[11px] text-white/40 whitespace-nowrap">{context}</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm font-mono bg-white/5 rounded-lg px-3 py-1.5" style={mono}>
        <Clock size={13} /> {timeLabel}
      </div>
    </div>
  );
}
