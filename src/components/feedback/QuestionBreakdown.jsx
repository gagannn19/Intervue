import { Card } from "../ui/Card";

// Phase 3.5 — per-question performance from the final report. Each row is
// one question the candidate reached: its outcome + score, or "not
// answered" for a question that was reached but never attempted.
const OUTCOME_LABEL = {
  correct: "Correct",
  partially_correct: "Partially correct",
  incorrect: "Incorrect",
  clarification_only: "Only asked for clarification",
  needed_hints: "Needed hints",
  self_corrected: "Self-corrected",
  reached_with_guidance: "Reached with guidance",
  unanswered: "Not answered",
};

function scoreColor(s) {
  if (s === null || s === undefined) return "text-[var(--ink)]/35";
  if (s >= 75) return "text-[#1FAE6C]";
  if (s >= 50) return "text-[#D98D0E]";
  return "text-[#E24468]";
}

export function QuestionBreakdown({ questions }) {
  return (
    <Card className="p-5 mb-6">
      <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Per-question performance</h3>
      <div className="divide-y divide-[var(--ink)]/8">
        {questions.map((q, i) => (
          <div key={q.questionRef || i} className="flex items-center gap-3 py-2.5">
            <span className="text-xs text-[var(--ink)]/40 w-5 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--ink)] truncate">{q.title}</p>
              <p className="text-[11px] text-[var(--ink)]/45">
                {OUTCOME_LABEL[q.outcome] || (q.evaluated ? "Evaluated" : "Not answered")}
              </p>
            </div>
            <span className={`text-sm font-bold shrink-0 ${scoreColor(q.overallScore)}`}>
              {q.evaluated && typeof q.overallScore === "number" ? q.overallScore : "—"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
