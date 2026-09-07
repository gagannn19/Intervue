import { Card } from "../ui/Card";

export function FeedbackScorecard({ categories }) {
  return (
    <Card className="p-5 mb-6">
      <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Scorecard by category</h3>
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="text-xs text-[var(--ink)]/60 w-44 shrink-0">{c.label}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--ink)]/8 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF8] to-[#4C3FE0]" style={{ width: `${c.score}%` }} />
            </div>
            <span className="text-xs font-semibold text-[var(--ink)] w-8 text-right">{c.score}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
