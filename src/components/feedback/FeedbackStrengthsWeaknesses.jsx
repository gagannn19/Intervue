import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../ui/Card";

export function FeedbackStrengthsWeaknesses({ strengths, weaknesses }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-6">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-3">
          <CheckCircle2 size={15} className="text-[#22C97A]" /> Strengths
        </h3>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-[13px] text-[var(--ink)]/65 leading-relaxed flex gap-2">
              <span className="text-[#22C97A] mt-0.5">·</span>{s}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-3">
          <XCircle size={15} className="text-[#FF5C7A]" /> Areas to improve
        </h3>
        <ul className="space-y-2">
          {weaknesses.map((s, i) => (
            <li key={i} className="text-[13px] text-[var(--ink)]/65 leading-relaxed flex gap-2">
              <span className="text-[#FF5C7A] mt-0.5">·</span>{s}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
