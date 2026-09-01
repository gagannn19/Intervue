import { Calendar, Video, Code2, BarChart3 } from "lucide-react";
import { Card } from "../ui/Card";
import { disp, mono } from "../../constants/theme";

const STEPS = [
  { n: "01", t: "Schedule", d: "Pick a type, difficulty, and time that suits you.", icon: Calendar },
  { n: "02", t: "Join", d: "Open the interview room from your browser.", icon: Video },
  { n: "03", t: "Solve & discuss", d: "Work the problem while the AI probes your thinking.", icon: Code2 },
  { n: "04", t: "Get feedback", d: "Receive a detailed scorecard and next steps.", icon: BarChart3 },
];

export function HowItWorks() {
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center text-[var(--ink)]" style={disp}>How it works</h2>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s) => (
          <Card key={s.n} className="p-5 relative">
            <span className="text-[11px] font-bold text-[#6D5EF8]/60" style={mono}>{s.n}</span>
            <div className="w-9 h-9 mt-2 rounded-lg bg-[var(--ink)]/5 flex items-center justify-center text-[var(--ink)]/70">
              <s.icon size={16} />
            </div>
            <h3 className="font-semibold text-[15px] mt-3 text-[var(--ink)]">{s.t}</h3>
            <p className="text-[13px] text-[var(--ink)]/55 mt-1 leading-relaxed">{s.d}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
