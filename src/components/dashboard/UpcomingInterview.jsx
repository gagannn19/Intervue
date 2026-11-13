import { Clock, ChevronRight, Zap, Loader2, AlertCircle, X } from "lucide-react";
import { Card } from "../ui/Card";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";
import { Skeleton } from "../ui/Skeleton";

// Every scheduled interview, soonest first, then missed ones (never
// started, slot already over — still joinable). Each row has its own
// Join button; `onJoin(interview)` starts that one. `joinError`
// ({ id, message }) is shown under the row whose start failed.
export function UpcomingInterview({ scheduled = [], loading, joiningId, joinError, onDismissJoinError, onQuickStart, onJoin }) {
  if (loading) {
    return (
      <Card className="p-5 mb-6 flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    );
  }

  if (scheduled.length === 0) {
    return (
      <Card className="p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold text-sm text-[var(--ink)]">No upcoming interview</p>
          <p className="text-xs text-[var(--ink)]/50 mt-1">Schedule one, or jump straight into a quick-start round.</p>
        </div>
        <GhostButton onClick={onQuickStart}>Quick start <Zap size={14} /></GhostButton>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">
        Scheduled interviews <span className="text-[var(--ink)]/40 font-normal">({scheduled.length})</span>
      </h2>
      <Card className="divide-y divide-[var(--ink)]/5">
        {scheduled.map((iv, i) => (
          <div key={iv.id} className={`p-4 sm:p-5 ${i === 0 && !iv.missed ? "bg-[#FF7A00]/[0.03]" : ""}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
                  iv.missed ? "bg-[var(--ink)]/5 text-[var(--ink)]/40" : "bg-[#FF7A00]/10 text-[#CC5500]"
                }`}
              >
                <Clock size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--ink)]">
                  {iv.type} · {iv.difficulty}
                  {iv.company && <span className="text-[var(--ink)]/50"> · {iv.company}{iv.position ? ` (${iv.position})` : ""}</span>}
                  {iv.missed && (
                    <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--ink)]/5 text-[var(--ink)]/50">
                      Missed
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--ink)]/50 mt-0.5">{iv.date} at {iv.time} · {iv.duration} min</p>
              </div>
            </div>
            {iv.missed ? (
              <GhostButton onClick={() => onJoin(iv)} disabled={!!joiningId}>
                {joiningId === iv.id ? <Loader2 size={14} className="animate-spin" /> : <>Start anyway <ChevronRight size={14} /></>}
              </GhostButton>
            ) : (
              <GradientButton onClick={() => onJoin(iv)} disabled={!!joiningId}>
                {joiningId === iv.id ? <Loader2 size={14} className="animate-spin" /> : <>Join now <ChevronRight size={14} /></>}
              </GradientButton>
            )}
          </div>
          {joinError?.id === iv.id && (
            <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-[#E24468]/25 bg-[#E24468]/[0.06] px-3 py-2.5 text-[13px] text-[#E24468]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p className="flex-1">{joinError.message}</p>
              <button onClick={onDismissJoinError} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )}
          </div>
        ))}
      </Card>
    </div>
  );
}
