import { Card } from "../ui/Card";

const CALL_STATUS_LABEL = {
  connecting: "Connecting…",
  joining: "Joining call…",
  live: "Live",
  ended: "Ended",
  error: "Error",
};

export function SessionNotes({ config, callStatus }) {
  return (
    <Card className="!bg-white/[0.03] !border-white/10 p-4">
      <p className="text-xs font-semibold text-white/60 mb-2">Session notes</p>
      <ul className="text-[11px] text-white/40 space-y-1.5 leading-relaxed">
        <li>· {config.type} · {config.difficulty} · {config.duration} min</li>
        <li>· Call status: {CALL_STATUS_LABEL[callStatus] || callStatus}</li>
        {config.company && (
          <li>· Target: {config.company}{config.position ? ` · ${config.position}` : ""}</li>
        )}
        {config.role && <li>· Target role: {config.role}</li>}
      </ul>
    </Card>
  );
}
