import { ScoreRing } from "../ui/ScoreRing";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function FeedbackSummary({ feedback }) {
  return (
    <Card className="p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
      <ScoreRing score={feedback.overall} size={110} />
      <div className="flex-1">
        <p className="text-sm text-[var(--ink)]/70 leading-relaxed">{feedback.summary}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {feedback.nextTopics.map((t) => <Badge key={t} tone="violet">{t}</Badge>)}
        </div>
      </div>
    </Card>
  );
}
