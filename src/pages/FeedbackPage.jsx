import { generateFeedback } from "../services/aiService";
import { GhostButton } from "../components/ui/GhostButton";
import { GradientButton } from "../components/ui/GradientButton";
import { FeedbackSummary } from "../components/feedback/FeedbackSummary";
import { FeedbackStrengthsWeaknesses } from "../components/feedback/FeedbackStrengthsWeaknesses";
import { FeedbackScorecard } from "../components/feedback/FeedbackScorecard";
import { disp } from "../constants/theme";
import { ChevronRight } from "lucide-react";

export function FeedbackPage({ session, onBackToDashboard, onHistory }) {
  const feedback = generateFeedback(session);

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview feedback</h1>
          <p className="text-sm text-[var(--ink)]/50 mt-1">{session.config.type} · {session.config.difficulty} · {session.config.duration} min</p>
        </div>
        <GhostButton onClick={onHistory}>View history</GhostButton>
      </div>

      <FeedbackSummary feedback={feedback} />
      <FeedbackStrengthsWeaknesses strengths={feedback.strengths} weaknesses={feedback.weaknesses} />
      <FeedbackScorecard categories={feedback.categories} />

      <GradientButton onClick={onBackToDashboard} className="px-6 py-3">
        Back to dashboard <ChevronRight size={15} />
      </GradientButton>
    </div>
  );
}
