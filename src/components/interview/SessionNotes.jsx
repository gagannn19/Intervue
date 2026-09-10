import { Card } from "../ui/Card";

export function SessionNotes({ config, answeredCount }) {
  return (
    <Card className="!bg-white/[0.03] !border-white/10 p-4">
      <p className="text-xs font-semibold text-white/60 mb-2">Session notes</p>
      <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
        <li>· {config.type} · {config.difficulty} · {config.duration} min</li>
        <li>· {answeredCount} answers given so far</li>
        {config.company && (
          <li>· Target: {config.company}{config.position ? ` · ${config.position}` : ""}</li>
        )}
        {config.role && <li>· Target role: {config.role}</li>}
      </ul>
    </Card>
  );
}
