import { Code2, Brain, Video, BarChart3 } from "lucide-react";
import { Card } from "../ui/Card";

const FEATURES = [
  { icon: Code2, title: "DSA interviews", desc: "Coding, problem-solving, and reasoning under real pressure." },
  { icon: Brain, title: "AI that adapts", desc: "Follow-ups and difficulty shift based on how you're doing." },
  { icon: Video, title: "In-browser calls", desc: "Mic + camera, right from your browser, no install." },
  { icon: BarChart3, title: "Real feedback", desc: "A scorecard across nine dimensions, not just pass/fail." },
];

export function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 pb-6">
      <Card className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ink)]/8 p-6 gap-6 sm:gap-0">
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`px-0 sm:px-6 ${i > 0 ? "pt-6 sm:pt-0" : ""}`}>
            <div className="w-9 h-9 rounded-lg bg-[#6D5EF8]/10 flex items-center justify-center text-[#4C3FE0] mb-3">
              <f.icon size={17} />
            </div>
            <h3 className="font-semibold text-[15px] text-[var(--ink)]">{f.title}</h3>
            <p className="text-[13px] text-[var(--ink)]/55 mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}
