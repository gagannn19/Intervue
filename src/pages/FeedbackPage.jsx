import { ChevronRight } from "lucide-react";
import { GhostButton } from "../components/ui/GhostButton";
import { GradientButton } from "../components/ui/GradientButton";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { FeedbackSummary } from "../components/feedback/FeedbackSummary";
import { FeedbackStrengthsWeaknesses } from "../components/feedback/FeedbackStrengthsWeaknesses";
import { FeedbackScorecard } from "../components/feedback/FeedbackScorecard";
import { QuestionBreakdown } from "../components/feedback/QuestionBreakdown";
import { disp } from "../constants/theme";

// Phase 3.5 — renders the backend's authoritative final report. No local
// score/feedback is computed here anymore.
const STATUS_LABEL = {
  completed: { text: "Completed", tone: "green" },
  partially_completed: { text: "Ended early", tone: "amber" },
  not_attempted: { text: "Not attempted", tone: "red" },
};

export function FeedbackPage({ session, onBackToDashboard, onHistory }) {
  const report = session.report;
  const cfg = session.config || {};
  const meta = [cfg.type, cfg.difficulty, cfg.duration && `${cfg.duration} min`].filter(Boolean).join(" · ");

  // Report generation failed hard (rare). Show a truthful minimal state —
  // never a fabricated score.
  if (!report) {
    return (
      <div className="p-6 sm:p-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview feedback</h1>
            {meta && <p className="text-sm text-[var(--ink)]/50 mt-1">{meta}</p>}
          </div>
          <GhostButton onClick={onHistory}>View history</GhostButton>
        </div>
        <Card className="p-6 mb-6">
          <p className="text-sm text-[var(--ink)]/70">
            We couldn't generate your report right now. Your interview is saved — try opening it again from History in a
            moment.
          </p>
        </Card>
        <GradientButton onClick={onBackToDashboard} className="px-6 py-3">
          Back to dashboard <ChevronRight size={15} />
        </GradientButton>
      </div>
    );
  }

  const status = STATUS_LABEL[report.completionStatus] || STATUS_LABEL.completed;
  const hasStrengths = (report.strengths || []).length > 0;
  const areas = report.areasToImprove || [];

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview feedback</h1>
            <Badge tone={status.tone}>{status.text}</Badge>
          </div>
          {meta && <p className="text-sm text-[var(--ink)]/50 mt-1">{meta}</p>}
        </div>
        <GhostButton onClick={onHistory}>View history</GhostButton>
      </div>

      <FeedbackSummary report={report} />

      {(hasStrengths || areas.length > 0) && (
        <FeedbackStrengthsWeaknesses
          strengths={
            hasStrengths
              ? report.strengths
              : ["No strengths to highlight yet — there wasn't enough activity in this round to evaluate."]
          }
          weaknesses={areas}
        />
      )}

      <FeedbackScorecard categories={report.categories || []} />

      {(report.questions || []).length > 0 && <QuestionBreakdown questions={report.questions} />}

      <GradientButton onClick={onBackToDashboard} className="px-6 py-3">
        Back to dashboard <ChevronRight size={15} />
      </GradientButton>
    </div>
  );
}
