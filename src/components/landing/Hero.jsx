import { ChevronRight, Star } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
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
        <h1 className="text-[46px] sm:text-[58px] leading-[1.08] font-semibold text-[var(--ink)]" style={disp}>
          Your next interview
          <br />
          starts <span className="relative inline-block">
            here.
            <svg viewBox="0 0 120 14" className="absolute left-0 -bottom-1.5 w-full h-3.5 text-[var(--accent)]" preserveAspectRatio="none">
              <path d="M2 9.5c22-6 74-9 116-4.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </h1>

        <RotatingDescription />

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <GradientButton onClick={onSchedule} className="px-6 py-3 text-[15px]">
            Start Practicing <ChevronRight size={16} />
          </GradientButton>
          <a href="#how" className="text-sm font-semibold text-[var(--ink)]/70 hover:text-[var(--ink)] underline underline-offset-4 decoration-[var(--ink)]/25">
            See how it works ↓
          </a>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["var(--accent)", "var(--accent-ink)", "#22C97A", "#F5A623"].map((c, i) => (
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

      {/* Hand-drawn illustration — same "practice, solve, grow" motif as
          the logo/design system, not a literal product screenshot. */}
      <div className="relative">
        <img
          src="/brand/hero-illustration.jpg"
          alt="A line of people walking toward a door labeled 'your next opportunity', wearing backpacks that read practice, solve, grow"
          className="w-full h-auto rounded-3xl select-none"
          draggable={false}
        />
      </div>
    </section>
  );
}
