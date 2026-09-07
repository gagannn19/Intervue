import { Card } from "../components/ui/Card";
import { HistoryListItem } from "../components/history/HistoryListItem";
import { disp } from "../constants/theme";

export function HistoryPage({ history, onOpen = () => {} }) {
  return (
    <div className="p-6 sm:p-10 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--ink)]" style={disp}>Interview history</h1>
      <p className="text-sm text-[var(--ink)]/50 mt-1 mb-6">{history.length} interview{history.length !== 1 && "s"} completed</p>
      <Card className="divide-y divide-[var(--ink)]/6">
        {history.length === 0 && <p className="p-6 text-sm text-[var(--ink)]/45">No interviews yet.</p>}
        {history.map((h) => (
          <HistoryListItem key={h.id} interview={h} onOpen={onOpen} />
        ))}
      </Card>
    </div>
  );
}
