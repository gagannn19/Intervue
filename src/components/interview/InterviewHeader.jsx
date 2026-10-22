import { Sparkles, Clock } from "lucide-react";
import { disp, mono } from "../../constants/theme";

// "Interview · Google · SDE II" for a company-targeted interview; custom /
// older interviews (no company) fall back to the type, e.g. "DSA Interview".
export function InterviewHeader({ timeLabel, company, position, type }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#CC5500] flex items-center justify-center shrink-0">
          <Sparkles size={13} />
        </div>
        <span className="text-sm font-semibold truncate" style={disp}>
          {company ? (
            <>
              Interview <span className="text-white/30">·</span> {company}
              {position && (
                <>
                  {" "}<span className="text-white/30">·</span> <span className="text-white/60">{position}</span>
                </>
              )}
            </>
          ) : (
            `${type || "DSA"} Interview`
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono bg-white/5 rounded-lg px-3 py-1.5" style={mono}>
        <Clock size={13} /> {timeLabel}
      </div>
    </div>
  );
}
