import { Badge } from "../../ui/Badge";
import { diffTone } from "../../../utils/difficulty";
import { formatSalaryRange } from "../../../lib/companyTargeting";
import { INTERVIEW_TYPES } from "../../../constants/interviewTypes";
import { disp } from "../../../constants/theme";
import { StepHeading } from "./StepHeading";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[var(--ink)]/8 last:border-0">
      <span className="text-xs font-semibold text-[var(--ink)]/50 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[var(--ink)] text-right">{children}</span>
    </div>
  );
}

// Formatted the same way mapInterview.js formats a saved record, so the
// review screen and the dashboard's "upcoming" card read identically.
function prettyDate(date) {
  if (!date) return "—";
  const d = new Date(`${date}T00:00`);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function prettyTime(time) {
  if (!time) return "—";
  const d = new Date(`1970-01-01T${time}`);
  return Number.isNaN(d.getTime())
    ? time
    : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Step 9. Read-only summary. The user can still use Back to change any
// earlier selection — this component holds no state.
export function ReviewStep({
  interviewTypeIds,
  companyName,
  positionLabel,
  difficulty,
  salaryRange,
  duration,
  date,
  time,
  loading = false,
}) {
  const typeLabels = interviewTypeIds
    .map((id) => INTERVIEW_TYPES.find((t) => t.id === id)?.label || id)
    .join(", ");

  return (
    <div>
      <StepHeading title="Review interview" />

      <div className="rounded-xl border border-[var(--ink)]/10 px-4">
        <Row label="Interview type">{typeLabels || "—"}</Row>
        <Row label="Target company">{companyName || "—"}</Row>
        <Row label="Position">{loading ? "…" : positionLabel || "—"}</Row>
        <Row label="Difficulty">
          {loading ? "…" : <Badge tone={diffTone(difficulty)}>{difficulty}</Badge>}
        </Row>
        <Row label="Estimated salary">
          <span style={disp}>{loading ? "…" : formatSalaryRange(salaryRange)}</span>
        </Row>
        <Row label="Duration">{duration} minutes</Row>
        <Row label="Date">{prettyDate(date)}</Row>
        <Row label="Time">{prettyTime(time)}</Row>
      </div>

      <p className="text-[11px] text-[var(--ink)]/45 mt-2">
        Salary is an estimated reference range, not a guarantee.
      </p>
    </div>
  );
}
