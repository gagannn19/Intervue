import { Sparkles, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { disp, mono } from "../../constants/theme";

export function InterviewHeader({ questionTitle, difficulty, timeLabel }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D5EF8] to-[#4C3FE0] flex items-center justify-center">
          <Sparkles size={13} />
        </div>
        <span className="text-sm font-semibold" style={disp}>{questionTitle}</span>
        <Badge tone="violet">{difficulty}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono bg-white/5 rounded-lg px-3 py-1.5" style={mono}>
        <Clock size={13} /> {timeLabel}
      </div>
    </div>
  );
}
