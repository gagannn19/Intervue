import { ChevronRight, Play, Sparkles, Star } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { PulseAvatar } from "../ui/PulseAvatar";
import { useRotatingText } from "../../hooks/useRotatingText";
import { HERO_VARIANTS } from "../../constants/heroContent";
import { disp } from "../../constants/theme";

// Rotating description: fades between variants, pauses on hover, respects
// prefers-reduced-motion, and reserves a fixed height so nothing jumps.
function RotatingDescription() {
  const { text, fading, onMouseEnter, onMouseLeave } = useRotatingText(HERO_VARIANTS);
  return (
    <div className="mt-5 min-h-[100px] sm:min-h-[76px] max-w-md" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <p className={`text-[17px] leading-relaxed text-[var(--ink)]/62 transition-all duration-300 ease-out ${fading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
        {text}
      </p>
    </div>
  );
}

export function Hero({ onSchedule }) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <Badge><Sparkles size={12} /> AI-POWERED INTERVIEWS</Badge>

        <h1 className="mt-6 text-[44px] sm:text-[54px] leading-[1.05] font-bold text-[var(--ink)]" style={disp}>
          Practice. Prepare.
          <span className="block bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0] bg-clip-text text-transparent">
            Ace your next interview.
          </span>
        </h1>

        <RotatingDescription />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <GradientButton onClick={onSchedule} className="px-6 py-3 text-[15px]">
            Schedule DSA Interview <ChevronRight size={16} />
          </GradientButton>
          <GhostButton className="px-6 py-3 text-[15px]"><Play size={15} /> Watch demo</GhostButton>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#6D5EF8", "#4C3FE0", "#22C97A", "#F5A623"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface)]" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-1 text-[13px] text-[var(--ink)]/60">
            <div className="flex text-[#F5A623]">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
            </div>
            <span className="ml-1 font-medium text-[var(--ink)]/70">Built by a solo dev, tested every day</span>
          </div>
        </div>
      </div>

      {/* Hero visual — same pulse-ring language as the real interview room.
          Kept intentionally dark in both themes: it's a video-call preview. */}
      <Card className="p-4 sm:p-5">
        <div className="rounded-xl bg-[#12122B] aspect-[4/3] relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] text-white/70 bg-white/10 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C97A]" /> Interviewer live
          </div>
          <PulseAvatar size={92} speaking label />
          <p className="mt-5 text-white/50 text-[11px] tracking-wide font-medium">AI INTERVIEWER</p>
          <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-white/90 text-[13px]">
            "Before you write code — walk me through your approach first."
          </div>
          <div className="absolute top-3 right-3 w-16 h-20 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/60 text-[10px]">
            You
          </div>
        </div>
      </Card>
    </section>
  );
}
