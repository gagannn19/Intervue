import { ScoreRing } from "../ui/ScoreRing";
import { Card } from "../ui/Card";

// Phase 3.5 — driven by the backend final report.
export function FeedbackSummary({ report }) {
  const conf = typeof report.evaluationConfidence === "number" ? report.evaluationConfidence : null;
  const { questionsEvaluated = 0, questionsReached = 0, plannedQuestions = 0 } = report.counts || {};

  return (
    <Card className="p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
      <ScoreRing score={report.overallScore} size={110} />
      <div className="flex-1">
        <p className="text-sm text-[var(--ink)]/70 leading-relaxed">{report.summary}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] text-[var(--ink)]/45">
          {plannedQuestions > 0 && (
            <span>
              {questionsEvaluated} of {questionsReached} question{questionsReached === 1 ? "" : "s"} answered
              {report.endedEarly ? ` · ${plannedQuestions} planned` : ""}
            </span>
          )}
          {conf !== null && <span>Evaluation confidence {conf}%</span>}
          {report.generatedBy === "deterministic" && questionsEvaluated > 0 && (
            <span>AI summary unavailable — showing the computed breakdown</span>
          )}
        </div>
      </div>
    </Card>
  );
}
